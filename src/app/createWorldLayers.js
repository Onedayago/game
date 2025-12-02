/**
 * 世界图层创建器
 * 负责创建游戏的布局背景和世界容器
 * 将屏幕分为三个区域：顶部UI区、战斗区、底部UI区
 */

import { Container, Graphics } from 'pixi.js';
import {
  APP_WIDTH,
  APP_HEIGHT,
  TOP_UI_HEIGHT,
  BATTLE_HEIGHT,
  APP_BACKGROUND,
  TOP_UI_BG_COLOR,
  BOTTOM_UI_BG_COLOR,
} from '../constants';

/**
 * 创建世界图层
 * 
 * 屏幕布局：
 * - 顶部区域：显示金币、波数等游戏信息
 * - 中间区域：战斗场景，包含塔、敌人等游戏对象
 * - 底部区域：武器选择和放置界面
 * 
 * @param {Application} app - PixiJS应用实例
 * @returns {Object} 包含布局背景和世界容器的对象
 */
export function createWorldLayers(app) {
  // 创建布局背景图形，用于绘制三个区域的背景色
  const layoutBackground = new Graphics();
  layoutBackground.zIndex = -500; // 设置为最底层

  // 计算三个区域的高度
  const topHeight = TOP_UI_HEIGHT;                          // 顶部UI高度
  const middleHeight = BATTLE_HEIGHT;                       // 战斗区域高度
  const bottomHeight = APP_HEIGHT - topHeight - middleHeight; // 底部UI高度

  // 绘制顶部UI区域背景
  layoutBackground.rect(0, 0, APP_WIDTH, topHeight).fill({ color: TOP_UI_BG_COLOR });
  
  // 绘制中间战斗区域背景
  layoutBackground
    .rect(0, topHeight, APP_WIDTH, middleHeight)
    .fill({ color: APP_BACKGROUND });
  
  // 绘制底部UI区域背景
  layoutBackground
    .rect(0, topHeight + middleHeight, APP_WIDTH, bottomHeight)
    .fill({ color: BOTTOM_UI_BG_COLOR });
  
  // 将背景添加到舞台
  app.stage.addChild(layoutBackground);

  // 创建世界容器，所有游戏对象都将添加到这个容器中
  const worldContainer = new Container();
  worldContainer.x = 0;
  worldContainer.y = topHeight; // 从顶部UI下方开始
  worldContainer.sortableChildren = true; // 启用子元素排序，用于控制渲染顺序
  
  // 将世界容器添加到舞台的最底层（索引0）
  app.stage.addChildAt(worldContainer, 0);

  return {
    layoutBackground,  // 布局背景
    worldContainer,    // 世界容器
  };
}


