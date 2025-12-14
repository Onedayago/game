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
    
    // 碰撞半径：两个敌人的半径之和
    const radius1 = (enemy1.size || EnemyTankConfig.SIZE) / 2;
    const radius2 = (enemy2.size || EnemyTankConfig.SIZE) / 2;
    const minDistanceSq = (radius1 + radius2) * (radius1 + radius2);
    
    return distanceSq < minDistanceSq;
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
   */
  static moveInGrid(enemy, deltaTime, allEnemies = [], obstacleManager = null) {
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
      
      // 检查下一个格子是否有障碍物
      if (obstacleManager && obstacleManager.hasObstacle(nextGridX, enemy.gridY)) {
        // 有障碍物，尝试寻找出路（向上或向下绕过）
        const currentRow = enemy.gridY;
        const battleStartRow = GameConfig.BATTLE_START_ROW;
        const battleEndRow = GameConfig.BATTLE_END_ROW - 1; // 不包括UI区域
        
        // 尝试向上移动
        let foundPath = false;
        if (currentRow > battleStartRow) {
          const upRow = currentRow - 1;
          // 检查上方格子是否有障碍物，以及下一个格子（向右）是否有障碍物
          if (!obstacleManager.hasObstacle(enemy.gridX, upRow) && 
              !obstacleManager.hasObstacle(nextGridX, upRow)) {
            // 可以向上绕过
            enemy.gridY = upRow;
            enemy.gridX = nextGridX;
            foundPath = true;
          }
        }
        
        // 如果向上不行，尝试向下移动
        if (!foundPath && currentRow < battleEndRow) {
          const downRow = currentRow + 1;
          // 检查下方格子是否有障碍物，以及下一个格子（向右）是否有障碍物
          if (!obstacleManager.hasObstacle(enemy.gridX, downRow) && 
              !obstacleManager.hasObstacle(nextGridX, downRow)) {
            // 可以向下绕过
            enemy.gridY = downRow;
            enemy.gridX = nextGridX;
            foundPath = true;
          }
        }
        
        // 如果找不到出路，尝试先向上或向下移动，等待下一帧再继续
        if (!foundPath) {
          // 优先尝试向上
          if (currentRow > battleStartRow) {
            const upRow = currentRow - 1;
            if (!obstacleManager.hasObstacle(enemy.gridX, upRow)) {
              enemy.gridY = upRow;
              return; // 先移动到上方，下一帧再继续
            }
          }
          // 如果向上不行，尝试向下
          if (currentRow < battleEndRow) {
            const downRow = currentRow + 1;
            if (!obstacleManager.hasObstacle(enemy.gridX, downRow)) {
              enemy.gridY = downRow;
              return; // 先移动到下方，下一帧再继续
            }
          }
          // 如果上下都有障碍物，暂时停止（等待障碍物被清除或其他敌人移动）
          return;
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
      if (obstacleManager && obstacleManager.hasObstacle(newCol, newRow)) {
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
      
      // 检查是否会与其他敌人碰撞
      if (!this.wouldCollide(enemy, newX, newY, allEnemies)) {
        // 没有碰撞，可以移动
        enemy.x = newX;
        enemy.y = newY;
      } else {
        // 有碰撞，尝试只移动一小部分距离
        const smallMove = actualMove * 0.1;
        const smallNewX = enemy.x + dirX * smallMove;
        const smallNewY = enemy.y + dirY * smallMove;
        
        // 再次检查小移动是否在障碍物格子上
        const smallNewCol = Math.floor(smallNewX / GameConfig.CELL_SIZE);
        const smallNewRow = Math.floor(smallNewY / GameConfig.CELL_SIZE);
        if (obstacleManager && obstacleManager.hasObstacle(smallNewCol, smallNewRow)) {
          // 小移动也会进入障碍物格子，不允许移动
          return;
        }
        
        if (!this.wouldCollide(enemy, smallNewX, smallNewY, allEnemies)) {
          enemy.x = smallNewX;
          enemy.y = smallNewY;
        }
        // 如果小距离移动也会碰撞，则不移动（等待前面的敌人移动）
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

