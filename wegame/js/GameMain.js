/**
 * 游戏主控制器
 * 微信小游戏版本
 */

import { GameConfig } from './config/GameConfig';
import { GameContext } from './core/GameContext';
import { GameInitializer } from './core/GameInitializer';
import { GameInputHandler } from './core/GameInputHandler';
import { GameLoop } from './core/GameLoop';
import { GameStateManager } from './core/GameStateManager';
import { ResourceLoader } from './core/ResourceLoader';
import { UIComponentRegistry } from './core/UIComponentRegistry';
import { WindowResizeHandler } from './core/WindowResizeHandler';
import { BattlefieldMinimap } from './ui/widgets/BattlefieldMinimap';
import { WeaponDragPreview } from './ui/widgets/WeaponDragPreview';
import { UIEventManager } from './ui/handlers/UIEventManager';
import { TutorialOverlay } from './ui/components/TutorialOverlay';
import { TutorialManager } from './utils/TutorialManager';
import { LogUtils } from './utils/LogUtils';

export default class GameMain {
  constructor(canvas, ctx, pixelRatio = 1) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.pixelRatio = pixelRatio;
    
    // 游戏上下文
    this.gameContext = GameContext.getInstance();
    
    // 管理器
    this.backgroundRenderer = null;
    this.weaponManager = null;
    this.enemyManager = null;
    this.goldManager = null;
    this.particleManager = null;
    this.obstacleManager = null;
    this.effectManager = null;
    this.audioManager = null;
    
    // UI
    this.loadingScreen = null;
    this.startScreen = null;
    this.helpScreen = null;
    this.weaponContainerUI = null;
    this.battlefieldMinimap = null;
    this.tutorialOverlay = null;
    
    // 加载状态
    this.isLoading = false;
    
    // 游戏循环和渲染
    this.gameLoop = new GameLoop();
    this.gameRenderer = null;
    this.inputHandler = new GameInputHandler(this.gameContext);
    
    // UI 事件管理器
    this.uiEventManager = new UIEventManager();
    
    // 子管理器
    this.stateManager = null;
    this.resourceLoader = null;
    this.uiRegistry = null;
    this.windowResizeHandler = null;
    
    // FPS 监控
    this.fpsFrameCount = 0;
    this.fpsLastTime = Date.now();
    this.fps = 60;
    
