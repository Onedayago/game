/**
 * 飞行敌人配置
 */

import { GameConfig } from '../GameConfig';

export class FlyingEnemyConfig {
  /** 飞行敌人生命值（中等血量，中等速度） */
  static MAX_HP = 10;
  
  /** 飞行敌人移动速度（像素/秒） */
  static MOVE_SPEED = 35;
  
  /** 飞行敌人攻击范围（格子数） */
  static ATTACK_RANGE = 3;
  
  /** 飞行敌人开火间隔（毫秒） */
  static FIRE_INTERVAL = 1200;
  
  /** 击杀飞行敌人奖励金币（性价比：1.5金币/1血量，因为速度快） */
  static KILL_REWARD = 15;
  
  /**
   * 获取飞行敌人尺寸
   */
  static get SIZE() {
    return GameConfig.CELL_SIZE * 0.5;
  }
}

