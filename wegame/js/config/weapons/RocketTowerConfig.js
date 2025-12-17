/**
 * 火箭塔配置
 */

export class RocketTowerConfig {
  /** 火箭塔购买成本 */
  static BASE_COST = 100;
  
  /** 火箭塔升级成本（每级递增） */
  static UPGRADE_COST = 50;
  
  /** 火箭塔出售收益（购买成本的50%） */
  static SELL_GAIN = 50;
  
  /** 火箭塔开火间隔（毫秒） */
  static FIRE_INTERVAL = 700;
  
  /** 火箭塔攻击范围（格子数） */
  static ATTACK_RANGE = 5;
  
  /** 火箭塔基础伤害倍数 */
  static DAMAGE_MULTIPLIER = 2;
  
  /** 等级1：开火间隔倍数（降低10%） */
  static LEVEL_1_FIRE_INTERVAL_MULTIPLIER = 0.9;
  
  /** 等级1：伤害倍数（提升25%） */
  static LEVEL_1_DAMAGE_MULTIPLIER = 2.5;
  
  /** 等级2：开火间隔倍数（降低20%） */
  static LEVEL_2_FIRE_INTERVAL_MULTIPLIER = 0.8;
  
  /** 等级2：伤害倍数（提升50%） */
  static LEVEL_2_DAMAGE_MULTIPLIER = 3;
  
  /** 等级3：开火间隔倍数（降低30%） */
  static LEVEL_3_FIRE_INTERVAL_MULTIPLIER = 0.7;
  
  /** 等级3：伤害倍数（提升100%） */
  static LEVEL_3_DAMAGE_MULTIPLIER = 4;
}

