/**
 * 飞行敌人渲染器
 * 负责飞行敌人的视觉绘制（带离屏缓存优化）
 */

import { ColorUtils } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class FlyingEnemyRenderer {
  // 离屏Canvas缓存
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _cacheSize = 0;
  static _initialized = false;
  
  /**
   * 初始化飞行敌人渲染缓存
   */
  static initCache(size) {
    if (this._initialized && this._cacheSize === size) {
      return;
    }
    
    const canvasSize = Math.ceil(size * 1.2);
    
    this._cachedCanvas = wx.createCanvas();
    this._cachedCanvas.width = canvasSize;
    this._cachedCanvas.height = canvasSize;
    
    this._cachedCtx = this._cachedCanvas.getContext('2d');
    this._cacheSize = size;
    
    polyfillRoundRect(this._cachedCtx);
    this.drawToCache(this._cachedCtx, size, canvasSize / 2, canvasSize / 2);
    
    this._initialized = true;
  }
  
  /**
   * 绘制到缓存Canvas（反重力浮空飞行器）
   */
  static drawToCache(ctx, size, centerX, centerY) {
    ctx.save();
    ctx.translate(centerX, centerY);
    
    const coreColor = ColorUtils.hexToCanvas(0x9933ff);
    const bodyColor = ColorUtils.hexToCanvas(0xaa44ff);
    const darkColor = ColorUtils.hexToCanvas(0x7722cc);
    const lightColor = ColorUtils.hexToCanvas(0xdd88ff);
    const accentColor = ColorUtils.hexToCanvas(0xff66ff);
    const glowColor = ColorUtils.hexToCanvas(0xcc66ff);
    
    const radius = size / 2;
    
    // === 1. 反重力场光晕（多层）===
    this.drawAntiGravityField(ctx, radius, glowColor);
    
    // === 2. 浮空投影（椭圆阴影）===
    this.drawFloatingShadow(ctx, radius);
    
    // === 3. 主体球形核心（渐变）===
    this.drawSphericalCore(ctx, radius, coreColor, bodyColor, darkColor);
    
    // === 4. 旋转推进环（三环结构）===
    this.drawRotatingRings(ctx, radius, accentColor, glowColor);
    
    // === 5. 悬浮能量稳定器 ===
    this.drawStabilizers(ctx, radius, lightColor, accentColor);
    
    // === 6. 推进器喷口阵列 ===
    this.drawThrusterArray(ctx, radius, darkColor, accentColor, glowColor);
    
    // === 7. 侧翼反重力引擎 ===
    this.drawAntiGravityWings(ctx, radius, bodyColor, accentColor, glowColor);
    
    // === 8. 中心能量核心（脉冲发光）===
    this.drawPulsingCore(ctx, radius, accentColor, glowColor);
    
    // === 9. 顶部传感器阵列 ===
    this.drawSensorDome(ctx, radius, lightColor, glowColor);
    
    ctx.restore();
  }
  
  /**
   * 绘制反重力场光晕
   */
  static drawAntiGravityField(ctx, radius, glowColor) {
    // 最外层脉冲场
    const outerGradient = ctx.createRadialGradient(0, 0, radius * 0.8, 0, 0, radius * 1.4);
    outerGradient.addColorStop(0, 'rgba(170, 68, 255, 0)');
    outerGradient.addColorStop(0.6, ColorUtils.hexToCanvas(0xaa44ff, 0.15));
    outerGradient.addColorStop(1, ColorUtils.hexToCanvas(0xaa44ff, 0.3));
    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.4, 0, Math.PI * 2);
    ctx.fill();
    
    // 中层能量场
    const midGradient = ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius * 1.2);
    midGradient.addColorStop(0, 'rgba(204, 102, 255, 0)');
    midGradient.addColorStop(0.7, ColorUtils.hexToCanvas(0xcc66ff, 0.2));
    midGradient.addColorStop(1, ColorUtils.hexToCanvas(0xaa44ff, 0.25));
    ctx.fillStyle = midGradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.2, 0, Math.PI * 2);
    ctx.fill();
    
    // 内层辉光
    const innerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 1.1);
    innerGradient.addColorStop(0, ColorUtils.hexToCanvas(0xdd88ff, 0.2));
    innerGradient.addColorStop(0.8, ColorUtils.hexToCanvas(0xaa44ff, 0.3));
    innerGradient.addColorStop(1, ColorUtils.hexToCanvas(0x9933ff, 0.2));
    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.1, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * 绘制浮空投影
   */
  static drawFloatingShadow(ctx, radius) {
    // 椭圆阴影（模拟悬浮）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.4, radius * 0.85, radius * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 柔和边缘
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.42, radius * 0.75, radius * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * 绘制球形核心
   */
  static drawSphericalCore(ctx, radius, coreColor, bodyColor, darkColor) {
    // 主体球形渐变
    const bodyGradient = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 0, 0, 0, radius);
    bodyGradient.addColorStop(0, ColorUtils.hexToCanvas(0xdd88ff, 0.95));
    bodyGradient.addColorStop(0.4, ColorUtils.hexToCanvas(0xaa44ff, 0.95));
    bodyGradient.addColorStop(0.7, ColorUtils.hexToCanvas(0x9933ff, 0.9));
    bodyGradient.addColorStop(1, ColorUtils.hexToCanvas(0x7722cc, 0.85));
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 双层边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x5511aa, 1);
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xff66ff, 0.6);
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 4;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xff66ff, 0.5);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 内层球体
    const innerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.75);
    innerGradient.addColorStop(0, ColorUtils.hexToCanvas(0x9933ff, 0.8));
    innerGradient.addColorStop(1, ColorUtils.hexToCanvas(0x7722cc, 0.9));
    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * 绘制旋转推进环
   */
  static drawRotatingRings(ctx, radius, accentColor, glowColor) {
    // 外环
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xff66ff, 0.8);
    ctx.lineWidth = 2;
    ctx.shadowBlur = 5;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xff66ff, 0.6);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 中环
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xcc66ff, 0.9);
    ctx.lineWidth = 1.8;
    ctx.shadowBlur = 4;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xcc66ff, 0.5);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.65, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 内环
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xdd88ff, 1);
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 3;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xdd88ff, 0.4);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  
  /**
   * 绘制能量稳定器
   */
  static drawStabilizers(ctx, radius, lightColor, accentColor) {
    // 四个方向的稳定器
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i + Math.PI / 4;
      const dist = radius * 0.7;
      const sx = Math.cos(angle) * dist;
      const sy = Math.sin(angle) * dist;
      
      // 稳定器外圈
      ctx.fillStyle = ColorUtils.hexToCanvas(0xaa44ff, 0.6);
      ctx.beginPath();
      ctx.arc(sx, sy, radius * 0.12, 0, Math.PI * 2);
      ctx.fill();
      
      // 稳定器核心（发光）
      const stabGradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius * 0.1);
      stabGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 1));
      stabGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0xff66ff, 0.9));
      stabGradient.addColorStop(1, ColorUtils.hexToCanvas(0xcc66ff, 0.7));
      ctx.fillStyle = stabGradient;
      ctx.beginPath();
      ctx.arc(sx, sy, radius * 0.08, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(0xff66ff, 0.8);
      ctx.lineWidth = 1;
      ctx.shadowBlur = 3;
      ctx.shadowColor = ColorUtils.hexToCanvas(0xff66ff, 0.5);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }
  
  /**
   * 绘制推进器喷口阵列
   */
  static drawThrusterArray(ctx, radius, darkColor, accentColor, glowColor) {
    const thrusterY = radius * 0.5;
    const thrusterCount = 5;
    
    for (let i = 0; i < thrusterCount; i++) {
      const tx = -radius * 0.4 + (i / (thrusterCount - 1)) * radius * 0.8;
      
      // 喷口主体
      const thrusterGradient = ctx.createRadialGradient(tx, thrusterY, 0, tx, thrusterY, radius * 0.08);
      thrusterGradient.addColorStop(0, ColorUtils.hexToCanvas(0xff66ff, 0.9));
      thrusterGradient.addColorStop(0.6, ColorUtils.hexToCanvas(0xaa44ff, 0.8));
      thrusterGradient.addColorStop(1, ColorUtils.hexToCanvas(0x7722cc, 0.7));
      ctx.fillStyle = thrusterGradient;
      ctx.beginPath();
      ctx.arc(tx, thrusterY, radius * 0.06, 0, Math.PI * 2);
      ctx.fill();
      
      // 喷口光效
      ctx.fillStyle = ColorUtils.hexToCanvas(0xff66ff, 0.6);
      ctx.shadowBlur = 4;
      ctx.shadowColor = ColorUtils.hexToCanvas(0xff66ff, 0.5);
      ctx.beginPath();
      ctx.arc(tx, thrusterY, radius * 0.04, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  
  /**
   * 绘制反重力引擎侧翼
   */
  static drawAntiGravityWings(ctx, radius, bodyColor, accentColor, glowColor) {
    const wingLength = radius * 0.7;
    const wingWidth = radius * 0.18;
    
    // 左翼
    const leftGradient = ctx.createLinearGradient(-radius * 0.8, 0, -radius * 0.2, 0);
    leftGradient.addColorStop(0, ColorUtils.hexToCanvas(0x7722cc, 0.8));
    leftGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0xaa44ff, 0.9));
    leftGradient.addColorStop(1, ColorUtils.hexToCanvas(0xcc66ff, 0.7));
    ctx.fillStyle = leftGradient;
    ctx.beginPath();
    ctx.roundRect(-radius * 0.8, -wingWidth / 2, wingLength, wingWidth, wingWidth / 2);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xff66ff, 0.7);
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 3;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xff66ff, 0.4);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 右翼（对称）
    const rightGradient = ctx.createLinearGradient(radius * 0.2, 0, radius * 0.8, 0);
    rightGradient.addColorStop(0, ColorUtils.hexToCanvas(0xcc66ff, 0.7));
    rightGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0xaa44ff, 0.9));
    rightGradient.addColorStop(1, ColorUtils.hexToCanvas(0x7722cc, 0.8));
    ctx.fillStyle = rightGradient;
    ctx.beginPath();
    ctx.roundRect(radius * 0.1, -wingWidth / 2, wingLength, wingWidth, wingWidth / 2);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xff66ff, 0.7);
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 3;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xff66ff, 0.4);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 翼尖能量点（左右各3个）
    for (let i = 0; i < 3; i++) {
      const wingTipX = -radius * 0.7 + i * radius * 0.2;
      ctx.fillStyle = ColorUtils.hexToCanvas(0xff66ff, 0.8);
      ctx.shadowBlur = 3;
      ctx.shadowColor = ColorUtils.hexToCanvas(0xff66ff, 0.5);
      ctx.beginPath();
      ctx.arc(wingTipX, 0, radius * 0.035, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      const wingTipXRight = radius * 0.2 + i * radius * 0.2;
      ctx.fillStyle = ColorUtils.hexToCanvas(0xff66ff, 0.8);
      ctx.shadowBlur = 3;
      ctx.shadowColor = ColorUtils.hexToCanvas(0xff66ff, 0.5);
      ctx.beginPath();
      ctx.arc(wingTipXRight, 0, radius * 0.035, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  
  /**
   * 绘制脉冲能量核心
   */
  static drawPulsingCore(ctx, radius, accentColor, glowColor) {
    const coreRadius = radius * 0.25;
    
    // 外层脉冲
    ctx.fillStyle = ColorUtils.hexToCanvas(0xff66ff, 0.4);
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius * 1.3, 0, Math.PI * 2);
    ctx.fill();
    
    // 主核心（强渐变）
    const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius);
    coreGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 1));
    coreGradient.addColorStop(0.3, ColorUtils.hexToCanvas(0xffeeff, 1));
    coreGradient.addColorStop(0.6, ColorUtils.hexToCanvas(0xff66ff, 0.9));
    coreGradient.addColorStop(1, ColorUtils.hexToCanvas(0xcc66ff, 0.8));
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 核心边框（强发光）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xff66ff, 1);
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xff66ff, 0.8);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 核心内部高光
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.9);
    ctx.shadowBlur = 5;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xffffff, 0.6);
    ctx.beginPath();
    ctx.arc(-coreRadius * 0.2, -coreRadius * 0.2, coreRadius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  
  /**
   * 绘制传感器穹顶
   */
  static drawSensorDome(ctx, radius, lightColor, glowColor) {
    // 顶部传感器穹顶
    const domeY = -radius * 0.35;
    const domeRadius = radius * 0.15;
    
    // 穹顶渐变
    const domeGradient = ctx.createRadialGradient(0, domeY - domeRadius * 0.3, 0, 0, domeY, domeRadius);
    domeGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.6));
    domeGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0xdd88ff, 0.5));
    domeGradient.addColorStop(1, ColorUtils.hexToCanvas(0xaa44ff, 0.4));
    ctx.fillStyle = domeGradient;
    ctx.beginPath();
    ctx.arc(0, domeY, domeRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 传感器光点（3个）
    for (let i = 0; i < 3; i++) {
      const sensorAngle = (Math.PI * 2 / 3) * i;
      const sensorDist = domeRadius * 0.5;
      const sensorX = Math.cos(sensorAngle) * sensorDist;
      const sensorY = domeY + Math.sin(sensorAngle) * sensorDist;
      
      ctx.fillStyle = ColorUtils.hexToCanvas(0xff66ff, 0.9);
      ctx.shadowBlur = 3;
      ctx.shadowColor = ColorUtils.hexToCanvas(0xff66ff, 0.6);
      ctx.beginPath();
      ctx.arc(sensorX, sensorY, radius * 0.025, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  
  /**
   * 渲染飞行敌人（固定朝向，向右）
   */
  static render(ctx, x, y, size) {
    if (!this._initialized || this._cacheSize !== size) {
      this.initCache(size);
    }
    
    if (!this._cachedCanvas) return;
    
    const canvasSize = this._cachedCanvas.width;
    const halfSize = canvasSize * 0.5;
    
    ctx.drawImage(
      this._cachedCanvas,
      x - halfSize,
      y - halfSize,
      canvasSize,
      canvasSize
    );
  }
}

