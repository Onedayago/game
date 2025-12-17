/**
 * 敌人配置
 */

import { GameConfig } from './GameConfig';

export class EnemyConfig {
  // ==================== 敌人基础配置 ====================
  /**
   * 获取敌人尺寸（默认值，具体敌人类型会覆盖）
   */
  static get ENEMY_SIZE() {
    return GameConfig.CELL_SIZE * 0.55;
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
}

