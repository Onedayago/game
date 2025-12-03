/**
 * 网格背景系统
 * 负责绘制游戏战场的背景
 * 
 * 功能：
 * - 绘制纯色背景，提供简洁的视觉效果
 * - 背景宽度为世界宽度，支持横向拖动查看
 * - 背景层级最低，不会遮挡其他游戏对象
 * - 支持响应式布局
 * 
 * 注意：网格线和动画效果已禁用，保持简洁风格
 */

import { Graphics } from 'pixi.js';
import {
  COLORS,
  APP_BACKGROUND,
  GRID_LINE_WIDTH,
  GRID_LINE_COLOR,
  GRID_LINE_ALPHA,
} from '../constants';
import { responsiveLayout } from '../app/ResponsiveLayout';

/**
 * 网格背景类
 */
export class GridBackground {
  /**
   * 构造函数
   * @param {Application} app - PixiJS应用实例
   */
  constructor(app) {
    this.app = app;
    
    // 创建战场地形层（在最底层渲染）
    this.terrain = new Graphics();
    this.terrain.zIndex = -100;  // 设置为最低层级

    // 绘制背景场景
    this.drawScene();

    // 添加到父容器
    const parent = this.app.world || this.app.stage;
    parent.addChild(this.terrain);
  }

  /**
   * 绘制背景场景
   * 设置背景的宽度和高度，并调用绘制方法
   */
  drawScene() {
    // 从响应式布局获取当前尺寸
    const layout = responsiveLayout.getLayout();
    
    // 战场背景的世界总宽度（可被相机左右拖拽观察）
    const width = layout.WORLD_WIDTH;
    const height = layout.BATTLE_HEIGHT;
    this.battleHeight = height;
    
    // 只绘制纯色背景，不绘制装饰和网格
    this.drawSimpleBackground(width, height);
  }

  /**
   * 绘制简洁的纯色背景
   * @param {number} width - 背景宽度
   * @param {number} height - 背景高度
   */
  drawSimpleBackground(width, height) {
    this.terrain.clear();
    // 绘制纯色矩形作为背景
    this.terrain.rect(0, 0, width, height).fill({ color: APP_BACKGROUND });
  }

  /**
   * 响应尺寸变化
   * 重新绘制背景
   * @param {Object} layout - 新的布局参数
   */
  onResize(layout) {
    const width = layout.WORLD_WIDTH;
    const height = layout.BATTLE_HEIGHT;
    this.battleHeight = height;
    this.drawSimpleBackground(width, height);
  }

  // 网格线功能已禁用，保持简洁的视觉风格

  /**
   * 更新方法（当前无动画效果）
   * @param {number} deltaMS - 距上一帧的时间（毫秒）
   */
  update(deltaMS) {
    // 背景动画已禁用
  }
}
