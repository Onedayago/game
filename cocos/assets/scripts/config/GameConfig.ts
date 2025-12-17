/**
 * 游戏核心配置
 * 包含基础游戏配置常量（网格、尺寸、经济、敌人、武器等）
 */

export class GameConfig {
    // ==================== 基础设计尺寸 ====================
    /** 设计分辨率宽度（像素） */
    static readonly DESIGN_WIDTH = 1000;
    /** 设计分辨率高度（像素） */
    static readonly DESIGN_HEIGHT = 480;
    
    // ==================== 网格系统 ====================
    /** 网格格子大小（像素） */
    static readonly CELL_SIZE = 80;
    /** 网格线透明度（0-1） */
    static readonly GRID_LINE_ALPHA = 0.3;
    /** 总行数（基于设计高度计算：DESIGN_HEIGHT / CELL_SIZE = 6行） */
    static readonly TOTAL_ROWS = Math.floor(this.DESIGN_HEIGHT / this.CELL_SIZE);
    /** 底部非战斗区域行数（底部两行用于武器容器等UI，Y轴从下往上，行0-1是底部） */
    static readonly BOTTOM_NON_BATTLE_ROWS = 2;
    /** 战斗区域起始行（从行2开始，跳过底部两行） */
    static readonly BATTLE_START_ROW = this.BOTTOM_NON_BATTLE_ROWS;
    /** 战斗区域行数（总行数减去底部非战斗区域行数） */
    static readonly BATTLE_ROWS = this.TOTAL_ROWS - this.BOTTOM_NON_BATTLE_ROWS;
    /** 战斗区域宽度倍数（战场宽度是画布的两倍） */
    static readonly BATTLE_WIDTH_MULTIPLIER = 2;
    /** 战斗区域实际宽度（画布宽度的两倍） */
    static readonly BATTLE_WIDTH = this.DESIGN_WIDTH * this.BATTLE_WIDTH_MULTIPLIER;
    /** 战斗区域列数（基于战斗区域实际宽度计算） */
    static readonly BATTLE_COLS = Math.floor(this.BATTLE_WIDTH / this.CELL_SIZE);
    
    // ==================== 经济系统 ====================
    /** 初始金币数量 */
    static readonly INITIAL_GOLD = 1000;
    /** 击杀敌人奖励金币 */
    static readonly ENEMY_KILL_REWARD = 20;
    
    // ==================== 武器基础配置 ====================
    /** 武器最大生命值 */
    static readonly WEAPON_MAX_HP = 5;
    /** 武器最大等级 */
    static readonly WEAPON_MAX_LEVEL = 3;
    /** 武器基础购买成本（未使用，各武器类型有独立配置） */
    static readonly WEAPON_BASE_COST = 80;
    /** 武器基础升级成本（未使用，各武器类型有独立配置） */
    static readonly WEAPON_UPGRADE_BASE_COST = 50;
    /** 武器基础出售收益（未使用，各武器类型有独立配置） */
    static readonly WEAPON_SELL_BASE_GAIN = 40;
    
    // ==================== 火箭塔配置 ====================
    /** 火箭塔购买成本（金币） */
    static readonly ROCKET_BASE_COST = 120;
    /** 火箭塔升级成本（金币/级） */
    static readonly ROCKET_UPGRADE_COST = 70;
    /** 火箭塔出售收益（金币/级） */
    static readonly ROCKET_SELL_GAIN = 60;
    /** 火箭塔开火间隔（毫秒） */
    static readonly ROCKET_FIRE_INTERVAL = 600;
    /** 火箭塔伤害倍数 */
    static readonly ROCKET_DAMAGE_MULTIPLIER = 2;
    
    // ==================== 激光塔配置 ====================
    /** 激光塔购买成本（金币） */
    static readonly LASER_BASE_COST = 100;
    /** 激光塔升级成本（金币/级） */
    static readonly LASER_UPGRADE_COST = 60;
    /** 激光塔出售收益（金币/级） */
    static readonly LASER_SELL_GAIN = 50;
    /** 激光塔开火间隔（毫秒） */
    static readonly LASER_FIRE_INTERVAL = 400;
    /** 激光塔伤害值 */
    static readonly LASER_DAMAGE = 1;
    /** 激光光束持续时间（毫秒） */
    static readonly LASER_BEAM_DURATION = 150;
    /** 激光塔攻击范围（格子数） */
    static readonly LASER_ATTACK_RANGE = 4;
    
