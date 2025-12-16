/**
 * 狙击塔渲染器
 * 负责狙击塔的视觉绘制
 */

import { GameConfig } from '../config/GameConfig';
import { ColorUtils, GameColors } from '../config/Colors';
import { polyfillRoundRect } from '../utils/CanvasUtils';

export class SniperTowerRenderer {
  // 离屏Canvas缓存（按尺寸和等级缓存）
  static _cachedCanvases = {}; // { 'size_level': canvas }
  static _cachedCtxs = {}; // { 'size_level': ctx }
  
  /**
   * 获取缓存键
   */
  static getCacheKey(size, level) {
    return `${size}_${level}`;
  }
  
  /**
   * 初始化狙击塔渲染缓存
   */
  static initCache(size, level = 1) {
    const cacheKey = this.getCacheKey(size, level);
    
    if (this._cachedCanvases[cacheKey]) {
      return; // 已经初始化
    }
    
    try {
      const canvasSize = Math.ceil(size * 1.2);
      
      const canvas = wx.createCanvas();
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      
      const ctx = canvas.getContext('2d');
      this._cachedCanvases[cacheKey] = canvas;
      this._cachedCtxs[cacheKey] = ctx;
      
      // 清空缓存Canvas
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      
      // 绘制狙击塔到缓存（居中）
      polyfillRoundRect(ctx);
      ctx.save();
      ctx.translate(canvasSize / 2, canvasSize / 2);
      this.drawSniperTowerToCache(ctx, size, level);
      ctx.restore();
    } catch (e) {
      console.warn('狙击塔渲染缓存初始化失败:', e);
    }
  }
  
