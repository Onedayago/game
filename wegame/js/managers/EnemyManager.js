/**
 * 敌人管理器
 */

import { GameContext } from '../core/GameContext';
import { GameConfig } from '../config/GameConfig';
import { EnemyTank } from '../entities/EnemyTank';
import { ComputeOptimizer } from '../core/ComputeOptimizer';
import { WeaponRenderer } from '../rendering/WeaponRenderer';

export class EnemyManager {
  constructor(ctx, weaponManager, goldManager) {
    this.ctx = ctx;
    this.weaponManager = weaponManager;
    this.goldManager = goldManager;
    this.enemies = [];
    this.spawnTimer = 0;
    this.spawnInterval = GameConfig.ENEMY_SPAWN_INTERVAL;
    this.waveTimer = 0;
    this.waveLevel = 1;
    this.hpBonus = 0;
    this.targetCache = new Map(); // 目标缓存
    this.batchUpdateTimer = 0; // 批量更新计时器
    this.BATCH_UPDATE_INTERVAL = 200; // 每200ms批量更新一次目标查找
  }
  
  /**
   * 重置敌人管理器
   */
  reset() {
    this.enemies = [];
    this.spawnTimer = 0;
    this.spawnInterval = GameConfig.ENEMY_SPAWN_INTERVAL;
    this.waveTimer = 0;
    this.waveLevel = 1;
    this.hpBonus = 0;
    this.targetCache.clear(); // 清除缓存
  }
  
  /**
   * 生成敌人
   */
  spawnEnemy() {
    // 随机选择一行
    const row = Math.floor(Math.random() * GameConfig.BATTLE_ROWS);
    
    // 创建敌人
    const enemy = new EnemyTank(this.ctx, 0, 0);
    enemy.initPosition(row);
    enemy.setHpBonus(this.hpBonus);
    
    this.enemies.push(enemy);
    const gameContext = GameContext.getInstance();
    gameContext.addEnemy(enemy);
  }
  
  /**
   * 更新敌人（使用批量目标查找优化）
   */
  update(deltaTime, deltaMS, weapons) {
    // 检查游戏是否已开始
    const gameContext = GameContext.getInstance();
    if (!gameContext.gameStarted) {
      // 游戏未开始，不更新敌人生成逻辑
      return;
    }
    
    // 限制敌人数量，防止过多敌人导致卡顿
    const MAX_ENEMIES = 20; // 最多20个敌人（进一步限制）
    if (this.enemies.length < MAX_ENEMIES) {
      // 更新生成计时器
      this.spawnTimer += deltaMS;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer = 0;
        this.spawnEnemy();
      }
    } else {
      // 敌人数量过多，延长生成间隔
      this.spawnTimer = 0;
    }
    
    // 批量更新目标查找（优化性能，限制频率）
    if (weapons && weapons.length > 0 && this.enemies.length > 0) {
      this.batchUpdateTargets(weapons, deltaMS);
    }
    
    // 更新所有敌人（优化：批量删除，减少 splice 调用）
    let writeIndex = 0;
    for (let readIndex = 0; readIndex < this.enemies.length; readIndex++) {
      const enemy = this.enemies[readIndex];
      
      if (!enemy) {
        continue; // 跳过空引用
      }
      
      // 处理已销毁或已完成的敌人
      if (enemy.destroyed) {
        this.targetCache.delete(enemy); // 清除缓存
        // 奖励金币
        if (this.goldManager) {
          this.goldManager.addGold(GameConfig.ENEMY_KILL_REWARD);
        }
        // 从 GameContext 移除
        const gameContext = GameContext.getInstance();
        gameContext.removeEnemy(enemy);
        continue; // 跳过已销毁的敌人
      }
      
      if (enemy.finished) {
        this.targetCache.delete(enemy); // 清除缓存
        // 从 GameContext 移除
        const gameContext = GameContext.getInstance();
        gameContext.removeEnemy(enemy);
        continue; // 跳过已完成的敌人
      }
      
      // 使用缓存的目标（如果有效）
      const cachedTarget = this.targetCache.get(enemy);
      if (cachedTarget && !cachedTarget.destroyed) {
        // 检查目标是否仍在范围内
        const dx = cachedTarget.x - enemy.x;
        const dy = cachedTarget.y - enemy.y;
        const distSq = dx * dx + dy * dy;
        const rangeSq = (enemy.attackRange * GameConfig.CELL_SIZE) ** 2;
        
        if (distSq <= rangeSq) {
          // 使用缓存的目标
          enemy.currentTarget = cachedTarget;
        } else {
          // 目标超出范围，清除缓存
          this.targetCache.delete(enemy);
        }
      }
      
      // 更新敌人
      if (enemy.update) {
        enemy.update(deltaTime, deltaMS, weapons || []);
        
        // 更新缓存
        if (enemy.currentTarget) {
          this.targetCache.set(enemy, enemy.currentTarget);
        }
      }
      
      // 只保留有效的敌人（原地覆盖）
      if (!enemy.destroyed && !enemy.finished) {
        if (writeIndex !== readIndex) {
          this.enemies[writeIndex] = enemy;
        }
        writeIndex++;
      }
    }
    
