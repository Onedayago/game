/**
 * 敌人渲染器
 * 负责所有敌人的视觉绘制
 */

import { Graphics, Color } from 'cc';
import { GameConfig } from '../config/GameConfig';
import { ColorCache, GameColors } from '../config/Colors';

/**
 * 敌人渲染器
 */
export class EnemyRenderer {
    /**
     * 渲染敌人坦克
     * @param graphics Graphics 组件
     * @param size 敌人尺寸
     */
    static renderEnemyTank(graphics: Graphics, size: number): void {
        if (!graphics) return;

        const hullRadius = size * 0.25;
        const trackHeight = size * 0.22;
        const turretRadius = size * 0.22;
        const barrelLength = size * 0.78;
        const barrelHalfHeight = size * 0.08;

        const enemyColor = ColorCache.get(GameColors.ENEMY_BODY);
        const enemyDarkColor = ColorCache.get(GameColors.ENEMY_BODY_DARK);
        const detailColor = ColorCache.get(GameColors.ENEMY_DETAIL);

        graphics.clear();

        // === 多层阴影 ===
        EnemyRenderer.drawShadow(graphics, size, hullRadius);

        // === 上下履带 ===
        EnemyRenderer.drawTracks(graphics, size, trackHeight, enemyDarkColor);

        // === 履带装甲板纹理 ===
        EnemyRenderer.drawTrackPlates(graphics, size, trackHeight);

        // === 履带滚轮 ===
        EnemyRenderer.drawTrackWheels(graphics, size, trackHeight);

        // === 主车体 ===
        EnemyRenderer.drawHull(graphics, size, trackHeight, hullRadius, enemyColor, enemyDarkColor);

        // === 车体高光 ===
        EnemyRenderer.drawHullHighlight(graphics, size, trackHeight, hullRadius);

        // === 前装甲条 ===
        EnemyRenderer.drawFrontArmor(graphics, size, enemyDarkColor);

        // === 装甲条纹 ===
        EnemyRenderer.drawArmorStripes(graphics, size, trackHeight, enemyDarkColor);

        // === 威胁标识（红色辉光）===
        EnemyRenderer.drawThreatIndicator(graphics, size);

        // === 炮塔 ===
        EnemyRenderer.drawTurret(graphics, size, turretRadius, enemyColor, enemyDarkColor);

        // === 炮塔顶部细节 ===
        EnemyRenderer.drawTurretTop(graphics, size);

        // === 炮塔警示灯 ===
        EnemyRenderer.drawTurretLight(graphics, size);

        // === 炮管 ===
        EnemyRenderer.drawBarrel(graphics, barrelLength, barrelHalfHeight, detailColor, enemyDarkColor, enemyColor);
    }

    /**
     * 绘制阴影
     */
    private static drawShadow(graphics: Graphics, size: number, hullRadius: number): void {
        graphics.fillColor = EnemyRenderer.hexToColor(0x000000, 77);
        graphics.roundRect(-size/2 + 4, -size/2 + 6, size - 8, size - 6, hullRadius);
        graphics.fill();

        graphics.fillColor = EnemyRenderer.hexToColor(0x000000, 38);
        graphics.roundRect(-size/2 + 6, -size/2 + 8, size - 12, size - 10, hullRadius * 0.8);
        graphics.fill();
    }

    /**
     * 绘制履带
     */
    private static drawTracks(graphics: Graphics, size: number, trackHeight: number, enemyDarkColor: Color): void {
        // 上履带
        graphics.fillColor = EnemyRenderer.hexToColor(0x0a0f1a, 255);
        graphics.roundRect(-size/2, -size/2, size, trackHeight, trackHeight/2);
        graphics.fill();
        graphics.lineWidth = 1;
        graphics.strokeColor = EnemyRenderer.hexToColor(ColorCache.getHex(GameColors.ENEMY_BODY_DARK), 153);
        graphics.stroke();

        // 下履带
        graphics.fillColor = EnemyRenderer.hexToColor(0x0a0f1a, 255);
        graphics.roundRect(-size/2, size/2 - trackHeight, size, trackHeight, trackHeight/2);
        graphics.fill();
        graphics.lineWidth = 1;
        graphics.strokeColor = EnemyRenderer.hexToColor(ColorCache.getHex(GameColors.ENEMY_BODY_DARK), 153);
        graphics.stroke();
    }

    /**
     * 绘制履带装甲板
     */
    private static drawTrackPlates(graphics: Graphics, size: number, trackHeight: number): void {
        const plateCount = 5;
        for (let i = 0; i < plateCount; i++) {
            const px = -size/2 + (size / plateCount) * i + 3;
            graphics.fillColor = EnemyRenderer.hexToColor(0x1e293b, 102);
            graphics.rect(px, -size/2 + 2, size/plateCount - 2, trackHeight - 4);
            graphics.fill();
            graphics.rect(px, size/2 - trackHeight + 2, size/plateCount - 2, trackHeight - 4);
            graphics.fill();
        }
    }

