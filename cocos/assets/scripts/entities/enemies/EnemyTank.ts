/**
 * 敌方坦克
 * 从左向右移动，攻击我方武器
 */

import { _decorator, Vec3, Graphics, instantiate, Prefab } from 'cc';
import { EnemyBase } from '../EnemyBase';
import { GameConfig } from '../../config/GameConfig';
import { ColorCache, GameColors } from '../../config/Colors';

const { ccclass, property } = _decorator;

@ccclass('EnemyTank')
export class EnemyTank extends EnemyBase {
    @property(Prefab)
    bulletPrefab: Prefab | null = null;
    
    private bullets: any[] = [];
    
    onLoad() {
        super.onLoad();
        
        // 设置敌人属性
        this.maxHp = GameConfig.ENEMY_MAX_HP;
        this.hp = this.maxHp;
        this.moveSpeed = GameConfig.ENEMY_MOVE_SPEED;
        this.attackRange = GameConfig.ENEMY_ATTACK_RANGE;
        this.fireInterval = GameConfig.ENEMY_FIRE_INTERVAL;
        this.damage = GameConfig.ENEMY_BULLET_DAMAGE;
        
        this.createVisual();
    }
    
    /**
     * 创建敌人坦克视觉（复刻原游戏）
     */
    private createVisual() {
        const graphics = this.node.addComponent(Graphics);
        if (!graphics) return;
        
        const size = GameConfig.ENEMY_SIZE;
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
        graphics.fillColor = this.hexToColor(0x000000, 77);
        graphics.roundRect(-size/2 + 4, -size/2 + 6, size - 8, size - 6, hullRadius);
        graphics.fill();
        
        graphics.fillColor = this.hexToColor(0x000000, 38);
        graphics.roundRect(-size/2 + 6, -size/2 + 8, size - 12, size - 10, hullRadius * 0.8);
        graphics.fill();
        
        // === 上下履带 ===
        // 上履带
        graphics.fillColor = this.hexToColor(0x0a0f1a, 255);
        graphics.roundRect(-size/2, -size/2, size, trackHeight, trackHeight/2);
        graphics.fill();
        graphics.lineWidth = 1;
        graphics.strokeColor = this.hexToColor(ColorCache.getHex(GameColors.ENEMY_BODY_DARK), 153);
        graphics.stroke();
        
        // 下履带
        graphics.fillColor = this.hexToColor(0x0a0f1a, 255);
        graphics.roundRect(-size/2, size/2 - trackHeight, size, trackHeight, trackHeight/2);
        graphics.fill();
        graphics.lineWidth = 1;
        graphics.strokeColor = this.hexToColor(ColorCache.getHex(GameColors.ENEMY_BODY_DARK), 153);
        graphics.stroke();
        
        // === 履带装甲板纹理 ===
        const plateCount = 5;
        for (let i = 0; i < plateCount; i++) {
            const px = -size/2 + (size / plateCount) * i + 3;
            graphics.fillColor = this.hexToColor(0x1e293b, 102);
            graphics.rect(px, -size/2 + 2, size/plateCount - 2, trackHeight - 4);
            graphics.fill();
            graphics.rect(px, size/2 - trackHeight + 2, size/plateCount - 2, trackHeight - 4);
            graphics.fill();
        }
        
        // === 履带滚轮 ===
        const wheelRadius = trackHeight * 0.32;
        const wheelCount = 4;
        for (let i = 0; i < wheelCount; i++) {
            const t = wheelCount === 1 ? 0.5 : i / (wheelCount - 1);
            const wx = -size/2 + size * (0.18 + 0.64 * t);
            const wyTop = -size/2 + trackHeight/2;
            const wyBottom = size/2 - trackHeight/2;
            
            // 上排滚轮
            graphics.fillColor = this.hexToColor(0x334155, 255);
            graphics.circle(wx, wyTop, wheelRadius);
            graphics.fill();
            graphics.lineWidth = 1;
            graphics.strokeColor = this.hexToColor(0x1e293b, 255);
            graphics.stroke();
            
            graphics.fillColor = this.hexToColor(0x475569, 255);
            graphics.circle(wx, wyTop, wheelRadius * 0.5);
            graphics.fill();
            
            // 下排滚轮
            graphics.fillColor = this.hexToColor(0x334155, 255);
            graphics.circle(wx, wyBottom, wheelRadius);
            graphics.fill();
            graphics.lineWidth = 1;
            graphics.strokeColor = this.hexToColor(0x1e293b, 255);
            graphics.stroke();
            
            graphics.fillColor = this.hexToColor(0x475569, 255);
            graphics.circle(wx, wyBottom, wheelRadius * 0.5);
            graphics.fill();
        }
        
        // === 主车体 ===
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
        
        // === 车体高光 ===
        graphics.fillColor = this.hexToColor(ColorCache.getHex(GameColors.ENEMY_DETAIL), 26);
        graphics.roundRect(
            -size/2 + 8,
            -size/2 + trackHeight * 0.7,
            size - 16,
            (size - trackHeight * 1.3) * 0.25,
            hullRadius * 0.6
        );
        graphics.fill();
        
        // === 前装甲条 ===
        graphics.fillColor = this.hexToColor(ColorCache.getHex(GameColors.ENEMY_BODY_DARK), 242);
        graphics.roundRect(
            -size/2 + 10,
            -size * 0.08,
            size - 20,
            size * 0.18,
            size * 0.05
        );
        graphics.fill();
        graphics.lineWidth = 1;
        graphics.strokeColor = this.hexToColor(ColorCache.getHex(GameColors.ENEMY_DETAIL), 77);
        graphics.stroke();
        
        // === 装甲条纹 ===
        const stripeCount = 2;
        for (let i = 0; i < stripeCount; i++) {
            const sy = -size/2 + trackHeight * 0.75 + i * ((size - trackHeight * 1.4) / stripeCount);
            graphics.fillColor = this.hexToColor(ColorCache.getHex(GameColors.ENEMY_BODY_DARK), 179);
            graphics.rect(-size/2 + 12, sy, size - 24, 1.5);
            graphics.fill();
        }
        
        // === 威胁标识（红色辉光）===
        graphics.fillColor = this.hexToColor(ColorCache.getHex(GameColors.ENEMY_DETAIL), 77);
        graphics.circle(-size * 0.18, -size * 0.02, size * 0.09);
        graphics.fill();
        
        graphics.fillColor = this.hexToColor(ColorCache.getHex(GameColors.ENEMY_DETAIL), 242);
        graphics.circle(-size * 0.18, -size * 0.02, size * 0.07);
        graphics.fill();
        graphics.lineWidth = 1;
        graphics.strokeColor = this.hexToColor(0xfb7185, 204);
        graphics.stroke();
        
        graphics.fillColor = this.hexToColor(0xffffff, 179);
        graphics.circle(-size * 0.18, -size * 0.02, size * 0.04);
        graphics.fill();
        
        // === 炮塔 ===
        graphics.fillColor = this.hexToColor(ColorCache.getHex(GameColors.ENEMY_DETAIL), 38);
        graphics.circle(0, -size * 0.05, turretRadius * 1.1);
        graphics.fill();
        
        graphics.fillColor = enemyDarkColor;
        graphics.circle(0, -size * 0.05, turretRadius);
        graphics.fill();
        graphics.lineWidth = 2;
        graphics.strokeColor = this.hexToColor(0x000000, 153);
        graphics.stroke();
        
        graphics.fillColor = this.hexToColor(ColorCache.getHex(GameColors.ENEMY_BODY), 204);
        graphics.circle(0, -size * 0.05, turretRadius * 0.85);
        graphics.fill();
        
        // === 炮塔顶部细节 ===
        graphics.fillColor = this.hexToColor(ColorCache.getHex(GameColors.ENEMY_BODY), 242);
        graphics.roundRect(
            -size * 0.08,
            -size * 0.18,
            size * 0.16,
            size * 0.36,
            size * 0.06
        );
        graphics.fill();
        graphics.lineWidth = 1;
        graphics.strokeColor = this.hexToColor(ColorCache.getHex(GameColors.ENEMY_DETAIL), 102);
        graphics.stroke();
        
        // === 炮塔警示灯 ===
        graphics.fillColor = this.hexToColor(ColorCache.getHex(GameColors.ENEMY_DETAIL), 230);
        graphics.circle(0, -size * 0.2, size * 0.035);
        graphics.fill();
        
        graphics.fillColor = this.hexToColor(0xffffff, 204);
        graphics.circle(0, -size * 0.2, size * 0.022);
        graphics.fill();
        
        // === 炮管 ===
        graphics.fillColor = detailColor;
        graphics.roundRect(0, -barrelHalfHeight, barrelLength, barrelHalfHeight * 2, barrelHalfHeight);
        graphics.fill();
        graphics.lineWidth = 1.5;
        graphics.strokeColor = this.hexToColor(ColorCache.getHex(GameColors.ENEMY_BODY_DARK), 204);
        graphics.stroke();
        
        // 炮管中段装甲
        graphics.fillColor = this.hexToColor(ColorCache.getHex(GameColors.ENEMY_BODY), 230);
        graphics.roundRect(
            barrelLength * 0.4,
            -barrelHalfHeight * 0.6,
            barrelLength * 0.4,
            barrelHalfHeight * 1.2,
            barrelHalfHeight * 0.5
        );
        graphics.fill();
        graphics.lineWidth = 1;
        graphics.strokeColor = this.hexToColor(ColorCache.getHex(GameColors.ENEMY_DETAIL), 102);
        graphics.stroke();
        
        // 炮口光环
        graphics.fillColor = this.hexToColor(ColorCache.getHex(GameColors.ENEMY_DETAIL), 77);
        graphics.circle(barrelLength - barrelHalfHeight * 0.2, 0, barrelHalfHeight * 0.6);
        graphics.fill();
        
        graphics.fillColor = this.hexToColor(ColorCache.getHex(GameColors.ENEMY_DETAIL), 242);
        graphics.circle(barrelLength - barrelHalfHeight * 0.2, 0, barrelHalfHeight * 0.5);
        graphics.fill();
        
        graphics.fillColor = this.hexToColor(0xffffff, 153);
        graphics.circle(barrelLength - barrelHalfHeight * 0.2, 0, barrelHalfHeight * 0.3);
        graphics.fill();
    }
    
