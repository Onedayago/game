/**
 * 背景渲染器
 * 负责绘制游戏背景网格
 */

import { GameConfig } from '../config/GameConfig';
import { GameColors, ColorUtils } from '../config/Colors';

export class BackgroundRenderer {
  constructor(ctx) {
    this.ctx = ctx;
  }
  
  /**
   * 渲染背景
   */
  render() {
    this.drawGrid();
  }
  
  /**
   * 绘制网格
   * 直接使用 Canvas 坐标系（Y 轴从上往下）
   */
  drawGrid() {
    this.ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.GRID_LINE, GameConfig.GRID_LINE_ALPHA);
    this.ctx.lineWidth = 1;
    
    // 绘制垂直线（X 坐标不变）
    for (let x = 0; x <= GameConfig.BATTLE_COLS; x++) {
      const px = x * GameConfig.CELL_SIZE;
      this.ctx.beginPath();
      this.ctx.moveTo(px, 0);
      this.ctx.lineTo(px, GameConfig.DESIGN_HEIGHT);
      this.ctx.stroke();
    }
    
    // 绘制水平线（直接使用 Canvas 坐标系，Y 轴从上往下）
    for (let row = 0; row <= GameConfig.TOTAL_ROWS; row++) {
      const y = row * GameConfig.CELL_SIZE;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(GameConfig.BATTLE_WIDTH, y);
      this.ctx.stroke();
    }
  }
}

