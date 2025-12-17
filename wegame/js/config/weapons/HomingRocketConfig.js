/**
 * 追踪火箭配置
 */

export class HomingRocketConfig {
  /** 追踪火箭速度倍数（相对于基础子弹速度） */
  static SPEED_MULTIPLIER = 1.5;
  
  /** 追踪火箭半径（像素） */
  static RADIUS = 8.8;
  
  /** 追踪火箭最大生命周期（毫秒） */
  static MAX_LIFETIME = 5000;
  
  /** 追踪火箭转向速度（弧度/秒） */
  static TURN_RATE = Math.PI * 2;
}

