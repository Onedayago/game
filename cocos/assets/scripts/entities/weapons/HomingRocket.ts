/**
 * 追踪火箭
 * 会追踪目标的导弹
 */

import { _decorator, Component, Node, Vec3, Graphics } from 'cc';
import { GameConfig } from '../../config/GameConfig';
import { ColorCache } from '../../config/Colors';

const { ccclass } = _decorator;

interface RocketConfig {
    speed: number;
    damage: number;
    turnRate: number;
    color: number;
}

@ccclass('HomingRocket')
export class HomingRocket extends Component {
    private target: Node | null = null;
    private velocity: Vec3 = new Vec3();
    private speed: number = 200;
    private damage: number = 2;
    private turnRate: number = Math.PI * 1.1;
    private color: number = 0xc026d3;
    private radius: number = GameConfig.BULLET_RADIUS * 0.6;
    private shouldDestroyed: boolean = false;
    
    /**
     * 初始化火箭
     */
    init(target: Node, config: RocketConfig) {
        this.target = target;
        this.speed = config.speed;
        this.damage = config.damage;
        this.turnRate = config.turnRate;
        this.color = config.color;
        
        // 创建火箭视觉
        this.createVisual();
        
        // 初始速度朝向目标
        if (target) {
            const dir = new Vec3();
            Vec3.subtract(dir, target.position, this.node.position);
            dir.normalize();
            Vec3.multiplyScalar(this.velocity, dir, this.speed);
        }
    }
    
    /**
     * 创建火箭视觉
     */
    private createVisual() {
        const graphics = this.node.addComponent(Graphics);
        if (!graphics) return;
        
        const color = ColorCache.get(this.color);
        
        graphics.clear();
        graphics.fillColor = cc.color(color.r, color.g, color.b, 255);
        
        // 火箭头部（紫色圆圈）
        graphics.circle(0, 0, this.radius);
        graphics.fill();
        
        // 火箭尾焰（黄色小圆圈）
        graphics.fillColor = cc.color(255, 200, 0, 200);
        graphics.circle(-this.radius, 0, this.radius * 0.5);
        graphics.fill();
    }
    
    /**
     * 更新火箭（由 RocketTower 调用，不是 Cocos 生命周期）
     */
    updateRocket(deltaTime: number, deltaMS: number, enemies: any[]) {
        if (this.shouldDestroyed) return;
        
        // 追踪目标
        if (this.target && this.target.isValid) {
            const dir = new Vec3();
            Vec3.subtract(dir, this.target.position, this.node.position);
            dir.normalize();
            
            // 计算当前速度方向
            const currentDir = this.velocity.clone().normalize();
            
            // 计算转向
            const angle = Math.atan2(dir.y, dir.x);
            const currentAngle = Math.atan2(currentDir.y, currentDir.x);
            
            let angleDiff = angle - currentAngle;
            // 规范化角度差
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            // 限制转向速率
            const maxTurn = this.turnRate * deltaTime;
            angleDiff = Math.max(-maxTurn, Math.min(maxTurn, angleDiff));
            
            const newAngle = currentAngle + angleDiff;
            this.velocity.x = Math.cos(newAngle) * this.speed;
            this.velocity.y = Math.sin(newAngle) * this.speed;
            
            // 更新火箭旋转
            this.node.angle = -newAngle * 180 / Math.PI;
        }
        
        // 移动火箭
        const movement = this.velocity.clone().multiplyScalar(deltaTime);
        this.node.position = this.node.position.add(movement);
        
        // 检查碰撞
        this.checkCollision(enemies);
        
        // 检查边界
        this.checkBounds();
    }
    
    /**
     * 检查与敌人的碰撞
     */
    private checkCollision(enemies: any[]) {
        // 确保 enemies 是数组
        if (!enemies || !Array.isArray(enemies)) {
            return;
        }
        
        for (const enemy of enemies) {
            if (!enemy || !enemy.isValid) continue;
            
            const dist = Vec3.distance(this.node.position, enemy.position);
            const hitRadius = this.radius + GameConfig.CELL_SIZE * 0.35;
            
            if (dist < hitRadius) {
                // 击中敌人
                const enemyComp = enemy.getComponent('EnemyBase');
                if (enemyComp) {
                    enemyComp.registerHit(this.damage);
                }
                
                // 创建爆炸效果（简化）
                this.createExplosion();
                
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
     * 创建爆炸效果
     */
    private createExplosion() {
        // TODO: 使用粒子系统创建爆炸效果
    }
    
    /**
     * 是否应该销毁
     */
    shouldDestroy(): boolean {
        return this.shouldDestroyed;
    }
    
    /**
     * 获取伤害值
     */
    getDamage(): number {
        return this.damage;
    }
}

