/**
 * 暂停按钮组件
 * 负责暂停按钮的渲染和缓存管理
 */

import { GameConfig } from '../../config/GameConfig';
import { ColorUtils } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class PauseButton {
  // 离屏Canvas缓存
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _initialized = false;
  
  static BUTTON_SIZE = 40;
  static BUTTON_RADIUS = 8;
  static BUTTON_X_OFFSET = 20; // 距离右边的距离
  static BUTTON_Y_OFFSET = 70; // 距离顶部的距离
  
  /**
   * 初始化缓存
   */
  static initCache() {
    if (this._initialized) {
      return;
    }
    
    try {
      const buttonSize = this.BUTTON_SIZE;
      const canvasSize = buttonSize + 20; // 包含阴影
      
      let canvas;
      if (typeof wx !== 'undefined') {
        canvas = wx.createCanvas();
        canvas.width = canvasSize;
        canvas.height = canvasSize;
      } else {
        canvas = document.createElement('canvas');
        canvas.width = canvasSize;
        canvas.height = canvasSize;
      }
      
      const ctx = canvas.getContext('2d');
      this._cachedCanvas = canvas;
      this._cachedCtx = ctx;
      
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      
      polyfillRoundRect(ctx);
      const offsetX = (canvasSize - buttonSize) / 2;
      const offsetY = (canvasSize - buttonSize) / 2;
      const radius = this.BUTTON_RADIUS;
      
      // 绘制按钮阴影
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 3;
      
      // 绘制按钮背景（深色半透明）
      const bgGradient = ctx.createLinearGradient(offsetX, offsetY, offsetX, offsetY + buttonSize);
      bgGradient.addColorStop(0, 'rgba(30, 35, 45, 0.9)');
      bgGradient.addColorStop(1, 'rgba(20, 25, 35, 0.85)');
      ctx.fillStyle = bgGradient;
      ctx.beginPath();
      ctx.roundRect(offsetX, offsetY, buttonSize, buttonSize, radius);
      ctx.fill();
      
      // 重置阴影
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // 绘制发光边框
      ctx.shadowBlur = 6;
      ctx.shadowColor = ColorUtils.hexToCanvas(0x9d00ff, 0.5);
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x9d00ff, 0.8);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(offsetX, offsetY, buttonSize, buttonSize, radius);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // 绘制暂停图标（两个竖条）
      const iconWidth = 6;
      const iconHeight = 16;
      const iconX = offsetX + buttonSize / 2 - iconWidth - 2;
      const iconY = offsetY + buttonSize / 2 - iconHeight / 2;
      
      ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 1.0);
      ctx.fillRect(iconX, iconY, iconWidth, iconHeight);
      ctx.fillRect(iconX + iconWidth + 4, iconY, iconWidth, iconHeight);
      
      this._initialized = true;
    } catch (e) {
      console.warn('暂停按钮缓存初始化失败:', e);
      this._initialized = false;
    }
  }
  
  /**
   * 渲染暂停按钮
   */
  static render(ctx) {
    // 使用缓存
    if (this._initialized && this._cachedCanvas) {
      const buttonSize = this.BUTTON_SIZE;
      const buttonX = GameConfig.DESIGN_WIDTH - buttonSize - this.BUTTON_X_OFFSET;
      const buttonY = this.BUTTON_Y_OFFSET;
      const canvasSize = buttonSize + 20;
      const offsetX = (canvasSize - buttonSize) / 2;
      const offsetY = (canvasSize - buttonSize) / 2;
      
      ctx.drawImage(
        this._cachedCanvas,
        offsetX, offsetY, buttonSize, buttonSize,
        buttonX, buttonY, buttonSize, buttonSize
      );
      return;
    }
    
    // 缓存不可用时，不渲染
    console.warn('PauseButton: 缓存不可用');
  }
  
  /**
   * 直接绘制（已废弃，仅用于缓存初始化）
   */
  static renderDirect(ctx) {
    polyfillRoundRect(ctx);
    ctx.save();
    
    const buttonSize = this.BUTTON_SIZE;
    const buttonX = GameConfig.DESIGN_WIDTH - buttonSize - this.BUTTON_X_OFFSET;
    const buttonY = this.BUTTON_Y_OFFSET;
    const radius = this.BUTTON_RADIUS;
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;
    
    const bgGradient = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonSize);
    bgGradient.addColorStop(0, 'rgba(30, 35, 45, 0.9)');
    bgGradient.addColorStop(1, 'rgba(20, 25, 35, 0.85)');
    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    ctx.roundRect(buttonX, buttonY, buttonSize, buttonSize, radius);
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
    ctx.roundRect(buttonX, buttonY, buttonSize, buttonSize, radius);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    const iconWidth = 6;
    const iconHeight = 16;
    const iconX = buttonX + buttonSize / 2 - iconWidth - 2;
    const iconY = buttonY + buttonSize / 2 - iconHeight / 2;
    
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 1.0);
    ctx.fillRect(iconX, iconY, iconWidth, iconHeight);
    ctx.fillRect(iconX + iconWidth + 4, iconY, iconWidth, iconHeight);
    
    ctx.restore();
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

