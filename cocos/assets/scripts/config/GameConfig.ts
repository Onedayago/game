/**
 * 游戏核心配置
 * 整合所有游戏配置常量
 */

export class GameConfig {
    // === 设计基准尺寸 ===
    static readonly DESIGN_WIDTH = 1600;
    static readonly DESIGN_HEIGHT = 640;
    
    // === 网格系统 ===
    static readonly CELL_SIZE = 80;
    static readonly GRID_LINE_ALPHA = 0.3;
    static readonly TOTAL_ROWS = 8; // 总行数（8行 * 80 = 640px）
    static readonly BATTLE_START_ROW = 3; // 战斗区域起始行（从底部数，索引3 = 从顶部数第5行）
    static readonly BATTLE_ROWS = 4; // 战斗区域行数（索引3-6，从顶部数第2-5行）
    static readonly BATTLE_COLS = 20; // 战斗区域列数（20列 * 80 = 1600px）
    
    // === UI 拖拽 ===
    static readonly DRAG_GHOST_SCALE = 1.2; // 拖拽幽灵的放大倍数
    static readonly DRAG_GHOST_SIZE = 60; // 拖拽幽灵的尺寸
    static readonly WEAPON_MAP_SIZE_RATIO = 0.8; // 地图上武器图标相对于格子的大小比例
    
    // === 敌人配置 ===
    static readonly ENEMY_SIZE = this.CELL_SIZE * 0.7; // 敌人尺寸（相对格子大小）
    static readonly ENEMY_MOVE_SPEED = 50; // 敌人移动速度（像素/秒）
    static readonly ENEMY_SPAWN_INTERVAL = 2000; // 基础刷怪间隔（毫秒）
    static readonly ENEMY_MIN_SPAWN_INTERVAL = 800; // 最小刷怪间隔（毫秒）
    static readonly ENEMY_MAX_HP = 10; // 敌人初始生命值
    static readonly ENEMY_BULLET_DAMAGE = 1; // 敌人子弹伤害
    static readonly ENEMY_ATTACK_RANGE = 3; // 敌人攻击范围（格子数）
    static readonly ENEMY_FIRE_INTERVAL = 1000; // 敌人射速（毫秒）
    static readonly ENEMY_BULLET_SPEED = 160; // 敌人子弹速度（像素/秒）
    static readonly ENEMY_BULLET_RADIUS = this.CELL_SIZE * 0.12; // 敌人子弹半径
    static readonly ENEMY_KILL_REWARD = 10; // 击杀敌人奖励金币
    
    // === 波次系统 ===
    static readonly WAVE_DURATION = 15000; // 每波持续时间（毫秒）
    static readonly HP_BONUS_PER_WAVE = 2; // 每波增加的血量
    static readonly SPAWN_INTERVAL_REDUCTION = 0.92; // 每波生成间隔递减率
    
    // === 敌人动画配置 ===
    static readonly ENEMY_IDLE_ANIM_SPEED = 0.0015; // 待机动画速度
    static readonly ENEMY_IDLE_PULSE_AMPLITUDE = 0.015; // 待机脉冲幅度
    static readonly ENEMY_HIT_FLASH_DURATION = 120; // 受击闪烁时长（毫秒）
    
    // === 布局常量 ===
    static readonly TOP_UI_HEIGHT = 80;
    static readonly WEAPON_CONTAINER_HEIGHT = 200;
    static readonly WEAPON_CONTAINER_MARGIN = 16;
    
    // === 武器配置 ===
    static readonly WEAPON_MAX_HP = 5;
    static readonly WEAPON_MAX_LEVEL = 3;
    static readonly WEAPON_BASE_COST = 80;
    static readonly WEAPON_UPGRADE_BASE_COST = 50;
    static readonly WEAPON_SELL_BASE_GAIN = 40;
    
    // === 火箭塔配置 ===
    static readonly ROCKET_BASE_COST = 120;
    static readonly ROCKET_UPGRADE_COST = 70;
    static readonly ROCKET_SELL_GAIN = 60;
    static readonly ROCKET_FIRE_INTERVAL = 600;  // 毫秒
    static readonly ROCKET_DAMAGE_MULTIPLIER = 2;
    
    // === 激光塔配置 ===
    static readonly LASER_BASE_COST = 100;
    static readonly LASER_UPGRADE_COST = 60;
    static readonly LASER_SELL_GAIN = 50;
    static readonly LASER_FIRE_INTERVAL = 400;
    static readonly LASER_DAMAGE = 1;
    static readonly LASER_BEAM_DURATION = 150;
    static readonly LASER_ATTACK_RANGE = 4;
    
