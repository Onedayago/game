/**
 * 激光束
 */

import { GameConfig } from '../config/GameConfig';
import { ColorUtils, GameColors } from '../config/Colors';

export class LaserBeam {
  constructor(ctx, x1, y1, x2, y2, damage) {
    this.ctx = ctx;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.damage = damage;
    this.destroyed = false;
  }
  
  /**
   * 更新目标位置
   */
  updateTarget(x2, y2) {
    this.x2 = x2;
    this.y2 = y2;
  }
  
  /**
   * 更新激光束
   */
  update(deltaTime, deltaMS) {
    // 激光束不需要更新位置，只需要持续一段时间
  }
  
  /**
   * 检查是否在视锥内
   */
  isInView(viewLeft, viewRight, viewTop, viewBottom) {
    // 检查激光束的两个端点是否在视锥内，或者激光束是否与视锥相交
    const minX = Math.min(this.x1, this.x2);
    const maxX = Math.max(this.x1, this.x2);
    const minY = Math.min(this.y1, this.y2);
    const maxY = Math.max(this.y1, this.y2);
    
    return maxX >= viewLeft && minX <= viewRight &&
           maxY >= viewTop && minY <= viewBottom;
  }
  
  /**
   * 渲染激光束（带视锥剔除）
   */
  render(viewLeft = -Infinity, viewRight = Infinity, viewTop = -Infinity, viewBottom = Infinity) {
    if (this.destroyed) return;
    
    // 视锥剔除：只渲染屏幕内的激光束
    if (!this.isInView(viewLeft, viewRight, viewTop, viewBottom)) {
      return;
    }
    
    this.ctx.save();
    
    // 绘制激光束主体
    const color = ColorUtils.hexToCanvas(GameColors.LASER_BEAM);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(this.x1, this.y1);
    this.ctx.lineTo(this.x2, this.y2);
    this.ctx.stroke();
    
    // 绘制发光效果
    this.ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.5);
    this.ctx.lineWidth = 8;
    this.ctx.beginPath();
    this.ctx.moveTo(this.x1, this.y1);
    this.ctx.lineTo(this.x2, this.y2);
    this.ctx.stroke();
    
    this.ctx.restore();
  }
}

