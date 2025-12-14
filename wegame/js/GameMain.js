/**
 * 游戏主控制器
 * 微信小游戏版本
 */

import { GameConfig } from './config/GameConfig';
import { GameContext } from './core/GameContext';
import { GameInitializer } from './core/GameInitializer';
import { GameInputHandler } from './core/GameInputHandler';
import { GameLoop } from './core/GameLoop';

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
    this.soundManager = null;
    
    // UI
    this.startScreen = null;
    this.helpScreen = null;
    this.weaponContainerUI = null;
    this.battlefieldMinimap = null;
    
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
    this.soundManager = managers.soundManager;
    
    // 初始化 UI
    const uiComponents = GameInitializer.initUI(
      this.ctx,
      this.gameContext,
      this.goldManager,
      this.weaponManager,
      this.enemyManager
    );
    this.weaponContainerUI = uiComponents.weaponContainerUI;
    this.startScreen = uiComponents.startScreen;
    this.helpScreen = uiComponents.helpScreen;
    this.battlefieldMinimap = uiComponents.battlefieldMinimap;
    
    // 设置战场小视图点击回调
    this.battlefieldMinimap.setOnClick((targetWorldOffsetX) => {
      this.gameContext.worldOffsetX = targetWorldOffsetX;
    });
    
    // 创建游戏渲染器
    this.gameRenderer = GameInitializer.createRenderer(this.ctx, this.gameContext);
    
    // 显示开始界面
    this.showStartScreen();
    
    // 开始游戏循环
    this.start();
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
      this.goldManager.init(GameConfig.INITIAL_GOLD);
      this.gameContext.gold = GameConfig.INITIAL_GOLD;
    }
    
    // 清空武器和敌人
    if (this.weaponManager) {
      this.weaponManager.weapons = [];
    }
    if (this.enemyManager) {
      this.enemyManager.reset();
    }
    
    // 播放背景音乐
    if (this.soundManager) {
      this.soundManager.playBgMusic();
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
    
    // 清空武器
    if (this.weaponManager) {
      this.weaponManager.weapons = [];
      this.weaponManager.selectedWeapon = null;
    }
    
    // 重置金币管理器
    if (this.goldManager) {
      this.goldManager.init(GameConfig.INITIAL_GOLD);
      this.gameContext.gold = GameConfig.INITIAL_GOLD;
    }
    
    // 清空粒子
    if (this.particleManager) {
      this.particleManager.particles = [];
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
    
    // 更新 UI
    if (this.weaponContainerUI) {
      this.weaponContainerUI.update(deltaTime);
    }
    
    // 更新开始界面动画
    if (this.startScreen) {
      this.startScreen.update(deltaMS);
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
        weaponContainerUI: this.weaponContainerUI,
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