    /**
     * 绘制履带滚轮
     */
    private static drawTrackWheels(graphics: Graphics, size: number, trackHeight: number): void {
        const wheelRadius = trackHeight * 0.32;
        const wheelCount = 4;
        for (let i = 0; i < wheelCount; i++) {
            const t = wheelCount === 1 ? 0.5 : i / (wheelCount - 1);
            const wx = -size/2 + size * (0.18 + 0.64 * t);
            const wyTop = -size/2 + trackHeight/2;
            const wyBottom = size/2 - trackHeight/2;

            // 上排滚轮
            graphics.fillColor = EnemyRenderer.hexToColor(0x334155, 255);
            graphics.circle(wx, wyTop, wheelRadius);
            graphics.fill();
            graphics.lineWidth = 1;
            graphics.strokeColor = EnemyRenderer.hexToColor(0x1e293b, 255);
            graphics.stroke();
            graphics.fillColor = EnemyRenderer.hexToColor(0x475569, 255);
            graphics.circle(wx, wyTop, wheelRadius * 0.5);
            graphics.fill();

            // 下排滚轮
            graphics.fillColor = EnemyRenderer.hexToColor(0x334155, 255);
            graphics.circle(wx, wyBottom, wheelRadius);
            graphics.fill();
            graphics.lineWidth = 1;
            graphics.strokeColor = EnemyRenderer.hexToColor(0x1e293b, 255);
            graphics.stroke();
            graphics.fillColor = EnemyRenderer.hexToColor(0x475569, 255);
            graphics.circle(wx, wyBottom, wheelRadius * 0.5);
            graphics.fill();
        }
    }

    /**
     * 绘制主车体
     */
    private static drawHull(graphics: Graphics, size: number, trackHeight: number, hullRadius: number, 
                           enemyColor: Color, enemyDarkColor: Color): void {
        graphics.fillColor = enemyColor;
        graphics.roundRect(
            -size/2 + 6,
            -size/2 + trackHeight * 0.65,
            size - 12,
            size - trackHeight * 1.3,
            hullRadius
        );
        graphics.fill();
        graphics.lineWidth = 2.5;
        graphics.strokeColor = enemyDarkColor;
        graphics.stroke();
    }

    /**
     * 绘制车体高光
     */
    private static drawHullHighlight(graphics: Graphics, size: number, trackHeight: number, hullRadius: number): void {
        graphics.fillColor = EnemyRenderer.hexToColor(ColorCache.getHex(GameColors.ENEMY_DETAIL), 26);
        graphics.roundRect(
            -size/2 + 8,
            -size/2 + trackHeight * 0.7,
            size - 16,
            (size - trackHeight * 1.3) * 0.25,
            hullRadius * 0.6
        );
        graphics.fill();
    }

    /**
     * 绘制前装甲条
     */
    private static drawFrontArmor(graphics: Graphics, size: number, enemyDarkColor: Color): void {
        graphics.fillColor = EnemyRenderer.hexToColor(ColorCache.getHex(GameColors.ENEMY_BODY_DARK), 242);
        graphics.roundRect(
            -size/2 + 10,
            -size * 0.08,
            size - 20,
            size * 0.18,
            size * 0.05
        );
        graphics.fill();
        graphics.lineWidth = 1;
        graphics.strokeColor = EnemyRenderer.hexToColor(ColorCache.getHex(GameColors.ENEMY_DETAIL), 77);
        graphics.stroke();
    }

    /**
     * 绘制装甲条纹
     */
    private static drawArmorStripes(graphics: Graphics, size: number, trackHeight: number, enemyDarkColor: Color): void {
        const stripeCount = 2;
        for (let i = 0; i < stripeCount; i++) {
            const sy = -size/2 + trackHeight * 0.75 + i * ((size - trackHeight * 1.4) / stripeCount);
            graphics.fillColor = EnemyRenderer.hexToColor(ColorCache.getHex(GameColors.ENEMY_BODY_DARK), 179);
            graphics.rect(-size/2 + 12, sy, size - 24, 1.5);
            graphics.fill();
        }
    }

    /**
     * 绘制威胁标识
     */
    private static drawThreatIndicator(graphics: Graphics, size: number): void {
        graphics.fillColor = EnemyRenderer.hexToColor(ColorCache.getHex(GameColors.ENEMY_DETAIL), 77);
        graphics.circle(-size * 0.18, -size * 0.02, size * 0.09);
        graphics.fill();

        graphics.fillColor = EnemyRenderer.hexToColor(ColorCache.getHex(GameColors.ENEMY_DETAIL), 242);
        graphics.circle(-size * 0.18, -size * 0.02, size * 0.07);
        graphics.fill();
        graphics.lineWidth = 1;
        graphics.strokeColor = EnemyRenderer.hexToColor(0xfb7185, 204);
        graphics.stroke();

        graphics.fillColor = EnemyRenderer.hexToColor(0xffffff, 179);
        graphics.circle(-size * 0.18, -size * 0.02, size * 0.04);
        graphics.fill();
    }