    /**
     * 将十六进制颜色转换为 Cocos Color
     */
    private hexToColor(hex: number, alpha: number = 255) {
        const r = (hex >> 16) & 0xff;
        const g = (hex >> 8) & 0xff;
        const b = hex & 0xff;
        return new cc.Color(r, g, b, alpha);
    }
    
    /**
     * 更新敌人坦克（由 EnemyManager 调用）
     */
    updateEnemy(deltaTime: number, deltaMS: number, weapons: any[] = []) {
        super.updateEnemy(deltaTime, deltaMS, weapons);
        
        // 更新子弹
        if (this.bullets && this.bullets.length > 0) {
            this.bullets = this.bullets.filter(bullet => {
                if (!bullet || !bullet.isValid) return false;
                
                const bulletComp = bullet.getComponent('EnemyBullet');
                if (bulletComp) {
                    bulletComp.update(deltaTime, deltaMS, weapons);
                    
                    if (bulletComp.shouldDestroy()) {
                        bullet.destroy();
                        return false;
                    }
                }
                
                return true;
            });
        }
    }
    
    /**
     * 开火
     */
    protected fire(target: any) {
        if (!this.bulletPrefab || !target) return;
        
        // 创建子弹
        const bulletNode = instantiate(this.bulletPrefab);
        
        // 计算发射位置和方向
        const angle = Math.atan2(
            target.position.y - this.node.position.y,
            target.position.x - this.node.position.x
        );
        
        const barrelLength = GameConfig.CELL_SIZE * 0.5;
        const muzzleX = this.node.position.x + Math.cos(angle) * barrelLength;
        const muzzleY = this.node.position.y + Math.sin(angle) * barrelLength;
        
        bulletNode.setPosition(new Vec3(muzzleX, muzzleY, 0));
        
        // 初始化子弹
        const bulletComp = bulletNode.getComponent('EnemyBullet');
        if (bulletComp) {
            bulletComp.init(angle, {
                speed: GameConfig.ENEMY_BULLET_SPEED,
                damage: this.damage,
                color: GameColors.ENEMY_BULLET
            });
        }
        
        // 添加到场景
        const world = this.node.parent;
        if (world) {
            world.addChild(bulletNode);
            this.bullets.push(bulletNode);
        }
        
        // 播放音效
        const soundManager = this.gameContext?.soundManager;
        if (soundManager) {
            soundManager.playFire();
        }
    }
    
    onDestroy() {
        // 清理所有子弹
        this.bullets.forEach(bullet => {
            if (bullet && bullet.isValid) {
                bullet.destroy();
            }
        });
        this.bullets = [];
    }
}

