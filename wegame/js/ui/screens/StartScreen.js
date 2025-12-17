/**
 * 开始界面
 */

import { GameConfig } from '../../config/GameConfig';
import { UIConfig } from '../../config/UIConfig';
import { ColorUtils, GameColors } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';
import { BaseButton } from '../components/BaseButton';
import { TextRenderer } from '../utils/TextRenderer';

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
    
    // 创建按钮
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    
    // 开始按钮
    this.startButton = new BaseButton(
      windowWidth / 2,
      windowHeight * 0.55,
      UIConfig.START_BTN_WIDTH,
      UIConfig.START_BTN_HEIGHT,
      '开始游戏',
      GameColors.ROCKET_TOWER,
      UIConfig.START_BTN_RADIUS,
      ctx
    );
    this.startButton.setUseOffScreen(true);
    
    // 帮助按钮
    this.helpButton = new BaseButton(
      windowWidth / 2,
      windowHeight * 0.7,
      UIConfig.HELP_BTN_WIDTH,
      UIConfig.HELP_BTN_HEIGHT,
      '游戏帮助',
      GameColors.LASER_TOWER,
      UIConfig.HELP_BTN_RADIUS,
      ctx
    );
    this.helpButton.setUseOffScreen(true);
  }
  
  /**
   * 显示开始界面
   */
  show(onStartCallback, onHelpCallback) {
    this.visible = true;
    this.onStartCallback = onStartCallback;
    this.onHelpCallback = onHelpCallback;
    this.pulseTime = 0;
    
    // 设置按钮回调
    this.startButton.setOnClick((button, x, y) => {
      if (this.onStartCallback) {
        this.onStartCallback();
      }
      this.hide();
    });
    
    this.helpButton.setOnClick((button, x, y) => {
      if (this.onHelpCallback) {
        this.onHelpCallback();
      }
    });
    
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
    TextRenderer.drawTitle(ctx, '塔防游戏', windowWidth / 2, titleY, {
      size: UIConfig.TITLE_FONT_SIZE * 1.2,
      gradient: {
        x0: windowWidth / 2 - 100,
        y0: titleY - 30,
        x1: windowWidth / 2 + 100,
        y1: titleY + 30,
        stops: [
          { offset: 0, color: GameColors.ROCKET_TOWER, alpha: 1 },
          { offset: 0.5, color: GameColors.TEXT_MAIN, alpha: 1 },
          { offset: 1, color: GameColors.ROCKET_DETAIL, alpha: 1 }
        ]
      },
      shadow: {
        color: ColorUtils.hexToCanvas(GameColors.ROCKET_TOWER, 0.6),
        blur: 30,
        offsetX: 0,
        offsetY: 0
      }
    });
    
    // 绘制副标题（静态，不包含脉冲效果）
    TextRenderer.drawSubtitle(ctx, '点击开始游戏', windowWidth / 2, windowHeight * 0.35);
    
    // 注意：按钮现在使用 BaseButton 动态渲染，不再绘制到静态缓存中
    
    ctx.restore();
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
    
    // 使用缓存渲染静态部分（背景、标题等）
    this.renderStaticFromCache();
    
    // 渲染按钮（使用 BaseButton）
    this.startButton.render(this.ctx);
    this.helpButton.render(this.ctx);
  }
  
  /**
   * 判断点是否在组件边界内
   * @param {number} x - 点的 X 坐标
   * @param {number} y - 点的 Y 坐标
   * @returns {boolean} 是否在边界内
   */
  isPointInBounds(x, y) {
    if (!this.visible) return false;
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    return x >= 0 && x <= windowWidth && y >= 0 && y <= windowHeight;
  }
  
  /**
   * 触摸开始（适配新事件系统：支持坐标参数或事件对象）
   * @param {Object|number} eOrX - 事件对象或 X 坐标
   * @param {number} [y] - Y 坐标（如果第一个参数是 X）
   * @returns {boolean} 是否处理了事件
   */
  onTouchStart(eOrX, y) {
    if (!this.visible) return false;
    
    // 支持两种调用方式：坐标参数 (x, y) 或事件对象 e
    let x, touchY;
    if (typeof eOrX === 'number' && typeof y === 'number') {
      // 新事件系统：直接传入坐标
      x = eOrX;
      touchY = y;
    } else {
      // 旧事件系统：从事件对象提取坐标
      const e = eOrX;
      const touch = e.touches && e.touches[0] ? e.touches[0] : e;
      if (!touch) return false;
      x = touch.x || touch.clientX || 0;
      touchY = touch.y || touch.clientY || 0;
    }
    
    // 使用 BaseButton 的点击检测
    if (this.startButton.isClicked(x, touchY)) {
      return true;
    }
    
    if (this.helpButton.isClicked(x, touchY)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * 触摸结束（适配新事件系统：支持坐标参数或事件对象）
   * @param {Object|number} eOrX - 事件对象或 X 坐标
   * @param {number} [y] - Y 坐标（如果第一个参数是 X）
   * @returns {boolean} 是否处理了事件
   */
  onTouchEnd(eOrX, y) {
    // 开始界面不需要处理触摸结束
    return false;
  }
}

