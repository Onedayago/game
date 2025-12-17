/**
 * 武器容器 UI
 */

import { GameConfig } from '../../config/GameConfig';
import { UIConfig } from '../../config/UIConfig';
import { WeaponType } from '../../config/WeaponConfig';
import { WeaponCardRenderer } from './WeaponCardRenderer';
import { WeaponDragHandler } from '../../ui/handlers/WeaponDragHandler';
import { WeaponContainerCache } from '../../ui/cache/WeaponContainerCache';
import { WeaponContainerRenderer } from '../../ui/renderers/WeaponContainerRenderer';
import { WeaponContainerEventHandler } from '../../ui/handlers/WeaponContainerEventHandler';

export class WeaponContainerUI {
  constructor(ctx, goldManager, weaponManager) {
    this.ctx = ctx;
    this.goldManager = goldManager;
    this.weaponManager = weaponManager;
    this.selectedWeaponType = null;
    this._isDragging = false;
    this.dragType = null;
    this.dragX = 0;
    this.dragY = 0;
    
    // 武器容器滚动相关
    this.scrollIndex = 0;
    this.visibleCount = 2;
    
    // 拖拽处理器
    this.dragHandler = new WeaponDragHandler(goldManager, weaponManager);

    // 事件处理器
    this.eventHandler = new WeaponContainerEventHandler(this);
    
    // 初始化静态缓存
    WeaponContainerCache.init();
  }
  
  
  /**
   * 初始化
   */
  init() {
    // 初始化武器卡片渲染缓存
    const cardSize = GameConfig.CELL_SIZE;
    const weaponTypes = [WeaponType.ROCKET, WeaponType.LASER, WeaponType.CANNON, WeaponType.SNIPER];
    
    for (const weaponType of weaponTypes) {
      WeaponCardRenderer.initCache(weaponType, cardSize);
    }
  }
  
  /**
   * 更新
   */
  update(deltaTime) {
    // UI 更新逻辑（当前无需每帧更新）
  }
  
  /**
   * 渲染
   */
  render() {
    this.ctx.save();

    // 计算容器位置
    const containerHeight = UIConfig.WEAPON_CONTAINER_HEIGHT;
    const containerY = GameConfig.DESIGN_HEIGHT - containerHeight - UIConfig.WEAPON_CONTAINER_BOTTOM_OFFSET;
    const containerWidth = UIConfig.WEAPON_CONTAINER_WIDTH;
    const containerX = (GameConfig.DESIGN_WIDTH - containerWidth) / 2 + UIConfig.WEAPON_CONTAINER_HORIZONTAL_OFFSET;

    // 绘制背景
    WeaponContainerRenderer.renderBackground(
      this.ctx,
      containerX,
      containerY,
      containerWidth,
      containerHeight
    );

    // 绘制武器卡片
    WeaponContainerRenderer.renderWeaponCards(
      this.ctx,
      containerX,
      containerY,
      containerWidth,
      containerHeight,
      this.scrollIndex,
      this.visibleCount,
      this.selectedWeaponType
    );

    // 绘制左右箭头
    WeaponContainerRenderer.renderArrows(
      this.ctx,
      containerX,
      containerY,
      containerWidth,
      containerHeight,
      this.scrollIndex,
      this.visibleCount
    );

    this.ctx.restore();

    // 绘制拖拽图标（不在战斗区域时显示）
    if (this._isDragging && this.dragType) {
      const battleStartY = GameConfig.BATTLE_START_ROW * GameConfig.CELL_SIZE;
      const battleEndY = GameConfig.BATTLE_END_ROW * GameConfig.CELL_SIZE;

      if (this.dragY < battleStartY || this.dragY >= battleEndY) {
        WeaponContainerRenderer.renderDragIcon(this.ctx, this.dragX, this.dragY, this.dragType);
      }
    }
  }

  /**
   * 向左滚动
   */
  scrollLeft() {
    if (this.scrollIndex > 0) {
      this.scrollIndex--;
    }
  }

