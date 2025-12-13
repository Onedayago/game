/**
 * 武器渲染器
 * 统一管理所有武器的视觉绘制，将绘制逻辑从武器类中分离出来
 * 
 * 注意：此文件已重构，具体渲染逻辑已拆分到各个子渲染器中：
 * - RocketTowerRenderer: 火箭塔渲染
 * - LaserTowerRenderer: 激光塔渲染
 * - ProjectileRenderer: 抛射物渲染（激光束、火箭等）
 * - HealthBarRenderer: 血条渲染
 */

import { Node, Graphics, Color } from 'cc';
import { GameConfig } from '../config/GameConfig';
import { WeaponType } from '../config/WeaponConfig';
import { ColorCache, GameColors } from '../config/Colors';
import { RocketTowerRenderer } from './RocketTowerRenderer';
import { LaserTowerRenderer } from './LaserTowerRenderer';
import { ProjectileRenderer, LaserBeamConfig } from './ProjectileRenderer';
import { HealthBarRenderer, HealthBarConfig } from './HealthBarRenderer';

/**
 * 武器渲染配置
 */
interface WeaponRenderConfig {
    level: number;
    selected?: boolean;
}

/**
 * 武器图标配置
 */
interface WeaponIconConfig {
    size: number;
    isGhost?: boolean;  // 是否为拖拽时的幽灵图标
}

/**
 * 武器渲染器 - 负责所有武器的视觉绘制
 * 作为统一入口，调用各个子渲染器
 */
export class WeaponRenderer {
    /**
     * 渲染选中光环
     */
    static renderSelectionRing(node: Node, radius: number = GameConfig.CELL_SIZE * 0.7): Node {
        const ringNode = new Node('SelectionRing');
        const graphics = ringNode.addComponent(Graphics);
        
        if (graphics) {
            // 多层霓虹光晕效果
            const borderColor = ColorCache.get(GameColors.UI_BORDER);
            
            // 外层发光
            graphics.lineWidth = 6;
            graphics.strokeColor = new Color(borderColor.r, borderColor.g, borderColor.b, 51);
            graphics.circle(0, 0, radius * 1.2);
            graphics.stroke();
            
            // 中层
            graphics.lineWidth = 4;
            graphics.strokeColor = new Color(borderColor.r, borderColor.g, borderColor.b, 128);
            graphics.circle(0, 0, radius * 1.05);
            graphics.stroke();
            
            // 主光环
            graphics.lineWidth = 3;
            graphics.strokeColor = new Color(borderColor.r, borderColor.g, borderColor.b, 255);
            graphics.circle(0, 0, radius);
            graphics.stroke();
        }
        
        ringNode.active = false;
        node.addChild(ringNode);
        return ringNode;
    }
    
    /**
     * 渲染火箭塔（委托给 RocketTowerRenderer）
     */
    static renderRocketTower(node: Node, config: WeaponRenderConfig, customSize?: number): Graphics | null {
        return RocketTowerRenderer.renderRocketTower(node, config, customSize);
    }
    
    /**
     * 渲染激光塔（委托给 LaserTowerRenderer）
     */
    static renderLaserTower(node: Node, config: WeaponRenderConfig, customSize?: number): Graphics | null {
        return LaserTowerRenderer.renderLaserTower(node, config, customSize);
    }
    
    /**
     * 渲染激光束（委托给 ProjectileRenderer）
     */
    static renderLaserBeam(parentNode: Node, config: LaserBeamConfig): Node {
        return ProjectileRenderer.renderLaserBeam(parentNode, config);
    }
    
    /**
     * 渲染追踪火箭（委托给 ProjectileRenderer）
     */
    static renderHomingRocket(node: Node, color: number, radius: number): Graphics | null {
        return ProjectileRenderer.renderHomingRocket(node, color, radius);
    }
    
    /**
     * 渲染武器图标（用于 UI 卡片和拖拽）
     * 使用与战场上相同的渲染方法，保持视觉一致性
     */
    static renderWeaponIcon(node: Node, weaponType: WeaponType, config: WeaponIconConfig): Graphics | null {
        // 使用与战场上相同的渲染方法，只是按比例缩小
        // 这样武器容器中的图标和战场上的武器外观完全一致
        if (weaponType === WeaponType.ROCKET) {
            return this.renderRocketTower(node, { level: 1 }, config.size);
        } else if (weaponType === WeaponType.LASER) {
            return this.renderLaserTower(node, { level: 1 }, config.size);
        }
        
        return null;
    }
    
    /**
     * 渲染血条（委托给 HealthBarRenderer）
     */
    static renderHealthBar(parentNode: Node, config: HealthBarConfig): { bg: Node; fill: Node } {
        return HealthBarRenderer.renderHealthBar(parentNode, config);
    }
    
    /**
     * 更新血条（委托给 HealthBarRenderer）
     */
    static updateHealthBar(fillNode: Node, config: HealthBarConfig): void {
        HealthBarRenderer.updateHealthBar(fillNode, config);
    }
}

// 导出类型，供其他模块使用
export type { LaserBeamConfig, HealthBarConfig };
