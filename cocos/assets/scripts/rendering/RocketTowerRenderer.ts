/**
 * 火箭塔渲染器
 * 负责火箭塔的视觉绘制
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
 * 火箭塔渲染器
 */
export class RocketTowerRenderer {
    /**
     * 渲染火箭塔
     * @param node 目标节点
     * @param config 渲染配置
     * @param customSize 自定义尺寸（可选，默认使用 WEAPON_MAP_SIZE_RATIO）
     */
    static renderRocketTower(node: Node, config: WeaponRenderConfig, customSize?: number): Graphics | null {
        const graphics = node.addComponent(Graphics);
        if (!graphics) return null;
        
        // 如果没有传入 customSize，使用武器在战场上的实际尺寸
        const size = customSize || (GameConfig.CELL_SIZE * UIConfig.WEAPON_MAP_SIZE_RATIO);
        const baseWidth = size * 0.7;
        const baseHeight = size * 0.3;
        const towerWidth = size * 0.34;
        const towerHeight = size * 0.9;
        
        graphics.clear();
        
        // 获取颜色
        const baseColor = ColorCache.get(GameColors.ROCKET_BASE);
        const towerColor = ColorCache.get(GameColors.ROCKET_TOWER);
        const detailColor = ColorCache.get(GameColors.ROCKET_DETAIL);
        
        // 1. 绘制多层阴影（增强立体感）
        this.drawShadowLayers(graphics, baseWidth, baseHeight, towerWidth, towerHeight);
        
        // 2. 绘制底座
        this.drawRocketBase(graphics, baseColor, detailColor, baseWidth, baseHeight);
        
        // 3. 绘制塔身
        this.drawRocketTower(graphics, towerColor, detailColor, towerWidth, towerHeight);
        
        // 4. 绘制发射轨道
        this.drawLaunchRails(graphics, detailColor, size);
        
        // 5. 绘制火箭弹头
        this.drawRocketWarhead(graphics, towerColor, detailColor, size);
        
        return graphics;
    }
    
    /**
     * 绘制火箭塔阴影层（多层阴影，参考原游戏）
     */
    private static drawShadowLayers(
        graphics: Graphics,
        baseWidth: number,
        baseHeight: number,
        towerWidth: number,
        towerHeight: number
    ): void {
        const size = baseWidth / 0.7; // 反推原始尺寸
        
        // 第一层阴影（主阴影）
        graphics.fillColor = new Color(0, 0, 0, 89); // alpha: 0.35
        graphics.roundRect(
            -baseWidth / 2,
            -size / 2 + 8 * (size / 64),
            baseWidth,
            size - 10 * (size / 64),
            size * 0.18
        );
        graphics.fill();
        
        // 第二层阴影（次阴影）
        graphics.fillColor = new Color(0, 0, 0, 38); // alpha: 0.15
        graphics.roundRect(
            -baseWidth / 2 + 4 * (size / 64),
            -size / 2 + 10 * (size / 64),
            baseWidth - 8 * (size / 64),
            size - 14 * (size / 64),
            size * 0.15
        );
        graphics.fill();
    }
    
    /**
     * 绘制火箭底座（参考原游戏设计）
     */
    private static drawRocketBase(
        graphics: Graphics,
        baseColor: any,
        detailColor: any,
        baseWidth: number,
        baseHeight: number
    ): void {
        const size = baseWidth / 0.7; // 反推原始尺寸
        
        // 主底座
        graphics.fillColor = new Color(31, 41, 55, 255); // 0x1f2937
        graphics.roundRect(
            -baseWidth / 2,
            size / 2 - baseHeight,
            baseWidth,
            baseHeight,
            baseHeight * 0.6
        );
        graphics.fill();
        
        // 边框
        graphics.lineWidth = 2.5;
        graphics.strokeColor = new Color(15, 23, 42, 255); // 0x0f172a
        graphics.roundRect(
            -baseWidth / 2,
            size / 2 - baseHeight,
            baseWidth,
            baseHeight,
            baseHeight * 0.6
        );
        graphics.stroke();
        
        // 底座内部装饰
        graphics.fillColor = new Color(71, 85, 105, 242); // 0x475569, alpha: 0.95
        graphics.roundRect(
            -baseWidth / 2 + 6 * (size / 64),
            size / 2 - baseHeight * 0.75,
            baseWidth - 12 * (size / 64),
            baseHeight * 0.45,
            baseHeight * 0.25
        );
        graphics.fill();
        graphics.lineWidth = 1;
        graphics.strokeColor = new Color(detailColor.r, detailColor.g, detailColor.b, 77); // alpha: 0.3
        graphics.roundRect(
            -baseWidth / 2 + 6 * (size / 64),
            size / 2 - baseHeight * 0.75,
            baseWidth - 12 * (size / 64),
            baseHeight * 0.45,
            baseHeight * 0.25
        );
        graphics.stroke();
        
        // 底座装甲条纹（4条，参考原游戏）
        const stripeWidth = baseWidth / 5;
        for (let i = 0; i < 4; i++) {
            const sx = -baseWidth / 2 + 6 * (size / 64) + i * stripeWidth;
            const color = i % 2 === 0 ? detailColor : new Color(17, 24, 39, 255); // 0x111827
            graphics.fillColor = new Color(color.r || 17, color.g || 24, color.b || 39, 230); // alpha: 0.9
            graphics.roundRect(
                sx,
                size / 2 - baseHeight * 0.7,
                stripeWidth * 0.5,
                baseHeight * 0.4,
                stripeWidth * 0.2
            );
            graphics.fill();
            graphics.lineWidth = 0.5;
            graphics.strokeColor = new Color(0, 0, 0, 128); // alpha: 0.5
            graphics.roundRect(
                sx,
                size / 2 - baseHeight * 0.7,
                stripeWidth * 0.5,
                baseHeight * 0.4,
                stripeWidth * 0.2
            );
            graphics.stroke();
        }
    }
    
