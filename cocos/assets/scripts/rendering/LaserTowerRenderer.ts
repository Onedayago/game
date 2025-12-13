/**
 * 激光塔渲染器
 * 负责激光塔的视觉绘制
 */

import { Node, Graphics, Color } from 'cc';
import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';
import { ColorCache, GameColors } from '../config/Colors';

/**
 * 武器渲染配置
 */
interface WeaponRenderConfig {
    level: number;
    selected?: boolean;
}

/**
 * 激光塔渲染器
 */
export class LaserTowerRenderer {
    /**
     * 渲染激光塔
     * @param node 目标节点
     * @param config 渲染配置
     * @param customSize 自定义尺寸（可选，默认使用 WEAPON_MAP_SIZE_RATIO）
     */
    static renderLaserTower(node: Node, config: WeaponRenderConfig, customSize?: number): Graphics | null {
        const graphics = node.addComponent(Graphics);
        if (!graphics) return null;
        
        // 如果没有传入 customSize，使用武器在战场上的实际尺寸
        const size = customSize || (GameConfig.CELL_SIZE * UIConfig.WEAPON_MAP_SIZE_RATIO);
        const towerRadius = size * 0.20;
        const coreRadius = size * 0.12;
        
        graphics.clear();
        
        // 获取颜色
        const laserColor = ColorCache.get(GameColors.LASER_BASE);
        const beamColor = ColorCache.get(GameColors.LASER_BEAM);
        const detailColor = ColorCache.get(GameColors.LASER_DETAIL);
        
        // 1. 绘制阴影
        this.drawLaserShadow(graphics, size, towerRadius);
        
        // 2. 绘制六边形基座
        this.drawHexagonBase(graphics, laserColor, detailColor, size);
        
        // 3. 绘制能量线
        this.drawEnergyLines(graphics, beamColor, detailColor, size);
        
        // 4. 绘制能量核心
        this.drawEnergyCore(graphics, beamColor, detailColor, coreRadius, size);
        
        // 5. 绘制外圈装饰
        this.drawOuterRing(graphics, laserColor, size);
        
        return graphics;
    }
    
    /**
     * 绘制激光塔阴影（参考原游戏设计）
     */
    private static drawLaserShadow(graphics: Graphics, size: number, towerRadius: number): void {
        // 底部阴影
        graphics.fillColor = new Color(0, 0, 0, 89); // alpha: 0.35
        graphics.roundRect(
            -size / 2 + 4,
            -size / 2 + 6,
            size - 8,
            size - 4,
            towerRadius
        );
        graphics.fill();
    }
    
    /**
     * 绘制六边形基座（参考原游戏设计）
     */
    private static drawHexagonBase(
        graphics: Graphics,
        laserColor: any,
        detailColor: any,
        size: number
    ): void {
        const baseSize = size * 0.5;  // 调整为 0.5，使基座直径与武器尺寸一致，视觉更协调
        const hexPoints: number[] = [];
        
        // 生成外层六边形顶点
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            hexPoints.push(Math.cos(angle) * baseSize);
            hexPoints.push(Math.sin(angle) * baseSize);
        }
        
        // 主六边形基座
        graphics.fillColor = new Color(laserColor.r, laserColor.g, laserColor.b, 230); // alpha: 0.9
        graphics.moveTo(hexPoints[0], hexPoints[1]);
        for (let i = 2; i < hexPoints.length; i += 2) {
            graphics.lineTo(hexPoints[i], hexPoints[i + 1]);
        }
        graphics.close();
        graphics.fill();
        
        // 边框
        graphics.lineWidth = 2;
        graphics.strokeColor = new Color(detailColor.r, detailColor.g, detailColor.b, 179); // alpha: 0.7
        graphics.moveTo(hexPoints[0], hexPoints[1]);
        for (let i = 2; i < hexPoints.length; i += 2) {
            graphics.lineTo(hexPoints[i], hexPoints[i + 1]);
        }
        graphics.close();
        graphics.stroke();
        
