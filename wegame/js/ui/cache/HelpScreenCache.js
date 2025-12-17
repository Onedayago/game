/**
 * 帮助界面缓存管理器
 * 负责管理帮助界面的静态部分缓存（遮罩、面板背景、标题）
 */

import { GameConfig } from '../../config/GameConfig';
import { UIConfig } from '../../config/UIConfig';
import { ColorUtils, GameColors } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';
import { TextRenderer } from '../utils/TextRenderer';

export class HelpScreenCache {
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _cacheWidth = 0;
  static _cacheHeight = 0;
  static _initialized = false;

  /**
   * 初始化静态部分缓存
   */
  static init() {
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;

    // 如果已经初始化且尺寸相同，直接返回
    if (this._initialized &&
        this._cacheWidth === windowWidth &&
        this._cacheHeight === windowHeight) {
      return;
    }

    this._cachedCanvas = wx.createCanvas();
    this._cachedCanvas.width = windowWidth;
    this._cachedCanvas.height = windowHeight;

    this._cachedCtx = this._cachedCanvas.getContext('2d');
    this._cacheWidth = windowWidth;
    this._cacheHeight = windowHeight;

    this._cachedCtx.clearRect(0, 0, windowWidth, windowHeight);

    this._drawStatic(this._cachedCtx, windowWidth, windowHeight);

    this._initialized = true;
  }

  /**
   * 绘制静态部分到缓存Canvas（遮罩、面板背景、标题）
   */
  static _drawStatic(ctx, windowWidth, windowHeight) {
    polyfillRoundRect(ctx);

    // 绘制半透明遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, windowWidth, windowHeight);

    // 绘制帮助面板背景
    const panelWidth = windowWidth * 0.65;
    const panelHeight = windowHeight * 0.75;
    const panelX = (windowWidth - panelWidth) / 2;
    const panelY = (windowHeight - panelHeight) / 2;
    const panelRadius = UIConfig.CONTAINER_RADIUS * 2;

    // 绘制面板阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;

    // 绘制面板背景（渐变）
    const bgGradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
    bgGradient.addColorStop(0, ColorUtils.hexToCanvas(0x1a1a2e, 0.95));
    bgGradient.addColorStop(1, ColorUtils.hexToCanvas(0x0f0f1e, 0.95));
    ctx.fillStyle = bgGradient;
    this._roundRect(ctx, panelX, panelY, panelWidth, panelHeight, panelRadius);
    ctx.fill();

    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 绘制面板边框（发光效果）
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.8);
    ctx.lineWidth = UIConfig.BORDER_WIDTH * 2;
    this._roundRect(ctx, panelX, panelY, panelWidth, panelHeight, panelRadius);
    ctx.stroke();

    // 绘制标题
    const titleY = panelY + panelHeight * 0.12;
    TextRenderer.drawTitle(ctx, '游戏帮助', windowWidth / 2, titleY, {
      size: UIConfig.TITLE_FONT_SIZE * 0.8,
      color: GameColors.TEXT_MAIN
    });
  }

  /**
   * 绘制圆角矩形（用于缓存）
   */
  static _roundRect(ctx, x, y, width, height, radius) {
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

  /**
   * 从缓存渲染静态部分
   */
  static render(ctx) {
    if (!this._cachedCanvas || !this._initialized) {
      return false;
    }

    ctx.drawImage(
      this._cachedCanvas,
      0,
      0,
      this._cacheWidth,
      this._cacheHeight
    );

    return true;
  }

  /**
   * 检查是否已初始化
   */
  static isInitialized() {
    return this._initialized;
  }
}

