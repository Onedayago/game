/**
 * 背景渲染器
 * 负责绘制游戏背景网格
 */

import { GameConfig } from '../config/GameConfig';
import { GameColors, ColorUtils } from '../config/Colors';

export class BackgroundRenderer {
  // 离屏Canvas缓存
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _initialized = false;
  
  constructor(ctx) {
    this.ctx = ctx;
  }
  
  /**
   * 初始化背景渲染缓存
   */
  static initCache() {
    if (this._initialized) {
      return;
    }
    
    try {
      const width = GameConfig.BATTLE_WIDTH;
      const height = GameConfig.DESIGN_HEIGHT;
      
      if (typeof wx !== 'undefined') {
        this._cachedCanvas = wx.createCanvas();
        this._cachedCanvas.width = width;
        this._cachedCanvas.height = height;
      } else {
        this._cachedCanvas = document.createElement('canvas');
        this._cachedCanvas.width = width;
        this._cachedCanvas.height = height;
      }
      
      this._cachedCtx = this._cachedCanvas.getContext('2d');
      
      // 清空缓存Canvas
      this._cachedCtx.clearRect(0, 0, width, height);
      
      // 绘制网格到缓存
      this.drawGridToCache(this._cachedCtx);
      
      this._initialized = true;
    } catch (e) {
      console.warn('背景渲染缓存初始化失败:', e);
      this._initialized = false;
    }
  }
  
  /**
   * 绘制网格到缓存Canvas
   */
  static drawGridToCache(ctx) {
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.GRID_LINE, GameConfig.GRID_LINE_ALPHA);
    ctx.lineWidth = 1;
    
    // 绘制垂直线（X 坐标不变）
    for (let x = 0; x <= GameConfig.BATTLE_COLS; x++) {
      const px = x * GameConfig.CELL_SIZE;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, GameConfig.DESIGN_HEIGHT);
      ctx.stroke();
    }
    
    // 绘制水平线（直接使用 Canvas 坐标系，Y 轴从上往下）
    for (let row = 0; row <= GameConfig.TOTAL_ROWS; row++) {
      const y = row * GameConfig.CELL_SIZE;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GameConfig.BATTLE_WIDTH, y);
      ctx.stroke();
    }
  }
  
  /**
   * 从缓存渲染背景（应用战场偏移）
   */
  static renderFromCache(ctx, offsetX = 0, offsetY = 0) {
    if (!this._cachedCanvas) return;
    
    ctx.drawImage(
      this._cachedCanvas,
      offsetX,
      offsetY,
      this._cachedCanvas.width,
      this._cachedCanvas.height
    );
  }
  
  /**
   * 渲染背景（应用战场偏移，不使用 translate）
   */
  render(offsetX = 0, offsetY = 0) {
    // 初始化缓存（如果未初始化）
    if (!BackgroundRenderer._initialized) {
      BackgroundRenderer.initCache();
    }
    
    // 如果缓存可用，使用缓存渲染
    if (BackgroundRenderer._cachedCanvas && BackgroundRenderer._initialized) {
      BackgroundRenderer.renderFromCache(this.ctx, offsetX, offsetY);
    } else {
      // 回退到直接渲染（需要手动应用偏移）
      this.drawGrid(offsetX, offsetY);
    }
  }
  
  /**
   * 绘制网格（直接渲染，回退方案，应用战场偏移）
   * 直接使用 Canvas 坐标系（Y 轴从上往下）
   */
  drawGrid(offsetX = 0, offsetY = 0) {
    this.ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.GRID_LINE, GameConfig.GRID_LINE_ALPHA);
    this.ctx.lineWidth = 1;
    
    // 绘制垂直线（应用战场偏移）
    for (let x = 0; x <= GameConfig.BATTLE_COLS; x++) {
      const px = x * GameConfig.CELL_SIZE + offsetX;
      this.ctx.beginPath();
      this.ctx.moveTo(px, 0 + offsetY);
      this.ctx.lineTo(px, GameConfig.DESIGN_HEIGHT + offsetY);
      this.ctx.stroke();
    }
    
    // 绘制水平线（应用战场偏移）
    for (let row = 0; row <= GameConfig.TOTAL_ROWS; row++) {
      const y = row * GameConfig.CELL_SIZE + offsetY;
      this.ctx.beginPath();
      this.ctx.moveTo(0 + offsetX, y);
      this.ctx.lineTo(GameConfig.BATTLE_WIDTH + offsetX, y);
      this.ctx.stroke();
    }
  }
}

