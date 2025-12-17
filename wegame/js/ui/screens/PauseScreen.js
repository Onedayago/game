/**
 * 暂停界面组件
 * 负责暂停界面的渲染和缓存管理
 */

import { GameConfig } from '../../config/GameConfig';
import { ColorUtils, GameColors } from '../../config/Colors';
import { UIConfig } from '../../config/UIConfig';
import { BasePanel } from '../components/BasePanel';
import { TextRenderer } from '../utils/TextRenderer';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class PauseScreen {
  // 离屏Canvas缓存
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _initialized = false;
  
  static get PANEL_WIDTH() {
    return UIConfig.PAUSE_PANEL_WIDTH;
  }
  static get PANEL_HEIGHT() {
    return UIConfig.PAUSE_PANEL_HEIGHT;
  }
  static get PANEL_RADIUS() {
    return UIConfig.PANEL_RADIUS_LARGE;
  }
  static get BUTTON_WIDTH() {
    return UIConfig.PAUSE_PANEL_BUTTON_WIDTH;
  }
  static get BUTTON_HEIGHT() {
    return UIConfig.PAUSE_PANEL_BUTTON_HEIGHT;
  }
  static get BUTTON_RADIUS() {
    return UIConfig.BUTTON_RADIUS;
  }
  
  /**
   * 初始化缓存
   */
  static initCache() {
    if (this._initialized) {
      return;
    }
    
    const panelWidth = this.PANEL_WIDTH;
    const panelHeight = this.PANEL_HEIGHT;
    const canvasWidth = panelWidth + UIConfig.CACHE_PADDING * 2;
    const canvasHeight = panelHeight + UIConfig.CACHE_PADDING * 2;
    
    const canvas = wx.createCanvas();
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    const ctx = canvas.getContext('2d');
    this._cachedCanvas = canvas;
    this._cachedCtx = ctx;
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    const offsetX = UIConfig.CACHE_OFFSET;
    const offsetY = UIConfig.CACHE_OFFSET;
    
    // 使用 BasePanel 绘制面板
    const panel = new BasePanel(panelWidth, panelHeight, this.PANEL_RADIUS, ctx);
    panel.setBackgroundGradient([
      { offset: 0, color: 'rgba(30, 35, 45, 0.98)' },
      { offset: 0.3, color: 'rgba(20, 25, 35, 0.96)' },
      { offset: 0.7, color: 'rgba(15, 20, 30, 0.95)' },
      { offset: 1, color: 'rgba(10, 15, 25, 0.94)' }
    ]);
    panel.setOverlayGradient([
      { offset: 0, color: 0x9d00ff, alpha: 0.2 },
      { offset: 0.5, color: 0x7d00cc, alpha: 0.15 },
      { offset: 1, color: 0x5d0099, alpha: 0.2 }
    ]);
    panel.setBorderColor(0x9d00ff, 3);
    panel.setBorderShadow({
      color: ColorUtils.hexToCanvas(0x9d00ff, 0.6),
      blur: 12
    });
    panel.setShadow({
      color: 'rgba(0, 0, 0, 0.5)',
      blur: 20,
      offsetY: 10
    });
    panel.draw(ctx, offsetX, offsetY);
    
    // 绘制标题
    TextRenderer.drawTitle(ctx, '游戏已暂停', offsetX + panelWidth / 2, offsetY + UIConfig.PAUSE_PANEL_TITLE_Y_OFFSET, {
      color: 0x9d00ff,
      shadowColor: 'rgba(0, 0, 0, 0.8)',
      shadowBlur: 5,
      shadowOffsetY: 2
    });
    
    // 绘制副标题
    TextRenderer.drawSubtitle(ctx, '点击继续按钮恢复游戏', offsetX + panelWidth / 2, offsetY + UIConfig.PAUSE_PANEL_SUBTITLE_Y_OFFSET, {
      size: UIConfig.BUTTON_FONT_SIZE * 0.9,
      color: GameColors.TEXT_MAIN,
      alpha: 0.8
    });
    
    // 绘制按钮（使用 BaseButton 样式）
    const buttonWidth = this.BUTTON_WIDTH;
    const buttonHeight = this.BUTTON_HEIGHT;
    const buttonX = offsetX + (panelWidth - buttonWidth) / 2;
    const buttonY = offsetY + panelHeight - buttonHeight - UIConfig.PANEL_BUTTON_BOTTOM_OFFSET;
    const buttonRadius = this.BUTTON_RADIUS;
    
    polyfillRoundRect(ctx);
    ctx.save();
    
    // 按钮阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    
    // 按钮背景渐变
    const buttonGradient = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
    buttonGradient.addColorStop(0, ColorUtils.hexToCanvas(0x9d00ff, 1.0));
    buttonGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x7d00cc, 0.95));
    buttonGradient.addColorStop(1, ColorUtils.hexToCanvas(0x5d0099, 0.9));
    ctx.fillStyle = buttonGradient;
    ctx.beginPath();
    ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, buttonRadius);
    ctx.fill();
    
    // 按钮边框
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowBlur = 8;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xffffff, 0.5);
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xffffff, 0.6);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, buttonRadius);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 按钮文字
    TextRenderer.drawButtonText(ctx, '继续', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2, {
      shadowColor: 'rgba(0, 0, 0, 0.6)',
      shadowBlur: 3,
      shadowOffsetY: 1
    });
    
    ctx.restore();
    
    this._initialized = true;
  }
  
  /**
   * 渲染暂停界面
   */
  static render(ctx) {
    // 绘制半透明遮罩（动态）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, GameConfig.DESIGN_WIDTH, GameConfig.DESIGN_HEIGHT);
    
    // 使用缓存绘制面板
    const panelWidth = this.PANEL_WIDTH;
    const panelHeight = this.PANEL_HEIGHT;
    const panelX = (GameConfig.DESIGN_WIDTH - panelWidth) / 2;
    const panelY = (GameConfig.DESIGN_HEIGHT - panelHeight) / 2;
    const canvasWidth = panelWidth + UIConfig.CACHE_PADDING * 2;
    const canvasHeight = panelHeight + UIConfig.CACHE_PADDING * 2;
    
    ctx.drawImage(
      this._cachedCanvas,
      0, 0, canvasWidth, canvasHeight,
      panelX - UIConfig.CACHE_OFFSET, panelY - UIConfig.CACHE_OFFSET, canvasWidth, canvasHeight
    );
  }
  
  /**
   * 获取继续按钮的边界框（用于点击检测）
   */
  static getResumeButtonBounds() {
    const panelWidth = this.PANEL_WIDTH;
    const panelHeight = this.PANEL_HEIGHT;
    const panelX = (GameConfig.DESIGN_WIDTH - panelWidth) / 2;
    const panelY = (GameConfig.DESIGN_HEIGHT - panelHeight) / 2;
    const buttonWidth = this.BUTTON_WIDTH;
    const buttonHeight = this.BUTTON_HEIGHT;
    const buttonX = panelX + (panelWidth - buttonWidth) / 2;
    const buttonY = panelY + panelHeight - buttonHeight - UIConfig.PANEL_BUTTON_BOTTOM_OFFSET;
    return {
      x: buttonX,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight
    };
  }
}

