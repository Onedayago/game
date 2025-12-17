/**
 * 武器配置
 */

import { RocketTowerConfig } from './weapons/RocketTowerConfig';
import { LaserTowerConfig } from './weapons/LaserTowerConfig';
import { CannonTowerConfig } from './weapons/CannonTowerConfig';
import { SniperTowerConfig } from './weapons/SniperTowerConfig';

/**
 * 武器类型定义
 */
export const WeaponType = {
  ROCKET: 'rocket',
  LASER: 'laser',
  CANNON: 'cannon',
  SNIPER: 'sniper'
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
    [WeaponType.CANNON, {
      id: 'cannon',
      name: '加农炮',
      icon: '💣',
      description: '直线炮弹\n高爆伤害',
      baseCost: CannonTowerConfig.BASE_COST,
      upgradeCost: CannonTowerConfig.UPGRADE_COST,
      sellGain: CannonTowerConfig.SELL_GAIN,
      colorHex: 0xff8800,
    }],
    [WeaponType.SNIPER, {
      id: 'sniper',
      name: '狙击塔',
      icon: '🎯',
      description: '快速子弹\n超远射程',
      baseCost: SniperTowerConfig.BASE_COST,
      upgradeCost: SniperTowerConfig.UPGRADE_COST,
      sellGain: SniperTowerConfig.SELL_GAIN,
      colorHex: 0x00d4ff,
    }],
  ]);
  
  static getConfig(type) {
    return this.CONFIGS.get(type);
  }
  
  /**
   * 获取升级成本（递增公式：基础成本 * (1 + level * 0.5)）
   * 例如：基础50，1级升2级=75，2级升3级=100，3级升4级=125
   */
  static getUpgradeCost(type, level) {
    const config = this.getConfig(type);
    if (!config) return 0;
    // 使用递增公式：基础成本 * (1 + level * 0.5)
    return Math.floor(config.upgradeCost * (1 + level * 0.5));
  }
  
  /**
   * 获取出售收益（购买成本 + 升级成本的50%）
   */
  static getSellGain(type, level) {
    const config = this.getConfig(type);
    if (!config) return 0;
    // 基础出售收益
    let totalGain = config.sellGain;
    // 累加所有升级成本的50%
    for (let i = 1; i < level; i++) {
      totalGain += Math.floor(this.getUpgradeCost(type, i) * 0.5);
    }
    return totalGain;
  }
}

