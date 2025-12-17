/**
 * 敌人碰撞检测和分离力计算
 */

import { EnemyTankConfig } from '../../../config/enemies/EnemyTankConfig';

export class EnemyCollision {
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
}

