/**
 * 飞行敌人渲染器
 * 负责飞行敌人的视觉绘制（带离屏缓存优化）
 */

import { ColorUtils } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class FlyingEnemyRenderer {
  // 离屏Canvas缓存
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _cacheSize = 0;
  static _initialized = false;
  
  /**
   * 初始化飞行敌人渲染缓存
   */
  static initCache(size) {
    if (this._initialized && this._cacheSize === size) {
      return;
    }
    
    try {
      const canvasSize = Math.ceil(size * 1.2);
      
      if (typeof wx !== 'undefined') {
        this._cachedCanvas = wx.createCanvas();
        this._cachedCanvas.width = canvasSize;
        this._cachedCanvas.height = canvasSize;
      } else {
        this._cachedCanvas = document.createElement('canvas');
        this._cachedCanvas.width = canvasSize;
        this._cachedCanvas.height = canvasSize;
      }
      
      this._cachedCtx = this._cachedCanvas.getContext('2d');
      this._cacheSize = size;
      
      polyfillRoundRect(this._cachedCtx);
      this.drawToCache(this._cachedCtx, size, canvasSize / 2, canvasSize / 2);
      
      this._initialized = true;
    } catch (e) {
      console.warn('飞行敌人渲染缓存初始化失败:', e);
      this._initialized = false;
    }
  }
  
  /**
   * 绘制到缓存Canvas
   */
  static drawToCache(ctx, size, centerX, centerY) {
    ctx.save();
    ctx.translate(centerX, centerY);
    
    const color = ColorUtils.hexToCanvas(0xaa44ff);
    const darkColor = ColorUtils.hexToCanvas(0x8822cc);
    const lightColor = ColorUtils.hexToCanvas(0xcc66ff);
    const accentColor = ColorUtils.hexToCanvas(0xdd88ff);
    const glowColor = ColorUtils.hexToCanvas(0xaa44ff, 0.3);
    
    const radius = size / 2;
    
    // === 外层光晕（飞行效果）===
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.15, 0, Math.PI * 2);
    ctx.fill();
    
    // === 阴影（飞行器投影）===
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.3, radius * 0.9, radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // === 主体（飞行器核心）===
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 边框
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // === 内圈（能量核心）===
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2);
    ctx.fill();
    
    // === 能量环 ===
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    
    // === 高光（顶部光源）===
    ctx.fillStyle = lightColor;
    ctx.beginPath();
    ctx.arc(-radius * 0.25, -radius * 0.25, radius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    
    // === 推进器（底部）===
    const thrusterY = radius * 0.4;
    const thrusterWidth = radius * 0.5;
    const thrusterHeight = radius * 0.2;
    
    // 推进器主体
    ctx.fillStyle = ColorUtils.hexToCanvas(0x6622aa);
    ctx.beginPath();
    ctx.roundRect(-thrusterWidth / 2, thrusterY, thrusterWidth, thrusterHeight, thrusterHeight / 2);
    ctx.fill();
    
    // 推进器光效
    ctx.fillStyle = ColorUtils.hexToCanvas(0xff66ff, 0.6);
    ctx.beginPath();
    ctx.roundRect(-thrusterWidth / 2 + 2, thrusterY + 2, thrusterWidth - 4, thrusterHeight - 4, thrusterHeight / 2);
    ctx.fill();
    
    // === 侧翼（飞行器特征）===
    const wingLength = radius * 0.6;
    const wingWidth = radius * 0.15;
    
    // 左翼
    ctx.fillStyle = ColorUtils.hexToCanvas(0xaa44ff, 0.7);
    ctx.beginPath();
    ctx.roundRect(-radius * 0.7, -wingWidth / 2, wingLength, wingWidth, wingWidth / 2);
    ctx.fill();
    
    // 右翼
    ctx.beginPath();
    ctx.roundRect(radius * 0.1, -wingWidth / 2, wingLength, wingWidth, wingWidth / 2);
    ctx.fill();
    
    // === 中心能量核心 ===
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.9);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // 核心内点
    ctx.fillStyle = ColorUtils.hexToCanvas(0xdd88ff);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  /**
   * 渲染飞行敌人
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

