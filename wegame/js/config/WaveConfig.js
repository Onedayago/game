/**
 * 波次系统配置
 */

export class WaveConfig {
  /** 每波持续时间（毫秒） */
  static WAVE_DURATION = 20000;
  
  /** 每波增加的血量（更平滑的难度增长） */
  static HP_BONUS_PER_WAVE = 1.5;
  
  /** 每波生成间隔递减率（更平滑的难度增长） */
  static SPAWN_INTERVAL_REDUCTION = 0.95;
}

