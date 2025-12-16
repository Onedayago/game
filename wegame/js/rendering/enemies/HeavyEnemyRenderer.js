/**
 * 重型敌人渲染器
 * 负责重型敌人的视觉绘制（带离屏缓存优化）
 */

import { ColorUtils } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class HeavyEnemyRenderer {
  // 离屏Canvas缓存
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _cacheSize = 0;
  static _initialized = false;
  
  /**
   * 初始化重型敌人渲染缓存
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
      console.warn('重型敌人渲染缓存初始化失败:', e);
      this._initialized = false;
    }
  }
  
  /**
   * 绘制到缓存Canvas
   */
  static drawToCache(ctx, size, centerX, centerY) {
    ctx.save();
    ctx.translate(centerX, centerY);
    
    const color = ColorUtils.hexToCanvas(0xcc4444);
    const darkColor = ColorUtils.hexToCanvas(0x992222);
    const lightColor = ColorUtils.hexToCanvas(0xff6666);
    const accentColor = ColorUtils.hexToCanvas(0xff8888);
    const armorColor = ColorUtils.hexToCanvas(0x771111);
    
    // === 多层阴影（更厚重）===
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 4, -size / 2 + 5, size - 8, size - 5, size * 0.15);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 5, -size / 2 + 6, size - 10, size - 7, size * 0.12);
    ctx.fill();
    
    // === 主体（厚重设计）===
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-size / 2, -size / 2, size, size, size * 0.15);
    ctx.fill();
    
    // 厚重边框
    ctx.strokeStyle = armorColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    // === 多层装甲板 ===
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 4, -size / 2 + 4, size - 8, size - 8, size * 0.1);
    ctx.fill();
    
    ctx.strokeStyle = armorColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // 第二层装甲
    ctx.fillStyle = armorColor;
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 6, -size / 2 + 6, size - 12, size - 12, size * 0.08);
    ctx.fill();
    
    // === 装甲板铆钉细节 ===
    const rivetCount = 3;
    for (let i = 0; i < rivetCount; i++) {
      const rx = -size * 0.3 + (size * 0.6 / (rivetCount - 1)) * i;
      const ry = -size * 0.25;
      
      // 铆钉阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.arc(rx + 1, ry + 1, size * 0.04, 0, Math.PI * 2);
      ctx.fill();
      
      // 铆钉
      ctx.fillStyle = ColorUtils.hexToCanvas(0x554444);
      ctx.beginPath();
      ctx.arc(rx, ry, size * 0.04, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = ColorUtils.hexToCanvas(0x776666, 0.6);
      ctx.beginPath();
      ctx.arc(rx, ry, size * 0.025, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // === 顶部高光 ===
    ctx.fillStyle = lightColor;
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 6, -size / 2 + 6, size - 12, size * 0.35, size * 0.08);
    ctx.fill();
    
    // === 前装甲板（更厚）===
    ctx.fillStyle = armorColor;
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 8, -size * 0.12, size - 16, size * 0.24, size * 0.06);
    ctx.fill();
    
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // === 侧边装甲条纹 ===
    for (let i = 0; i < 2; i++) {
      const sy = -size * 0.2 + i * size * 0.4;
      ctx.fillStyle = darkColor;
      ctx.fillRect(-size / 2 + 10, sy, size - 20, 2);
      ctx.fillStyle = accentColor;
      ctx.fillRect(-size / 2 + 10, sy, size - 20, 1);
    }
    
    // === 中心威胁标识（更大更明显）===
    const indicatorRadius = size * 0.15;
    
    // 外层辉光
    ctx.fillStyle = ColorUtils.hexToCanvas(0xff0000, 0.4);
    ctx.beginPath();
    ctx.arc(0, 0, indicatorRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 中层
    ctx.fillStyle = ColorUtils.hexToCanvas(0xff4444, 0.95);
    ctx.beginPath();
    ctx.arc(0, 0, indicatorRadius * 0.85, 0, Math.PI * 2);
    ctx.fill();
    
    // 内层
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.8);
    ctx.beginPath();
    ctx.arc(0, 0, indicatorRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  /**
   * 渲染重型敌人
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

