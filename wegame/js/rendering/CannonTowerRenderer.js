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
    const baseWidth = size * 1.0; // 增大圆盘
    const baseHeight = size * 0.35;
    const barrelLength = size * 0.55;
    const barrelWidth = size * 0.18;
    const turretRadius = size * 0.25;
    
    // 获取颜色
    const baseColor = ColorUtils.hexToCanvas(GameColors.CANNON_BASE);
    const towerColor = ColorUtils.hexToCanvas(GameColors.CANNON_TOWER);
    const detailColor = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL);
    
    // 计算圆盘底座位置（圆盘在中心）
    const baseRadius = baseWidth / 2;
    const baseY = 0; // 圆盘中心在画布中心
    
    // 1. 绘制圆盘底座阴影
    
    // 第一层阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.arc(0, baseY + 4, baseRadius + 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 第二层阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.arc(0, baseY + 6, baseRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 2. 绘制圆盘底座（使用径向渐变增强立体感）
    const baseGradient = ctx.createRadialGradient(0, baseY, 0, 0, baseY, baseRadius);
    baseGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.CANNON_BASE, 0.95));
    baseGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.CANNON_BASE, 0.85));
    baseGradient.addColorStop(0.8, ColorUtils.hexToCanvas(GameColors.CANNON_BASE, 0.75));
    baseGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.CANNON_BASE, 0.65));
    ctx.fillStyle = baseGradient;
    ctx.beginPath();
    ctx.arc(0, baseY, baseRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 底座外边框（增强）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x0f172a, 1);
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    // 底座内部装饰环
    const innerRadius = baseRadius * 0.75;
    ctx.fillStyle = ColorUtils.hexToCanvas(0x475569, 0.95);
    ctx.beginPath();
    ctx.arc(0, baseY, innerRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.5);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // 底座装饰圆环（3个同心圆）
    for (let i = 0; i < 3; i++) {
      const ringRadius = baseRadius * (0.5 + i * 0.15);
      ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.3 - i * 0.1);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, baseY, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // 中心点装饰
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.6);
    ctx.beginPath();
    ctx.arc(0, baseY, baseRadius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // 3. 绘制炮塔转台（增强发光效果，位于圆盘中心）
    const turretY = baseY; // 位于圆盘中心
    
    // 外层光晕
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.25);
    ctx.beginPath();
    ctx.arc(0, turretY, turretRadius * 1.15, 0, Math.PI * 2);
    ctx.fill();
    
    const turretGradient = ctx.createRadialGradient(0, turretY, 0, 0, turretY, turretRadius);
    turretGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.CANNON_TOWER, 1));
    turretGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.CANNON_TOWER, 0.9));
    turretGradient.addColorStop(0.8, ColorUtils.hexToCanvas(GameColors.CANNON_TOWER, 0.85));
    turretGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.8));
    ctx.fillStyle = turretGradient;
    ctx.beginPath();
    ctx.arc(0, turretY, turretRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 转台边框（增强发光）
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 1);
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 6;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.5);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 转台对称装饰（4个方向的标记点）
    const markerRadius = turretRadius * 0.15;
    const markerDist = turretRadius * 0.7;
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i;
      const markerX = Math.cos(angle) * markerDist;
      const markerY = Math.sin(angle) * markerDist;
      
      // 外层光晕
      ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.3);
      ctx.beginPath();
      ctx.arc(markerX, markerY + turretY, markerRadius * 1.3, 0, Math.PI * 2);
      ctx.fill();
      
      // 标记点
      ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.9);
      ctx.beginPath();
      ctx.arc(markerX, markerY + turretY, markerRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 转台中心装饰环（对称）
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.6);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, turretY, turretRadius * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    
    // 4. 绘制炮管（基础部分，旋转部分在render方法中绘制，位于转台中心，对称设计）
    const barrelY = turretY; // 位于圆盘中心
    const barrelStartX = 0; // 炮管从转台中心开始，保持对称
    
    // 炮管外层光晕
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.2);
    ctx.beginPath();
    ctx.roundRect(barrelStartX - 2, barrelY - barrelWidth / 2 - 2, barrelLength + 4, barrelWidth + 4, barrelWidth / 2);
    ctx.fill();
    
    // 炮管基础（增强渐变，从转台中心开始）
    const barrelBaseGradient = ctx.createLinearGradient(barrelStartX, barrelY - barrelWidth / 2, barrelStartX + barrelLength, barrelY - barrelWidth / 2);
    barrelBaseGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.CANNON_TOWER, 0.95));
    barrelBaseGradient.addColorStop(0.2, ColorUtils.hexToCanvas(GameColors.CANNON_TOWER, 0.9));
    barrelBaseGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.CANNON_TOWER, 0.9));
    barrelBaseGradient.addColorStop(0.8, ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.9));
    barrelBaseGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.8));
    ctx.fillStyle = barrelBaseGradient;
    ctx.beginPath();
    ctx.roundRect(barrelStartX, barrelY - barrelWidth / 2, barrelLength, barrelWidth, barrelWidth / 2);
    ctx.fill();
    
    // 炮管高光（增强，对称）
    const barrelHighlightGradient = ctx.createLinearGradient(barrelStartX, barrelY - barrelWidth / 2, barrelStartX + barrelLength * 0.4, barrelY - barrelWidth / 2);
    barrelHighlightGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.5));
    barrelHighlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = barrelHighlightGradient;
    ctx.fillRect(barrelStartX, barrelY - barrelWidth / 2, barrelLength * 0.4, barrelWidth * 0.4);
    
    // 炮管边框（增强）
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.6);
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // 炮管与转台连接处装饰（对称）
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.7);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(barrelStartX, barrelY, barrelWidth * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    
    // 5. 等级装饰（对称设计）
    if (level >= 2) {
      // 二级：添加炮管加强环（对称位置）
      ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.9);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(barrelStartX + barrelLength * 0.4, barrelY, barrelWidth * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    if (level >= 3) {
      // 三级：添加双加强环和细节（对称）
      ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.9);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(barrelStartX + barrelLength * 0.6, barrelY, barrelWidth * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      
      // 炮管细节线条（对称）
      ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.6);
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const x = barrelStartX + barrelLength * (0.2 + i * 0.2);
        ctx.beginPath();
        ctx.moveTo(x, barrelY - barrelWidth / 2);
        ctx.lineTo(x, barrelY + barrelWidth / 2);
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

