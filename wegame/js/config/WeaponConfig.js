/**
 * 武器配置
 */

import { GameConfig } from './GameConfig';

/**
 * 武器类型定义
 */
export const WeaponType = {
  ROCKET: 'rocket',
  LASER: 'laser'
};

/**
 * 武器配置表
 */
export class WeaponConfigs {
  static CONFIGS = new Map([
    [WeaponType.ROCKET, {
      id: 'rocket',
      name: '火箭塔',
      icon: '🚀',
      description: '追踪火箭\n高爆溅射伤害',
      baseCost: GameConfig.ROCKET_BASE_COST,
      upgradeCost: GameConfig.ROCKET_UPGRADE_COST,
      sellGain: GameConfig.ROCKET_SELL_GAIN,
      colorHex: 0x9d00ff,
    }],
    [WeaponType.LASER, {
      id: 'laser',
      name: '激光塔',
      icon: '⚡',
      description: '持续射线\n高射速攻击',
      baseCost: GameConfig.LASER_BASE_COST,
      upgradeCost: GameConfig.LASER_UPGRADE_COST,
      sellGain: GameConfig.LASER_SELL_GAIN,
      colorHex: 0x00ff41,
    }],
  ]);
  
  static getConfig(type) {
    return this.CONFIGS.get(type);
  }
  
  static getUpgradeCost(type, level) {
    const config = this.getConfig(type);
    return config ? level * config.upgradeCost : 0;
  }
  
  static getSellGain(type, level) {
    const config = this.getConfig(type);
    return config ? level * config.sellGain : 0;
  }
}

