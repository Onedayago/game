/**
 * 游戏核心配置
 * 从 Cocos Creator 版本移植
 */

export class GameConfig {
  // ==================== 基础设计尺寸 ====================
  /** 缓存的系统信息 */
  static _cachedSystemInfo = null;
  /** 缓存的设计宽度 */
  static _cachedDesignWidth = null;
  /** 缓存的设计高度 */
  static _cachedDesignHeight = null;
  
  /**
   * 初始化配置（在游戏加载时调用一次）
   * @param {boolean} force 是否强制重新初始化（用于窗口尺寸变化时）
   */
  static init(force = false) {
    if (!force && this._cachedDesignWidth !== null && this._cachedDesignHeight !== null) {
      return; // 已经初始化过且不强制重新初始化
    }
    
    const windowInfo = wx.getWindowInfo();
    this._cachedDesignWidth = windowInfo.windowWidth || 1000;
    this._cachedDesignHeight = windowInfo.windowHeight || 480;
  }
  
  /**
   * 重置配置缓存（用于窗口尺寸变化时）
   */
  static reset() {
    this._cachedDesignWidth = null;
    this._cachedDesignHeight = null;
    this.init(true);
  }
  
  /**
   * 获取设计分辨率宽度（像素）
   * 从缓存的屏幕宽度获取
   */
  static get DESIGN_WIDTH() {
    if (this._cachedDesignWidth === null) {
      this.init();
    }
    return this._cachedDesignWidth || 1000;
  }
  
  /**
   * 获取设计分辨率高度（像素）
   * 从缓存的屏幕高度获取
   */
  static get DESIGN_HEIGHT() {
    if (this._cachedDesignHeight === null) {
      this.init();
    }
    return this._cachedDesignHeight || 480;
  }
  
  // ==================== 网格系统 ====================
  /** 固定总行数 */
  static TOTAL_ROWS = 5;
  /** 网格线透明度（0-1） */
  static GRID_LINE_ALPHA = 0.3;
  
  /**
   * 获取网格格子大小（像素）
   * 根据屏幕高度自适应：格子大小 = 屏幕高度 / 总行数
   */
  static get CELL_SIZE() {
    return this.DESIGN_HEIGHT / this.TOTAL_ROWS;
  }
  
  /** 底部UI区域行数（不能放置敌人和武器，用于放置武器卡片等UI元素） */
  static BATTLE_BOTTOM_UI_ROWS = 2;
  
  /**
   * 获取战斗区域起始行
   * Canvas 坐标系中，Y 轴从上到下，战斗区域从顶部开始（row 0）
   */
  static get BATTLE_START_ROW() {
    return 0;
  }
  
  /**
   * 获取战斗区域行数
   * 总行数减去底部UI区域行数，然后乘以高度倍数
   */
  static get BATTLE_ROWS() {
    return (this.TOTAL_ROWS - this.BATTLE_BOTTOM_UI_ROWS) * this.BATTLE_HEIGHT_MULTIPLIER;
  }
  
  /**
   * 获取战斗区域结束行（不包括底部UI区域）
   * 战斗区域从 BATTLE_START_ROW 开始，到 BATTLE_END_ROW 结束（不包括）
   * 底部 BATTLE_BOTTOM_UI_ROWS 行用于UI，不能放置敌人和武器
   */
  static get BATTLE_END_ROW() {
    return this.BATTLE_START_ROW + this.BATTLE_ROWS - this.BATTLE_BOTTOM_UI_ROWS;
  }
  
  /** 战斗区域宽度倍数 */
  static BATTLE_WIDTH_MULTIPLIER = 2;
  
  /** 战斗区域高度倍数 */
  static BATTLE_HEIGHT_MULTIPLIER = 4;
  
  /**
   * 获取战斗区域实际高度
   */
  static get BATTLE_HEIGHT() {
    return this.BATTLE_ROWS * this.CELL_SIZE;
  }
  
  /**
   * 获取战斗区域实际宽度
   */
  static get BATTLE_WIDTH() {
    return this.DESIGN_WIDTH * this.BATTLE_WIDTH_MULTIPLIER;
  }
  
  /**
   * 获取战斗区域列数
   */
  static get BATTLE_COLS() {
    return Math.floor(this.BATTLE_WIDTH / this.CELL_SIZE);
  }
  
  // ==================== 边界和容差 ====================
  /**
   * 获取抛射物边界检查容差
   */
  static get PROJECTILE_BOUNDS_MARGIN() {
    return this.CELL_SIZE * 1.25;
  }
}

