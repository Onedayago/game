/**
 * 游戏主循环附加器
 * 负责将游戏更新逻辑附加到PixiJS的ticker上
 * 
 * 主循环执行的任务：
 * - 更新敌人状态（移动、攻击等）
 * - 更新武器状态（瞄准、射击等）
 * - 更新粒子系统（特效动画）
 * - 更新网格背景
 * - 更新小地图显示
 */

import { particleSystem } from '../core/particleSystem';

/**
 * 附加游戏主循环
 * 
 * @param {GameContext} context - 游戏上下文实例
 * @returns {Function} 清理函数，用于移除ticker监听器
 * @throws {Error} 如果context.app未初始化
 */
export function attachGameLoop(context) {
  const { app } = context;
  
  // 确保app已初始化
  if (!app) {
    throw new Error('[attachGameLoop] context.app 未初始化');
  }

  /**
   * 游戏主循环函数
   * 每帧都会被调用，负责更新游戏中的所有动态元素
   * 
   * @param {number} delta - 帧数增量（通常为1）
   */
  const tickerFn = (delta) => {
    // 游戏未开始时不执行更新
    if (!context.state.gameStarted) return;

    // 获取核心管理器
    const enemyManager = context.getManager('enemies');
    const weaponContainer = context.getManager('weapons');
    
    // 如果管理器未初始化，跳过本帧更新
    if (!enemyManager || !weaponContainer) return;

    // 获取毫秒级时间增量，用于基于时间的动画
    const deltaMS = app.ticker.deltaMS;
    
    // 更新敌人管理器（移动、攻击、检测死亡等）
    enemyManager.update(delta, deltaMS);
    
    // 更新武器容器（瞄准、射击、子弹移动等）
    weaponContainer.update(delta, deltaMS, enemyManager.getEnemies());
    
    // 更新粒子系统（爆炸、烟雾等特效）
    particleSystem.update(deltaMS);

    // 更新网格背景（如果有动画效果）
    const gridBackground = context.getSystem('gridBackground');
    if (gridBackground && typeof gridBackground.update === 'function') {
      gridBackground.update(deltaMS);
    }

    // 更新小地图显示
    const goldManager = context.getManager('gold');
    if (goldManager && typeof goldManager.updateMiniMap === 'function') {
      goldManager.updateMiniMap(
        enemyManager.getEnemies(),
        weaponContainer.weapons,
        context.world,
      );
    }
  };

  // 将主循环函数添加到ticker
  app.ticker.add(tickerFn);

  /**
   * 返回清理函数
   * 用于从ticker中移除主循环函数
   */
  return () => {
    app.ticker.remove(tickerFn);
  };
}


