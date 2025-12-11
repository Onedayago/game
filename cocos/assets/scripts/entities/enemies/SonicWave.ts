/**
 * 声波攻击
 * 扩散的声波，范围伤害
 */

import { _decorator, Component, Vec3, Graphics } from 'cc';
import { GameConfig } from '../../config/GameConfig';
import { GameContext } from '../../core/GameContext';

const { ccclass } = _decorator;

interface SonicWaveConfig {
    damage: number;
    maxRadius: number;
    expandSpeed: number;
    lifetime: number;
    color: number;
}

@ccclass('SonicWave')
export class SonicWave extends Component {
    private currentRadius: number = 0;
    private maxRadius: number = 400;
    private expandSpeed: number = 180;
    private lifetime: number = 2000;
    private damage: number = 2;
    private color: number = 0x8b5cf6;
    private timeLeft: number = 0;
    private hitWeapons: Set<any> = new Set();
    private graphics: Graphics | null = null;
    
    /**
     * 初始化声波
     */
    init(config: SonicWaveConfig) {
        this.damage = config.damage;
        this.maxRadius = config.maxRadius;
        this.expandSpeed = config.expandSpeed;
        this.lifetime = config.lifetime;
        this.color = config.color;
        this.timeLeft = this.lifetime;
        this.currentRadius = GameConfig.CELL_SIZE * 0.5;
        
        // 创建Graphics组件
        this.graphics = this.node.addComponent(Graphics);
        this.updateVisual();
    }
    
    /**
     * 更新视觉
     */
    private updateVisual() {
        if (!this.graphics) return;
        
        this.graphics.clear();
        
        // 计算透明度（随时间淡出）
        const alpha = this.timeLeft / this.lifetime;
        
        // 绘制多层声波环
        for (let i = 0; i < 3; i++) {
            const offset = i * 20;
            const radius = this.currentRadius - offset;
            if (radius <= 0) continue;
            
            this.graphics.lineWidth = 3 - i;
            this.graphics.strokeColor = cc.color(139, 92, 246, alpha * 255 * (1 - i * 0.3));
            this.graphics.circle(0, 0, radius);
            this.graphics.stroke();
        }
    }
    
    /**
     * Cocos 生命周期 update（只接收 deltaTime）
     */
    update(deltaTime: number) {
        const deltaMS = deltaTime * 1000;
        
        // 扩散
        this.currentRadius += this.expandSpeed * deltaTime;
        
        // 减少剩余时间
        this.timeLeft -= deltaMS;
        
        // 更新视觉
        this.updateVisual();
        
        // 从 GameContext 获取武器列表
        const gameContext = GameContext.getInstance();
        const weapons = gameContext.weapons || [];
        
        // 检查与武器的碰撞
        this.checkCollision(weapons);
    }
    
    /**
     * 检查与武器的碰撞
     */
    private checkCollision(weapons: any[]) {
        // 确保 weapons 是数组
        if (!weapons || !Array.isArray(weapons)) {
            return;
        }
        
        for (const weapon of weapons) {
            if (!weapon || !weapon.isValid) continue;
            if (this.hitWeapons.has(weapon)) continue;  // 每个武器只击中一次
            
            const dist = Vec3.distance(this.node.position, weapon.position);
            
            // 检查是否在声波环的范围内
            const waveThickness = 30;  // 声波环的厚度
            if (Math.abs(dist - this.currentRadius) < waveThickness) {
                // 击中武器
                const weaponComp = weapon.getComponent('WeaponBase');
                if (weaponComp) {
                    const destroyed = weaponComp.takeDamage(this.damage);
                    if (destroyed) {
                        weapon.destroy();
                    }
                }
                
                this.hitWeapons.add(weapon);
            }
        }
    }
    
    /**
     * 是否应该销毁
     */
    shouldDestroy(): boolean {
        return this.timeLeft <= 0 || this.currentRadius >= this.maxRadius;
    }
}

