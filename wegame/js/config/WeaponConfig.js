/**
 * 武器配置
 */

import { RocketTowerConfig } from './weapons/RocketTowerConfig';
import { LaserTowerConfig } from './weapons/LaserTowerConfig';

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
      baseCost: RocketTowerConfig.BASE_COST,
      upgradeCost: RocketTowerConfig.UPGRADE_COST,
      sellGain: RocketTowerConfig.SELL_GAIN,
      colorHex: 0x9d00ff,
    }],
    [WeaponType.LASER, {
      id: 'laser',
      name: '激光塔',
      icon: '⚡',
      description: '持续射线\n高射速攻击',
      baseCost: LaserTowerConfig.BASE_COST,
      upgradeCost: LaserTowerConfig.UPGRADE_COST,
      sellGain: LaserTowerConfig.SELL_GAIN,
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

