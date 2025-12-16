/**
 * 重型敌人配置
 */

import { GameConfig } from '../GameConfig';

export class HeavyEnemyConfig {
  /** 重型敌人生命值 */
  static MAX_HP = 30;
  
  /** 重型敌人移动速度（像素/秒） */
  static MOVE_SPEED = 5;
  
  /** 重型敌人攻击范围（格子数） */
  static ATTACK_RANGE = 4;
  
  /** 重型敌人开火间隔（毫秒） */
  static FIRE_INTERVAL = 1500;
  
  /** 击杀重型敌人奖励金币 */
  static KILL_REWARD = 50;
  
  /**
   * 获取重型敌人尺寸
   */
  static get SIZE() {
    return GameConfig.CELL_SIZE * 0.7;
  }
}