  /**
   * 向右滚动
   */
  scrollRight() {
    const allWeaponTypes = [WeaponType.ROCKET, WeaponType.LASER, WeaponType.CANNON, WeaponType.SNIPER];
    const maxScrollIndex = Math.max(0, allWeaponTypes.length - this.visibleCount);
    if (this.scrollIndex < maxScrollIndex) {
      this.scrollIndex++;
    }
  }
  
  
  /**
   * 检查是否正在拖拽
   */
  isDragging() {
    return this._isDragging;
  }
  
  /**
   * 判断点是否在组件边界内（包括箭头区域）
   * @param {number} x - 点的 X 坐标
   * @param {number} y - 点的 Y 坐标
   * @returns {boolean} 是否在边界内
   */
  isPointInBounds(x, y) {
    const containerHeight = UIConfig.WEAPON_CONTAINER_HEIGHT;
    const containerY = GameConfig.DESIGN_HEIGHT - containerHeight - UIConfig.WEAPON_CONTAINER_BOTTOM_OFFSET;
    const containerWidth = UIConfig.WEAPON_CONTAINER_WIDTH;
    const containerX = (GameConfig.DESIGN_WIDTH - containerWidth) / 2 + UIConfig.WEAPON_CONTAINER_HORIZONTAL_OFFSET;
    
    // 计算箭头区域（扩大边界以包含箭头）
    const arrowSize = containerHeight * 0.4;
    const arrowPadding = UIConfig.ARROW_PADDING;
    const arrowBgRadius = arrowSize * 0.6;
    const arrowCanvasSize = Math.ceil(arrowSize * 1.5);
    const arrowHalfSize = arrowCanvasSize / 2;
    const arrowAreaWidth = arrowPadding + arrowBgRadius + arrowHalfSize;
    
    // 检查是否在容器或箭头区域内
    const allWeaponTypes = [WeaponType.ROCKET, WeaponType.LASER, WeaponType.CANNON, WeaponType.SNIPER];
    const maxScrollIndex = Math.max(0, allWeaponTypes.length - this.visibleCount);
    
    // 左箭头区域
    if (this.scrollIndex > 0) {
      const leftArrowX = containerX - arrowAreaWidth;
      if (x >= leftArrowX - arrowHalfSize && x <= containerX + containerWidth && 
          y >= containerY && y <= containerY + containerHeight) {
        return true;
      }
    }
    
    // 右箭头区域
    if (this.scrollIndex < maxScrollIndex) {
      const rightArrowX = containerX + containerWidth + arrowAreaWidth;
      if (x >= containerX && x <= rightArrowX + arrowHalfSize && 
          y >= containerY && y <= containerY + containerHeight) {
        return true;
      }
    }
    
    // 容器区域
    return x >= containerX && 
           x <= containerX + containerWidth && 
           y >= containerY && 
           y <= containerY + containerHeight;
  }
  
  /**
   * 触摸开始（适配新事件系统：支持坐标参数或事件对象）
   * @param {Object|number} eOrX - 事件对象或 X 坐标
   * @param {number} [y] - Y 坐标（如果第一个参数是 X）
   * @returns {boolean} 是否处理了事件
   */
  onTouchStart(eOrX, y) {
    return this.eventHandler.onTouchStart(eOrX, y);
  }

  /**
   * 触摸移动（适配新事件系统：支持坐标参数或事件对象）
   * @param {Object|number} eOrX - 事件对象或 X 坐标
   * @param {number} [y] - Y 坐标（如果第一个参数是 X）
   * @returns {boolean} 是否处理了事件
   */
  onTouchMove(eOrX, y) {
    return this.eventHandler.onTouchMove(eOrX, y);
  }

  /**
   * 触摸结束（适配新事件系统：支持坐标参数或事件对象）
   * @param {Object|number} eOrX - 事件对象或 X 坐标
   * @param {number} [y] - Y 坐标（如果第一个参数是 X）
   * @returns {boolean} 是否处理了事件
   */
  onTouchEnd(eOrX, y) {
    return this.eventHandler.onTouchEnd(eOrX, y);
  }
}

