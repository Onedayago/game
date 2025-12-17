/**
 * 加农炮塔
 */

import { Weapon } from './Weapon';
import { WeaponType } from '../../config/WeaponConfig';
import { WeaponStatsConfig } from '../../config/WeaponStatsConfig';
import { CannonTowerConfig } from '../../config/weapons/CannonTowerConfig';
import { CannonBullet } from '../../projectiles/CannonBullet';
import { GameContext } from '../../core/GameContext';

export class CannonTower extends Weapon {
  constructor(ctx, x, y) {
    super(ctx, x, y, WeaponType.CANNON);
    
    this.fireInterval = CannonTowerConfig.FIRE_INTERVAL;
    this.attackRange = CannonTowerConfig.ATTACK_RANGE;
    this.damage = WeaponStatsConfig.BULLET_BASE_DAMAGE * CannonTowerConfig.DAMAGE_MULTIPLIER;
    
    this.bullets = [];
    
    // 应用等级属性
    this.applyLevelStats();
  }
  
  /**
   * 应用等级属性
   */
  applyLevelStats() {
    if (this.level === 1) {
      this.fireInterval = CannonTowerConfig.FIRE_INTERVAL * CannonTowerConfig.LEVEL_1_FIRE_INTERVAL_MULTIPLIER;
      this.damage = WeaponStatsConfig.BULLET_BASE_DAMAGE * CannonTowerConfig.LEVEL_1_DAMAGE_MULTIPLIER;
    } else if (this.level === 2) {
      this.fireInterval = CannonTowerConfig.FIRE_INTERVAL * CannonTowerConfig.LEVEL_2_FIRE_INTERVAL_MULTIPLIER;
      this.damage = WeaponStatsConfig.BULLET_BASE_DAMAGE * CannonTowerConfig.LEVEL_2_DAMAGE_MULTIPLIER;
    } else if (this.level === 3) {
      this.fireInterval = CannonTowerConfig.FIRE_INTERVAL * CannonTowerConfig.LEVEL_3_FIRE_INTERVAL_MULTIPLIER;
      this.damage = WeaponStatsConfig.BULLET_BASE_DAMAGE * CannonTowerConfig.LEVEL_3_DAMAGE_MULTIPLIER;
    }
  }
  
  /**
   * 更新加农炮塔
   */
  update(deltaTime, deltaMS, enemies, selectedWeapon = null) {
    super.update(deltaTime, deltaMS, enemies, selectedWeapon);
    
    // 更新子弹
    let writeIndex = 0;
    for (let readIndex = 0; readIndex < this.bullets.length; readIndex++) {
      const bullet = this.bullets[readIndex];
      
      if (!bullet || bullet.destroyed) {
        continue;
      }
      
      bullet.update(deltaTime, deltaMS, enemies);
      
      if (!bullet.destroyed) {
        if (writeIndex !== readIndex) {
          this.bullets[writeIndex] = bullet;
        }
        writeIndex++;
      }
    }
    
    this.bullets.length = writeIndex;
  }
  
  /**
   * 开火
   */
  fire(target) {
    if (!target || target.destroyed) return;
    
    // 播放射击音效
    const gameContext = GameContext.getInstance();
    if (gameContext.audioManager) {
      gameContext.audioManager.playShootSound();
    }
    
    // 限制子弹数量
    const MAX_BULLETS = 20;
    if (this.bullets.length >= MAX_BULLETS) {
      const oldestBullet = this.bullets.shift();
      if (oldestBullet && !oldestBullet.destroyed) {
        oldestBullet.destroyed = true;
      }
    }
    
    // 计算角度
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const angle = Math.atan2(dy, dx);
    
    // 创建加农炮弹
    const bullet = new CannonBullet(
      this.ctx,
      this.x,
      this.y,
      angle,
      this.damage
    );
    
    this.bullets.push(bullet);
  }
  
  /**
   * 渲染加农炮塔
   */
  render(viewLeft = -Infinity, viewRight = Infinity, viewTop = -Infinity, viewBottom = Infinity, offsetX = 0, offsetY = 0) {
    super.render(viewLeft, viewRight, viewTop, viewBottom, offsetX, offsetY);
    
    // 渲染所有子弹
    for (const bullet of this.bullets) {
      if (bullet && !bullet.destroyed) {
        bullet.render(viewLeft, viewRight, viewTop, viewBottom, offsetX, offsetY);
      }
    }
  }
}

