/**
 * PixiJS应用创建器
 * 负责创建和配置PixiJS应用实例
 */

import { Application } from 'pixi.js';
import {
  APP_WIDTH,
  APP_HEIGHT,
  APP_BACKGROUND,
  APP_ANTIALIAS,
  BODY_MARGIN,
} from '../constants';

/**
 * 创建PixiJS应用实例
 * 
 * 执行步骤：
 * 1. 创建Application实例
 * 2. 使用配置参数初始化应用（宽度、高度、背景色、抗锯齿等）
 * 3. 设置页面样式并将canvas添加到DOM
 * 
 * @returns {Promise<Application>} 初始化完成的PixiJS应用实例
 */
export async function createPixiApp() {
  // 创建PixiJS应用实例
  const app = new Application();
  
  // 初始化应用配置
  await app.init({
    width: APP_WIDTH,           // 应用宽度
    height: APP_HEIGHT,         // 应用高度
    background: APP_BACKGROUND, // 背景颜色
    antialias: APP_ANTIALIAS,   // 抗锯齿设置
  });

  // 在浏览器环境中，将canvas添加到页面
  if (typeof document !== 'undefined' && document.body) {
    // 设置页面边距
    document.body.style.margin = BODY_MARGIN;
    // 将canvas元素添加到body
    document.body.appendChild(app.canvas);
  }

  return app;
}