    // ==================== 武器子弹配置 ====================
    /** 武器子弹速度（像素/秒） */
    static readonly BULLET_SPEED = 200;
    /** 武器子弹半径（像素） */
    static readonly BULLET_RADIUS = 8.8;
    /** 武器子弹伤害值 */
    static readonly BULLET_DAMAGE = 1;
    
    // ==================== 敌人基础配置 ====================
    /** 敌人尺寸（相对格子大小的比例，缩小以确保血条不超出格子） */
    static readonly ENEMY_SIZE = this.CELL_SIZE * 0.55;
    /** 敌人移动速度（像素/秒） */
    static readonly ENEMY_MOVE_SPEED = 50;
    /** 敌人初始生命值 */
    static readonly ENEMY_MAX_HP = 10;
    /** 敌人攻击范围（格子数） */
    static readonly ENEMY_ATTACK_RANGE = 3;
    /** 敌人开火间隔（毫秒） */
    static readonly ENEMY_FIRE_INTERVAL = 1000;
    /** 敌人子弹速度（像素/秒） */
    static readonly ENEMY_BULLET_SPEED = 160;
    /** 敌人子弹伤害值 */
    static readonly ENEMY_BULLET_DAMAGE = 1;
    /** 敌人子弹半径（相对格子大小的比例，0.12倍） */
    static readonly ENEMY_BULLET_RADIUS = this.CELL_SIZE * 0.08;  // 减小子弹大小
    
    // ==================== 敌人生成配置 ====================
    /** 基础刷怪间隔（毫秒） */
    static readonly ENEMY_SPAWN_INTERVAL = 2000;
    /** 最小刷怪间隔（毫秒） */
    static readonly ENEMY_MIN_SPAWN_INTERVAL = 800;
    
    // ==================== 声波坦克配置 ====================
    /** 声波坦克生命值 */
    static readonly SONIC_TANK_HP = 15;
    /** 声波坦克攻击范围（格子数） */
    static readonly SONIC_TANK_ATTACK_RANGE = 6;
    /** 声波坦克开火间隔（毫秒） */
    static readonly SONIC_TANK_FIRE_INTERVAL = 2500;
    /** 声波伤害值（现在使用 EnemyBullet，保留此配置用于伤害值） */
    static readonly SONIC_WAVE_DAMAGE = 2;
    
    // ==================== 波次系统 ====================
    /** 每波持续时间（毫秒） */
    static readonly WAVE_DURATION = 15000;
    /** 每波增加的血量 */
    static readonly HP_BONUS_PER_WAVE = 2;
    /** 每波生成间隔递减率（0-1，值越小递减越快） */
    static readonly SPAWN_INTERVAL_REDUCTION = 0.92;
    
    // ==================== 动画效果配置 ====================
    /** 升级闪烁持续时间（毫秒） */
    static readonly UPGRADE_FLASH_DURATION = 260;
    /** 受击闪烁持续时间（毫秒） */
    static readonly HIT_FLASH_DURATION = 120;
    /** 待机动画速度（用于脉冲效果） */
    static readonly IDLE_ANIM_SPEED = 0.0012;
    /** 待机脉冲幅度（用于呼吸效果） */
    static readonly IDLE_PULSE_AMPLITUDE = 0.025;
    /** 敌人待机动画速度 */
    static readonly ENEMY_IDLE_ANIM_SPEED = 0.0015;
    /** 敌人待机脉冲幅度 */
    static readonly ENEMY_IDLE_PULSE_AMPLITUDE = 0.015;
    /** 敌人受击闪烁时长（毫秒） */
    static readonly ENEMY_HIT_FLASH_DURATION = 120;
    
    // ==================== 粒子效果配置 ====================
    /** 爆炸粒子数量 */
    static readonly PARTICLE_EXPLOSION_COUNT = 8;
    /** 枪口闪光粒子数量 */
    static readonly PARTICLE_MUZZLE_FLASH_COUNT = 6;
    
    // ==================== 边界和容差 ====================
    /** 抛射物边界检查容差（基于 CELL_SIZE） */
    static readonly PROJECTILE_BOUNDS_MARGIN = this.CELL_SIZE * 1.25;
    /** 敌人子弹最小半径（基于 CELL_SIZE） */
    static readonly ENEMY_BULLET_MIN_RADIUS = this.CELL_SIZE * 0.04;  // 减小最小半径
    
    // ==================== 寻路系统说明 ====================
    // 敌人按格子移动，优先向右，遇障碍物向上下绕行
    // 使用简化的格子移动系统，不进行复杂的路径规划
}

