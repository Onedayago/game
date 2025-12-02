/**
 * 游戏上下文管理器
 * 负责管理游戏的全局状态、系统实例和生命周期
 * 
 * 主要职责：
 * - 存储PixiJS应用实例和世界容器
 * - 管理游戏状态（如是否已开始）
 * - 注册和获取各种管理器（managers）和系统（systems）
 * - 管理清理函数，确保资源正确释放
 */
export class GameContext {
  /**
   * 构造函数 - 初始化游戏上下文
   */
  constructor() {
    // PixiJS应用实例
    this.app = null;
    
    // 世界容器，包含所有游戏对象
    this.world = null;
    
    // 游戏状态
    this.state = {
      gameStarted: false, // 游戏是否已开始
    };
    
    // 管理器映射表，存储各种游戏管理器实例
    this.managers = new Map();
    
    // 系统映射表，存储各种游戏系统实例
    this.systems = new Map();
    
    // 清理函数数组，用于资源释放
    this.cleanups = [];
  }

  /**
   * 设置PixiJS应用实例
   * @param {Application} app - PixiJS应用实例
   */
  setApp(app) {
    this.app = app;
  }

  /**
   * 设置世界容器
   * 同时将世界容器挂载到app对象上，方便访问
   * @param {Container} world - 世界容器实例
   */
  setWorld(world) {
    this.world = world;
    if (this.app) {
      // eslint-disable-next-line no-param-reassign
      this.app.world = world;
    }
  }

  /**
   * 注册管理器
   * @param {string} key - 管理器的唯一标识
   * @param {*} instance - 管理器实例
   * @returns {*} 返回管理器实例，方便链式调用
   */
  registerManager(key, instance) {
    this.managers.set(key, instance);
    return instance;
  }

  /**
   * 获取管理器
   * @param {string} key - 管理器的唯一标识
   * @returns {*} 管理器实例，如果不存在则返回undefined
   */
  getManager(key) {
    return this.managers.get(key);
  }

  /**
   * 注册系统
   * @param {string} key - 系统的唯一标识
   * @param {*} instance - 系统实例
   * @returns {*} 返回系统实例，方便链式调用
   */
  registerSystem(key, instance) {
    this.systems.set(key, instance);
    return instance;
  }

  /**
   * 获取系统
   * @param {string} key - 系统的唯一标识
   * @returns {*} 系统实例，如果不存在则返回undefined
   */
  getSystem(key) {
    return this.systems.get(key);
  }

  /**
   * 附加清理函数
   * 这些函数将在dispose时被调用，用于释放资源
   * @param {Function} fn - 清理函数
   */
  attachCleanup(fn) {
    if (typeof fn === 'function') {
      this.cleanups.push(fn);
    }
  }

  /**
   * 释放所有资源
   * 按照后进先出的顺序调用所有清理函数
   * 确保即使某个清理函数失败，其他清理函数仍能执行
   */
  dispose() {
    while (this.cleanups.length) {
      const fn = this.cleanups.pop();
      try {
        fn();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[GameContext] cleanup failed', err);
      }
    }
  }
}


