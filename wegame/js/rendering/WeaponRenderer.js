/**
 * 武器渲染器
 * 负责所有武器的视觉绘制
 */

import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';
import { WeaponType } from '../config/WeaponConfig';
import { ColorUtils, GameColors } from '../config/Colors';
import { polyfillRoundRect } from '../utils/CanvasUtils';
import { RocketTowerRenderer } from './RocketTowerRenderer';
import { LaserTowerRenderer } from './LaserTowerRenderer';

class WeaponRenderer {
  // 离屏Canvas缓存（血条）
  static _healthBarBackgroundCache = null; // 背景缓存
  static _healthBarForegroundCaches = {}; // 前景缓存 { color: canvas }
  static _healthBarCacheWidth = 0;
  static _healthBarCacheHeight = 0;
  static _healthBarInitialized = false;
  
  /**
   * 初始化血条缓存
   * @param {number} maxEntitySize - 最大实体尺寸（用于确定缓存尺寸）
   */
  static initHealthBarCache(maxEntitySize = 100) {
    if (this._healthBarInitialized) {
      return; // 已经初始化
    }
    
    try {
      const barWidth = maxEntitySize * UIConfig.HP_BAR_WIDTH_RATIO;
      const barHeight = UIConfig.HP_BAR_HEIGHT;
      
      this._healthBarCacheWidth = Math.ceil(barWidth);
      this._healthBarCacheHeight = Math.ceil(barHeight);
      
      // 创建背景缓存
      if (typeof wx !== 'undefined') {
        this._healthBarBackgroundCache = wx.createCanvas();
      } else {
        this._healthBarBackgroundCache = document.createElement('canvas');
      }
      this._healthBarBackgroundCache.width = this._healthBarCacheWidth;
      this._healthBarBackgroundCache.height = this._healthBarCacheHeight;
      const bgCtx = this._healthBarBackgroundCache.getContext('2d');
      
      // 绘制背景到缓存
      polyfillRoundRect(bgCtx);
      bgCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      bgCtx.beginPath();
      bgCtx.roundRect(0, 0, this._healthBarCacheWidth, this._healthBarCacheHeight, 3);
      bgCtx.fill();
      
      // 创建不同颜色的前景缓存（满长度）
      const colors = {
        healthy: GameColors.ENEMY_DETAIL || 0x00ff00, // 绿色
        warning: 0xfbbf24, // 琥珀色
        critical: GameColors.DANGER || 0xff0000 // 红色
      };
      
      for (const [key, color] of Object.entries(colors)) {
        if (typeof wx !== 'undefined') {
          this._healthBarForegroundCaches[key] = wx.createCanvas();
        } else {
          this._healthBarForegroundCaches[key] = document.createElement('canvas');
        }
        this._healthBarForegroundCaches[key].width = this._healthBarCacheWidth;
        this._healthBarForegroundCaches[key].height = this._healthBarCacheHeight;
        const fgCtx = this._healthBarForegroundCaches[key].getContext('2d');
        
        // 绘制前景到缓存
        polyfillRoundRect(fgCtx);
        fgCtx.fillStyle = ColorUtils.hexToCanvas(color, 0.95);
        fgCtx.beginPath();
        fgCtx.roundRect(0, 0, this._healthBarCacheWidth, this._healthBarCacheHeight, 3);
        fgCtx.fill();
      }
      
      this._healthBarInitialized = true;
    } catch (e) {
      console.warn('血条缓存初始化失败:', e);
      this._healthBarInitialized = false;
    }
  }
  
  /**
   * 从缓存渲染血条背景
   */
  static renderHealthBarBackgroundFromCache(ctx, x, y, entitySize) {
    if (!this._healthBarBackgroundCache || !this._healthBarInitialized) {
      return false;
    }
    
    const barWidth = entitySize * UIConfig.HP_BAR_WIDTH_RATIO;
    const offsetY = entitySize / 2 + entitySize * 0.2;
    const barY = y - offsetY;
    
    ctx.drawImage(
      this._healthBarBackgroundCache,
      x - barWidth / 2,
      barY - this._healthBarCacheHeight / 2,
      barWidth,
      this._healthBarCacheHeight
    );
    
    return true;
  }
  
