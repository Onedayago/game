/**
 * 窗口尺寸变化处理器
 * 负责处理窗口尺寸变化时的缓存重新初始化
 */

import { GameConfig } from '../config/GameConfig';
import { GameInitializer } from './GameInitializer';
import { BackgroundRenderer } from '../rendering/background/BackgroundRenderer';
import { WeaponRenderer } from '../rendering/weapons/WeaponRenderer';
import { EnemyTankConfig } from '../config/enemies/EnemyTankConfig';
import { HelpScreen } from '../ui/screens/HelpScreen';
import { LogUtils } from '../utils/LogUtils';

export class WindowResizeHandler {
  constructor(canvas, ctx, components) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.components = components;
  }

  /**
   * 处理窗口尺寸变化
   * @param {number} newWidth 新的窗口宽度
   * @param {number} newHeight 新的窗口高度
   * @param {number} newPixelRatio 新的像素比
   */
  handleResize(newWidth, newHeight, newPixelRatio) {
    LogUtils.log('WindowResize', 1000, '游戏窗口尺寸变化', { 
      newWidth, 
      newHeight, 
      newPixelRatio 
    });

    // 重新初始化游戏配置（更新设计尺寸）
    GameConfig.reset();

    // 重新初始化 Canvas（如果需要）
    GameInitializer.setupCanvas(this.canvas, this.ctx);

    // 重新初始化 UI 缓存（因为尺寸变化了）
    if (this.components.startScreen) {
      this.components.startScreen.initStaticCache();
    }
    if (this.components.helpScreen) {
      HelpScreen.initStaticCache();
    }
    if (this.components.backgroundRenderer) {
      BackgroundRenderer.initCache();
    }

    // 重新初始化其他缓存
    if (this.components.weaponManager) {
      const maxEntitySize = Math.max(
        EnemyTankConfig.SIZE, 
        GameConfig.CELL_SIZE * 0.8
      );
      WeaponRenderer.initHealthBarCache(maxEntitySize);
    }
    if (this.components.enemyManager) {
      this.components.enemyManager.init();
    }
    if (this.components.weaponContainerUI) {
      this.components.weaponContainerUI.init();
    }
    if (this.components.battlefieldMinimap) {
      this.components.battlefieldMinimap.init();
    }
  }
}

