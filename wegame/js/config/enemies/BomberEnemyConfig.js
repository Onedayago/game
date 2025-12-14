/**
 * 自爆敌人配置
 */

import { GameConfig } from '../GameConfig';

export class BomberEnemyConfig {
  /** 自爆敌人生命值 */
  static MAX_HP = 6;
  
  /** 自爆敌人移动速度（像素/秒） */
  static MOVE_SPEED = 55;
  
  /** 自爆敌人爆炸范围（格子数） */
  static EXPLOSION_RANGE = 2;
  
  /** 自爆敌人爆炸伤害 */
  static EXPLOSION_DAMAGE = 3;
  
  /** 击杀自爆敌人奖励金币 */
  static KILL_REWARD = 18;
  
  /**
   * 获取自爆敌人尺寸
   */
  static get SIZE() {
    return GameConfig.CELL_SIZE * 0.48;
  }
}

