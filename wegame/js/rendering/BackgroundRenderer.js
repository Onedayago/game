/**
 * 背景渲染器
 * 负责绘制游戏背景网格
 * 使用离屏 Canvas 缓存，只绘制一次
 */

import { GameConfig } from '../config/GameConfig';
import { GameColors, ColorUtils } from '../config/Colors';

export class BackgroundRenderer {
  constructor(ctx) {
    this.ctx = ctx;
    this.gridCanvas = null;
    this.gridCtx = null;
    this.initialized = false;
  }
  
  /**
   * 初始化背景网格（只绘制一次）
   */
  init() {
    if (this.initialized) return;
    
    // 创建离屏 Canvas 用于缓存网格
    // 微信小游戏使用 wx.createCanvas() 创建离屏 Canvas
    try {
      if (wx.createOffscreenCanvas) {
        this.gridCanvas = wx.createOffscreenCanvas(GameConfig.BATTLE_WIDTH, GameConfig.DESIGN_HEIGHT);
      } else {
        // 如果不支持离屏 Canvas，创建一个新的 Canvas 作为缓存
        this.gridCanvas = wx.createCanvas();
        this.gridCanvas.width = GameConfig.BATTLE_WIDTH;
        this.gridCanvas.height = GameConfig.DESIGN_HEIGHT;
      }
    } catch (e) {
      // 如果创建失败，使用普通 Canvas
      this.gridCanvas = wx.createCanvas();
      this.gridCanvas.width = GameConfig.BATTLE_WIDTH;
      this.gridCanvas.height = GameConfig.DESIGN_HEIGHT;
    }
    
    this.gridCtx = this.gridCanvas.getContext('2d');
    
    // 注意：背景色在主渲染器中绘制到整个画布
    // 这里只绘制网格线（只在内容区域）
    this.drawGrid();
    
    this.initialized = true;
  }
  
  /**
   * 渲染背景（直接绘制缓存的网格）
   */
  render() {
    // 如果未初始化，先初始化
    if (!this.initialized) {
      this.init();
    }
    
    // 直接绘制缓存的网格 Canvas
    if (this.gridCanvas) {
      this.ctx.drawImage(this.gridCanvas, 0, 0);
    }
  }
  
  /**
   * 绘制网格（只调用一次）
   * 直接使用 Canvas 坐标系（Y 轴从上往下）
   */
  drawGrid() {
    // 使用红色绘制网格线
    this.gridCtx.strokeStyle = 'rgba(255, 0, 0, ' + GameConfig.GRID_LINE_ALPHA + ')';
    this.gridCtx.lineWidth = 1;
    
    // 绘制垂直线（X 坐标不变）
    for (let x = 0; x <= GameConfig.BATTLE_COLS; x++) {
      const px = x * GameConfig.CELL_SIZE;
      this.gridCtx.beginPath();
      this.gridCtx.moveTo(px, 0);
      this.gridCtx.lineTo(px, GameConfig.DESIGN_HEIGHT);
      this.gridCtx.stroke();
    }
    
    // 绘制水平线（直接使用 Canvas 坐标系，Y 轴从上往下）
    for (let row = 0; row <= GameConfig.TOTAL_ROWS; row++) {
      const y = row * GameConfig.CELL_SIZE;
      this.gridCtx.beginPath();
      this.gridCtx.moveTo(0, y);
      this.gridCtx.lineTo(GameConfig.BATTLE_WIDTH, y);
      this.gridCtx.stroke();
    }
  }
}

