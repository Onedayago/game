/**
 * 武器容器 UI 事件处理器
 * 负责处理触摸事件和点击检测
 */

import { GameConfig } from '../../config/GameConfig';
import { UIConfig } from '../../config/UIConfig';
import { WeaponType } from '../../config/WeaponConfig';

export class WeaponContainerEventHandler {
  constructor(containerUI) {
    this.containerUI = containerUI;
    this.touchStartInArrowArea = false; // 记录触摸开始时是否在箭头区域
    this._touchStartCoords = null; // 记录触摸开始时的坐标
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
   * 检查是否点击了箭头
   */
  _checkArrowClick(x, y) {
    const containerHeight = UIConfig.WEAPON_CONTAINER_HEIGHT;
    const containerY = GameConfig.DESIGN_HEIGHT - containerHeight - UIConfig.WEAPON_CONTAINER_BOTTOM_OFFSET;
    const containerWidth = UIConfig.WEAPON_CONTAINER_WIDTH;
    const containerX = (GameConfig.DESIGN_WIDTH - containerWidth) / 2 + UIConfig.WEAPON_CONTAINER_HORIZONTAL_OFFSET;

    const allWeaponTypes = [WeaponType.ROCKET, WeaponType.LASER, WeaponType.CANNON, WeaponType.SNIPER];
    const arrowSize = containerHeight * 0.4;
    const arrowPadding = UIConfig.ARROW_PADDING;
    const arrowBgRadius = arrowSize * 0.6;
    // 箭头缓存的实际尺寸（与 WeaponContainerCache 中的计算保持一致）
    const arrowCanvasSize = Math.ceil(arrowSize * 1.5);
    const arrowHalfSize = arrowCanvasSize / 2;
    const maxScrollIndex = Math.max(0, allWeaponTypes.length - this.containerUI.visibleCount);

    // 左箭头区域
    if (this.containerUI.scrollIndex > 0) {
      const leftArrowX = containerX - arrowPadding - arrowBgRadius;
      const leftArrowY = containerY + containerHeight / 2;
      // 使用箭头缓存的实际尺寸作为点击区域，增加一些容差
      const clickRadius = arrowHalfSize * 1.2; // 增加 20% 的容差，使点击更容易
      const dx = x - leftArrowX;
      const dy = y - leftArrowY;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared <= clickRadius * clickRadius) {
        this.containerUI.scrollLeft();
        return true;
      }
    }

    // 右箭头区域
    if (this.containerUI.scrollIndex < maxScrollIndex) {
      const rightArrowX = containerX + containerWidth + arrowPadding + arrowBgRadius;
      const rightArrowY = containerY + containerHeight / 2;
      // 使用箭头缓存的实际尺寸作为点击区域，增加一些容差
      const clickRadius = arrowHalfSize * 1.2; // 增加 20% 的容差，使点击更容易
      const dx = x - rightArrowX;
      const dy = y - rightArrowY;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared <= clickRadius * clickRadius) {
        this.containerUI.scrollRight();
        return true;
      }
    }

