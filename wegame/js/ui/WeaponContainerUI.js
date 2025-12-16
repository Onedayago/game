/**
 * 武器容器 UI
 */

import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';
import { WeaponType, WeaponConfigs } from '../config/WeaponConfig';
import { ColorUtils, GameColors } from '../config/Colors';
import { WeaponCardRenderer } from './WeaponCardRenderer';
import { WeaponDragHandler } from './WeaponDragHandler';
import { WeaponRenderer } from '../rendering/WeaponRenderer';
import { polyfillRoundRect } from '../utils/CanvasUtils';

export class WeaponContainerUI {
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
  
  constructor(ctx, goldManager, weaponManager) {
    this.ctx = ctx;
    this.goldManager = goldManager;
    this.weaponManager = weaponManager;
    this.selectedWeaponType = null;
    this._isDragging = false; // 私有属性，避免与方法名冲突
    this.dragType = null;
    this.dragX = 0;
    this.dragY = 0;
    
    // 武器容器滚动相关
    this.scrollIndex = 0; // 当前显示的起始索引
    this.visibleCount = 2; // 一次显示的武器数量
    
    // 拖拽处理器
    this.dragHandler = new WeaponDragHandler(goldManager, weaponManager);
    
    // 初始化静态缓存
    this.initStaticCache();
  }
  
  /**
   * 初始化静态部分缓存
   */
  initStaticCache() {
    const containerWidth = UIConfig.WEAPON_CONTAINER_WIDTH;
    const containerHeight = UIConfig.WEAPON_CONTAINER_HEIGHT;
    const arrowSize = containerHeight * 0.4;
    
    // 如果已经初始化且尺寸相同，直接返回
    if (WeaponContainerUI._initialized && 
        WeaponContainerUI._cacheWidth === containerWidth && 
        WeaponContainerUI._cacheHeight === containerHeight &&
        WeaponContainerUI._arrowSize === arrowSize) {
      return;
    }
    
    // 初始化背景缓存
    WeaponContainerUI._backgroundCache = wx.createCanvas();
    WeaponContainerUI._backgroundCache.width = containerWidth;
    WeaponContainerUI._backgroundCache.height = containerHeight;
    WeaponContainerUI._backgroundCtx = WeaponContainerUI._backgroundCache.getContext('2d');
    
    // 初始化箭头缓存
    const arrowCanvasSize = Math.ceil(arrowSize * 1.5);
    WeaponContainerUI._leftArrowCache = wx.createCanvas();
    WeaponContainerUI._leftArrowCache.width = arrowCanvasSize;
    WeaponContainerUI._leftArrowCache.height = arrowCanvasSize;
    WeaponContainerUI._leftArrowCtx = WeaponContainerUI._leftArrowCache.getContext('2d');
    
    WeaponContainerUI._rightArrowCache = wx.createCanvas();
    WeaponContainerUI._rightArrowCache.width = arrowCanvasSize;
    WeaponContainerUI._rightArrowCache.height = arrowCanvasSize;
    WeaponContainerUI._rightArrowCtx = WeaponContainerUI._rightArrowCache.getContext('2d');
    
    WeaponContainerUI._cacheWidth = containerWidth;
    WeaponContainerUI._cacheHeight = containerHeight;
    WeaponContainerUI._arrowSize = arrowSize;
    
    // 绘制背景到缓存
    this.drawBackgroundToCache(WeaponContainerUI._backgroundCtx, containerWidth, containerHeight);
    
    // 绘制箭头到缓存
    this.drawArrowToCache(WeaponContainerUI._leftArrowCtx, arrowCanvasSize / 2, arrowCanvasSize / 2, arrowSize, true);
    this.drawArrowToCache(WeaponContainerUI._rightArrowCtx, arrowCanvasSize / 2, arrowCanvasSize / 2, arrowSize, false);
    
    WeaponContainerUI._initialized = true;
  }
  
