import { COLORS } from './colors';
import { CELL_SIZE } from './layout';

// 坦克与武器相关常量
export const TANK_SIZE = CELL_SIZE * 0.8; // 坦克整体尺寸
export const TANK_COLOR = COLORS.ALLY_BODY; // 坦克涂装颜色
export const TANK_BARREL_COLOR = COLORS.ALLY_BARREL; // 炮管颜色
export const TANK_FIRE_INTERVAL = 500; // 坦克默认射速（ms）
export const TANK_ATTACK_RANGE_CELLS = 4; // 坦克攻击范围（格）

export const BULLET_SPEED = 200; // 坦克子弹速度（px/s）
export const BULLET_RADIUS = CELL_SIZE * 0.11; // 子弹半径（稍小，视觉更轻巧）
export const BULLET_COLOR = COLORS.ALLY_BULLET; // 子弹能量色
export const BULLET_DAMAGE = 1; // 玩家子弹伤害
export const WEAPON_MAX_HP = 5; // 武器耐久（被敌人击毁前的血量）

// 火箭塔相关
export const ROCKET_BASE_COST = 120; // 火箭塔造价
export const ROCKET_UPGRADE_BASE_COST = 70; // 火箭塔升级成本
export const ROCKET_SELL_BASE_GAIN = 60; // 火箭塔出售返还
export const ROCKET_BULLET_COLOR = COLORS.ROCKET_BULLET;

// 激光塔相关
export const LASER_BASE_COST = 100; // 激光塔造价
export const LASER_UPGRADE_BASE_COST = 60; // 激光塔升级成本
export const LASER_SELL_BASE_GAIN = 50; // 激光塔出售返还
export const LASER_FIRE_INTERVAL = 400; // 激光塔射速（ms，稍慢一点）
export const LASER_ATTACK_RANGE_CELLS = 4; // 激光塔攻击范围（格，与坦克相同）
export const LASER_DAMAGE = 1; // 激光伤害（降低为1）
export const LASER_BEAM_DURATION = 150; // 激光束持续时间（ms）

// 经济系统相关
export const INITIAL_GOLD = 1000; // 开局金币
export const WEAPON_BASE_COST = 80; // 坦克基础造价
export const WEAPON_UPGRADE_BASE_COST = 50; // 坦克升级单级成本
export const WEAPON_SELL_BASE_GAIN = 40; // 出售武器返还金币
export const ENEMY_KILL_REWARD = 20; // 击杀敌人奖励

