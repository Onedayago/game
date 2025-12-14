/**
 * 武器基类
 */

import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';
import { WeaponRenderer } from '../rendering/WeaponRenderer';
import { WeaponType } from '../config/WeaponConfig';
import { GameContext } from '../core/GameContext';
import { GameColors } from '../config/Colors';

export class Weapon {
  constructor(ctx, x, y, weaponType) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.weaponType = weaponType;
    this.level = 1;
    this.maxLevel = GameConfig.WEAPON_MAX_LEVEL;
    this.hp = GameConfig.WEAPON_MAX_HP;
    this.maxHp = GameConfig.WEAPON_MAX_HP;
    this.fireInterval = 500;
    this.attackRange = 4;
    this.damage = 1;
    this.timeSinceLastFire = 0;
    this.selected = false;
    this.destroyed = false;
    this.targetSearchTimer = 0;
    this.TARGET_SEARCH_INTERVAL = 100; // 每100ms查找一次目标
    this.currentTarget = null; // 缓存当前目标
    
    // 武器尺寸
    this.size = GameConfig.CELL_SIZE * UIConfig.WEAPON_MAP_SIZE_RATIO;
  }
  
  /**
   * 更新武器
   */
  update(deltaTime, deltaMS, enemies) {
    if (this.destroyed) return;
    
    this.timeSinceLastFire += deltaMS;
    this.targetSearchTimer += deltaMS;
    
    // 降低目标查找频率：每100ms查找一次，而不是每帧
    const shouldSearchTarget = this.targetSearchTimer >= this.TARGET_SEARCH_INTERVAL || !this.currentTarget;
    
    if (shouldSearchTarget) {
      this.targetSearchTimer = 0;
      this.currentTarget = this.findTarget(enemies);
    }
    
    // 检查当前目标是否仍然有效
    if (this.currentTarget && (this.currentTarget.destroyed || !this.isTargetInRange(this.currentTarget))) {
      this.currentTarget = null;
    }
    
    if (this.timeSinceLastFire >= this.fireInterval) {
      if (this.currentTarget) {
        this.fire(this.currentTarget);
        this.timeSinceLastFire = 0;
      }
    }
  }
  
  /**
   * 检查目标是否在范围内
   */
  isTargetInRange(target) {
    if (!target || target.destroyed) return false;
    
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distSq = dx * dx + dy * dy;
    const rangeSq = (this.attackRange * GameConfig.CELL_SIZE) ** 2;
    
    return distSq <= rangeSq;
  }
  
  /**
   * 寻找目标（优化：使用距离平方）
   */
  findTarget(enemies) {
    if (!enemies || enemies.length === 0) return null;
    
    let nearest = null;
    const attackRange = this.attackRange * GameConfig.CELL_SIZE;
    const minDistSq = attackRange * attackRange; // 使用距离平方
    
    for (const enemy of enemies) {
      if (!enemy || enemy.destroyed) continue;
      
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const distSq = dx * dx + dy * dy; // 距离平方，避免sqrt
      
      if (distSq <= minDistSq) {
        if (!nearest || distSq < minDistSq) {
          nearest = enemy;
        }
      }
    }
    
    return nearest;
  }
  
  /**
   * 开火（子类实现）
   */
  fire(target) {
    // 子类实现
  }
  
  /**
   * 受到伤害
   */
  takeDamage(damage) {
    this.hp -= damage;
    
    // 创建击中粒子效果
    const gameContext = GameContext.getInstance();
    if (gameContext.particleManager) {
      const hitColor = this.weaponType === WeaponType.ROCKET 
        ? GameColors.ROCKET_BULLET 
        : GameColors.LASER_BEAM;
      gameContext.particleManager.createHitSpark(
        this.x,
        this.y,
        hitColor
      );
    }
    
    if (this.hp <= 0) {
      this.destroyed = true;
      
      // 创建死亡爆炸效果
      if (gameContext.particleManager) {
        const explosionColor = this.weaponType === WeaponType.ROCKET 
          ? GameColors.ROCKET_BULLET 
          : GameColors.LASER_BEAM;
        gameContext.particleManager.createExplosion(
          this.x,
          this.y,
          explosionColor,
          GameConfig.PARTICLE_EXPLOSION_COUNT
        );
      }
    }
  }
  
  /**
   * 渲染武器（带视锥剔除，优化：应用战场偏移）
   */
  render(viewLeft = -Infinity, viewRight = Infinity, viewTop = -Infinity, viewBottom = Infinity, offsetX = 0, offsetY = 0) {
    if (this.destroyed) return;
    
    // 视锥剔除：只渲染屏幕内的武器（在 WeaponManager 中已经处理，这里保留参数以保持接口一致）
    
    // 渲染武器本体 - 应用战场偏移
    if (this.weaponType === WeaponType.ROCKET) {
      WeaponRenderer.renderRocketTower(this.ctx, this.x + offsetX, this.y + offsetY, this.size, this.level);
    } else if (this.weaponType === WeaponType.LASER) {
      WeaponRenderer.renderLaserTower(this.ctx, this.x + offsetX, this.y + offsetY, this.size, this.level);
    }
    
    // 渲染血条 - 应用战场偏移
    if (this.hp < this.maxHp) {
      WeaponRenderer.renderHealthBar(this.ctx, this.x + offsetX, this.y + offsetY, this.hp, this.maxHp, this.size);
    }
  }
}

