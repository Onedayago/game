/**
 * 激光塔渲染器
 * 负责激光塔的视觉绘制
 */

import { GameConfig } from '../config/GameConfig';
import { ColorUtils, GameColors } from '../config/Colors';
import { polyfillRoundRect } from '../utils/CanvasUtils';

export class LaserTowerRenderer {
  /**
   * 渲染激光塔
   * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
   * @param {number} x - Canvas 坐标系 X
   * @param {number} y - Canvas 坐标系 Y（从上往下）
   * @param {number} size - 尺寸
   * @param {number} level - 等级
   * @param {number} angle - 旋转角度（弧度，0为向右）
   */
  static render(ctx, x, y, size, level = 1, angle = 0) {
    polyfillRoundRect(ctx);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    const towerRadius = size * 0.20;
    const coreRadius = size * 0.12;
    
    // 获取颜色
    const laserColor = ColorUtils.hexToCanvas(GameColors.LASER_BASE);
    const beamColor = ColorUtils.hexToCanvas(GameColors.LASER_BEAM);
    const detailColor = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL);
    
    // 1. 绘制阴影
    this.drawLaserShadow(ctx, size, towerRadius);
    
    // 2. 绘制六边形基座
    this.drawHexagonBase(ctx, laserColor, detailColor, size);
    
    // 3. 绘制能量线
    this.drawEnergyLines(ctx, beamColor, detailColor, size);
    
    // 4. 绘制能量核心
    this.drawEnergyCore(ctx, beamColor, detailColor, coreRadius, size);
    
    // 5. 绘制外圈装饰
    this.drawOuterRing(ctx, laserColor, size);
    
    ctx.restore();
  }
  
  /**
   * 绘制激光塔阴影
   */
  static drawLaserShadow(ctx, size, towerRadius) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 4, -size / 2 + 6, size - 8, size - 4, towerRadius);
    ctx.fill();
  }
  
  /**
   * 绘制六边形基座
   */
  static drawHexagonBase(ctx, laserColor, detailColor, size) {
    const baseSize = size * 0.5;
    const hexPoints = [];
    
    // 生成外层六边形顶点
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      hexPoints.push(Math.cos(angle) * baseSize);
      hexPoints.push(Math.sin(angle) * baseSize);
    }
    
    // 主六边形基座
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.LASER_BASE, 0.9);
    ctx.beginPath();
    ctx.moveTo(hexPoints[0], hexPoints[1]);
    for (let i = 2; i < hexPoints.length; i += 2) {
      ctx.lineTo(hexPoints[i], hexPoints[i + 1]);
    }
    ctx.closePath();
    ctx.fill();
    
    // 边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.7);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 内层六边形装饰（旋转30度）
    const innerHexPoints = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + Math.PI / 6;
      innerHexPoints.push(Math.cos(angle) * baseSize * 0.6);
      innerHexPoints.push(Math.sin(angle) * baseSize * 0.6);
    }
    
    ctx.fillStyle = ColorUtils.hexToCanvas(0x0a1a0f, 0.8);
    ctx.beginPath();
    ctx.moveTo(innerHexPoints[0], innerHexPoints[1]);
    for (let i = 2; i < innerHexPoints.length; i += 2) {
      ctx.lineTo(innerHexPoints[i], innerHexPoints[i + 1]);
    }
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.5);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  /**
   * 绘制能量线
   */
  static drawEnergyLines(ctx, beamColor, detailColor, size) {
    const baseSize = size * 0.5;
    const emitterDist = baseSize * 0.85;
    
    // 激光发射器（4个小圆柱）
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i;
      const emitX = Math.cos(angle) * emitterDist;
      const emitY = Math.sin(angle) * emitterDist;
      const emitterWidth = 4 * (size / 64);
      const emitterHeight = 8 * (size / 64);
      
      ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.7);
      ctx.beginPath();
      ctx.roundRect(emitX - emitterWidth / 2, emitY - emitterHeight / 2, emitterWidth, emitterHeight, 2 * (size / 64));
      ctx.fill();
    }
  }
  
  /**
   * 绘制能量核心
   */
  static drawEnergyCore(ctx, beamColor, detailColor, coreRadius, size) {
    // 外层发光
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.3);
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius * 1.6, 0, Math.PI * 2);
    ctx.fill();
    
    // 中层发光
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.5);
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius * 1.2, 0, Math.PI * 2);
    ctx.fill();
    
    // 核心
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.95);
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 顶部霓虹细节点（6个小光点）
    const baseSize = size * 0.5;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const dotX = Math.cos(angle) * baseSize * 0.75;
      const dotY = Math.sin(angle) * baseSize * 0.75;
      ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.8);
      ctx.beginPath();
      ctx.arc(dotX, dotY, 3 * (size / 64), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  /**
   * 绘制外圈装饰
   */
  static drawOuterRing(ctx, laserColor, size) {
    // 底盘装饰线（两个圆环）
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.LASER_BASE, 0.4);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.48, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.LASER_BASE, 0.3);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.42, 0, Math.PI * 2);
    ctx.stroke();
  }
}

