/**
 * 武器容器 UI
 */

import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';
import { WeaponType, WeaponConfigs } from '../config/WeaponConfig';
import { ColorUtils } from '../config/Colors';
import { WeaponCardRenderer } from './WeaponCardRenderer';
import { WeaponDragHandler } from './WeaponDragHandler';

export class WeaponContainerUI {
  constructor(ctx, goldManager, weaponManager) {
    this.ctx = ctx;
    this.goldManager = goldManager;
    this.weaponManager = weaponManager;
    this.selectedWeaponType = null;
    this._isDragging = false; // 私有属性，避免与方法名冲突
    this.dragType = null;
    this.dragX = 0;
    this.dragY = 0;
    
    // 拖拽处理器
    this.dragHandler = new WeaponDragHandler(goldManager, weaponManager);
  }
  
  /**
   * 初始化
   */
  init() {
    // TODO: 初始化武器容器 UI
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
    const containerY = GameConfig.DESIGN_HEIGHT - containerHeight;
    const containerWidth = GameConfig.DESIGN_WIDTH * 0.5;
    
    // 不绘制背景和边框，只绘制武器卡片
    this.renderWeaponCards(containerY, containerHeight);
    
    this.ctx.restore();
    
    // 绘制拖拽图标（不在战斗区域时显示）
    if (this._isDragging && this.dragType) {
      const battleStartY = GameConfig.BATTLE_START_ROW * GameConfig.CELL_SIZE;
      const battleEndY = (GameConfig.BATTLE_START_ROW + GameConfig.BATTLE_ROWS) * GameConfig.CELL_SIZE;
      
      // 不在战斗区域，显示拖拽图标
      if (this.dragY < battleStartY || this.dragY > battleEndY) {
        this.renderDragIcon(this.dragX, this.dragY, this.dragType);
      }
      // 在战斗区域的预览由 GameRenderer 在战场层级渲染
    }
  }
  
  /**
   * 渲染武器卡片
   */
  renderWeaponCards(containerY, containerHeight) {
    const cardSize = GameConfig.CELL_SIZE;
    const spacing = UIConfig.WEAPON_CARD_SPACING;
    const startX = (GameConfig.DESIGN_WIDTH - (cardSize * 2 + spacing)) / 2;
    const cardY = containerY + (containerHeight - cardSize) / 2;
    
    const weaponTypes = [WeaponType.ROCKET, WeaponType.LASER];
    
    weaponTypes.forEach((type, index) => {
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
   * 渲染拖拽中的武器图标
   */
  renderDragIcon(x, y, weaponType) {
    const config = WeaponConfigs.getConfig(weaponType);
    if (!config) return;
    
    this.ctx.save();
    
    const size = UIConfig.DRAG_GHOST_SIZE * UIConfig.DRAG_GHOST_SCALE;
    
    // 绘制半透明背景
    this.ctx.fillStyle = ColorUtils.hexToCanvas(config.colorHex, 0.5);
    this.ctx.beginPath();
    this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 绘制图标
    this.ctx.fillStyle = ColorUtils.hexToCanvas(config.colorHex);
    this.ctx.font = `${size * 0.6}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(config.icon, x, y);
    
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
    const startX = (GameConfig.DESIGN_WIDTH - (cardSize * 2 + spacing)) / 2;
    const cardY = containerY + (containerHeight - cardSize) / 2;
    
    console.log('卡片位置', { 
      cardSize, 
      spacing, 
      containerHeight, 
      containerY, 
      startX, 
      cardY,
      DESIGN_HEIGHT: GameConfig.DESIGN_HEIGHT,
      DESIGN_WIDTH: GameConfig.DESIGN_WIDTH
    });
    
    const weaponTypes = [WeaponType.ROCKET, WeaponType.LASER];
    
    weaponTypes.forEach((type, index) => {
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

