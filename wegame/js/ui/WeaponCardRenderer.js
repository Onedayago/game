/**
 * 武器卡片渲染器
 * 负责武器卡片的视觉绘制
 */

import { UIConfig } from '../config/UIConfig';
import { WeaponConfigs } from '../config/WeaponConfig';
import { ColorUtils, GameColors } from '../config/Colors';
import { polyfillRoundRect } from '../utils/CanvasUtils';

export class WeaponCardRenderer {
  // 离屏Canvas缓存（按武器类型和尺寸缓存）
  static _cachedCanvases = {}; // { 'weaponType_size': canvas }
  static _cachedCtxs = {}; // { 'weaponType_size': ctx }
  
  /**
   * 获取缓存键
   */
  static getCacheKey(weaponType, size) {
    return `${weaponType}_${size}`;
  }
  
  /**
   * 初始化武器卡片渲染缓存
   */
  static initCache(weaponType, size) {
    const cacheKey = this.getCacheKey(weaponType, size);
    
    if (this._cachedCanvases[cacheKey]) {
      return; // 已经初始化
    }
    
    try {
      const canvasSize = Math.ceil(size * 1.1); // 包含阴影
      
      const canvas = wx.createCanvas();
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      
      const ctx = canvas.getContext('2d');
      this._cachedCanvases[cacheKey] = canvas;
      this._cachedCtxs[cacheKey] = ctx;
      
      // 清空缓存Canvas
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      
      // 绘制武器卡片到缓存
      polyfillRoundRect(ctx);
      this.drawCardToCache(ctx, weaponType, size, 0, 0);
    } catch (e) {
      console.warn('武器卡片渲染缓存初始化失败:', e);
    }
  }
  
