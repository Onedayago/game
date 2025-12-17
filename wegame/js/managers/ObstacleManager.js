/**
 * 障碍物管理器
 */

import { GameConfig } from '../config/GameConfig';
import { Obstacle } from '../entities/obstacles/Obstacle';

export class ObstacleManager {
  constructor(ctx) {
    this.ctx = ctx;
    this.obstacles = [];
  }
  
  /**
   * 初始化障碍物（随机生成）
   */
  init() {
    this.obstacles = [];
    
    // 障碍物密度（每个格子的生成概率）
    const obstacleDensity = 0.15; // 15% 的格子会有障碍物
    
    // 遍历所有战斗区域的格子（排除底部UI区域）
    for (let row = GameConfig.BATTLE_START_ROW; row < GameConfig.BATTLE_END_ROW; row++) {
      for (let col = 0; col < GameConfig.BATTLE_COLS; col++) {
        // 避免在前三列生成障碍物（敌人出生区域）
        if (col < 3) {
          continue;
        }
        
        // 随机决定是否生成障碍物
        if (Math.random() < obstacleDensity) {
          // 创建障碍物
          const obstacle = new Obstacle(this.ctx, col, row);
          this.obstacles.push(obstacle);
        }
      }
    }
    
    console.log(`生成了 ${this.obstacles.length} 个障碍物`);
  }
  
  /**
   * 重置障碍物（重新生成）
   */
  reset() {
    this.init();
  }
  
  /**
   * 检查指定格子是否有障碍物
   */
  hasObstacle(gridX, gridY) {
    for (const obstacle of this.obstacles) {
      if (obstacle.gridX === gridX && obstacle.gridY === gridY) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * 获取指定位置的障碍物
   */
  getObstacleAt(gridX, gridY) {
    for (const obstacle of this.obstacles) {
      if (obstacle.gridX === gridX && obstacle.gridY === gridY) {
        return obstacle;
      }
    }
    return null;
  }
  
  /**
   * 渲染障碍物（带视锥剔除，应用战场偏移）
   */
  render(viewLeft = -Infinity, viewRight = Infinity, viewTop = -Infinity, viewBottom = Infinity, offsetX = 0, offsetY = 0) {
    // 视锥剔除：只渲染屏幕内的障碍物
    for (const obstacle of this.obstacles) {
      const obstacleSize = obstacle.size || GameConfig.CELL_SIZE;
      if (obstacle.x + obstacleSize < viewLeft || 
          obstacle.x - obstacleSize > viewRight ||
          obstacle.y + obstacleSize < viewTop || 
          obstacle.y - obstacleSize > viewBottom) {
        continue; // 跳过屏幕外的障碍物
      }
      
      obstacle.render(offsetX, offsetY);
    }
  }
  
  /**
   * 获取所有障碍物
   */
  getObstacles() {
    return this.obstacles;
  }
}

