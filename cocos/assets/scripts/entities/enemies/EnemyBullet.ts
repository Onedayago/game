/**
 * 敌人子弹
 * 敌人发射的子弹
 */

import { _decorator, Component, Vec3, Graphics } from 'cc';
import { GameConfig } from '../../config/GameConfig';
import { ColorCache } from '../../config/Colors';
import { GameContext } from '../../core/GameContext';

const { ccclass } = _decorator;

interface BulletConfig {
    speed: number;
    damage: number;
    color: number;
}

@ccclass('EnemyBullet')
export class EnemyBullet extends Component {
    private velocity: Vec3 = new Vec3();
    private speed: number = 160;
    private damage: number = 1;
    private color: number = 0xff00ff;
    private radius: number = GameConfig.BULLET_RADIUS;
    private shouldDestroyed: boolean = false;
    
    /**
     * 初始化子弹
     */
    init(angle: number, config: BulletConfig) {
        this.speed = config.speed;
        this.damage = config.damage;
        this.color = config.color;
        
        // 设置速度
        this.velocity.x = Math.cos(angle) * this.speed;
        this.velocity.y = Math.sin(angle) * this.speed;
        
        // 创建视觉
        this.createVisual();
    }
    
    /**
     * 创建子弹视觉
     */
    private createVisual() {
        const graphics = this.node.addComponent(Graphics);
        if (!graphics) return;
        
        const color = ColorCache.get(this.color);
        
        graphics.clear();
        graphics.fillColor = cc.color(color.r, color.g, color.b, 255);
        graphics.circle(0, 0, this.radius);
        graphics.fill();
        
        // 外层光晕
        graphics.fillColor = cc.color(color.r, color.g, color.b, 128);
        graphics.circle(0, 0, this.radius * 1.3);
        graphics.fill();
    }
    
    /**
     * Cocos 生命周期 update（只接收 deltaTime）
     */
    update(deltaTime: number) {
        if (this.shouldDestroyed) return;
        
        // 移动子弹
        const movement = this.velocity.clone().multiplyScalar(deltaTime);
        this.node.position = this.node.position.add(movement);
        
        // 从 GameContext 获取武器列表
        const gameContext = GameContext.getInstance();
        const weapons = gameContext.weapons || [];
        
        // 检查与武器的碰撞
        this.checkCollision(weapons);
        
        // 检查边界
        this.checkBounds();
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
            
            const dist = Vec3.distance(this.node.position, weapon.position);
            const hitRadius = this.radius + GameConfig.CELL_SIZE * 0.4;
            
            if (dist < hitRadius) {
                // 击中武器
                const weaponComp = weapon.getComponent('WeaponBase');
                if (weaponComp) {
                    const destroyed = weaponComp.takeDamage(this.damage);
                    if (destroyed) {
                        // 武器被摧毁
                        weapon.destroy();
                    }
                }
                
                this.shouldDestroyed = true;
                return;
            }
        }
    }
    
    /**
     * 检查边界
     */
    private checkBounds() {
        const pos = this.node.position;
        if (pos.x < -100 || pos.x > GameConfig.DESIGN_WIDTH + 100 ||
            pos.y < -100 || pos.y > GameConfig.DESIGN_HEIGHT + 100) {
            this.shouldDestroyed = true;
        }
    }
    
    /**
     * 是否应该销毁
     */
    shouldDestroy(): boolean {
        return this.shouldDestroyed;
    }
}

