/**
 * 抛射物渲染器
 * 负责子弹、火箭、激光束等抛射物的视觉绘制
 */

import { Node, Graphics, Vec3, Color } from 'cc';
import { ColorCache, GameColors } from '../config/Colors';

/**
 * 激光束配置
 */
export interface LaserBeamConfig {
    startPos: Vec3;
    endPos: Vec3;
    duration: number;
    layer?: number;  // 可选：渲染层级，如果不提供则使用父节点的 layer
}

/**
 * 抛射物渲染器
 */
export class ProjectileRenderer {
    /**
     * 渲染激光束
     */
    static renderLaserBeam(parentNode: Node, config: LaserBeamConfig): Node {
        const beamNode = new Node('LaserBeam');
        const graphics = beamNode.addComponent(Graphics);
        
        if (!graphics) {
            return beamNode;
        }
        
        const detailColor = ColorCache.get(GameColors.LASER_DETAIL);
        const beamColor = ColorCache.get(GameColors.LASER_BEAM);
        
        const dist = Vec3.distance(config.startPos, config.endPos);
        if (dist <= 0) {
            return beamNode;
        }
        
        // 计算角度
        // 关键问题：Cocos Creator 的 Y 轴向上，而 PixiJS 的 Y 轴向下
        // 原游戏（PixiJS）：Math.atan2(dy, dx)，其中 dy = target.y - start.y（Y轴向下）
        // Cocos Creator：Math.atan2(dy, dx)，其中 dy = target.y - start.y（Y轴向上）
        // 由于 Y 轴方向相反，我们需要对 dy 取反，以保持与原游戏相同的角度计算
        const dx = config.endPos.x - config.startPos.x;
        const dy = config.endPos.y - config.startPos.y;
        
        // 对 dy 取反，以适配 Y 轴向上的坐标系
        // 这样 Math.atan2(-dy, dx) 的结果会与 PixiJS（Y轴向下）的 Math.atan2(dy, dx) 相同
        const angleRad = Math.atan2(-dy, dx);
        
        graphics.clear();
        
        // 外层光晕
        graphics.lineWidth = 8;
        graphics.strokeColor = new Color(detailColor.r, detailColor.g, detailColor.b, 77);
        graphics.moveTo(0, 0);
        graphics.lineTo(dist, 0);
        graphics.stroke();
        
        // 中层光束
        graphics.lineWidth = 5;
        graphics.strokeColor = new Color(beamColor.r, beamColor.g, beamColor.b, 153);
        graphics.moveTo(0, 0);
        graphics.lineTo(dist, 0);
        graphics.stroke();
        
        // 核心激光
        graphics.lineWidth = 2;
        graphics.strokeColor = new Color(255, 255, 255, 242);
        graphics.moveTo(0, 0);
        graphics.lineTo(dist, 0);
        graphics.stroke();
        
        // 设置位置和旋转
        beamNode.setPosition(config.startPos);
        // 角度转换说明：
        // 1. 我们已经对 dy 取反，所以 Math.atan2(-dy, dx) 的结果与 PixiJS 相同
        // 2. 原游戏（PixiJS）直接使用：beamGraphics.rotation = angle
        // 3. Cocos Creator 的 angle 属性是顺时针旋转的（与 PixiJS 的 rotation 相反）
        // 4. 所以需要取负号：angle = -Math.atan2(-dy, dx) * 180 / Math.PI
        // 5. 转换为角度（度）
        beamNode.angle = -angleRad * 180 / Math.PI;
        
        // 设置 layer（重要！确保激光束在正确的渲染层级）
        if (config.layer !== undefined) {
            beamNode.layer = config.layer;
        } else {
            beamNode.layer = parentNode.layer;
        }
        
        // 确保节点是激活的
        beamNode.active = true;
        
        // 添加到父节点
        parentNode.addChild(beamNode);
        
        return beamNode;
    }
    
    /**
     * 渲染追踪火箭（参考原游戏设计）
     */
    static renderHomingRocket(node: Node, color: number, radius: number): Graphics | null {
        const graphics = node.addComponent(Graphics);
        if (!graphics) return null;
        
        const rocketColor = ColorCache.get(color);
        const rocketBodyColor = ColorCache.get(GameColors.ROCKET_BODY);
        const rocketDetailColor = ColorCache.get(GameColors.ROCKET_DETAIL);
        
        graphics.clear();
        
        // 计算尺寸
        const length = radius * 4.2;         // 火箭长度
        const bodyWidth = radius * 1.4;      // 弹体宽度
        const finWidth = bodyWidth * 0.6;    // 尾翼宽度
        const finHeight = radius * 1.6;      // 尾翼高度
        
        // 主弹体（圆角矩形）
        graphics.fillColor = new Color(rocketColor.r, rocketColor.g, rocketColor.b, 255);
        graphics.roundRect(-radius, -bodyWidth / 2, length, bodyWidth, bodyWidth * 0.45);
        graphics.fill();
        
        // 弹体边框
        graphics.lineWidth = 2;
        graphics.strokeColor = new Color(63, 29, 11, 153); // 0x3f1d0b, alpha: 0.6
        graphics.roundRect(-radius, -bodyWidth / 2, length, bodyWidth, bodyWidth * 0.45);
        graphics.stroke();
        
        // 弹头装甲段（橙色）
        graphics.fillColor = new Color(249, 115, 22, 230); // 0xf97316, alpha: 0.9
        graphics.roundRect(
            length * 0.4,
            -bodyWidth * 0.35,
            length * 0.35,
            bodyWidth * 0.7,
            bodyWidth * 0.35
        );
        graphics.fill();
        
        // 弹头顶端光点（浅黄色）
        graphics.fillColor = new Color(254, 243, 199, 242); // 0xfef3c7, alpha: 0.95
        graphics.circle(length * 0.75, 0, bodyWidth * 0.35);
        graphics.fill();
        
        // 上尾翼
        graphics.fillColor = new Color(rocketBodyColor.r, rocketBodyColor.g, rocketBodyColor.b, 230); // alpha: 0.9
        graphics.roundRect(
            -radius,
            -finHeight / 2,
            finWidth,
            finHeight,
            finWidth * 0.4
        );
        graphics.fill();
        graphics.strokeColor = new Color(rocketDetailColor.r, rocketDetailColor.g, rocketDetailColor.b, 200);
        graphics.lineWidth = 1.5;
        graphics.roundRect(
            -radius,
            -finHeight / 2,
            finWidth,
            finHeight,
            finWidth * 0.4
        );
        graphics.stroke();

        // 下尾翼
        graphics.fillColor = new Color(rocketBodyColor.r, rocketBodyColor.g, rocketBodyColor.b, 217); // alpha: 0.85
        graphics.roundRect(
            -radius,
            finHeight / 2 - finWidth / 2,
            finWidth,
            finWidth,
            finWidth * 0.4
        );
        graphics.fill();
        graphics.strokeColor = new Color(rocketDetailColor.r, rocketDetailColor.g, rocketDetailColor.b, 200);
        graphics.lineWidth = 1.5;
        graphics.roundRect(
            -radius,
            finHeight / 2 - finWidth / 2,
            finWidth,
            finWidth,
            finWidth * 0.4
        );
        graphics.stroke();
        
        // 尾焰效果（橙色）
        graphics.fillColor = new Color(249, 115, 22, 178); // 0xf97316, alpha: 0.7
        graphics.circle(-radius - bodyWidth * 0.25, 0, bodyWidth * 0.4);
        graphics.fill();
        
        return graphics;
    }
}

