/**
 * 激光束
 */

import { GameConfig } from '../config/GameConfig';
import { ColorUtils, GameColors } from '../config/Colors';

export class LaserBeam {
  // 离屏Canvas缓存（能量球）
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _cacheRadius = 2; // 能量球半径
  static _initialized = false;
  
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
   * 初始化激光束缓存（参考敌人子弹样式：圆形能量球）
   */
  static initCache() {
    if (this._initialized) {
      return; // 已经初始化
    }
    
    try {
      const radius = this._cacheRadius;
      const canvasSize = Math.ceil(radius * 6); // 包含尾迹和发光效果
      
      if (typeof wx !== 'undefined') {
        this._cachedCanvas = wx.createCanvas();
        this._cachedCanvas.width = canvasSize;
        this._cachedCanvas.height = canvasSize;
      } else {
        this._cachedCanvas = document.createElement('canvas');
        this._cachedCanvas.width = canvasSize;
        this._cachedCanvas.height = canvasSize;
      }
      
      this._cachedCtx = this._cachedCanvas.getContext('2d');
      
      // 清空缓存Canvas
      this._cachedCtx.clearRect(0, 0, canvasSize, canvasSize);
      
      // 绘制能量球到缓存（居中，参考敌人子弹样式）
      const centerX = canvasSize / 2;
      const centerY = canvasSize / 2;
      
      // 绘制尾迹（多层发光效果）
      const trailGradient = this._cachedCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 2.5);
      trailGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.4));
      trailGradient.addColorStop(0.6, ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.2));
      trailGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0));
      this._cachedCtx.fillStyle = trailGradient;
      this._cachedCtx.beginPath();
      this._cachedCtx.arc(centerX, centerY, radius * 2.5, 0, Math.PI * 2);
      this._cachedCtx.fill();
      
      // 绘制外层发光
      this._cachedCtx.fillStyle = ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.5);
      this._cachedCtx.beginPath();
      this._cachedCtx.arc(centerX, centerY, radius * 1.8, 0, Math.PI * 2);
      this._cachedCtx.fill();
      
      // 绘制中层发光
      this._cachedCtx.fillStyle = ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.7);
      this._cachedCtx.beginPath();
      this._cachedCtx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
      this._cachedCtx.fill();
      
      // 绘制能量球主体（渐变）
      const bodyGradient = this._cachedCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      bodyGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.8));
      bodyGradient.addColorStop(0.4, ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 1));
      bodyGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.9));
      this._cachedCtx.fillStyle = bodyGradient;
      this._cachedCtx.beginPath();
      this._cachedCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this._cachedCtx.fill();
      
      // 绘制高光
      this._cachedCtx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.7);
      this._cachedCtx.beginPath();
      this._cachedCtx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.5, 0, Math.PI * 2);
      this._cachedCtx.fill();
      
      this._initialized = true;
    } catch (e) {
      console.warn('激光束缓存初始化失败:', e);
      this._initialized = false;
    }
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
   * 渲染激光束（带视锥剔除，优化：使用离屏Canvas缓存，应用战场偏移）
   */
  render(viewLeft = -Infinity, viewRight = Infinity, viewTop = -Infinity, viewBottom = Infinity, offsetX = 0, offsetY = 0) {
    if (this.destroyed) return;
    
    // 应用战场偏移
    const x1 = this.x1 + offsetX;
    const y1 = this.y1 + offsetY;
    const x2 = this.x2 + offsetX;
    const y2 = this.y2 + offsetY;
    
    // 视锥剔除：只渲染屏幕内的激光束（考虑战场偏移）
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    
    if (maxX < viewLeft || minX > viewRight ||
        maxY < viewTop || minY > viewBottom) {
      return;
    }
    
    // 初始化缓存（如果未初始化）
    if (!LaserBeam._initialized) {
      LaserBeam.initCache();
    }
    
    // 使用缓存渲染
    LaserBeam.renderFromCache(this.ctx, x1, y1, x2, y2);
  }
}

