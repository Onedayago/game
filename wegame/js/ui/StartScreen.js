/**
 * 开始界面
 */

import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';
import { ColorUtils, GameColors } from '../config/Colors';
import { polyfillRoundRect } from '../utils/CanvasUtils';

export class StartScreen {
  // 离屏Canvas缓存（静态部分）
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _cacheWidth = 0;
  static _cacheHeight = 0;
  static _initialized = false;
  
  constructor(ctx) {
    this.ctx = ctx;
    this.visible = true;
    this.onStartCallback = null;
    this.onHelpCallback = null;
    this.pulseTime = 0; // 用于脉冲动画
  }
  
  /**
   * 显示开始界面
   */
  show(onStartCallback, onHelpCallback) {
    this.visible = true;
    this.onStartCallback = onStartCallback;
    this.onHelpCallback = onHelpCallback;
    this.pulseTime = 0;
    
    // 初始化静态缓存（如果未初始化）
    this.initStaticCache();
  }
  
  /**
   * 初始化静态部分缓存
   */
  initStaticCache() {
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    
    // 如果已经初始化且尺寸相同，直接返回
    if (StartScreen._initialized && 
        StartScreen._cacheWidth === windowWidth && 
        StartScreen._cacheHeight === windowHeight) {
      return;
    }
    
    StartScreen._cachedCanvas = wx.createCanvas();
    StartScreen._cachedCanvas.width = windowWidth;
    StartScreen._cachedCanvas.height = windowHeight;
    
    StartScreen._cachedCtx = StartScreen._cachedCanvas.getContext('2d');
    StartScreen._cacheWidth = windowWidth;
    StartScreen._cacheHeight = windowHeight;
    
    StartScreen._cachedCtx.clearRect(0, 0, windowWidth, windowHeight);
    
    this.drawStaticToCache(StartScreen._cachedCtx, windowWidth, windowHeight);
    
    StartScreen._initialized = true;
  }
  
