/**
 * 敌人子弹渲染器
 * 负责敌人子弹的视觉绘制（带离屏缓存优化）
 */

import { ColorUtils, GameColors } from '../../config/Colors';

export class EnemyBulletRenderer {
  // 离屏Canvas缓存
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _cacheRadius = 0;
  static _initialized = false;
  
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
   * 渲染敌人子弹
   */
  static render(ctx, x, y, radius) {
    if (!this._initialized || this._cacheRadius !== radius) {
      this.initCache(radius);
    }
    
    this.renderFromCache(ctx, x, y, radius);
  }
}

