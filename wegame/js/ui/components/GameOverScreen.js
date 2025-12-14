/**
 * 游戏结束界面组件
 * 负责游戏结束界面的渲染和缓存管理
 */

import { GameConfig } from '../../config/GameConfig';
import { ColorUtils, GameColors } from '../../config/Colors';
import { UIConfig } from '../../config/UIConfig';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class GameOverScreen {
  // 离屏Canvas缓存
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _initialized = false;
  
  static PANEL_WIDTH = 350;
  static PANEL_HEIGHT = 250;
  static PANEL_RADIUS = 12;
  static BUTTON_WIDTH = 140;
  static BUTTON_HEIGHT = 45;
  static BUTTON_RADIUS = 8;
  
  /**
   * 初始化缓存
   */
  static initCache() {
    if (this._initialized) {
      return;
    }
    
    try {
      const panelWidth = this.PANEL_WIDTH;
      const panelHeight = this.PANEL_HEIGHT;
      const canvasWidth = panelWidth + 40;
      const canvasHeight = panelHeight + 40;
      
      let canvas;
      if (typeof wx !== 'undefined') {
        canvas = wx.createCanvas();
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
      } else {
        canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
      }
      
      const ctx = canvas.getContext('2d');
      this._cachedCanvas = canvas;
      this._cachedCtx = ctx;
      
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      
      polyfillRoundRect(ctx);
      const offsetX = 20;
      const offsetY = 20;
      const radius = this.PANEL_RADIUS;
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 25;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;
      
      const bgGradient = ctx.createLinearGradient(offsetX, offsetY, offsetX, offsetY + panelHeight);
      bgGradient.addColorStop(0, 'rgba(30, 35, 45, 0.98)');
      bgGradient.addColorStop(0.3, 'rgba(20, 25, 35, 0.96)');
      bgGradient.addColorStop(0.7, 'rgba(15, 20, 30, 0.95)');
      bgGradient.addColorStop(1, 'rgba(10, 15, 25, 0.94)');
      ctx.fillStyle = bgGradient;
      ctx.beginPath();
      ctx.roundRect(offsetX, offsetY, panelWidth, panelHeight, radius);
      ctx.fill();
      
      const redGradient = ctx.createLinearGradient(offsetX, offsetY, offsetX, offsetY + panelHeight);
      redGradient.addColorStop(0, ColorUtils.hexToCanvas(0xff0000, 0.15));
      redGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0xcc0000, 0.12));
      redGradient.addColorStop(1, ColorUtils.hexToCanvas(0x990000, 0.15));
      ctx.fillStyle = redGradient;
      ctx.fill();
      
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      ctx.shadowBlur = 15;
      ctx.shadowColor = ColorUtils.hexToCanvas(0xff0000, 0.6);
      ctx.strokeStyle = ColorUtils.hexToCanvas(0xff0000, 0.9);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(offsetX, offsetY, panelWidth, panelHeight, radius);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(0xff0000, 0.4);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(offsetX + 2, offsetY + 2, panelWidth - 4, panelHeight - 4, radius - 2);
      ctx.stroke();
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = ColorUtils.hexToCanvas(0xff0000, 1.0);
      ctx.font = `bold ${UIConfig.TITLE_FONT_SIZE * 1.2}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('游戏结束', offsetX + panelWidth / 2, offsetY + 50);
      
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.TEXT_MAIN, 0.9);
      ctx.font = `${UIConfig.BUTTON_FONT_SIZE * 0.9}px Arial`;
      ctx.fillText('敌人到达了终点', offsetX + panelWidth / 2, offsetY + 100);
      
      const buttonWidth = this.BUTTON_WIDTH;
      const buttonHeight = this.BUTTON_HEIGHT;
      const buttonX = offsetX + (panelWidth - buttonWidth) / 2;
      const buttonY = offsetY + panelHeight - buttonHeight - 20;
      const buttonRadius = this.BUTTON_RADIUS;
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 5;
      
      const buttonGradient = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
      buttonGradient.addColorStop(0, ColorUtils.hexToCanvas(0xff0000, 1.0));
      buttonGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0xcc0000, 0.95));
      buttonGradient.addColorStop(1, ColorUtils.hexToCanvas(0x990000, 0.9));
      ctx.fillStyle = buttonGradient;
      ctx.beginPath();
      ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, buttonRadius);
      ctx.fill();
      
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      ctx.shadowBlur = 8;
      ctx.shadowColor = ColorUtils.hexToCanvas(0xffffff, 0.5);
      ctx.strokeStyle = ColorUtils.hexToCanvas(0xffffff, 0.6);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, buttonRadius);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${UIConfig.BUTTON_FONT_SIZE}px Arial`;
      ctx.fillText('重新开始', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
      
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      this._initialized = true;
    } catch (e) {
      console.warn('游戏结束界面缓存初始化失败:', e);
      this._initialized = false;
    }
  }
  
  /**
   * 渲染游戏结束界面
   */
  static render(ctx) {
    // 绘制半透明遮罩（动态）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, GameConfig.DESIGN_WIDTH, GameConfig.DESIGN_HEIGHT);
    
    // 使用缓存绘制面板
    if (this._initialized && this._cachedCanvas) {
      const panelWidth = this.PANEL_WIDTH;
      const panelHeight = this.PANEL_HEIGHT;
      const panelX = (GameConfig.DESIGN_WIDTH - panelWidth) / 2;
      const panelY = (GameConfig.DESIGN_HEIGHT - panelHeight) / 2;
      const canvasWidth = panelWidth + 40;
      const canvasHeight = panelHeight + 40;
      
      ctx.drawImage(
        this._cachedCanvas,
        0, 0, canvasWidth, canvasHeight,
        panelX - 20, panelY - 20, canvasWidth, canvasHeight
      );
      return;
    }
    
    // 回退方案：直接绘制
    this.renderDirect(ctx);
  }
  
  /**
   * 直接绘制（回退方案）
   */
  static renderDirect(ctx) {
    polyfillRoundRect(ctx);
    ctx.save();
    
    const panelWidth = this.PANEL_WIDTH;
    const panelHeight = this.PANEL_HEIGHT;
    const panelX = (GameConfig.DESIGN_WIDTH - panelWidth) / 2;
    const panelY = (GameConfig.DESIGN_HEIGHT - panelHeight) / 2;
    const radius = this.PANEL_RADIUS;
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;
    
    const bgGradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
    bgGradient.addColorStop(0, 'rgba(30, 35, 45, 0.98)');
    bgGradient.addColorStop(0.3, 'rgba(20, 25, 35, 0.96)');
    bgGradient.addColorStop(0.7, 'rgba(15, 20, 30, 0.95)');
    bgGradient.addColorStop(1, 'rgba(10, 15, 25, 0.94)');
    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, radius);
    ctx.fill();
    
    const redGradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
    redGradient.addColorStop(0, ColorUtils.hexToCanvas(0xff0000, 0.15));
    redGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0xcc0000, 0.12));
    redGradient.addColorStop(1, ColorUtils.hexToCanvas(0x990000, 0.15));
    ctx.fillStyle = redGradient;
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.shadowBlur = 15;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xff0000, 0.6);
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xff0000, 0.9);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, radius);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xff0000, 0.4);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(panelX + 2, panelY + 2, panelWidth - 4, panelHeight - 4, radius - 2);
    ctx.stroke();
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = ColorUtils.hexToCanvas(0xff0000, 1.0);
    ctx.font = `bold ${UIConfig.TITLE_FONT_SIZE * 1.2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏结束', panelX + panelWidth / 2, panelY + 50);
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.TEXT_MAIN, 0.9);
    ctx.font = `${UIConfig.BUTTON_FONT_SIZE * 0.9}px Arial`;
    ctx.fillText('敌人到达了终点', panelX + panelWidth / 2, panelY + 100);
    
    const buttonWidth = this.BUTTON_WIDTH;
    const buttonHeight = this.BUTTON_HEIGHT;
    const buttonX = panelX + (panelWidth - buttonWidth) / 2;
    const buttonY = panelY + panelHeight - buttonHeight - 20;
    const buttonRadius = this.BUTTON_RADIUS;
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;
    
    const buttonGradient = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
    buttonGradient.addColorStop(0, ColorUtils.hexToCanvas(0xff0000, 1.0));
    buttonGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0xcc0000, 0.95));
    buttonGradient.addColorStop(1, ColorUtils.hexToCanvas(0x990000, 0.9));
    ctx.fillStyle = buttonGradient;
    ctx.beginPath();
    ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, buttonRadius);
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.shadowBlur = 8;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xffffff, 0.5);
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xffffff, 0.6);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, buttonRadius);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${UIConfig.BUTTON_FONT_SIZE}px Arial`;
    ctx.fillText('重新开始', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.restore();
  }
  
  /**
   * 获取重新开始按钮的边界框（用于点击检测）
   */
  static getRestartButtonBounds() {
    const panelWidth = this.PANEL_WIDTH;
    const panelHeight = this.PANEL_HEIGHT;
    const panelX = (GameConfig.DESIGN_WIDTH - panelWidth) / 2;
    const panelY = (GameConfig.DESIGN_HEIGHT - panelHeight) / 2;
    const buttonWidth = this.BUTTON_WIDTH;
    const buttonHeight = this.BUTTON_HEIGHT;
    const buttonX = panelX + (panelWidth - buttonWidth) / 2;
    const buttonY = panelY + panelHeight - buttonHeight - 20;
    return {
      x: buttonX,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight
    };
  }
}

