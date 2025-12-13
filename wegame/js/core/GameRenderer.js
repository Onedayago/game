/**
 * 游戏渲染器
 * 负责游戏场景的渲染
 */

import { GameConfig } from '../config/GameConfig';
import { WeaponDragPreview } from '../ui/WeaponDragPreview';
import { ColorUtils, GameColors } from '../config/Colors';

export class GameRenderer {
  constructor(ctx, gameContext) {
    this.ctx = ctx;
    this.gameContext = gameContext;
    this.saveCount = 0; // 跟踪 save/restore 调用次数，优化性能
  }
  
  /**
   * 渲染游戏场景
   */
  render(deltaTime, deltaMS, managers) {
    const {
      backgroundRenderer,
      weaponManager,
      enemyManager,
      particleManager,
      weaponContainerUI,
      startScreen,
      goldManager,
      performanceMonitor
    } = managers;
    
    // 清空画布
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    this.ctx.clearRect(0, 0, windowWidth, windowHeight);
    
    // 绘制背景色
    if (backgroundRenderer) {
      this.ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.BACKGROUND);
      this.ctx.fillRect(0, 0, windowWidth, windowHeight);
    }
    
    // 保存上下文状态（优化：只在需要变换时保存）
    this.ctx.save();
    this.saveCount++;
    
    // 应用战场偏移（拖拽）
    const gameContext = this.gameContext;
    const offsetX = -gameContext.worldOffsetX;
    const offsetY = 0;
    this.ctx.translate(offsetX, offsetY);
    
    // 测量背景渲染耗时
    if (backgroundRenderer) {
      if (performanceMonitor) performanceMonitor.startMeasure('backgroundRender');
      backgroundRenderer.render();
      if (performanceMonitor) performanceMonitor.endMeasure('backgroundRender');
    }
    
    // 计算视锥范围（考虑战场偏移）
    const viewLeft = -offsetX;
    const viewRight = viewLeft + windowWidth;
    const viewTop = 0;
    const viewBottom = windowHeight;
    
    // 更新和渲染武器（需要传入敌人列表用于寻找目标）
    if (weaponManager) {
      const enemies = enemyManager ? enemyManager.getEnemies() : [];
      
      // 批量更新目标查找（优化性能，限制频率）
      if (enemies.length > 0 && weaponManager.weapons.length > 0) {
        if (performanceMonitor) performanceMonitor.startMeasure('batchTargetFind');
        weaponManager.batchUpdateTargets(enemies, deltaMS);
        if (performanceMonitor) performanceMonitor.endMeasure('batchTargetFind');
      }
      
      // 测量武器管理器更新和渲染耗时
      if (performanceMonitor) performanceMonitor.startMeasure('weaponManagerUpdate');
      weaponManager.update(deltaTime, deltaMS, enemies);
      if (performanceMonitor) performanceMonitor.endMeasure('weaponManagerUpdate');
      
      if (performanceMonitor) performanceMonitor.startMeasure('weaponManagerRender');
      weaponManager.render(viewLeft, viewRight, viewTop, viewBottom);
      if (performanceMonitor) performanceMonitor.endMeasure('weaponManagerRender');
    }
    
    // 更新和渲染敌人（需要传入武器列表用于寻找目标）
    if (enemyManager) {
      const weapons = weaponManager ? weaponManager.getWeapons() : [];
      
      // 测量敌人管理器更新和渲染耗时
      if (performanceMonitor) performanceMonitor.startMeasure('enemyManagerUpdate');
      enemyManager.update(deltaTime, deltaMS, weapons);
      if (performanceMonitor) performanceMonitor.endMeasure('enemyManagerUpdate');
      
      if (performanceMonitor) performanceMonitor.startMeasure('enemyManagerRender');
      enemyManager.render(viewLeft, viewRight, viewTop, viewBottom);
      if (performanceMonitor) performanceMonitor.endMeasure('enemyManagerRender');
    }
    
    // 测量粒子渲染耗时
    if (particleManager) {
      if (performanceMonitor) performanceMonitor.startMeasure('particleManagerRender');
      particleManager.render();
      if (performanceMonitor) performanceMonitor.endMeasure('particleManagerRender');
    }
    
    // 渲染拖拽预览（在战场区域内）
    if (weaponContainerUI && weaponContainerUI.isDragging() && weaponContainerUI.dragType) {
      const dragX = weaponContainerUI.dragX;
      const dragY = weaponContainerUI.dragY;
      const battleStartY = GameConfig.BATTLE_START_ROW * GameConfig.CELL_SIZE;
      const battleEndY = (GameConfig.BATTLE_START_ROW + GameConfig.BATTLE_ROWS) * GameConfig.CELL_SIZE;
      
      if (dragY >= battleStartY && dragY <= battleEndY) {
        // 在战斗区域内，显示预览（需要转换坐标）
        // 在 GameRenderer 中，使用 offsetX = -worldOffsetX 来平移画布
        // 所以当 worldOffsetX > 0 时，画布向左移动，世界坐标需要加上这个偏移
        const worldX = dragX + gameContext.worldOffsetX;
        const worldY = dragY;
        const col = Math.floor(worldX / GameConfig.CELL_SIZE);
        const row = Math.floor(worldY / GameConfig.CELL_SIZE);
        const previewX = col * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
        const previewY = row * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
        
        WeaponDragPreview.renderPreviewAt(this.ctx, previewX, previewY, weaponContainerUI.dragType, weaponManager);
      }
    }
    
    // 恢复上下文状态
    this.ctx.restore();
    this.saveCount--;
    
    // 测量 UI 渲染耗时
    if (managers.performanceMonitor) managers.performanceMonitor.startMeasure('uiRender');
    
    // 渲染 UI（不受战场偏移影响）
    if (weaponContainerUI) {
      weaponContainerUI.render();
    }
    
    if (startScreen && !this.gameContext.gameStarted) {
      startScreen.render();
    }
    
    // 渲染帮助界面（在开始界面之上）
    if (managers.helpScreen) {
      managers.helpScreen.render();
    }
    
    // 渲染金币显示
    if (goldManager) {
      goldManager.render(this.ctx);
    }
    
    // 渲染战场小视图
    if (managers.battlefieldMinimap) {
      managers.battlefieldMinimap.render();
    }
    
    if (managers.performanceMonitor) managers.performanceMonitor.endMeasure('uiRender');
  }
}

