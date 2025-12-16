/**
 * 加农炮塔配置
 */

export class CannonTowerConfig {
  /** 加农炮购买成本 */
  static BASE_COST = 150;
  
  /** 加农炮升级成本 */
  static UPGRADE_COST = 90;
  
  /** 加农炮出售收益 */
  static SELL_GAIN = 75;
  
  /** 加农炮开火间隔（毫秒） */
  static FIRE_INTERVAL = 800;
  
  /** 加农炮攻击范围（格子数） */
  static ATTACK_RANGE = 6;
  
  /** 加农炮伤害倍数 */
  static DAMAGE_MULTIPLIER = 3;
  
  /** 等级1：开火间隔倍数 */
  static LEVEL_1_FIRE_INTERVAL_MULTIPLIER = 1.2;
  
  /** 等级1：伤害倍数 */
  static LEVEL_1_DAMAGE_MULTIPLIER = 3;
  
  /** 等级2：开火间隔倍数 */
  static LEVEL_2_FIRE_INTERVAL_MULTIPLIER = 1.0;
  
  /** 等级2：伤害倍数 */
  static LEVEL_2_DAMAGE_MULTIPLIER = 3.5;
  
  /** 等级3：开火间隔倍数 */
  static LEVEL_3_FIRE_INTERVAL_MULTIPLIER = 0.8;
  
  /** 等级3：伤害倍数 */
  static LEVEL_3_DAMAGE_MULTIPLIER = 4;
}

