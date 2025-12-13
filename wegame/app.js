/**
 * 微信小游戏入口文件
 */

import GameMain from './js/GameMain';

App({
  onLaunch() {
    console.log('游戏启动');
    
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    console.log('系统信息:', systemInfo);
    
    // 初始化游戏
    this.gameMain = new GameMain();
  },
  
  onShow() {
    console.log('游戏显示');
  },
  
  onHide() {
    console.log('游戏隐藏');
    if (this.gameMain) {
      this.gameMain.pause();
    }
  },
  
  onError(msg) {
    console.error('游戏错误:', msg);
  }
});

