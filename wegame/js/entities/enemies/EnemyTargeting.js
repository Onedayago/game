/**
 * 敌人目标查找逻辑
 */

import { GameConfig } from '../../config/GameConfig';

export class EnemyTargeting {
  /**
   * 寻找最近的武器
   * 优化：使用距离平方比较，避免sqrt计算
   */
  static findNearestWeapon(enemy, weapons) {
    if (!weapons || weapons.length === 0) return null;
    
    let nearest = null;
    const attackRange = enemy.attackRange * GameConfig.CELL_SIZE;
    const minDistSq = attackRange * attackRange; // 使用距离平方
    
    for (const weapon of weapons) {
      if (!weapon || weapon.destroyed) continue;
      
      const dx = weapon.x - enemy.x;
      const dy = weapon.y - enemy.y;
      const distSq = dx * dx + dy * dy; // 距离平方，避免sqrt
      
      if (distSq <= minDistSq) {
        if (!nearest || distSq < minDistSq) {
          nearest = weapon;
        }
      }
    }
    
    return nearest;
  }
  
  /**
   * 检查目标是否有效
   */
  static isTargetValid(target) {
    return target && !target.destroyed;
  }
  
  /**
   * 获取到目标的距离
   */
  static getDistanceToTarget(enemy, target) {
    if (!this.isTargetValid(target)) return Infinity;
    
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * 获取到目标的距离平方（性能优化版本）
   */
  static getDistanceSqToTarget(enemy, target) {
    if (!this.isTargetValid(target)) return Infinity;
    
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    return dx * dx + dy * dy;
  }
}

