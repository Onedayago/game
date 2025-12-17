/**
 * 帮助界面
 */

import { GameConfig } from '../../config/GameConfig';
import { UIConfig } from '../../config/UIConfig';
import { GameColors } from '../../config/Colors';
import { BaseButton } from '../components/BaseButton';
import { HelpScreenCache } from '../cache/HelpScreenCache';
import { HelpScreenContent } from '../renderers/HelpScreenContent';
import { HelpScreenScrollHandler } from '../handlers/HelpScreenScrollHandler';

class HelpScreen {
  constructor(ctx) {
    this.ctx = ctx;
    this.visible = false;
    this.onCloseCallback = null;

    // 滚动相关
    this.scrollY = 0;
    this.maxScrollY = 0;
    this.isScrolling = false;
    this.scrollStartY = 0;
    this.scrollStartScrollY = 0;
    this.contentHeight = 0;
    
    // 内容高度缓存（避免每次渲染都重新计算）
    this._cachedContentWidth = 0;
    this._cachedContentHeight = 0;

    // 滚动处理器
    this.scrollHandler = new HelpScreenScrollHandler(this);
    
    // 初始化关闭按钮
    this._initCloseButton();
  }
  
  /**
   * 初始化关闭按钮
   */
  _initCloseButton() {
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    const panelWidth = windowWidth * 0.65;
    const panelHeight = windowHeight * 0.75;
    const panelX = (windowWidth - panelWidth) / 2;
    const panelY = (windowHeight - panelHeight) / 2;
    
    // 关闭按钮尺寸（使用帮助按钮的尺寸）
    const closeButtonSize = UIConfig.HELP_BTN_HEIGHT * 0.5;
    const closeButtonX = panelX + panelWidth - closeButtonSize * 0.7;
    const closeButtonY = panelY + closeButtonSize * 0.7;
    
    // 创建关闭按钮（使用 "×" 文本，使用红色系颜色）
    this.closeButton = new BaseButton(
      closeButtonX,
      closeButtonY,
      closeButtonSize,
      closeButtonSize,
      '×',
      GameColors.ENEMY_TANK, // 使用红色系
      closeButtonSize * 0.25,
      this.ctx
    );
    this.closeButton.setUseOffScreen(true);
    // 设置文本颜色为白色，更明显
    this.closeButton.textColor = 0xffffff;
  }
  
  /**
   * 初始化静态部分缓存
   */
  static initStaticCache() {
    HelpScreenCache.init();
  }
  
  /**
   * 显示帮助界面
   */
  show(onCloseCallback) {
    this.visible = true;
    this.onCloseCallback = onCloseCallback;
    this.scrollY = 0; // 重置滚动位置
    this.isScrolling = false;
    
    // 设置关闭按钮回调
    if (this.closeButton) {
      this.closeButton.setOnClick((button, x, y) => {
        if (this.onCloseCallback) {
          this.onCloseCallback();
        }
        this.hide();
      });
    }
  }
  
  /**
   * 计算内容高度
   */
  calculateContentHeight(contentWidth) {
    return HelpScreenContent.calculateHeight(this.ctx, contentWidth);
  }
  
  /**
   * 隐藏帮助界面
   */
  hide() {
    this.visible = false;
  }
  
  /**
   * 判断点是否在帮助界面范围内（用于 UIEventManager）
   * @param {number} x - X 坐标
   * @param {number} y - Y 坐标
   * @returns {boolean} 是否在范围内
   */
  isPointInBounds(x, y) {
    if (!this.visible) {
      return false;
    }
    
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    const panelWidth = windowWidth * 0.65;
    const panelHeight = windowHeight * 0.75;
    const panelX = (windowWidth - panelWidth) / 2;
    const panelY = (windowHeight - panelHeight) / 2;
    
    // 检查是否在面板区域内
    return (
      x >= panelX &&
      x <= panelX + panelWidth &&
      y >= panelY &&
      y <= panelY + panelHeight
    );
  }
  
