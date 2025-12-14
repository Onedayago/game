/**
 * 激光塔
 */

import { Weapon } from './Weapon';
import { WeaponType } from '../config/WeaponConfig';
import { GameConfig } from '../config/GameConfig';
import { LaserBeam } from '../projectiles/LaserBeam';
import { ColorUtils, GameColors } from '../config/Colors';

export class LaserTower extends Weapon {
  constructor(ctx, x, y) {
    super(ctx, x, y, WeaponType.LASER);
    
    this.fireInterval = GameConfig.LASER_FIRE_INTERVAL;
    this.attackRange = GameConfig.LASER_ATTACK_RANGE;
    this.damage = GameConfig.LASER_DAMAGE;
    
    this.currentBeam = null;
    this.beamDuration = 0;
  }
  
  /**
   * 更新激光塔
   */
  update(deltaTime, deltaMS, enemies) {
    super.update(deltaTime, deltaMS, enemies);
    
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
    
    // 创建激光束
    this.currentBeam = new LaserBeam(
      this.ctx,
      this.x,
      this.y,
      target.x,
      target.y,
      this.damage
    );
    
    this.beamDuration = GameConfig.LASER_BEAM_DURATION;
    
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

