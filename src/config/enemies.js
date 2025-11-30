import { COLORS } from './colors';
import { CELL_SIZE } from './layout';

// 敌人相关常量
export const ENEMY_SIZE = CELL_SIZE * 0.7; // 敌军尺寸
export const ENEMY_COLOR = COLORS.ENEMY_BODY; // 敌军颜色
export const ENEMY_MOVE_SPEED = 50; // 敌军前进速度（px/s）
export const ENEMY_SPAWN_INTERVAL = 2000; // 基础刷怪间隔（ms）

export const ENEMY_MAX_HP = 10; // 敌军初始生命
export const ENEMY_BULLET_DAMAGE = 1; // 敌军子弹伤害

// 敌人攻击相关
export const ENEMY_ATTACK_RANGE_CELLS = 3; // 敌军攻击范围（格）
export const ENEMY_FIRE_INTERVAL = 1000; // 敌军射速（ms）
export const ENEMY_BULLET_SPEED = 160; // 敌军子弹速度（px/s）
export const ENEMY_BULLET_RADIUS = CELL_SIZE * 0.12; // 敌军子弹半径
export const ENEMY_BULLET_COLOR = COLORS.ENEMY_BULLET; // 敌军子弹颜色

