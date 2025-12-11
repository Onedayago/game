/**
 * 粒子管理器
 * 负责创建和管理游戏中的粒子特效
 */

import { _decorator, Component, Node, Vec3, Color, Graphics } from 'cc';
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
        ParticleManager.instance = this;
    }
    
    update(deltaTime: number) {
        // 更新所有粒子
        this.particles = this.particles.filter(particle => {
            particle.lifetime -= deltaTime;
            
            if (particle.lifetime <= 0) {
                this.recycleParticle(particle.node);
                return false;
            }
            
            // 更新位置
            const movement = particle.velocity.clone().multiplyScalar(deltaTime);
            particle.node.position = particle.node.position.add(movement);
            
            // 更新透明度（渐隐）
            const alpha = particle.lifetime / particle.maxLifetime;
            particle.node.opacity = alpha * 255;
            
            // 更新大小（缩小）
            const scale = 0.5 + alpha * 0.5;
            particle.node.scale = new Vec3(scale, scale, 1);
            
            return true;
        });
    }
    
    /**
     * 创建爆炸效果
     */
    createExplosion(x: number, y: number, color: Color, count: number = 8) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 100 + Math.random() * 100;
            const velocity = new Vec3(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                0
            );
            
            this.createParticle(x, y, velocity, color, 0.5, 4);
        }
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
            const velocity = new Vec3(
                Math.cos(particleAngle) * speed,
                Math.sin(particleAngle) * speed,
                0
            );
            
            this.createParticle(x, y, velocity, color, 0.3, 3);
        }
    }
    
    /**
     * 创建击中火花
     */
    createHitSpark(x: number, y: number, color: Color) {
        const count = 5;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 80 + Math.random() * 40;
            const velocity = new Vec3(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                0
            );
            
            this.createParticle(x, y, velocity, color, 0.4, 2);
        }
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
        size: number
    ) {
        const node = this.getParticleNode();
        node.setPosition(new Vec3(x, y, 0));
        
        // 绘制粒子
        const graphics = node.getComponent(Graphics);
        if (graphics) {
            graphics.clear();
            graphics.fillColor = color;
            graphics.circle(0, 0, size);
            graphics.fill();
        }
        
        this.particles.push({
            node,
            velocity,
            lifetime,
            maxLifetime: lifetime,
            color,
            size
        });
    }
    
    /**
     * 获取粒子节点（从池中获取或创建新的）
     */
    private getParticleNode(): Node {
        let node: Node;
        
        if (this.particlePool.length > 0) {
            node = this.particlePool.pop()!;
            node.active = true;
        } else {
            node = new Node('Particle');
            node.addComponent(Graphics);
        }
        
        if (this.node) {
            this.node.addChild(node);
        }
        
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

