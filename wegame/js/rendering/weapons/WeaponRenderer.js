/**
 * 武器渲染器
 * 负责所有武器的视觉绘制
 */

import { GameConfig } from '../../config/GameConfig';
import { UIConfig } from '../../config/UIConfig';
import { WeaponType } from '../../config/WeaponConfig';
import { ColorUtils, GameColors } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';
import { RocketTowerRenderer } from './RocketTowerRenderer';
import { LaserTowerRenderer } from './LaserTowerRenderer';
import { CannonTowerRenderer } from './CannonTowerRenderer';
import { SniperTowerRenderer } from './SniperTowerRenderer';
import { GameContext } from '../../core/GameContext';

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
    
    const barWidth = maxEntitySize * UIConfig.HP_BAR_WIDTH_RATIO;
    const barHeight = UIConfig.HP_BAR_HEIGHT;
    
    this._healthBarCacheWidth = Math.ceil(barWidth);
    this._healthBarCacheHeight = Math.ceil(barHeight);
    
    this._healthBarBackgroundCache = wx.createCanvas();
    this._healthBarBackgroundCache.width = this._healthBarCacheWidth;
    this._healthBarBackgroundCache.height = this._healthBarCacheHeight;
    const bgCtx = this._healthBarBackgroundCache.getContext('2d');
    
    polyfillRoundRect(bgCtx);
    bgCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    bgCtx.beginPath();
    bgCtx.roundRect(0, 0, this._healthBarCacheWidth, this._healthBarCacheHeight, 3);
    bgCtx.fill();
    
    const colors = {
      healthy: GameColors.ENEMY_DETAIL || 0x00ff00,
      warning: 0xfbbf24,
      critical: GameColors.DANGER || 0xff0000
    };
    
    for (const [key, color] of Object.entries(colors)) {
      this._healthBarForegroundCaches[key] = wx.createCanvas();
      this._healthBarForegroundCaches[key].width = this._healthBarCacheWidth;
      this._healthBarForegroundCaches[key].height = this._healthBarCacheHeight;
      const fgCtx = this._healthBarForegroundCaches[key].getContext('2d');
      
      polyfillRoundRect(fgCtx);
      fgCtx.fillStyle = ColorUtils.hexToCanvas(color, 0.95);
      fgCtx.beginPath();
      fgCtx.roundRect(0, 0, this._healthBarCacheWidth, this._healthBarCacheHeight, 3);
      fgCtx.fill();
    }
    
    this._healthBarInitialized = true;
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
   * 渲染选中指示器（高亮边框）
   */
  static renderSelectionIndicator(ctx, x, y, size) {
    const radius = size / 2 + 3;
    const lineWidth = 2;
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x00ff00, 0.8);
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // 内圈高光
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xffffff, 0.5);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, radius - 1, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  /**
   * 绘制单个按钮（参考 StartScreen 风格）
   */
  static drawButton(ctx, x, y, width, height, radius, text, color) {
    polyfillRoundRect(ctx);
    ctx.save();
    
    // 绘制按钮阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;
    
    // 绘制按钮背景（渐变）
    const btnGradient = ctx.createLinearGradient(
      x - width / 2, y - height / 2,
      x - width / 2, y + height / 2
    );
    btnGradient.addColorStop(0, ColorUtils.hexToCanvas(color, 0.95));
    btnGradient.addColorStop(0.5, ColorUtils.hexToCanvas(color, 0.85));
    btnGradient.addColorStop(1, ColorUtils.hexToCanvas(color, 0.75));
    ctx.fillStyle = btnGradient;
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y - height / 2, width, height, radius);
    ctx.fill();
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // 绘制按钮高光
    const highlightGradient = ctx.createLinearGradient(
      x - width / 2, y - height / 2,
      x - width / 2, y - height / 2 + height * 0.4
    );
    highlightGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.4));
    highlightGradient.addColorStop(1, ColorUtils.hexToCanvas(0xffffff, 0));
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y - height / 2, width, height * 0.4, radius);
    ctx.fill();
    
    // 绘制按钮边框（发光效果）
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.9);
    ctx.lineWidth = UIConfig.BORDER_WIDTH * 1.5;
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y - height / 2, width, height, radius);
    ctx.stroke();
    
    // 绘制按钮文字（带阴影）
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.TEXT_MAIN);
    ctx.font = `bold ${UIConfig.ACTION_BUTTON_FONT_SIZE}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.restore();
  }
  
  /**
   * 渲染升级/移除按钮（左右两个按钮）
   * @returns {Object} 返回按钮位置信息 { upgradeButton: {x, y, width, height}, sellButton: {x, y, width, height} }
   */
  static renderUpgradeHint(ctx, x, y, size, level, maxLevel, upgradeCost, sellGain) {
    const gameContext = GameContext.getInstance();
    const hasEnoughGold = gameContext.gold >= upgradeCost;
    const isMaxLevel = level >= maxLevel;
    
    // 按钮尺寸
    const buttonWidth = UIConfig.ACTION_BUTTON_WIDTH;
    const buttonHeight = UIConfig.ACTION_BUTTON_HEIGHT;
    const buttonRadius = UIConfig.ACTION_BUTTON_RADIUS;
    const buttonSpacing = size * 0.3; // 按钮之间的间距
    
    // 按钮Y位置（武器左右两侧，往上移动）
    const buttonY = y - size * 0.3;
    
    // 升级按钮（左侧）
    const upgradeButtonX = x - size / 2 - buttonWidth / 2 - buttonSpacing;
    let upgradeButtonColor;
    let upgradeButtonText;
    
    if (isMaxLevel) {
      // 满级时，升级按钮显示为灰色（不可用）
      upgradeButtonColor = 0x666666;
      upgradeButtonText = 'MAX';
    } else {
      upgradeButtonColor = hasEnoughGold ? 0x00c853 : 0xff4444; // 绿色或红色
      upgradeButtonText = `升级\n${upgradeCost}`;
    }
    
    // 出售按钮（右侧）
    const sellButtonX = x + size / 2 + buttonWidth / 2 + buttonSpacing;
    const sellButtonColor = 0xffd700; // 金色
    const sellButtonText = `出售\n${sellGain}`;
    
    // 绘制升级按钮
    if (!isMaxLevel) {
      this.drawButton(ctx, upgradeButtonX, buttonY, buttonWidth, buttonHeight, buttonRadius, upgradeButtonText, upgradeButtonColor);
    }
    
    // 绘制出售按钮
    this.drawButton(ctx, sellButtonX, buttonY, buttonWidth, buttonHeight, buttonRadius, sellButtonText, sellButtonColor);
    
    // 返回按钮位置信息（用于点击检测，位置是按钮左上角相对于武器中心 x, y 的偏移）
    return {
      upgradeButton: {
        x: upgradeButtonX - buttonWidth / 2 - x, // 按钮左上角相对于武器中心的偏移
        y: buttonY - buttonHeight / 2 - y, // 按钮左上角相对于武器中心的偏移
        width: buttonWidth,
        height: buttonHeight,
        enabled: !isMaxLevel
      },
      sellButton: {
        x: sellButtonX - buttonWidth / 2 - x, // 按钮左上角相对于武器中心的偏移
        y: buttonY - buttonHeight / 2 - y, // 按钮左上角相对于武器中心的偏移
        width: buttonWidth,
        height: buttonHeight,
        enabled: true
      }
    };
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
   * @param {number} angle - 旋转角度（弧度，0为向右）
   */
  static renderRocketTower(ctx, x, y, size, level = 1, angle = 0) {
    RocketTowerRenderer.render(ctx, x, y, size, level, angle);
  }
  
  /**
   * 渲染激光塔
   * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
   * @param {number} x - Canvas 坐标系 X
   * @param {number} y - Canvas 坐标系 Y（从上往下）
   * @param {number} size - 尺寸
   * @param {number} level - 等级
   * @param {number} angle - 旋转角度（弧度，0为向右）
   */
  static renderLaserTower(ctx, x, y, size, level = 1, angle = 0) {
    LaserTowerRenderer.render(ctx, x, y, size, level, angle);
  }
  
  /**
   * 渲染加农炮塔
   * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
   * @param {number} x - Canvas 坐标系 X
   * @param {number} y - Canvas 坐标系 Y（从上往下）
   * @param {number} size - 尺寸
   * @param {number} level - 等级
   * @param {number} angle - 旋转角度（弧度，0为向右）
   */
  static renderCannonTower(ctx, x, y, size, level = 1, angle = 0) {
    CannonTowerRenderer.render(ctx, x, y, size, level, angle);
  }
  
  /**
   * 渲染狙击塔
   * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
   * @param {number} x - Canvas 坐标系 X
   * @param {number} y - Canvas 坐标系 Y（从上往下）
   * @param {number} size - 尺寸
   * @param {number} level - 等级
   * @param {number} angle - 旋转角度（弧度，0为向右）
   */
  static renderSniperTower(ctx, x, y, size, level = 1, angle = 0) {
    SniperTowerRenderer.render(ctx, x, y, size, level, angle);
  }
  
  /**
   * 渲染武器图标（用于 UI）
   */
  static renderWeaponIcon(ctx, x, y, weaponType, size) {
    if (weaponType === WeaponType.ROCKET) {
      this.renderRocketTower(ctx, x, y, size, 1);
    } else if (weaponType === WeaponType.LASER) {
      this.renderLaserTower(ctx, x, y, size, 1);
    } else if (weaponType === WeaponType.CANNON) {
      this.renderCannonTower(ctx, x, y, size, 1);
    } else if (weaponType === WeaponType.SNIPER) {
      this.renderSniperTower(ctx, x, y, size, 1);
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
    
    // 使用缓存渲染
    this.renderHealthBarBackgroundFromCache(ctx, x, y, entitySize);
    if (ratio > 0) {
      this.renderHealthBarForegroundFromCache(ctx, x, y, entitySize, ratio);
    }
  }
}

export { WeaponRenderer };
export default WeaponRenderer;