  /**
   * 从缓存渲染血条前景
   */
  static renderHealthBarForegroundFromCache(ctx, x, y, entitySize, ratio) {
    if (!this._healthBarInitialized || ratio <= 0) {
      return false;
    }
    
    // 确定颜色
    let colorKey;
    if (ratio <= UIConfig.HP_BAR_CRITICAL_THRESHOLD) {
      colorKey = 'critical';
    } else if (ratio <= UIConfig.HP_BAR_WARNING_THRESHOLD) {
      colorKey = 'warning';
    } else {
      colorKey = 'healthy';
    }
    
    const foregroundCache = this._healthBarForegroundCaches[colorKey];
    if (!foregroundCache) {
      return false;
    }
    
    const barWidth = entitySize * UIConfig.HP_BAR_WIDTH_RATIO;
    const offsetY = entitySize / 2 + entitySize * 0.2;
    const barY = y - offsetY;
    const actualWidth = barWidth * ratio;
    
    // 使用 drawImage 的裁剪参数直接绘制部分前景
    // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    // sx, sy, sWidth, sHeight: 源图像裁剪区域
    // dx, dy, dWidth, dHeight: 目标画布绘制区域
    const sourceX = 0;
    const sourceY = 0;
    const sourceWidth = this._healthBarCacheWidth * ratio; // 源图像裁剪宽度
    const sourceHeight = this._healthBarCacheHeight;
    const destX = x - barWidth / 2;
    const destY = barY - this._healthBarCacheHeight / 2;
    const destWidth = actualWidth; // 目标绘制宽度
    const destHeight = this._healthBarCacheHeight;
    
    ctx.drawImage(
      foregroundCache,
      sourceX,           // 源图像 X
      sourceY,           // 源图像 Y
      sourceWidth,       // 源图像宽度
      sourceHeight,      // 源图像高度
      destX,             // 目标 X
      destY,             // 目标 Y
      destWidth,         // 目标宽度
      destHeight         // 目标高度
    );
    
    return true;
  }
  
  /**
   * 渲染火箭塔
   * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
   * @param {number} x - Canvas 坐标系 X
   * @param {number} y - Canvas 坐标系 Y（从上往下）
   * @param {number} size - 尺寸
   * @param {number} level - 等级
   */
  static renderRocketTower(ctx, x, y, size, level = 1) {
    RocketTowerRenderer.render(ctx, x, y, size, level);
  }
  
  /**
   * 渲染激光塔
   * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
   * @param {number} x - Canvas 坐标系 X
   * @param {number} y - Canvas 坐标系 Y（从上往下）
   * @param {number} size - 尺寸
   * @param {number} level - 等级
   */
  static renderLaserTower(ctx, x, y, size, level = 1) {
    LaserTowerRenderer.render(ctx, x, y, size, level);
  }
  
  /**
   * 渲染武器图标（用于 UI）
   */
  static renderWeaponIcon(ctx, x, y, weaponType, size) {
    if (weaponType === WeaponType.ROCKET) {
      this.renderRocketTower(ctx, x, y, size, 1);
    } else if (weaponType === WeaponType.LASER) {
      this.renderLaserTower(ctx, x, y, size, 1);
    }
  }
  
  /**
   * 渲染血条（优化：使用离屏Canvas缓存）
   * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
   * @param {number} x - Canvas 坐标系 X
   * @param {number} y - Canvas 坐标系 Y（从上往下）
   * @param {number} hp - 当前血量
   * @param {number} maxHp - 最大血量
   * @param {number} entitySize - 实体尺寸
   */
  static renderHealthBar(ctx, x, y, hp, maxHp, entitySize) {
    const ratio = Math.max(hp / maxHp, 0);
    
    // 尝试使用缓存渲染
    const bgRendered = this.renderHealthBarBackgroundFromCache(ctx, x, y, entitySize);
    if (bgRendered && ratio > 0) {
      this.renderHealthBarForegroundFromCache(ctx, x, y, entitySize, ratio);
      return;
    }
    
    // 回退到直接渲染
    this.renderHealthBarDirect(ctx, x, y, hp, maxHp, entitySize);
  }
  
  /**
   * 直接渲染血条（回退方案）
   */
  static renderHealthBarDirect(ctx, x, y, hp, maxHp, entitySize) {
    polyfillRoundRect(ctx);
    const barWidth = entitySize * UIConfig.HP_BAR_WIDTH_RATIO;
    const barHeight = UIConfig.HP_BAR_HEIGHT;
    const offsetY = entitySize / 2 + entitySize * 0.2; // 实体顶部 + 间隔（Canvas 坐标系中向上，Y 值更小）
    
    const barX = x;
    // 在 Canvas 坐标系中，血条应该在实体上方（Y 值更小，所以减去 offsetY）
    const barY = y - offsetY;
    
    // 绘制背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(barX - barWidth / 2, barY - barHeight / 2, barWidth, barHeight, 3);
    ctx.fill();
    
    // 绘制血条
    const ratio = Math.max(hp / maxHp, 0);
    if (ratio > 0) {
      let hpColor;
      if (ratio <= UIConfig.HP_BAR_CRITICAL_THRESHOLD) {
        hpColor = GameColors.DANGER || 0xff0000;
      } else if (ratio <= UIConfig.HP_BAR_WARNING_THRESHOLD) {
        hpColor = 0xfbbf24; // 琥珀色
      } else {
        hpColor = GameColors.ENEMY_DETAIL;
      }
      
      ctx.fillStyle = ColorUtils.hexToCanvas(hpColor, 0.95);
      ctx.roundRect(barX - barWidth / 2, barY - barHeight / 2, barWidth * ratio, barHeight, 3);
      ctx.fill();
    }
  }
}

export { WeaponRenderer };
export default WeaponRenderer;

