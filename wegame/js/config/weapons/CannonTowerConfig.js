/**
 * 加农炮塔配置
 */

export class CannonTowerConfig {
  /** 加农炮购买成本（高伤害，适合打重甲） */
  static BASE_COST = 140;
  
  /** 加农炮升级成本（每级递增） */
  static UPGRADE_COST = 70;
  
  /** 加农炮出售收益（购买成本的50%） */
  static SELL_GAIN = 70;
  
  /** 加农炮开火间隔（毫秒，中等射速） */
  static FIRE_INTERVAL = 900;
  
  /** 加农炮攻击范围（格子数） */
  static ATTACK_RANGE = 6;
  
  /** 加农炮基础伤害倍数 */
  static DAMAGE_MULTIPLIER = 3;
  
  /** 等级1：开火间隔倍数（降低10%） */
  static LEVEL_1_FIRE_INTERVAL_MULTIPLIER = 0.9;
  
  /** 等级1：伤害倍数（提升33%） */
  static LEVEL_1_DAMAGE_MULTIPLIER = 4;
  
  /** 等级2：开火间隔倍数（降低20%） */
  static LEVEL_2_FIRE_INTERVAL_MULTIPLIER = 0.8;
  
  /** 等级2：伤害倍数（提升67%） */
  static LEVEL_2_DAMAGE_MULTIPLIER = 5;
  
  /** 等级3：开火间隔倍数（降低30%） */
  static LEVEL_3_FIRE_INTERVAL_MULTIPLIER = 0.7;
  
  /** 等级3：伤害倍数（提升100%） */
  static LEVEL_3_DAMAGE_MULTIPLIER = 6;
}

