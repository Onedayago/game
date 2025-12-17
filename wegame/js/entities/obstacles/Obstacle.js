/**
 * 障碍物
 */

import { GameConfig } from '../../config/GameConfig';
import { ColorUtils, GameColors } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class Obstacle {
  // 离屏Canvas缓存（按类型和尺寸缓存）
  static _cachedCanvases = {}; // { 'type_size': canvas }
  static _cachedCtxs = {}; // { 'type_size': ctx }
  static _initialized = {}; // { 'type_size': boolean }
  
  constructor(ctx, gridX, gridY) {
    this.ctx = ctx;
    this.gridX = gridX;
    this.gridY = gridY;
    
    // 计算世界坐标（格子中心）
    this.x = gridX * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    this.y = gridY * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    
    // 障碍物尺寸（略小于格子，留出边距）
    this.size = GameConfig.CELL_SIZE * 0.8;
    
    // 障碍物类型（随机选择）
    this.type = Math.floor(Math.random() * 3); // 0, 1, 2 三种类型
    
    // 初始化缓存（如果未初始化）
    const cacheKey = this.getCacheKey();
    if (!Obstacle._initialized[cacheKey]) {
      Obstacle.initCache(this.type, this.size);
    }
  }
  
  /**
   * 获取缓存键
   */
  getCacheKey() {
    return `${this.type}_${this.size}`;
  }
  
  /**
   * 初始化障碍物渲染缓存
   */
  static initCache(type, size) {
    const cacheKey = `${type}_${size}`;
    
    if (this._initialized[cacheKey]) {
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
    
    switch (type) {
      case 0:
        this.drawRockToCache(ctx, size);
        break;
      case 1:
        this.drawBarrelToCache(ctx, size);
        break;
      case 2:
        this.drawCrateToCache(ctx, size);
        break;
    }
    
    ctx.restore();
    this._initialized[cacheKey] = true;
  }
  
  /**
   * 从缓存渲染障碍物
   */
  static renderFromCache(ctx, x, y, type, size) {
    const cacheKey = `${type}_${size}`;
    const cachedCanvas = this._cachedCanvases[cacheKey];
    
    if (!cachedCanvas) return;
    
    const canvasSize = cachedCanvas.width;
    const halfSize = canvasSize * 0.5;
    
    ctx.drawImage(
      cachedCanvas,
      x - halfSize,
      y - halfSize,
      canvasSize,
      canvasSize
    );
  }
  
  /**
   * 渲染障碍物（使用离屏Canvas缓存）
   */
  render(offsetX = 0, offsetY = 0) {
    const renderX = this.x + offsetX;
    const renderY = this.y + offsetY;
    
    // 使用缓存渲染
    Obstacle.renderFromCache(this.ctx, renderX, renderY, this.type, this.size);
  }
  
  /**
   * 绘制岩石到缓存（相对于中心点）
   */
  static drawRockToCache(ctx, size) {
    // 主阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(size * 0.1, size * 0.1, size * 0.45, 0, Math.PI * 2);
    ctx.fill();
    
    // 主体（深灰色）
    const gradient = ctx.createRadialGradient(
      -size * 0.2, -size * 0.2, 0,
      0, 0, size * 0.5
    );
    gradient.addColorStop(0, ColorUtils.hexToCanvas(0x4a5568, 0.9));
    gradient.addColorStop(1, ColorUtils.hexToCanvas(0x2d3748, 0.9));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // 高光
    ctx.fillStyle = ColorUtils.hexToCanvas(0x718096, 0.6);
    ctx.beginPath();
    ctx.arc(-size * 0.15, -size * 0.15, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // 边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x1a202c, 0.8);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  /**
   * 绘制木桶到缓存（相对于中心点）
   */
  static drawBarrelToCache(ctx, size) {
    const width = size * 0.6;
    const height = size * 0.7;
    
    // 阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(size * 0.05, size * 0.05, width * 0.5, height * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 主体（棕色）
    const gradient = ctx.createLinearGradient(-width / 2, -height / 2, -width / 2, height / 2);
    gradient.addColorStop(0, ColorUtils.hexToCanvas(0x744210, 0.95));
    gradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x5a3410, 0.95));
    gradient.addColorStop(1, ColorUtils.hexToCanvas(0x3d2410, 0.95));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, width * 0.5, height * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 桶箍（金属环）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x4a5568, 0.9);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, -height * 0.2, width * 0.5, height * 0.05, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, height * 0.2, width * 0.5, height * 0.05, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, width * 0.5, height * 0.05, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // 边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x1a202c, 0.8);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, width * 0.5, height * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  /**
   * 绘制木箱到缓存（相对于中心点）
   */
  static drawCrateToCache(ctx, size) {
    const width = size * 0.7;
    const height = size * 0.7;
    
    // 阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.roundRect(-width / 2 + size * 0.05, -height / 2 + size * 0.05, width, height, size * 0.1);
    ctx.fill();
    
    // 主体（木色）
    const gradient = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2);
    gradient.addColorStop(0, ColorUtils.hexToCanvas(0x8b6914, 0.95));
    gradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x6b4e0f, 0.95));
    gradient.addColorStop(1, ColorUtils.hexToCanvas(0x4a350a, 0.95));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(-width / 2, -height / 2, width, height, size * 0.1);
    ctx.fill();
    
    // 木板纹理（横线）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x5a3f0a, 0.8);
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const yPos = -height / 2 + (i + 1) * (height / 4);
      ctx.beginPath();
      ctx.moveTo(-width / 2 + size * 0.1, yPos);
      ctx.lineTo(width / 2 - size * 0.1, yPos);
      ctx.stroke();
    }
    
    // 木板纹理（竖线）
    for (let i = 0; i < 2; i++) {
      const xPos = -width / 2 + (i + 1) * (width / 3);
      ctx.beginPath();
      ctx.moveTo(xPos, -height / 2 + size * 0.1);
      ctx.lineTo(xPos, height / 2 - size * 0.1);
      ctx.stroke();
    }
    
    // 边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x1a202c, 0.8);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-width / 2, -height / 2, width, height, size * 0.1);
    ctx.stroke();
  }
}

