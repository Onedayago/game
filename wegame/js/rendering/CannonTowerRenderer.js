/**
 * 加农炮塔渲染器
 * 负责加农炮塔的视觉绘制
 */

import { GameConfig } from '../config/GameConfig';
import { ColorUtils, GameColors } from '../config/Colors';
import { polyfillRoundRect } from '../utils/CanvasUtils';

export class CannonTowerRenderer {
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
   * 初始化加农炮塔渲染缓存
   */
  static initCache(size, level = 1) {
    const cacheKey = this.getCacheKey(size, level);
    
    if (this._cachedCanvases[cacheKey]) {
      return; // 已经初始化
    }
    
    const canvasSize = Math.ceil(size * 1.2);
    
    const canvas = wx.createCanvas();
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    const ctx = canvas.getContext('2d');
    this._cachedCanvases[cacheKey] = canvas;
    this._cachedCtxs[cacheKey] = ctx;
    
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    polyfillRoundRect(ctx);
    ctx.save();
    ctx.translate(canvasSize / 2, canvasSize / 2);
    this.drawCannonTowerToCache(ctx, size, level);
    ctx.restore();
  }
  
  /**
   * 绘制加农炮塔到缓存Canvas
   */
  static drawCannonTowerToCache(ctx, size, level) {
    const baseWidth = size * 0.75;
    const baseHeight = size * 0.4;
    const barrelLength = size * 0.55;
    const barrelWidth = size * 0.18;
    const turretRadius = size * 0.25;
    
    // 获取颜色
    const baseColor = ColorUtils.hexToCanvas(GameColors.CANNON_BASE);
    const towerColor = ColorUtils.hexToCanvas(GameColors.CANNON_TOWER);
    const detailColor = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL);
    
    // 1. 绘制阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.roundRect(-baseWidth / 2 + 3, -baseHeight / 2 + 4, baseWidth, baseHeight, 4);
    ctx.fill();
    
    // 2. 绘制底座
    const baseGradient = ctx.createLinearGradient(-baseWidth / 2, -baseHeight / 2, -baseWidth / 2, baseHeight / 2);
    baseGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.CANNON_BASE, 0.95));
    baseGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.CANNON_BASE, 0.7));
    ctx.fillStyle = baseGradient;
    ctx.beginPath();
    ctx.roundRect(-baseWidth / 2, -baseHeight / 2, baseWidth, baseHeight, 5);
    ctx.fill();
    
    // 底座边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.6);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // 3. 绘制炮塔转台
    const turretGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, turretRadius);
    turretGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.CANNON_TOWER, 0.95));
    turretGradient.addColorStop(0.7, ColorUtils.hexToCanvas(GameColors.CANNON_TOWER, 0.85));
    turretGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.7));
    ctx.fillStyle = turretGradient;
    ctx.beginPath();
    ctx.arc(0, 0, turretRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 转台边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.8);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 4. 绘制炮管（基础部分，旋转部分在render方法中绘制）
    // 炮管基础
    const barrelBaseGradient = ctx.createLinearGradient(0, -barrelWidth / 2, barrelLength, -barrelWidth / 2);
    barrelBaseGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.CANNON_TOWER, 0.9));
    barrelBaseGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.85));
    barrelBaseGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.7));
    ctx.fillStyle = barrelBaseGradient;
    ctx.fillRect(0, -barrelWidth / 2, barrelLength, barrelWidth);
    
    // 炮管高光
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.3);
    ctx.fillRect(0, -barrelWidth / 2, barrelLength * 0.3, barrelWidth * 0.3);
    
    // 5. 等级装饰
    if (level >= 2) {
      // 二级：添加炮管加强环
      ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.9);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(barrelLength * 0.4, 0, barrelWidth * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    if (level >= 3) {
      // 三级：添加双加强环和细节
      ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.9);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(barrelLength * 0.6, 0, barrelWidth * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      
      // 炮管细节线条
      ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.6);
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const x = barrelLength * (0.2 + i * 0.2);
        ctx.beginPath();
        ctx.moveTo(x, -barrelWidth / 2);
        ctx.lineTo(x, barrelWidth / 2);
        ctx.stroke();
      }
    }
  }
  
  /**
   * 从缓存渲染加农炮塔
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
   * 渲染加农炮塔
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