    /**
     * 绘制火箭塔身（参考原游戏设计）
     */
    private static drawRocketTower(
        graphics: Graphics,
        towerColor: any,
        detailColor: any,
        towerWidth: number,
        towerHeight: number
    ): void {
        const size = towerWidth / 0.34; // 反推原始尺寸
        const allyBodyColor = ColorCache.get(GameColors.ALLY_BODY);
        
        // 外层光晕（多层结构）
        graphics.fillColor = new Color(detailColor.r, detailColor.g, detailColor.b, 38); // alpha: 0.15
        graphics.roundRect(
            -towerWidth / 2 - 2 * (size / 64),
            -towerHeight / 2 - 2 * (size / 64),
            towerWidth + 4 * (size / 64),
            towerHeight + 4 * (size / 64),
            towerWidth * 0.5
        );
        graphics.fill();
        
        // 主塔身
        graphics.fillColor = new Color(51, 65, 85, 255); // 0x334155
        graphics.roundRect(
            -towerWidth / 2,
            -towerHeight / 2,
            towerWidth,
            towerHeight,
            towerWidth * 0.5
        );
        graphics.fill();
        
        // 边框
        graphics.lineWidth = 2.5;
        graphics.strokeColor = new Color(allyBodyColor.r, allyBodyColor.g, allyBodyColor.b, 255);
        graphics.roundRect(
            -towerWidth / 2,
            -towerHeight / 2,
            towerWidth,
            towerHeight,
            towerWidth * 0.5
        );
        graphics.stroke();
        
        // 塔身高光
        graphics.fillColor = new Color(71, 85, 105, 77); // 0x475569, alpha: 0.3
        graphics.roundRect(
            -towerWidth / 2 + 3 * (size / 64),
            -towerHeight / 2 + 3 * (size / 64),
            towerWidth - 6 * (size / 64),
            towerHeight * 0.25,
            towerWidth * 0.4
        );
        graphics.fill();
        
        // 观察窗（3个，带辉光）
        const windowWidth = towerWidth * 0.28;
        const windowHeight = towerHeight * 0.16;
        const allyDetailColor = ColorCache.get(GameColors.ALLY_DETAIL);
        
        for (let i = 0; i < 3; i++) {
            const wy = -towerHeight * 0.3 + i * windowHeight * 1.25;
            
            // 外层辉光
            graphics.fillColor = new Color(allyDetailColor.r, allyDetailColor.g, allyDetailColor.b, 51); // alpha: 0.2
            graphics.roundRect(
                -windowWidth / 2 - 1,
                wy - 1,
                windowWidth + 2,
                windowHeight + 2,
                windowHeight * 0.5
            );
            graphics.fill();
            
            // 窗口主体
            graphics.fillColor = new Color(allyDetailColor.r, allyDetailColor.g, allyDetailColor.b, 242); // alpha: 0.95
            graphics.roundRect(
                -windowWidth / 2,
                wy,
                windowWidth,
                windowHeight,
                windowHeight * 0.4
            );
            graphics.fill();
            
            // 窗口边框
            graphics.lineWidth = 1;
            graphics.strokeColor = new Color(14, 165, 233, 204); // 0x0ea5e9, alpha: 0.8
            graphics.roundRect(
                -windowWidth / 2,
                wy,
                windowWidth,
                windowHeight,
                windowHeight * 0.4
            );
            graphics.stroke();
        }
        
        // 侧翼装甲（左右尾翼）
        const finWidth = towerWidth * 0.28;
        const finHeight = towerHeight * 0.45;
        const finOffsetX = towerWidth * 0.75;
        
        // 左尾翼
        graphics.fillColor = new Color(detailColor.r, detailColor.g, detailColor.b, 242); // alpha: 0.95
        graphics.roundRect(
            -finOffsetX - finWidth / 2,
            -finHeight / 2,
            finWidth,
            finHeight,
            finWidth * 0.5
        );
        graphics.fill();
        graphics.lineWidth = 1.5;
        graphics.strokeColor = new Color(124, 45, 18, 204); // 0x7c2d12, alpha: 0.8
        graphics.roundRect(
            -finOffsetX - finWidth / 2,
            -finHeight / 2,
            finWidth,
            finHeight,
            finWidth * 0.5
        );
        graphics.stroke();
        
        // 右尾翼
        graphics.fillColor = new Color(detailColor.r, detailColor.g, detailColor.b, 242); // alpha: 0.95
        graphics.roundRect(
            finOffsetX - finWidth / 2,
            -finHeight / 2,
            finWidth,
            finHeight,
            finWidth * 0.5
        );
        graphics.fill();
        graphics.lineWidth = 1.5;
        graphics.strokeColor = new Color(124, 45, 18, 204); // 0x7c2d12, alpha: 0.8
        graphics.roundRect(
            finOffsetX - finWidth / 2,
            -finHeight / 2,
            finWidth,
            finHeight,
            finWidth * 0.5
        );
        graphics.stroke();
    }
    
