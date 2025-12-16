/**
 * 敌人坦克渲染器
 * 负责敌人坦克的视觉绘制（带离屏缓存优化）
 */

import { ColorUtils, GameColors } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class EnemyTankRenderer {
  // 离屏Canvas缓存
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _cacheSize = 0;
  static _initialized = false;
  
  /**
   * 初始化敌人坦克渲染缓存
   */
  static initCache(size) {
    if (this._initialized && this._cacheSize === size) {
      return; // 已经初始化且尺寸相同
    }
    
    const canvasSize = Math.ceil(size * 1.2);
    
    this._cachedCanvas = wx.createCanvas();
    this._cachedCanvas.width = canvasSize;
    this._cachedCanvas.height = canvasSize;
    
    this._cachedCtx = this._cachedCanvas.getContext('2d');
    this._cacheSize = size;
    
    this._cachedCtx.clearRect(0, 0, canvasSize, canvasSize);
    
    polyfillRoundRect(this._cachedCtx);
    this.drawEnemyToCache(this._cachedCtx, size, canvasSize / 2, canvasSize / 2);
    
    this._initialized = true;
  }
  
  /**
   * 绘制敌人到缓存Canvas（不包含旋转）
   */
  static drawEnemyToCache(ctx, size, centerX, centerY) {
    ctx.save();
    ctx.translate(centerX, centerY);
    // 不旋转，缓存基础外观
    
    const hullRadius = size * 0.25;
    const trackHeight = size * 0.22;
    const turretRadius = size * 0.22;
    const barrelLength = size * 0.78;
    const barrelHalfHeight = size * 0.08;
    
    const enemyColor = ColorUtils.hexToCanvas(GameColors.ENEMY_TANK);
    const enemyDarkColor = ColorUtils.hexToCanvas(GameColors.ENEMY_BODY_DARK);
    const detailColor = ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL);
    
    // === 多层阴影 ===
    this.drawShadow(ctx, size, hullRadius);
    
    // === 上下履带 ===
    this.drawTracks(ctx, size, trackHeight, enemyDarkColor);
    
    // === 履带装甲板纹理 ===
    this.drawTrackPlates(ctx, size, trackHeight);
    
    // === 履带滚轮 ===
    this.drawTrackWheels(ctx, size, trackHeight);
    
    // === 主车体 ===
    this.drawHull(ctx, size, trackHeight, hullRadius, enemyColor, enemyDarkColor);
    
    // === 车体高光 ===
    this.drawHullHighlight(ctx, size, trackHeight, hullRadius, detailColor);
    
    // === 前装甲条 ===
    this.drawFrontArmor(ctx, size, enemyDarkColor, detailColor);
    
    // === 装甲条纹 ===
    this.drawArmorStripes(ctx, size, trackHeight, enemyDarkColor);
    
    // === 威胁标识（红色辉光）===
    this.drawThreatIndicator(ctx, size, detailColor);
    
    // === 炮塔 ===
    this.drawTurret(ctx, size, turretRadius, enemyColor, enemyDarkColor, detailColor);
    
    // === 炮塔顶部细节 ===
    this.drawTurretTop(ctx, size, enemyColor, detailColor);
    
    // === 炮塔警示灯 ===
    this.drawTurretLight(ctx, size, detailColor);
    
    // === 炮管（基础方向，向右）===
    this.drawBarrel(ctx, barrelLength, barrelHalfHeight, detailColor, enemyDarkColor, enemyColor);
    
    ctx.restore();
  }
  
  /**
   * 渲染敌人坦克
   */
  static render(ctx, x, y, size, angle = 0) {
    // 初始化缓存（如果未初始化或尺寸不同）
    if (!this._initialized || this._cacheSize !== size) {
      this.initCache(size);
    }
    // 使用缓存渲染
    this.renderFromCache(ctx, x, y, size, angle);
  }
  
  /**
   * 从缓存渲染敌人
   */
  static renderFromCache(ctx, x, y, size, angle) {
    if (!this._cachedCanvas) return;
    
    const canvasSize = this._cachedCanvas.width;
    const halfSize = canvasSize * 0.5;
    
    ctx.save();
    ctx.translate(x, y);
    
    // 优化：大多数敌人角度为0，快速路径
    if (Math.abs(angle) > 0.01) {
      ctx.rotate(angle);
    }
    
    // 从缓存Canvas绘制（居中绘制）
    ctx.drawImage(
      this._cachedCanvas,
      -halfSize,  // 目标X（居中）
      -halfSize,  // 目标Y（居中）
      canvasSize, // 目标宽度
      canvasSize  // 目标高度
    );
    
    ctx.restore();
  }
  
  /**
   * 绘制阴影
   */
  static drawShadow(ctx, size, hullRadius) {
    // 第一层阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 4, -size / 2 + 6, size - 8, size - 6, hullRadius);
    ctx.fill();
    
    // 第二层阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 6, -size / 2 + 8, size - 12, size - 10, hullRadius * 0.8);
    ctx.fill();
  }
  
  /**
   * 绘制履带
   */
  static drawTracks(ctx, size, trackHeight, enemyDarkColor) {
    // 上履带
    ctx.fillStyle = ColorUtils.hexToCanvas(0x0a0f1a);
    ctx.beginPath();
    ctx.roundRect(-size / 2, -size / 2, size, trackHeight, trackHeight / 2);
    ctx.fill();
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_BODY_DARK, 0.6);
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // 下履带
    ctx.fillStyle = ColorUtils.hexToCanvas(0x0a0f1a);
    ctx.beginPath();
    ctx.roundRect(-size / 2, size / 2 - trackHeight, size, trackHeight, trackHeight / 2);
    ctx.fill();
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_BODY_DARK, 0.6);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  /**
   * 绘制履带装甲板
   */
  static drawTrackPlates(ctx, size, trackHeight) {
    const plateCount = 5;
    for (let i = 0; i < plateCount; i++) {
      const px = -size / 2 + (size / plateCount) * i + 3;
      ctx.fillStyle = ColorUtils.hexToCanvas(0x1e293b, 0.4);
      ctx.fillRect(px, -size / 2 + 2, size / plateCount - 2, trackHeight - 4);
      ctx.fillRect(px, size / 2 - trackHeight + 2, size / plateCount - 2, trackHeight - 4);
    }
  }
  
  /**
   * 绘制履带滚轮
   */
  static drawTrackWheels(ctx, size, trackHeight) {
    const wheelRadius = trackHeight * 0.32;
    const wheelCount = 4;
    for (let i = 0; i < wheelCount; i++) {
      const t = wheelCount === 1 ? 0.5 : i / (wheelCount - 1);
      const wx = -size / 2 + size * (0.18 + 0.64 * t);
      const wyTop = -size / 2 + trackHeight / 2;
      const wyBottom = size / 2 - trackHeight / 2;
      
      // 上排滚轮
      ctx.fillStyle = ColorUtils.hexToCanvas(0x334155);
      ctx.beginPath();
      ctx.arc(wx, wyTop, wheelRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x1e293b);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = ColorUtils.hexToCanvas(0x475569);
      ctx.beginPath();
      ctx.arc(wx, wyTop, wheelRadius * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      // 下排滚轮
      ctx.fillStyle = ColorUtils.hexToCanvas(0x334155);
      ctx.beginPath();
      ctx.arc(wx, wyBottom, wheelRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x1e293b);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = ColorUtils.hexToCanvas(0x475569);
      ctx.beginPath();
      ctx.arc(wx, wyBottom, wheelRadius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  /**
   * 绘制主车体
   */
  static drawHull(ctx, size, trackHeight, hullRadius, enemyColor, enemyDarkColor) {
    // 使用渐变增强金属质感
    const hullGradient = ctx.createLinearGradient(-size / 2, -size / 2 + trackHeight * 0.65, -size / 2, size / 2 - trackHeight * 0.65);
    hullGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.ENEMY_BODY_DARK, 0.95));
    hullGradient.addColorStop(0.3, ColorUtils.hexToCanvas(GameColors.ENEMY_TANK, 0.95));
    hullGradient.addColorStop(0.7, ColorUtils.hexToCanvas(GameColors.ENEMY_TANK, 0.95));
    hullGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.ENEMY_BODY_DARK, 0.9));
    ctx.fillStyle = hullGradient;
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 6, -size / 2 + trackHeight * 0.65, size - 12, size - trackHeight * 1.3, hullRadius);
    ctx.fill();
    
    // 边框（增强对比度）
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_BODY_DARK, 1);
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 内部装饰线条
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.3);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 8, -size / 2 + trackHeight * 0.7, size - 16, size - trackHeight * 1.4, hullRadius * 0.8);
    ctx.stroke();
  }
  
  /**
   * 绘制车体高光
   */
  static drawHullHighlight(ctx, size, trackHeight, hullRadius, detailColor) {
    // 使用渐变增强高光效果
    const highlightGradient = ctx.createLinearGradient(-size / 2, -size / 2 + trackHeight * 0.7, -size / 2, -size / 2 + trackHeight * 0.7 + (size - trackHeight * 1.3) * 0.4);
    highlightGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.25));
    highlightGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.15));
    highlightGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 8, -size / 2 + trackHeight * 0.7, size - 16, (size - trackHeight * 1.3) * 0.35, hullRadius * 0.6);
    ctx.fill();
  }
  
  /**
   * 绘制前装甲条
   */
  static drawFrontArmor(ctx, size, enemyDarkColor, detailColor) {
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_BODY_DARK, 0.95);
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 10, -size * 0.08, size - 20, size * 0.18, size * 0.05);
    ctx.fill();
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.3);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  /**
   * 绘制装甲条纹
   */
  static drawArmorStripes(ctx, size, trackHeight, enemyDarkColor) {
    const stripeCount = 2;
    for (let i = 0; i < stripeCount; i++) {
      const sy = -size / 2 + trackHeight * 0.75 + i * ((size - trackHeight * 1.4) / stripeCount);
      ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_BODY_DARK, 0.7);
      ctx.fillRect(-size / 2 + 12, sy, size - 24, 1.5);
    }
  }
  
  /**
   * 绘制威胁标识
   */
  static drawThreatIndicator(ctx, size, detailColor) {
    const indicatorX = -size * 0.18;
    const indicatorY = -size * 0.02;
    const indicatorRadius = size * 0.09;
    
    // 最外层光晕（增强）
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.4);
    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, indicatorRadius * 1.2, 0, Math.PI * 2);
    ctx.fill();
    
    // 外层辉光
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.35);
    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, indicatorRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 中层（使用径向渐变）
    const midGradient = ctx.createRadialGradient(indicatorX, indicatorY, 0, indicatorX, indicatorY, indicatorRadius * 0.78);
    midGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 1));
    midGradient.addColorStop(0.7, ColorUtils.hexToCanvas(0xff6666, 0.95));
    midGradient.addColorStop(1, ColorUtils.hexToCanvas(0xff4444, 0.9));
    ctx.fillStyle = midGradient;
    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, indicatorRadius * 0.78, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xfb7185, 1);
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 4;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.6);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 内层高光（增强）
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.9);
    ctx.shadowBlur = 6;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xffffff, 0.5);
    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, indicatorRadius * 0.44, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  
  /**
   * 绘制炮塔
   */
  static drawTurret(ctx, size, turretRadius, enemyColor, enemyDarkColor, detailColor) {
    const turretY = -size * 0.05;
    
    // 外层阴影
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.15);
    ctx.beginPath();
    ctx.arc(0, turretY, turretRadius * 1.1, 0, Math.PI * 2);
    ctx.fill();
    
    // 炮塔基座
    ctx.fillStyle = enemyDarkColor;
    ctx.beginPath();
    ctx.arc(0, turretY, turretRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 炮塔主体
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_TANK, 0.8);
    ctx.beginPath();
    ctx.arc(0, turretY, turretRadius * 0.85, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * 绘制炮塔顶部
   */
  static drawTurretTop(ctx, size, enemyColor, detailColor) {
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_TANK, 0.95);
    ctx.beginPath();
    ctx.roundRect(-size * 0.08, -size * 0.18, size * 0.16, size * 0.36, size * 0.06);
    ctx.fill();
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.4);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  /**
   * 绘制炮塔警示灯
   */
  static drawTurretLight(ctx, size, detailColor) {
    const lightY = -size * 0.2;
    const lightRadius = size * 0.035;
    
    // 外层
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.9);
    ctx.beginPath();
    ctx.arc(0, lightY, lightRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 内层高光
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.8);
    ctx.beginPath();
    ctx.arc(0, lightY, lightRadius * 0.63, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * 绘制炮管
   */
  static drawBarrel(ctx, barrelLength, barrelHalfHeight, detailColor, enemyDarkColor, enemyColor) {
    // 主炮管
    ctx.fillStyle = detailColor;
    ctx.beginPath();
    ctx.roundRect(0, -barrelHalfHeight, barrelLength, barrelHalfHeight * 2, barrelHalfHeight);
    ctx.fill();
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_BODY_DARK, 0.8);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // 炮管中段装甲
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_TANK, 0.9);
    ctx.beginPath();
    ctx.roundRect(barrelLength * 0.4, -barrelHalfHeight * 0.6, barrelLength * 0.4, barrelHalfHeight * 1.2, barrelHalfHeight * 0.5);
    ctx.fill();
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.4);
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // 炮口光环（3层）
    const muzzleX = barrelLength - barrelHalfHeight * 0.2;
    const muzzleRadius = barrelHalfHeight * 0.6;
    
    // 外层
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.3);
    ctx.beginPath();
    ctx.arc(muzzleX, 0, muzzleRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 中层
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.95);
    ctx.beginPath();
    ctx.arc(muzzleX, 0, muzzleRadius * 0.83, 0, Math.PI * 2);
    ctx.fill();
    
    // 内层高光
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.6);
    ctx.beginPath();
    ctx.arc(muzzleX, 0, muzzleRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