    /**
     * 绘制炮塔
     */
    private static drawTurret(graphics: Graphics, size: number, turretRadius: number, 
                             enemyColor: Color, enemyDarkColor: Color): void {
        graphics.fillColor = EnemyRenderer.hexToColor(ColorCache.getHex(GameColors.ENEMY_DETAIL), 38);
        graphics.circle(0, -size * 0.05, turretRadius * 1.1);
        graphics.fill();

        graphics.fillColor = enemyDarkColor;
        graphics.circle(0, -size * 0.05, turretRadius);
        graphics.fill();
        graphics.lineWidth = 2;
        graphics.strokeColor = EnemyRenderer.hexToColor(0x000000, 153);
        graphics.stroke();

        graphics.fillColor = EnemyRenderer.hexToColor(ColorCache.getHex(GameColors.ENEMY_BODY), 204);
        graphics.circle(0, -size * 0.05, turretRadius * 0.85);
        graphics.fill();
    }

    /**
     * 绘制炮塔顶部
     */
    private static drawTurretTop(graphics: Graphics, size: number): void {
        graphics.fillColor = EnemyRenderer.hexToColor(ColorCache.getHex(GameColors.ENEMY_BODY), 242);
        graphics.roundRect(
            -size * 0.08,
            -size * 0.18,
            size * 0.16,
            size * 0.36,
            size * 0.06
        );
        graphics.fill();
        graphics.lineWidth = 1;
        graphics.strokeColor = EnemyRenderer.hexToColor(ColorCache.getHex(GameColors.ENEMY_DETAIL), 102);
        graphics.stroke();
    }

    /**
     * 绘制炮塔警示灯
     */
    private static drawTurretLight(graphics: Graphics, size: number): void {
        graphics.fillColor = EnemyRenderer.hexToColor(ColorCache.getHex(GameColors.ENEMY_DETAIL), 230);
        graphics.circle(0, -size * 0.2, size * 0.035);
        graphics.fill();

        graphics.fillColor = EnemyRenderer.hexToColor(0xffffff, 204);
        graphics.circle(0, -size * 0.2, size * 0.022);
        graphics.fill();
    }

    /**
     * 绘制炮管
     */
    private static drawBarrel(graphics: Graphics, barrelLength: number, barrelHalfHeight: number,
                              detailColor: Color, enemyDarkColor: Color, enemyColor: Color): void {
        graphics.fillColor = detailColor;
        graphics.roundRect(0, -barrelHalfHeight, barrelLength, barrelHalfHeight * 2, barrelHalfHeight);
        graphics.fill();
        graphics.lineWidth = 1.5;
        graphics.strokeColor = EnemyRenderer.hexToColor(ColorCache.getHex(GameColors.ENEMY_BODY_DARK), 204);
        graphics.stroke();

        // 炮管中段装甲
        graphics.fillColor = EnemyRenderer.hexToColor(ColorCache.getHex(GameColors.ENEMY_BODY), 230);
        graphics.roundRect(
            barrelLength * 0.4,
            -barrelHalfHeight * 0.6,
            barrelLength * 0.4,
            barrelHalfHeight * 1.2,
            barrelHalfHeight * 0.5
        );
        graphics.fill();
        graphics.lineWidth = 1;
        graphics.strokeColor = EnemyRenderer.hexToColor(ColorCache.getHex(GameColors.ENEMY_DETAIL), 102);
        graphics.stroke();

        // 炮口光环
        graphics.fillColor = EnemyRenderer.hexToColor(ColorCache.getHex(GameColors.ENEMY_DETAIL), 77);
        graphics.circle(barrelLength - barrelHalfHeight * 0.2, 0, barrelHalfHeight * 0.6);
        graphics.fill();

        graphics.fillColor = EnemyRenderer.hexToColor(ColorCache.getHex(GameColors.ENEMY_DETAIL), 242);
        graphics.circle(barrelLength - barrelHalfHeight * 0.2, 0, barrelHalfHeight * 0.5);
        graphics.fill();

        graphics.fillColor = EnemyRenderer.hexToColor(0xffffff, 153);
        graphics.circle(barrelLength - barrelHalfHeight * 0.2, 0, barrelHalfHeight * 0.3);
        graphics.fill();
    }

    /**
     * 将十六进制颜色转换为 Cocos Color
     */
    private static hexToColor(hex: number, alpha: number = 255): Color {
        const r = (hex >> 16) & 0xff;
        const g = (hex >> 8) & 0xff;
        const b = hex & 0xff;
        return new Color(r, g, b, alpha);
    }
}

