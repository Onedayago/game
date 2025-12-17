/**
 * 微信小游戏入口文件
 */

import GameMain from './js/GameMain';

// 游戏主实例
let gameMain = null;

/**
 * 游戏初始化
 */
function initGame() {
  console.log('初始化游戏');
  
  // 获取窗口信息
  const windowInfo = wx.getWindowInfo();
  const windowWidth = windowInfo.windowWidth;
  const windowHeight = windowInfo.windowHeight;
  const pixelRatio = windowInfo.pixelRatio || 1;
  
  console.log('窗口信息', {
    windowWidth,
    windowHeight,
    pixelRatio
  });
  
  // 创建 Canvas
  const canvas = wx.createCanvas();
  
  // 设置 Canvas 实际尺寸（考虑 pixelRatio 以支持高分辨率屏幕）
  canvas.width = windowWidth * pixelRatio;
  canvas.height = windowHeight * pixelRatio;
  
  const ctx = canvas.getContext('2d');
  
  // 缩放 context，使得逻辑尺寸仍然是 windowWidth 和 windowHeight
  // 这样代码中的坐标不需要改变，但渲染会更清晰
  ctx.scale(pixelRatio, pixelRatio);
  
  console.log('Canvas 创建成功', {
    actualWidth: canvas.width,
    actualHeight: canvas.height,
    logicalWidth: windowWidth,
    logicalHeight: windowHeight,
    pixelRatio
  });
  
  // 初始化游戏
  gameMain = new GameMain(canvas, ctx, pixelRatio);
  gameMain.init();
  
  // 监听窗口尺寸变化（处理全屏/小窗口切换）
  wx.onWindowResize((res) => {
    console.log('窗口尺寸变化', res);
    const newWindowWidth = res.windowWidth;
    const newWindowHeight = res.windowHeight;
    
    // 重新获取窗口信息以确保 pixelRatio 是最新的
    const newWindowInfo = wx.getWindowInfo();
    const newPixelRatio = newWindowInfo.pixelRatio || res.pixelRatio || 1;
    
    // 更新 Canvas 尺寸
    canvas.width = newWindowWidth * newPixelRatio;
    canvas.height = newWindowHeight * newPixelRatio;
    
    // 重置缩放
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(newPixelRatio, newPixelRatio);
    
    // 通知游戏主实例窗口尺寸变化
    if (gameMain && gameMain.onWindowResize) {
      gameMain.onWindowResize(newWindowWidth, newWindowHeight, newPixelRatio);
    }
  });
}

/**
 * 触摸开始
 */
wx.onTouchStart((e) => {
  if (gameMain) {
    gameMain.onTouchStart(e);
  }
});

/**
 * 触摸移动
 */
wx.onTouchMove((e) => {
  if (gameMain) {
    gameMain.onTouchMove(e);
  }
});

/**
 * 触摸结束
 */
wx.onTouchEnd((e) => {
  if (gameMain) {
    gameMain.onTouchEnd(e);
  }
});

/**
 * 游戏启动
 */
wx.onShow(() => {
  console.log('游戏显示');
  if (gameMain) {
    gameMain.resume();
  }
});

/**
 * 游戏隐藏
 */
wx.onHide(() => {
  console.log('游戏隐藏');
  if (gameMain) {
    gameMain.pause();
  }
});

/**
 * 游戏错误
 */
wx.onError((msg) => {
  console.error('游戏错误:', msg);
});

// 初始化游戏
initGame();

