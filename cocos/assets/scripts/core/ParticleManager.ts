/**
 * 粒子管理器
 * 负责创建和管理游戏中的粒子特效
 */

import { _decorator, Component, Node, Vec3, Color, Graphics, UITransform, Sprite } from 'cc';
import { GameConfig } from '../config/GameConfig';

const { ccclass } = _decorator;

interface Particle {
    node: Node;
    velocity: Vec3;
    lifetime: number;
    maxLifetime: number;
    color: Color;
    size: number;
}

@ccclass('ParticleManager')
export class ParticleManager extends Component {
    // 显式声明 node 属性
    declare node: Node;
    
    private static instance: ParticleManager;
    private particles: Particle[] = [];
    private particlePool: Node[] = [];
    
    static getInstance(): ParticleManager {
        if (!ParticleManager.instance) {
            ParticleManager.instance = new ParticleManager();
        }
        return ParticleManager.instance;
    }
    
    onLoad() {
        // 如果已经有实例且不是当前实例，说明有重复创建
        // 这种情况下，销毁当前实例，使用已存在的实例
        if (ParticleManager.instance && ParticleManager.instance !== this) {
           
            return;
        }
        
        ParticleManager.instance = this;
    }
    
    update(deltaTime: number) {
        
        const deltaMS = deltaTime * 1000; // 转换为毫秒
        
    
        // 更新所有粒子
        this.particles = this.particles.filter(particle => {
            particle.lifetime -= deltaMS;
            
            if (particle.lifetime <= 0) {
                this.recycleParticle(particle.node);
                return false;
            }
            
            // 更新位置（非扩展粒子）
            if (!(particle as any).isExpanding) {
                const movement = particle.velocity.clone().multiplyScalar(deltaTime);
                const newPos = particle.node.position.clone().add(movement);
                particle.node.setPosition(newPos);
            }
            
            // 更新透明度和缩放
            const alpha = particle.lifetime / particle.maxLifetime;
            const expandingParticle = particle as any;
            
            if (expandingParticle.isExpanding) {
                // 扩展粒子：逐渐放大并淡出
                const scaleProgress = 1 - alpha;
                const currentScale = expandingParticle.scaleStart + 
                    (expandingParticle.scaleEnd - expandingParticle.scaleStart) * scaleProgress;
                particle.node.setScale(new Vec3(currentScale, currentScale, 1));
                
                const currentAlpha = expandingParticle.alphaStart + 
                    (expandingParticle.alphaEnd - expandingParticle.alphaStart) * (1 - alpha);
                particle.node.opacity = currentAlpha * 255;
            } else {
                // 普通粒子：渐隐并缩小
                particle.node.opacity = alpha * 255;
                const scaleStart = expandingParticle.scaleStart || 1;
                const scaleEnd = expandingParticle.scaleEnd || 0.1;
                const currentScale = scaleStart + (scaleEnd - scaleStart) * (1 - alpha);
                particle.node.setScale(new Vec3(currentScale, currentScale, 1));
            }
            
            return true;
        });
    }
    
    
    /**
     * 创建枪口闪光
     */
    createMuzzleFlash(x: number, y: number, angle: number, color: Color) {
        const count = 6;
        const spread = Math.PI / 4;  // 45度扩散
        
        for (let i = 0; i < count; i++) {
            const particleAngle = angle + (Math.random() - 0.5) * spread;
            const speed = 150 + Math.random() * 50;
            // 注意：Cocos Creator Y 轴向上，所以 Y 分量需要取反
            const velocity = new Vec3(
                Math.cos(particleAngle) * speed,
                -Math.sin(particleAngle) * speed,  // Y 轴向上，取反
                0
            );
            
            this.createParticle(x, y, velocity, color, 0.3, 3);
        }
    }
    
