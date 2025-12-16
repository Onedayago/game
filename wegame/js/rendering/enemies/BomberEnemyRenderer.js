/**
 * 自爆敌人渲染器
 * 负责自爆敌人的视觉绘制（带离屏缓存优化）
 */

import { ColorUtils } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class BomberEnemyRenderer {
  // 离屏Canvas缓存
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _cacheSize = 0;
  static _initialized = false;
  
  /**
   * 初始化自爆敌人渲染缓存
   */
  static initCache(size) {
    if (this._initialized && this._cacheSize === size) {
      return;
    }
    
    try {
      const canvasSize = Math.ceil(size * 1.2);
      
      this._cachedCanvas = wx.createCanvas();
      this._cachedCanvas.width = canvasSize;
      this._cachedCanvas.height = canvasSize;
      
      this._cachedCtx = this._cachedCanvas.getContext('2d');
      this._cacheSize = size;
      
      polyfillRoundRect(this._cachedCtx);
      this.drawToCache(this._cachedCtx, size, canvasSize / 2, canvasSize / 2);
      
      this._initialized = true;
    } catch (e) {
      console.warn('自爆敌人渲染缓存初始化失败:', e);
      this._initialized = false;
    }
  }
  
  /**
   * 绘制到缓存Canvas
   */
  static drawToCache(ctx, size, centerX, centerY) {
    ctx.save();
    ctx.translate(centerX, centerY);
    
    const color = ColorUtils.hexToCanvas(0xff8844);
    const darkColor = ColorUtils.hexToCanvas(0xcc6622);
    const dangerColor = ColorUtils.hexToCanvas(0xff0000);
    const warningColor = ColorUtils.hexToCanvas(0xffff00);
    const glowColor = ColorUtils.hexToCanvas(0xff4444, 0.3);
    
    // === 危险光晕（闪烁效果的基础）===
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.roundRect(-size / 2 - 2, -size / 2 - 2, size + 4, size + 4, size * 0.12);
    ctx.fill();
    
    // === 多层阴影 ===
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 3, -size / 2 + 4, size - 6, size - 4, size * 0.1);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 4, -size / 2 + 5, size - 8, size - 6, size * 0.08);
    ctx.fill();
    
    // === 主体（危险橙色）===
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-size / 2, -size / 2, size, size, size * 0.1);
    ctx.fill();
    
    // 厚重边框（危险标识）
    ctx.strokeStyle = dangerColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    // === 内层装甲 ===
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 4, -size / 2 + 4, size - 8, size - 8, size * 0.08);
    ctx.fill();
    
    // === 警告条纹（危险标识）===
    const stripeCount = 3;
    const stripeHeight = (size - 12) / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      const sy = -size / 2 + 6 + i * stripeHeight;
      if (i % 2 === 0) {
        ctx.fillStyle = warningColor;
      } else {
        ctx.fillStyle = dangerColor;
      }
      ctx.fillRect(-size / 2 + 6, sy, size - 12, stripeHeight - 2);
    }
    
    // === 中心警告标识（X标记，更醒目）===
    const xSize = size * 0.4;
    const xThickness = size * 0.08;
    
    // X标记阴影
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = xThickness + 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-xSize / 2 + 1, -xSize / 2 + 1);
    ctx.lineTo(xSize / 2 + 1, xSize / 2 + 1);
    ctx.moveTo(xSize / 2 + 1, -xSize / 2 + 1);
    ctx.lineTo(-xSize / 2 + 1, xSize / 2 + 1);
    ctx.stroke();
    
    // X标记主体
    ctx.strokeStyle = dangerColor;
    ctx.lineWidth = xThickness;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-xSize / 2, -xSize / 2);
    ctx.lineTo(xSize / 2, xSize / 2);
    ctx.moveTo(xSize / 2, -xSize / 2);
    ctx.lineTo(-xSize / 2, xSize / 2);
    ctx.stroke();
    
    // X标记高光
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xffffff, 0.8);
    ctx.lineWidth = xThickness * 0.3;
    ctx.beginPath();
    ctx.moveTo(-xSize / 2, -xSize / 2);
    ctx.lineTo(xSize / 2, xSize / 2);
    ctx.stroke();
    
    // === 四角警告灯 ===
    const cornerRadius = size * 0.12;
    const corners = [
      { x: -size * 0.35, y: -size * 0.35 },
      { x: size * 0.35, y: -size * 0.35 },
      { x: -size * 0.35, y: size * 0.35 },
      { x: size * 0.35, y: size * 0.35 }
    ];
    
    for (const corner of corners) {
      // 外层光晕
      ctx.fillStyle = ColorUtils.hexToCanvas(0xff0000, 0.4);
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, cornerRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // 警告灯
      ctx.fillStyle = dangerColor;
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, cornerRadius * 0.7, 0, Math.PI * 2);
      ctx.fill();
      
      // 内层高光
      ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.9);
      ctx.beginPath();
      ctx.arc(corner.x - cornerRadius * 0.2, corner.y - cornerRadius * 0.2, cornerRadius * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // === 顶部高光（危险感）===
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffaa66, 0.6);
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 5, -size / 2 + 5, size - 10, size * 0.25, size * 0.06);
    ctx.fill();
    
    ctx.restore();
  }
  
  /**
   * 渲染自爆敌人
   */
  static render(ctx, x, y, size, angle = 0) {
    if (!this._initialized || this._cacheSize !== size) {
      this.initCache(size);
    }
    
    if (!this._cachedCanvas) return;
    
    const canvasSize = this._cachedCanvas.width;
    const halfSize = canvasSize * 0.5;
    
    ctx.save();
    ctx.translate(x, y);
    if (Math.abs(angle) > 0.01) {
      ctx.rotate(angle);
    }
    
    ctx.drawImage(
      this._cachedCanvas,
      -halfSize,
      -halfSize,
      canvasSize,
      canvasSize
    );
    
    ctx.restore();
  }
}

