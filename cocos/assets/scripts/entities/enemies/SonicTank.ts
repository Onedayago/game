/**
 * 声波坦克
 * 发射声波攻击，范围伤害
 */

import { _decorator, Vec3, Graphics, instantiate, Prefab, Color } from 'cc';
import { EnemyBase } from '../base/EnemyBase';
import { GameConfig } from '../../config/GameConfig';
import { ColorCache, GameColors } from '../../config/Colors';

const { ccclass, property } = _decorator;

@ccclass('SonicTank')
export class SonicTank extends EnemyBase {
    @property(Prefab)
    bulletPrefab: Prefab | null = null;
    
    private bullets: any[] = [];
    
    onLoad() {
        super.onLoad();
        
        // 设置声波坦克属性
        this.maxHp = GameConfig.SONIC_TANK_HP;
        this.hp = this.maxHp;
        this.moveSpeed = GameConfig.ENEMY_MOVE_SPEED * 0.8;  // 稍慢
        this.attackRange = GameConfig.SONIC_TANK_ATTACK_RANGE;
        this.fireInterval = GameConfig.SONIC_TANK_FIRE_INTERVAL;
        this.damage = GameConfig.SONIC_WAVE_DAMAGE;
        
        this.createVisual();
    }
    
    /**
     * 创建声波坦克视觉
     */
    private createVisual() {
        const graphics = this.node.getComponent(Graphics) || this.node.addComponent(Graphics);
        if (!graphics) return;
        
        const SONIC_SIZE = GameConfig.CELL_SIZE * 0.6;  // 比普通坦克稍大，但确保血条不超出格子
        const hullRadius = SONIC_SIZE * 0.3;
        const trackHeight = SONIC_SIZE * 0.22;
        
        graphics.clear();
        
        // 多层阴影
        graphics.fillColor = new Color(0, 0, 0, 77);  // alpha: 0.3 * 255
        graphics.roundRect(-SONIC_SIZE / 2 + 4, -SONIC_SIZE / 2 + 6, SONIC_SIZE - 8, SONIC_SIZE - 6, hullRadius);
        graphics.fill();
        
        graphics.fillColor = new Color(0, 0, 0, 38);  // alpha: 0.15 * 255
        graphics.roundRect(-SONIC_SIZE / 2 + 6, -SONIC_SIZE / 2 + 8, SONIC_SIZE - 12, SONIC_SIZE - 10, hullRadius * 0.8);
        graphics.fill();
        
        // 上下履带
        graphics.fillColor = new Color(30, 27, 75, 255);  // 0x1e1b4b
        graphics.roundRect(-SONIC_SIZE / 2, -SONIC_SIZE / 2, SONIC_SIZE, trackHeight, trackHeight / 2);
        graphics.fill();
        graphics.strokeColor = new Color(49, 46, 129, 153);  // 0x312e81, alpha: 0.6
        graphics.lineWidth = 1;
        graphics.roundRect(-SONIC_SIZE / 2, -SONIC_SIZE / 2, SONIC_SIZE, trackHeight, trackHeight / 2);
        graphics.stroke();
        
        graphics.fillColor = new Color(30, 27, 75, 255);  // 0x1e1b4b
        graphics.roundRect(-SONIC_SIZE / 2, SONIC_SIZE / 2 - trackHeight, SONIC_SIZE, trackHeight, trackHeight / 2);
        graphics.fill();
        graphics.strokeColor = new Color(49, 46, 129, 153);  // 0x312e81, alpha: 0.6
        graphics.roundRect(-SONIC_SIZE / 2, SONIC_SIZE / 2 - trackHeight, SONIC_SIZE, trackHeight, trackHeight / 2);
        graphics.stroke();
        
        // 履带滚轮
        const wheelRadius = trackHeight * 0.32;
        const wheelCount = 4;
        for (let i = 0; i < wheelCount; i++) {
            const t = wheelCount === 1 ? 0.5 : i / (wheelCount - 1);
            const wx = -SONIC_SIZE / 2 + SONIC_SIZE * (0.18 + 0.64 * t);
            const wyTop = -SONIC_SIZE / 2 + trackHeight / 2;
            const wyBottom = SONIC_SIZE / 2 - trackHeight / 2;
            
            // 上轮
            graphics.fillColor = new Color(76, 29, 149, 255);  // 0x4c1d95
            graphics.circle(wx, wyTop, wheelRadius);
            graphics.fill();
            graphics.strokeColor = new Color(49, 46, 129, 255);  // 0x312e81
            graphics.lineWidth = 1;
            graphics.circle(wx, wyTop, wheelRadius);
            graphics.stroke();
            graphics.fillColor = new Color(109, 40, 217, 255);  // 0x6d28d9
            graphics.circle(wx, wyTop, wheelRadius * 0.5);
            graphics.fill();
            
            // 下轮
            graphics.fillColor = new Color(76, 29, 149, 255);  // 0x4c1d95
            graphics.circle(wx, wyBottom, wheelRadius);
            graphics.fill();
            graphics.strokeColor = new Color(49, 46, 129, 255);  // 0x312e81
            graphics.circle(wx, wyBottom, wheelRadius);
            graphics.stroke();
            graphics.fillColor = new Color(109, 40, 217, 255);  // 0x6d28d9
            graphics.circle(wx, wyBottom, wheelRadius * 0.5);
            graphics.fill();
        }
        
        // 主车体（紫色主题）
        graphics.fillColor = new Color(91, 33, 182, 255);  // 0x5b21b6
        graphics.roundRect(
            -SONIC_SIZE / 2 + 6,
            -SONIC_SIZE / 2 + trackHeight * 0.65,
            SONIC_SIZE - 12,
            SONIC_SIZE - trackHeight * 1.3,
            hullRadius
        );
        graphics.fill();
        graphics.strokeColor = new Color(76, 29, 149, 255);  // 0x4c1d95
        graphics.lineWidth = 2.5;
        graphics.roundRect(
            -SONIC_SIZE / 2 + 6,
            -SONIC_SIZE / 2 + trackHeight * 0.65,
            SONIC_SIZE - 12,
            SONIC_SIZE - trackHeight * 1.3,
            hullRadius
        );
        graphics.stroke();
        
        // 车体高光
        graphics.fillColor = new Color(167, 139, 250, 77);  // 0xa78bfa, alpha: 0.3
        graphics.roundRect(
            -SONIC_SIZE / 2 + 8,
            -SONIC_SIZE / 2 + trackHeight * 0.7,
            SONIC_SIZE - 16,
            (SONIC_SIZE - trackHeight * 1.3) * 0.25,
            hullRadius * 0.6
        );
        graphics.fill();
        
        // 声波发射器标识
        graphics.fillColor = new Color(76, 29, 149, 242);  // 0x4c1d95, alpha: 0.95
        graphics.roundRect(
            -SONIC_SIZE / 2 + 10,
            -SONIC_SIZE * 0.08,
            SONIC_SIZE - 20,
            SONIC_SIZE * 0.18,
            SONIC_SIZE * 0.05
        );
        graphics.fill();
        graphics.strokeColor = new Color(139, 92, 246, 128);  // 0x8b5cf6, alpha: 0.5
        graphics.lineWidth = 1;
        graphics.roundRect(
            -SONIC_SIZE / 2 + 10,
            -SONIC_SIZE * 0.08,
            SONIC_SIZE - 20,
            SONIC_SIZE * 0.18,
            SONIC_SIZE * 0.05
        );
        graphics.stroke();
        
        // 声波标识符号（波纹图案）
        const waveSymbolCount = 3;
        for (let i = 0; i < waveSymbolCount; i++) {
            const symbolRadius = SONIC_SIZE * (0.08 + i * 0.04);
            graphics.strokeColor = new Color(139, 92, 246, (153 - i * 38));  // 0x8b5cf6, alpha: 0.6 - i * 0.15
            graphics.lineWidth = 1.5;
            graphics.circle(0, 0, symbolRadius);
            graphics.stroke();
        }
        
        // 声波发射器（圆形能量核心）
        const emitterRadius = SONIC_SIZE * 0.25;
        const emitterY = -SONIC_SIZE * 0.05;
        
        // 外层光晕
        graphics.fillColor = new Color(139, 92, 246, 51);  // 0x8b5cf6, alpha: 0.2
        graphics.circle(0, emitterY, emitterRadius * 1.15);
        graphics.fill();
        
        // 中层
        graphics.fillColor = new Color(76, 29, 149, 255);  // 0x4c1d95
        graphics.circle(0, emitterY, emitterRadius);
        graphics.fill();
        graphics.strokeColor = new Color(139, 92, 246, 204);  // 0x8b5cf6, alpha: 0.8
        graphics.lineWidth = 2;
        graphics.circle(0, emitterY, emitterRadius);
        graphics.stroke();
        
        // 内层
        graphics.fillColor = new Color(109, 40, 217, 255);  // 0x6d28d9
        graphics.circle(0, emitterY, emitterRadius * 0.7);
        graphics.fill();
        
        // 能量核心中心
        graphics.fillColor = new Color(167, 139, 250, 230);  // 0xa78bfa, alpha: 0.9
        graphics.circle(0, emitterY, emitterRadius * 0.4);
        graphics.fill();
        graphics.fillColor = new Color(255, 255, 255, 204);  // 0xffffff, alpha: 0.8
        graphics.circle(0, emitterY, emitterRadius * 0.2);
        graphics.fill();
        
        // 声波放大器（前方的喇叭状结构）
        const amplifierWidth = SONIC_SIZE * 0.35;
        const amplifierLength = SONIC_SIZE * 0.6;
        
        graphics.fillColor = new Color(109, 40, 217, 179);  // 0x6d28d9, alpha: 0.7
        graphics.moveTo(0, -amplifierWidth / 2);
        graphics.lineTo(amplifierLength, -amplifierWidth * 0.8);
        graphics.lineTo(amplifierLength, amplifierWidth * 0.8);
        graphics.lineTo(0, amplifierWidth / 2);
        graphics.close();
        graphics.fill();
        graphics.strokeColor = new Color(139, 92, 246, 230);  // 0x8b5cf6, alpha: 0.9
        graphics.lineWidth = 2;
        graphics.moveTo(0, -amplifierWidth / 2);
        graphics.lineTo(amplifierLength, -amplifierWidth * 0.8);
        graphics.lineTo(amplifierLength, amplifierWidth * 0.8);
        graphics.lineTo(0, amplifierWidth / 2);
        graphics.close();
        graphics.stroke();
        
        // 放大器细节线条
        const detailLines = 3;
        for (let i = 1; i < detailLines; i++) {
            const t = i / detailLines;
            const x = amplifierLength * t;
            const halfWidth = amplifierWidth * (0.5 + 0.3 * t);
            graphics.strokeColor = new Color(167, 139, 250, 102);  // 0xa78bfa, alpha: 0.4
            graphics.lineWidth = 1;
            graphics.moveTo(x, -halfWidth);
            graphics.lineTo(x, halfWidth);
            graphics.stroke();
        }
    }
    
