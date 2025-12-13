/**
 * 追踪火箭
 * 会追踪目标的导弹
 */

import { _decorator, Node, Vec3, Graphics } from 'cc';
import { GameConfig } from '../../config/GameConfig';
import { ColorCache, hexToColor } from '../../config/Colors';
import { WeaponRenderer } from '../../rendering/WeaponRenderer';
import { ProjectileBase, ProjectileType } from '../base/ProjectileBase';
import { GameContext } from '../../core/GameContext';

const { ccclass } = _decorator;

interface RocketConfig {
    speed: number;
    damage: number;
    turnRate: number;
    color: number;
}

@ccclass('HomingRocket')
export class HomingRocket extends ProjectileBase {
    // 追踪火箭特有属性
    private turnRate: number = Math.PI * 1.1;
    private color: number = 0xc026d3;
    private radius: number = GameConfig.BULLET_RADIUS * 0.6;
    
    /**
     * 初始化火箭（重写基类方法）
     */
    init(target: Node, config: RocketConfig) {
        // 调用基类初始化
        super.init(target, config.damage, config.speed);
        
        // 设置抛射物类型
        this.projectileType = ProjectileType.ROCKET;
        
        // 设置追踪火箭特有属性
        this.turnRate = config.turnRate;
        this.color = config.color;
        
        // 创建火箭视觉
        this.createVisual();
        
        // 初始速度朝向目标
        // 注意：Cocos Creator Y 轴向上，需要适配角度计算
        if (target) {
            const dx = target.position.x - this.node.position.x;
            const dy = target.position.y - this.node.position.y;
            // 对 dy 取反，适配 Y 轴向上的坐标系
            const angle = Math.atan2(-dy, dx);
            this.velocity.x = Math.cos(angle) * this.speed;
            this.velocity.y = Math.sin(angle) * this.speed;
            // 设置初始旋转角度（Cocos Creator 的 angle 是顺时针，需要取负）
            this.node.angle = -angle * 180 / Math.PI;
        }
    }
    
    /**
     * 创建火箭视觉（使用统一渲染器）
     */
    private createVisual() {
        WeaponRenderer.renderHomingRocket(this.node, this.color, this.radius);
    }
    
    /**
     * 更新火箭（由 RocketTower 调用）
     * 为了兼容性保留此方法，内部调用基类的 updateProjectile
     */
    updateRocket(deltaTime: number, deltaMS: number, enemies: any[]) {
        this.updateProjectile(deltaTime, deltaMS, enemies);
    }
    
    /**
     * 移动（重写基类方法，实现追踪逻辑）
     * 注意：Cocos Creator Y 轴向上，需要适配角度计算
     */
    protected move(deltaTime: number, deltaMS: number): void {
        // 追踪目标
        if (this.target && this.target.isValid) {
            const dx = this.target.position.x - this.node.position.x;
            const dy = this.target.position.y - this.node.position.y;
            
            // 计算期望角度（对 dy 取反，适配 Y 轴向上）
            const desiredAngle = Math.atan2(-dy, dx);
            
            // 计算当前速度方向角度（对 velocity.y 取反，适配 Y 轴向上）
            const currentAngle = Math.atan2(-this.velocity.y, this.velocity.x);
            
            let angleDiff = desiredAngle - currentAngle;
            // 规范化角度差到 [-π, π] 范围
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            // 限制转向速率
            const maxTurn = this.turnRate * deltaTime;
            angleDiff = Math.max(-maxTurn, Math.min(maxTurn, angleDiff));
            
            const newAngle = currentAngle + angleDiff;
            // 更新速度（注意：在 Cocos Creator 中，Y 轴向上，所以 velocity.y 不需要取反）
            this.velocity.x = Math.cos(newAngle) * this.speed;
            this.velocity.y = -Math.sin(newAngle) * this.speed;  // 对 sin 取反，适配 Y 轴向上
            
            // 更新火箭旋转（Cocos Creator 的 angle 是顺时针，需要取负）
            this.node.angle = -newAngle * 180 / Math.PI;
        }
        
        // 移动火箭
        const movement = this.velocity.clone().multiplyScalar(deltaTime);
        this.node.position = this.node.position.add(movement);
    }
    
    /**
     * 检查与敌人的碰撞（重写基类方法）
     */
    protected checkCollision(enemies: any[]): void {
        // 确保 enemies 是数组
        if (!enemies || !Array.isArray(enemies)) {
            return;
        }
        
        for (const enemy of enemies) {
            if (!enemy || !enemy.isValid) continue;
            
            const dist = Vec3.distance(this.node.position, enemy.position);
            const hitRadius = this.radius + GameConfig.CELL_SIZE * 0.35;
            
            if (dist < hitRadius) {
                // 创建爆炸粒子效果（在击中位置）
                const gameContext = GameContext.getInstance();
                if (gameContext.particleManager) {
                    const explosionColor = hexToColor(this.color);
                    const worldPos = this.node.getWorldPosition();
                    gameContext.particleManager.createExplosion(
                        worldPos.x,
                        worldPos.y,
                        explosionColor,
                        12
                    );
                }
                
                // 击中敌人
                const enemyComp = enemy.getComponent('EnemyBase');
                if (enemyComp) {
                    enemyComp.registerHit(this.damage);
                }
                
                this.shouldDestroyed = true;
                return;
            }
        }
    }
    
}

