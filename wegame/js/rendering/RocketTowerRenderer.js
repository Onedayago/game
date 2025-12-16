/**
 * 火箭塔渲染器
 * 负责火箭塔的视觉绘制
 */

import { GameConfig } from '../config/GameConfig';
import { ColorUtils, GameColors } from '../config/Colors';
import { polyfillRoundRect } from '../utils/CanvasUtils';

export class RocketTowerRenderer {
  // 离屏Canvas缓存（按尺寸和等级缓存）
  static _cachedCanvases = {}; // { 'size_level': canvas }
  static _cachedCtxs = {}; // { 'size_level': ctx }
  
  /**
   * 获取缓存键
   */
  static getCacheKey(size, level) {
    return `${size}_${level}`;
  }
  
  /**
   * 初始化火箭塔渲染缓存
   */
  static initCache(size, level = 1) {
    const cacheKey = this.getCacheKey(size, level);
    
    if (this._cachedCanvases[cacheKey]) {
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
    this.drawRocketTowerToCache(ctx, size, level);
    ctx.restore();
  }
  
  /**
   * 绘制火箭塔到缓存Canvas
   */
  static drawRocketTowerToCache(ctx, size, level) {
    const baseWidth = size * 0.7;
    const baseHeight = size * 0.3;
    const towerWidth = size * 0.34;
    const towerHeight = size * 0.9;
    
    // 获取颜色
    const baseColor = ColorUtils.hexToCanvas(GameColors.ROCKET_BASE);
    const towerColor = ColorUtils.hexToCanvas(GameColors.ROCKET_TOWER);
    const detailColor = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL);
    const allyBodyColor = ColorUtils.hexToCanvas(GameColors.ALLY_BODY);
    const allyDetailColor = ColorUtils.hexToCanvas(GameColors.ALLY_DETAIL);
    
    // 1. 绘制多层阴影
    this.drawShadowLayers(ctx, baseWidth, baseHeight, towerWidth, towerHeight, size);
    
    // 2. 绘制底座
    this.drawRocketBase(ctx, baseColor, detailColor, baseWidth, baseHeight, size);
    
    // 3. 绘制塔身
    this.drawRocketTower(ctx, towerColor, detailColor, towerWidth, towerHeight, size, allyBodyColor, allyDetailColor);
    
    // 4. 绘制发射轨道
    this.drawLaunchRails(ctx, detailColor, size, towerWidth, towerHeight);
    
    // 5. 绘制火箭弹头
    this.drawRocketWarhead(ctx, towerColor, detailColor, size, towerWidth, towerHeight);
  }
  
  /**
   * 从缓存渲染火箭塔
   */
  static renderFromCache(ctx, x, y, size, level, angle = 0) {
    const cacheKey = this.getCacheKey(size, level);
    const cachedCanvas = this._cachedCanvases[cacheKey];
    
    if (!cachedCanvas) return;
    
    const canvasSize = cachedCanvas.width;
    const halfSize = canvasSize * 0.5;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    ctx.drawImage(
      cachedCanvas,
      -halfSize,
      -halfSize,
      canvasSize,
      canvasSize
    );
    
    ctx.restore();
  }
  
  /**
   * 渲染火箭塔
   * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
   * @param {number} x - Canvas 坐标系 X
   * @param {number} y - Canvas 坐标系 Y（从上往下）
   * @param {number} size - 尺寸
   * @param {number} level - 等级
   * @param {number} angle - 旋转角度（弧度，0为向右）
   */
  static render(ctx, x, y, size, level = 1, angle = 0) {
    // 初始化缓存（如果未初始化）
    if (!this._cachedCanvases[this.getCacheKey(size, level)]) {
      this.initCache(size, level);
    }
    
    // 使用缓存渲染
    this.renderFromCache(ctx, x, y, size, level, angle);
  }
  
