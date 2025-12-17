/**
 * 敌方坦克
 */

import { Enemy } from './Enemy';
import { EnemyTankRenderer } from '../../rendering/enemies/EnemyTankRenderer';
import { WeaponRenderer } from '../../rendering/weapons/WeaponRenderer';
import { EnemyTankConfig } from '../../config/enemies/EnemyTankConfig';
import { EnemyBulletConfig } from '../../config/enemies/EnemyBulletConfig';
import { EnemyBullet } from '../../projectiles/EnemyBullet';

export class EnemyTank extends Enemy {
  constructor(ctx, x, y) {
    super(ctx, x, y);
    
    this.maxHp = EnemyTankConfig.MAX_HP;
    this.hp = this.maxHp;
    this.moveSpeed = EnemyTankConfig.MOVE_SPEED;
    this.attackRange = EnemyTankConfig.ATTACK_RANGE;
    this.fireInterval = EnemyTankConfig.FIRE_INTERVAL;
    this.damage = EnemyBulletConfig.DAMAGE;
    
    this.bullets = [];
    
    // 初始化子弹渲染缓存
    if (!EnemyBullet._initialized) {
      EnemyBullet.initCache(EnemyBulletConfig.RADIUS);
    }
  }
  
  /**
   * 更新敌人坦克（优化：批量删除，减少 splice 调用，限制子弹数量）
   */
  update(deltaTime, deltaMS, weapons) {
    super.update(deltaTime, deltaMS, weapons);
    
    // 限制子弹数量，防止过多子弹导致卡顿
    const MAX_BULLETS = 15; // 最多15个子弹（进一步限制）
    if (this.bullets.length > MAX_BULLETS) {
      // 移除最旧的子弹
      const removeCount = this.bullets.length - MAX_BULLETS;
      this.bullets.splice(0, removeCount);
    }
    
    // 优化：先更新，再批量删除已销毁的子弹
    let writeIndex = 0;
    for (let readIndex = 0; readIndex < this.bullets.length; readIndex++) {
      const bullet = this.bullets[readIndex];
      
      if (!bullet || bullet.destroyed) {
        continue; // 跳过已销毁的子弹
      }
      
      // 更新子弹
      bullet.update(deltaTime, deltaMS, weapons);
      
      // 只保留未销毁的子弹（原地覆盖）
      if (!bullet.destroyed) {
        if (writeIndex !== readIndex) {
          this.bullets[writeIndex] = bullet;
        }
        writeIndex++;
      }
    }
    
    // 删除已销毁的子弹
    this.bullets.length = writeIndex;
  }
  
  /**
   * 开火（优化：限制子弹数量）
   */
  fire(target) {
    if (!target || target.destroyed) return;
    
    // 限制子弹数量，防止过多子弹导致卡顿（已在 update 中统一处理）
    // 这里只检查是否超过上限，如果超过则不创建新子弹
    const MAX_BULLETS = 15; // 与 update 中的限制保持一致
    if (this.bullets.length >= MAX_BULLETS) {
      return; // 不创建新子弹
    }
    
    // 计算发射角度
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const angle = Math.atan2(dy, dx);
    
    // 创建子弹
    const bullet = new EnemyBullet(
      this.ctx,
      this.x,
      this.y,
      angle,
      this.damage
    );
    
    this.bullets.push(bullet);
  }
  
  /**
   * 渲染敌人坦克（带视锥剔除，不包含血条，优化：应用战场偏移，移除 save/restore）
   * 血条由 EnemyManager 批量渲染
   */
  render(viewLeft = -Infinity, viewRight = Infinity, viewTop = -Infinity, viewBottom = Infinity, offsetX = 0, offsetY = 0) {
    if (this.destroyed || this.finished) return;
    
   
    // 只渲染坦克本体（血条由 EnemyManager 批量渲染）- 应用战场偏移
    EnemyTankRenderer.render(this.ctx, this.x + offsetX, this.y + offsetY, this.size, this.angle);
    
    // 批量渲染子弹（优化：移除 save/restore，应用战场偏移）
    if (this.bullets.length > 0) {
      for (const bullet of this.bullets) {
        if (bullet && !bullet.destroyed) {
          bullet.render(viewLeft, viewRight, viewTop, viewBottom, offsetX, offsetY);
        }
      }
    }
  }
}

