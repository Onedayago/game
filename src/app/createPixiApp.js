/**
 * PixiJS应用创建器
 * 负责创建和配置PixiJS应用实例，支持响应式尺寸
 */

import { Application } from 'pixi.js';
import {
  APP_BACKGROUND,
  APP_ANTIALIAS,
  BODY_MARGIN,
} from '../constants';
import { responsiveLayout, DESIGN_WIDTH, DESIGN_HEIGHT } from './ResponsiveLayout';

/**
 * 获取容器或窗口的尺寸
 * @param {HTMLElement} container - 可选的容器元素
 * @returns {Object} 包含 width 和 height 的对象
 */
function getContainerSize(container = null) {
  if (container) {
    return {
      width: container.clientWidth || DESIGN_WIDTH,
      height: container.clientHeight || DESIGN_HEIGHT,
    };
  }
  
  // 默认使用窗口大小
  return {
    width: window.innerWidth || DESIGN_WIDTH,
    height: window.innerHeight || DESIGN_HEIGHT,
  };
}

/**
 * 创建PixiJS应用实例
 * 
 * 执行步骤：
 * 1. 创建Application实例
 * 2. 使用配置参数初始化应用（宽度、高度、背景色、抗锯齿等）
 * 3. 设置页面样式并将canvas添加到DOM
 * 4. 设置窗口resize监听
 * 
 * @param {Object} options - 配置选项
 * @param {HTMLElement} options.container - 可选的容器元素
 * @param {boolean} options.resizeTo - 是否自动调整大小，默认为 'window'
 * @returns {Promise<Application>} 初始化完成的PixiJS应用实例
 */
export async function createPixiApp(options = {}) {
  const { container = null } = options;
  
  // 获取初始尺寸
  const { width, height } = getContainerSize(container);
  
  // 更新响应式布局管理器
  responsiveLayout.resize(width, height);
  
  // 获取设备像素比，用于高 DPI 屏幕（如 Retina 屏幕、手机）
  // 限制最大为 2，避免性能问题
  const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  
  // 创建PixiJS应用实例
  const app = new Application();
  
  // 初始化应用配置
  await app.init({
    width,
    height,
    background: APP_BACKGROUND,
    antialias: APP_ANTIALIAS,
    resolution: devicePixelRatio,  // 设备像素比，解决高 DPI 屏幕模糊问题
    autoDensity: true,             // 自动调整 CSS 尺寸以匹配分辨率
    resizeTo: container || window,  // 自动调整到容器或窗口大小
  });

  // 在浏览器环境中，将canvas添加到页面
  if (typeof document !== 'undefined' && document.body) {
    // 设置页面样式
    document.body.style.margin = BODY_MARGIN;
    document.body.style.overflow = 'hidden';  // 防止滚动条
    
    if (container) {
      container.appendChild(app.canvas);
    } else {
      document.body.appendChild(app.canvas);
    }
    
    // 设置canvas样式
    app.canvas.style.display = 'block';
  }

  // 监听resize事件，更新响应式布局
  const handleResize = () => {
    const newSize = getContainerSize(container);
    responsiveLayout.resize(newSize.width, newSize.height);
  };

  // 使用 ResizeObserver 监听容器大小变化
  if (container && typeof ResizeObserver !== 'undefined') {
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    app._resizeObserver = resizeObserver;
  } else if (typeof window !== 'undefined') {
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
    app._resizeHandler = handleResize;
  }

  // 存储清理方法
  app.disposeResize = () => {
    if (app._resizeObserver) {
      app._resizeObserver.disconnect();
    }
    if (app._resizeHandler && typeof window !== 'undefined') {
      window.removeEventListener('resize', app._resizeHandler);
    }
  };

  return app;
}
