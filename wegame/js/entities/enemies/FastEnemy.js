/**
 * 快速敌人
 */

import { Enemy } from './Enemy';
import { FastEnemyRenderer } from '../../rendering/enemies/FastEnemyRenderer';
import { FastEnemyConfig } from '../../config/enemies/FastEnemyConfig';
import { EnemyBulletConfig } from '../../config/enemies/EnemyBulletConfig';
import { EnemyBullet } from '../../projectiles/EnemyBullet';

export class FastEnemy extends Enemy {
  constructor(ctx, x, y) {
    super(ctx, x, y);
    
    this.maxHp = FastEnemyConfig.MAX_HP;
    this.hp = this.maxHp;
    this.moveSpeed = FastEnemyConfig.MOVE_SPEED;
    this.attackRange = FastEnemyConfig.ATTACK_RANGE;
    this.fireInterval = FastEnemyConfig.FIRE_INTERVAL;
    this.damage = EnemyBulletConfig.DAMAGE;
    this.size = FastEnemyConfig.SIZE;
    
    this.bullets = [];
    
    // 初始化子弹渲染缓存
    if (!EnemyBullet._initialized) {
      EnemyBullet.initCache(EnemyBulletConfig.RADIUS);
    }
  }
  
  /**
   * 更新快速敌人
   */
  update(deltaTime, deltaMS, weapons) {
    super.update(deltaTime, deltaMS, weapons);
    
    // 限制子弹数量
    const MAX_BULLETS = 10;
    if (this.bullets.length > MAX_BULLETS) {
      const removeCount = this.bullets.length - MAX_BULLETS;
      this.bullets.splice(0, removeCount);
    }
    
    // 批量删除已销毁的子弹
    let writeIndex = 0;
    for (let readIndex = 0; readIndex < this.bullets.length; readIndex++) {
      const bullet = this.bullets[readIndex];
      if (!bullet || bullet.destroyed) continue;
      
      bullet.update(deltaTime, deltaMS, weapons);
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
    
    const MAX_BULLETS = 10;
    if (this.bullets.length >= MAX_BULLETS) {
      return;
    }
    
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const angle = Math.atan2(dy, dx);
    
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
   * 渲染快速敌人
   */
  render(viewLeft = -Infinity, viewRight = Infinity, viewTop = -Infinity, viewBottom = Infinity, offsetX = 0, offsetY = 0) {
    if (this.destroyed || this.finished) return;
    
    FastEnemyRenderer.render(this.ctx, this.x + offsetX, this.y + offsetY, this.size, this.angle);
    
    if (this.bullets.length > 0) {
      for (const bullet of this.bullets) {
        if (bullet && !bullet.destroyed) {
          bullet.render(viewLeft, viewRight, viewTop, viewBottom, offsetX, offsetY);
        }
      }
    }
  }
}

