/**
 * 游戏渲染器
 * 负责游戏场景的渲染
 */

import { GameConfig } from '../config/GameConfig';
import { WeaponDragPreview } from '../ui/WeaponDragPreview';
import { ColorUtils, GameColors } from '../config/Colors';
import { UIRenderer } from '../ui/UIRenderer';

export class GameRenderer {
  constructor(ctx, gameContext) {
    this.ctx = ctx;
    this.gameContext = gameContext;
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
      goldManager
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
    
    // 应用战场偏移（拖拽）- 不使用 translate，手动计算坐标
    const gameContext = this.gameContext;
    const offsetX = -gameContext.worldOffsetX;
    const offsetY = 0;
    
    // 渲染背景（应用战场偏移，不使用 translate）
    if (backgroundRenderer) {
      backgroundRenderer.render(offsetX, offsetY);
    }
    
    // 计算视锥范围（考虑战场偏移）
    const viewLeft = -offsetX;
    const viewRight = viewLeft + windowWidth;
    const viewTop = 0;
    const viewBottom = windowHeight;
    
    // 更新和渲染武器（需要传入敌人列表用于寻找目标）
    // 注意：武器和敌人的坐标需要加上 offsetX 来应用战场偏移
    if (weaponManager && !this.gameContext.gamePaused && !this.gameContext.gameOver) {
      const enemies = enemyManager ? enemyManager.getEnemies() : [];
      weaponManager.update(deltaTime, deltaMS, enemies);
    }
    if (weaponManager) {
      weaponManager.render(viewLeft, viewRight, viewTop, viewBottom, offsetX, offsetY);
    }
    
    // 更新和渲染敌人（需要传入武器列表用于寻找目标）
    if (enemyManager && !this.gameContext.gamePaused && !this.gameContext.gameOver) {
      const weapons = weaponManager ? weaponManager.getWeapons() : [];
      enemyManager.update(deltaTime, deltaMS, weapons);
    }
    if (enemyManager) {
      enemyManager.render(viewLeft, viewRight, viewTop, viewBottom, offsetX, offsetY);
    }
    
    // 渲染粒子（需要应用战场偏移）
    if (particleManager) {
      particleManager.render(offsetX, offsetY);
    }
    
    // 渲染拖拽预览（在战场区域内）
    if (weaponContainerUI && weaponContainerUI.isDragging() && weaponContainerUI.dragType) {
      const dragX = weaponContainerUI.dragX;
      const dragY = weaponContainerUI.dragY;
      const battleStartY = GameConfig.BATTLE_START_ROW * GameConfig.CELL_SIZE;
      const battleEndY = (GameConfig.BATTLE_START_ROW + GameConfig.BATTLE_ROWS) * GameConfig.CELL_SIZE;
      
      if (dragY >= battleStartY && dragY <= battleEndY) {
        // 在战斗区域内，显示预览（需要转换坐标）
        const worldX = dragX + gameContext.worldOffsetX;
        const worldY = dragY;
        const col = Math.floor(worldX / GameConfig.CELL_SIZE);
        const row = Math.floor(worldY / GameConfig.CELL_SIZE);
        const previewX = col * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2 + offsetX;
        const previewY = row * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2 + offsetY;
        
        WeaponDragPreview.renderPreviewAt(this.ctx, previewX, previewY, weaponContainerUI.dragType, weaponManager);
      }
    }
    
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
    
    // 渲染UI（使用UIRenderer）
    if (this.gameContext.gameStarted) {
      // 渲染波次信息
      if (enemyManager) {
        UIRenderer.renderWaveInfo(this.ctx, enemyManager);
        // 渲染波次开始提示
        if (enemyManager.shouldShowWaveNotification()) {
          UIRenderer.renderWaveNotification(this.ctx, enemyManager);
        }
      }
      
      // 渲染暂停按钮
      UIRenderer.renderPauseButton(this.ctx);
      
      // 渲染游戏结束界面（优先级最高）
      if (this.gameContext.gameOver) {
        UIRenderer.renderGameOverScreen(this.ctx);
      }
      // 渲染暂停界面（如果游戏已暂停且未结束）
      else if (this.gameContext.gamePaused) {
        UIRenderer.renderPauseScreen(this.ctx);
      }
    }
    
    // 渲染战场小视图
    if (managers.battlefieldMinimap) {
      managers.battlefieldMinimap.render();
    }
  }
}
