/**
 * 波次信息组件
 * 负责波次信息的渲染和缓存管理
 */

import { GameConfig } from '../../config/GameConfig';
import { ColorUtils, GameColors } from '../../config/Colors';
import { UIConfig } from '../../config/UIConfig';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class WaveInfo {
  // 离屏Canvas缓存（背景部分）
  static _bgCache = null;
  static _bgCtx = null;
  static _bgInitialized = false;
  
  static PANEL_WIDTH = 120;
  static PANEL_HEIGHT = 40;
  static PANEL_X_OFFSET = 20; // 距离右边的距离
  static PANEL_Y_OFFSET = 20; // 距离顶部的距离
  static PANEL_RADIUS = 8;
  
  /**
   * 初始化背景缓存
   */
  static initCache() {
    if (this._bgInitialized) {
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
      this._bgCache = canvas;
      this._bgCtx = ctx;
      
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      
      polyfillRoundRect(ctx);
      const offsetX = 20;
      const offsetY = 20;
      const radius = this.PANEL_RADIUS;
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 5;
      
      const bgGradient = ctx.createLinearGradient(offsetX, offsetY, offsetX, offsetY + panelHeight);
      bgGradient.addColorStop(0, ColorUtils.hexToCanvas(0x9d00ff, 0.25));
      bgGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x7d00cc, 0.2));
      bgGradient.addColorStop(1, ColorUtils.hexToCanvas(0x5d0099, 0.25));
      
      const mainBgGradient = ctx.createLinearGradient(offsetX, offsetY, offsetX, offsetY + panelHeight);
      mainBgGradient.addColorStop(0, 'rgba(30, 35, 45, 0.95)');
      mainBgGradient.addColorStop(0.3, 'rgba(20, 25, 35, 0.93)');
      mainBgGradient.addColorStop(0.7, 'rgba(15, 20, 30, 0.92)');
      mainBgGradient.addColorStop(1, 'rgba(10, 15, 25, 0.9)');
      ctx.fillStyle = mainBgGradient;
      ctx.beginPath();
      ctx.roundRect(offsetX, offsetY, panelWidth, panelHeight, radius);
      ctx.fill();
      
      ctx.fillStyle = bgGradient;
      ctx.fill();
      
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      ctx.shadowBlur = 8;
      ctx.shadowColor = ColorUtils.hexToCanvas(0x9d00ff, 0.6);
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x9d00ff, 0.9);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(offsetX, offsetY, panelWidth, panelHeight, radius);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x9d00ff, 0.4);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(offsetX + 1, offsetY + 1, panelWidth - 2, panelHeight - 2, radius - 1);
      ctx.stroke();
      
      this._bgInitialized = true;
    } catch (e) {
      console.warn('波次信息背景缓存初始化失败:', e);
      this._bgInitialized = false;
    }
  }
  
  /**
   * 渲染波次信息
   */
  static render(ctx, waveLevel, progress) {
    const panelWidth = this.PANEL_WIDTH;
    const panelHeight = this.PANEL_HEIGHT;
    const panelX = GameConfig.DESIGN_WIDTH - panelWidth - this.PANEL_X_OFFSET;
    const panelY = this.PANEL_Y_OFFSET;
    
    // 使用缓存绘制背景
    if (this._bgInitialized && this._bgCache) {
      const canvasWidth = panelWidth + 40;
      const canvasHeight = panelHeight + 40;
      
      ctx.drawImage(
        this._bgCache,
        0, 0, canvasWidth, canvasHeight,
        panelX - 20, panelY - 20, canvasWidth, canvasHeight
      );
    }
    
    // 绘制动态文字（波次和进度）
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = ColorUtils.hexToCanvas(0x9d00ff, 1.0);
    ctx.font = `bold ${UIConfig.BUTTON_FONT_SIZE * 0.9}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`波次 ${waveLevel}`, panelX + panelWidth / 2, panelY + 12);
    
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.TEXT_MAIN, 0.9);
    ctx.font = `${UIConfig.BUTTON_FONT_SIZE * 0.8}px Arial`;
    ctx.fillText(`${progress.current}/${progress.max}`, panelX + panelWidth / 2, panelY + panelHeight - 12);
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
  
  /**
   * 直接绘制背景（已废弃，仅用于缓存初始化）
   */
  static renderBackgroundDirect(ctx, panelX, panelY) {
    polyfillRoundRect(ctx);
    ctx.save();
    
    const panelWidth = this.PANEL_WIDTH;
    const panelHeight = this.PANEL_HEIGHT;
    const radius = this.PANEL_RADIUS;
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;
    
    const bgGradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
    bgGradient.addColorStop(0, ColorUtils.hexToCanvas(0x9d00ff, 0.25));
    bgGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x7d00cc, 0.2));
    bgGradient.addColorStop(1, ColorUtils.hexToCanvas(0x5d0099, 0.25));
    
    const mainBgGradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
    mainBgGradient.addColorStop(0, 'rgba(30, 35, 45, 0.95)');
    mainBgGradient.addColorStop(0.3, 'rgba(20, 25, 35, 0.93)');
    mainBgGradient.addColorStop(0.7, 'rgba(15, 20, 30, 0.92)');
    mainBgGradient.addColorStop(1, 'rgba(10, 15, 25, 0.9)');
    ctx.fillStyle = mainBgGradient;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, radius);
    ctx.fill();
    
    ctx.fillStyle = bgGradient;
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.shadowBlur = 8;
    ctx.shadowColor = ColorUtils.hexToCanvas(0x9d00ff, 0.6);
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x9d00ff, 0.9);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, radius);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x9d00ff, 0.4);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(panelX + 1, panelY + 1, panelWidth - 2, panelHeight - 2, radius - 1);
    ctx.stroke();
    
    ctx.restore();
  }
}

