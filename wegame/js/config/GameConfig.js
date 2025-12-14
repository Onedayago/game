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
   */
  static init() {
    if (this._cachedDesignWidth !== null && this._cachedDesignHeight !== null) {
      return; // 已经初始化过
    }
    
    try {
      if (typeof wx !== 'undefined' && wx.getSystemInfoSync) {
        this._cachedSystemInfo = wx.getSystemInfoSync();
        this._cachedDesignWidth = this._cachedSystemInfo.windowWidth || 1000;
        this._cachedDesignHeight = this._cachedSystemInfo.windowHeight || 480;
      } else {
        // 非微信环境，使用默认值
        this._cachedDesignWidth = 1000;
        this._cachedDesignHeight = 480;
      }
    } catch (e) {
      console.warn('GameConfig.init 失败，使用默认值:', e);
      this._cachedDesignWidth = 1000;
      this._cachedDesignHeight = 480;
    }
  }
  
  /**
   * 获取设计分辨率宽度（像素）
   * 从缓存的屏幕宽度获取
   */
  static get DESIGN_WIDTH() {
    if (this._cachedDesignWidth === null) {
      // 如果未初始化，尝试初始化（向后兼容）
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
      // 如果未初始化，尝试初始化（向后兼容）
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
  
  /** 底部非战斗区域行数（Canvas 坐标系中，底部两行不是战斗区域） */
  static BOTTOM_NON_BATTLE_ROWS = 2;
  
  /**
   * 获取战斗区域起始行
   * Canvas 坐标系中，Y 轴从上到下，战斗区域从顶部开始（row 0）
   */
  static get BATTLE_START_ROW() {
    return 0;
  }
  
  /**
   * 获取战斗区域行数
   * 总行数减去底部非战斗区域行数
   */
  static get BATTLE_ROWS() {
    return this.TOTAL_ROWS - this.BOTTOM_NON_BATTLE_ROWS;
  }
  
  /** 战斗区域宽度倍数 */
  static BATTLE_WIDTH_MULTIPLIER = 2;
  
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
  
  // ==================== 经济系统 ====================
  /** 初始金币数量 */
  static INITIAL_GOLD = 1000;
  /** 击杀敌人奖励金币 */
  static ENEMY_KILL_REWARD = 20;
  
  // ==================== 武器基础配置 ====================
  /** 武器最大生命值 */
  static WEAPON_MAX_HP = 5;
  /** 武器最大等级 */
  static WEAPON_MAX_LEVEL = 3;
  
  // ==================== 火箭塔配置 ====================
  /** 火箭塔购买成本 */
  static ROCKET_BASE_COST = 120;
  /** 火箭塔升级成本 */
  static ROCKET_UPGRADE_COST = 70;
  /** 火箭塔出售收益 */
  static ROCKET_SELL_GAIN = 60;
  /** 火箭塔开火间隔（毫秒） */
  static ROCKET_FIRE_INTERVAL = 600;
  /** 火箭塔伤害倍数 */
  static ROCKET_DAMAGE_MULTIPLIER = 2;
  
  // ==================== 激光塔配置 ====================
  /** 激光塔购买成本 */
  static LASER_BASE_COST = 100;
  /** 激光塔升级成本 */
  static LASER_UPGRADE_COST = 60;
  /** 激光塔出售收益 */
  static LASER_SELL_GAIN = 50;
  /** 激光塔开火间隔（毫秒） */
  static LASER_FIRE_INTERVAL = 400;
  /** 激光塔伤害值 */
  static LASER_DAMAGE = 1;
  /** 激光光束持续时间（毫秒） */
  static LASER_BEAM_DURATION = 150;
  /** 激光塔攻击范围（格子数） */
  static LASER_ATTACK_RANGE = 4;
  
  // ==================== 武器子弹配置 ====================
  /** 武器子弹速度（像素/秒） */
  static BULLET_SPEED = 200;
  /** 武器子弹半径（像素） */
  static BULLET_RADIUS = 8.8;
  /** 武器子弹伤害值 */
  static BULLET_DAMAGE = 1;
  
  // ==================== 敌人基础配置 ====================
  /**
   * 获取敌人尺寸
   */
  static get ENEMY_SIZE() {
    return this.CELL_SIZE * 0.55;
  }
  /** 敌人移动速度（像素/秒） */
  static ENEMY_MOVE_SPEED = 50;
  /** 敌人初始生命值 */
  static ENEMY_MAX_HP = 10;
  /** 敌人攻击范围（格子数） */
  static ENEMY_ATTACK_RANGE = 3;
  /** 敌人开火间隔（毫秒） */
  static ENEMY_FIRE_INTERVAL = 1000;
  /** 敌人子弹速度（像素/秒） */
  static ENEMY_BULLET_SPEED = 160;
  /** 敌人子弹伤害值 */
  static ENEMY_BULLET_DAMAGE = 1;
  /**
   * 获取敌人子弹半径
   */
  static get ENEMY_BULLET_RADIUS() {
    return this.CELL_SIZE * 0.08;
  }
  
  // ==================== 敌人生成配置 ====================
  /** 基础刷怪间隔（毫秒） */
  static ENEMY_SPAWN_INTERVAL = 2000;
  /** 最小刷怪间隔（毫秒） */
  static ENEMY_MIN_SPAWN_INTERVAL = 800;
  
  // ==================== 声波坦克配置 ====================
  /** 声波坦克生命值 */
  static SONIC_TANK_HP = 15;
  /** 声波坦克攻击范围（格子数） */
  static SONIC_TANK_ATTACK_RANGE = 6;
  /** 声波坦克开火间隔（毫秒） */
  static SONIC_TANK_FIRE_INTERVAL = 2500;
  /** 声波伤害值 */
  static SONIC_WAVE_DAMAGE = 2;
  
  // ==================== 波次系统 ====================
  /** 每波持续时间（毫秒） */
  static WAVE_DURATION = 15000;
  /** 每波增加的血量 */
  static HP_BONUS_PER_WAVE = 2;
  /** 每波生成间隔递减率 */
  static SPAWN_INTERVAL_REDUCTION = 0.92;
  
  // ==================== 动画效果配置 ====================
  /** 升级闪烁持续时间（毫秒） */
  static UPGRADE_FLASH_DURATION = 260;
  /** 受击闪烁持续时间（毫秒） */
  static HIT_FLASH_DURATION = 120;
  
  // ==================== UI 血量条配置 ====================
  /** 血量条宽度相对于实体大小的比例 */
  static HP_BAR_WIDTH_RATIO = 0.9;
  /** 血量条高度（像素） */
  static HP_BAR_HEIGHT = 6;
  /** 血量条Y轴偏移相对于实体大小的比例 */
  static HP_BAR_OFFSET_Y_RATIO = 0.4;
  /** 血量条危险阈值 */
  static HP_BAR_CRITICAL_THRESHOLD = 0.3;
  /** 血量条警告阈值 */
  static HP_BAR_WARNING_THRESHOLD = 0.6;
  
  // ==================== 粒子效果配置 ====================
  /** 爆炸粒子数量 */
  static PARTICLE_EXPLOSION_COUNT = 8;
  /** 枪口闪光粒子数量 */
  static PARTICLE_MUZZLE_FLASH_COUNT = 6;
  
  // ==================== 边界和容差 ====================
  /**
   * 获取抛射物边界检查容差
   */
  static get PROJECTILE_BOUNDS_MARGIN() {
    return this.CELL_SIZE * 1.25;
  }
  /**
   * 获取敌人子弹最小半径
   */
  static get ENEMY_BULLET_MIN_RADIUS() {
    return this.CELL_SIZE * 0.04;
  }
}