  /**
   * 渲染帮助界面（优化：使用离屏Canvas缓存静态部分）
   */
  render() {
    if (!this.visible) return;
    
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    
    // 初始化缓存（如果未初始化）
    if (!HelpScreenCache.isInitialized()) {
      HelpScreenCache.init();
    }
   

    // 使用缓存渲染静态部分（遮罩、面板背景、标题）
    HelpScreenCache.render(this.ctx);
  
    // 计算面板尺寸（用于内容区域计算）
    const panelWidth = windowWidth * 0.65;
    const panelHeight = windowHeight * 0.75;
    const panelX = (windowWidth - panelWidth) / 2;
    const panelY = (windowHeight - panelHeight) / 2;
    
    // 计算内容区域（确保标题下方有足够空间）
    // 标题在 panelY + panelHeight * 0.12，标题高度约为 TITLE_FONT_SIZE * 0.8
    // 内容区域从标题下方开始，留出足够的间距，确保第一行文字完全可见
    const titleY = panelY + panelHeight * 0.12;
    const titleBottom = titleY + UIConfig.TITLE_FONT_SIZE * 0.8 * 0.5;
    // 增加间距，确保第一行文字（包括行高）完全可见
    const contentStartY = Math.max(titleBottom + 20, panelY + panelHeight * 0.22);
    const contentEndY = panelY + panelHeight * 0.88 - UIConfig.HELP_BTN_HEIGHT * 0.9;
    const contentAreaHeight = contentEndY - contentStartY;
    const lineHeight = UIConfig.SUBTITLE_FONT_SIZE * 1.5;
    // 内容居中显示，左右留出边距
    const contentPadding = panelWidth * 0.12; // 左右各12%的边距
    const contentX = panelX + contentPadding;
    const contentWidth = panelWidth - contentPadding * 2;
    
    // 计算内容总高度（使用缓存，只在内容宽度变化时重新计算）
    if (this._cachedContentWidth !== contentWidth) {
      this._cachedContentWidth = contentWidth;
      this._cachedContentHeight = this.calculateContentHeight(contentWidth);
    }
    this.contentHeight = this._cachedContentHeight;
    
    // 计算最大滚动位置
    this.maxScrollY = Math.max(0, this.contentHeight - contentAreaHeight);
    
    // 限制滚动位置（确保不会滚动过头）
    this.scrollY = Math.max(0, Math.min(this.maxScrollY, this.scrollY));
    
    // 设置裁剪区域（只显示内容区域）
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(contentX, contentStartY, contentWidth, contentAreaHeight);
    this.ctx.clip();

    // 渲染内容
    HelpScreenContent.render(this.ctx, contentX, contentStartY, contentWidth, this.scrollY);

    // 恢复裁剪区域
    this.ctx.restore();
    
    // 绘制关闭按钮（使用 BaseButton）
    if (this.closeButton) {
      this.closeButton.render(this.ctx);
    }
  }
  
  /**
   * 触摸开始（适配新事件系统：支持坐标参数或事件对象）
   * @param {Object|number} eOrX - 事件对象或 X 坐标
   * @param {number} [y] - Y 坐标（如果第一个参数是 X）
   * @returns {boolean} 是否处理了事件
   */
  onTouchStart(eOrX, y) {
    if (!this.visible) {
      return false;
    }

    // 提取触摸坐标
    let coords;
    if (typeof eOrX === 'number' && typeof y === 'number') {
      coords = { x: eOrX, y };
    } else {
      const e = eOrX;
      const touch = e.touches && e.touches[0] ? e.touches[0] : e;
      if (!touch) {
        return false;
      }
      coords = {
        x: touch.x || touch.clientX || 0,
        y: touch.y || touch.clientY || 0
      };
    }

    // 使用 BaseButton 的点击检测
    if (this.closeButton && this.closeButton.isClicked(coords.x, coords.y)) {
      return true;
    }

    // 使用滚动处理器处理滚动相关事件
    return this.scrollHandler.onTouchStart(eOrX, y);
  }

  /**
   * 触摸移动（适配新事件系统：支持坐标参数或事件对象）
   * @param {Object|number} eOrX - 事件对象或 X 坐标
   * @param {number} [y] - Y 坐标（如果第一个参数是 X）
   * @returns {boolean} 是否处理了事件
   */
  onTouchMove(eOrX, y) {
    if (!this.visible) {
      return false;
    }
    return this.scrollHandler.onTouchMove(eOrX, y);
  }

  /**
   * 触摸结束（适配新事件系统：支持坐标参数或事件对象）
   * @param {Object|number} eOrX - 事件对象或 X 坐标
   * @param {number} [y] - Y 坐标（如果第一个参数是 X）
   * @returns {boolean} 是否处理了事件
   */
  onTouchEnd(eOrX, y) {
    if (!this.visible) {
      return false;
    }
    
    // 提取触摸坐标
    let coords;
    if (typeof eOrX === 'number' && typeof y === 'number') {
      coords = { x: eOrX, y };
    } else {
      const e = eOrX;
      const touch = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : e;
      if (!touch) {
        return false;
      }
      coords = {
        x: touch.x || touch.clientX || 0,
        y: touch.y || touch.clientY || 0
      };
    }
    
    // 使用 BaseButton 的点击检测（在触摸结束时也检查，以防触摸开始时的检测失败）
    if (this.closeButton && this.closeButton.isClicked(coords.x, coords.y)) {
      return true;
    }
    
    return this.scrollHandler.onTouchEnd(eOrX, y);
  }
}

export { HelpScreen };
export default HelpScreen;
