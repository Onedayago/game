/**
 * 声波坦克
 * 发射声波攻击，范围伤害
 */

import { _decorator, Vec3, Graphics, instantiate, Prefab } from 'cc';
import { EnemyBase } from '../EnemyBase';
import { GameConfig } from '../../config/GameConfig';
import { ColorCache, GameColors } from '../../config/Colors';

const { ccclass, property } = _decorator;

@ccclass('SonicTank')
export class SonicTank extends EnemyBase {
    @property(Prefab)
    sonicWavePrefab: Prefab | null = null;
    
    private sonicWaves: any[] = [];
    
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
        const graphics = this.node.addComponent(Graphics);
        if (!graphics) return;
        
        const size = GameConfig.CELL_SIZE * 0.8;  // 比普通坦克大
        const hullRadius = size * 0.25;
        
        graphics.clear();
        
        // 阴影
        graphics.fillColor = cc.color(0, 0, 0, 77);
        graphics.roundRect(-size/2 + 4, -size/2 + 6, size - 8, size - 6, hullRadius);
        graphics.fill();
        
        // 声波坦克主体（紫色）
        graphics.fillColor = cc.color(139, 92, 246, 255);  // 紫色
        graphics.roundRect(
            -size/2 + size * 0.1,
            -size/2 + size * 0.2,
            size * 0.8,
            size * 0.6,
            hullRadius
        );
        graphics.fill();
        
        // 声波发射器（多个圆环）
        graphics.strokeColor = cc.color(167, 139, 250, 255);
        graphics.lineWidth = 3;
        for (let i = 1; i <= 3; i++) {
            graphics.circle(0, 0, size * 0.15 * i);
            graphics.stroke();
        }
        
        // 中央能量核心
        graphics.fillColor = cc.color(196, 181, 253, 255);
        graphics.circle(0, 0, size * 0.12);
        graphics.fill();
        
        // 发光效果
        graphics.fillColor = cc.color(167, 139, 250, 128);
        graphics.circle(0, 0, size * 0.18);
        graphics.fill();
    }
    
    /**
     * 更新声波坦克（由 EnemyManager 调用）
     */
    updateEnemy(deltaTime: number, deltaMS: number, weapons: any[]) {
        super.updateEnemy(deltaTime, deltaMS, weapons);
        
        // 更新声波
        this.sonicWaves = this.sonicWaves.filter(wave => {
            if (!wave || !wave.isValid) return false;
            
            const waveComp = wave.getComponent('SonicWave');
            if (waveComp) {
                waveComp.update(deltaTime, deltaMS, weapons);
                
                if (waveComp.shouldDestroy()) {
                    wave.destroy();
                    return false;
                }
            }
            
            return true;
        });
    }
    
    /**
     * 发射声波
     */
    protected fire(target: any) {
        if (!this.sonicWavePrefab) return;
        
        // 创建声波
        const waveNode = instantiate(this.sonicWavePrefab);
        waveNode.setPosition(this.node.position.clone());
        
        // 初始化声波
        const waveComp = waveNode.getComponent('SonicWave');
        if (waveComp) {
            waveComp.init({
                damage: this.damage,
                maxRadius: GameConfig.SONIC_WAVE_MAX_RADIUS,
                expandSpeed: GameConfig.SONIC_WAVE_EXPAND_SPEED,
                lifetime: GameConfig.SONIC_WAVE_LIFETIME,
                color: 0x8b5cf6
            });
        }
        
        // 添加到场景
        const world = this.node.parent;
        if (world) {
            world.addChild(waveNode);
            this.sonicWaves.push(waveNode);
        }
        
        // 播放音效
        const soundManager = this.gameContext?.soundManager;
        if (soundManager) {
            soundManager.playFire();
        }
    }
    
    onDestroy() {
        // 清理所有声波
        this.sonicWaves.forEach(wave => {
            if (wave && wave.isValid) {
                wave.destroy();
            }
        });
        this.sonicWaves = [];
    }
}

