/**
 * 武器基类
 */

import { GameConfig } from '../../config/GameConfig';
import { WeaponStatsConfig } from '../../config/WeaponStatsConfig';
import { RocketTowerConfig } from '../../config/weapons/RocketTowerConfig';
import { LaserTowerConfig } from '../../config/weapons/LaserTowerConfig';
import { CannonTowerConfig } from '../../config/weapons/CannonTowerConfig';
import { SniperTowerConfig } from '../../config/weapons/SniperTowerConfig';
import { ParticleConfig } from '../../config/ParticleConfig';
import { UIConfig } from '../../config/UIConfig';
import { WeaponRenderer } from '../../rendering/weapons/WeaponRenderer';
import { WeaponType } from '../../config/WeaponConfig';
import { GameContext } from '../../core/GameContext';
import { GameColors } from '../../config/Colors';
import { LogUtils } from '../../utils/LogUtils';

export class Weapon {
  constructor(ctx, x, y, weaponType) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.weaponType = weaponType;
    this.isSelected = false; // 是否被选中
    this.buttonBounds = null; // 按钮位置信息 { upgradeButton, sellButton }
    this.level = 1;
    this.maxLevel = WeaponStatsConfig.WEAPON_MAX_LEVEL;
    this.hp = WeaponStatsConfig.WEAPON_MAX_HP;
    this.maxHp = WeaponStatsConfig.WEAPON_MAX_HP;
    this.fireInterval = 500;
    this.attackRange = 4;
    this.damage = 1;
    this.timeSinceLastFire = 0;
    this.destroyed = false;
    this.targetSearchTimer = 0;
    this.TARGET_SEARCH_INTERVAL = 100; // 每100ms查找一次目标
    this.currentTarget = null; // 缓存当前目标
    
    // 武器尺寸
    this.size = GameConfig.CELL_SIZE * UIConfig.WEAPON_MAP_SIZE_RATIO;
  }
  
  /**
   * 更新武器
   * @param {number} deltaTime - 时间差（秒）
   * @param {number} deltaMS - 时间差（毫秒）
   * @param {Array} enemies - 敌人数组
   * @param {Weapon} selectedWeapon - 当前选中的武器（可选）
   */
  update(deltaTime, deltaMS, enemies, selectedWeapon = null) {
    if (this.destroyed) return;
    
    
    // 更新选中状态（在update中处理，避免在render中重复计算）
    // 直接比较对象引用，而不是比较坐标（因为可能有多个武器在同一位置）
    this.isSelected = selectedWeapon === this;
                     
    LogUtils.log('Weapon.update: selectedWeapon', 10000,this.isSelected);
    LogUtils.log('Weapon.update', 10000, selectedWeapon);
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
        let explosionColor = GameColors.LASER_BEAM;
        if (this.weaponType === WeaponType.ROCKET) {
          explosionColor = GameColors.ROCKET_BULLET;
        } else if (this.weaponType === WeaponType.CANNON) {
          explosionColor = GameColors.CANNON_BULLET;
        } else if (this.weaponType === WeaponType.SNIPER) {
          explosionColor = GameColors.SNIPER_BULLET;
        }
        gameContext.particleManager.createExplosion(
          this.x,
          this.y,
          explosionColor,
          ParticleConfig.PARTICLE_EXPLOSION_COUNT
        );
      }
    }
  }
  
  /**
   * 获取升级成本
   */
  getUpgradeCost() {
    if (this.level >= this.maxLevel) {
      return 0; // 已满级
    }
    
    if (this.weaponType === WeaponType.ROCKET) {
      return RocketTowerConfig.UPGRADE_COST;
    } else if (this.weaponType === WeaponType.LASER) {
      return LaserTowerConfig.UPGRADE_COST;
    } else if (this.weaponType === WeaponType.CANNON) {
      return CannonTowerConfig.UPGRADE_COST;
    } else if (this.weaponType === WeaponType.SNIPER) {
      return SniperTowerConfig.UPGRADE_COST;
    }
    
    return 0;
  }
  
  /**
   * 获取出售收益
   */
  getSellGain() {
    if (this.weaponType === WeaponType.ROCKET) {
      return RocketTowerConfig.SELL_GAIN;
    } else if (this.weaponType === WeaponType.LASER) {
      return LaserTowerConfig.SELL_GAIN;
    } else if (this.weaponType === WeaponType.CANNON) {
      return CannonTowerConfig.SELL_GAIN;
    } else if (this.weaponType === WeaponType.SNIPER) {
      return SniperTowerConfig.SELL_GAIN;
    }
    
    return 0;
  }
  
  /**
   * 升级武器
   */
  upgrade() {
    if (this.level >= this.maxLevel) {
      return false; // 已满级
    }
    
    this.level++;
    
    // 应用新等级属性（子类实现）
    if (this.applyLevelStats) {
      this.applyLevelStats();
    }
    
    return true;
  }
  
  /**
   * 渲染武器（带视锥剔除，优化：应用战场偏移）
   */
  render(viewLeft = -Infinity, viewRight = Infinity, viewTop = -Infinity, viewBottom = Infinity, offsetX = 0, offsetY = 0) {
    if (this.destroyed) return;
    
    // 视锥剔除：只渲染屏幕内的武器（在 WeaponManager 中已经处理，这里保留参数以保持接口一致）
    
    const renderX = this.x + offsetX;
    const renderY = this.y + offsetY;
    
    // 渲染武器本体 - 应用战场偏移
    // 计算旋转角度（如果有目标）
    let angle = 0;
    if (this.currentTarget && !this.currentTarget.destroyed) {
      const dx = this.currentTarget.x - this.x;
      const dy = this.currentTarget.y - this.y;
      angle = Math.atan2(dy, dx);
    }
    
    if (this.weaponType === WeaponType.ROCKET) {
      WeaponRenderer.renderRocketTower(this.ctx, renderX, renderY, this.size, this.level, angle);
    } else if (this.weaponType === WeaponType.LASER) {
      WeaponRenderer.renderLaserTower(this.ctx, renderX, renderY, this.size, this.level, angle);
    } else if (this.weaponType === WeaponType.CANNON) {
      WeaponRenderer.renderCannonTower(this.ctx, renderX, renderY, this.size, this.level, angle);
    } else if (this.weaponType === WeaponType.SNIPER) {
      WeaponRenderer.renderSniperTower(this.ctx, renderX, renderY, this.size, this.level, angle);
    }
    
    // 渲染选中状态（高亮边框）
    if (this.isSelected) {
      WeaponRenderer.renderSelectionIndicator(this.ctx, renderX, renderY, this.size);
    }
    
    // 渲染血条 - 应用战场偏移
    if (this.hp < this.maxHp) {
      WeaponRenderer.renderHealthBar(this.ctx, renderX, renderY, this.hp, this.maxHp, this.size);
    }
    
    // 渲染升级/移除提示（如果选中）
    if (this.isSelected) {
      // 保存按钮位置信息（用于点击检测）
      this.buttonBounds = WeaponRenderer.renderUpgradeHint(this.ctx, renderX, renderY, this.size, this.level, this.maxLevel, this.getUpgradeCost(), this.getSellGain());
    } else {
      this.buttonBounds = null;
    }
  }
}

