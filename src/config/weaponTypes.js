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
 * 包括武器的ID、名称、图标、描述、成本、颜色等元数据
 */
export const WEAPON_TYPES = {
  ROCKET: {
    id: 'rocket',
    name: '火箭塔',
    icon: '🚀',
    description: '追踪火箭\n高爆溅射伤害',
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
    description: '持续射线\n高射速攻击',
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
 * 提供武器配置相关的查询和计算功能
 */
export class WeaponConfig {
  /**
   * 根据武器实例获取对应的配置
   * @param {Object} weapon - 武器实例
   * @returns {Object} 武器配置对象
   */
  static getConfigByInstance(weapon) {
    const className = weapon.constructor.name;
    if (className === 'RocketTower') return WEAPON_TYPES.ROCKET;
    if (className === 'LaserTower') return WEAPON_TYPES.LASER;
    return WEAPON_TYPES.ROCKET; // 默认返回火箭塔配置
  }

  /**
   * 根据类型ID获取武器配置
   * @param {string} typeId - 武器类型ID（如 'rocket', 'laser'）
   * @returns {Object} 武器配置对象
   */
  static getConfigById(typeId) {
    return Object.values(WEAPON_TYPES).find(t => t.id === typeId) || WEAPON_TYPES.ROCKET;
  }

  /**
   * 计算武器放置成本
   * 成本会随等级线性增长
   * @param {string} typeId - 武器类型ID
   * @param {number} level - 武器等级（默认为1）
   * @returns {number} 放置成本
   */
  static getPlacementCost(typeId, level = 1) {
    const config = this.getConfigById(typeId);
    return level * config.baseCost;
  }

  /**
   * 计算武器升级成本
   * 升级成本随当前等级增加
   * @param {Object} weapon - 武器实例
   * @returns {number} 升级所需金币
   */
  static getUpgradeCost(weapon) {
    const config = this.getConfigByInstance(weapon);
    const level = weapon.level ?? 1;
    return level * config.upgradeCost;
  }

  /**
   * 计算武器出售收益
   * 出售价格随等级增加
   * @param {Object} weapon - 武器实例
   * @returns {number} 出售可获得的金币
   */
  static getSellGain(weapon) {
    const config = this.getConfigByInstance(weapon);
    const level = weapon.level ?? 1;
    return level * config.sellGain;
  }

  /**
   * 获取所有武器类型配置
   * @returns {Array} 武器配置数组
   */
  static getAllTypes() {
    return Object.values(WEAPON_TYPES);
  }
}

