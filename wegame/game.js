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
  
  // 创建 Canvas
  const canvas = wx.createCanvas();
  const ctx = canvas.getContext('2d');
  
  console.log('Canvas 创建成功', canvas.width, canvas.height);
  
  // 初始化游戏
  gameMain = new GameMain(canvas, ctx);
  gameMain.init();
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

