/**
 * 敌人移动逻辑
 */

import { GameConfig } from '../config/GameConfig';

export class EnemyMovement {
  /**
   * 简单的格子移动
   */
  static moveInGrid(enemy, deltaTime) {
    const targetWorldX = enemy.gridX * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    const targetWorldY = enemy.gridY * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    
    const dx = targetWorldX - enemy.x;
    const dy = targetWorldY - enemy.y;
    const distanceSq = dx * dx + dy * dy;
    const thresholdSq = 5 * 5; // 使用距离平方避免 sqrt
    
    if (distanceSq < thresholdSq) {
      // 到达目标格子，选择下一个
      enemy.gridX++;
      if (enemy.gridX >= GameConfig.BATTLE_COLS) {
        enemy.finished = true;
        return;
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
      enemy.x += dirX * actualMove;
      enemy.y += dirY * actualMove;
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

