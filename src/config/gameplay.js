/**
 * 游戏玩法配置
 * 定义游戏平衡性相关的数值参数
 * 包括武器属性、伤害、射速、经济系统等核心玩法数据
 */

import { COLORS } from './colors';
import { CELL_SIZE } from './layout';

// === 基础坦克武器相关常量 ===
export const TANK_FIRE_INTERVAL = 500;             // 坦克默认射速（毫秒）
export const TANK_ATTACK_RANGE_CELLS = 4;          // 坦克攻击范围（格子数）

// === 子弹相关 ===
export const BULLET_SPEED = 200;                   // 坦克子弹速度（像素/秒）
export const BULLET_RADIUS = CELL_SIZE * 0.11;     // 子弹半径（稍小，视觉更轻巧）
export const BULLET_COLOR = COLORS.ALLY_BULLET;    // 子弹能量色
export const BULLET_DAMAGE = 1;                    // 玩家子弹伤害值
export const WEAPON_MAX_HP = 5;                    // 武器耐久（被敌人击毁前的血量）

// === 火箭塔相关 ===
export const ROCKET_BASE_COST = 120;               // 火箭塔建造价格
export const ROCKET_UPGRADE_BASE_COST = 70;        // 火箭塔升级成本（每级）
export const ROCKET_SELL_BASE_GAIN = 60;           // 火箭塔出售返还金币
export const ROCKET_BULLET_COLOR = COLORS.ROCKET_BULLET; // 火箭弹颜色
export const ROCKET_FIRE_INTERVAL_MULTIPLIER = 1.2; // 火箭塔相对基础射速的倍数（更慢）
export const ROCKET_BULLET_RADIUS_MULTIPLIER = 0.6; // 火箭弹半径倍数
export const ROCKET_BULLET_SPEED_MULTIPLIER = 1.1; // 火箭弹速度倍数
export const ROCKET_DAMAGE_MULTIPLIER = 2;         // 火箭塔伤害倍数（比普通子弹高）
export const ROCKET_TURN_RATE_BASE = Math.PI * 1.1; // 火箭追踪转向速率（弧度/秒）
export const ROCKET_TURN_RATE_LEVEL_BONUS = Math.PI * 0.2; // 每级增加的转向速率

// 火箭塔升级配置
export const ROCKET_LEVEL_CONFIG = {
  1: { fireIntervalMultiplier: 1.2, radiusMultiplier: 0.6, speedMultiplier: 1.1 },
  2: { fireIntervalMultiplier: 1.0, radiusMultiplier: 0.7, speedMultiplier: 1.25 },
  3: { fireIntervalMultiplier: 0.8, radiusMultiplier: 0.8, speedMultiplier: 1.35 },
}

// === 激光塔相关 ===
export const LASER_BASE_COST = 100;                // 激光塔建造价格
export const LASER_UPGRADE_BASE_COST = 60;         // 激光塔升级成本（每级）
export const LASER_SELL_BASE_GAIN = 50;            // 激光塔出售返还金币
export const LASER_FIRE_INTERVAL = 400;            // 激光塔射速（毫秒，比普通坦克快）
export const LASER_ATTACK_RANGE_CELLS = 4;         // 激光塔攻击范围（格子数）
export const LASER_DAMAGE = 1;                     // 激光伤害值
export const LASER_BEAM_DURATION = 150;            // 激光束视觉效果持续时间（毫秒）

// 激光塔升级配置
export const LASER_LEVEL_CONFIG = {
  1: { fireIntervalMultiplier: 1.0, damageMultiplier: 1.0, beamDurationMultiplier: 1.0 },
  2: { fireIntervalMultiplier: 0.8, damageMultiplier: 1.5, beamDurationMultiplier: 1.2 },
  3: { fireIntervalMultiplier: 0.65, damageMultiplier: 2.0, beamDurationMultiplier: 1.4 },
}

// === 经济系统相关 ===
export const INITIAL_GOLD = 1000;                  // 开局初始金币
export const WEAPON_BASE_COST = 80;                // 普通坦克基础造价
export const WEAPON_UPGRADE_BASE_COST = 50;        // 坦克升级单级成本
export const WEAPON_SELL_BASE_GAIN = 40;           // 出售武器返还金币基础值
export const ENEMY_KILL_REWARD = 20;               // 击杀每个敌人的金币奖励

// === 武器通用配置 ===
export const WEAPON_MAX_LEVEL = 3;                 // 武器最大等级
export const WEAPON_UPGRADE_FLASH_DURATION = 260;  // 升级闪烁动画时长（毫秒）
export const WEAPON_HIT_FLASH_DURATION = 120;      // 受击闪烁时长（毫秒）
export const WEAPON_IDLE_ANIM_SPEED = 0.0012;      // 待机呼吸动画速度
export const WEAPON_IDLE_PULSE_AMPLITUDE = 0.025;  // 待机脉冲幅度
export const WEAPON_UPGRADE_PULSE_AMPLITUDE = 0.18; // 升级脉冲幅度

// === 血量条视觉配置 ===
export const HP_BAR_WIDTH_RATIO = 0.9;             // 血量条宽度（相对武器尺寸）
export const HP_BAR_HEIGHT = 6;                    // 血量条高度（像素）
export const HP_BAR_OFFSET_Y_RATIO = 0.75;         // 血量条Y偏移（相对武器尺寸）
export const HP_BAR_BORDER_RADIUS = 3;             // 血量条圆角
export const HP_BAR_CRITICAL_THRESHOLD = 0.3;      // 危险血量阈值
export const HP_BAR_WARNING_THRESHOLD = 0.6;       // 警告血量阈值
export const HP_BAR_WARNING_COLOR = 0xfbbf24;      // 警告血量颜色（琥珀色）

