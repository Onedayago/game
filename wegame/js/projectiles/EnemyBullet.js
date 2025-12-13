/**
 * 敌人子弹
 */

import { GameConfig } from '../config/GameConfig';
import { ColorUtils, GameColors } from '../config/Colors';
import { GameContext } from '../core/GameContext';

export class EnemyBullet {
  constructor(ctx, x, y, angle, damage) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.damage = damage;
    this.speed = GameConfig.ENEMY_BULLET_SPEED;
    this.radius = GameConfig.ENEMY_BULLET_RADIUS;
    this.destroyed = false;
    this.lifetime = 3000; // 3秒
    this.age = 0;
    
    // 计算速度分量
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }
  
  /**
   * 更新子弹
   */
  update(deltaTime, deltaMS, weapons) {
    if (this.destroyed) return;
    
    this.age += deltaMS;
    if (this.age >= this.lifetime) {
      this.destroyed = true;
      return;
    }
    
    // 移动子弹
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    
    // 检查碰撞（优化：使用距离平方，避免sqrt，提前退出）
    if (weapons && weapons.length > 0) {
      for (const weapon of weapons) {
        if (!weapon || weapon.destroyed) continue;
        
        const dx = weapon.x - this.x;
        const dy = weapon.y - this.y;
        const distSq = dx * dx + dy * dy; // 距离平方，避免sqrt
        const weaponRadius = weapon.size / 2;
        const collisionDistSq = (this.radius + weaponRadius) ** 2;
        
        if (distSq < collisionDistSq) {
          // 击中武器
          weapon.takeDamage(this.damage);
          this.destroyed = true;
          
          // 创建击中粒子效果
          const gameContext = GameContext.getInstance();
          if (gameContext.particleManager) {
            gameContext.particleManager.createHitSpark(
              this.x,
              this.y,
              GameColors.ENEMY_BULLET
            );
          }
          
          return; // 提前退出，避免继续检测
        }
      }
    }
    
    // 检查边界
    if (this.x < 0 || this.x > GameConfig.BATTLE_WIDTH ||
        this.y < 0 || this.y > GameConfig.DESIGN_HEIGHT) {
      this.destroyed = true;
    }
  }
  
  /**
   * 检查是否在视锥内
   */
  isInView(viewLeft, viewRight, viewTop, viewBottom) {
    const margin = this.radius * 3; // 考虑尾迹大小
    return this.x + margin >= viewLeft && 
           this.x - margin <= viewRight &&
           this.y + margin >= viewTop && 
           this.y - margin <= viewBottom;
  }
  
  /**
   * 渲染子弹（带视锥剔除，优化：由调用者统一管理save/restore）
   */
  render(viewLeft = -Infinity, viewRight = Infinity, viewTop = -Infinity, viewBottom = Infinity) {
    if (this.destroyed) return;
    
    // 视锥剔除：只渲染屏幕内的子弹
    if (!this.isInView(viewLeft, viewRight, viewTop, viewBottom)) {
      return;
    }
    
    // 优化：不在这里save/restore，由EnemyTank统一管理，减少上下文切换
    
    // 绘制尾迹（多层发光效果）
    const trailGradient = this.ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2.5);
    trailGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.ENEMY_BULLET, 0.4));
    trailGradient.addColorStop(0.6, ColorUtils.hexToCanvas(GameColors.ENEMY_BULLET, 0.2));
    trailGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.ENEMY_BULLET, 0));
    this.ctx.fillStyle = trailGradient;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius * 2.5, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 绘制外层发光
    this.ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_BULLET, 0.5);
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius * 1.8, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 绘制中层发光
    this.ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_BULLET, 0.7);
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius * 1.3, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 绘制子弹主体（渐变）
    const bodyGradient = this.ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    bodyGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.8));
    bodyGradient.addColorStop(0.4, ColorUtils.hexToCanvas(GameColors.ENEMY_BULLET, 1));
    bodyGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.9));
    this.ctx.fillStyle = bodyGradient;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 绘制高光
    this.ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.7);
    this.ctx.beginPath();
    this.ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.5, 0, Math.PI * 2);
    this.ctx.fill();
  }
}