    // 删除已销毁或已完成的敌人
    this.enemies.length = writeIndex;
  }
  
  /**
   * 批量更新目标查找（优化性能）
   * 限制查找频率，避免每帧都执行昂贵的计算
   */
  batchUpdateTargets(weapons, deltaMS) {
    if (!weapons || weapons.length === 0) return;
    
    // 限制批量查找频率
    this.batchUpdateTimer += deltaMS;
    if (this.batchUpdateTimer < this.BATCH_UPDATE_INTERVAL) {
      return; // 还没到更新时间
    }
    this.batchUpdateTimer = 0;
    
    // 限制查找范围：只查找部分敌人和武器
    // 这样可以大幅减少计算量
    const MAX_ENEMIES_TO_CHECK = 50; // 最多检查50个敌人
    const enemiesToCheck = this.enemies.length > MAX_ENEMIES_TO_CHECK
      ? this.enemies.slice(0, MAX_ENEMIES_TO_CHECK)
      : this.enemies;
    
    const MAX_WEAPONS_TO_CHECK = 30; // 最多检查30个武器
    const weaponsToCheck = weapons.length > MAX_WEAPONS_TO_CHECK
      ? weapons.slice(0, MAX_WEAPONS_TO_CHECK)
      : weapons;
    
    // 使用批量查找优化（只对部分敌人和武器）
    const targets = ComputeOptimizer.batchFindWeaponTargets(enemiesToCheck, weaponsToCheck);
    
    // 更新缓存
    for (const [enemy, target] of targets.entries()) {
      this.targetCache.set(enemy, target);
      if (enemy) {
        enemy.currentTarget = target;
      }
    }
  }
  
  /**
   * 获取所有敌人
   */
  getEnemies() {
    return this.enemies;
  }
  
  /**
   * 移除敌人（优化：使用快速删除）
   */
  removeEnemy(enemy) {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      // 快速删除：将最后一个元素移到当前位置
      const last = this.enemies.length - 1;
      if (index !== last) {
        this.enemies[index] = this.enemies[last];
      }
      this.enemies.pop();
      
      const gameContext = GameContext.getInstance();
      gameContext.removeEnemy(enemy);
    }
  }
  
  /**
   * 渲染敌人（带视锥剔除，优化：减少 save/restore 调用）
   */
  render(viewLeft = -Infinity, viewRight = Infinity, viewTop = -Infinity, viewBottom = Infinity) {
    // 优化：只在需要时保存上下文，而不是每个敌人都保存
    let hasRendered = false;
    
    // 先收集需要渲染的敌人（减少循环中的条件判断）
    const enemiesToRender = [];
    for (const enemy of this.enemies) {
      if (!enemy || enemy.destroyed || enemy.finished) continue;
      
      // 视锥剔除：只渲染屏幕内的敌人
      const enemySize = enemy.size || GameConfig.ENEMY_SIZE;
      if (enemy.x + enemySize < viewLeft || 
          enemy.x - enemySize > viewRight ||
          enemy.y + enemySize < viewTop || 
          enemy.y - enemySize > viewBottom) {
        continue; // 跳过屏幕外的敌人
      }
      
      enemiesToRender.push(enemy);
    }
    
    // 如果没有需要渲染的敌人，直接返回
    if (enemiesToRender.length === 0) return;
    
    // 只保存一次上下文
    this.ctx.save();
    
    // 批量渲染敌人（优化：减少状态切换）
    // 先批量渲染所有血条（相同状态）
    this.renderAllHealthBars(enemiesToRender);
    
    // 再渲染所有敌人本体
    for (const enemy of enemiesToRender) {
      if (enemy.render) {
        enemy.render(viewLeft, viewRight, viewTop, viewBottom);
        hasRendered = true;
      }
    }
    
    this.ctx.restore();
  }
  
  /**
   * 批量渲染所有敌人的血条（优化：减少状态切换）
   */
  renderAllHealthBars(enemies) {
    // 收集所有需要渲染的血条
    const healthBars = [];
    for (const enemy of enemies) {
      if (enemy && !enemy.destroyed && !enemy.finished) {
        healthBars.push({
          x: enemy.x,
          y: enemy.y,
          hp: enemy.hp,
          maxHp: enemy.maxHp,
          size: enemy.size || GameConfig.ENEMY_SIZE
        });
      }
    }
    
    if (healthBars.length === 0) return;
    
    // 批量绘制血条（减少状态切换）
    for (const bar of healthBars) {
      WeaponRenderer.renderHealthBar(this.ctx, bar.x, bar.y, bar.hp, bar.maxHp, bar.size);
    }
  }
}

