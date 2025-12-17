/**
 * 帮助界面滚动处理器
 * 负责处理帮助界面的滚动逻辑
 */

import { GameConfig } from '../../config/GameConfig';
import { UIConfig } from '../../config/UIConfig';

export class HelpScreenScrollHandler {
  constructor(helpScreen) {
    this.helpScreen = helpScreen;
  }

  /**
   * 提取触摸坐标（支持新旧事件系统）
   */
  _extractTouchCoords(eOrX, y) {
    if (typeof eOrX === 'number' && typeof y === 'number') {
      return { x: eOrX, y };
    } else {
      const e = eOrX;
      const touch = e.touches && e.touches[0] ? e.touches[0] : e;
      if (!touch) {
        return null;
      }
      return {
        x: touch.x || touch.clientX || 0,
        y: touch.y || touch.clientY || 0
      };
    }
  }

  /**
   * 检查是否在内容区域（可以滚动）
   */
  _isInContentArea(x, y) {
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    const panelWidth = windowWidth * 0.65;
    const panelHeight = windowHeight * 0.75;
    const panelX = (windowWidth - panelWidth) / 2;
    const panelY = (windowHeight - panelHeight) / 2;
    const titleY = panelY + panelHeight * 0.12;
    const titleBottom = titleY + UIConfig.TITLE_FONT_SIZE * 0.8 * 0.5;
    const contentStartY = Math.max(titleBottom + 20, panelY + panelHeight * 0.22);
    const contentEndY = panelY + panelHeight * 0.88 - UIConfig.HELP_BTN_HEIGHT * 0.9;
    const contentPadding = panelWidth * 0.12;
    const contentX = panelX + contentPadding;
    const contentWidth = panelWidth - contentPadding * 2;

    // 检查是否在内容区域内，并且可以滚动（maxScrollY > 0）
    const inContentBounds = (
      x >= contentX &&
      x <= contentX + contentWidth &&
      y >= contentStartY &&
      y <= contentEndY
    );
    
    // 如果 maxScrollY 还没有计算，先尝试计算（通过渲染时的逻辑）
    if (inContentBounds && this.helpScreen.maxScrollY === undefined) {
      // 计算内容高度和最大滚动位置
      const contentAreaHeight = contentEndY - contentStartY;
      const contentHeight = this.helpScreen.calculateContentHeight(contentWidth);
      this.helpScreen.maxScrollY = Math.max(0, contentHeight - contentAreaHeight);
    }

    return inContentBounds && (this.helpScreen.maxScrollY || 0) > 0;
  }

  /**
   * 处理触摸开始事件（滚动相关）
   */
  onTouchStart(eOrX, y) {
    if (!this.helpScreen.visible) {
      return false;
    }

    const coords = this._extractTouchCoords(eOrX, y);
    if (!coords) {
      return false;
    }

    // 检查是否在内容区域（可以滚动）
    if (this._isInContentArea(coords.x, coords.y)) {
      this.helpScreen.isScrolling = true;
      this.helpScreen.scrollStartY = coords.y;
      this.helpScreen.scrollStartScrollY = this.helpScreen.scrollY || 0;
      return true;
    }

    // 即使不在内容区域，只要在面板内，也返回 true 阻止事件穿透
    // 但不在内容区域时不启动滚动
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    const panelWidth = windowWidth * 0.65;
    const panelHeight = windowHeight * 0.75;
    const panelX = (windowWidth - panelWidth) / 2;
    const panelY = (windowHeight - panelHeight) / 2;
    
    if (
      coords.x >= panelX &&
      coords.x <= panelX + panelWidth &&
      coords.y >= panelY &&
      coords.y <= panelY + panelHeight
    ) {
      // 在面板内但不滚动，返回 true 阻止事件穿透
      return true;
    }

    return false;
  }

  /**
   * 处理触摸移动事件（滚动相关）
   */
  onTouchMove(eOrX, y) {
    if (!this.helpScreen.visible || !this.helpScreen.isScrolling) {
      return false;
    }

    const coords = this._extractTouchCoords(eOrX, y);
    if (!coords) {
      return false;
    }

    const dy = coords.y - this.helpScreen.scrollStartY;

    // 更新滚动位置（向上滑动时scrollY增加，向下滑动时scrollY减少）
    this.helpScreen.scrollY = this.helpScreen.scrollStartScrollY - dy;

    // 确保 maxScrollY 已计算
    if (this.helpScreen.maxScrollY === undefined || this.helpScreen.maxScrollY === null) {
      // 如果还没有计算，尝试计算
      const windowWidth = GameConfig.DESIGN_WIDTH;
      const windowHeight = GameConfig.DESIGN_HEIGHT;
      const panelWidth = windowWidth * 0.65;
      const panelHeight = windowHeight * 0.75;
      const panelY = (windowHeight - panelHeight) / 2;
      const titleY = panelY + panelHeight * 0.12;
      const titleBottom = titleY + UIConfig.TITLE_FONT_SIZE * 0.8 * 0.5;
      const contentStartY = Math.max(titleBottom + 20, panelY + panelHeight * 0.22);
      const contentEndY = panelY + panelHeight * 0.88 - UIConfig.HELP_BTN_HEIGHT * 0.9;
      const contentAreaHeight = contentEndY - contentStartY;
      const contentPadding = panelWidth * 0.12;
      const contentWidth = panelWidth - contentPadding * 2;
      const contentHeight = this.helpScreen.calculateContentHeight(contentWidth);
      this.helpScreen.maxScrollY = Math.max(0, contentHeight - contentAreaHeight);
    }

    // 限制滚动范围
    this.helpScreen.scrollY = Math.max(0, Math.min(this.helpScreen.maxScrollY || 0, this.helpScreen.scrollY));

    return true;
  }

  /**
   * 处理触摸结束事件（滚动相关）
   */
  onTouchEnd(eOrX, y) {
    if (this.helpScreen.isScrolling) {
      this.helpScreen.isScrolling = false;
      return true;
    }
    return false;
  }
}

