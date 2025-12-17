/**
 * UI 组件注册器
 * 负责根据游戏状态注册 UI 组件到事件管理器
 */

import { UIComponentAdapter } from '../ui/handlers/UIComponentAdapter';
import { UIRenderer } from '../ui/renderers/UIRenderer';

export class UIComponentRegistry {
  constructor(uiEventManager, gameContext) {
    this.uiEventManager = uiEventManager;
    this.gameContext = gameContext;
  }

  /**
   * 注册所有 UI 组件到事件管理器
   * @param {Object} uiComponents - UI 组件对象
   * @param {Function} callbacks - 回调函数对象
   */
  registerAll(uiComponents, callbacks) {
    // 先清空所有已注册的组件
    this.uiEventManager.clear();

    // 优先级说明：数字越大优先级越高
    // 优先级 110: 引导覆盖层（最高优先级）
    // 优先级 100: 游戏结束界面
    // 优先级 90: 暂停界面
    // 优先级 80: 帮助界面
    // 优先级 70: 开始界面
    // 优先级 60: 暂停按钮
    // 优先级 50: 武器容器 UI
    // 优先级 40: 战场小地图

    // 引导覆盖层（优先级 110，最高优先级）
    if (uiComponents.tutorialOverlay && uiComponents.tutorialOverlay.visible) {
      this.uiEventManager.registerComponent(uiComponents.tutorialOverlay, 110);
    }

    // 游戏结束界面（优先级 100）
    if (this.gameContext.gameOver && this.gameContext.gameStarted) {
      this._registerGameOverScreen(callbacks.restartGame);
    }

    // 暂停界面（优先级 90）
    if (this.gameContext.gamePaused && 
        this.gameContext.gameStarted && 
        !this.gameContext.gameOver) {
      this._registerPauseScreen(callbacks.resumeGame);
    }

    // 帮助界面（优先级 80）
    if (uiComponents.helpScreen) {
      this.uiEventManager.registerComponent(uiComponents.helpScreen, 80);
    }

    // 开始界面（优先级 70）
    if (uiComponents.startScreen && !this.gameContext.gameStarted) {
      this.uiEventManager.registerComponent(uiComponents.startScreen, 70);
    }

    // 暂停按钮（优先级 60）
    if (this.gameContext.gameStarted && !this.gameContext.gamePaused) {
      this._registerPauseButton(callbacks.pauseGame);
    }

    // 武器容器 UI（优先级 50）
    if (uiComponents.weaponContainerUI && this.gameContext.gameStarted) {
      this.uiEventManager.registerComponent(uiComponents.weaponContainerUI, 50);
    }

    // 战场小地图（优先级 40）
    if (uiComponents.battlefieldMinimap && this.gameContext.gameStarted) {
      this.uiEventManager.registerComponent(uiComponents.battlefieldMinimap, 40);
    }
  }

  /**
   * 注册游戏结束界面
   */
  _registerGameOverScreen(restartCallback) {
    const gameOverAdapter = UIComponentAdapter.createAdapter(
      { visible: true },
      () => UIRenderer.getRestartButtonBounds(),
      (x, y) => {
        const bounds = UIRenderer.getRestartButtonBounds();
        if (x >= bounds.x && x <= bounds.x + bounds.width &&
            y >= bounds.y && y <= bounds.y + bounds.height) {
          restartCallback();
          return true;
        }
        return false;
      }
    );
    this.uiEventManager.registerComponent(gameOverAdapter, 100);
  }

  /**
   * 注册暂停界面
   */
  _registerPauseScreen(resumeCallback) {
    const pauseAdapter = UIComponentAdapter.createAdapter(
      { visible: true },
      () => UIRenderer.getResumeButtonBounds(),
      (x, y) => {
        const bounds = UIRenderer.getResumeButtonBounds();
        if (x >= bounds.x && x <= bounds.x + bounds.width &&
            y >= bounds.y && y <= bounds.y + bounds.height) {
          resumeCallback();
          return true;
        }
        return false;
      }
    );
    this.uiEventManager.registerComponent(pauseAdapter, 90);
  }

  /**
   * 注册暂停按钮
   */
  _registerPauseButton(pauseCallback) {
    const pauseButtonAdapter = UIComponentAdapter.createAdapter(
      { visible: true },
      () => UIRenderer.getPauseButtonBounds(),
      (x, y) => {
        const bounds = UIRenderer.getPauseButtonBounds();
        if (x >= bounds.x && x <= bounds.x + bounds.width &&
            y >= bounds.y && y <= bounds.y + bounds.height) {
          pauseCallback();
          return true;
        }
        return false;
      }
    );
    this.uiEventManager.registerComponent(pauseButtonAdapter, 60);
  }
}

