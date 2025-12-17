/**
 * 自爆敌人配置
 */

import { GameConfig } from '../GameConfig';

export class BomberEnemyConfig {
  /** 自爆敌人生命值（低血量，中等速度，危险） */
  static MAX_HP = 5;
  
  /** 自爆敌人移动速度（像素/秒） */
  static MOVE_SPEED = 30;
  
  /** 自爆敌人爆炸范围（格子数） */
  static EXPLOSION_RANGE = 2;
  
  /** 自爆敌人爆炸伤害 */
  static EXPLOSION_DAMAGE = 4;
  
  /** 击杀自爆敌人奖励金币（性价比：2金币/1血量，因为危险） */
  static KILL_REWARD = 10;
  
  /**
   * 获取自爆敌人尺寸
   */
  static get SIZE() {
    return GameConfig.CELL_SIZE * 0.48;
  }
}