    /**
     * 创建击中火花特效（参考原游戏，包含多层效果）
     * 包含：外圈冲击波、霓虹闪光、能量爆裂、小型火花、霓虹光环、电弧
     */
    createHitSpark(x: number, y: number, color: Color) {
        // 确保使用正确的实例（静态方法，总是使用单例）
        const instance = ParticleManager.instance || this;
        if (instance !== this) {
            instance.createHitSpark(x, y, color);
            return;
        }
        
        // 确保 ParticleManager 的 node 存在且激活
        if (!this.node || !this.node.isValid) {
            return;
        }
        
        const scale = 1; // Cocos Creator 中不需要额外缩放
        
        // 1. 外圈冲击波（静止，逐渐放大并淡出）- 进一步缩小
        this.createExpandingParticle(x, y, color, 8 * scale, 0.3, 1, 2.5, 0.4, 0);
        
        // 2. 霓虹击中闪光（白色，快速闪烁）- 进一步缩小
        const whiteColor = new Color(255, 255, 255, 200); // 稍微透明
        this.createExpandingParticle(x, y, whiteColor, 6 * scale, 0.12, 1.2, 2.0, 0.8, 0);
        
        // 3. 主色能量爆裂（6个粒子，向四周扩散）- 进一步缩小
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6;
            const speed = 120 * scale;
            // 注意：Cocos Creator Y 轴向上，所以 Y 分量需要取反
            const velocity = new Vec3(
                Math.cos(angle) * speed,
                -Math.sin(angle) * speed,  // Y 轴向上，取反
                0
            );
            this.createParticle(x, y, velocity, color, 0.3, 2.5 * scale, 1.2, 0.3, 0.9, 0);
        }
        
