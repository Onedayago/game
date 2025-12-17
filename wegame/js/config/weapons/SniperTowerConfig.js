/**
 * 狙击塔配置
 */

export class SniperTowerConfig {
  /** 狙击塔购买成本（超高伤害，超远射程，适合打BOSS） */
  static BASE_COST = 200;
  
  /** 狙击塔升级成本（每级递增） */
  static UPGRADE_COST = 100;
  
  /** 狙击塔出售收益（购买成本的50%） */
  static SELL_GAIN = 100;
  
  /** 狙击塔开火间隔（毫秒，低射速） */
  static FIRE_INTERVAL = 1200;
  
  /** 狙击塔攻击范围（格子数，超远射程） */
  static ATTACK_RANGE = 9;
  
  /** 狙击塔基础伤害倍数 */
  static DAMAGE_MULTIPLIER = 5;
  
  /** 等级1：开火间隔倍数（降低10%） */
  static LEVEL_1_FIRE_INTERVAL_MULTIPLIER = 0.9;
  
  /** 等级1：伤害倍数（提升40%） */
  static LEVEL_1_DAMAGE_MULTIPLIER = 7;
  
  /** 等级2：开火间隔倍数（降低20%） */
  static LEVEL_2_FIRE_INTERVAL_MULTIPLIER = 0.8;
  
  /** 等级2：伤害倍数（提升80%） */
  static LEVEL_2_DAMAGE_MULTIPLIER = 9;
  
  /** 等级3：开火间隔倍数（降低30%） */
  static LEVEL_3_FIRE_INTERVAL_MULTIPLIER = 0.7;
  
  /** 等级3：伤害倍数（提升120%） */
  static LEVEL_3_DAMAGE_MULTIPLIER = 11;
}