  /**
   * 绘制静态部分到缓存Canvas（背景、标题、按钮基础）
   */
  drawStaticToCache(ctx, windowWidth, windowHeight) {
    polyfillRoundRect(ctx);
    ctx.save();
    
    // 绘制渐变遮罩
    const bgGradient = ctx.createLinearGradient(0, 0, 0, windowHeight);
    bgGradient.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    bgGradient.addColorStop(1, 'rgba(26, 26, 46, 0.9)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, windowWidth, windowHeight);
    
    // 绘制标题（带发光效果，静态）
    const titleY = windowHeight * 0.25;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.ROCKET_TOWER, 0.6);
    ctx.shadowBlur = 30;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // 标题渐变
    const titleGradient = ctx.createLinearGradient(
      windowWidth / 2 - 100, titleY - 30,
      windowWidth / 2 + 100, titleY + 30
    );
    titleGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.ROCKET_TOWER, 1));
    titleGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.TEXT_MAIN, 1));
    titleGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 1));
    
    ctx.fillStyle = titleGradient;
    ctx.font = `bold ${UIConfig.TITLE_FONT_SIZE * 1.2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('塔防游戏', windowWidth / 2, titleY);
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // 绘制副标题（静态，不包含脉冲效果）
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.TEXT_LIGHT, 0.9);
    ctx.font = `${UIConfig.SUBTITLE_FONT_SIZE}px Arial`;
    ctx.fillText('点击开始游戏', windowWidth / 2, windowHeight * 0.35);
    
    // 绘制开始按钮（静态，不包含脉冲效果）
    const startBtnY = windowHeight * 0.55;
    this.drawButtonToCache(
      ctx,
      windowWidth / 2,
      startBtnY,
      UIConfig.START_BTN_WIDTH,
      UIConfig.START_BTN_HEIGHT,
      UIConfig.START_BTN_RADIUS,
      '开始游戏',
      GameColors.ROCKET_TOWER
    );
    
    // 绘制帮助按钮
    const helpBtnY = windowHeight * 0.7;
    this.drawButtonToCache(
      ctx,
      windowWidth / 2,
      helpBtnY,
      UIConfig.HELP_BTN_WIDTH,
      UIConfig.HELP_BTN_HEIGHT,
      UIConfig.HELP_BTN_RADIUS,
      '游戏帮助',
      GameColors.LASER_TOWER
    );
    
    ctx.restore();
  }
  
  /**
   * 绘制按钮到缓存Canvas
   */
  drawButtonToCache(ctx, x, y, width, height, radius, text, color) {
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
    this.roundRectForCache(ctx, x - width / 2, y - height / 2, width, height, radius);
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
    this.roundRectForCache(ctx, x - width / 2, y - height / 2, width, height * 0.4, radius);
    ctx.fill();
    
    // 绘制按钮边框（发光效果）
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.9);
    ctx.lineWidth = UIConfig.BORDER_WIDTH * 1.5;
    this.roundRectForCache(ctx, x - width / 2, y - height / 2, width, height, radius);
    ctx.stroke();
    
    // 绘制按钮文字（带阴影）
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.TEXT_MAIN);
    ctx.font = `bold ${UIConfig.BUTTON_FONT_SIZE}px Arial`;
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
   * 绘制圆角矩形（用于缓存）
   */
  roundRectForCache(ctx, x, y, width, height, radius) {
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
  renderStaticFromCache() {
    if (!StartScreen._cachedCanvas || !StartScreen._initialized) {
      return false;
    }
    
    this.ctx.drawImage(
      StartScreen._cachedCanvas,
      0,
      0,
      StartScreen._cacheWidth,
      StartScreen._cacheHeight
    );
    
    return true;
  }
  
  /**
   * 更新动画
   */
  update(deltaTime) {
    if (this.visible) {
      this.pulseTime += deltaTime;
    }
  }
  
  /**
   * 隐藏开始界面
   */
  hide() {
    this.visible = false;
  }
  
  /**
   * 渲染开始界面（优化：使用离屏Canvas缓存）
   */
  render() {
    if (!this.visible) return;
    
    // 使用缓存渲染静态部分
    this.renderStaticFromCache();
  }
  
  /**
   * 绘制按钮（美化版）
   */
  drawButton(x, y, width, height, radius, text, color) {
    polyfillRoundRect(this.ctx);
    this.ctx.save();
    
    // 绘制按钮阴影
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    this.ctx.shadowBlur = 15;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 5;
    
    // 绘制按钮背景（渐变）
    const btnGradient = this.ctx.createLinearGradient(
      x - width / 2, y - height / 2,
      x - width / 2, y + height / 2
    );
    btnGradient.addColorStop(0, ColorUtils.hexToCanvas(color, 0.95));
    btnGradient.addColorStop(0.5, ColorUtils.hexToCanvas(color, 0.85));
    btnGradient.addColorStop(1, ColorUtils.hexToCanvas(color, 0.75));
    this.ctx.fillStyle = btnGradient;
    this.roundRect(x - width / 2, y - height / 2, width, height, radius);
    this.ctx.fill();
    
    // 重置阴影
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    // 绘制按钮高光
    const highlightGradient = this.ctx.createLinearGradient(
      x - width / 2, y - height / 2,
      x - width / 2, y - height / 2 + height * 0.4
    );
    highlightGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.4));
    highlightGradient.addColorStop(1, ColorUtils.hexToCanvas(0xffffff, 0));
    this.ctx.fillStyle = highlightGradient;
    this.roundRect(x - width / 2, y - height / 2, width, height * 0.4, radius);
    this.ctx.fill();
    
    // 绘制按钮边框（发光效果）
    this.ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.9);
    this.ctx.lineWidth = UIConfig.BORDER_WIDTH * 1.5;
    this.roundRect(x - width / 2, y - height / 2, width, height, radius);
    this.ctx.stroke();
    
    // 绘制按钮文字（带阴影）
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 5;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 2;
    this.ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.TEXT_MAIN);
    this.ctx.font = `bold ${UIConfig.BUTTON_FONT_SIZE}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, x, y);
    
    // 重置阴影
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    this.ctx.restore();
  }
  
  /**
   * 绘制圆角矩形
   */
  roundRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }
  
  /**
   * 触摸开始
   */
  onTouchStart(e) {
    if (!this.visible) return;
    
    // 微信小游戏的触摸事件格式
    const touch = e.touches && e.touches[0] ? e.touches[0] : e;
    if (!touch) return;
    
    // 获取触摸坐标（微信小游戏触摸坐标是相对于 Canvas 左上角的）
    const x = touch.x || touch.clientX || 0;
    const y = touch.y || touch.clientY || 0;
    
    // 获取实际 Canvas 尺寸（现在从 GameConfig 获取，已经是屏幕尺寸）
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    
    // 检查是否点击了开始按钮
    const startBtnX = windowWidth / 2;
    const startBtnY = windowHeight * 0.55;
    const startBtnWidth = UIConfig.START_BTN_WIDTH;
    const startBtnHeight = UIConfig.START_BTN_HEIGHT;
    
    if (
      x >= startBtnX - startBtnWidth / 2 &&
      x <= startBtnX + startBtnWidth / 2 &&
      y >= startBtnY - startBtnHeight / 2 &&
      y <= startBtnY + startBtnHeight / 2
    ) {
      if (this.onStartCallback) {
        this.onStartCallback();
      }
      this.hide();
      return;
    }
    
    // 检查是否点击了帮助按钮
    const helpBtnX = windowWidth / 2;
    const helpBtnY = windowHeight * 0.7;
    const helpBtnWidth = UIConfig.HELP_BTN_WIDTH;
    const helpBtnHeight = UIConfig.HELP_BTN_HEIGHT;
    
    if (
      x >= helpBtnX - helpBtnWidth / 2 &&
      x <= helpBtnX + helpBtnWidth / 2 &&
      y >= helpBtnY - helpBtnHeight / 2 &&
      y <= helpBtnY + helpBtnHeight / 2
    ) {
      if (this.onHelpCallback) {
        this.onHelpCallback();
      }
    }
  }
  
  /**
   * 触摸结束
   */
  onTouchEnd(e) {
    // 开始界面不需要处理触摸结束
  }
}