    /**
     * 绘制发射轨道（参考原游戏设计）
     */
    private static drawLaunchRails(graphics: Graphics, detailColor: any, size: number): void {
        const towerWidth = size * 0.34;
        const towerHeight = size * 0.9;
        
        // 发射导轨（深色矩形）
        graphics.fillColor = new Color(15, 23, 42, 255); // 0x0f172a
        graphics.roundRect(
            -towerWidth * 0.7,
            -towerHeight * 0.05,
            towerWidth * 1.4,
            towerHeight * 0.22,
            towerHeight * 0.08
        );
        graphics.fill();
        
        // 导轨边框
        graphics.lineWidth = 1;
        graphics.strokeColor = new Color(51, 65, 85, 153); // 0x334155, alpha: 0.6
        graphics.roundRect(
            -towerWidth * 0.7,
            -towerHeight * 0.05,
            towerWidth * 1.4,
            towerHeight * 0.22,
            towerHeight * 0.08
        );
        graphics.stroke();
    }
    
    /**
     * 绘制火箭弹头（参考原游戏设计）
     */
    private static drawRocketWarhead(graphics: Graphics, towerColor: any, detailColor: any, size: number): void {
        const towerWidth = size * 0.34;
        const towerHeight = size * 0.9;
        const rocketBulletColor = ColorCache.get(GameColors.ROCKET_BULLET);
        
        // 弹头主体（圆角矩形）
        graphics.fillColor = new Color(rocketBulletColor.r, rocketBulletColor.g, rocketBulletColor.b, 255);
        graphics.roundRect(
            -towerWidth * 0.26,
            -towerHeight * 0.44,
            towerWidth * 0.52,
            towerHeight * 0.38,
            towerWidth * 0.26
        );
        graphics.fill();
        
        // 弹头边框
        graphics.lineWidth = 1.5;
        graphics.strokeColor = new Color(towerColor.r, towerColor.g, towerColor.b, 204); // alpha: 0.8
        graphics.roundRect(
            -towerWidth * 0.26,
            -towerHeight * 0.44,
            towerWidth * 0.52,
            towerHeight * 0.38,
            towerWidth * 0.26
        );
        graphics.stroke();
        
        // 弹头条纹（2条黑色条纹）
        graphics.fillColor = new Color(0, 0, 0, 102); // alpha: 0.4
        graphics.rect(
            -towerWidth * 0.22,
            -towerHeight * 0.35,
            towerWidth * 0.44,
            2 * (size / 64)
        );
        graphics.fill();
        graphics.rect(
            -towerWidth * 0.22,
            -towerHeight * 0.25,
            towerWidth * 0.44,
            2 * (size / 64)
        );
        graphics.fill();
        
        // 顶部雷达/天线（多层光环）
        const radarY = -towerHeight * 0.52;
        const radarY2 = -towerHeight * 0.6;
        
        // 第一层光环
        graphics.fillColor = new Color(detailColor.r, detailColor.g, detailColor.b, 38); // alpha: 0.15
        graphics.circle(0, radarY, towerWidth * 0.28);
        graphics.fill();
        
        // 第二层光环
        graphics.fillColor = new Color(254, 243, 199, 242); // 0xfef3c7, alpha: 0.95
        graphics.circle(0, radarY, towerWidth * 0.22);
        graphics.fill();
        graphics.lineWidth = 1;
        graphics.strokeColor = new Color(towerColor.r, towerColor.g, towerColor.b, 153); // alpha: 0.6
        graphics.circle(0, radarY, towerWidth * 0.22);
        graphics.stroke();
        
        // 第三层光环
        graphics.fillColor = new Color(detailColor.r, detailColor.g, detailColor.b, 77); // alpha: 0.3
        graphics.circle(0, radarY2, towerWidth * 0.14);
        graphics.fill();
        graphics.fillColor = new Color(254, 240, 138, 242); // 0xfef08a, alpha: 0.95
        graphics.circle(0, radarY2, towerWidth * 0.12);
        graphics.fill();
        
        // 核心点
        graphics.fillColor = new Color(255, 255, 255, 204); // alpha: 0.8
        graphics.circle(0, radarY2, towerWidth * 0.06);
        graphics.fill();
    }
}