  /**
   * 绘制武器卡片到缓存Canvas
   */
  static drawCardToCache(ctx, weaponType, size, offsetX, offsetY) {
    const config = WeaponConfigs.getConfig(weaponType);
    if (!config) return;
    
    const radius = UIConfig.CARD_RADIUS;
    const x = offsetX;
    const y = offsetY;
    
    // 绘制多层阴影（增强立体感）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    WeaponCardRenderer.roundRect(ctx, x + 3, y + 3, size, size, radius);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    WeaponCardRenderer.roundRect(ctx, x + 2, y + 2, size, size, radius);
    ctx.fill();
    
    // 绘制渐变背景
    const gradient = ctx.createLinearGradient(x, y, x, y + size);
    gradient.addColorStop(0, 'rgba(65, 70, 85, 0.95)');
    gradient.addColorStop(0.3, 'rgba(45, 50, 60, 0.93)');
    gradient.addColorStop(0.7, 'rgba(35, 40, 50, 0.92)');
    gradient.addColorStop(1, 'rgba(25, 30, 40, 0.9)');
    ctx.fillStyle = gradient;
    WeaponCardRenderer.roundRect(ctx, x, y, size, size, radius);
    ctx.fill();
    
    // 绘制卡片边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.6);
    ctx.lineWidth = UIConfig.CARD_BORDER_WIDTH * 1.2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.5);
    WeaponCardRenderer.roundRect(ctx, x, y, size, size, radius);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 绘制内部高光边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.3);
    ctx.lineWidth = 1;
    WeaponCardRenderer.roundRect(ctx, x + 1, y + 1, size - 2, size - 2, radius - 1);
    ctx.stroke();
    
    // 绘制武器图标
    const iconSize = size * 0.5;
    const iconX = x + size / 2;
    const iconY = y + size / 2 - size * 0.1;
    
    // 绘制图标背景（圆形，带渐变）
    const iconBgGradient = ctx.createRadialGradient(iconX, iconY, 0, iconX, iconY, iconSize / 2);
    const color = ColorUtils.hexToRgb(config.colorHex);
    iconBgGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`);
    iconBgGradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0.1)`);
    ctx.fillStyle = iconBgGradient;
    ctx.beginPath();
    ctx.arc(iconX, iconY, iconSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制图标边框（带发光）
    ctx.shadowBlur = 6;
    ctx.shadowColor = ColorUtils.hexToCanvas(config.colorHex, 0.7);
    ctx.strokeStyle = ColorUtils.hexToCanvas(config.colorHex, 0.6);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(iconX, iconY, iconSize / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 绘制武器图标文字（带阴影）
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.fillStyle = ColorUtils.hexToCanvas(config.colorHex);
    ctx.font = `bold ${size * 0.38}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.icon, iconX, iconY);
    ctx.shadowBlur = 0;
    
    // 绘制成本背景
    const costY = y + size * 0.75;
    const costBgHeight = size * 0.16;
    const costBgY = costY - costBgHeight / 2;
    
    // 成本背景渐变
    const costBgGradient = ctx.createLinearGradient(
      x + size * 0.15, costBgY,
      x + size * 0.15, costBgY + costBgHeight
    );
    costBgGradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    costBgGradient.addColorStop(0.5, 'rgba(20, 20, 30, 0.8)');
    costBgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = costBgGradient;
    WeaponCardRenderer.roundRect(ctx, x + size * 0.15, costBgY, size * 0.7, costBgHeight, size * 0.04);
    ctx.fill();
    
    // 成本背景边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xffd700, 0.4);
    ctx.lineWidth = 1;
    WeaponCardRenderer.roundRect(ctx, x + size * 0.15, costBgY, size * 0.7, costBgHeight, size * 0.04);
    ctx.stroke();
    
    // 绘制成本文字（带发光效果）
    ctx.shadowBlur = 6;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xffd700, 0.6);
    ctx.fillStyle = '#FFD700';
    ctx.font = `bold ${UIConfig.CARD_COST_FONT_SIZE}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${config.baseCost}`, x + size / 2, costY);
    ctx.shadowBlur = 0;
  }
  
  /**
   * 从缓存渲染武器卡片
   */
  static renderFromCache(ctx, x, y, weaponType, size) {
    const cacheKey = this.getCacheKey(weaponType, size);
    const cachedCanvas = this._cachedCanvases[cacheKey];
    
    if (!cachedCanvas) return;
    
    ctx.drawImage(cachedCanvas, x, y, size, size);
  }
  
  /**
   * 渲染武器卡片
   */
  static renderCard(ctx, x, y, size, weaponType, isSelected) {
    // 初始化缓存（如果未初始化）
    if (!this._cachedCanvases[this.getCacheKey(weaponType, size)]) {
      this.initCache(weaponType, size);
    }
    
    // 使用缓存渲染
    this.renderFromCache(ctx, x, y, weaponType, size);
  }
  
  /**
   * 直接渲染武器卡片（已废弃，仅用于缓存初始化）
   */
  static renderCardDirect(ctx, x, y, size, weaponType, isSelected) {
    polyfillRoundRect(ctx);
    const config = WeaponConfigs.getConfig(weaponType);
    if (!config) return;
    
    ctx.save();
    
    // 绘制卡片背景（始终使用未选中状态的样式）
    const radius = UIConfig.CARD_RADIUS;
    
    // 绘制多层阴影（增强立体感）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    WeaponCardRenderer.roundRect(ctx, x + 3, y + 3, size, size, radius);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    WeaponCardRenderer.roundRect(ctx, x + 2, y + 2, size, size, radius);
    ctx.fill();
    
    // 绘制渐变背景（始终使用未选中状态的样式）
    const gradient = ctx.createLinearGradient(x, y, x, y + size);
    gradient.addColorStop(0, 'rgba(65, 70, 85, 0.95)');
    gradient.addColorStop(0.3, 'rgba(45, 50, 60, 0.93)');
    gradient.addColorStop(0.7, 'rgba(35, 40, 50, 0.92)');
    gradient.addColorStop(1, 'rgba(25, 30, 40, 0.9)');
    ctx.fillStyle = gradient;
    WeaponCardRenderer.roundRect(ctx, x, y, size, size, radius);
    ctx.fill();
    
    // 绘制卡片边框（始终使用未选中状态的样式）
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.6);
    ctx.lineWidth = UIConfig.CARD_BORDER_WIDTH * 1.2;
    
    // 外发光效果（始终使用未选中状态的样式）
    ctx.shadowBlur = 8;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.5);
    
    WeaponCardRenderer.roundRect(ctx, x, y, size, size, radius);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 绘制内部高光边框（始终使用未选中状态的样式）
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.3);
    ctx.lineWidth = 1;
    WeaponCardRenderer.roundRect(ctx, x + 1, y + 1, size - 2, size - 2, radius - 1);
    ctx.stroke();
    
    // 绘制武器图标（使用 WeaponRenderer）
    const iconSize = size * 0.5;
    const iconX = x + size / 2;
    const iconY = y + size / 2 - size * 0.1;
    
    // 绘制图标背景（圆形，带渐变）
    const iconBgGradient = ctx.createRadialGradient(iconX, iconY, 0, iconX, iconY, iconSize / 2);
    const color = ColorUtils.hexToRgb(config.colorHex);
    iconBgGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`);
    iconBgGradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0.1)`);
    ctx.fillStyle = iconBgGradient;
    ctx.beginPath();
    ctx.arc(iconX, iconY, iconSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制图标边框（带发光，始终使用未选中状态的样式）
    ctx.shadowBlur = 6;
    ctx.shadowColor = ColorUtils.hexToCanvas(config.colorHex, 0.7);
    ctx.strokeStyle = ColorUtils.hexToCanvas(config.colorHex, 0.6);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(iconX, iconY, iconSize / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 绘制武器图标文字（带阴影）
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.fillStyle = ColorUtils.hexToCanvas(config.colorHex);
    ctx.font = `bold ${size * 0.38}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.icon, iconX, iconY);
    ctx.shadowBlur = 0;
    
    // 绘制成本背景（更精致的设计）
    const costY = y + size * 0.75;
    const costBgHeight = size * 0.16;
    const costBgY = costY - costBgHeight / 2;
    
    // 成本背景渐变
    const costBgGradient = ctx.createLinearGradient(
      x + size * 0.15, costBgY,
      x + size * 0.15, costBgY + costBgHeight
    );
    costBgGradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    costBgGradient.addColorStop(0.5, 'rgba(20, 20, 30, 0.8)');
    costBgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = costBgGradient;
    WeaponCardRenderer.roundRect(ctx, x + size * 0.15, costBgY, size * 0.7, costBgHeight, size * 0.04);
    ctx.fill();
    
    // 成本背景边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xffd700, 0.4);
    ctx.lineWidth = 1;
    WeaponCardRenderer.roundRect(ctx, x + size * 0.15, costBgY, size * 0.7, costBgHeight, size * 0.04);
    ctx.stroke();
    
    // 绘制成本文字（带发光效果）
    // 确保文字颜色正确设置，使用明亮的金色
    ctx.shadowBlur = 6;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xffd700, 0.6);
    // 明确设置文字颜色为金色，确保完全不透明
    ctx.fillStyle = '#FFD700'; // 直接使用金色，避免颜色转换问题
    ctx.font = `bold ${UIConfig.CARD_COST_FONT_SIZE}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${config.baseCost}`, x + size / 2, costY);
    ctx.shadowBlur = 0;
    
    ctx.restore();
  }
  
  /**
   * 绘制圆角矩形
   */
  static roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

