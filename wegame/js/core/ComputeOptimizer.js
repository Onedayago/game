/**
 * 计算优化器
 * 通过批量处理和分帧优化计算性能
 */

import { GameConfig } from '../config/GameConfig';

export class ComputeOptimizer {
  constructor() {
    this.frameBudget = 5; // 每帧计算预算（毫秒）
    this.pendingComputations = [];
    this.isProcessing = false;
  }
  
  /**
   * 批量查找目标（优化版）
   * 使用空间分区和批量处理
   */
  static batchFindTargets(weapons, enemies) {
    if (!weapons || !enemies || weapons.length === 0 || enemies.length === 0) {
      return new Map();
    }
    
    const targets = new Map();
    const attackRangeSqCache = new Map();
    
    // 预处理：计算攻击范围平方
    for (const weapon of weapons) {
      if (!weapon || weapon.destroyed) continue;
      const attackRange = weapon.attackRange * GameConfig.CELL_SIZE;
      attackRangeSqCache.set(weapon, attackRange * attackRange);
    }
    
    // 批量查找（限制计算量）
    const MAX_COMPUTATIONS = 1000; // 最多执行1000次距离计算
    let computationCount = 0;
    
    for (const weapon of weapons) {
      if (!weapon || weapon.destroyed) continue;
      if (computationCount >= MAX_COMPUTATIONS) break; // 达到计算上限，停止查找
      
      let nearest = null;
      let minDistSq = attackRangeSqCache.get(weapon);
      
      // 快速检查：先检查最近的几个敌人（假设敌人按距离排序）
      for (const enemy of enemies) {
        if (!enemy || enemy.destroyed) continue;
        if (computationCount >= MAX_COMPUTATIONS) break;
        
        const dx = enemy.x - weapon.x;
        const dy = enemy.y - weapon.y;
        const distSq = dx * dx + dy * dy;
        computationCount++;
        
        if (distSq <= minDistSq) {
          if (!nearest || distSq < minDistSq) {
            nearest = enemy;
            minDistSq = distSq;
          }
        }
      }
      
      if (nearest) {
        targets.set(weapon, nearest);
      }
    }
    
    return targets;
  }
  
  /**
   * 批量查找武器目标（用于敌人）
   */
  static batchFindWeaponTargets(enemies, weapons) {
    if (!enemies || !weapons || enemies.length === 0 || weapons.length === 0) {
      return new Map();
    }
    
    const targets = new Map();
    const attackRangeSqCache = new Map();
    
    // 预处理：计算攻击范围平方
    for (const enemy of enemies) {
      if (!enemy || enemy.destroyed) continue;
      const attackRange = enemy.attackRange * GameConfig.CELL_SIZE;
      attackRangeSqCache.set(enemy, attackRange * attackRange);
    }
    
    // 批量查找（限制计算量）
    const MAX_COMPUTATIONS = 1000; // 最多执行1000次距离计算
    let computationCount = 0;
    
    for (const enemy of enemies) {
      if (!enemy || enemy.destroyed) continue;
      if (computationCount >= MAX_COMPUTATIONS) break; // 达到计算上限，停止查找
      
      let nearest = null;
      let minDistSq = attackRangeSqCache.get(enemy);
      
      // 快速检查：先检查最近的几个武器
      for (const weapon of weapons) {
        if (!weapon || weapon.destroyed) continue;
        if (computationCount >= MAX_COMPUTATIONS) break;
        
        const dx = weapon.x - enemy.x;
        const dy = weapon.y - enemy.y;
        const distSq = dx * dx + dy * dy;
        computationCount++;
        
        if (distSq <= minDistSq) {
          if (!nearest || distSq < minDistSq) {
            nearest = weapon;
            minDistSq = distSq;
          }
        }
      }
      
      if (nearest) {
        targets.set(enemy, nearest);
      }
    }
    
    return targets;
  }
  
  /**
   * 批量碰撞检测（优化版）
   */
  static batchCheckCollisions(bullets, weapons) {
    if (!bullets || !weapons || bullets.length === 0 || weapons.length === 0) {
      return [];
    }
    
    const collisions = [];
    const weaponRadiusCache = new Map();
    
    // 预处理：缓存武器半径
    for (const weapon of weapons) {
      if (!weapon || weapon.destroyed) continue;
      weaponRadiusCache.set(weapon, weapon.size / 2);
    }
    
    // 批量检测
    for (const bullet of bullets) {
      if (!bullet || bullet.destroyed) continue;
      
      const bulletRadiusSq = bullet.radius * bullet.radius;
      
      for (const weapon of weapons) {
        if (!weapon || weapon.destroyed) continue;
        
        const dx = weapon.x - bullet.x;
        const dy = weapon.y - bullet.y;
        const distSq = dx * dx + dy * dy;
        const weaponRadius = weaponRadiusCache.get(weapon);
        const collisionDistSq = (bullet.radius + weaponRadius) ** 2;
        
        if (distSq < collisionDistSq) {
          collisions.push({
            bullet,
            weapon,
            x: bullet.x,
            y: bullet.y
          });
          break; // 一个子弹只能碰撞一次
        }
      }
    }
    
    return collisions;
  }
  
  /**
   * 分帧处理大量计算
   */
  scheduleComputation(computation, priority = 0) {
    this.pendingComputations.push({ computation, priority });
    this.pendingComputations.sort((a, b) => b.priority - a.priority);
    
    if (!this.isProcessing) {
      this.processComputations();
    }
  }
  
  /**
   * 处理待计算任务
   */
  processComputations() {
    if (this.pendingComputations.length === 0) {
      this.isProcessing = false;
      return;
    }
    
    this.isProcessing = true;
    const startTime = performance.now();
    let processedCount = 0;
    const MAX_PER_FRAME = 100; // 每帧最多处理的任务数，防止无限循环
    
    while (this.pendingComputations.length > 0 && processedCount < MAX_PER_FRAME) {
      const { computation } = this.pendingComputations.shift();
      
      try {
        computation();
      } catch (e) {
        console.warn('Computation error:', e);
      }
      
      processedCount++;
      
      // 检查时间预算
      if (performance.now() - startTime > this.frameBudget) {
        break;
      }
    }
    
    // 如果还有任务，下一帧继续处理
    if (this.pendingComputations.length > 0) {
      // 使用 setTimeout 而不是 requestAnimationFrame，避免与主循环冲突
      setTimeout(() => {
        this.processComputations();
      }, 0);
    } else {
      this.isProcessing = false;
    }
  }
  
  /**
   * 清理
   */
  clear() {
    this.pendingComputations = [];
    this.isProcessing = false;
  }
}

