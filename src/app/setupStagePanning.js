/**
 * 舞台平移设置器
 * 实现拖动场景的功能，允许玩家查看整个游戏世界
 * 
 * 功能特点：
 * - 只在战斗区域内响应拖动
 * - 限制拖动范围，防止场景移出可视区域
 * - 提供清理函数，用于移除事件监听器
 * - 支持响应式布局
 */

import { responsiveLayout } from './ResponsiveLayout';

/**
 * 设置舞台平移功能
 * 
 * @param {Application} app - PixiJS应用实例
 * @param {Container} worldContainer - 世界容器，将被拖动的对象
 * @returns {Function} 清理函数，用于移除所有事件监听器
 */
export function setupStagePanning(app, worldContainer) {
  // 平移状态
  let isPanning = false;      // 是否正在拖动
  let panStartX = 0;          // 拖动开始时的鼠标X坐标
  let worldStartX = 0;        // 拖动开始时世界容器的X坐标

  /**
   * 获取当前布局的可拖动区域边界
   */
  const getBounds = () => {
    const layout = responsiveLayout.getLayout();
    return {
      playableTop: layout.TOP_UI_HEIGHT,
      playableBottom: layout.TOP_UI_HEIGHT + layout.BATTLE_HEIGHT,
      minX: layout.APP_WIDTH - layout.WORLD_WIDTH,
      maxX: 0,
    };
  };

  /**
   * 指针按下事件处理
   * 检查点击位置是否在战斗区域内，如果是则开始拖动
   */
  const onPointerDown = (event) => {
    const { x, y } = event.global;
    const bounds = getBounds();
    
    // 只在战斗区域内响应
    if (y >= bounds.playableTop && y <= bounds.playableBottom) {
      isPanning = true;
      panStartX = x;                    // 记录起始X坐标
      worldStartX = worldContainer.x;   // 记录世界容器起始位置
    }
  };

  /**
   * 指针移动事件处理
   * 计算拖动距离并更新世界容器位置，同时限制在有效范围内
   */
  const onPointerMove = (event) => {
    if (!isPanning) return;
    
    const bounds = getBounds();
    
    // 计算鼠标移动距离
    const dx = event.global.x - panStartX;
    
    // 计算世界容器新位置
    let nextX = worldStartX + dx;
    
    // 限制拖动范围
    if (nextX < bounds.minX) nextX = bounds.minX;
    if (nextX > bounds.maxX) nextX = bounds.maxX;
    
    // 更新世界容器位置
    worldContainer.x = nextX;
  };

  /**
   * 停止拖动
   * 在指针抬起时调用
   */
  const stopPanning = () => {
    isPanning = false;
  };

  // 设置舞台为可交互
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen; // 设置整个屏幕为可点击区域

  // 注册事件监听器
  app.stage.on('pointerdown', onPointerDown);      // 指针按下
  app.stage.on('pointermove', onPointerMove);      // 指针移动
  app.stage.on('pointerup', stopPanning);          // 指针抬起
  app.stage.on('pointerupoutside', stopPanning);   // 指针在外部抬起

  /**
   * 返回清理函数
   * 用于移除所有事件监听器，防止内存泄漏
   */
  return () => {
    app.stage.off('pointerdown', onPointerDown);
    app.stage.off('pointermove', onPointerMove);
    app.stage.off('pointerup', stopPanning);
    app.stage.off('pointerupoutside', stopPanning);
  };
}
