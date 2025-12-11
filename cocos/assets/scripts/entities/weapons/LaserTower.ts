/**
 * 激光塔
 * 发射持续性激光束，快速攻击
 */

import { _decorator, Vec3, Graphics } from 'cc';
import { WeaponBase } from '../WeaponBase';
import { GameConfig, WeaponType } from '../../config/GameConfig';
import { ColorCache, GameColors } from '../../config/Colors';

const { ccclass } = _decorator;

interface LaserBeam {
    graphics: Node | null;
    timeLeft: number;
}

@ccclass('LaserTower')
export class LaserTower extends WeaponBase {
    private laserBeams: LaserBeam[] = [];
    private beamDuration: number = GameConfig.LASER_BEAM_DURATION;
    
    onLoad() {
        super.onLoad();
        
        // 设置激光塔属性
        this.weaponType = WeaponType.LASER;
        this.fireInterval = GameConfig.LASER_FIRE_INTERVAL;
        this.attackRange = GameConfig.LASER_ATTACK_RANGE;
        this.damage = GameConfig.LASER_DAMAGE;
        this.beamDuration = GameConfig.LASER_BEAM_DURATION;
        
        this.applyLevelStats();
        this.createVisual();
    }
    
    /**
     * 创建激光塔视觉
     */
    private createVisual() {
        const graphics = this.node.addComponent(Graphics);
        if (!graphics) return;
        
        const size = GameConfig.CELL_SIZE;
        const towerRadius = size * 0.20;
        const coreRadius = size * 0.12;
        const baseSize = size * 0.4;
        
        graphics.clear();
        
        // 阴影
        graphics.fillColor = cc.color(0, 0, 0, 89);
        graphics.roundRect(-size/2 + 4, -size/2 + 6, size - 8, size - 4, towerRadius);
        graphics.fill();
        
        // 六边形基座
        const laserColor = ColorCache.get(GameColors.LASER_BODY);
        graphics.fillColor = cc.color(laserColor.r, laserColor.g, laserColor.b, 230);
        
        // 绘制六边形
        const hexPoints: Vec3[] = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            hexPoints.push(new Vec3(
                Math.cos(angle) * baseSize,
                Math.sin(angle) * baseSize,
                0
            ));
        }
        
        // 简化绘制（Cocos的Graphics API略有不同）
        graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
        for (let i = 1; i < hexPoints.length; i++) {
            graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
        }
        graphics.close();
        graphics.fill();
        
        const detailColor = ColorCache.get(GameColors.LASER_DETAIL);
        graphics.lineWidth = 2;
        graphics.strokeColor = cc.color(detailColor.r, detailColor.g, detailColor.b, 178);
        graphics.stroke();
        
        // 中央能量核心
        const beamColor = ColorCache.get(GameColors.LASER_BEAM);
        graphics.fillColor = cc.color(beamColor.r, beamColor.g, beamColor.b, 242);
        graphics.circle(0, 0, coreRadius);
        graphics.fill();
        
        // 发光效果
        graphics.fillColor = cc.color(detailColor.r, detailColor.g, detailColor.b, 128);
        graphics.circle(0, 0, coreRadius * 1.2);
        graphics.fill();
    }
    
    /**
     * 应用等级属性
     */
    protected applyLevelStats() {
        if (this.level === 2) {
            this.fireInterval = GameConfig.LASER_FIRE_INTERVAL * 0.8;
            this.damage = GameConfig.LASER_DAMAGE * 1.5;
            this.beamDuration = GameConfig.LASER_BEAM_DURATION * 1.2;
        } else if (this.level === 3) {
            this.fireInterval = GameConfig.LASER_FIRE_INTERVAL * 0.65;
            this.damage = GameConfig.LASER_DAMAGE * 2;
            this.beamDuration = GameConfig.LASER_BEAM_DURATION * 1.4;
        }
    }
    
    /**
     * 更新激光塔
     */
    update(deltaTime: number, deltaMS: number, enemies: any[]) {
        super.update(deltaTime, deltaMS, enemies);
        
        // 更新激光束
        this.laserBeams = this.laserBeams.filter(beam => {
            beam.timeLeft -= deltaMS;
            
            if (beam.timeLeft <= 0) {
                if (beam.graphics && beam.graphics.isValid) {
                    beam.graphics.destroy();
                }
                return false;
            }
            
            // 渐隐效果
            if (beam.graphics && beam.graphics.isValid) {
                const graphics = beam.graphics.getComponent(Graphics);
                if (graphics) {
                    const alpha = (beam.timeLeft / this.beamDuration) * 0.9;
                    graphics.node.opacity = alpha * 255;
                }
            }
            
            return true;
        });
    }
    
    /**
     * 开火
     */
    protected fire(target: any) {
        if (!target || !target.isValid) return;
        
        const targetPos = target.position;
        const startPos = this.node.position;
        
        // 计算距离和角度
        const dist = Vec3.distance(startPos, targetPos);
        const angle = Math.atan2(
            targetPos.y - startPos.y,
            targetPos.x - startPos.x
        );
        
        // 创建激光束节点
        const beamNode = new Node('LaserBeam');
        const graphics = beamNode.addComponent(Graphics);
        
        if (graphics) {
            const detailColor = ColorCache.get(GameColors.LASER_DETAIL);
            const beamColor = ColorCache.get(GameColors.LASER_BEAM);
            
            graphics.clear();
            
            // 外层光晕
            graphics.lineWidth = 8;
            graphics.strokeColor = cc.color(detailColor.r, detailColor.g, detailColor.b, 77);
            graphics.moveTo(0, 0);
            graphics.lineTo(dist, 0);
            graphics.stroke();
            
            // 中层光束
            graphics.lineWidth = 5;
            graphics.strokeColor = cc.color(beamColor.r, beamColor.g, beamColor.b, 153);
            graphics.moveTo(0, 0);
            graphics.lineTo(dist, 0);
            graphics.stroke();
            
            // 核心激光
            graphics.lineWidth = 2;
            graphics.strokeColor = cc.color(255, 255, 255, 242);
            graphics.moveTo(0, 0);
            graphics.lineTo(dist, 0);
            graphics.stroke();
        }
        
        beamNode.setPosition(startPos);
        beamNode.angle = -angle * 180 / Math.PI;
        
        // 添加到场景
        const world = this.node.parent;
        if (world) {
            world.addChild(beamNode);
            this.laserBeams.push({
                graphics: beamNode,
                timeLeft: this.beamDuration
            });
        }
        
        // 对目标造成伤害
        const enemyComp = target.getComponent('EnemyBase');
        if (enemyComp) {
            enemyComp.registerHit(this.damage);
        }
        
        // 播放音效
        const soundManager = this.gameContext?.soundManager;
        if (soundManager) {
            soundManager.playFire();
        }
    }
    
    onDestroy() {
        // 清理所有激光束
        this.laserBeams.forEach(beam => {
            if (beam.graphics && beam.graphics.isValid) {
                beam.graphics.destroy();
            }
        });
        this.laserBeams = [];
    }
}

