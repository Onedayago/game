/**
 * 激光塔
 * 发射持续性激光束，快速攻击
 */

import { _decorator, Vec3, Graphics, Node } from 'cc';
import { WeaponBase } from '../base/WeaponBase';
import { GameConfig } from '../../config/GameConfig';
import { WeaponType } from '../../config/WeaponConfig';
import { ColorCache, GameColors } from '../../config/Colors';
import { WeaponRenderer } from '../../rendering/WeaponRenderer';

const { ccclass } = _decorator;

interface LaserBeam {
    graphics: Node | null;
    timeLeft: number;
}

@ccclass('LaserTower')
export class LaserTower extends WeaponBase {
    // 显式声明 node 属性
    declare node: Node;
    
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
     * 创建激光塔视觉（使用统一渲染器）
     */
    private createVisual() {
        WeaponRenderer.renderLaserTower(this.node, { level: this.level });
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
     * 更新激光塔（重写基类方法）
     */
    updateWeapon(deltaTime: number, deltaMS: number, enemies: any[]) {
        super.updateWeapon(deltaTime, deltaMS, enemies);
        
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
     * 开火（使用统一渲染器）
     */
    protected fire(target: any) {
        if (!target || !target.isValid) return;
        
        const targetPos = target.position;
        const startPos = this.node.position;
        
        // 使用 WeaponRenderer 创建激光束
        const world = this.node.parent;
        if (!world) return;
        
        const beamNode = WeaponRenderer.renderLaserBeam(world, {
            startPos: startPos,
            endPos: targetPos,
            duration: this.beamDuration,
            layer: this.node.layer  // 设置与武器相同的 layer
        });
        
        if (beamNode) {
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
        
        // 播放音效（如果有 gameContext）
        if (typeof (this as any).gameContext !== 'undefined') {
            const soundManager = (this as any).gameContext?.soundManager;
            if (soundManager && soundManager.playFire) {
                soundManager.playFire();
            }
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

