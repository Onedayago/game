/**
 * 火箭塔配置
 */

export class RocketTowerConfig {
  /** 火箭塔购买成本 */
  static BASE_COST = 120;
  
  /** 火箭塔升级成本 */
  static UPGRADE_COST = 70;
  
  /** 火箭塔出售收益 */
  static SELL_GAIN = 60;
  
  /** 火箭塔开火间隔（毫秒） */
  static FIRE_INTERVAL = 600;
  
  /** 火箭塔攻击范围（格子数） */
  static ATTACK_RANGE = 5;
  
  /** 火箭塔伤害倍数 */
  static DAMAGE_MULTIPLIER = 2;
  
  /** 等级1：开火间隔倍数 */
  static LEVEL_1_FIRE_INTERVAL_MULTIPLIER = 1.2;
  
  /** 等级1：伤害倍数 */
  static LEVEL_1_DAMAGE_MULTIPLIER = 2;
  
  /** 等级2：开火间隔倍数 */
  static LEVEL_2_FIRE_INTERVAL_MULTIPLIER = 1.0;
  
  /** 等级2：伤害倍数 */
  static LEVEL_2_DAMAGE_MULTIPLIER = 2.5;
  
  /** 等级3：开火间隔倍数 */
  static LEVEL_3_FIRE_INTERVAL_MULTIPLIER = 0.8;
  
  /** 等级3：伤害倍数 */
  static LEVEL_3_DAMAGE_MULTIPLIER = 3;
}

