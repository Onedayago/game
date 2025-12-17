/**
 * 背景渲染器
 * 负责绘制游戏背景网格
 */

import { GameConfig } from '../../config/GameConfig';
import { GameColors, ColorUtils } from '../../config/Colors';

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
    
    const width = GameConfig.BATTLE_WIDTH;
    const height = GameConfig.BATTLE_HEIGHT;
    
    this._cachedCanvas = wx.createCanvas();
    this._cachedCanvas.width = width;
    this._cachedCanvas.height = height;
    
    this._cachedCtx = this._cachedCanvas.getContext('2d');
    
    this._cachedCtx.clearRect(0, 0, width, height);
    
    this.drawGridToCache(this._cachedCtx);
    
    this._initialized = true;
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
      ctx.lineTo(px, GameConfig.BATTLE_HEIGHT);
      ctx.stroke();
    }
    
    // 绘制水平线（直接使用 Canvas 坐标系，Y 轴从上往下，只绘制到战斗区域结束，不包括UI区域）
    for (let row = GameConfig.BATTLE_START_ROW; row <= GameConfig.BATTLE_END_ROW; row++) {
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
    
    // 使用缓存渲染
    BackgroundRenderer.renderFromCache(this.ctx, offsetX, offsetY);
  }
  
}

