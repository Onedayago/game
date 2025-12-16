/**
 * 敌人路径移动逻辑
 */

import { GameConfig } from '../../config/GameConfig';
import { EnemyTankConfig } from '../../config/enemies/EnemyTankConfig';
import { AStarPathfinder } from '../../pathfinding/AStarPathfinder';
import { EnemyCollision } from '../collision/EnemyCollision';

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
    
    // 如果没有路径，直接返回
    if (moveState.path.length === 0 || moveState.pathIndex >= moveState.path.length) {
      // 检查是否到达边界
      if (enemy.gridX >= GameConfig.BATTLE_COLS - 1) {
        enemy.finished = true;
      }
      return;
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
          moveState.path = [{ x: enemy.gridX + 1, y: enemy.gridY }];
          moveState.pathIndex = 0;
          moveState.pathUpdateTimer = 0;
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
    
    // 计算分离力（避免敌人聚集，但不允许斜向移动）
    const separation = EnemyCollision.calculateSeparationForce(enemy, allEnemies);
    
    // 应用分离力到移动方向（严格禁止斜向移动）
    let finalDirX = dirX;
    let finalDirY = dirY;
    
    // 分离力只在当前移动方向完成后才考虑，且不能导致斜向移动
    if (separation.forceX !== 0 || separation.forceY !== 0) {
      // 如果当前移动方向是X方向，完全忽略分离力（保持X方向移动）
      if (dirX !== 0 && dirY === 0) {
        // X方向移动时，不应用任何分离力，保持纯X方向移动
        finalDirX = dirX;
        finalDirY = 0;
      }
      // 如果当前移动方向是Y方向，完全忽略分离力（保持Y方向移动）
      else if (dirX === 0 && dirY !== 0) {
        // Y方向移动时，不应用任何分离力，保持纯Y方向移动
        finalDirX = 0;
        finalDirY = dirY;
      }
      // 如果两个方向都为0（已到达目标），可以考虑应用分离力，但只能选择一个方向
      else if (dirX === 0 && dirY === 0) {
        // 已到达目标格子，可以考虑分离力，但只能选择一个方向（优先Y方向，因为通常需要上下避让）
        const absSepX = Math.abs(separation.forceX);
        const absSepY = Math.abs(separation.forceY);
        if (absSepY > absSepX && absSepY > 0.3) {
          finalDirY = separation.forceY > 0 ? 1 : -1;
          finalDirX = 0;
        } else if (absSepX > 0.3) {
          finalDirX = separation.forceX > 0 ? 1 : -1;
          finalDirY = 0;
        }
      }
    }
    
    // 严格确保最终方向只有一个方向（禁止斜向移动）
    if (finalDirX !== 0 && finalDirY !== 0) {
      // 如果两个方向都有值，优先X方向（向右移动）
      finalDirY = 0;
    }
    
    // 计算最终新位置
    const finalNewX = enemy.x + finalDirX * actualMove;
    const finalNewY = enemy.y + finalDirY * actualMove;
    
    // 检查是否会与其他敌人碰撞
    if (!EnemyCollision.wouldCollide(enemy, finalNewX, finalNewY, allEnemies)) {
      // 没有碰撞，可以移动
      enemy.x = finalNewX;
      enemy.y = finalNewY;
    } else {
      // 有碰撞，尝试多种策略
      this.handleCollision(enemy, finalDirX, finalDirY, actualMove, moveState, allEnemies, obstacleManager, canFlyOverObstacles);
    }
  }
  
  /**
   * 处理碰撞
   */
  static handleCollision(enemy, dirX, dirY, actualMove, moveState, allEnemies, obstacleManager, canFlyOverObstacles) {
    // 策略1：尝试只移动一小部分距离
    let moved = false;
    for (let factor = 0.5; factor >= 0.1; factor -= 0.1) {
      const smallMove = actualMove * factor;
      const smallNewX = enemy.x + dirX * smallMove;
      const smallNewY = enemy.y + dirY * smallMove;
      
      // 检查小移动是否在障碍物格子上
      const smallNewCol = Math.floor(smallNewX / GameConfig.CELL_SIZE);
      const smallNewRow = Math.floor(smallNewY / GameConfig.CELL_SIZE);
      if (obstacleManager && !canFlyOverObstacles && obstacleManager.hasObstacle(smallNewCol, smallNewRow)) {
        continue; // 跳过这个移动
      }
      
      if (!EnemyCollision.wouldCollide(enemy, smallNewX, smallNewY, allEnemies)) {
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
        
        if (!EnemyCollision.wouldCollide(enemy, pushX, pushY, allEnemies)) {
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
        // 重新计算路径
        moveState.path = [];
        moveState.pathIndex = 0;
        moveState.pathUpdateTimer = moveState.pathUpdateInterval;
      } else {
        // 所有方向都尝试过了，重置重试方向
        moveState.retryDirection = 0;
      }
    }
  }
}

