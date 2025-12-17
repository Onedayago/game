/**
 * 敌人路径移动逻辑
 */

import { GameConfig } from '../../../config/GameConfig';
import { EnemyTankConfig } from '../../../config/enemies/EnemyTankConfig';
import { AStarPathfinder } from '../../../pathfinding/AStarPathfinder';
import { EnemyCollision } from '../../../entities/enemies/collision/EnemyCollision';

export class EnemyPathMovement {
  /**
   * 使用 A* 算法的格子移动（带碰撞检测和障碍物检测）
   * @param {boolean} canFlyOverObstacles - 是否可以飞过障碍物（飞行敌人）
   */
  static moveInGrid(enemy, deltaTime, allEnemies = [], obstacleManager = null, canFlyOverObstacles = false) {
    // 初始化移动状态（用于检测是否长时间卡住）
    if (!enemy._moveState) {
      enemy._moveState = {
        stuckTime: 0,
        lastPosition: { x: enemy.x, y: enemy.y },
        stuckThreshold: 1000, // 1秒无法移动视为卡住
        path: [], // A* 计算的路径
        pathIndex: 0, // 当前路径索引
        pathUpdateTimer: 0, // 路径更新计时器
        pathUpdateInterval: 500, // 每500ms更新一次路径
        retryDirection: 0, // 重试方向：0=默认，1=上，2=下，3=左
        noPathCount: 0 // 连续无路径次数
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
    
    // 更新路径（定期重新计算，或路径为空时）
    moveState.pathUpdateTimer += deltaTime * 1000;
    const needsPathUpdate = moveState.path.length === 0 || 
                           moveState.pathIndex >= moveState.path.length ||
                           moveState.pathUpdateTimer >= moveState.pathUpdateInterval ||
                           moveState.stuckTime > 200; // 卡住时立即重新计算路径
    
    if (needsPathUpdate) {
      this.updatePath(enemy, moveState, obstacleManager, canFlyOverObstacles);
      if (enemy.finished) return;
    }
    
    // 如果没有路径，尝试重新计算路径
    if (moveState.path.length === 0 || moveState.pathIndex >= moveState.path.length) {
      // 检查是否到达边界
      if (enemy.gridX >= GameConfig.BATTLE_COLS - 1) {
        enemy.finished = true;
        return;
      }
      
      // 如果未到达边界但没有路径，强制重新计算路径
      // 如果长时间卡住，增加卡住时间以触发绕过逻辑
      if (moveState.stuckTime < 100) {
        moveState.stuckTime = 100; // 触发立即重新计算路径
      }
      
      // 立即重新计算路径
      this.updatePath(enemy, moveState, obstacleManager, canFlyOverObstacles);
      if (enemy.finished) return;
      
      // 如果仍然没有路径，增加无路径计数
      if (moveState.path.length === 0) {
        moveState.noPathCount++;
        // 如果连续多次无路径，尝试强制移动
        if (moveState.noPathCount > 10) {
          // 尝试直接向右移动（即使可能有障碍物）
          if (enemy.gridX < GameConfig.BATTLE_COLS - 1) {
            moveState.path = [{ x: enemy.gridX + 1, y: enemy.gridY }];
            moveState.pathIndex = 0;
            moveState.pathUpdateTimer = 0;
            moveState.noPathCount = 0;
          }
        }
        return;
      } else {
        // 有路径了，重置无路径计数
        moveState.noPathCount = 0;
      }
    }
    
    // 执行移动
    this.executeMovement(enemy, moveState, deltaTime, allEnemies, obstacleManager, canFlyOverObstacles);
  }
  
  /**
   * 更新路径
   */
  static updatePath(enemy, moveState, obstacleManager, canFlyOverObstacles) {
    // 使用 A* 算法计算路径（如果有障碍物管理器）
    if (obstacleManager) {
      const startX = enemy.gridX;
      const startY = enemy.gridY;
      const endX = GameConfig.BATTLE_COLS - 1; // 目标：最右边
      
      const path = AStarPathfinder.findPath(
        startX, 
        startY, 
        endX, 
        undefined, // endY 未指定，使用水平移动
        obstacleManager, 
        canFlyOverObstacles
      );
      
      if (path.length > 0) {
        // 如果路径的第一个节点是当前位置，移除它
        if (path.length > 0 && path[0].x === startX && path[0].y === startY) {
          path.shift();
        }
        // 如果路径还有节点，使用它
        if (path.length > 0) {
          moveState.path = path;
          moveState.pathIndex = 0;
          moveState.pathUpdateTimer = 0;
        } else {
          // 路径只有起点，说明已经到达终点
          enemy.finished = true;
        }
      } else {
        // 没有找到路径，尝试简单的前进
        if (enemy.gridX < GameConfig.BATTLE_COLS - 1) {
          // 检查下一个格子是否有障碍物
          const nextX = enemy.gridX + 1;
          const nextY = enemy.gridY;
          const hasObstacle = obstacleManager && !canFlyOverObstacles && obstacleManager.hasObstacle(nextX, nextY);
          
          if (!hasObstacle) {
            // 下一个格子没有障碍物，可以前进
            moveState.path = [{ x: nextX, y: nextY }];
            moveState.pathIndex = 0;
            moveState.pathUpdateTimer = 0;
          } else {
            // 下一个格子有障碍物，尝试上下移动绕过
            const battleStartRow = GameConfig.BATTLE_START_ROW;
            const battleEndRow = GameConfig.BATTLE_END_ROW - 1;
            let foundAlternate = false;
            
            // 尝试向上
            if (nextY > battleStartRow) {
              const upY = nextY - 1;
              if (!obstacleManager || canFlyOverObstacles || !obstacleManager.hasObstacle(nextX, upY)) {
                moveState.path = [{ x: nextX, y: upY }];
                moveState.pathIndex = 0;
                moveState.pathUpdateTimer = 0;
                foundAlternate = true;
              }
            }
            
            // 如果向上不行，尝试向下
            if (!foundAlternate && nextY < battleEndRow) {
              const downY = nextY + 1;
              if (!obstacleManager || canFlyOverObstacles || !obstacleManager.hasObstacle(nextX, downY)) {
                moveState.path = [{ x: nextX, y: downY }];
                moveState.pathIndex = 0;
                moveState.pathUpdateTimer = 0;
                foundAlternate = true;
              }
            }
            
            // 如果上下都不行，尝试先向上或向下移动，然后再向右
            if (!foundAlternate) {
              // 尝试先向上移动
              if (enemy.gridY > battleStartRow) {
                const upY = enemy.gridY - 1;
                if (!obstacleManager || canFlyOverObstacles || !obstacleManager.hasObstacle(enemy.gridX, upY)) {
                  moveState.path = [
                    { x: enemy.gridX, y: upY },
                    { x: nextX, y: upY }
                  ];
                  moveState.pathIndex = 0;
                  moveState.pathUpdateTimer = 0;
                  foundAlternate = true;
                }
              }
              
              // 如果向上不行，尝试向下
              if (!foundAlternate && enemy.gridY < battleEndRow) {
                const downY = enemy.gridY + 1;
                if (!obstacleManager || canFlyOverObstacles || !obstacleManager.hasObstacle(enemy.gridX, downY)) {
                  moveState.path = [
                    { x: enemy.gridX, y: downY },
                    { x: nextX, y: downY }
                  ];
                  moveState.pathIndex = 0;
                  moveState.pathUpdateTimer = 0;
                  foundAlternate = true;
                }
              }
            }
            
            // 如果所有方向都不行，标记为卡住，等待下一帧处理
            if (!foundAlternate) {
              moveState.path = [];
              moveState.pathIndex = 0;
              moveState.pathUpdateTimer = 0;
              // 增加卡住时间，触发绕过逻辑
              moveState.stuckTime = Math.max(moveState.stuckTime, 300);
            }
          }
        } else {
          // 已经到达边界
          enemy.finished = true;
        }
      }
    } else {
      // 没有障碍物管理器，使用简单的直线前进
      if (enemy.gridX < GameConfig.BATTLE_COLS - 1) {
        moveState.path = [{ x: enemy.gridX + 1, y: enemy.gridY }];
        moveState.pathIndex = 0;
        moveState.pathUpdateTimer = 0;
      } else {
        // 已经到达边界
        enemy.finished = true;
      }
    }
  }
  
  /**
   * 执行移动
   */
  static executeMovement(enemy, moveState, deltaTime, allEnemies, obstacleManager, canFlyOverObstacles) {
    // 获取当前目标格子
    const targetNode = moveState.path[moveState.pathIndex];
    if (!targetNode) {
      // 目标节点不存在，重新计算路径
      moveState.path = [];
      moveState.pathIndex = 0;
      moveState.pathUpdateTimer = moveState.pathUpdateInterval;
      return;
    }
    
    const targetWorldX = targetNode.x * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    const targetWorldY = targetNode.y * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    
    let dx = targetWorldX - enemy.x;
    let dy = targetWorldY - enemy.y;
    let distanceSq = dx * dx + dy * dy;
    const thresholdSq = 5 * 5; // 使用距离平方避免 sqrt
    
    // 如果到达目标格子，移动到路径的下一个节点
    if (distanceSq < thresholdSq) {
      moveState.pathIndex++;
      
      // 更新敌人的格子坐标
      enemy.gridX = targetNode.x;
      enemy.gridY = targetNode.y;
      
      // 如果路径走完，重新计算路径
      if (moveState.pathIndex >= moveState.path.length) {
        moveState.path = [];
        moveState.pathIndex = 0;
        moveState.pathUpdateTimer = moveState.pathUpdateInterval; // 触发重新计算
        return; // 等待下一帧重新计算路径
      }
      
      // 更新目标节点为下一个节点，继续移动
      const nextTargetNode = moveState.path[moveState.pathIndex];
      if (!nextTargetNode) {
        return;
      }
      const nextTargetWorldX = nextTargetNode.x * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
      const nextTargetWorldY = nextTargetNode.y * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
      const nextDx = nextTargetWorldX - enemy.x;
      const nextDy = nextTargetWorldY - enemy.y;
      const nextDistanceSq = nextDx * nextDx + nextDy * nextDy;
      
      // 使用新的目标节点继续移动
      dx = nextDx;
      dy = nextDy;
      distanceSq = nextDistanceSq;
    }
    
    // 平滑移动（使用距离平方优化，严格禁止斜向移动）
    const moveDistance = enemy.moveSpeed * deltaTime;
    const minDistanceSq = 0.1 * 0.1;
    if (distanceSq > minDistanceSq) {
      const distanceToTarget = Math.sqrt(distanceSq); // 只在需要时计算
      this.moveTowardsTarget(enemy, dx, dy, distanceSq, distanceToTarget, moveDistance, moveState, allEnemies, obstacleManager, canFlyOverObstacles);
    }
  }
  
  /**
   * 向目标移动
   */
  static moveTowardsTarget(enemy, dx, dy, distanceSq, distanceToTarget, moveDistance, moveState, allEnemies, obstacleManager, canFlyOverObstacles) {
    const actualMove = Math.min(moveDistance, distanceToTarget);
    
    // 严格禁止斜向移动：只能水平或垂直移动，不能同时移动两个方向
    let dirX = 0;
    let dirY = 0;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    
    // 优先X方向（向右移动），只有当X方向已到达目标时才允许Y方向移动
    const xThreshold = 0.5; // X方向到达目标的阈值
    const yThreshold = 0.5; // Y方向到达目标的阈值
    
    if (absDx > xThreshold) {
      // X方向未到达目标，只移动X方向
      dirX = dx > 0 ? 1 : -1;
      dirY = 0;
    } else if (absDy > yThreshold) {
      // X方向已到达目标，允许Y方向移动
      dirX = 0;
      dirY = dy > 0 ? 1 : -1;
    } else {
      // 两个方向都已接近目标，优先完成X方向
      if (absDx > 0.1) {
        dirX = dx > 0 ? 1 : -1;
        dirY = 0;
      } else if (absDy > 0.1) {
        dirX = 0;
        dirY = dy > 0 ? 1 : -1;
      } else {
        // 两个方向都已到达，不需要移动
        dirX = 0;
        dirY = 0;
      }
    }
    
    // 计算新位置（只移动一个方向）
    const newX = enemy.x + dirX * actualMove;
    const newY = enemy.y + dirY * actualMove;
    
    // 检查新位置是否在障碍物格子上（严格禁止斜向移动）
    const newCol = Math.floor(newX / GameConfig.CELL_SIZE);
    const newRow = Math.floor(newY / GameConfig.CELL_SIZE);
    if (obstacleManager && !canFlyOverObstacles && obstacleManager.hasObstacle(newCol, newRow)) {
      // 新位置在障碍物格子上，不能移动
      // 如果是在向右移动时遇到障碍物，需要先停止X方向移动，下一帧再尝试Y方向绕过
      const currentCol = Math.floor(enemy.x / GameConfig.CELL_SIZE);
      if (newCol > currentCol && dirX > 0) {
        // 试图向右移动进入障碍物格子
        // 限制X方向移动，确保不进入障碍物格子
        const currentCellRight = (currentCol + 1) * GameConfig.CELL_SIZE;
        const maxX = currentCellRight - (enemy.size || EnemyTankConfig.SIZE) / 2 - 1;
        enemy.x = Math.min(enemy.x, maxX);
        // 不移动Y方向，等待下一帧路径查找逻辑处理绕行
      }
      return; // X方向不能继续前进，等待下一帧处理
    }
    
    // 允许敌人互相穿过，直接移动，不计算分离力
    // 计算最终新位置
    const finalNewX = enemy.x + dirX * actualMove;
    const finalNewY = enemy.y + dirY * actualMove;
    
    // 直接移动，不检查与其他敌人的碰撞
    enemy.x = finalNewX;
    enemy.y = finalNewY;
  }
  
  /**
   * 处理碰撞（已废弃：敌人现在可以互相穿过）
   * 保留此方法以防将来需要，但不再使用碰撞检测
   */
  static handleCollision(enemy, dirX, dirY, actualMove, moveState, allEnemies, obstacleManager, canFlyOverObstacles) {
    // 敌人现在可以互相穿过，此方法不再需要
    // 如果长时间卡住，尝试绕过障碍物（改变目标格子）
    if (moveState.stuckTime > moveState.stuckThreshold) {
      const currentRow = enemy.gridY;
      const battleStartRow = GameConfig.BATTLE_START_ROW;
      const battleEndRow = GameConfig.BATTLE_END_ROW - 1;
      
      let foundAlternatePath = false;
      if (moveState.retryDirection === 0 && currentRow > battleStartRow) {
        const upRow = currentRow - 1;
        if (canFlyOverObstacles || !obstacleManager || !obstacleManager.hasObstacle(enemy.gridX, upRow)) {
          enemy.gridY = upRow;
          moveState.retryDirection = 1;
          foundAlternatePath = true;
        }
      } else if (moveState.retryDirection <= 1 && currentRow < battleEndRow) {
        const downRow = currentRow + 1;
        if (canFlyOverObstacles || !obstacleManager || !obstacleManager.hasObstacle(enemy.gridX, downRow)) {
          enemy.gridY = downRow;
          moveState.retryDirection = 2;
          foundAlternatePath = true;
        }
      } else if (moveState.retryDirection <= 2 && enemy.gridX > 0) {
        enemy.gridX = Math.max(0, enemy.gridX - 1);
        moveState.retryDirection = 3;
        foundAlternatePath = true;
      }
      
      if (foundAlternatePath) {
        moveState.stuckTime = 0;
        moveState.path = [];
        moveState.pathIndex = 0;
        moveState.pathUpdateTimer = moveState.pathUpdateInterval;
      } else {
        moveState.retryDirection = 0;
      }
    }
  }
}