  /**
   * 绘制多层阴影
   */
  static drawShadowLayers(ctx, baseWidth, baseHeight, towerWidth, towerHeight, size) {
    // 第一层阴影（主阴影）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.roundRect(-baseWidth / 2, -size / 2 + 8 * (size / 64), baseWidth, size - 10 * (size / 64), size * 0.18);
    ctx.fill();
    
    // 第二层阴影（次阴影）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.roundRect(-baseWidth / 2 + 4 * (size / 64), -size / 2 + 10 * (size / 64), baseWidth - 8 * (size / 64), size - 14 * (size / 64), size * 0.15);
    ctx.fill();
  }
  
  /**
   * 绘制火箭底座
   */
  static drawRocketBase(ctx, baseColor, detailColor, baseWidth, baseHeight, size) {
    // 主底座
    ctx.fillStyle = ColorUtils.hexToCanvas(0x1f2937);
    ctx.beginPath();
    ctx.roundRect(-baseWidth / 2, size / 2 - baseHeight, baseWidth, baseHeight, baseHeight * 0.6);
    ctx.fill();
    
    // 边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x0f172a);
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    // 底座内部装饰
    ctx.fillStyle = ColorUtils.hexToCanvas(0x475569, 0.95);
    ctx.beginPath();
    ctx.roundRect(-baseWidth / 2 + 6 * (size / 64), size / 2 - baseHeight * 0.75, baseWidth - 12 * (size / 64), baseHeight * 0.45, baseHeight * 0.25);
    ctx.fill();
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.3);
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // 底座装甲条纹（4条）
    const stripeWidth = baseWidth / 5;
    for (let i = 0; i < 4; i++) {
      const sx = -baseWidth / 2 + 6 * (size / 64) + i * stripeWidth;
      const stripeColor = i % 2 === 0 ? detailColor : ColorUtils.hexToCanvas(0x111827);
      ctx.fillStyle = ColorUtils.hexToCanvas(i % 2 === 0 ? GameColors.ROCKET_DETAIL : 0x111827, 0.9);
      ctx.beginPath();
      ctx.roundRect(sx, size / 2 - baseHeight * 0.7, stripeWidth * 0.5, baseHeight * 0.4, stripeWidth * 0.2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }
  
  /**
   * 绘制火箭塔身
   */
  static drawRocketTower(ctx, towerColor, detailColor, towerWidth, towerHeight, size, allyBodyColor, allyDetailColor) {
    // 多层光晕效果（增强霓虹感）
    // 最外层光晕
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.25);
    ctx.beginPath();
    ctx.roundRect(-towerWidth / 2 - 4 * (size / 64), -towerHeight / 2 - 4 * (size / 64), towerWidth + 8 * (size / 64), towerHeight + 8 * (size / 64), towerWidth * 0.5);
    ctx.fill();
    
    // 中层光晕
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.18);
    ctx.beginPath();
    ctx.roundRect(-towerWidth / 2 - 2 * (size / 64), -towerHeight / 2 - 2 * (size / 64), towerWidth + 4 * (size / 64), towerHeight + 4 * (size / 64), towerWidth * 0.5);
    ctx.fill();
    