  /**
   * 绘制狙击塔到缓存Canvas
   */
  static drawSniperTowerToCache(ctx, size, level) {
    const baseWidth = size * 0.65;
    const baseHeight = size * 0.35;
    const barrelLength = size * 0.65;
    const barrelWidth = size * 0.14;
    const scopeRadius = size * 0.16;
    
    // 获取颜色
    const baseColor = ColorUtils.hexToCanvas(GameColors.SNIPER_BASE);
    const towerColor = ColorUtils.hexToCanvas(GameColors.SNIPER_TOWER);
    const detailColor = ColorUtils.hexToCanvas(GameColors.SNIPER_DETAIL);
    
    // 1. 绘制阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.roundRect(-baseWidth / 2 + 2, -baseHeight / 2 + 3, baseWidth, baseHeight, 3);
    ctx.fill();
    
    // 2. 绘制底座（低矮隐蔽）
    const baseGradient = ctx.createLinearGradient(-baseWidth / 2, -baseHeight / 2, -baseWidth / 2, baseHeight / 2);
    baseGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.SNIPER_BASE, 0.95));
    baseGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.SNIPER_BASE, 0.85));
    baseGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.SNIPER_BASE, 0.7));
    ctx.fillStyle = baseGradient;
    ctx.beginPath();
    ctx.roundRect(-baseWidth / 2, -baseHeight / 2, baseWidth, baseHeight, 4);
    ctx.fill();
    
    // 底座边框（细线）
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.SNIPER_DETAIL, 0.5);
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // 3. 绘制炮管（细长）
    const barrelGradient = ctx.createLinearGradient(0, -barrelWidth / 2, barrelLength, -barrelWidth / 2);
    barrelGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.SNIPER_TOWER, 0.9));
    barrelGradient.addColorStop(0.4, ColorUtils.hexToCanvas(GameColors.SNIPER_TOWER, 0.85));
    barrelGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.SNIPER_DETAIL, 0.8));
    ctx.fillStyle = barrelGradient;
    ctx.fillRect(0, -barrelWidth / 2, barrelLength, barrelWidth);
    
    // 炮管高光
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.4);
    ctx.fillRect(0, -barrelWidth / 2, barrelLength * 0.25, barrelWidth * 0.25);
    
    // 4. 绘制瞄准镜（在炮管上方）
    const scopeY = -barrelWidth * 0.8;
    const scopeGradient = ctx.createRadialGradient(barrelLength * 0.5, scopeY, 0, barrelLength * 0.5, scopeY, scopeRadius);
    scopeGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.SNIPER_DETAIL, 0.95));
    scopeGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.SNIPER_TOWER, 0.9));
    scopeGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.SNIPER_BASE, 0.8));
    ctx.fillStyle = scopeGradient;
    ctx.beginPath();
    ctx.arc(barrelLength * 0.5, scopeY, scopeRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 瞄准镜边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.SNIPER_DETAIL, 0.9);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 瞄准镜中心十字
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xffffff, 0.6);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(barrelLength * 0.5 - scopeRadius * 0.4, scopeY);
    ctx.lineTo(barrelLength * 0.5 + scopeRadius * 0.4, scopeY);
    ctx.moveTo(barrelLength * 0.5, scopeY - scopeRadius * 0.4);
    ctx.lineTo(barrelLength * 0.5, scopeY + scopeRadius * 0.4);
    ctx.stroke();
    
    // 5. 等级装饰
    if (level >= 2) {
      // 二级：添加炮管消音器
      ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.SNIPER_BASE, 0.9);
      ctx.fillRect(barrelLength * 0.8, -barrelWidth * 0.7, barrelLength * 0.2, barrelWidth * 1.4);
      
      // 消音器细节
      ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.SNIPER_DETAIL, 0.7);
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const x = barrelLength * (0.85 + i * 0.05);
        ctx.beginPath();
        ctx.moveTo(x, -barrelWidth * 0.7);
        ctx.lineTo(x, barrelWidth * 0.7);
        ctx.stroke();
      }
    }
    
    if (level >= 3) {
      // 三级：添加双瞄准镜和更多细节
      // 第二个瞄准镜
      const scope2Y = barrelWidth * 0.8;
      const scope2Gradient = ctx.createRadialGradient(barrelLength * 0.3, scope2Y, 0, barrelLength * 0.3, scope2Y, scopeRadius * 0.8);
      scope2Gradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.SNIPER_DETAIL, 0.9));
      scope2Gradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.SNIPER_TOWER, 0.8));
      ctx.fillStyle = scope2Gradient;
      ctx.beginPath();
      ctx.arc(barrelLength * 0.3, scope2Y, scopeRadius * 0.8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.SNIPER_DETAIL, 0.8);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // 炮管细节线条
      ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.SNIPER_DETAIL, 0.5);
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 4; i++) {
        const x = barrelLength * (0.15 + i * 0.15);
        ctx.beginPath();
        ctx.moveTo(x, -barrelWidth / 2);
        ctx.lineTo(x, barrelWidth / 2);
        ctx.stroke();
      }
    }
  }
  
  /**
   * 从缓存渲染狙击塔
   */
  static renderFromCache(ctx, x, y, size, level, angle = 0) {
    const cacheKey = this.getCacheKey(size, level);
    const cachedCanvas = this._cachedCanvases[cacheKey];
    
    if (!cachedCanvas) {
      this.initCache(size, level);
      return this.renderFromCache(ctx, x, y, size, level, angle);
    }
    
    const canvasSize = cachedCanvas.width;
    const halfSize = canvasSize * 0.5;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    ctx.drawImage(
      cachedCanvas,
      -halfSize,
      -halfSize,
      canvasSize,
      canvasSize
    );
    
    ctx.restore();
  }
  
  /**
   * 渲染狙击塔
   * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
   * @param {number} x - Canvas 坐标系 X
   * @param {number} y - Canvas 坐标系 Y（从上往下）
   * @param {number} size - 尺寸
   * @param {number} level - 等级
   * @param {number} angle - 旋转角度（弧度，0为向右）
   */
  static render(ctx, x, y, size, level = 1, angle = 0) {
    // 初始化缓存（如果未初始化）
    if (!this._cachedCanvases[this.getCacheKey(size, level)]) {
      this.initCache(size, level);
    }
    
    this.renderFromCache(ctx, x, y, size, level, angle);
  }
}

