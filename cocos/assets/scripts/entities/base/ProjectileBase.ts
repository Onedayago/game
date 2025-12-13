/**
 * 抛射物基类
 * 所有抛射物（子弹、火箭、激光束等）的父类
 */

import { _decorator, Component, Node, Vec3 } from 'cc';
import { GameConfig } from '../../config/GameConfig';

const { ccclass, property } = _decorator;

/**
 * 抛射物类型
 */
export enum ProjectileType {
    ROCKET = 'rocket',          // 追踪火箭
    BULLET = 'bullet',          // 普通子弹
    LASER = 'laser',            // 激光束
    SONIC_WAVE = 'sonic_wave'   // 音波
}

@ccclass('ProjectileBase')
export class ProjectileBase extends Component {
    // 抛射物类型
    protected projectileType: ProjectileType = ProjectileType.BULLET;
    
    // 目标
    protected target: Node | null = null;
    
    // 运动属性
    protected velocity: Vec3 = new Vec3();
    protected speed: number = 200;
    
    // 伤害属性
    protected damage: number = 1;
    
    // 生命周期
    protected lifetime: number = 5000; // 毫秒
    protected shouldDestroyed: boolean = false;
    
    /**
     * 初始化抛射物
     */
    init(target: Node, damage: number, speed: number): void {
        this.target = target;
        this.damage = damage;
        this.speed = speed;
    }
    
    /**
     * 更新抛射物（由父对象调用）
     */
    updateProjectile(deltaTime: number, deltaMS: number, enemies: any[]): void {
        if (this.shouldDestroyed) return;
        
        // 更新生命周期
        this.lifetime -= deltaMS;
        if (this.lifetime <= 0) {
            this.shouldDestroyed = true;
            return;
        }
        
        // 移动
        this.move(deltaTime, deltaMS);
        
        // 检查碰撞
        this.checkCollision(enemies);
        
        // 检查边界
        this.checkBounds();
    }
    
    /**
     * 移动（子类可以重写）
     */
    protected move(deltaTime: number, deltaMS: number): void {
        // 默认直线移动
        const movement = this.velocity.clone().multiplyScalar(deltaTime);
        this.node.position = this.node.position.add(movement);
    }
    
    /**
     * 检查碰撞（子类可以重写）
     */
    protected checkCollision(enemies: any[]): void {
        // 子类实现
    }
    
    /**
     * 检查边界
     */
    protected checkBounds(): void {
        const pos = this.node.position;
        const margin = GameConfig.PROJECTILE_BOUNDS_MARGIN;
        
        if (pos.x < -margin || pos.x > GameConfig.DESIGN_WIDTH + margin ||
            pos.y < -margin || pos.y > GameConfig.DESIGN_HEIGHT + margin) {
            this.shouldDestroyed = true;
        }
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
    
    /**
     * 获取目标
     */
    getTarget(): Node | null {
        return this.target;
    }
    
    /**
     * 设置目标
     */
    setTarget(target: Node | null): void {
        this.target = target;
    }
    
    /**
     * 标记为销毁
     */
    markForDestroy(): void {
        this.shouldDestroyed = true;
    }
}

