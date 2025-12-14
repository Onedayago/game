/**
 * 火箭塔
 */

import { Weapon } from './Weapon';
import { WeaponType } from '../config/WeaponConfig';
import { GameConfig } from '../config/GameConfig';
import { HomingRocket } from '../projectiles/HomingRocket';

export class RocketTower extends Weapon {
  constructor(ctx, x, y) {
    super(ctx, x, y, WeaponType.ROCKET);
    
    this.fireInterval = GameConfig.ROCKET_FIRE_INTERVAL;
    this.attackRange = 5;
    this.damage = GameConfig.BULLET_DAMAGE * GameConfig.ROCKET_DAMAGE_MULTIPLIER;
    
    this.rockets = [];
    
    // 应用等级属性
    this.applyLevelStats();
    
    // 初始化火箭渲染缓存
    if (!HomingRocket._initialized) {
      HomingRocket.initCache(GameConfig.BULLET_RADIUS);
    }
  }
  
  /**
   * 应用等级属性
   */
  applyLevelStats() {
    if (this.level === 1) {
      this.fireInterval = GameConfig.ROCKET_FIRE_INTERVAL * 1.2;
      this.damage = GameConfig.BULLET_DAMAGE * 2;
    } else if (this.level === 2) {
      this.fireInterval = GameConfig.ROCKET_FIRE_INTERVAL * 1.0;
      this.damage = GameConfig.BULLET_DAMAGE * 2.5;
    } else if (this.level === 3) {
      this.fireInterval = GameConfig.ROCKET_FIRE_INTERVAL * 0.8;
      this.damage = GameConfig.BULLET_DAMAGE * 3;
    }
  }
  
  /**
   * 更新火箭塔（优化：批量删除，减少 splice 调用）
   */
  update(deltaTime, deltaMS, enemies) {
    super.update(deltaTime, deltaMS, enemies);
    
    // 优化：先更新，再批量删除已销毁的火箭
    let writeIndex = 0;
    for (let readIndex = 0; readIndex < this.rockets.length; readIndex++) {
      const rocket = this.rockets[readIndex];
      
      if (!rocket || rocket.destroyed) {
        continue; // 跳过已销毁的火箭
      }
      
      // 更新火箭
      rocket.update(deltaTime, deltaMS, enemies);
      
      // 只保留未销毁的火箭（原地覆盖）
      if (!rocket.destroyed) {
        if (writeIndex !== readIndex) {
          this.rockets[writeIndex] = rocket;
        }
        writeIndex++;
      }
    }
    
    // 删除已销毁的火箭
    this.rockets.length = writeIndex;
  }
  
  /**
   * 开火
   */
  fire(target) {
    if (!target || target.destroyed) return;
    
    // 限制火箭数量，防止过多火箭导致卡顿
    const MAX_ROCKETS = 30;
    if (this.rockets.length >= MAX_ROCKETS) {
      // 移除最旧的火箭
      const oldestRocket = this.rockets.shift();
      if (oldestRocket && !oldestRocket.destroyed) {
        oldestRocket.destroyed = true;
      }
    }
    
    // 创建追踪火箭
    const rocket = new HomingRocket(
      this.ctx,
      this.x,
      this.y,
      target,
      this.damage
    );
    
    this.rockets.push(rocket);
  }
  
  /**
   * 渲染火箭塔（带视锥剔除）
   */
  render(viewLeft = -Infinity, viewRight = Infinity, viewTop = -Infinity, viewBottom = Infinity) {
    super.render();
    
    // 渲染所有火箭（带视锥剔除）
    for (const rocket of this.rockets) {
      if (rocket && !rocket.destroyed) {
        rocket.render(viewLeft, viewRight, viewTop, viewBottom);
      }
    }
  }
}

