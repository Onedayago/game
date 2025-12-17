/**
 * 快速敌人配置
 */

import { GameConfig } from '../GameConfig';

export class FastEnemyConfig {
  /** 快速敌人生命值（低血量，高速度） */
  static MAX_HP = 4;
  
  /** 快速敌人移动速度（像素/秒，高速度） */
  static MOVE_SPEED = 45;
  
  /** 快速敌人攻击范围（格子数） */
  static ATTACK_RANGE = 2;
  
  /** 快速敌人开火间隔（毫秒） */
  static FIRE_INTERVAL = 800;
  
  /** 击杀快速敌人奖励金币（性价比：1.5金币/1血量，因为速度快） */
  static KILL_REWARD = 6;
  
  /**
   * 获取快速敌人尺寸
   */
  static get SIZE() {
    return GameConfig.CELL_SIZE * 0.45;
  }
}

