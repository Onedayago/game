/**
 * 激光束渲染器
 * 负责激光束的视觉绘制（带离屏缓存优化）
 */

import { ColorUtils, GameColors } from '../../config/Colors';

export class LaserBeamRenderer {
  // 离屏Canvas缓存（能量球）
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _cacheRadius = 2; // 能量球半径
  static _initialized = false;
  
  /**
   * 初始化激光束缓存（参考敌人子弹样式：圆形能量球）
   */
  static initCache() {
    if (this._initialized) {
      return; // 已经初始化
    }
    
    const radius = this._cacheRadius;
    const canvasSize = Math.ceil(radius * 6);
    
    this._cachedCanvas = wx.createCanvas();
    this._cachedCanvas.width = canvasSize;
    this._cachedCanvas.height = canvasSize;
    
    this._cachedCtx = this._cachedCanvas.getContext('2d');
    
    this._cachedCtx.clearRect(0, 0, canvasSize, canvasSize);
    
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    
    const trailGradient = this._cachedCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 2.5);
    trailGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.4));
    trailGradient.addColorStop(0.6, ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.2));
    trailGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0));
    this._cachedCtx.fillStyle = trailGradient;
    this._cachedCtx.beginPath();
    this._cachedCtx.arc(centerX, centerY, radius * 2.5, 0, Math.PI * 2);
    this._cachedCtx.fill();
    
    this._cachedCtx.fillStyle = ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.5);
    this._cachedCtx.beginPath();
    this._cachedCtx.arc(centerX, centerY, radius * 1.8, 0, Math.PI * 2);
    this._cachedCtx.fill();
    
    this._cachedCtx.fillStyle = ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.7);
    this._cachedCtx.beginPath();
    this._cachedCtx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
    this._cachedCtx.fill();
    
    const bodyGradient = this._cachedCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    bodyGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.8));
    bodyGradient.addColorStop(0.4, ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 1));
    bodyGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.9));
    this._cachedCtx.fillStyle = bodyGradient;
    this._cachedCtx.beginPath();
    this._cachedCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this._cachedCtx.fill();
    
    this._cachedCtx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.7);
    this._cachedCtx.beginPath();
    this._cachedCtx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.5, 0, Math.PI * 2);
    this._cachedCtx.fill();
    
    this._initialized = true;
  }
  
  /**
   * 从缓存渲染激光束（使用能量球沿路径排列）
   * 确保从武器位置（x1, y1）绘制到敌人位置（x2, y2）
   */
  static renderFromCache(ctx, x1, y1, x2, y2) {
    if (!this._cachedCanvas || !this._initialized) {
      return false;
    }
    
    // 计算长度和角度
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length <= 0) return false;
    
    const canvasSize = this._cachedCanvas.width;
    const halfSize = canvasSize * 0.5;
    const radius = this._cacheRadius;
    
    // 计算能量球之间的间距（稍微重叠，形成连续效果）
    const spacing = radius * 1.5;
    const numBalls = Math.ceil(length / spacing);
    
    // 计算每个能量球在路径上的位置
    const cos = dx / length;
    const sin = dy / length;
    
    // 绘制能量球沿路径排列
    for (let i = 0; i <= numBalls; i++) {
      const t = i / numBalls; // 0 到 1 的进度
      const ballX = x1 + dx * t;
      const ballY = y1 + dy * t;
      
      // 使用 drawImage 绘制能量球
      ctx.drawImage(
        this._cachedCanvas,
        ballX - halfSize,
        ballY - halfSize,
        canvasSize,
        canvasSize
      );
    }
    
    return true;
  }
  
  /**
   * 渲染激光束
   */
  static render(ctx, x1, y1, x2, y2) {
    if (!this._initialized) {
      this.initCache();
    }
    
    this.renderFromCache(ctx, x1, y1, x2, y2);
  }
}

