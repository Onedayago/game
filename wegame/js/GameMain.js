/**
 * 游戏主控制器
 * 微信小游戏版本
 */

import { GameConfig } from './config/GameConfig';
import { EconomyConfig } from './config/EconomyConfig';
import { GameContext } from './core/GameContext';
import { GameInitializer } from './core/GameInitializer';
import { GameInputHandler } from './core/GameInputHandler';
import { GameLoop } from './core/GameLoop';
import { BattlefieldMinimap } from './ui/BattlefieldMinimap';
import { WeaponDragPreview } from './ui/WeaponDragPreview';

export default class GameMain {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    
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
    
    // UI
    this.loadingScreen = null;
    this.startScreen = null;
    this.helpScreen = null;
    this.weaponContainerUI = null;
    this.battlefieldMinimap = null;
    
    // 加载状态
    this.isLoading = false;
    
    // 游戏循环和渲染
    this.gameLoop = new GameLoop();
    this.gameRenderer = null;
    this.inputHandler = new GameInputHandler(this.gameContext);
    
    // FPS 监控
    this.fpsFrameCount = 0;
    this.fpsLastTime = Date.now();
    this.fps = 60;
  }
  
  /**
   * 初始化游戏
   */
  init() {
    console.log('初始化游戏');
    
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
    
    // 设置特效管理器引用
    if (this.weaponManager) {
      this.weaponManager.setEffectManager(this.effectManager);
    }
    if (this.enemyManager) {
      this.enemyManager.setEffectManager(this.effectManager);
    }
    
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
    
    // 设置战场小视图点击回调
    this.battlefieldMinimap.setOnClick((targetWorldOffsetX, targetWorldOffsetY) => {
      this.gameContext.worldOffsetX = targetWorldOffsetX;
      this.gameContext.worldOffsetY = targetWorldOffsetY || 0;
    });
    
    // 创建游戏渲染器
    this.gameRenderer = GameInitializer.createRenderer(this.ctx, this.gameContext);
    
    // 开始加载流程
    this.startLoading();
    
    // 开始游戏循环
    this.start();
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
    const totalSteps = 5;
    let currentStep = 0;
    
    const updateProgress = (step, text) => {
      currentStep = step;
      const progress = currentStep / totalSteps;
      if (this.loadingScreen) {
        this.loadingScreen.setProgress(progress, text);
      }
    };
    
    try {
      // 步骤 1: 初始化配置
      updateProgress(1, '初始化配置...');
      await this.delay(100);
      
      // 步骤 2: 初始化渲染缓存
      updateProgress(2, '初始化渲染缓存...');
      await this.delay(200);
      
      // 步骤 3: 初始化UI缓存
      updateProgress(3, '初始化UI界面...');
      await this.delay(200);
      
      // 步骤 4: 初始化游戏资源
      updateProgress(4, '加载游戏资源...');
      await this.delay(200);
      
      // 步骤 5: 完成
      updateProgress(5, '加载完成！');
      await this.delay(300);
      
      // 隐藏加载界面，显示开始界面
      this.isLoading = false;
      if (this.loadingScreen) {
        this.loadingScreen.hide();
      }
      this.showStartScreen();
      
    } catch (error) {
      console.error('资源加载失败:', error);
      if (this.loadingScreen) {
        this.loadingScreen.setProgress(1, '加载失败，请重试');
      }
    }
  }
  
  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    console.log('开始游戏');
    
    // 重置游戏状态
    this.gameContext.reset();
    this.gameContext.gameStarted = true;
    
    // 重置金币管理器
    if (this.goldManager) {
      this.goldManager.init(EconomyConfig.INITIAL_GOLD);
      this.gameContext.gold = EconomyConfig.INITIAL_GOLD;
    }
    
    // 清空武器和敌人
    if (this.weaponManager) {
      this.weaponManager.weapons = [];
    }
    if (this.enemyManager) {
      this.enemyManager.reset();
    }
    
    // 重置障碍物管理器（重新生成障碍物）
    if (this.obstacleManager) {
      this.obstacleManager.reset();
    }
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
    if (this.gameContext.gameStarted && !this.gameContext.gamePaused) {
      this.gameContext.gamePaused = true;
      console.log('游戏已暂停');
    }
  }
  
  /**
   * 恢复游戏（游戏逻辑）
   */
  resumeGame() {
    if (this.gameContext.gameStarted && this.gameContext.gamePaused && !this.gameContext.gameOver) {
      this.gameContext.gamePaused = false;
      console.log('游戏已恢复');
    }
  }
  
  /**
   * 重新开始游戏
   */
  restartGame() {
    console.log('重新开始游戏');
    
    // 重置游戏状态
    this.gameContext.reset();
    
    // 重置敌人管理器
    if (this.enemyManager) {
      this.enemyManager.reset();
    }
    
    // 重置障碍物管理器（重新生成障碍物）
    if (this.obstacleManager) {
      this.obstacleManager.reset();
    }
    
    // 清空武器
    if (this.weaponManager) {
      this.weaponManager.weapons = [];
      this.weaponManager.selectedWeapon = null;
    }
    
    // 重置金币管理器
    if (this.goldManager) {
      this.goldManager.init(EconomyConfig.INITIAL_GOLD);
      this.gameContext.gold = EconomyConfig.INITIAL_GOLD;
    }
    
    // 清空粒子
    if (this.particleManager) {
      this.particleManager.particles = [];
    }
    
    // 清空特效
    if (this.effectManager) {
      this.effectManager.clear();
    }
    
    // 显示开始界面
    this.showStartScreen();
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
    
    // 更新UI动画（无论游戏是否开始）
    if (this.loadingScreen) {
      this.loadingScreen.update(deltaMS);
    }
    
    // 更新静态动画时间
    BattlefieldMinimap.updateAnimation(deltaTime);
    WeaponDragPreview.updateAnimation(deltaTime);
    
    if (this.gameContext.gameStarted && !this.gameContext.gamePaused) {
      this.update(deltaTime, deltaMS);
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
      console.log(`FPS: ${this.fps}`);
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
   * 清空画布
   */
  clearCanvas() {
    this.ctx.clearRect(0, 0, GameConfig.DESIGN_WIDTH, GameConfig.DESIGN_HEIGHT);
  }
  
  /**
   * 更新游戏逻辑
   */
  update(deltaTime, deltaMS) {
    // 如果游戏已暂停，只更新UI动画，不更新游戏逻辑
    if (this.gameContext.gamePaused) {
      // 更新 UI（允许UI动画继续）
      if (this.weaponContainerUI) {
        this.weaponContainerUI.update(deltaTime);
      }
      
      // 更新开始界面动画
      if (this.startScreen) {
        this.startScreen.update(deltaMS);
      }
      return;
    }

    // 更新管理器（武器和敌人的更新在渲染时进行，因为需要相互引用）
    
    if (this.goldManager) {
      this.goldManager.update();
    }
    
    // 更新粒子管理器
    if (this.particleManager) {
      this.particleManager.update(deltaTime);
    }
    
    // 更新特效管理器
    if (this.effectManager) {
      this.effectManager.update(deltaTime, deltaMS);
    }
    
    // 更新 UI
    if (this.weaponContainerUI) {
      this.weaponContainerUI.update(deltaTime);
    }
    
    // 更新开始界面动画
    if (this.startScreen) {
      this.startScreen.update(deltaMS);
    }
    
    // 更新加载界面动画
    if (this.loadingScreen) {
      this.loadingScreen.update(deltaMS);
    }
  }
  
  /**
   * 渲染游戏
   */
  render(deltaTime, deltaMS) { 
    
    // 游戏已开始，正常渲染游戏场景
    if (this.gameRenderer) {
      this.gameRenderer.render(deltaTime, deltaMS, {
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
        battlefieldMinimap: this.battlefieldMinimap
      });
    }
  }
  
  /**
   * 触摸开始
   */
  onTouchStart(e) {
    console.log('GameMain.onTouchStart', e);
    const result = this.inputHandler.onTouchStart(e, this.weaponContainerUI, this.startScreen, this.helpScreen, this.battlefieldMinimap, this.weaponManager, this.gameRenderer);
    
    // 处理暂停/恢复/重新开始
    if (result === 'pause') {
      this.pauseGame();
      return true;
    } else if (result === 'resume') {
      this.resumeGame();
      return true;
    } else if (result === 'restart') {
      this.restartGame();
      return true;
    }
    
    return result;
  }
  
  /**
   * 触摸移动
   */
  onTouchMove(e) {
    this.inputHandler.onTouchMove(e, this.weaponContainerUI, this.helpScreen, this.battlefieldMinimap);
  }
  
  /**
   * 触摸结束
   */
  onTouchEnd(e) {
    this.inputHandler.onTouchEnd(e, this.weaponContainerUI, this.startScreen, this.helpScreen, this.battlefieldMinimap, this.weaponManager);
  }
}

