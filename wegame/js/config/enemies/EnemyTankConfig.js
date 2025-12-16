/**
 * 敌方坦克配置
 */

import { GameConfig } from '../GameConfig';

export class EnemyTankConfig {
  /** 敌方坦克生命值 */
  static MAX_HP = 10;
  
  /** 敌方坦克移动速度（像素/秒） */
  static MOVE_SPEED = 20;
  
  /** 敌方坦克攻击范围（格子数） */
  static ATTACK_RANGE = 3;
  
  /** 敌方坦克开火间隔（毫秒） */
  static FIRE_INTERVAL = 1000;
  
  /** 击杀敌方坦克奖励金币 */
  static KILL_REWARD = 20;
  
  /**
   * 获取敌方坦克尺寸
   */
  static get SIZE() {
    return GameConfig.CELL_SIZE * 0.55;
  }
}

