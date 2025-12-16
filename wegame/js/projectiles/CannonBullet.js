/**
 * 加农炮弹
 */

import { GameConfig } from '../config/GameConfig';
import { WeaponStatsConfig } from '../config/WeaponStatsConfig';
import { CannonBulletConfig } from '../config/weapons/CannonBulletConfig';
import { ParticleConfig } from '../config/ParticleConfig';
import { ColorUtils, GameColors } from '../config/Colors';
import { GameContext } from '../core/GameContext';

export class CannonBullet {
  constructor(ctx, x, y, angle, damage) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.damage = damage;
    this.speed = WeaponStatsConfig.BULLET_BASE_SPEED * CannonBulletConfig.SPEED_MULTIPLIER;
    this.radius = CannonBulletConfig.RADIUS;
    this.destroyed = false;
    this.lifetime = CannonBulletConfig.MAX_LIFETIME;
    this.age = 0;
    
    // 计算速度分量
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }
  
  /**
   * 更新加农炮弹
   */
  update(deltaTime, deltaMS, enemies) {
    if (this.destroyed) return;
    
    this.age += deltaMS;
    if (this.age >= this.lifetime) {
      this.destroyed = true;
      return;
    }
    
    // 更新位置
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    
    // 检查边界
    if (this.x < 0 || this.x > GameConfig.BATTLE_WIDTH ||
        this.y < 0 || this.y > GameConfig.BATTLE_HEIGHT) {
      this.destroyed = true;
      return;
    }
    
    // 检查碰撞敌人
    if (!enemies || enemies.length === 0) return;
    
    for (const enemy of enemies) {
      if (!enemy || enemy.destroyed) continue;
      
      const dx = this.x - enemy.x;
      const dy = this.y - enemy.y;
      const distanceSq = dx * dx + dy * dy;
      const enemyRadius = (enemy.size || 20) / 2; // 敌人使用 size，需要除以2得到半径
      const collisionRadius = this.radius + enemyRadius;
      
      if (distanceSq <= collisionRadius * collisionRadius) {
        // 命中敌人
        enemy.takeDamage(this.damage);
        this.destroyed = true;
        
        // 创建爆炸粒子
        const gameContext = GameContext.getInstance();
        if (gameContext && gameContext.particleManager) {
          gameContext.particleManager.createExplosion(
            this.x,
            this.y,
            GameColors.CANNON_BULLET,
            ParticleConfig.PARTICLE_EXPLOSION_COUNT
          );
        }
        return;
      }
    }
  }
  
  /**
   * 渲染加农炮弹
   */
  render(viewLeft = -Infinity, viewRight = Infinity, viewTop = -Infinity, viewBottom = Infinity, offsetX = 0, offsetY = 0) {
    if (this.destroyed) return;
    
    // 应用战场偏移
    const renderX = this.x + offsetX;
    const renderY = this.y + offsetY;
    
    // 视锥剔除
    if (renderX + this.radius < viewLeft || renderX - this.radius > viewRight ||
        renderY + this.radius < viewTop || renderY - this.radius > viewBottom) {
      return;
    }
    
    this.ctx.save();
    
    // 绘制尾迹
    const trailGradient = this.ctx.createRadialGradient(renderX, renderY, 0, renderX, renderY, this.radius * 2);
    trailGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.CANNON_BULLET, 0.4));
    trailGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.CANNON_BULLET, 0));
    this.ctx.fillStyle = trailGradient;
    this.ctx.beginPath();
    this.ctx.arc(renderX, renderY, this.radius * 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 绘制炮弹主体
    const bodyGradient = this.ctx.createRadialGradient(renderX, renderY, 0, renderX, renderY, this.radius);
    bodyGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.9));
    bodyGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.CANNON_BULLET, 1));
    bodyGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.8));
    this.ctx.fillStyle = bodyGradient;
    this.ctx.beginPath();
    this.ctx.arc(renderX, renderY, this.radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }
}