        // 4. 小型火花（3个粒子，暖色调）- 进一步缩小
        const sparkColor = new Color(254, 243, 199, 200); // 稍微透明
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 * scale;
            // 注意：Cocos Creator Y 轴向上，所以 Y 分量需要取反
            const velocity = new Vec3(
                Math.cos(angle) * speed,
                -Math.sin(angle) * speed,  // Y 轴向上，取反
                0
            );
            this.createParticle(x, y, velocity, sparkColor, 0.15, 1.5 * scale, 1, 0.5, 0.7, 0);
        }
        
        // 5. 霓虹光环（静止，逐渐放大）- 进一步缩小
        this.createExpandingParticle(x, y, color, 5 * scale, 0.15, 1, 2.0, 0.7, 0);
        
        // 6. 电弧效果（4个粒子，洋红色）- 进一步缩小
        const arcColor = new Color(255, 0, 255, 180); // 稍微透明
        for (let i = 0; i < 4; i++) {
            const angle = Math.random() * Math.PI * 1.5;
            const speed = 120 * scale;
            // 注意：Cocos Creator Y 轴向上，所以 Y 分量需要取反
            const velocity = new Vec3(
                Math.cos(angle) * speed,
                -Math.sin(angle) * speed,  // Y 轴向上，取反
                0
            );
            this.createParticle(x, y, velocity, arcColor, 0.25, 1.5 * scale, 1.1, 0.4, 0.85, 0);
        }
    }
    
    /**
     * 创建爆炸效果（用于火箭击中敌人）
     */
    createExplosion(x: number, y: number, color: Color, count: number = 12) {
        // 确保使用正确的实例（静态方法，总是使用单例）
        const instance = ParticleManager.instance || this;
        if (instance !== this) {
            instance.createExplosion(x, y, color, count);
            return;
        }
        
        // 确保 ParticleManager 的 node 存在且激活
        if (!this.node || !this.node.isValid) {
            return;
        }
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = 80 + Math.random() * 80;
            // 注意：Cocos Creator Y 轴向上，所以 Y 分量需要取反
            const velocity = new Vec3(
                Math.cos(angle) * speed,
                -Math.sin(angle) * speed,  // Y 轴向上，取反
                0
            );
            
            // 进一步减小粒子大小，增加透明度，避免遮挡敌人
            this.createParticle(x, y, velocity, color, 0.8, 3, 1.2, 0.3, 0.9, 0);
        }
    }
    
    /**
     * 创建扩展粒子（静止，逐渐放大并淡出）
     */
    private createExpandingParticle(
        x: number,
        y: number,
        color: Color,
        size: number,
        lifetime: number,
        scaleStart: number,
        scaleEnd: number,
        alphaStart: number,
        alphaEnd: number
    ) {
        const node = this.getParticleNode();
        if (!node) {
            return;
        }
        
        // 注意：粒子位置使用世界坐标，但节点是 ParticleManager 的子节点
        // 需要将世界坐标转换为相对于 ParticleManager 节点的本地坐标
        const worldPos = new Vec3(x, y, 0);
        const localPos = this.node ? this.node.inverseTransformPoint(new Vec3(), worldPos) : worldPos;
        node.setPosition(localPos);
        node.setScale(new Vec3(scaleStart, scaleStart, 1));
        node.opacity = alphaStart * 255;
        
        // 确保 layer 正确（重要：每个粒子都要设置）
        if (this.node) {
            node.layer = this.node.layer;
        }
        
        // 确保 Graphics 组件存在
        let graphics = node.getComponent(Graphics);
        if (!graphics) {
            graphics = node.addComponent(Graphics);
        }
        if (graphics) {
            graphics.clear();
            graphics.fillColor = color;
            graphics.circle(0, 0, size);
            graphics.fill();
        } else {
            return;
        }
        
        // lifetime 参数是秒，需要转换为毫秒
        const lifetimeMS = lifetime * 1000;
        
        // 创建扩展粒子对象（特殊处理）
        const particle: any = {
            node,
            velocity: new Vec3(0, 0, 0), // 静止
            lifetime: lifetimeMS,  // 转换为毫秒
            maxLifetime: lifetimeMS,  // 转换为毫秒
            color,
            size,
            scaleStart,
            scaleEnd,
            alphaStart,
            alphaEnd,
            isExpanding: true // 标记为扩展粒子
        };
        
        this.particles.push(particle);
    }
    
    /**
     * 创建单个粒子
     */
    private createParticle(
        x: number,
        y: number,
        velocity: Vec3,
        color: Color,
        lifetime: number,
        size: number,
        scaleStart: number = 1,
        scaleEnd: number = 0.1,
        alphaStart: number = 1,
        alphaEnd: number = 0
    ) {
        const node = this.getParticleNode();
        
        if (!node) {
            return null;
        }
        
        // 注意：粒子位置使用世界坐标，但节点是 ParticleManager 的子节点
        // 需要将世界坐标转换为相对于 ParticleManager 节点的本地坐标
        const worldPos = new Vec3(x, y, 0);
        const localPos = this.node ? this.node.inverseTransformPoint(new Vec3(), worldPos) : worldPos;
        node.setPosition(localPos);
        node.setScale(new Vec3(scaleStart, scaleStart, 1));
        node.opacity = alphaStart * 255;
        
        // 确保 layer 正确（重要：每个粒子都要设置）
        if (this.node) {
            node.layer = this.node.layer;
        }

        // 绘制粒子
        let graphics = node.getComponent(Graphics);
        if (!graphics) {
            graphics = node.addComponent(Graphics);
        }
        if (graphics) {
            graphics.clear();
            graphics.fillColor = color;
            graphics.circle(0, 0, size);
            graphics.fill();
        } else {
            return null;
        }
        
        // lifetime 参数是秒，需要转换为毫秒
        const lifetimeMS = lifetime * 1000;
        
        const particle = {
            node,
            velocity,
            lifetime: lifetimeMS,  // 转换为毫秒
            maxLifetime: lifetimeMS,  // 转换为毫秒
            color,
            size,
            scaleStart,
            scaleEnd,
            alphaStart,
            alphaEnd,
            isExpanding: false
        } as any;
        
        this.particles.push(particle);
        return particle;
    }
    
    /**
     * 获取粒子节点（从池中获取或创建新的）
     */
    private getParticleNode(): Node {
        let node: Node;
        
        if (this.particlePool.length > 0) {
            node = this.particlePool.pop()!;
            node.active = true;
            // 从池中取出的节点，确保 layer 正确
            if (this.node) {
                node.layer = this.node.layer;
            }
        } else {
            node = new Node('Particle');
            const graphics = node.addComponent(Graphics);
            if (graphics) {
                // 确保 Graphics 组件可用
            }
        }
        
        // 确保节点有父节点（ParticleManager 的 node）
        if (this.node && (!node.parent || node.parent !== this.node)) {
            // 先设置 layer，再添加到父节点（避免添加后 layer 被重置）
            node.layer = this.node.layer;
            this.node.addChild(node);
            // 再次确保 layer 正确（某些情况下添加子节点可能会重置 layer）
            node.layer = this.node.layer;
        } else {
            // 如果已经有父节点，直接设置 layer
            node.layer = this.node ? this.node.layer : 0; // 默认 layer 为 0
        }
        
        // 确保节点激活，但不置顶（避免遮挡敌人）
        node.active = true;
        // 不设置 siblingIndex，让粒子在默认位置渲染，避免遮挡游戏对象
        
        return node;
    }
    
    /**
     * 回收粒子节点
     */
    private recycleParticle(node: Node) {
        if (node && node.isValid) {
            node.active = false;
            node.removeFromParent();
            this.particlePool.push(node);
        }
    }
    
    /**
     * 清理所有粒子
     */
    clear() {
        this.particles.forEach(particle => {
            if (particle.node && particle.node.isValid) {
                particle.node.destroy();
            }
        });
        this.particles = [];
        
        this.particlePool.forEach(node => {
            if (node && node.isValid) {
                node.destroy();
            }
        });
        this.particlePool = [];
    }
}

