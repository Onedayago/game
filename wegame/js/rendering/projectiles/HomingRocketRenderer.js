/**
 * 追踪火箭渲染器
 * 负责追踪火箭的视觉绘制（带离屏缓存优化）
 */

import { ColorUtils, GameColors } from '../../config/Colors';

export class HomingRocketRenderer {
  // 离屏Canvas缓存（只缓存主体，尾迹动态绘制）
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _cacheRadius = 0;
  static _initialized = false;
  
  /**
   * 初始化火箭渲染缓存（只缓存主体，尾迹动态绘制）
   */
  static initCache(radius) {
    if (this._initialized && this._cacheRadius === radius) {
      return;
    }
    
    try {
      const canvasSize = Math.ceil(radius * 3);
      
      this._cachedCanvas = wx.createCanvas();
      this._cachedCanvas.width = canvasSize;
      this._cachedCanvas.height = canvasSize;
      
      this._cachedCtx = this._cachedCanvas.getContext('2d');
      this._cacheRadius = radius;
      
      // 清空缓存Canvas
      this._cachedCtx.clearRect(0, 0, canvasSize, canvasSize);
      
      // 绘制火箭主体到缓存（居中，角度=0）
      this.drawRocketBodyToCache(this._cachedCtx, radius, canvasSize / 2, canvasSize / 2);
      
      this._initialized = true;
    } catch (e) {
      console.warn('追踪火箭渲染缓存初始化失败:', e);
      this._initialized = false;
    }
  }
  
  /**
   * 绘制火箭主体到缓存Canvas（角度=0，向右）
   */
  static drawRocketBodyToCache(ctx, radius, centerX, centerY) {
    // 绘制火箭主体（椭圆形，无发光效果）
    const bodyGradient = ctx.createLinearGradient(centerX - radius * 0.6, centerY, centerX + radius * 0.6, centerY);
    bodyGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 1));
    bodyGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.ROCKET_BULLET, 1));
    bodyGradient.addColorStop(1, ColorUtils.hexToCanvas(0xffffff, 1));
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius * 0.7, radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制头部高光
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.8);
    ctx.beginPath();
    ctx.ellipse(centerX + radius * 0.3, centerY, radius * 0.2, radius * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * 从缓存渲染火箭主体
   */
  static renderBodyFromCache(ctx, x, y, radius, angle) {
    if (!this._cachedCanvas) return;
    
    const canvasSize = this._cachedCanvas.width;
    const halfSize = canvasSize * 0.5;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    ctx.drawImage(
      this._cachedCanvas,
      -halfSize,
      -halfSize,
      canvasSize,
      canvasSize
    );
    
    ctx.restore();
  }
  
  /**
   * 渲染尾迹（动态绘制，不缓存）
   */
  static renderTrail(ctx, lastX, lastY, currentX, currentY, radius) {
    const dx = currentX - lastX;
    const dy = currentY - lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 0.1) {
      const trailAngle = Math.atan2(dy, dx);
      
      ctx.save();
      ctx.translate(lastX, lastY);
      ctx.rotate(trailAngle);
      
      // 简洁尾迹
      const trailGradient = ctx.createLinearGradient(0, 0, Math.min(dist, radius * 1.5), 0);
      trailGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.ROCKET_BULLET, 0.4));
      trailGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.ROCKET_BULLET, 0));
      
      ctx.strokeStyle = trailGradient;
      ctx.lineWidth = radius * 0.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.min(dist, radius * 1.5), 0);
      ctx.stroke();
      
      ctx.restore();
    }
  }
  
  /**
   * 渲染追踪火箭（主体+尾迹）
   */
  static render(ctx, x, y, radius, angle, lastX, lastY) {
    // 渲染尾迹（动态）
    if (lastX !== undefined && lastY !== undefined) {
      this.renderTrail(ctx, lastX, lastY, x, y, radius);
    }
    
    // 渲染主体（从缓存）
    if (!this._initialized || this._cacheRadius !== radius) {
      this.initCache(radius);
    }
    this.renderBodyFromCache(ctx, x, y, radius, angle);
  }
}

