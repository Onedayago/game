/**
 * 视觉效果配置
 * 定义游戏中各种视觉元素的参数
 * 包括阴影、高光、光晕等视觉效果
 */

// === 阴影配置 ===
export const SHADOW_COLOR = 0x000000;
export const SHADOW_PRIMARY_ALPHA = 0.35;          // 主阴影透明度
export const SHADOW_SECONDARY_ALPHA = 0.15;        // 次阴影透明度
export const SHADOW_TERTIARY_ALPHA = 0.3;          // 第三层阴影透明度

// === 选中光环配置 ===
export const SELECTION_RING_OUTER_SIZE = 0.85;     // 外层光晕尺寸倍数
export const SELECTION_RING_MID_SIZE = 0.75;       // 中层光晕尺寸倍数
export const SELECTION_RING_INNER_SIZE = 0.7;      // 内层主光环尺寸倍数
export const SELECTION_RING_CORE_SIZE = 0.65;      // 内圈细节尺寸倍数
export const SELECTION_RING_OUTER_WIDTH = 2;       // 外层光晕线宽
export const SELECTION_RING_MID_WIDTH = 3;         // 中层光晕线宽
export const SELECTION_RING_INNER_WIDTH = 4;       // 内层主光环线宽
export const SELECTION_RING_CORE_WIDTH = 1;        // 内圈细节线宽
export const SELECTION_RING_OUTER_ALPHA = 0.3;     // 外层透明度
export const SELECTION_RING_MID_ALPHA = 0.6;       // 中层透明度
export const SELECTION_RING_INNER_ALPHA = 1.0;     // 内层透明度
export const SELECTION_RING_CORE_ALPHA = 0.8;      // 内圈透明度

// === 粒子效果配置 ===
export const PARTICLE_EXPLOSION_COUNT = 8;         // 爆炸粒子数量
export const PARTICLE_MUZZLE_FLASH_COUNT = 6;      // 枪口闪光粒子数量

// === 激光束效果配置 ===
export const LASER_BEAM_OUTER_WIDTH = 8;           // 激光束外层宽度
export const LASER_BEAM_MID_WIDTH = 5;             // 激光束中层宽度
export const LASER_BEAM_CORE_WIDTH = 2;            // 激光束核心宽度
export const LASER_BEAM_OUTER_ALPHA = 0.3;         // 激光束外层透明度
export const LASER_BEAM_MID_ALPHA = 0.6;           // 激光束中层透明度
export const LASER_BEAM_CORE_ALPHA = 0.95;         // 激光束核心透明度
export const LASER_BEAM_FADE_ALPHA = 0.9;          // 激光束渐隐基础透明度

// === 武器塔尺寸比例 ===
// 火箭塔
export const ROCKET_TOWER_BASE_WIDTH = 0.7;        // 底座宽度倍数
export const ROCKET_TOWER_BASE_HEIGHT = 0.3;       // 底座高度倍数
export const ROCKET_TOWER_WIDTH = 0.34;            // 塔身宽度倍数
export const ROCKET_TOWER_HEIGHT = 0.9;            // 塔身高度倍数

// 激光塔
export const LASER_TOWER_RADIUS = 0.20;            // 激光塔半径倍数
export const LASER_TOWER_CORE_RADIUS = 0.12;       // 能量核心半径倍数
export const LASER_TOWER_BASE_SIZE = 0.4;          // 六边形基座尺寸倍数
export const LASER_TOWER_EMITTER_DIST = 0.85;      // 发射器距离倍数

// === 敌人坦克尺寸比例 ===
export const ENEMY_TANK_HULL_RADIUS = 0.25;        // 车体半径倍数
export const ENEMY_TANK_TRACK_HEIGHT = 0.22;       // 履带高度倍数
export const ENEMY_TANK_TURRET_RADIUS = 0.22;      // 炮塔半径倍数
export const ENEMY_TANK_BARREL_LENGTH = 0.78;      // 炮管长度倍数
export const ENEMY_TANK_BARREL_HALF_HEIGHT = 0.08; // 炮管半高倍数

