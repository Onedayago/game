/**
 * 暂停按钮组件
 * 负责暂停按钮的渲染和缓存管理
 */

import { GameConfig } from '../../config/GameConfig';
import { UIConfig } from '../../config/UIConfig';
import { ColorUtils } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class PauseButton {
  // 离屏Canvas缓存
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _initialized = false;
  
  static get BUTTON_SIZE() {
    return UIConfig.PAUSE_BUTTON_SIZE;
  }
  static get BUTTON_RADIUS() {
    return UIConfig.PAUSE_BUTTON_RADIUS;
  }
  static get BUTTON_X_OFFSET() {
    return UIConfig.PAUSE_BUTTON_X_OFFSET;
  }
  static get BUTTON_Y_OFFSET() {
    return UIConfig.PAUSE_BUTTON_Y_OFFSET;
  }
  
  /**
   * 初始化缓存
   */
  static initCache() {
    if (this._initialized) {
      return;
    }
    
    const buttonSize = this.BUTTON_SIZE;
    const canvasSize = buttonSize + UIConfig.CACHE_PADDING;
    
    const canvas = wx.createCanvas();
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    const ctx = canvas.getContext('2d');
    this._cachedCanvas = canvas;
    this._cachedCtx = ctx;
    
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    polyfillRoundRect(ctx);
    const offsetX = (canvasSize - buttonSize) / 2;
    const offsetY = (canvasSize - buttonSize) / 2;
    const radius = this.BUTTON_RADIUS;
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;
    
    const bgGradient = ctx.createLinearGradient(offsetX, offsetY, offsetX, offsetY + buttonSize);
    bgGradient.addColorStop(0, 'rgba(30, 35, 45, 0.9)');
    bgGradient.addColorStop(1, 'rgba(20, 25, 35, 0.85)');
    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    ctx.roundRect(offsetX, offsetY, buttonSize, buttonSize, radius);
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.shadowBlur = 6;
    ctx.shadowColor = ColorUtils.hexToCanvas(0x9d00ff, 0.5);
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x9d00ff, 0.8);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(offsetX, offsetY, buttonSize, buttonSize, radius);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    const iconWidth = UIConfig.PAUSE_ICON_WIDTH;
    const iconHeight = UIConfig.PAUSE_ICON_HEIGHT;
    const iconX = offsetX + buttonSize / 2 - iconWidth - UIConfig.PAUSE_ICON_SPACING / 2;
    const iconY = offsetY + buttonSize / 2 - iconHeight / 2;
    
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 1.0);
    ctx.fillRect(iconX, iconY, iconWidth, iconHeight);
    ctx.fillRect(iconX + iconWidth + UIConfig.PAUSE_ICON_SPACING, iconY, iconWidth, iconHeight);
    
    this._initialized = true;
  }
  
  /**
   * 渲染暂停按钮
   */
  static render(ctx) {
    const buttonSize = this.BUTTON_SIZE;
    const buttonX = GameConfig.DESIGN_WIDTH - buttonSize - this.BUTTON_X_OFFSET;
    const buttonY = this.BUTTON_Y_OFFSET;
    const canvasSize = buttonSize + UIConfig.CACHE_PADDING;
    const offsetX = (canvasSize - buttonSize) / 2;
    const offsetY = (canvasSize - buttonSize) / 2;
    
    ctx.drawImage(
      this._cachedCanvas,
      offsetX, offsetY, buttonSize, buttonSize,
      buttonX, buttonY, buttonSize, buttonSize
    );
  }
  
  /**
   * 获取按钮边界框（用于点击检测）
   */
  static getBounds() {
    const buttonSize = this.BUTTON_SIZE;
    const buttonX = GameConfig.DESIGN_WIDTH - buttonSize - this.BUTTON_X_OFFSET;
    const buttonY = this.BUTTON_Y_OFFSET;
    return {
      x: buttonX,
      y: buttonY,
      width: buttonSize,
      height: buttonSize
    };
  }
}