    // 游戏状态跟踪
    this._lastGameOverState = false;
  }
  
  /**
   * 初始化游戏
   */
  init() {
    // 初始化游戏
    
    // 初始化游戏配置（获取屏幕尺寸并缓存）
    GameConfig.init();
  
    // 初始化 Canvas
    GameInitializer.setupCanvas(this.canvas, this.ctx);
    
    // 创建管理器
    const managers = GameInitializer.createManagers(this.ctx, this.gameContext);
    this.backgroundRenderer = managers.backgroundRenderer;
    this.weaponManager = managers.weaponManager;
    this.enemyManager = managers.enemyManager;
    this.goldManager = managers.goldManager;
    this.particleManager = managers.particleManager;
    this.obstacleManager = managers.obstacleManager;
    this.effectManager = managers.effectManager;
    this.audioManager = managers.audioManager;
    
    // 设置特效管理器引用
    this.weaponManager?.setEffectManager(this.effectManager);
    this.enemyManager?.setEffectManager(this.effectManager);
    
    // 初始化 UI
    const uiComponents = GameInitializer.initUI(
      this.ctx,
      this.gameContext,
      this.goldManager,
      this.weaponManager,
      this.enemyManager
    );
    this.loadingScreen = uiComponents.loadingScreen;
    this.weaponContainerUI = uiComponents.weaponContainerUI;
    this.startScreen = uiComponents.startScreen;
    this.helpScreen = uiComponents.helpScreen;
    this.battlefieldMinimap = uiComponents.battlefieldMinimap;
    
    // 创建引导覆盖层
    this.tutorialOverlay = new TutorialOverlay(this.ctx);
    
    // 设置战场小视图点击回调
    this.battlefieldMinimap.setOnClick((targetWorldOffsetX, targetWorldOffsetY) => {
      this.gameContext.worldOffsetX = targetWorldOffsetX;
      this.gameContext.worldOffsetY = targetWorldOffsetY || 0;
    });
    
    // 创建游戏渲染器
    this.gameRenderer = GameInitializer.createRenderer(this.ctx, this.gameContext);
    
    // 初始化子管理器
    this._initSubManagers();
    
    // 注册 UI 组件到事件管理器
    this.registerUIComponents();
    
    // 开始加载流程
    this.startLoading();
    
    // 开始游戏循环
    this.start();
  }
  
  /**
   * 初始化子管理器
   */
  _initSubManagers() {
    // 游戏状态管理器
    this.stateManager = new GameStateManager(this.gameContext, {
      weaponManager: this.weaponManager,
      enemyManager: this.enemyManager,
      goldManager: this.goldManager,
      obstacleManager: this.obstacleManager,
      particleManager: this.particleManager,
      effectManager: this.effectManager
    });
    
    // 资源加载器
    this.resourceLoader = new ResourceLoader(this.loadingScreen);
    
    // UI 组件注册器
    this.uiRegistry = new UIComponentRegistry(this.uiEventManager, this.gameContext);
    
    // 窗口尺寸变化处理器
    this.windowResizeHandler = new WindowResizeHandler(this.canvas, this.ctx, {
      startScreen: this.startScreen,
      helpScreen: this.helpScreen,
      backgroundRenderer: this.backgroundRenderer,
      weaponManager: this.weaponManager,
      enemyManager: this.enemyManager,
      weaponContainerUI: this.weaponContainerUI,
      battlefieldMinimap: this.battlefieldMinimap
    });
  }
  
  /**
   * 开始加载流程
   */
  startLoading() {
    this.isLoading = true;
    if (this.loadingScreen) {
      this.loadingScreen.show();
    }
    
    // 异步加载资源
    this.loadResources();
  }
  
  /**
   * 加载游戏资源
   */
  async loadResources() {
    try {
      await this.resourceLoader.loadResources();
      
      // 隐藏加载界面
      this.isLoading = false;
      if (this.loadingScreen) {
        this.loadingScreen.hide();
      }
      
      // 显示开始界面
      this.showStartScreen();
      
      // 注册 UI 组件（加载完成后）
      this.registerUIComponents();
      
    } catch (error) {
      LogUtils.error('GameMain', 0, '资源加载失败:', error);
      if (this.loadingScreen) {
        this.loadingScreen.setProgress(1, '加载失败，请重试');
      }
    }
  }
  
  /**
   * 显示开始界面
   */
  showStartScreen() {
    if (this.startScreen) {
      this.startScreen.show(
        () => {
          this.onStartButtonClick();
        },
        () => {
          this.onHelpButtonClick();
        }
      );
    }
  }
  
  /**
   * 帮助按钮点击
   */
  onHelpButtonClick() {
    if (this.helpScreen) {
      this.helpScreen.show(() => {
        this.helpScreen.hide();
      });
    }
  }
  
  /**
   * 开始按钮点击
   */
  onStartButtonClick() {
    // 先开始游戏（设置游戏状态）
    this.stateManager.startGame();
    this.registerUIComponents();
    
    this.showTutorial();
    // // 检查是否需要显示引导
    // if (TutorialManager.hasCompletedTutorial()) {
    //   // 显示引导（引导期间暂停敌人波次）
      
    // } else {
    //   // 直接开始游戏流程
    //   this.startGameFlow();
    // }
  }
  
  /**
   * 显示引导
   */
  showTutorial() {
    // 暂停敌人波次
    if (this.enemyManager) {
      this.enemyManager.setTutorialPaused(true);
    }
    
    // 显示引导覆盖层
    this.tutorialOverlay.show(() => {
      // 引导完成
      this.onTutorialComplete();
    });
    
    // 注册UI组件（包含引导覆盖层）
    this.registerUIComponents();
  }
  
  /**
   * 引导完成
   */
  onTutorialComplete() {
    // 标记引导已完成
    TutorialManager.markTutorialCompleted();
    
    // 恢复敌人波次
    if (this.enemyManager) {
      this.enemyManager.setTutorialPaused(false);
    }
    
    // 开始游戏流程
    this.startGameFlow();
    
    // 重新注册UI组件（移除引导覆盖层）
    this.registerUIComponents();
  }
  
  /**
   * 开始游戏流程（播放音乐等）
   */
  startGameFlow() {
    // 开始播放背景音乐
    if (this.audioManager) {
      this.audioManager.playBackgroundMusic();
    }
  }
  
  /**
   * 注册所有 UI 组件到事件管理器
   */
  registerUIComponents() {
    this.uiRegistry.registerAll(
      {
        helpScreen: this.helpScreen,
        startScreen: this.startScreen,
        weaponContainerUI: this.weaponContainerUI,
        battlefieldMinimap: this.battlefieldMinimap,
        tutorialOverlay: this.tutorialOverlay
      },
      {
        restartGame: () => this.restartGame(),
        resumeGame: () => this.resumeGame(),
        pauseGame: () => this.pauseGame()
      }
    );
  }
  
  /**
   * 开始游戏循环
   */
  start() {
    this.gameLoop.start(
      (deltaTime, deltaMS) => this.onUpdate(deltaTime, deltaMS),
      (deltaTime, deltaMS) => this.onRender(deltaTime, deltaMS)
    );
  }
  
  /**
   * 暂停游戏（游戏循环）
   */
  pause() {
    this.gameLoop.pause();
  }
  
  /**
   * 恢复游戏（游戏循环）
   */
  resume() {
    this.gameLoop.resume(
      (deltaTime, deltaMS) => this.onUpdate(deltaTime, deltaMS),
      (deltaTime, deltaMS) => this.onRender(deltaTime, deltaMS)
    );
  }
  
  /**
   * 暂停游戏（游戏逻辑）
   */
  pauseGame() {
    this.stateManager.pauseGame();
    this.registerUIComponents();
    
    // 暂停背景音乐
    if (this.audioManager) {
      this.audioManager.pauseBackgroundMusic();
    }
  }
  
  /**
   * 恢复游戏（游戏逻辑）
   */
  resumeGame() {
    this.stateManager.resumeGame();
    this.registerUIComponents();
    
    // 恢复背景音乐
    if (this.audioManager) {
      this.audioManager.resumeBackgroundMusic();
    }
  }
  
  /**
   * 重新开始游戏
   */
  restartGame() {
    this.stateManager.restartGame();
    this.showStartScreen();
    this.registerUIComponents();
    
    // 停止背景音乐
    if (this.audioManager) {
      this.audioManager.stopBackgroundMusic();
    }
  }
  
  /**
   * 销毁游戏
   */
  destroy() {
    this.gameLoop.destroy();
  }
  
  /**
   * 更新回调
   */
  onUpdate(deltaTime, deltaMS) {
    // 计算FPS
    this.updateFPS();
    
    // 更新静态动画时间（始终更新）
    BattlefieldMinimap.updateAnimation(deltaTime);
    WeaponDragPreview.updateAnimation(deltaTime);
    
    // 更新游戏逻辑（如果游戏已开始且未暂停）
    if (this.gameContext.gameStarted && !this.gameContext.gamePaused) {
      this.update(deltaTime, deltaMS);
    } else if (this.loadingScreen) {
      // 仅在加载中更新加载界面
      this.loadingScreen.update(deltaMS);
    }
  }
  
  /**
   * 更新FPS
   */
  updateFPS() {
    this.fpsFrameCount++;
    const currentTime = Date.now();
    const elapsed = currentTime - this.fpsLastTime;
    
    // 每秒更新一次FPS
    if (elapsed >= 1000) {
      this.fps = Math.round((this.fpsFrameCount * 1000) / elapsed);
      LogUtils.log('FPS', 1000, `FPS: ${this.fps}`);
      this.fpsFrameCount = 0;
      this.fpsLastTime = currentTime;
    }
  }
  
  /**
   * 渲染回调
   */
  onRender(deltaTime, deltaMS) {
    this.render(deltaTime, deltaMS);
  }
  
  
  /**
   * 更新游戏逻辑
   */
  update(deltaTime, deltaMS) {
    // 更新金币管理器
    this.goldManager?.update();
    
    // 检查游戏结束状态变化
    if (this.gameContext.gameOver !== this._lastGameOverState) {
      this._lastGameOverState = this.gameContext.gameOver;
      this.registerUIComponents();
    }
    
    // 更新粒子和特效
    this.particleManager?.update(deltaTime);
    this.effectManager?.update(deltaTime, deltaMS);
    
    // 更新UI组件
    this.weaponContainerUI?.update(deltaTime);
    this.startScreen?.update(deltaMS);
    this.tutorialOverlay?.update(deltaTime);
  }
  
  /**
   * 渲染游戏
   */
  render(deltaTime, deltaMS) { 
    this.gameRenderer?.render(deltaTime, deltaMS, {
        backgroundRenderer: this.backgroundRenderer,
        weaponManager: this.weaponManager,
        enemyManager: this.enemyManager,
        particleManager: this.particleManager,
        obstacleManager: this.obstacleManager,
        effectManager: this.effectManager,
        weaponContainerUI: this.weaponContainerUI,
        loadingScreen: this.loadingScreen,
        startScreen: this.startScreen,
        helpScreen: this.helpScreen,
        goldManager: this.goldManager,
        battlefieldMinimap: this.battlefieldMinimap,
        tutorialOverlay: this.tutorialOverlay
      });
  }
  
  /**
   * 触摸开始
   */
  onTouchStart(e) {
    // UI事件优先级高于游戏事件
    return this.uiEventManager.onTouchStart(e) || 
           this.inputHandler.onTouchStart(e, this.weaponManager);
  }
  
  /**
   * 触摸移动
   */
  onTouchMove(e) {
    // UI事件优先级高于游戏事件
    if (!this.uiEventManager.onTouchMove(e)) {
    this.inputHandler.onTouchMove(e);
    }
  }
  
  /**
   * 触摸结束
   */
  onTouchEnd(e) {
    // UI事件优先级高于游戏事件
    if (!this.uiEventManager.onTouchEnd(e)) {
    this.inputHandler.onTouchEnd(e, this.weaponManager);
    }
  }
  
  /**
   * 窗口尺寸变化回调
   * @param {number} newWidth 新的窗口宽度
   * @param {number} newHeight 新的窗口高度
   * @param {number} newPixelRatio 新的像素比
   */
  onWindowResize(newWidth, newHeight, newPixelRatio) {
    // 更新 pixelRatio
    this.pixelRatio = newPixelRatio;
    
    // 使用窗口尺寸变化处理器
    this.windowResizeHandler.handleResize(newWidth, newHeight, newPixelRatio);
  }
  
}

