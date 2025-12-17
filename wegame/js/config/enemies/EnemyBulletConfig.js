/**
 * 敌人子弹配置
 */

import { GameConfig } from '../GameConfig';

export class EnemyBulletConfig {
  /** 敌人子弹速度（像素/秒） */
  static SPEED = 160;
  
  /** 敌人子弹伤害值 */
  static DAMAGE = 1;
  
  /**
   * 获取敌人子弹半径
   */
  static get RADIUS() {
    return GameConfig.CELL_SIZE * 0.08;
  }
  
  /**
   * 获取敌人子弹最小半径
   */
  static get MIN_RADIUS() {
    return GameConfig.CELL_SIZE * 0.04;
  }
}

