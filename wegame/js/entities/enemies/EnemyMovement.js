/**
 * 敌人移动逻辑
 * 主入口文件，导出所有移动相关功能
 */

import { EnemyCollision } from './collision/EnemyCollision';
import { EnemyPathMovement } from './movement/EnemyPathMovement';
import { GameConfig } from '../../config/GameConfig';

export class EnemyMovement {
  /**
   * 检查两个敌人是否碰撞
   */
  static checkCollision(enemy1, enemy2) {
    return EnemyCollision.checkCollision(enemy1, enemy2);
  }
  
  /**
   * 计算推开力（用于分离聚集的敌人）
   */
  static calculateSeparationForce(enemy, allEnemies) {
    return EnemyCollision.calculateSeparationForce(enemy, allEnemies);
  }
  
  /**
   * 检查移动后是否会与其他敌人碰撞
   */
  static wouldCollide(enemy, newX, newY, allEnemies) {
    return EnemyCollision.wouldCollide(enemy, newX, newY, allEnemies);
  }
  
  /**
   * 使用 A* 算法的格子移动（带碰撞检测和障碍物检测）
   * @param {boolean} canFlyOverObstacles - 是否可以飞过障碍物（飞行敌人）
   */
  static moveInGrid(enemy, deltaTime, allEnemies = [], obstacleManager = null, canFlyOverObstacles = false) {
    return EnemyPathMovement.moveInGrid(enemy, deltaTime, allEnemies, obstacleManager, canFlyOverObstacles);
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

export default EnemyMovement;
