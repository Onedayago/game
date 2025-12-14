/**
 * 敌人管理器
 */

import { GameContext } from '../core/GameContext';
import { GameConfig } from '../config/GameConfig';
import { EnemyTank } from '../entities/EnemyTank';
import { WeaponRenderer } from '../rendering/WeaponRenderer';
import { EnemyRenderer } from '../rendering/EnemyRenderer';

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
  }
  
  /**
   * 初始化敌人管理器（初始化缓存）
   */
  init() {
    // 初始化敌人渲染缓存
    EnemyRenderer.initCache(GameConfig.ENEMY_SIZE);
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
   * 更新敌人
   */
  update(deltaTime, deltaMS, weapons) {
  
    // 检查游戏是否已开始
    const gameContext = GameContext.getInstance();
    if (!gameContext.gameStarted) {
      // 游戏未开始，不更新敌人生成逻辑
      return;
    }
    
    // 更新生成计时器
    this.spawnTimer += deltaMS;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemy();
    }
    
    // 更新所有敌人
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      if (!enemy) {
        continue;
      }
      
      // 处理已销毁或已完成的敌人
      if (enemy.destroyed) {
        // 奖励金币
        if (this.goldManager) {
          this.goldManager.addGold(GameConfig.ENEMY_KILL_REWARD);
        }
        // 从 GameContext 移除
        const gameContext = GameContext.getInstance();
        gameContext.removeEnemy(enemy);
        this.enemies.splice(i, 1);
        continue;
      }
      
      if (enemy.finished) {
        // 从 GameContext 移除
        const gameContext = GameContext.getInstance();
        gameContext.removeEnemy(enemy);
        this.enemies.splice(i, 1);
        continue;
      }
      
      
      // 更新敌人
      if (enemy.update) {
        enemy.update(deltaTime, deltaMS, weapons || []);
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
   * 移除敌人
   */
  removeEnemy(enemy) {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
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
    
    // 获取战场偏移（如果传入）
    const offsetX = arguments[4] || 0;
    const offsetY = arguments[5] || 0;
    
    // 批量渲染敌人（优化：移除 save/restore）
    // 先批量渲染所有血条（相同状态）
    this.renderAllHealthBars(enemiesToRender, offsetX, offsetY);
    
    // 再渲染所有敌人本体
    for (const enemy of enemiesToRender) {
      if (enemy.render) {
        enemy.render(viewLeft, viewRight, viewTop, viewBottom, offsetX, offsetY);
        hasRendered = true;
      }
    }
  }
  
  /**
   * 批量渲染所有敌人的血条（优化：减少状态切换，应用战场偏移）
   */
  renderAllHealthBars(enemies, offsetX = 0, offsetY = 0) {
    // 收集所有需要渲染的血条
    const healthBars = [];
    for (const enemy of enemies) {
      if (enemy && !enemy.destroyed && !enemy.finished) {
        healthBars.push({
          x: enemy.x + offsetX,
          y: enemy.y + offsetY,
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

