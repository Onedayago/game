/**
 * 敌人子弹
 */

import { GameConfig } from '../config/GameConfig';
import { EnemyBulletConfig } from '../config/enemies/EnemyBulletConfig';
import { ColorUtils, GameColors } from '../config/Colors';
import { GameContext } from '../core/GameContext';
import { EnemyBulletRenderer } from '../rendering/projectiles/EnemyBulletRenderer';
import { LogUtils } from '../utils/LogUtils';

export class EnemyBullet {
  // 离屏Canvas缓存（静态）
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _cacheRadius = 0;
  static _initialized = false;
  
  constructor(ctx, x, y, angle, damage) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.damage = damage;
    this.speed = EnemyBulletConfig.SPEED;
    this.radius = EnemyBulletConfig.RADIUS;
    this.destroyed = false;
    this.lifetime = 3000; // 3秒
    this.age = 0;
    
    // 计算速度分量
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }
  
  /**
   * 初始化子弹渲染缓存
   */
  static initCache(radius) {
    if (this._initialized && this._cacheRadius === radius) {
      return;
    }
    
    const canvasSize = Math.ceil(radius * 6);
    
    this._cachedCanvas = wx.createCanvas();
    this._cachedCanvas.width = canvasSize;
    this._cachedCanvas.height = canvasSize;
    
    this._cachedCtx = this._cachedCanvas.getContext('2d');
    this._cacheRadius = radius;
    
    this._cachedCtx.clearRect(0, 0, canvasSize, canvasSize);
    
    this.drawBulletToCache(this._cachedCtx, radius, canvasSize / 2, canvasSize / 2);
    
    this._initialized = true;
  }
  
  /**
   * 绘制子弹到缓存Canvas
   */
  static drawBulletToCache(ctx, radius, centerX, centerY) {
    // 绘制尾迹（多层发光效果）
    const trailGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 2.5);
    trailGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.ENEMY_BULLET, 0.4));
    trailGradient.addColorStop(0.6, ColorUtils.hexToCanvas(GameColors.ENEMY_BULLET, 0.2));
    trailGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.ENEMY_BULLET, 0));
    ctx.fillStyle = trailGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制外层发光
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_BULLET, 0.5);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.8, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制中层发光
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_BULLET, 0.7);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制子弹主体（渐变）
    const bodyGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    bodyGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.8));
    bodyGradient.addColorStop(0.4, ColorUtils.hexToCanvas(GameColors.ENEMY_BULLET, 1));
    bodyGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.9));
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制高光
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.7);
    ctx.beginPath();
    ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * 从缓存渲染子弹
   */
  static renderFromCache(ctx, x, y, radius) {
    if (!this._cachedCanvas) return;
    
    const canvasSize = this._cachedCanvas.width;
    const halfSize = canvasSize * 0.5;
    
    ctx.drawImage(
      this._cachedCanvas,
      x - halfSize,
      y - halfSize,
      canvasSize,
      canvasSize
    );
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
    
    // 检查边界（使用战斗区域的实际尺寸）
    if (this.x < 0 || this.x > GameConfig.BATTLE_WIDTH ||
        this.y < 0 || this.y > GameConfig.BATTLE_HEIGHT) {
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
   * 渲染子弹（带视锥剔除，优化：使用离屏Canvas缓存，应用战场偏移）
   */
  render(viewLeft = -Infinity, viewRight = Infinity, viewTop = -Infinity, viewBottom = Infinity, offsetX = 0, offsetY = 0) {
    
   
    if (this.destroyed) return;
  
    // 视锥剔除：只渲染屏幕内的子弹（viewLeft 等已经是世界坐标）
    if (!this.isInView(viewLeft, viewRight, viewTop, viewBottom)) {
      
      return;
    }
    
    // 使用渲染器渲染 - 应用战场偏移
    EnemyBulletRenderer.render(this.ctx, this.x + offsetX, this.y + offsetY, this.radius);
  }
}

