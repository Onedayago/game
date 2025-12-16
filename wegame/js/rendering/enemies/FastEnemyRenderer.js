/**
 * 快速敌人渲染器
 * 负责快速敌人的视觉绘制（带离屏缓存优化）
 */

import { ColorUtils } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class FastEnemyRenderer {
  // 离屏Canvas缓存
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _cacheSize = 0;
  static _initialized = false;
  
  /**
   * 初始化快速敌人渲染缓存
   */
  static initCache(size) {
    if (this._initialized && this._cacheSize === size) {
      return;
    }
    
    const canvasSize = Math.ceil(size * 1.2);
    
    this._cachedCanvas = wx.createCanvas();
    this._cachedCanvas.width = canvasSize;
    this._cachedCanvas.height = canvasSize;
    
    this._cachedCtx = this._cachedCanvas.getContext('2d');
    this._cacheSize = size;
    
    polyfillRoundRect(this._cachedCtx);
    this.drawToCache(this._cachedCtx, size, canvasSize / 2, canvasSize / 2);
    
    this._initialized = true;
  }
  
  /**
   * 绘制到缓存Canvas
   */
  static drawToCache(ctx, size, centerX, centerY) {
    ctx.save();
    ctx.translate(centerX, centerY);
    
    const color = ColorUtils.hexToCanvas(0x4488ff);
    const darkColor = ColorUtils.hexToCanvas(0x2d5aa0);
    const lightColor = ColorUtils.hexToCanvas(0x66aaff);
    const accentColor = ColorUtils.hexToCanvas(0x88ccff);
    
    // === 多层阴影 ===
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 3, -size / 2 + 4, size - 6, size - 4, size * 0.2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 4, -size / 2 + 5, size - 8, size - 6, size * 0.18);
    ctx.fill();
    
    // === 主体（流线型设计）===
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-size / 2, -size / 2, size, size, size * 0.2);
    ctx.fill();
    
    // 边框
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // === 侧边装甲条 ===
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 2, -size / 2 + size * 0.3, size - 4, size * 0.15, size * 0.05);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 2, size / 2 - size * 0.45, size - 4, size * 0.15, size * 0.05);
    ctx.fill();
    
    // === 顶部高光（流线型）===
    ctx.fillStyle = lightColor;
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 3, -size / 2 + 3, size - 6, size * 0.35, size * 0.15);
    ctx.fill();
    
    // === 前部细节（速度感）===
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 4, -size * 0.15, size * 0.4, size * 0.3, size * 0.08);
    ctx.fill();
    
    // === 侧边装饰线条 ===
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-size * 0.15, -size * 0.2);
    ctx.lineTo(-size * 0.15, size * 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 0.15, -size * 0.2);
    ctx.lineTo(size * 0.15, size * 0.2);
    ctx.stroke();
    
    // === 中心标识（速度符号）===
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.8);
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    ctx.restore();
  }
  
  /**
   * 渲染快速敌人
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

