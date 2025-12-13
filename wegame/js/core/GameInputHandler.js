/**
 * 游戏输入处理器
 * 处理触摸事件和战场拖拽
 */

import { GameConfig } from '../config/GameConfig';

export class GameInputHandler {
  constructor(gameContext) {
    this.gameContext = gameContext;
    this.isPanning = false;
    this.panStartX = 0;
    this.worldStartX = 0;
  }
  
  /**
   * 触摸开始
   */
  onTouchStart(e, weaponContainerUI, startScreen, helpScreen, battlefieldMinimap) {
    console.log('GameInputHandler.onTouchStart', e);
    
    // 微信小游戏的触摸事件格式
    const touch = e.touches && e.touches[0] ? e.touches[0] : e;
    if (!touch) {
      console.log('GameInputHandler.onTouchStart: 没有触摸点');
      return false;
    }
    
    const x = touch.x || touch.clientX || 0;
    const y = touch.y || touch.clientY || 0;
    
    console.log('GameInputHandler.onTouchStart: 触摸坐标', { x, y, touch });
    
    // 先检查战场小视图（如果游戏已开始）
    if (battlefieldMinimap && this.gameContext.gameStarted) {
      if (battlefieldMinimap.onTouchStart(e)) {
        console.log('GameInputHandler: 战场小视图处理了触摸事件');
        return true;
      }
    }
    
    // 先检查 UI 交互（武器容器、开始界面）
    let handledByUI = false;
    
    // 先检查帮助界面（优先级最高）
    if (helpScreen && helpScreen.visible) {
      helpScreen.onTouchStart(e);
      handledByUI = true;
      console.log('GameInputHandler: 帮助界面处理了触摸事件');
      return true;
    }
    
    // 再检查开始界面（如果游戏未开始）
    if (startScreen && !this.gameContext.gameStarted) {
      startScreen.onTouchStart(e);
      handledByUI = true;
      console.log('GameInputHandler: 开始界面处理了触摸事件');
    }
    
    // 再检查武器容器（如果游戏已开始）
    if (weaponContainerUI && this.gameContext.gameStarted) {
      weaponContainerUI.onTouchStart(e);
      if (weaponContainerUI.isDragging()) {
        handledByUI = true;
        console.log('GameInputHandler: UI 处理了触摸事件（武器拖拽）');
      }
    }
    
    // 如果 UI 已经处理了，不处理战场拖拽
    if (handledByUI) {
      console.log('GameInputHandler.onTouchStart: UI 已处理，跳过战场拖拽');
      return true;
    }
    
    // 检查是否在战斗区域内，开始战场拖拽
    if (this.isInBattleArea(x, y)) {
      this.isPanning = true;
      this.panStartX = x;
      this.worldStartX = this.gameContext.worldOffsetX;
      console.log('GameInputHandler.onTouchStart: 开始战场拖拽', {
        x, y,
        isInBattleArea: true,
        worldOffsetX: this.gameContext.worldOffsetX,
        panStartX: this.panStartX,
        worldStartX: this.worldStartX
      });
    } else {
      console.log('GameInputHandler.onTouchStart: 不在战斗区域内', {
        x, y,
        battleStartY: GameConfig.BATTLE_START_ROW * GameConfig.CELL_SIZE,
        battleEndY: (GameConfig.BATTLE_START_ROW + GameConfig.BATTLE_ROWS) * GameConfig.CELL_SIZE
      });
    }
    
    return false;
  }
  
  /**
   * 触摸移动
   */
  onTouchMove(e, weaponContainerUI, helpScreen, battlefieldMinimap) {
    // 先检查小地图拖拽（如果游戏已开始）
    if (battlefieldMinimap && this.gameContext.gameStarted && battlefieldMinimap.isDragging) {
      if (battlefieldMinimap.onTouchMove(e)) {
        return;
      }
    }
    
    // 先检查帮助界面滚动
    if (helpScreen && helpScreen.visible && helpScreen.isScrolling) {
      helpScreen.onTouchMove(e);
      return;
    }
    
    // 先检查武器拖拽，如果正在拖拽武器，不处理战场拖拽
    if (weaponContainerUI && weaponContainerUI.isDragging()) {
      weaponContainerUI.onTouchMove(e);
      return;
    }
    
    if (this.isPanning) {
      // 微信小游戏的触摸事件格式
      const touch = e.touches && e.touches[0] ? e.touches[0] : e;
      if (touch) {
        const x = touch.x || touch.clientX || 0;
        const dx = x - this.panStartX;
        
        // 计算新位置并限制拖动范围
        // 用户向右拖动（dx > 0），应该显示更多右侧内容，所以 worldOffsetX 应该增加
        // 但为了符合直觉（向右拖动显示右侧），需要反转 dx
        const { minX, maxX } = this.calculatePanBounds();
        let nextX = this.worldStartX - dx; // 反转 dx
        nextX = Math.max(minX, Math.min(maxX, nextX));
        
        this.gameContext.worldOffsetX = nextX;
        console.log('GameInputHandler.onTouchMove: 战场拖拽', {
          x, dx, nextX, minX, maxX,
          worldOffsetX: this.gameContext.worldOffsetX,
          isPanning: this.isPanning
        });
      }
    }
    
    // 传递给 UI 处理
    if (weaponContainerUI) {
      weaponContainerUI.onTouchMove(e);
    }
  }
  
  /**
   * 触摸结束
   */
  onTouchEnd(e, weaponContainerUI, startScreen, helpScreen, battlefieldMinimap) {
    // 处理小地图拖拽结束（如果游戏已开始）
    if (battlefieldMinimap && this.gameContext.gameStarted) {
      if (battlefieldMinimap.onTouchEnd(e)) {
        return;
      }
    }
    
    // 处理帮助界面滚动结束
    if (helpScreen && helpScreen.visible) {
      helpScreen.onTouchEnd(e);
    }
    
    this.isPanning = false;
    
    // 传递给 UI 处理
    if (weaponContainerUI) {
      weaponContainerUI.onTouchEnd(e);
    }
    
    if (startScreen && !this.gameContext.gameStarted) {
      startScreen.onTouchEnd(e);
    }
  }
  
  /**
   * 检查触摸点是否在战斗区域内
   */
  isInBattleArea(x, y) {
    // 微信小游戏的触摸坐标是相对于 Canvas 左上角的（Y 轴从上往下）
    // 直接使用 Canvas 坐标系检查
    const battleStartY = GameConfig.BATTLE_START_ROW * GameConfig.CELL_SIZE;
    const battleEndY = (GameConfig.BATTLE_START_ROW + GameConfig.BATTLE_ROWS) * GameConfig.CELL_SIZE;
    
    return y >= battleStartY && y <= battleEndY;
  }
  
  /**
   * 计算拖动边界
   */
  calculatePanBounds() {
    // 战场宽度是 BATTLE_WIDTH，设计宽度是 DESIGN_WIDTH
    // worldOffsetX 的范围：0 到 (BATTLE_WIDTH - DESIGN_WIDTH)
    // 0: 初始位置，战场左边界对齐画布左边界
    // BATTLE_WIDTH - DESIGN_WIDTH: 战场右边界对齐画布右边界
    const minX = 0; // 初始位置，不偏移
    const maxX = Math.max(0, GameConfig.BATTLE_WIDTH - GameConfig.DESIGN_WIDTH); // 最大偏移
    
    return { minX, maxX };
  }
}

