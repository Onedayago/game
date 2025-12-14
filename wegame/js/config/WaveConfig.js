/**
 * 波次系统配置
 */

export class WaveConfig {
  /** 每波持续时间（毫秒） */
  static WAVE_DURATION = 15000;
  
  /** 每波增加的血量 */
  static HP_BONUS_PER_WAVE = 2;
  
  /** 每波生成间隔递减率 */
  static SPAWN_INTERVAL_REDUCTION = 0.92;
}

