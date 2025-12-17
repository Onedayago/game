/**
 * 武器容器 UI 缓存管理器
 * 负责管理背景和箭头的离屏 Canvas 缓存
 */

import { UIConfig } from '../../config/UIConfig';
import { ColorUtils, GameColors } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class WeaponContainerCache {
  // 离屏Canvas缓存（静态部分：背景、箭头）
  static _backgroundCache = null;
  static _backgroundCtx = null;
  static _leftArrowCache = null;
  static _leftArrowCtx = null;
  static _rightArrowCache = null;
  static _rightArrowCtx = null;
  static _cacheWidth = 0;
  static _cacheHeight = 0;
  static _arrowSize = 0;
  static _initialized = false;

  /**
   * 初始化静态部分缓存
   */
  static init() {
    const containerWidth = UIConfig.WEAPON_CONTAINER_WIDTH;
    const containerHeight = UIConfig.WEAPON_CONTAINER_HEIGHT;
    const arrowSize = containerHeight * 0.4;

    // 如果已经初始化且尺寸相同，直接返回
    if (this._initialized &&
        this._cacheWidth === containerWidth &&
        this._cacheHeight === containerHeight &&
        this._arrowSize === arrowSize) {
      return;
    }

    // 初始化背景缓存
    this._backgroundCache = wx.createCanvas();
    this._backgroundCache.width = containerWidth;
    this._backgroundCache.height = containerHeight;
    this._backgroundCtx = this._backgroundCache.getContext('2d');

    // 初始化箭头缓存
    const arrowCanvasSize = Math.ceil(arrowSize * 1.5);
    this._leftArrowCache = wx.createCanvas();
    this._leftArrowCache.width = arrowCanvasSize;
    this._leftArrowCache.height = arrowCanvasSize;
    this._leftArrowCtx = this._leftArrowCache.getContext('2d');

    this._rightArrowCache = wx.createCanvas();
    this._rightArrowCache.width = arrowCanvasSize;
    this._rightArrowCache.height = arrowCanvasSize;
    this._rightArrowCtx = this._rightArrowCache.getContext('2d');

    this._cacheWidth = containerWidth;
    this._cacheHeight = containerHeight;
    this._arrowSize = arrowSize;

    // 绘制背景到缓存
    this._drawBackground(this._backgroundCtx, containerWidth, containerHeight);

    // 绘制箭头到缓存
    this._drawArrow(this._leftArrowCtx, arrowCanvasSize / 2, arrowCanvasSize / 2, arrowSize, true);
    this._drawArrow(this._rightArrowCtx, arrowCanvasSize / 2, arrowCanvasSize / 2, arrowSize, false);

    this._initialized = true;
  }

  /**
   * 绘制背景到缓存Canvas
   */
  static _drawBackground(ctx, width, height) {
    polyfillRoundRect(ctx);

    const radius = UIConfig.PANEL_RADIUS_SMALL;

    // 绘制阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = -5;

    // 绘制背景渐变
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, 'rgba(20, 25, 35, 0.95)');
    bgGradient.addColorStop(0.3, 'rgba(15, 20, 30, 0.93)');
    bgGradient.addColorStop(0.7, 'rgba(10, 15, 25, 0.92)');
    bgGradient.addColorStop(1, 'rgba(5, 10, 20, 0.9)');

    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, radius);
    ctx.fill();

    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 绘制边框（发光效果）
    ctx.shadowBlur = 8;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.5);
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.6);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, radius);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 绘制内边框（高光）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xffffff, 0.1);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(1, 1, width - 2, height - 2, radius - 1);
    ctx.stroke();
  }

  /**
   * 绘制箭头到缓存Canvas
   */
  static _drawArrow(ctx, x, y, size, left) {
    const bgRadius = size * 0.6;

    // 1. 绘制外层光晕
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, bgRadius * 1.3);
    glowGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.3));
    glowGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.15));
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y, bgRadius * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // 2. 绘制背景阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, bgRadius, 0, Math.PI * 2);
    ctx.fill();

    // 3. 绘制主背景（渐变圆形）
    const bgGradient = ctx.createLinearGradient(x, y - bgRadius, x, y + bgRadius);
    bgGradient.addColorStop(0, 'rgba(50, 55, 70, 0.95)');
    bgGradient.addColorStop(0.3, 'rgba(40, 45, 60, 0.92)');
    bgGradient.addColorStop(0.7, 'rgba(30, 35, 50, 0.9)');
    bgGradient.addColorStop(1, 'rgba(20, 25, 40, 0.88)');
    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    ctx.arc(x, y, bgRadius, 0, Math.PI * 2);
    ctx.fill();

    // 4. 绘制内层高光
    const highlightGradient = ctx.createRadialGradient(
      x, y - bgRadius * 0.3, 0,
      x, y - bgRadius * 0.3, bgRadius * 0.8
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.arc(x, y, bgRadius, 0, Math.PI * 2);
    ctx.fill();

    // 5. 绘制外边框
    const borderGradient = ctx.createLinearGradient(x, y - bgRadius, x, y + bgRadius);
    borderGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.9));
    borderGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.7));
    borderGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.5));
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, bgRadius, 0, Math.PI * 2);
    ctx.stroke();

    // 6. 绘制内边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xffffff, 0.15);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, bgRadius - 2, 0, Math.PI * 2);
    ctx.stroke();

    // 7. 绘制箭头主体
    const arrowWidth = size * 0.5;
    const arrowHeight = size * 0.4;

    // 箭头阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    if (left) {
      ctx.moveTo(x - arrowWidth / 2 + 1, y + 1);
      ctx.lineTo(x + arrowWidth / 2 + 1, y - arrowHeight / 2 + 1);
      ctx.lineTo(x + arrowWidth / 2 + 1, y + arrowHeight / 2 + 1);
      ctx.closePath();
    } else {
      ctx.moveTo(x + arrowWidth / 2 + 1, y + 1);
      ctx.lineTo(x - arrowWidth / 2 + 1, y - arrowHeight / 2 + 1);
      ctx.lineTo(x - arrowWidth / 2 + 1, y + arrowHeight / 2 + 1);
      ctx.closePath();
    }
    ctx.fill();

    // 箭头主体（渐变）
    const arrowGradient = ctx.createLinearGradient(
      x, y - arrowHeight / 2,
      x, y + arrowHeight / 2
    );
    arrowGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.95));
    arrowGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.UI_BORDER, 1.0));
    arrowGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.8));
    ctx.fillStyle = arrowGradient;
    ctx.beginPath();
    if (left) {
      ctx.moveTo(x - arrowWidth / 2, y);
      ctx.lineTo(x + arrowWidth / 2, y - arrowHeight / 2);
      ctx.lineTo(x + arrowWidth / 2, y + arrowHeight / 2);
      ctx.closePath();
    } else {
      ctx.moveTo(x + arrowWidth / 2, y);
      ctx.lineTo(x - arrowWidth / 2, y - arrowHeight / 2);
      ctx.lineTo(x - arrowWidth / 2, y + arrowHeight / 2);
      ctx.closePath();
    }
    ctx.fill();

    // 8. 箭头边缘高光
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xffffff, 0.5);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (left) {
      ctx.moveTo(x - arrowWidth / 2, y);
      ctx.lineTo(x + arrowWidth / 2, y - arrowHeight / 2);
    } else {
      ctx.moveTo(x + arrowWidth / 2, y);
      ctx.lineTo(x - arrowWidth / 2, y - arrowHeight / 2);
    }
    ctx.stroke();

    // 9. 箭头内部高光
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.4);
    ctx.beginPath();
    if (left) {
      ctx.moveTo(x - arrowWidth / 2, y);
      ctx.lineTo(x + arrowWidth / 4, y - arrowHeight / 4);
      ctx.lineTo(x + arrowWidth / 4, y);
      ctx.closePath();
    } else {
      ctx.moveTo(x + arrowWidth / 2, y);
      ctx.lineTo(x - arrowWidth / 4, y - arrowHeight / 4);
      ctx.lineTo(x - arrowWidth / 4, y);
      ctx.closePath();
    }
    ctx.fill();
  }

  /**
   * 获取背景缓存
   */
  static getBackgroundCache() {
    return this._backgroundCache;
  }

  /**
   * 获取箭头缓存
   */
  static getArrowCache(left) {
    return left ? this._leftArrowCache : this._rightArrowCache;
  }

  /**
   * 检查是否已初始化
   */
  static isInitialized() {
    return this._initialized;
  }
}