        // 内层六边形装饰（旋转30度）
        const innerHexPoints: number[] = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i + Math.PI / 6;
            innerHexPoints.push(Math.cos(angle) * baseSize * 0.6);
            innerHexPoints.push(Math.sin(angle) * baseSize * 0.6);
        }
        
        graphics.fillColor = new Color(10, 26, 15, 204); // 0x0a1a0f, alpha: 0.8
        graphics.moveTo(innerHexPoints[0], innerHexPoints[1]);
        for (let i = 2; i < innerHexPoints.length; i += 2) {
            graphics.lineTo(innerHexPoints[i], innerHexPoints[i + 1]);
        }
        graphics.close();
        graphics.fill();
        
        graphics.lineWidth = 1;
        graphics.strokeColor = new Color(detailColor.r, detailColor.g, detailColor.b, 128); // alpha: 0.5
        graphics.moveTo(innerHexPoints[0], innerHexPoints[1]);
        for (let i = 2; i < innerHexPoints.length; i += 2) {
            graphics.lineTo(innerHexPoints[i], innerHexPoints[i + 1]);
        }
        graphics.close();
        graphics.stroke();
    }
    
    /**
     * 绘制能量线（参考原游戏设计，改为4个发射器）
     */
    private static drawEnergyLines(
        graphics: Graphics,
        beamColor: any,
        detailColor: any,
        size: number
    ): void {
        const baseSize = size * 0.5;  // 调整为 0.5，使基座直径与武器尺寸一致，视觉更协调
        const emitterDist = baseSize * 0.85;
        
        // 激光发射器（4个小圆柱，参考原游戏）
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI / 2) * i;
            const emitX = Math.cos(angle) * emitterDist;
            const emitY = Math.sin(angle) * emitterDist;
            const emitterWidth = 4 * (size / 64);
            const emitterHeight = 8 * (size / 64);
            
            graphics.fillColor = new Color(beamColor.r, beamColor.g, beamColor.b, 179); // alpha: 0.7
            graphics.roundRect(
                emitX - emitterWidth / 2,
                emitY - emitterHeight / 2,
                emitterWidth,
                emitterHeight,
                2 * (size / 64)
            );
            graphics.fill();
        }
    }
    
    /**
     * 绘制能量核心（参考原游戏设计）
     */
    private static drawEnergyCore(
        graphics: Graphics,
        beamColor: any,
        detailColor: any,
        coreRadius: number,
        size: number
    ): void {
        // 外层发光
        graphics.fillColor = new Color(detailColor.r, detailColor.g, detailColor.b, 77); // alpha: 0.3
        graphics.circle(0, 0, coreRadius * 1.6);
        graphics.fill();
        
        // 中层发光
        graphics.fillColor = new Color(detailColor.r, detailColor.g, detailColor.b, 128); // alpha: 0.5
        graphics.circle(0, 0, coreRadius * 1.2);
        graphics.fill();
        
        // 核心
        graphics.fillColor = new Color(beamColor.r, beamColor.g, beamColor.b, 242); // alpha: 0.95
        graphics.circle(0, 0, coreRadius);
        graphics.fill();
        
        // 顶部霓虹细节点（6个小光点，参考原游戏）
        const baseSize = size * 0.5;  // 调整为 0.5，使基座直径与武器尺寸一致，视觉更协调
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const dotX = Math.cos(angle) * baseSize * 0.75;
            const dotY = Math.sin(angle) * baseSize * 0.75;
            graphics.fillColor = new Color(detailColor.r, detailColor.g, detailColor.b, 204); // alpha: 0.8
            graphics.circle(dotX, dotY, 3 * (size / 64));
            graphics.fill();
        }
    }
    
    /**
     * 绘制外圈装饰（参考原游戏设计，两个圆环）
     */
    private static drawOuterRing(graphics: Graphics, laserColor: any, size: number): void {
        // 底盘装饰线（两个圆环）
        graphics.lineWidth = 1;
        graphics.strokeColor = new Color(laserColor.r, laserColor.g, laserColor.b, 102); // alpha: 0.4
        graphics.circle(0, 0, size * 0.48);
        graphics.stroke();
        
        graphics.strokeColor = new Color(laserColor.r, laserColor.g, laserColor.b, 77); // alpha: 0.3
        graphics.circle(0, 0, size * 0.42);
        graphics.stroke();
    }
}

