/**
 * 激光塔配置
 */

export class LaserTowerConfig {
  /** 激光塔购买成本 */
  static BASE_COST = 100;
  
  /** 激光塔升级成本 */
  static UPGRADE_COST = 60;
  
  /** 激光塔出售收益 */
  static SELL_GAIN = 50;
  
  /** 激光塔开火间隔（毫秒） */
  static FIRE_INTERVAL = 400;
  
  /** 激光塔攻击范围（格子数） */
  static ATTACK_RANGE = 4;
  
  /** 激光塔基础伤害值 */
  static BASE_DAMAGE = 1;
  
  /** 激光光束持续时间（毫秒） */
  static BEAM_DURATION = 150;
  
  /** 等级1：开火间隔倍数 */
  static LEVEL_1_FIRE_INTERVAL_MULTIPLIER = 1.2;
  
  /** 等级1：伤害倍数 */
  static LEVEL_1_DAMAGE_MULTIPLIER = 1;
  
  /** 等级2：开火间隔倍数 */
  static LEVEL_2_FIRE_INTERVAL_MULTIPLIER = 1.0;
  
  /** 等级2：伤害倍数 */
  static LEVEL_2_DAMAGE_MULTIPLIER = 1.5;
  
  /** 等级3：开火间隔倍数 */
  static LEVEL_3_FIRE_INTERVAL_MULTIPLIER = 0.8;
  
  /** 等级3：伤害倍数 */
  static LEVEL_3_DAMAGE_MULTIPLIER = 2;
}

