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
      console.warn('快速敌人渲染缓存初始化失败:', e);
      this._initialized = false;
    }
  }
  
  /**
   * 绘制到缓存Canvas
   */
  static drawToCache(ctx, size, centerX, centerY) {
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // 快速敌人：较小的蓝色坦克
    const color = ColorUtils.hexToCanvas(0x4488ff);
    
    // 主体
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-size / 2, -size / 2, size, size, size * 0.2);
    ctx.fill();
    
    // 高光
    ctx.fillStyle = ColorUtils.hexToCanvas(0x66aaff);
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 2, -size / 2 + 2, size - 4, size * 0.3, size * 0.15);
    ctx.fill();
    
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