    return false;
  }

  /**
   * 检查是否点击了武器卡片
   */
  _checkCardClick(x, y) {
    const cardSize = GameConfig.CELL_SIZE;
    const spacing = UIConfig.WEAPON_CARD_SPACING;
    const containerHeight = UIConfig.WEAPON_CONTAINER_HEIGHT;
    const containerY = GameConfig.DESIGN_HEIGHT - containerHeight - UIConfig.WEAPON_CONTAINER_BOTTOM_OFFSET;
    const containerWidth = UIConfig.WEAPON_CONTAINER_WIDTH;
    const containerX = (GameConfig.DESIGN_WIDTH - containerWidth) / 2 + UIConfig.WEAPON_CONTAINER_HORIZONTAL_OFFSET;

    const allWeaponTypes = [WeaponType.ROCKET, WeaponType.LASER, WeaponType.CANNON, WeaponType.SNIPER];
    const visibleTypes = allWeaponTypes.slice(
      this.containerUI.scrollIndex,
      this.containerUI.scrollIndex + this.containerUI.visibleCount
    );
    const totalCardsWidth = cardSize * visibleTypes.length + spacing * (visibleTypes.length - 1);
    const startX = containerX + (containerWidth - totalCardsWidth) / 2;
    const cardY = containerY + (containerHeight - cardSize) / 2;

    for (let index = 0; index < visibleTypes.length; index++) {
      const type = visibleTypes[index];
      const cardX = startX + index * (cardSize + spacing);

      if (
        x >= cardX &&
        x <= cardX + cardSize &&
        y >= cardY &&
        y <= cardY + cardSize
      ) {
        if (this.containerUI.dragHandler.canStartDrag(type)) {
          this.containerUI._isDragging = true;
          this.containerUI.dragType = type;
          this.containerUI.dragX = x;
          this.containerUI.dragY = y;
          return true;
        } else {
          return false;
        }
      }
    }

    return false;
  }

  /**
   * 处理触摸开始事件
   */
  onTouchStart(eOrX, y) {
    const coords = this._extractTouchCoords(eOrX, y);
    if (!coords) {
      return false;
    }

    // 重置状态
    this.touchStartInArrowArea = false;
    this._touchStartCoords = null;

    // 优先检查是否在箭头区域内（箭头点击优先级高于卡片拖拽）
    if (this._isInArrowArea(coords.x, coords.y)) {
      this.touchStartInArrowArea = true; // 记录触摸开始时在箭头区域
      this._touchStartCoords = { x: coords.x, y: coords.y }; // 保存触摸开始时的坐标
      return true; // 返回 true 表示处理了事件，阻止其他处理
    }

    // 检查是否点击了武器卡片（拖拽需要在触摸开始时开始）
    if (this._checkCardClick(coords.x, coords.y)) {
      return true;
    }

    return false;
  }
  
  /**
   * 检查是否在箭头区域内（不触发点击，只用于判断）
   */
  _isInArrowArea(x, y) {
    const containerHeight = UIConfig.WEAPON_CONTAINER_HEIGHT;
    const containerY = GameConfig.DESIGN_HEIGHT - containerHeight - UIConfig.WEAPON_CONTAINER_BOTTOM_OFFSET;
    const containerWidth = UIConfig.WEAPON_CONTAINER_WIDTH;
    const containerX = (GameConfig.DESIGN_WIDTH - containerWidth) / 2 + UIConfig.WEAPON_CONTAINER_HORIZONTAL_OFFSET;

    const allWeaponTypes = [WeaponType.ROCKET, WeaponType.LASER, WeaponType.CANNON, WeaponType.SNIPER];
    const arrowSize = containerHeight * 0.4;
    const arrowPadding = UIConfig.ARROW_PADDING;
    const arrowBgRadius = arrowSize * 0.6;
    // 箭头缓存的实际尺寸（与 WeaponContainerCache 中的计算保持一致）
    const arrowCanvasSize = Math.ceil(arrowSize * 1.5);
    const arrowHalfSize = arrowCanvasSize / 2;
    const maxScrollIndex = Math.max(0, allWeaponTypes.length - this.containerUI.visibleCount);

    // 左箭头区域
    if (this.containerUI.scrollIndex > 0) {
      const leftArrowX = containerX - arrowPadding - arrowBgRadius;
      const leftArrowY = containerY + containerHeight / 2;
      // 使用箭头缓存的实际尺寸作为点击区域，增加一些容差
      const clickRadius = arrowHalfSize * 1.2; // 增加 20% 的容差，使点击更容易
      const dx = x - leftArrowX;
      const dy = y - leftArrowY;
      if (dx * dx + dy * dy <= clickRadius * clickRadius) {
        return true;
      }
    }

    // 右箭头区域
    if (this.containerUI.scrollIndex < maxScrollIndex) {
      const rightArrowX = containerX + containerWidth + arrowPadding + arrowBgRadius;
      const rightArrowY = containerY + containerHeight / 2;
      // 使用箭头缓存的实际尺寸作为点击区域，增加一些容差
      const clickRadius = arrowHalfSize * 1.2; // 增加 20% 的容差，使点击更容易
      const dx = x - rightArrowX;
      const dy = y - rightArrowY;
      if (dx * dx + dy * dy <= clickRadius * clickRadius) {
        return true;
      }
    }

    return false;
  }

  /**
   * 处理触摸移动事件
   */
  onTouchMove(eOrX, y) {
    if (!this.containerUI._isDragging) {
      return false;
    }

    const coords = this._extractTouchCoords(eOrX, y);
    if (coords) {
      this.containerUI.dragX = coords.x;
      this.containerUI.dragY = coords.y;
    }

    return true;
  }

  /**
   * 处理触摸结束事件
   */
  onTouchEnd(eOrX, y) {
    let coords;
    if (typeof eOrX === 'number' && typeof y === 'number') {
      coords = { x: eOrX, y };
    } else {
      const e = eOrX;
      const touch = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : e;
      if (!touch) {
        if (this.containerUI._isDragging) {
          this.containerUI._isDragging = false;
          this.containerUI.dragType = null;
        }
        return false;
      }
      coords = {
        x: touch.x || touch.clientX || 0,
        y: touch.y || touch.clientY || 0
      };
    }

    // 如果正在拖拽，处理放置
    if (this.containerUI._isDragging && this.containerUI.dragType) {
      // 使用拖拽处理器处理放置
      this.containerUI.dragHandler.handleDrop(coords.x, coords.y, this.containerUI.dragType);

      this.containerUI._isDragging = false;
      this.containerUI.dragType = null;
      this.touchStartInArrowArea = false;
      this._touchStartCoords = null;

      return true;
    }

    // 检查箭头点击（优先使用触摸开始时的坐标，如果失败则使用结束坐标）
    if (this.touchStartInArrowArea && this._touchStartCoords) {
      // 优先使用触摸开始时的坐标（更准确）
      if (this._checkArrowClick(this._touchStartCoords.x, this._touchStartCoords.y)) {
        this.touchStartInArrowArea = false;
        this._touchStartCoords = null;
        return true;
      }
    }
    
    // 如果触摸开始时在箭头区域但使用开始坐标检测失败，尝试使用结束坐标
    // 或者直接检查结束坐标是否在箭头区域（允许点击时手指稍微移动）
    if (this._checkArrowClick(coords.x, coords.y)) {
      this.touchStartInArrowArea = false;
      this._touchStartCoords = null;
      return true;
    }

    this.touchStartInArrowArea = false;
    this._touchStartCoords = null;
    return false;
  }
}

