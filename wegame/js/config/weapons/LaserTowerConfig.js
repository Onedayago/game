/**
 * 激光塔配置
 */

export class LaserTowerConfig {
  /** 激光塔购买成本（最便宜，适合清小怪） */
  static BASE_COST = 80;
  
  /** 激光塔升级成本（每级递增） */
  static UPGRADE_COST = 40;
  
  /** 激光塔出售收益（购买成本的50%） */
  static SELL_GAIN = 40;
  
  /** 激光塔开火间隔（毫秒，高射速） */
  static FIRE_INTERVAL = 350;
  
  /** 激光塔攻击范围（格子数） */
  static ATTACK_RANGE = 4;
  
  /** 激光塔基础伤害值 */
  static BASE_DAMAGE = 1;
  
  /** 激光光束持续时间（毫秒） */
  static BEAM_DURATION = 150;
  
  /** 等级1：开火间隔倍数（降低15%） */
  static LEVEL_1_FIRE_INTERVAL_MULTIPLIER = 0.85;
  
  /** 等级1：伤害倍数（提升50%） */
  static LEVEL_1_DAMAGE_MULTIPLIER = 1.5;
  
  /** 等级2：开火间隔倍数（降低25%） */
  static LEVEL_2_FIRE_INTERVAL_MULTIPLIER = 0.75;
  
  /** 等级2：伤害倍数（提升100%） */
  static LEVEL_2_DAMAGE_MULTIPLIER = 2;
  
  /** 等级3：开火间隔倍数（降低35%） */
  static LEVEL_3_FIRE_INTERVAL_MULTIPLIER = 0.65;
  
  /** 等级3：伤害倍数（提升150%） */
  static LEVEL_3_DAMAGE_MULTIPLIER = 2.5;
}

