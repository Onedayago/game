/**
 * 游戏主控制器
 * 微信小游戏版本
 */

import { GameConfig } from './config/GameConfig';
import { GameContext } from './core/GameContext';
import { BackgroundRenderer } from './rendering/BackgroundRenderer';
import { WeaponRenderer } from './rendering/WeaponRenderer';
import { WeaponManager } from './managers/WeaponManager';
import { EnemyManager } from './managers/EnemyManager';
import { GoldManager } from './managers/GoldManager';
import { ParticleManager } from './core/ParticleManager';
import { LaserBeam } from './projectiles/LaserBeam';
import { SoundManager } from './core/SoundManager';
import { StartScreen } from './ui/StartScreen';
import { HelpScreen } from './ui/HelpScreen';
import { WeaponContainerUI } from './ui/WeaponContainerUI';
import { BattlefieldMinimap } from './ui/BattlefieldMinimap';
import { initCanvasUtils } from './utils/CanvasUtils';
import { GameInputHandler } from './core/GameInputHandler';
import { GameRenderer } from './core/GameRenderer';
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
    this.setupCanvas();
    
    // 创建管理器
    this.createManagers();
    
    // 初始化 UI
    this.initUI();
    
    // 显示开始界面
    this.showStartScreen();
    
    // 开始游戏循环
    this.start();
  }
  
  /**
   * 设置 Canvas
   */
  setupCanvas() {
    // 微信小游戏的 Canvas 已经由 wx.createCanvas() 创建
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    const dpr = systemInfo.pixelRatio || 1;
    
    // 设置 Canvas 尺寸（微信小游戏 Canvas 尺寸由系统决定）
    // 注意：GameConfig.DESIGN_WIDTH 和 DESIGN_HEIGHT 现在会自动从系统信息获取
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    
    // 设置 Canvas 实际尺寸（考虑设备像素比）
    this.canvas.width = windowWidth * dpr;
    this.canvas.height = windowHeight * dpr;
    
    
    this.ctx.scale(dpr, dpr);
    
    // 设置 Canvas 显示尺寸
    if (this.canvas.style) {
      this.canvas.style.width = `${windowWidth}px`;
      this.canvas.style.height = `${windowHeight}px`;
    }
    
    console.log('Canvas 设置完成', {
      width: this.canvas.width,
      height: this.canvas.height,
      dpr,
      windowWidth,
      windowHeight
    });
    
    // 初始化 Canvas 工具（添加 roundRect 等方法）
    initCanvasUtils(this.ctx);
    
    // 创建游戏渲染器
    this.gameRenderer = new GameRenderer(this.ctx, this.gameContext);
  }
  
  /**
   * 创建管理器
   */
  createManagers() {
    // 背景渲染器
    this.backgroundRenderer = new BackgroundRenderer(this.ctx);
    // 初始化背景渲染缓存
    BackgroundRenderer.initCache();
    
    // 初始化血条缓存（使用最大可能的实体尺寸）
    const maxEntitySize = Math.max(GameConfig.ENEMY_SIZE, GameConfig.CELL_SIZE * 0.8);
    WeaponRenderer.initHealthBarCache(maxEntitySize);
    
    // 金币管理器
    this.goldManager = new GoldManager();
    this.goldManager.init(GameConfig.INITIAL_GOLD);
    // 同步到游戏上下文
    this.gameContext.gold = GameConfig.INITIAL_GOLD;
    
    // 武器管理器
    this.weaponManager = new WeaponManager(this.ctx);
    
    // 敌人管理器
    this.enemyManager = new EnemyManager(this.ctx, this.weaponManager, this.goldManager);
    // 初始化敌人渲染缓存
    this.enemyManager.init();
    
    // 粒子管理器
    this.particleManager = new ParticleManager(this.ctx);
    // 初始化粒子缓存
    ParticleManager.initCache();
    this.gameContext.particleManager = this.particleManager;
    
    // 初始化激光束缓存
    LaserBeam.initCache();
    
    // 音效管理器
    this.soundManager = new SoundManager();
    this.gameContext.soundManager = this.soundManager;
    
    // 更新游戏上下文
    this.gameContext.weaponManager = this.weaponManager;
  }
  
  /**
   * 初始化 UI
   */
  initUI() {
    // 武器容器 UI
    this.weaponContainerUI = new WeaponContainerUI(
      this.ctx,
      this.goldManager,
      this.weaponManager
    );
    this.weaponContainerUI.init(); // 初始化武器卡片缓存
    this.gameContext.weaponContainerUI = this.weaponContainerUI;
    
    // 开始界面
    this.startScreen = new StartScreen(this.ctx);
    
    // 帮助界面
    this.helpScreen = new HelpScreen(this.ctx);
    // 初始化帮助界面缓存
    HelpScreen.initStaticCache();
    HelpScreen.initButtonCache();
    
    // 战场小视图
    this.battlefieldMinimap = new BattlefieldMinimap(
      this.ctx,
      this.weaponManager,
      this.enemyManager
    );
    this.battlefieldMinimap.init();
    // 设置点击回调
    this.battlefieldMinimap.setOnClick((targetWorldOffsetX) => {
      this.gameContext.worldOffsetX = targetWorldOffsetX;
    });
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
   * 暂停游戏
   */
  pause() {
    this.gameLoop.pause();
  }
  
  /**
   * 恢复游戏
   */
  resume() {
    this.gameLoop.resume(
      (deltaTime, deltaMS) => this.onUpdate(deltaTime, deltaMS),
      (deltaTime, deltaMS) => this.onRender(deltaTime, deltaMS)
    );
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
    this.inputHandler.onTouchStart(e, this.weaponContainerUI, this.startScreen, this.helpScreen, this.battlefieldMinimap);
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
    this.inputHandler.onTouchEnd(e, this.weaponContainerUI, this.startScreen, this.helpScreen, this.battlefieldMinimap);
  }
}

