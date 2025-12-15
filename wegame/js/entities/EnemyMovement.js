/**
 * 敌人移动逻辑
 */

import { GameConfig } from '../config/GameConfig';
import { EnemyTankConfig } from '../config/enemies/EnemyTankConfig';

export class EnemyMovement {
  /**
   * 检查两个敌人是否碰撞
   */
  static checkCollision(enemy1, enemy2) {
    if (enemy1 === enemy2 || !enemy1 || !enemy2 || enemy1.destroyed || enemy2.destroyed) {
      return false;
    }
    
    const dx = enemy1.x - enemy2.x;
    const dy = enemy1.y - enemy2.y;
    const distanceSq = dx * dx + dy * dy;
    
    // 碰撞半径：两个敌人的半径之和，增加一点缓冲避免过于紧密
    const radius1 = (enemy1.size || EnemyTankConfig.SIZE) / 2;
    const radius2 = (enemy2.size || EnemyTankConfig.SIZE) / 2;
    const buffer = 2; // 增加2像素的缓冲
    const minDistanceSq = (radius1 + radius2 + buffer) * (radius1 + radius2 + buffer);
    
    return distanceSq < minDistanceSq;
  }
  
  /**
   * 计算推开力（用于分离聚集的敌人）
   */
  static calculateSeparationForce(enemy, allEnemies) {
    let forceX = 0;
    let forceY = 0;
    let neighborCount = 0;
    
    const radius = (enemy.size || EnemyTankConfig.SIZE) / 2;
    const separationRadius = radius * 3; // 分离半径
    const separationRadiusSq = separationRadius * separationRadius;
    
    for (const other of allEnemies) {
      if (other === enemy || other.destroyed) continue;
      
      const dx = enemy.x - other.x;
      const dy = enemy.y - other.y;
      const distanceSq = dx * dx + dy * dy;
      
      if (distanceSq < separationRadiusSq && distanceSq > 0) {
        const distance = Math.sqrt(distanceSq);
        const normalizedX = dx / distance;
        const normalizedY = dy / distance;
        
        // 距离越近，推开力越大
        const strength = (separationRadius - distance) / separationRadius;
        forceX += normalizedX * strength;
        forceY += normalizedY * strength;
        neighborCount++;
      }
    }
    
    if (neighborCount > 0) {
      forceX /= neighborCount;
      forceY /= neighborCount;
    }
    
    return { forceX, forceY };
  }
  
