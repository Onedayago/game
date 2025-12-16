/**
 * 快速敌人渲染器
 * 负责快速敌人的视觉绘制（带离屏缓存优化）
 */

import { ColorUtils } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class FastEnemyRenderer {
  // 离屏Canvas缓存
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _cacheSize = 0;
  static _initialized = false;
  
  /**
   * 初始化快速敌人渲染缓存
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
   * 绘制到缓存Canvas（流线型高速战斗机风格）
   */
  static drawToCache(ctx, size, centerX, centerY) {
    ctx.save();
    ctx.translate(centerX, centerY);
    
    const baseColor = ColorUtils.hexToCanvas(0x3366cc);
    const bodyColor = ColorUtils.hexToCanvas(0x4488ff);
    const darkColor = ColorUtils.hexToCanvas(0x1d3d7a);
    const lightColor = ColorUtils.hexToCanvas(0x88bbff);
    const accentColor = ColorUtils.hexToCanvas(0x00d4ff);
    const glowColor = ColorUtils.hexToCanvas(0x00ffff);
    
    // === 1. 动态阴影（速度模糊效果）===
    this.drawMotionShadow(ctx, size);
    
    // === 2. 流线型主体（渐变设计）===
    this.drawStreamlinedBody(ctx, size, baseColor, bodyColor, darkColor);
    
    // === 3. 侧边推进器引擎 ===
    this.drawSideEngines(ctx, size, darkColor, accentColor, glowColor);
    
    // === 4. 空气动力学导流板 ===
    this.drawAeroFins(ctx, size, lightColor, accentColor);
    
    // === 5. 速度线条装饰 ===
    this.drawSpeedLines(ctx, size, accentColor, glowColor);
    
    // === 6. 能量核心指示器 ===
    this.drawEnergyCore(ctx, size, accentColor, glowColor);
    
    // === 7. 前置传感器阵列 ===
    this.drawSensorArray(ctx, size, glowColor);
    
    // === 8. 尾部推进光晕 ===
    this.drawThrusterGlow(ctx, size, accentColor, glowColor);
    
    ctx.restore();
  }
  
  /**
   * 绘制动态阴影（运动模糊）
   */
  static drawMotionShadow(ctx, size) {
    // 拖尾阴影（速度感）
    for (let i = 0; i < 3; i++) {
      const offset = 3 + i * 1.5;
      const alpha = 0.25 - i * 0.08;
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.beginPath();
      ctx.roundRect(-size / 2 + offset, -size / 2 + offset + 2, size - offset * 2, size - offset * 2 - 2, size * 0.22);
      ctx.fill();
    }
  }
  
  /**
   * 绘制流线型主体
   */
  static drawStreamlinedBody(ctx, size, baseColor, bodyColor, darkColor) {
    // 主体渐变（前亮后暗，突出速度方向）
    const bodyGradient = ctx.createLinearGradient(-size / 2, 0, size / 2, 0);
    bodyGradient.addColorStop(0, ColorUtils.hexToCanvas(0x5599ff, 0.95));
    bodyGradient.addColorStop(0.4, ColorUtils.hexToCanvas(0x4488ff, 0.95));
    bodyGradient.addColorStop(0.7, ColorUtils.hexToCanvas(0x3377ee, 0.9));
    bodyGradient.addColorStop(1, ColorUtils.hexToCanvas(0x2266dd, 0.85));
    
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.roundRect(-size / 2, -size / 2, size, size, size * 0.22);
    ctx.fill();
    
    // 边框（蓝色发光）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x1d3d7a, 1);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x00d4ff, 0.6);
    ctx.lineWidth = 1;
    ctx.shadowBlur = 3;
    ctx.shadowColor = ColorUtils.hexToCanvas(0x00d4ff, 0.4);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  
  /**
   * 绘制侧边推进器引擎
   */
  static drawSideEngines(ctx, size, darkColor, accentColor, glowColor) {
    // 上引擎
    const topEngineGradient = ctx.createLinearGradient(-size / 2 + 3, -size / 2 + size * 0.25, size / 2 - 3, -size / 2 + size * 0.25);
    topEngineGradient.addColorStop(0, ColorUtils.hexToCanvas(0x1d3d7a, 0.9));
    topEngineGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x2d5aa0, 0.95));
    topEngineGradient.addColorStop(1, ColorUtils.hexToCanvas(0x00d4ff, 0.7));
    ctx.fillStyle = topEngineGradient;
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 3, -size / 2 + size * 0.25, size - 6, size * 0.12, size * 0.06);
    ctx.fill();
    
    // 引擎发光边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x00d4ff, 0.8);
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 4;
    ctx.shadowColor = ColorUtils.hexToCanvas(0x00ffff, 0.5);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 下引擎（对称）
    const bottomEngineGradient = ctx.createLinearGradient(-size / 2 + 3, size / 2 - size * 0.37, size / 2 - 3, size / 2 - size * 0.37);
    bottomEngineGradient.addColorStop(0, ColorUtils.hexToCanvas(0x1d3d7a, 0.9));
    bottomEngineGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x2d5aa0, 0.95));
    bottomEngineGradient.addColorStop(1, ColorUtils.hexToCanvas(0x00d4ff, 0.7));
    ctx.fillStyle = bottomEngineGradient;
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 3, size / 2 - size * 0.37, size - 6, size * 0.12, size * 0.06);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x00d4ff, 0.8);
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 4;
    ctx.shadowColor = ColorUtils.hexToCanvas(0x00ffff, 0.5);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 引擎喷口细节
    for (let i = 0; i < 3; i++) {
      const ex = size / 2 - size * 0.15 - i * size * 0.12;
      ctx.fillStyle = ColorUtils.hexToCanvas(0x00d4ff, 0.6);
      ctx.fillRect(ex, -size / 2 + size * 0.27, size * 0.02, size * 0.08);
      ctx.fillRect(ex, size / 2 - size * 0.35, size * 0.02, size * 0.08);
    }
  }
  
  /**
   * 绘制空气动力学导流板
   */
  static drawAeroFins(ctx, size, lightColor, accentColor) {
    // 顶部导流高光
    const topGradient = ctx.createLinearGradient(-size / 2 + 4, -size / 2 + 4, -size / 2 + 4, -size / 2 + 4 + size * 0.3);
    topGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.5));
    topGradient.addColorStop(0.4, ColorUtils.hexToCanvas(0x88bbff, 0.4));
    topGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = topGradient;
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 4, -size / 2 + 4, size - 8, size * 0.28, size * 0.14);
    ctx.fill();
    
    // 前部尖锐导流板
    ctx.fillStyle = ColorUtils.hexToCanvas(0x00d4ff, 0.7);
    ctx.beginPath();
    ctx.moveTo(-size / 2 + 5, -size * 0.18);
    ctx.lineTo(-size / 2 + size * 0.25, -size * 0.08);
    ctx.lineTo(-size / 2 + size * 0.25, size * 0.08);
    ctx.lineTo(-size / 2 + 5, size * 0.18);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x00ffff, 0.8);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  /**
   * 绘制速度线条装饰
   */
  static drawSpeedLines(ctx, size, accentColor, glowColor) {
    // 侧边动态速度线（5条）
    for (let i = 0; i < 5; i++) {
      const lineY = -size * 0.3 + i * size * 0.15;
      const lineLength = size * (0.3 + i * 0.08);
      
      // 线条渐变（模拟速度拖尾）
      const lineGradient = ctx.createLinearGradient(size / 2 - lineLength, lineY, size / 2, lineY);
      lineGradient.addColorStop(0, 'rgba(0, 212, 255, 0)');
      lineGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x00d4ff, 0.5));
      lineGradient.addColorStop(1, ColorUtils.hexToCanvas(0x00ffff, 0.8));
      
      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(size / 2 - lineLength, lineY);
      ctx.lineTo(size / 2, lineY);
      ctx.stroke();
    }
  }
  
  /**
   * 绘制能量核心指示器
   */
  static drawEnergyCore(ctx, size, accentColor, glowColor) {
    const coreRadius = size * 0.14;
    
    // 外层脉冲光晕
    ctx.fillStyle = ColorUtils.hexToCanvas(0x00ffff, 0.3);
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius * 1.3, 0, Math.PI * 2);
    ctx.fill();
    
    // 中层辉光
    const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius);
    coreGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 1));
    coreGradient.addColorStop(0.4, ColorUtils.hexToCanvas(0x00ffff, 0.9));
    coreGradient.addColorStop(0.7, ColorUtils.hexToCanvas(0x00d4ff, 0.8));
    coreGradient.addColorStop(1, ColorUtils.hexToCanvas(0x4488ff, 0.6));
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 核心边框（发光）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x00ffff, 1);
    ctx.lineWidth = 2;
    ctx.shadowBlur = 6;
    ctx.shadowColor = ColorUtils.hexToCanvas(0x00ffff, 0.7);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 内部速度符号（右箭头）
    ctx.fillStyle = ColorUtils.hexToCanvas(0x1d3d7a, 0.8);
    ctx.beginPath();
    ctx.moveTo(-coreRadius * 0.4, -coreRadius * 0.3);
    ctx.lineTo(coreRadius * 0.3, 0);
    ctx.lineTo(-coreRadius * 0.4, coreRadius * 0.3);
    ctx.closePath();
    ctx.fill();
  }
  
  /**
   * 绘制前置传感器阵列
   */
  static drawSensorArray(ctx, size, glowColor) {
    // 三个小传感器点
    for (let i = 0; i < 3; i++) {
      const sy = -size * 0.25 + i * size * 0.25;
      const sx = -size * 0.38;
      
      // 传感器外圈
      ctx.fillStyle = ColorUtils.hexToCanvas(0x00d4ff, 0.5);
      ctx.beginPath();
      ctx.arc(sx, sy, size * 0.045, 0, Math.PI * 2);
      ctx.fill();
      
      // 传感器核心（发光）
      ctx.fillStyle = ColorUtils.hexToCanvas(0x00ffff, 0.9);
      ctx.shadowBlur = 3;
      ctx.shadowColor = ColorUtils.hexToCanvas(0x00ffff, 0.6);
      ctx.beginPath();
      ctx.arc(sx, sy, size * 0.025, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  
  /**
   * 绘制尾部推进光晕
   */
  static drawThrusterGlow(ctx, size, accentColor, glowColor) {
    // 尾部光晕效果（推进器喷射）
    const thrustGradient = ctx.createRadialGradient(size / 2, 0, 0, size / 2, 0, size * 0.25);
    thrustGradient.addColorStop(0, ColorUtils.hexToCanvas(0x00ffff, 0.4));
    thrustGradient.addColorStop(0.6, ColorUtils.hexToCanvas(0x00d4ff, 0.2));
    thrustGradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
    ctx.fillStyle = thrustGradient;
    ctx.beginPath();
    ctx.arc(size / 2, 0, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * 渲染快速敌人（固定朝向，向右）
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

