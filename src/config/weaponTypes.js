import { COLORS } from './colors';
import { 
  WEAPON_BASE_COST, 
  WEAPON_UPGRADE_BASE_COST, 
  WEAPON_SELL_BASE_GAIN,
  ROCKET_BASE_COST,
  ROCKET_UPGRADE_BASE_COST,
  ROCKET_SELL_BASE_GAIN,
  LASER_BASE_COST,
  LASER_UPGRADE_BASE_COST,
  LASER_SELL_BASE_GAIN,
} from './gameplay';

/**
 * 武器类型配置
 * 统一管理所有武器的基础配置信息
 */
export const WEAPON_TYPES = {
  ROCKET: {
    id: 'rocket',
    name: '火箭塔',
    icon: '🚀',
    description: '🚀 追踪火箭·高爆溅射\n有效打击集群敌人',
    baseCost: ROCKET_BASE_COST,
    upgradeCost: ROCKET_UPGRADE_BASE_COST,
    sellGain: ROCKET_SELL_BASE_GAIN,
    color: COLORS.ROCKET_BODY,
    detailColor: COLORS.ROCKET_DETAIL,
    darkColor: 0x1a0a29,
  },
  LASER: {
    id: 'laser',
    name: '激光塔',
    icon: '⚡',
    description: '⚡ 激光塔·持续射线\n高射速远距离攻击',
    baseCost: LASER_BASE_COST,
    upgradeCost: LASER_UPGRADE_BASE_COST,
    sellGain: LASER_SELL_BASE_GAIN,
    color: COLORS.LASER_BODY,
    detailColor: COLORS.LASER_DETAIL,
    darkColor: 0x0a1a0f,
  },
};

/**
 * 武器配置工具类
 */
export class WeaponConfig {
  /**
   * 根据武器实例获取配置
   */
  static getConfigByInstance(weapon) {
    const className = weapon.constructor.name;
    if (className === 'RocketTower') return WEAPON_TYPES.ROCKET;
    if (className === 'LaserTower') return WEAPON_TYPES.LASER;
    return WEAPON_TYPES.ROCKET; // 默认返回火箭塔
  }

  /**
   * 根据类型ID获取配置
   */
  static getConfigById(typeId) {
    return Object.values(WEAPON_TYPES).find(t => t.id === typeId) || WEAPON_TYPES.ROCKET;
  }

  /**
   * 计算武器放置成本
   */
  static getPlacementCost(typeId, level = 1) {
    const config = this.getConfigById(typeId);
    return level * config.baseCost;
  }

  /**
   * 计算武器升级成本
   */
  static getUpgradeCost(weapon) {
    const config = this.getConfigByInstance(weapon);
    const level = weapon.level ?? 1;
    return level * config.upgradeCost;
  }

  /**
   * 计算武器出售收益
   */
  static getSellGain(weapon) {
    const config = this.getConfigByInstance(weapon);
    const level = weapon.level ?? 1;
    return level * config.sellGain;
  }

  /**
   * 获取所有武器类型
   */
  static getAllTypes() {
    return Object.values(WEAPON_TYPES);
  }
}

