/**
 * 武器配置
 * 包含武器类型定义和配置数据
 */

import { GameConfig } from './GameConfig';

/**
 * 武器类型定义
 */
export enum WeaponType {
    ROCKET = 'rocket',
    LASER = 'laser',
}

/**
 * 武器类型配置数据
 */
export interface WeaponTypeConfig {
    id: string;
    name: string;
    icon: string;
    description: string;
    baseCost: number;
    upgradeCost: number;
    sellGain: number;
    colorHex: number;
}

/**
 * 武器配置表
 */
export class WeaponConfigs {
    static readonly CONFIGS: Map<WeaponType, WeaponTypeConfig> = new Map([
        [WeaponType.ROCKET, {
            id: 'rocket',
            name: '火箭塔',
            icon: '🚀',
            description: '追踪火箭\\n高爆溅射伤害',
            baseCost: GameConfig.ROCKET_BASE_COST,
            upgradeCost: GameConfig.ROCKET_UPGRADE_COST,
            sellGain: GameConfig.ROCKET_SELL_GAIN,
            colorHex: 0x9d00ff,
        }],
        [WeaponType.LASER, {
            id: 'laser',
            name: '激光塔',
            icon: '⚡',
            description: '持续射线\\n高射速攻击',
            baseCost: GameConfig.LASER_BASE_COST,
            upgradeCost: GameConfig.LASER_UPGRADE_COST,
            sellGain: GameConfig.LASER_SELL_GAIN,
            colorHex: 0x00ff41,
        }],
    ]);
    
    static getConfig(type: WeaponType): WeaponTypeConfig | undefined {
        return this.CONFIGS.get(type);
    }
    
    static getUpgradeCost(type: WeaponType, level: number): number {
        const config = this.getConfig(type);
        return config ? level * config.upgradeCost : 0;
    }
    
    static getSellGain(type: WeaponType, level: number): number {
        const config = this.getConfig(type);
        return config ? level * config.sellGain : 0;
    }
}

