/**
 * 游戏初始化器
 * 负责游戏的初始化逻辑，包括Canvas设置、管理器创建、UI初始化等
 */

import { GameConfig } from '../config/GameConfig';
import { EconomyConfig } from '../config/EconomyConfig';
import { EnemyTankConfig } from '../config/enemies/EnemyTankConfig';
import { BackgroundRenderer } from '../rendering/BackgroundRenderer';
import { WeaponRenderer } from '../rendering/WeaponRenderer';
import { WeaponManager } from '../managers/WeaponManager';
import { EnemyManager } from '../managers/EnemyManager';
import { GoldManager } from '../managers/GoldManager';
import { ParticleManager } from '../core/ParticleManager';
import { LaserBeam } from '../projectiles/LaserBeam';
import { SoundManager } from '../core/SoundManager';
import { StartScreen } from '../ui/StartScreen';
import { HelpScreen } from '../ui/HelpScreen';
import { WeaponContainerUI } from '../ui/WeaponContainerUI';
import { BattlefieldMinimap } from '../ui/BattlefieldMinimap';
import { ObstacleManager } from '../managers/ObstacleManager';
import { initCanvasUtils } from '../utils/CanvasUtils';
import { GameRenderer } from './GameRenderer';
import { UIRenderer } from '../ui/UIRenderer';

export class GameInitializer {
  /**
   * 设置 Canvas
   * @param {HTMLCanvasElement|wx.Canvas} canvas
   * @param {CanvasRenderingContext2D} ctx
   */
  static setupCanvas(canvas, ctx) {
    // 微信小游戏的 Canvas 已经由 wx.createCanvas() 创建
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    const dpr = systemInfo.pixelRatio || 1;
    
    // 设置 Canvas 尺寸（微信小游戏 Canvas 尺寸由系统决定）
    // 注意：GameConfig.DESIGN_WIDTH 和 DESIGN_HEIGHT 现在会自动从系统信息获取
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    
    // 设置 Canvas 实际尺寸（考虑设备像素比）
    canvas.width = windowWidth * dpr;
    canvas.height = windowHeight * dpr;
    
    ctx.scale(dpr, dpr);
    
    // 设置 Canvas 显示尺寸
    if (canvas.style) {
      canvas.style.width = `${windowWidth}px`;
      canvas.style.height = `${windowHeight}px`;
    }
    
    console.log('Canvas 设置完成', {
      width: canvas.width,
      height: canvas.height,
      dpr,
      windowWidth,
      windowHeight
    });
    
    // 初始化 Canvas 工具（添加 roundRect 等方法）
    initCanvasUtils(ctx);
  }
  
  /**
   * 创建所有管理器
   * @param {CanvasRenderingContext2D} ctx
   * @param {GameContext} gameContext
   * @returns {Object} 包含所有管理器的对象
   */
  static createManagers(ctx, gameContext) {
    // 背景渲染器
    const backgroundRenderer = new BackgroundRenderer(ctx);
    // 初始化背景渲染缓存
    BackgroundRenderer.initCache();
    
    // 初始化血条缓存（使用最大可能的实体尺寸）
    const maxEntitySize = Math.max(EnemyTankConfig.SIZE, GameConfig.CELL_SIZE * 0.8);
    WeaponRenderer.initHealthBarCache(maxEntitySize);
    
    // 金币管理器
    const goldManager = new GoldManager();
    goldManager.init(EconomyConfig.INITIAL_GOLD);
    // 同步到游戏上下文
    gameContext.gold = EconomyConfig.INITIAL_GOLD;
    
    // 武器管理器
    const weaponManager = new WeaponManager(ctx);
    
    // 敌人管理器
    const enemyManager = new EnemyManager(ctx, weaponManager, goldManager);
    // 初始化敌人渲染缓存
    enemyManager.init();
    
    // 粒子管理器
    const particleManager = new ParticleManager(ctx);
    // 初始化粒子缓存
    ParticleManager.initCache();
    gameContext.particleManager = particleManager;
    
    // 初始化激光束缓存
    LaserBeam.initCache();
    
    // 障碍物管理器
    const obstacleManager = new ObstacleManager(ctx);
    obstacleManager.init(); // 初始化障碍物
    
    // 初始化UI缓存
    UIRenderer.initCaches();
    
    // 初始化金币管理器缓存
    GoldManager.initCache();
    
    // 音效管理器
    const soundManager = new SoundManager();
    gameContext.soundManager = soundManager;
    
    // 更新游戏上下文
    gameContext.weaponManager = weaponManager;
    gameContext.obstacleManager = obstacleManager; // 保存障碍物管理器引用
    
    // 设置障碍物管理器引用
    weaponManager.setObstacleManager(obstacleManager);
    enemyManager.setObstacleManager(obstacleManager);
    
    return {
      backgroundRenderer,
      weaponManager,
      enemyManager,
      goldManager,
      particleManager,
      obstacleManager,
      soundManager
    };
  }
  
  /**
   * 初始化所有UI组件
   * @param {CanvasRenderingContext2D} ctx
   * @param {GameContext} gameContext
   * @param {GoldManager} goldManager
   * @param {WeaponManager} weaponManager
   * @param {EnemyManager} enemyManager
   * @returns {Object} 包含所有UI组件的对象
   */
  static initUI(ctx, gameContext, goldManager, weaponManager, enemyManager) {
    // 武器容器 UI
    const weaponContainerUI = new WeaponContainerUI(
      ctx,
      goldManager,
      weaponManager
    );
    weaponContainerUI.init(); // 初始化武器卡片缓存
    gameContext.weaponContainerUI = weaponContainerUI;
    
    // 开始界面
    const startScreen = new StartScreen(ctx);
    
    // 帮助界面
    const helpScreen = new HelpScreen(ctx);
    // 初始化帮助界面缓存
    HelpScreen.initStaticCache();
    HelpScreen.initButtonCache();
    
    // 战场小视图
    const battlefieldMinimap = new BattlefieldMinimap(
      ctx,
      weaponManager,
      enemyManager
    );
    battlefieldMinimap.init();
    
    return {
      weaponContainerUI,
      startScreen,
      helpScreen,
      battlefieldMinimap
    };
  }
  
  /**
   * 创建游戏渲染器
   * @param {CanvasRenderingContext2D} ctx
   * @param {GameContext} gameContext
   * @returns {GameRenderer}
   */
  static createRenderer(ctx, gameContext) {
    return new GameRenderer(ctx, gameContext);
  }
}

