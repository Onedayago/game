/**
 * 敌人生成特效
 * 使用离屏Canvas优化
 */

import { GameConfig } from '../config/GameConfig';
import { GameColors } from '../config/Colors';
import { ColorUtils } from '../config/Colors';

export class EnemySpawnEffect {
  // 离屏Canvas缓存（静态部分）
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _initialized = false;
  
  constructor(ctx, x, y, enemyType) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.enemyType = enemyType;
    this.duration = 600; // 特效持续时间（毫秒）
    this.elapsed = 0;
    this.size = GameConfig.CELL_SIZE * 1.5; // 特效尺寸
    
    // 初始化缓存
    if (!EnemySpawnEffect._initialized) {
      EnemySpawnEffect.initCache();
    }
  }
  
  /**
   * 初始化离屏Canvas缓存
   */
  static initCache() {
    if (EnemySpawnEffect._initialized) {
      return;
    }
    
    const size = GameConfig.CELL_SIZE * 2;
    EnemySpawnEffect._cachedCanvas = wx.createCanvas();
    EnemySpawnEffect._cachedCanvas.width = size;
    EnemySpawnEffect._cachedCanvas.height = size;
    EnemySpawnEffect._cachedCtx = EnemySpawnEffect._cachedCanvas.getContext('2d');
    
    EnemySpawnEffect._cachedCtx.clearRect(0, 0, size, size);
    
    const centerX = size / 2;
    const centerY = size / 2;
    const maxRadius = size / 2;
    
    // 绘制多层圆形光晕（静态部分）
    for (let i = 0; i < 5; i++) {
      const radius = maxRadius * (0.3 + i * 0.15);
      const alpha = 0.2 - i * 0.03;
      const gradient = EnemySpawnEffect._cachedCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.ENEMY_TANK, alpha));
      gradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, alpha * 0.5));
      gradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.ENEMY_TANK, 0));
      EnemySpawnEffect._cachedCtx.fillStyle = gradient;
      EnemySpawnEffect._cachedCtx.beginPath();
      EnemySpawnEffect._cachedCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      EnemySpawnEffect._cachedCtx.fill();
    }
    
    EnemySpawnEffect._initialized = true;
  }
  
  /**
   * 更新特效
   */
  update(deltaTime, deltaMS) {
    this.elapsed += deltaMS;
  }
  
  /**
   * 检查特效是否结束
   */
  isFinished() {
    return this.elapsed >= this.duration;
  }
  
  /**
   * 渲染特效
   */
  render(offsetX = 0, offsetY = 0) {
    if (this.isFinished()) {
      return;
    }
    
    const progress = this.elapsed / this.duration;
    const renderX = this.x + offsetX;
    const renderY = this.y + offsetY;
    
    this.ctx.save();
    
    // 缩放动画（从0到1，然后稍微放大）
    let scale = 0;
    if (progress < 0.3) {
      // 出现阶段：快速放大
      scale = (progress / 0.3) * 1.2;
    } else if (progress < 0.7) {
      // 稳定阶段：稍微回弹
      scale = 1.2 - ((progress - 0.3) / 0.4) * 0.2;
    } else {
      // 消失阶段：淡出
      scale = 1.0 - ((progress - 0.7) / 0.3) * 0.3;
    }
    
    // 透明度动画
    let alpha = 1;
    if (progress < 0.2) {
      alpha = progress / 0.2; // 淡入
    } else if (progress > 0.8) {
      alpha = 1 - (progress - 0.8) / 0.2; // 淡出
    }
    
    this.ctx.globalAlpha = alpha;
    this.ctx.translate(renderX, renderY);
    this.ctx.scale(scale, scale);
    
    // 使用缓存的静态部分
    if (EnemySpawnEffect._initialized && EnemySpawnEffect._cachedCanvas) {
      this.ctx.drawImage(
        EnemySpawnEffect._cachedCanvas,
        -EnemySpawnEffect._cachedCanvas.width / 2,
        -EnemySpawnEffect._cachedCanvas.height / 2
      );
    }
    
    // 绘制动态粒子环
    const particleCount = 12;
    const particleRadius = 3;
    const ringRadius = this.size * 0.4 * (1 + progress * 0.5);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + progress * Math.PI * 2;
      const px = Math.cos(angle) * ringRadius;
      const py = Math.sin(angle) * ringRadius;
      
      const particleAlpha = alpha * (1 - progress * 0.5);
      const gradient = this.ctx.createRadialGradient(px, py, 0, px, py, particleRadius);
      gradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, particleAlpha));
      gradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.ENEMY_TANK, 0));
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(px, py, particleRadius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // 绘制中心闪光
    const flashSize = this.size * 0.3 * (1 - progress * 0.7);
    const flashGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, flashSize);
    flashGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, alpha * 0.8));
    flashGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, alpha * 0.4));
    flashGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.ENEMY_TANK, 0));
    this.ctx.fillStyle = flashGradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, flashSize, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }
}