    // 内层光晕
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.12);
    ctx.beginPath();
    ctx.roundRect(-towerWidth / 2 - 1 * (size / 64), -towerHeight / 2 - 1 * (size / 64), towerWidth + 2 * (size / 64), towerHeight + 2 * (size / 64), towerWidth * 0.5);
    ctx.fill();
    
    // 主塔身（使用渐变增强金属质感）
    const towerGradient = ctx.createLinearGradient(-towerWidth / 2, -towerHeight / 2, -towerWidth / 2, towerHeight / 2);
    towerGradient.addColorStop(0, ColorUtils.hexToCanvas(0x1e293b, 0.95));
    towerGradient.addColorStop(0.3, ColorUtils.hexToCanvas(0x334155, 0.95));
    towerGradient.addColorStop(0.7, ColorUtils.hexToCanvas(0x475569, 0.95));
    towerGradient.addColorStop(1, ColorUtils.hexToCanvas(0x334155, 0.95));
    ctx.fillStyle = towerGradient;
    ctx.beginPath();
    ctx.roundRect(-towerWidth / 2, -towerHeight / 2, towerWidth, towerHeight, towerWidth * 0.5);
    ctx.fill();
    
    // 边框（增强发光效果）
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.9);
    ctx.lineWidth = 3;
    ctx.shadowBlur = 8;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.6);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 塔身高光（增强渐变效果）
    const highlightGradient = ctx.createLinearGradient(-towerWidth / 2, -towerHeight / 2, -towerWidth / 2, -towerHeight / 2 + towerHeight * 0.4);
    highlightGradient.addColorStop(0, ColorUtils.hexToCanvas(0x64748b, 0.5));
    highlightGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x475569, 0.3));
    highlightGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.roundRect(-towerWidth / 2 + 3 * (size / 64), -towerHeight / 2 + 3 * (size / 64), towerWidth - 6 * (size / 64), towerHeight * 0.35, towerWidth * 0.4);
    ctx.fill();
    
    // 添加装饰线条（增强科技感）
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.4);
    ctx.lineWidth = 1;
    for (let i = 0; i < 2; i++) {
      const lineY = -towerHeight / 2 + towerHeight * (0.35 + i * 0.25);
      ctx.beginPath();
      ctx.moveTo(-towerWidth / 2 + 4 * (size / 64), lineY);
      ctx.lineTo(towerWidth / 2 - 4 * (size / 64), lineY);
      ctx.stroke();
    }
    
    // 观察窗（3个，带辉光）
    const windowWidth = towerWidth * 0.28;
    const windowHeight = towerHeight * 0.16;
    
    for (let i = 0; i < 3; i++) {
      const wy = -towerHeight * 0.3 + i * windowHeight * 1.25;
      
      // 外层辉光（增强发光效果）
      ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ALLY_DETAIL, 0.35);
      ctx.beginPath();
      ctx.roundRect(-windowWidth / 2 - 2, wy - 2, windowWidth + 4, windowHeight + 4, windowHeight * 0.5);
      ctx.fill();
      
      // 中层辉光
      ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ALLY_DETAIL, 0.25);
      ctx.beginPath();
      ctx.roundRect(-windowWidth / 2 - 1, wy - 1, windowWidth + 2, windowHeight + 2, windowHeight * 0.5);
      ctx.fill();
      
      // 窗口主体（使用渐变）
      const windowGradient = ctx.createRadialGradient(0, wy, 0, 0, wy, windowWidth / 2);
      windowGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.ALLY_DETAIL, 1));
      windowGradient.addColorStop(0.7, ColorUtils.hexToCanvas(GameColors.ALLY_DETAIL, 0.9));
      windowGradient.addColorStop(1, ColorUtils.hexToCanvas(0x0ea5e9, 0.7));
      ctx.fillStyle = windowGradient;
      ctx.beginPath();
      ctx.roundRect(-windowWidth / 2, wy, windowWidth, windowHeight, windowHeight * 0.4);
      ctx.fill();
      
      // 窗口边框（增强发光）
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x0ea5e9, 1);
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 4;
      ctx.shadowColor = ColorUtils.hexToCanvas(0x0ea5e9, 0.6);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // 内部高光点
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(0, wy, windowWidth * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 侧翼装甲（左右尾翼）
    const finWidth = towerWidth * 0.28;
    const finHeight = towerHeight * 0.45;
    const finOffsetX = towerWidth * 0.75;
    
    // 左尾翼（增强渐变和发光）
    const finGradient = ctx.createLinearGradient(-finOffsetX - finWidth / 2, -finHeight / 2, -finOffsetX + finWidth / 2, finHeight / 2);
    finGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.9));
    finGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 1));
    finGradient.addColorStop(1, ColorUtils.hexToCanvas(0xff00ff, 0.85));
    ctx.fillStyle = finGradient;
    ctx.beginPath();
    ctx.roundRect(-finOffsetX - finWidth / 2, -finHeight / 2, finWidth, finHeight, finWidth * 0.5);
    ctx.fill();
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 1);
    ctx.lineWidth = 2;
    ctx.shadowBlur = 6;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.5);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 右尾翼（增强渐变和发光）
    ctx.fillStyle = finGradient;
    ctx.beginPath();
    ctx.roundRect(finOffsetX - finWidth / 2, -finHeight / 2, finWidth, finHeight, finWidth * 0.5);
    ctx.fill();
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 1);
    ctx.lineWidth = 2;
    ctx.shadowBlur = 6;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.5);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  
  /**
   * 绘制发射轨道
   */
  static drawLaunchRails(ctx, detailColor, size, towerWidth, towerHeight) {
    // 发射导轨（深色矩形）
    ctx.fillStyle = ColorUtils.hexToCanvas(0x0f172a);
    ctx.beginPath();
    ctx.roundRect(-towerWidth * 0.7, -towerHeight * 0.05, towerWidth * 1.4, towerHeight * 0.22, towerHeight * 0.08);
    ctx.fill();
    
    // 导轨边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x334155, 0.6);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  /**
   * 绘制火箭弹头
   */
  static drawRocketWarhead(ctx, towerColor, detailColor, size, towerWidth, towerHeight) {
    const rocketBulletColor = ColorUtils.hexToCanvas(GameColors.ROCKET_BULLET);
    
    // 弹头主体（圆角矩形）
    ctx.fillStyle = rocketBulletColor;
    ctx.beginPath();
    ctx.roundRect(-towerWidth * 0.26, -towerHeight * 0.44, towerWidth * 0.52, towerHeight * 0.38, towerWidth * 0.26);
    ctx.fill();
    
    // 弹头边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_TOWER, 0.8);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // 弹头条纹（2条黑色条纹）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(-towerWidth * 0.22, -towerHeight * 0.35, towerWidth * 0.44, 2 * (size / 64));
    ctx.fillRect(-towerWidth * 0.22, -towerHeight * 0.25, towerWidth * 0.44, 2 * (size / 64));
    
    // 顶部雷达/天线（增强发光和脉冲效果）
    const radarY = -towerHeight * 0.52;
    const radarY2 = -towerHeight * 0.6;
    
    // 最外层光晕（增强）
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.25);
    ctx.beginPath();
    ctx.arc(0, radarY, towerWidth * 0.32, 0, Math.PI * 2);
    ctx.fill();
    
    // 第一层光环
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.2);
    ctx.beginPath();
    ctx.arc(0, radarY, towerWidth * 0.28, 0, Math.PI * 2);
    ctx.fill();
    
    // 第二层光环（使用径向渐变）
    const radarGradient = ctx.createRadialGradient(0, radarY, 0, 0, radarY, towerWidth * 0.22);
    radarGradient.addColorStop(0, ColorUtils.hexToCanvas(0xfef3c7, 1));
    radarGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0xfbbf24, 0.95));
    radarGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.8));
    ctx.fillStyle = radarGradient;
    ctx.beginPath();
    ctx.arc(0, radarY, towerWidth * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.9);
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 4;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.5);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 第三层光环（增强）
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.4);
    ctx.beginPath();
    ctx.arc(0, radarY2, towerWidth * 0.16, 0, Math.PI * 2);
    ctx.fill();
    
    const innerRadarGradient = ctx.createRadialGradient(0, radarY2, 0, 0, radarY2, towerWidth * 0.12);
    innerRadarGradient.addColorStop(0, ColorUtils.hexToCanvas(0xfef3c7, 1));
    innerRadarGradient.addColorStop(0.7, ColorUtils.hexToCanvas(0xfbbf24, 0.9));
    innerRadarGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.7));
    ctx.fillStyle = innerRadarGradient;
    ctx.beginPath();
    ctx.arc(0, radarY2, towerWidth * 0.12, 0, Math.PI * 2);
    ctx.fill();
    
    // 核心点（增强发光）
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.shadowBlur = 8;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.8);
    ctx.beginPath();
    ctx.arc(0, radarY2, towerWidth * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

