/**
 * 塔防游戏主入口文件
 * 负责初始化游戏的所有核心系统、管理器和UI组件
 */

// 导入游戏系统
import { GridBackground } from './systems/background';
import { WeaponContainer } from './ui/weaponContainer';
import { EnemyManager } from './systems/enemyManager';
import { GoldManager } from './ui/goldManager';
import { GameUI } from './ui/gameUI';

// 导入核心功能模块
import { soundManager } from './core/soundManager';
import { particleSystem } from './core/particleSystem';

// 导入应用程序基础设施
import { GameContext } from './app/GameContext';
import { createPixiApp } from './app/createPixiApp';
import { createWorldLayers } from './app/createWorldLayers';
import { setupStagePanning } from './app/setupStagePanning';
import { attachGameLoop } from './app/attachGameLoop';

/**
 * 主函数 - 初始化并启动游戏
 * 执行步骤：
 * 1. 创建游戏上下文和PixiJS应用
 * 2. 初始化音频和粒子系统
 * 3. 设置世界图层和舞台平移
 * 4. 注册金币管理器
 * 5. 附加游戏循环
 * 6. 构建战斗系统
 * 7. 显示游戏UI
 */
async function main() {
  // 创建游戏上下文，用于管理游戏状态和生命周期
  const context = new GameContext();
  
  // 创建并初始化PixiJS应用实例
  const app = await createPixiApp();
  context.setApp(app);

  // 初始化音频管理器
  soundManager.init();

  // 创建世界图层容器，用于组织游戏对象的层级关系
  const { worldContainer } = createWorldLayers(app);
  context.setWorld(worldContainer);

  // 初始化粒子系统，用于游戏特效
  particleSystem.init(worldContainer);

  // 设置舞台平移功能，允许拖动视图
  const detachPanning = setupStagePanning(app, worldContainer);
  context.attachCleanup(detachPanning);

  // 注册金币管理器，负责管理游戏货币系统
  const goldManager = context.registerManager('gold', new GoldManager(app, worldContainer));

  // 附加游戏主循环
  const detachTicker = attachGameLoop(context);
  context.attachCleanup(detachTicker);

  // 创建并注册游戏UI系统（需要在buildBattleSystems之前）
  const gameUI = context.registerSystem(
    'gameUI',
    new GameUI(app, {
      onStartGame: () => {
        // 防止重复启动
        if (context.state.gameStarted) return;
        context.state.gameStarted = true;
        
        // 播放背景音乐
        soundManager.playBackground();
        
        // 构建所有战斗系统
        buildBattleSystems();
      },
    }),
  );

  /**
   * 构建战斗系统
   * 包括网格背景、武器容器和敌人管理器
   * @returns {Object} 包含所有战斗系统实例的对象
   */
  const buildBattleSystems = () => {
    // 创建网格背景
    const gridBackground = context.registerSystem('gridBackground', new GridBackground(app));
    
    // 创建武器容器，管理所有塔防武器
    const weaponContainer = context.registerManager(
      'weapons',
      new WeaponContainer(app, goldManager),
    );
    
    // 创建敌人管理器，负责生成和管理敌人（传入gameUI用于显示波次通知）
    const enemyManager = context.registerManager(
      'enemies',
      new EnemyManager(app, weaponContainer, goldManager, gameUI),
    );

    return { gridBackground, weaponContainer, enemyManager };
  };

  // 显示游戏开始界面
  gameUI.showStartScreen();

  // 在浏览器关闭前清理资源
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => context.dispose());
  }
}

// 执行主函数并捕获任何错误
main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
});