    // === 子弹配置 ===
    static readonly BULLET_SPEED = 200;
    static readonly BULLET_RADIUS = 8.8;
    static readonly BULLET_DAMAGE = 1;
    
    // === 敌人配置 ===
    static readonly ENEMY_MAX_HP = 10;
    static readonly ENEMY_MOVE_SPEED = 50;
    static readonly ENEMY_SPAWN_INTERVAL = 2000;
    static readonly ENEMY_MIN_SPAWN_INTERVAL = 800;
    static readonly ENEMY_ATTACK_RANGE = 3;
    static readonly ENEMY_FIRE_INTERVAL = 1000;
    static readonly ENEMY_BULLET_SPEED = 160;
    static readonly ENEMY_BULLET_DAMAGE = 1;
    
    // === 声波坦克配置 ===
    static readonly SONIC_TANK_HP = 15;
    static readonly SONIC_TANK_ATTACK_RANGE = 6;
    static readonly SONIC_TANK_FIRE_INTERVAL = 2500;
    static readonly SONIC_WAVE_DAMAGE = 2;
    static readonly SONIC_WAVE_MAX_RADIUS = 400;
    static readonly SONIC_WAVE_EXPAND_SPEED = 180;
    static readonly SONIC_WAVE_LIFETIME = 2000;
    
    // === 波次系统 ===
    static readonly WAVE_DURATION = 15000;
    static readonly HP_BONUS_PER_WAVE = 2;
    static readonly SPAWN_INTERVAL_REDUCTION = 0.92;
    
    // === 经济系统 ===
    static readonly INITIAL_GOLD = 1000;
    static readonly ENEMY_KILL_REWARD = 20;
    
    // === 动画配置 ===
    static readonly UPGRADE_FLASH_DURATION = 260;
    static readonly HIT_FLASH_DURATION = 120;
    static readonly IDLE_ANIM_SPEED = 0.0012;
    static readonly IDLE_PULSE_AMPLITUDE = 0.025;
    
    // === 血量条配置 ===
    static readonly HP_BAR_WIDTH_RATIO = 0.9;
    static readonly HP_BAR_HEIGHT = 6;
    static readonly HP_BAR_OFFSET_Y_RATIO = 0.75;
    static readonly HP_BAR_CRITICAL_THRESHOLD = 0.3;
    static readonly HP_BAR_WARNING_THRESHOLD = 0.6;
    
    // === 粒子效果配置 ===
    static readonly PARTICLE_EXPLOSION_COUNT = 8;
    static readonly PARTICLE_MUZZLE_FLASH_COUNT = 6;
    
    // === 寻路系统 ===（简化版，格子移动）
    // 敌人按格子移动，优先向右，遇障碍物向上下绕行
}

/**
 * 武器类型定义
 */
export enum WeaponType {
    ROCKET = 'rocket',
    LASER = 'laser',
}

/**
 * 武器类型配置数据
 */
export interface WeaponTypeConfig {
    id: string;
    name: string;
    icon: string;
    description: string;
    baseCost: number;
    upgradeCost: number;
    sellGain: number;
    colorHex: number;
}

/**
 * 武器配置表
 */
export class WeaponConfigs {
    static readonly CONFIGS: Map<WeaponType, WeaponTypeConfig> = new Map([
        [WeaponType.ROCKET, {
            id: 'rocket',
            name: '火箭塔',
            icon: '🚀',
            description: '追踪火箭\\n高爆溅射伤害',
            baseCost: GameConfig.ROCKET_BASE_COST,
            upgradeCost: GameConfig.ROCKET_UPGRADE_COST,
            sellGain: GameConfig.ROCKET_SELL_GAIN,
            colorHex: 0x9d00ff,
        }],
        [WeaponType.LASER, {
            id: 'laser',
            name: '激光塔',
            icon: '⚡',
            description: '持续射线\\n高射速攻击',
            baseCost: GameConfig.LASER_BASE_COST,
            upgradeCost: GameConfig.LASER_UPGRADE_COST,
            sellGain: GameConfig.LASER_SELL_GAIN,
            colorHex: 0x00ff41,
        }],
    ]);
    
    static getConfig(type: WeaponType): WeaponTypeConfig | undefined {
        return this.CONFIGS.get(type);
    }
    
    static getUpgradeCost(type: WeaponType, level: number): number {
        const config = this.getConfig(type);
        return config ? level * config.upgradeCost : 0;
    }
    
    static getSellGain(type: WeaponType, level: number): number {
        const config = this.getConfig(type);
        return config ? level * config.sellGain : 0;
    }
}

