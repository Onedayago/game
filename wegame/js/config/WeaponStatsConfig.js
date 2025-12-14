/**
 * 武器数值配置
 */

import { GameConfig } from './GameConfig';

export class WeaponStatsConfig {
  // ==================== 武器基础配置 ====================
  /** 武器最大生命值 */
  static WEAPON_MAX_HP = 5;
  
  /** 武器最大等级 */
  static WEAPON_MAX_LEVEL = 3;
  
  // ==================== 武器子弹基础配置 ====================
  /** 武器子弹基础速度（像素/秒） */
  static BULLET_BASE_SPEED = 200;
  
  /** 武器子弹基础伤害值 */
  static BULLET_BASE_DAMAGE = 1;
}