    /**
     * 更新声波坦克（由 EnemyManager 调用）
     */
    updateEnemy(deltaTime: number, deltaMS: number, weapons: any[]) {
        super.updateEnemy(deltaTime, deltaMS, weapons);
        
        // 更新子弹（子弹的 update 由 Cocos 自动调用，这里只需要检查是否需要销毁）
        if (this.bullets && this.bullets.length > 0) {
            this.bullets = this.bullets.filter(bullet => {
                if (!bullet || !bullet.isValid) return false;
                
                const bulletComp = bullet.getComponent('EnemyBullet');
                if (bulletComp && bulletComp.shouldDestroy()) {
                    bullet.destroy();
                    return false;
                }
                
                return true;
            });
        }
    }
    
    /**
     * 开火（使用 EnemyBullet）
     */
    protected fire(target: any) {
        if (!this.bulletPrefab) {
            console.error('[SonicTank] fire: bulletPrefab is null');
            return;
        }
        
        if (!target) {
            console.error('[SonicTank] fire: target is null');
            return;
        }
        
        // 确保 target 有 node 属性
        const targetNode = target.node || target;
        if (!targetNode || !targetNode.isValid) {
            console.error('[SonicTank] fire: targetNode is invalid');
            return;
        }
        
        // 创建子弹
        const bulletNode = instantiate(this.bulletPrefab);
        if (!bulletNode) {
            console.error('[SonicTank] fire: failed to instantiate bullet');
            return;
        }
        
        // 计算发射位置和方向（从敌人中心发射）
        // 注意：Cocos Creator Y轴向上，需要对 dy 取反以匹配原游戏的角度计算
        const dx = targetNode.position.x - this.node.position.x;
        const dy = targetNode.position.y - this.node.position.y;
        // 对 dy 取反，适配 Y 轴向上（与原游戏 PixiJS Y轴向下保持一致）
        const angleRad = Math.atan2(-dy, dx);
        
        // 从敌人中心发射
        const muzzleX = this.node.position.x;
        const muzzleY = this.node.position.y;
        
        bulletNode.setPosition(new Vec3(muzzleX, muzzleY, 0));
        
        // 先添加到场景，再初始化（确保节点在场景中）
        const world = this.node.parent;
        if (!world) {
            console.error('[SonicTank] fire: world is null');
            bulletNode.destroy();
            return;
        }
        
        // 先设置 layer 和 active，再添加到父节点
        bulletNode.layer = world.layer;
        bulletNode.active = true;  // 确保节点激活
        
        world.addChild(bulletNode);
        
        // 初始化子弹（在添加到场景后）
        const bulletComp = bulletNode.getComponent('EnemyBullet') as any;
        if (!bulletComp) {
            console.error('[SonicTank] fire: EnemyBullet component not found');
            bulletNode.destroy();
            return;
        }
        
        bulletComp.init(angleRad, {
            speed: GameConfig.ENEMY_BULLET_SPEED,
            damage: this.damage,
            color: GameColors.ENEMY_BULLET
        });
        
        this.bullets.push(bulletNode);
        
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

