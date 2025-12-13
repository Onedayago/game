/**
 * 血条渲染器
 * 负责实体（武器、敌人）的血条绘制和更新
 */

import { Node, Graphics, Color } from 'cc';
import { GameConfig } from '../config/GameConfig';
import { ColorCache, GameColors } from '../config/Colors';

/**
 * 血条配置
 */
export interface HealthBarConfig {
    hp: number;
    maxHp: number;
    entitySize: number;  // 实体尺寸（用于计算血条大小和位置）
    offsetY?: number;    // Y偏移（默认 entitySize * 0.75）
    barWidthRatio?: number;  // 血条宽度比例（默认 0.9）
    normalColor: number;     // 正常血量颜色
    warningColor?: number;   // 警告血量颜色（默认 0xfbbf24 琥珀色）
    dangerColor?: number;    // 危险血量颜色（默认使用 GameColors.DANGER）
}

/**
 * 血条渲染器
 */
export class HealthBarRenderer {
    /**
     * 渲染血条（背景和前景）
     * @param parentNode 父节点（通常是 world 节点）
     * @param config 血条配置
     * @returns 返回包含 bg 和 fill 节点的对象
     */
    static renderHealthBar(parentNode: Node, config: HealthBarConfig): { bg: Node; fill: Node } {
        const barWidth = config.entitySize * (config.barWidthRatio || 0.9);
        const barHeight = 6 * (config.entitySize / 64);
        const offsetY = config.offsetY !== undefined ? config.offsetY : config.entitySize * 0.75;
        const borderRadius = 3 * (config.entitySize / 64);
        const ratio = Math.max(config.hp / config.maxHp, 0);
        
        // 创建背景条节点
        const bgNode = new Node('HealthBarBg');
        const bgGraphics = bgNode.addComponent(Graphics);
        bgNode.layer = parentNode.layer;
        bgNode.active = true;  // 确保节点激活
        
        if (bgGraphics) {
            bgGraphics.clear();
            // 外层黑色边框
            bgGraphics.fillColor = new Color(0, 0, 0, 153); // alpha 0.6
            bgGraphics.roundRect(-barWidth / 2 - 1, -barHeight / 2 - 1, barWidth + 2, barHeight + 2, borderRadius + 1);
            bgGraphics.fill();
            
            // 内层背景
            const uiBgColor = ColorCache.get(GameColors.UI_BG, 204); // alpha 0.8
            bgGraphics.fillColor = uiBgColor;
            bgGraphics.roundRect(-barWidth / 2, -barHeight / 2, barWidth, barHeight, borderRadius);
            bgGraphics.fill();
            
            // 边框
            bgGraphics.lineWidth = 1;
            const borderColor = ColorCache.get(GameColors.UI_BORDER, 128); // alpha 0.5
            bgGraphics.strokeColor = borderColor;
            bgGraphics.roundRect(-barWidth / 2, -barHeight / 2, barWidth, barHeight, borderRadius);
            bgGraphics.stroke();
        }
        
        // 创建前景条节点
        const fillNode = new Node('HealthBarFill');
        const fillGraphics = fillNode.addComponent(Graphics);
        fillNode.layer = parentNode.layer;
        fillNode.active = true;  // 确保节点激活
        
        if (fillGraphics && ratio > 0) {
            fillGraphics.clear();
            
            // 根据血量比例选择颜色
            let hpColor: number;
            if (ratio <= 0.3) {
                hpColor = config.dangerColor || GameColors.DANGER;
            } else if (ratio <= 0.6) {
                hpColor = config.warningColor || 0xfbbf24; // 琥珀色
            } else {
                hpColor = config.normalColor;
            }
            
            // 前景条
            const fillColor = ColorCache.get(hpColor, 242); // alpha 0.95
            fillGraphics.fillColor = fillColor;
            fillGraphics.roundRect(-barWidth / 2, -barHeight / 2, barWidth * ratio, barHeight, borderRadius);
            fillGraphics.fill();
            
            // 高光效果（上方 40% 区域）
            fillGraphics.fillColor = new Color(255, 255, 255, 51); // alpha 0.2
            fillGraphics.roundRect(-barWidth / 2, -barHeight / 2, barWidth * ratio, barHeight * 0.4, borderRadius);
            fillGraphics.fill();
        }
        
        // 注意：血条位置需要在外部通过 updateHealthBar 设置
        // 这里先设置一个初始位置（会在 updateHealthBar 中更新）
        bgNode.setPosition(0, 0, 0);
        fillNode.setPosition(0, 0, 0);
        
        // 添加到父节点
        parentNode.addChild(bgNode);
        parentNode.addChild(fillNode);
        
        return { bg: bgNode, fill: fillNode };
    }
    
    /**
     * 更新血条（更新前景条的长度和颜色）
     * @param fillNode 前景条节点
     * @param config 血条配置
     */
    static updateHealthBar(fillNode: Node, config: HealthBarConfig): void {
        const graphics = fillNode.getComponent(Graphics);
        if (!graphics) return;
        
        const barWidth = config.entitySize * (config.barWidthRatio || 0.9);
        const barHeight = 6 * (config.entitySize / 64);
        const borderRadius = 3 * (config.entitySize / 64);
        const ratio = Math.max(config.hp / config.maxHp, 0);
        
        graphics.clear();
        
        if (ratio > 0) {
            // 根据血量比例选择颜色
            let hpColor: number;
            if (ratio <= 0.3) {
                hpColor = config.dangerColor || GameColors.DANGER;
            } else if (ratio <= 0.6) {
                hpColor = config.warningColor || 0xfbbf24; // 琥珀色
            } else {
                hpColor = config.normalColor;
            }
            
            // 前景条
            const fillColor = ColorCache.get(hpColor, 242); // alpha 0.95
            graphics.fillColor = fillColor;
            graphics.roundRect(-barWidth / 2, -barHeight / 2, barWidth * ratio, barHeight, borderRadius);
            graphics.fill();
            
            // 高光效果（上方 40% 区域）
            graphics.fillColor = new Color(255, 255, 255, 51); // alpha 0.2
            graphics.roundRect(-barWidth / 2, -barHeight / 2, barWidth * ratio, barHeight * 0.4, borderRadius);
            graphics.fill();
        }
    }
}