  /**
   * 检查移动后是否会与其他敌人碰撞
   */
  static wouldCollide(enemy, newX, newY, allEnemies) {
    if (!allEnemies || allEnemies.length === 0) {
      return false;
    }
    
    // 创建临时对象来检查碰撞，不修改原敌人位置
    const tempEnemy = {
      x: newX,
      y: newY,
      size: enemy.size || EnemyTankConfig.SIZE,
      destroyed: false
    };
    
    // 检查是否与其他敌人碰撞
    for (const other of allEnemies) {
      if (other === enemy) continue; // 跳过自己
      if (this.checkCollision(tempEnemy, other)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * 简单的格子移动（带碰撞检测和障碍物检测）
   * @param {boolean} canFlyOverObstacles - 是否可以飞过障碍物（飞行敌人）
   */
  static moveInGrid(enemy, deltaTime, allEnemies = [], obstacleManager = null, canFlyOverObstacles = false) {
    // 初始化移动状态（用于检测是否长时间卡住）
    if (!enemy._moveState) {
      enemy._moveState = {
        stuckTime: 0,
        lastPosition: { x: enemy.x, y: enemy.y },
        stuckThreshold: 1000, // 1秒无法移动视为卡住
        retryDirection: 0 // 重试方向：0=默认，1=上，2=下，3=左
      };
    }
    
    const moveState = enemy._moveState;
    const currentPos = { x: enemy.x, y: enemy.y };
    
    // 检查是否卡住（位置没有变化）
    const dxFromLast = currentPos.x - moveState.lastPosition.x;
    const dyFromLast = currentPos.y - moveState.lastPosition.y;
    const movedDistanceSq = dxFromLast * dxFromLast + dyFromLast * dyFromLast;
    
    if (movedDistanceSq < 1) {
      // 几乎没有移动
      moveState.stuckTime += deltaTime * 1000; // 转换为毫秒
    } else {
      // 有移动，重置卡住时间
      moveState.stuckTime = 0;
      moveState.lastPosition = { x: currentPos.x, y: currentPos.y };
    }
    const targetWorldX = enemy.gridX * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    const targetWorldY = enemy.gridY * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    
    const dx = targetWorldX - enemy.x;
    const dy = targetWorldY - enemy.y;
    const distanceSq = dx * dx + dy * dy;
    const thresholdSq = 5 * 5; // 使用距离平方避免 sqrt
    
    if (distanceSq < thresholdSq) {
      // 到达目标格子，检查下一个格子是否有障碍物
      const nextGridX = enemy.gridX + 1;
      
      if (nextGridX >= GameConfig.BATTLE_COLS) {
        // 已经到达边界，标记为完成
        enemy.finished = true;
        return;
      }
      
      // 检查下一个格子是否有障碍物（飞行敌人可以飞过）
      if (obstacleManager && !canFlyOverObstacles && obstacleManager.hasObstacle(nextGridX, enemy.gridY)) {
        // 有障碍物，尝试寻找出路（向上或向下绕过）
        const currentRow = enemy.gridY;
        const battleStartRow = GameConfig.BATTLE_START_ROW;
        const battleEndRow = GameConfig.BATTLE_END_ROW - 1; // 不包括UI区域
        
        // 尝试向上移动
        let foundPath = false;
        if (currentRow > battleStartRow) {
          const upRow = currentRow - 1;
          // 检查上方格子是否有障碍物，以及下一个格子（向右）是否有障碍物（飞行敌人可以飞过）
          if ((canFlyOverObstacles || !obstacleManager.hasObstacle(enemy.gridX, upRow)) && 
              (canFlyOverObstacles || !obstacleManager.hasObstacle(nextGridX, upRow))) {
            // 可以向上绕过
            enemy.gridY = upRow;
            enemy.gridX = nextGridX;
            foundPath = true;
          }
        }
        
        // 如果向上不行，尝试向下移动
        if (!foundPath && currentRow < battleEndRow) {
          const downRow = currentRow + 1;
          // 检查下方格子是否有障碍物，以及下一个格子（向右）是否有障碍物（飞行敌人可以飞过）
          if ((canFlyOverObstacles || !obstacleManager.hasObstacle(enemy.gridX, downRow)) && 
              (canFlyOverObstacles || !obstacleManager.hasObstacle(nextGridX, downRow))) {
            // 可以向下绕过
            enemy.gridY = downRow;
            enemy.gridX = nextGridX;
            foundPath = true;
          }
        }
        
        // 如果找不到出路，尝试更智能的绕行策略
        if (!foundPath) {
          // 尝试多个方向：上、下、左上、右上、左下、右下
          const directions = [
            { dx: 0, dy: -1 },   // 上
            { dx: 0, dy: 1 },    // 下
            { dx: -1, dy: -1 },  // 左上
            { dx: -1, dy: 1 },   // 左下
            { dx: 1, dy: -1 },   // 右上（但X不能超过nextGridX）
            { dx: 1, dy: 1 }     // 右下（但X不能超过nextGridX）
          ];
          
          for (const dir of directions) {
            const tryGridX = enemy.gridX + dir.dx;
            const tryGridY = currentRow + dir.dy;
            
            // 检查边界
            if (tryGridX < 0 || tryGridX >= GameConfig.BATTLE_COLS) continue;
            if (tryGridY < battleStartRow || tryGridY > battleEndRow) continue;
            
            // 检查是否有障碍物
            if (!canFlyOverObstacles && obstacleManager) {
              if (obstacleManager.hasObstacle(tryGridX, tryGridY)) continue;
              // 如果尝试向右移动，还要检查下一个格子
              if (dir.dx >= 0 && obstacleManager.hasObstacle(tryGridX + 1, tryGridY)) continue;
            }
            
            // 找到可行路径
            enemy.gridX = tryGridX;
            enemy.gridY = tryGridY;
            foundPath = true;
            break;
          }
          
          // 如果仍然找不到路径，尝试先向上或向下移动，等待下一帧再继续
          if (!foundPath) {
            // 优先尝试向上
            if (currentRow > battleStartRow) {
              const upRow = currentRow - 1;
              if (canFlyOverObstacles || !obstacleManager.hasObstacle(enemy.gridX, upRow)) {
                enemy.gridY = upRow;
                return; // 先移动到上方，下一帧再继续
              }
            }
            // 如果向上不行，尝试向下
            if (currentRow < battleEndRow) {
              const downRow = currentRow + 1;
              if (canFlyOverObstacles || !obstacleManager.hasObstacle(enemy.gridX, downRow)) {
                enemy.gridY = downRow;
                return; // 先移动到下方，下一帧再继续
              }
            }
            // 如果上下都有障碍物，尝试后退（左移）来寻找新路径
            if (enemy.gridX > 0) {
              enemy.gridX = enemy.gridX - 1;
              return; // 后退一格，下一帧再尝试前进
            }
            // 如果所有方向都不可行，暂时停止（等待障碍物被清除或其他敌人移动）
            return;
          }
        }
      } else {
        // 没有障碍物，移动到下一个格子
        enemy.gridX = nextGridX;
      }
    }
    
    // 平滑移动（使用距离平方优化）
    const moveDistance = enemy.moveSpeed * deltaTime;
    const minDistanceSq = 0.1 * 0.1;
    if (distanceSq > minDistanceSq) {
      const distanceToTarget = Math.sqrt(distanceSq); // 只在需要时计算
      const dirX = dx / distanceToTarget;
      const dirY = dy / distanceToTarget;
      const actualMove = Math.min(moveDistance, distanceToTarget);
      
      // 计算新位置
      const newX = enemy.x + dirX * actualMove;
      const newY = enemy.y + dirY * actualMove;
      
      // 检查新位置是否在障碍物格子上
      const newCol = Math.floor(newX / GameConfig.CELL_SIZE);
      const newRow = Math.floor(newY / GameConfig.CELL_SIZE);
      if (obstacleManager && !canFlyOverObstacles && obstacleManager.hasObstacle(newCol, newRow)) {
        // 新位置在障碍物格子上，不能移动
        // 如果是在向右移动时遇到障碍物，允许Y方向移动（绕过障碍物）
        const currentCol = Math.floor(enemy.x / GameConfig.CELL_SIZE);
        if (newCol > currentCol) {
          // 试图向右移动进入障碍物格子
          // 允许Y方向移动，尝试绕过障碍物
          // 限制X方向移动，确保不进入障碍物格子
          const currentCellRight = (currentCol + 1) * GameConfig.CELL_SIZE;
          const maxX = currentCellRight - (enemy.size || GameConfig.ENEMY_SIZE) / 2 - 1;
          enemy.x = Math.min(enemy.x + dirX * actualMove, maxX);
          // Y方向可以移动，帮助绕过障碍物
          enemy.y = newY;
        } else {
          // 其他方向遇到障碍物，不允许移动
          return;
        }
        return; // X方向不能继续前进，但Y方向可以移动
      }
      
      // 计算分离力（避免敌人聚集）
      const separation = this.calculateSeparationForce(enemy, allEnemies);
      const separationStrength = 0.3; // 分离力强度
      
      // 应用分离力到移动方向
      let finalDirX = dirX;
      let finalDirY = dirY;
      if (separation.forceX !== 0 || separation.forceY !== 0) {
        // 混合主移动方向和分离方向
        finalDirX = dirX * 0.7 + separation.forceX * separationStrength;
        finalDirY = dirY * 0.7 + separation.forceY * separationStrength;
        
        // 归一化方向
        const finalDirLength = Math.sqrt(finalDirX * finalDirX + finalDirY * finalDirY);
        if (finalDirLength > 0) {
          finalDirX /= finalDirLength;
          finalDirY /= finalDirLength;
        }
      }
      
      // 计算最终新位置
      const finalNewX = enemy.x + finalDirX * actualMove;
      const finalNewY = enemy.y + finalDirY * actualMove;
      
      // 检查是否会与其他敌人碰撞
      if (!this.wouldCollide(enemy, finalNewX, finalNewY, allEnemies)) {
        // 没有碰撞，可以移动
        enemy.x = finalNewX;
        enemy.y = finalNewY;
      } else {
        // 有碰撞，尝试多种策略
        
        // 策略1：尝试只移动一小部分距离
        let moved = false;
        for (let factor = 0.5; factor >= 0.1; factor -= 0.1) {
          const smallMove = actualMove * factor;
          const smallNewX = enemy.x + finalDirX * smallMove;
          const smallNewY = enemy.y + finalDirY * smallMove;
          
          // 检查小移动是否在障碍物格子上
          const smallNewCol = Math.floor(smallNewX / GameConfig.CELL_SIZE);
          const smallNewRow = Math.floor(smallNewY / GameConfig.CELL_SIZE);
          if (obstacleManager && !canFlyOverObstacles && obstacleManager.hasObstacle(smallNewCol, smallNewRow)) {
            continue; // 跳过这个移动
          }
          
          if (!this.wouldCollide(enemy, smallNewX, smallNewY, allEnemies)) {
            enemy.x = smallNewX;
            enemy.y = smallNewY;
            moved = true;
            break;
          }
        }
        
        // 策略2：如果仍然无法移动，尝试垂直方向移动（推开）
        if (!moved && moveState.stuckTime > 200) {
          // 尝试向上或向下移动来推开其他敌人
          const pushDistance = actualMove * 0.3;
          const directions = [
            { x: 0, y: -pushDistance }, // 上
            { x: 0, y: pushDistance },  // 下
            { x: -pushDistance, y: 0 }  // 左（后退）
          ];
          
          for (const dir of directions) {
            const pushX = enemy.x + dir.x;
            const pushY = enemy.y + dir.y;
            
            // 检查是否在障碍物格子上
            const pushCol = Math.floor(pushX / GameConfig.CELL_SIZE);
            const pushRow = Math.floor(pushY / GameConfig.CELL_SIZE);
            if (obstacleManager && !canFlyOverObstacles && obstacleManager.hasObstacle(pushCol, pushRow)) {
              continue;
            }
            
            if (!this.wouldCollide(enemy, pushX, pushY, allEnemies)) {
              enemy.x = pushX;
              enemy.y = pushY;
              moved = true;
              break;
            }
          }
        }
        
        // 策略3：如果长时间卡住，尝试绕过（改变目标格子）
        if (!moved && moveState.stuckTime > moveState.stuckThreshold) {
          // 尝试改变目标格子来绕过障碍
          const currentRow = enemy.gridY;
          const battleStartRow = GameConfig.BATTLE_START_ROW;
          const battleEndRow = GameConfig.BATTLE_END_ROW - 1;
          
          // 根据重试方向尝试不同的路径
          let foundAlternatePath = false;
          if (moveState.retryDirection === 0 && currentRow > battleStartRow) {
            // 尝试向上
            const upRow = currentRow - 1;
            if (canFlyOverObstacles || !obstacleManager || !obstacleManager.hasObstacle(enemy.gridX, upRow)) {
              enemy.gridY = upRow;
              moveState.retryDirection = 1;
              foundAlternatePath = true;
            }
          } else if (moveState.retryDirection <= 1 && currentRow < battleEndRow) {
            // 尝试向下
            const downRow = currentRow + 1;
            if (canFlyOverObstacles || !obstacleManager || !obstacleManager.hasObstacle(enemy.gridX, downRow)) {
              enemy.gridY = downRow;
              moveState.retryDirection = 2;
              foundAlternatePath = true;
            }
          } else if (moveState.retryDirection <= 2 && enemy.gridX > 0) {
            // 尝试后退（左移）
            enemy.gridX = Math.max(0, enemy.gridX - 1);
            moveState.retryDirection = 3;
            foundAlternatePath = true;
          }
          
          if (foundAlternatePath) {
            moveState.stuckTime = 0; // 重置卡住时间
          } else {
            // 所有方向都尝试过了，重置重试方向
            moveState.retryDirection = 0;
          }
        }
      }
    }
  }
  
  /**
   * 检查是否到达终点
   * 敌人移动到最右边后，从战场移除
   */
  static checkFinished(enemy) {
    // 检查敌人的右边界是否超过战场宽度
    // 敌人的 x 坐标是中心点，需要加上半径
    const enemyRightEdge = enemy.x + (enemy.size || GameConfig.ENEMY_SIZE) / 2;
    if (enemyRightEdge >= GameConfig.BATTLE_WIDTH) {
      enemy.finished = true;
    }
    
    // 或者检查格子坐标是否超出边界
    if (enemy.gridX >= GameConfig.BATTLE_COLS) {
      enemy.finished = true;
    }
  }
}

