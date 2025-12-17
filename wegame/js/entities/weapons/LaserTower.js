/**
 * 激光塔
 */

import { Weapon } from './Weapon';
import { WeaponType } from '../../config/WeaponConfig';
import { WeaponStatsConfig } from '../../config/WeaponStatsConfig';
import { LaserTowerConfig } from '../../config/weapons/LaserTowerConfig';
import { LaserBeam } from '../../projectiles/LaserBeam';
import { ColorUtils, GameColors } from '../../config/Colors';
import { GameContext } from '../../core/GameContext';

export class LaserTower extends Weapon {
  constructor(ctx, x, y) {
    super(ctx, x, y, WeaponType.LASER);
    
    this.fireInterval = LaserTowerConfig.FIRE_INTERVAL;
    this.attackRange = LaserTowerConfig.ATTACK_RANGE;
    this.damage = LaserTowerConfig.BASE_DAMAGE;
    
    this.currentBeam = null;
    this.beamDuration = 0;
    
    // 应用等级属性
    this.applyLevelStats();
  }
  
  /**
   * 应用等级属性
   */
  applyLevelStats() {
    if (this.level === 1) {
      this.fireInterval = LaserTowerConfig.FIRE_INTERVAL * LaserTowerConfig.LEVEL_1_FIRE_INTERVAL_MULTIPLIER;
      this.damage = LaserTowerConfig.BASE_DAMAGE * LaserTowerConfig.LEVEL_1_DAMAGE_MULTIPLIER;
    } else if (this.level === 2) {
      this.fireInterval = LaserTowerConfig.FIRE_INTERVAL * LaserTowerConfig.LEVEL_2_FIRE_INTERVAL_MULTIPLIER;
      this.damage = LaserTowerConfig.BASE_DAMAGE * LaserTowerConfig.LEVEL_2_DAMAGE_MULTIPLIER;
    } else if (this.level === 3) {
      this.fireInterval = LaserTowerConfig.FIRE_INTERVAL * LaserTowerConfig.LEVEL_3_FIRE_INTERVAL_MULTIPLIER;
      this.damage = LaserTowerConfig.BASE_DAMAGE * LaserTowerConfig.LEVEL_3_DAMAGE_MULTIPLIER;
    }
  }
  
  /**
   * 更新激光塔
   */
  update(deltaTime, deltaMS, enemies, selectedWeapon = null) {
    super.update(deltaTime, deltaMS, enemies, selectedWeapon);
    
    // 更新激光束
    if (this.currentBeam) {
      this.beamDuration -= deltaMS;
      if (this.beamDuration <= 0) {
        this.currentBeam = null;
      } else {
        // 更新激光束目标位置（使用缓存的目标，避免重复查找）
        if (this.currentTarget && !this.currentTarget.destroyed && this.isTargetInRange(this.currentTarget)) {
          this.currentBeam.updateTarget(this.currentTarget.x, this.currentTarget.y);
        }
        this.currentBeam.update(deltaTime, deltaMS);
      }
    }
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
    
    // 创建激光束
    this.currentBeam = new LaserBeam(
      this.ctx,
      this.x,
      this.y,
      target.x,
      target.y,
      this.damage
    );
    
    this.beamDuration = LaserTowerConfig.BEAM_DURATION;
    
    // 对目标造成伤害
    target.takeDamage(this.damage);
  }
  
  /**
   * 渲染激光塔（带视锥剔除，优化：应用战场偏移）
   */
  render(viewLeft = -Infinity, viewRight = Infinity, viewTop = -Infinity, viewBottom = Infinity, offsetX = 0, offsetY = 0) {
    super.render(viewLeft, viewRight, viewTop, viewBottom, offsetX, offsetY);
    
    // 渲染激光束（带视锥剔除，应用战场偏移）
    if (this.currentBeam) {
      this.currentBeam.render(viewLeft, viewRight, viewTop, viewBottom, offsetX, offsetY);
    }
  }
}