  /**
   * 绘制背景到缓存Canvas
   */
  drawBackgroundToCache(ctx, width, height) {
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
   * 绘制箭头到缓存Canvas（美化版：使用离屏渲染）
   */
  drawArrowToCache(ctx, x, y, size, left) {
    const bgRadius = size * 0.6;
    
    // 1. 绘制外层光晕（大圆，渐变）
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, bgRadius * 1.3);
    glowGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.3));
    glowGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.15));
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y, bgRadius * 1.3, 0, Math.PI * 2);
    ctx.fill();
    
    // 2. 绘制背景阴影（制造立体感）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, bgRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 3. 绘制主背景（渐变圆形，从上到下）
    const bgGradient = ctx.createLinearGradient(x, y - bgRadius, x, y + bgRadius);
    bgGradient.addColorStop(0, 'rgba(50, 55, 70, 0.95)');
    bgGradient.addColorStop(0.3, 'rgba(40, 45, 60, 0.92)');
    bgGradient.addColorStop(0.7, 'rgba(30, 35, 50, 0.9)');
    bgGradient.addColorStop(1, 'rgba(20, 25, 40, 0.88)');
    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    ctx.arc(x, y, bgRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 4. 绘制内层高光（上半部分）
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
    
    // 5. 绘制外边框（渐变色）
    const borderGradient = ctx.createLinearGradient(x, y - bgRadius, x, y + bgRadius);
    borderGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.9));
    borderGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.7));
    borderGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.5));
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, bgRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // 6. 绘制内边框（高光）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xffffff, 0.15);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, bgRadius - 2, 0, Math.PI * 2);
    ctx.stroke();
    
    // 7. 绘制箭头主体（三角形，带渐变）
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
    
    // 9. 箭头内部高光（小三角形）
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
    // TODO: 更新 UI 逻辑
  }
  
  /**
   * 渲染
   */
  render() {
  
    this.ctx.save();
    
    // 计算容器位置（用于定位武器卡片）
    const containerHeight = UIConfig.WEAPON_CONTAINER_HEIGHT;
    const containerY = GameConfig.DESIGN_HEIGHT - containerHeight - UIConfig.WEAPON_CONTAINER_BOTTOM_OFFSET;
    const containerWidth = UIConfig.WEAPON_CONTAINER_WIDTH;
    const containerX = (GameConfig.DESIGN_WIDTH - containerWidth) / 2 + UIConfig.WEAPON_CONTAINER_HORIZONTAL_OFFSET;
    
    // 绘制背景
    this.renderBackground(containerX, containerY, containerWidth, containerHeight);
    
    // 绘制武器卡片
    this.renderWeaponCards(containerX, containerY, containerWidth, containerHeight);
    
    // 绘制左右箭头
    this.renderArrows(containerX, containerY, containerWidth, containerHeight);
    
    this.ctx.restore();
    
    // 绘制拖拽图标（不在战斗区域时显示，排除底部UI区域）
    if (this._isDragging && this.dragType) {
      const battleStartY = GameConfig.BATTLE_START_ROW * GameConfig.CELL_SIZE;
      const battleEndY = GameConfig.BATTLE_END_ROW * GameConfig.CELL_SIZE;
      
      // 不在战斗区域，显示拖拽图标
      if (this.dragY < battleStartY || this.dragY >= battleEndY) {
        this.renderDragIcon(this.dragX, this.dragY, this.dragType);
      }
      // 在战斗区域的预览由 GameRenderer 在战场层级渲染
    }
  }
  
  /**
   * 渲染背景（使用缓存）
   */
  renderBackground(containerX, containerY, containerWidth, containerHeight) {
    if (!WeaponContainerUI._initialized || !WeaponContainerUI._backgroundCache) {
      this.initStaticCache();
    }
    
    if (WeaponContainerUI._backgroundCache) {
      this.ctx.drawImage(
        WeaponContainerUI._backgroundCache,
        containerX,
        containerY,
        containerWidth,
        containerHeight
      );
    }
  }
  
  /**
   * 渲染武器卡片
   */
  renderWeaponCards(containerX, containerY, containerWidth, containerHeight) {
    const cardSize = GameConfig.CELL_SIZE;
    const spacing = UIConfig.WEAPON_CARD_SPACING;
    const allWeaponTypes = [WeaponType.ROCKET, WeaponType.LASER, WeaponType.CANNON, WeaponType.SNIPER];
    
    // 获取当前可见的武器类型
    const visibleWeaponTypes = allWeaponTypes.slice(this.scrollIndex, this.scrollIndex + this.visibleCount);
    
    // 计算卡片总宽度和起始位置（在容器内居中）
    const totalCardsWidth = cardSize * visibleWeaponTypes.length + spacing * (visibleWeaponTypes.length - 1);
    const startX = containerX + (containerWidth - totalCardsWidth) / 2;
    const cardY = containerY + (containerHeight - cardSize) / 2;
    
    // 渲染每个可见的武器卡片
    visibleWeaponTypes.forEach((type, index) => {
      const cardX = startX + index * (cardSize + spacing);
      this.renderWeaponCard(cardX, cardY, cardSize, type);
    });
  }
  
  /**
   * 渲染武器卡片
   */
  renderWeaponCard(x, y, size, weaponType) {
    const isSelected = this.selectedWeaponType === weaponType;
    WeaponCardRenderer.renderCard(this.ctx, x, y, size, weaponType, isSelected);
  }
  
  /**
   * 渲染左右箭头
   */
  renderArrows(containerX, containerY, containerWidth, containerHeight) {
    const arrowSize = containerHeight * 0.4; // 箭头大小
    const arrowPadding = UIConfig.ARROW_PADDING;
    const arrowBgRadius = arrowSize * 0.6; // 箭头背景半径
    const allWeaponTypes = [WeaponType.ROCKET, WeaponType.LASER, WeaponType.CANNON, WeaponType.SNIPER];
    const maxScrollIndex = Math.max(0, allWeaponTypes.length - this.visibleCount);
    
    // 左箭头（如果可以向左滚动）
    // 箭头中心到容器左边缘的距离 = arrowPadding + arrowBgRadius
    if (this.scrollIndex > 0) {
      const leftArrowX = containerX - arrowPadding - arrowBgRadius;
      const leftArrowY = containerY + containerHeight / 2;
      this.renderArrow(leftArrowX, leftArrowY, arrowSize, true); // true = 向左
    }
    
    // 右箭头（如果可以向右滚动）
    // 箭头中心到容器右边缘的距离 = arrowPadding + arrowBgRadius
    if (this.scrollIndex < maxScrollIndex) {
      const rightArrowX = containerX + containerWidth + arrowPadding + arrowBgRadius;
      const rightArrowY = containerY + containerHeight / 2;
      this.renderArrow(rightArrowX, rightArrowY, arrowSize, false); // false = 向右
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
   * 渲染单个箭头（使用缓存）
   * @param {number} x - 箭头中心X坐标
   * @param {number} y - 箭头中心Y坐标
   * @param {number} size - 箭头大小
   * @param {boolean} left - true为左箭头，false为右箭头
   */
  renderArrow(x, y, size, left) {
    if (!WeaponContainerUI._initialized) {
      this.initStaticCache();
    }
    
    const arrowCache = left ? WeaponContainerUI._leftArrowCache : WeaponContainerUI._rightArrowCache;
    if (!arrowCache) {
      return;
    }
    
    const arrowCanvasSize = arrowCache.width;
    const halfSize = arrowCanvasSize / 2;
    
    this.ctx.drawImage(
      arrowCache,
      x - halfSize,
      y - halfSize,
      arrowCanvasSize,
      arrowCanvasSize
    );
  }
  
  /**
   * 渲染拖拽中的武器图标
   */
  renderDragIcon(x, y, weaponType) {
    const config = WeaponConfigs.getConfig(weaponType);
    if (!config) return;
    
    this.ctx.save();
    
    const size = UIConfig.DRAG_GHOST_SIZE * UIConfig.DRAG_GHOST_SCALE;
    
    // 绘制半透明背景圆形
    const bgGradient = this.ctx.createRadialGradient(x, y, 0, x, y, size / 2);
    bgGradient.addColorStop(0, ColorUtils.hexToCanvas(config.colorHex, 0.6));
    bgGradient.addColorStop(1, ColorUtils.hexToCanvas(config.colorHex, 0.3));
    this.ctx.fillStyle = bgGradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 绘制边框
    this.ctx.strokeStyle = ColorUtils.hexToCanvas(config.colorHex, 0.8);
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // 使用武器渲染器绘制武器图标
    this.ctx.globalAlpha = 0.9;
    WeaponRenderer.renderWeaponIcon(this.ctx, x, y, weaponType, size * 0.7);
    this.ctx.globalAlpha = 1.0;
    
    this.ctx.restore();
  }
  
  
  /**
   * 检查是否正在拖拽
   */
  isDragging() {
    return this._isDragging;
  }
  
  /**
   * 触摸开始
   */
  onTouchStart(e) {
    // 微信小游戏的触摸事件格式
    const touch = e.touches && e.touches[0] ? e.touches[0] : e;
    if (!touch) {
      console.log('WeaponContainerUI.onTouchStart: 没有触摸点');
      return;
    }
    
    const x = touch.x || touch.clientX || 0;
    const y = touch.y || touch.clientY || 0;
    
    console.log('WeaponContainerUI.onTouchStart', { x, y, touch });
    
    // 检查是否点击了武器卡片
    // 使用与渲染时相同的坐标计算
    const cardSize = GameConfig.CELL_SIZE;
    const spacing = UIConfig.WEAPON_CARD_SPACING;
    const containerHeight = UIConfig.WEAPON_CONTAINER_HEIGHT;
    const containerY = GameConfig.DESIGN_HEIGHT - containerHeight;
    const containerWidth = UIConfig.WEAPON_CONTAINER_WIDTH;
    const containerX = (GameConfig.DESIGN_WIDTH - containerWidth) / 2 + UIConfig.WEAPON_CONTAINER_HORIZONTAL_OFFSET;
    
    // 检查是否点击了箭头
    const allWeaponTypes = [WeaponType.ROCKET, WeaponType.LASER, WeaponType.CANNON, WeaponType.SNIPER];
    const arrowSize = containerHeight * 0.4;
    const arrowPadding = UIConfig.ARROW_PADDING;
    const arrowBgRadius = arrowSize * 0.6; // 箭头背景半径
    const maxScrollIndex = Math.max(0, allWeaponTypes.length - this.visibleCount);
    
    // 左箭头区域
    // 箭头中心到容器左边缘的距离 = arrowPadding + arrowBgRadius
    if (this.scrollIndex > 0) {
      const leftArrowX = containerX - arrowPadding - arrowBgRadius;
      const leftArrowY = containerY + containerHeight / 2;
      const dx = x - leftArrowX;
      const dy = y - leftArrowY;
      if (dx * dx + dy * dy <= arrowBgRadius * arrowBgRadius) {
        this.scrollLeft();
        return;
      }
    }
    
    // 右箭头区域
    // 箭头中心到容器右边缘的距离 = arrowPadding + arrowBgRadius
    if (this.scrollIndex < maxScrollIndex) {
      const rightArrowX = containerX + containerWidth + arrowPadding + arrowBgRadius;
      const rightArrowY = containerY + containerHeight / 2;
      const dx = x - rightArrowX;
      const dy = y - rightArrowY;
      if (dx * dx + dy * dy <= arrowBgRadius * arrowBgRadius) {
        this.scrollRight();
        return;
      }
    }
    
    // 检查是否点击了武器卡片
    const visibleTypes = allWeaponTypes.slice(this.scrollIndex, this.scrollIndex + this.visibleCount);
    const totalCardsWidth = cardSize * visibleTypes.length + spacing * (visibleTypes.length - 1);
    const startX = containerX + (containerWidth - totalCardsWidth) / 2;
    const cardY = containerY + (containerHeight - cardSize) / 2;
    
    visibleTypes.forEach((type, index) => {
      const cardX = startX + index * (cardSize + spacing);
      
      console.log(`检查卡片 ${index}`, { 
        type, 
        cardX, 
        cardY, 
        cardSize,
        x, 
        y,
        inBounds: x >= cardX && x <= cardX + cardSize && y >= cardY && y <= cardY + cardSize
      });
      
      if (
        x >= cardX &&
        x <= cardX + cardSize &&
        y >= cardY &&
        y <= cardY + cardSize
      ) {
        console.log('点击了武器卡片', { 
          type, 
          x, 
          y, 
          cardX, 
          cardY,
          gold: this.goldManager.getGold(),
          canDrag: this.dragHandler.canStartDrag(type) 
        });
        if (this.dragHandler.canStartDrag(type)) {
          this._isDragging = true;
          this.dragType = type;
          this.dragX = x;
          this.dragY = y;
          console.log('开始拖拽', { type, dragX: this.dragX, dragY: this.dragY });
        } else {
          console.log('无法拖拽：金币不足', { 
            gold: this.goldManager.getGold(),
            cost: WeaponConfigs.getConfig(type)?.baseCost 
          });
        }
      }
    });
  }
  
  /**
   * 触摸移动
   */
  onTouchMove(e) {
    if (this._isDragging) {
      // 微信小游戏的触摸事件格式
      const touch = e.touches && e.touches[0] ? e.touches[0] : e;
      if (touch) {
        this.dragX = touch.x || touch.clientX || 0;
        this.dragY = touch.y || touch.clientY || 0;
      }
    }
  }
  
  /**
   * 触摸结束
   */
  onTouchEnd(e) {
    if (this._isDragging && this.dragType) {
      // 微信小游戏的触摸事件格式
      const touch = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : e;
      if (touch) {
        const x = touch.x || touch.clientX || 0;
        const y = touch.y || touch.clientY || 0;
        
        // 使用拖拽处理器处理放置
        this.dragHandler.handleDrop(x, y, this.dragType);
      }
      
      this._isDragging = false;
      this.dragType = null;
    }
  }
}

