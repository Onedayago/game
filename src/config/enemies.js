/**
 * 敌人配置
 * 定义敌方单位的属性和行为参数
 * 包括敌人外观、移动、攻击、生命值等数据
 */

import { COLORS } from './colors';
import { CELL_SIZE } from './layout';

// === 敌人基础属性 ===
export const ENEMY_SIZE = CELL_SIZE * 0.7;         // 敌军尺寸（相对格子大小）
export const ENEMY_COLOR = COLORS.ENEMY_BODY;      // 敌军主体颜色
export const ENEMY_MOVE_SPEED = 50;                // 敌军前进速度（像素/秒）
export const ENEMY_SPAWN_INTERVAL = 2000;          // 基础刷怪间隔（毫秒）

export const ENEMY_MAX_HP = 10;                    // 敌军初始生命值
export const ENEMY_BULLET_DAMAGE = 1;              // 敌军子弹对我方武器的伤害

// === 敌人攻击相关 ===
export const ENEMY_ATTACK_RANGE_CELLS = 3;         // 敌军攻击范围（格子数）
export const ENEMY_FIRE_INTERVAL = 1000;           // 敌军射速（毫秒）
export const ENEMY_BULLET_SPEED = 160;             // 敌军子弹速度（像素/秒）
export const ENEMY_BULLET_RADIUS = CELL_SIZE * 0.12; // 敌军子弹半径
export const ENEMY_BULLET_COLOR = COLORS.ENEMY_BULLET; // 敌军子弹颜色

// === 声波坦克配置 ===
export const SONIC_TANK_SIZE = CELL_SIZE * 0.8;    // 声波坦克尺寸（比普通坦克大）
export const SONIC_TANK_MAX_HP = 15;               // 声波坦克生命值（比普通坦克高）
export const SONIC_TANK_ATTACK_RANGE_CELLS = 6;    // 声波坦克攻击范围（格子数，比普通坦克远）
export const SONIC_TANK_FIRE_INTERVAL = 2500;      // 声波坦克射速（毫秒，稍微快一点）

// === 声波攻击配置 ===
export const SONIC_WAVE_INITIAL_RADIUS = CELL_SIZE * 0.5;  // 声波初始半径
export const SONIC_WAVE_MAX_RADIUS = CELL_SIZE * 5;        // 声波最大半径
export const SONIC_WAVE_EXPAND_SPEED = 180;                // 声波扩散速度（像素/秒）
export const SONIC_WAVE_LIFETIME = 2000;                   // 声波存活时间（毫秒）
export const SONIC_WAVE_COLOR = 0x8b5cf6;                  // 声波颜色（紫色）
export const SONIC_WAVE_DAMAGE = 2;                        // 声波伤害（比普通子弹高）

// === 敌人管理器配置 ===
export const ENEMY_MIN_SPAWN_INTERVAL = 800;       // 最小生成间隔（毫秒）
export const ENEMY_WAVE_DURATION = 15000;          // 每波持续时间（15秒）
export const ENEMY_HP_BONUS_PER_WAVE = 2;          // 每波增加的血量
export const ENEMY_SPAWN_INTERVAL_REDUCTION_RATE = 0.92; // 每波生成间隔递减率

// === 敌人动画配置 ===
export const ENEMY_IDLE_ANIM_SPEED = 0.0015;       // 待机动画速度
export const ENEMY_IDLE_PULSE_AMPLITUDE = 0.03;    // 待机脉冲幅度
export const ENEMY_HIT_FLASH_DURATION = 150;       // 受击闪烁时长（毫秒）
export const ENEMY_HIT_FLASH_FREQUENCY = 5;        // 受击闪烁频率

