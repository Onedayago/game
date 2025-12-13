/**
 * 游戏循环管理器
 * 负责游戏主循环和生命周期管理
 */

export class GameLoop {
  constructor() {
    this.isRunning = false;
    this.isPaused = false;
    this.lastTime = 0;
    this.animationFrameId = null;
    this.onUpdate = null;
    this.onRender = null;
  }
  
  /**
   * 开始游戏循环
   * @param {Function} onUpdate - 更新回调
   * @param {Function} onRender - 渲染回调
   */
  start(onUpdate, onRender) {
    if (this.isRunning) return;
    
    this.onUpdate = onUpdate;
    this.onRender = onRender;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = Date.now();
    this.gameLoop();
  }
  
  /**
   * 暂停游戏
   */
  pause() {
    this.isPaused = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * 恢复游戏
   * @param {Function} onUpdate - 更新回调
   * @param {Function} onRender - 渲染回调
   */
  resume(onUpdate, onRender) {
    this.isPaused = false;
    if (onUpdate) this.onUpdate = onUpdate;
    if (onRender) this.onRender = onRender;
    if (!this.animationFrameId) {
      this.lastTime = Date.now();
      this.gameLoop();
    }
  }
  
  /**
   * 销毁游戏循环
   */
  destroy() {
    this.pause();
    this.isRunning = false;
  }
  
  /**
   * 游戏主循环
   */
  gameLoop() {
    if (!this.isRunning || this.isPaused) return;
    
    try {
      const currentTime = Date.now();
      
      // 处理首次调用或时间异常
      if (this.lastTime === 0) {
        this.lastTime = currentTime;
      }
      
      let deltaTime = (currentTime - this.lastTime) / 1000; // 转换为秒
      let deltaMS = currentTime - this.lastTime; // 毫秒
      
      // 限制 deltaTime，防止异常大的时间差导致游戏逻辑错误
      // 如果时间差超过 1 秒（可能是页面切换或暂停），限制为 0.1 秒
      const MAX_DELTA_TIME = 0.1; // 最大 100ms
      if (deltaTime > MAX_DELTA_TIME) {
        deltaTime = MAX_DELTA_TIME;
        deltaMS = MAX_DELTA_TIME * 1000;
      }
      
      // 防止 NaN 或 Infinity
      if (!isFinite(deltaTime) || !isFinite(deltaMS)) {
        deltaTime = 0.016; // 约 60fps
        deltaMS = 16;
      }
      
      this.lastTime = currentTime;
      
      // 调用更新回调
      if (this.onUpdate) {
        try {
          this.onUpdate(deltaTime, deltaMS);
        } catch (e) {
          console.error('Update error:', e);
        }
      }
      
      // 调用渲染回调
      if (this.onRender) {
        try {
          this.onRender(deltaTime, deltaMS);
        } catch (e) {
          console.error('Render error:', e);
        }
      }
    } catch (e) {
      console.error('Game loop error:', e);
    }
    
    // 继续循环（即使出错也要继续，避免完全卡死）
    this.animationFrameId = requestAnimationFrame(() => {
      this.gameLoop();
    });
  }
}

