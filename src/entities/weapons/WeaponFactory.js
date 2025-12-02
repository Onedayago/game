import { RocketTower } from './rocketTower';
import { LaserTower } from './laserTower';

/**
 * 武器工厂类
 * 统一管理武器实例的创建逻辑
 */
export class WeaponFactory {
  /**
   * 创建武器实例
   * @param {string} type - 武器类型 ('rocket' | 'laser')
   * @param {Object} app - PixiJS应用实例
   * @param {number} col - 网格列
   * @param {number} row - 网格行
   * @param {number} x - 世界坐标X
   * @param {number} y - 世界坐标Y
   * @returns {BaseWeapon} 武器实例
   */
  static create(type, app, col, row, x, y) {
    switch (type) {
      case 'laser':
        return new LaserTower(app, col, row, x, y);
      case 'rocket':
      default:
        return new RocketTower(app, col, row, x, y);
    }
  }

  /**
   * 批量创建武器
   * @param {Array} weaponConfigs - 武器配置数组
   * @param {Object} app - PixiJS应用实例
   * @returns {Array} 武器实例数组
   */
  static createBatch(weaponConfigs, app) {
    return weaponConfigs.map(config => 
      this.create(config.type, app, config.col, config.row, config.x, config.y)
    );
  }
}

