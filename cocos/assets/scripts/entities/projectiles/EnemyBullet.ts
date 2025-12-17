/**
 * 敌人子弹
 * 敌人发射的子弹
 */

import { _decorator, Component, Vec3, Graphics, Color } from 'cc';
import { GameConfig } from '../../config/GameConfig';
import { UIConfig } from '../../config/UIConfig';
import { ColorCache, GameColors } from '../../config/Colors';
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
    private radius: number = GameConfig.ENEMY_BULLET_RADIUS;  // 使用敌人子弹半径
    private shouldDestroyed: boolean = false;
    
    private initialized: boolean = false;
    
    /**
     * Cocos 生命周期 onLoad
     */
    onLoad() {
        // 如果已经初始化，立即创建视觉
        if (this.initialized) {
            this.createVisual();
        }
    }
    
    /**
     * Cocos 生命周期 start
     */
    start() {
        // 如果已经初始化，创建视觉（确保节点在场景中）
        if (this.initialized) {
            this.createVisual();
        }
    }
    
    /**
     * 初始化子弹
     */
    init(angle: number, config: BulletConfig) {
        this.speed = config.speed;
        this.damage = config.damage;
        this.color = config.color;
        this.shouldDestroyed = false; // 复用时重置销毁标记
        
        // 设置速度
        // 注意：传入的 angle 是用 Math.atan2(-dy, dx) 计算的（适配 Y 轴向上）
        // 但是速度的 y 分量在 Cocos Creator（Y轴向上）中需要取反
        // 因为原游戏（PixiJS，Y轴向下）中，sin(angle) 是向下的，但在 Cocos 中应该是向上的
        this.velocity.x = Math.cos(angle) * this.speed;
        this.velocity.y = -Math.sin(angle) * this.speed;  // 对 y 分量取反
        
        // 设置子弹旋转角度
        // Cocos Creator 的 angle 属性是顺时针旋转的，而 Math.atan2 返回的是逆时针角度
        // 所以需要取负号
        this.node.angle = -angle * 180 / Math.PI;
        
        // 确保节点激活
        this.node.active = true;
        
        this.initialized = true;
        
        
        // 如果节点已经在场景中，立即创建视觉
        // 否则会在 onLoad 或 start 中创建
        if (this.node.parent && this.node.parent.isValid) {
            this.createVisual();
        }
    }
    
    /**
     * 创建子弹视觉（美化版本，增强视觉效果）
     */
    private createVisual() {
        // 检查是否已经有 Graphics 组件
        let graphics = this.node.getComponent(Graphics);
        if (!graphics) {
            graphics = this.node.addComponent(Graphics);
        }
        if (!graphics) {
            console.error('[EnemyBullet] createVisual: failed to get or create Graphics component');
            return;
        }
        
        const color = ColorCache.get(this.color);
        const enemyDetailColor = ColorCache.get(GameColors.ENEMY_DETAIL);
        
        graphics.clear();
        
        // 确保半径足够大
        const minRadius = GameConfig.ENEMY_BULLET_MIN_RADIUS;
        const drawRadius = Math.max(this.radius, minRadius);
        
        // 最外层光晕（非常淡，增强发光感）- 缩小范围
        graphics.fillColor = new Color(color.r, color.g, color.b, 60); // alpha 0.24
        graphics.circle(0, 0, drawRadius * 1.8);
        graphics.fill();
        
        // 外层光晕（较大）- 缩小范围
        graphics.fillColor = new Color(color.r, color.g, color.b, 102); // alpha 0.4
        graphics.circle(0, 0, drawRadius * 1.5);
        graphics.fill();
        
        // 中层光晕 - 缩小范围
        graphics.fillColor = new Color(color.r, color.g, color.b, 153); // alpha 0.6
        graphics.circle(0, 0, drawRadius * 1.25);
        graphics.fill();
        
        // 内层光晕 - 缩小范围
        graphics.fillColor = new Color(color.r, color.g, color.b, 204); // alpha 0.8
        graphics.circle(0, 0, drawRadius * 1.1);
        graphics.fill();
        
        // 核心子弹（最亮）
        graphics.fillColor = new Color(color.r, color.g, color.b, 255);
        graphics.circle(0, 0, drawRadius);
        graphics.fill();
        
        // 核心内圈（更亮的中心）- 调整大小
        graphics.fillColor = new Color(enemyDetailColor.r, enemyDetailColor.g, enemyDetailColor.b, 255);
        graphics.circle(0, 0, drawRadius * 0.65);
        graphics.fill();
        
        // 中心亮点（白色高光）- 调整大小
        graphics.fillColor = new Color(255, 255, 255, 230);
        graphics.circle(0, 0, drawRadius * 0.35);
        graphics.fill();
        
        // 高光点（左上角，增强立体感）- 调整位置和大小
        graphics.fillColor = new Color(255, 255, 255, 204);
        graphics.circle(drawRadius * 0.35, -drawRadius * 0.35, drawRadius * 0.2);
        graphics.fill();
        
        // 外圈装饰环（细线）- 缩小范围
        graphics.lineWidth = 1;
        graphics.strokeColor = new Color(color.r, color.g, color.b, 128); // alpha 0.5
        graphics.circle(0, 0, drawRadius * 1.3);
        graphics.stroke();
    }
    
    /**
     * Cocos 生命周期 update（只接收 deltaTime）
     */
    update(deltaTime: number) {
        // 如果已标记销毁或节点无效，跳过
        if (this.shouldDestroyed || !this.node || !this.node.isValid) {
            return;
        }
        
        // 计算移动后的新位置
        const movementX = this.velocity.x * deltaTime;
        const movementY = this.velocity.y * deltaTime;
        const currentPos = this.node.position;
        const newPos = new Vec3(
            currentPos.x + movementX,
            currentPos.y + movementY,
            currentPos.z
        );
        
        // 碰撞检测（使用新位置，避免穿透）
        const gameContext = GameContext.getInstance();
        const weapons = gameContext.weapons || [];
        const hit = this.checkCollisionAtPosition(weapons, newPos);
        if (hit) {
            this.shouldDestroyed = true;
            return;
        }
        
        // 移动
        this.node.setPosition(newPos);
        
        // 边界检测
        this.checkBounds();
    }
    
    /**
     * 检查与武器的碰撞（在指定位置）
     */
    private checkCollisionAtPosition(weapons: any[], position: Vec3): boolean {
        // 确保 weapons 是数组
        if (!weapons || !Array.isArray(weapons)) {
            return false;
        }
        
        // 武器半径（参考原游戏：TANK_SIZE * 0.4，TANK_SIZE= CELL_SIZE*0.8）
        const weaponRadius = GameConfig.CELL_SIZE * UIConfig.WEAPON_MAP_SIZE_RATIO * 0.5;
        const hitRadius = this.radius + weaponRadius + 2; // 额外 2 像素容差，避免穿透
        
        for (const weapon of weapons) {
            // 兼容 Node 数组或组件数组
            const weaponNode = (weapon as any)?.node ?? weapon;
            if (!weaponNode || !weaponNode.isValid) continue;
            
            const dist = Vec3.distance(position, weaponNode.position);
            
            if (dist < hitRadius) {
                // 优先用组件的 takeDamage；否则尝试从 node 获取 WeaponBase
                let destroyed = false;
                if (typeof (weapon as any)?.takeDamage === 'function') {
                    destroyed = (weapon as any).takeDamage(this.damage);
                } else {
                    const weaponComp = weaponNode.getComponent('WeaponBase') as any;
                    if (weaponComp && typeof weaponComp.takeDamage === 'function') {
                        destroyed = weaponComp.takeDamage(this.damage);
                    }
                }
                
                if (destroyed && weaponNode.isValid) {
                    weaponNode.destroy();
                }
                
                this.shouldDestroyed = true;
                return true;  // 返回 true 表示发生碰撞
            }
        }
        
        return false;  // 没有碰撞
    }
    
    /**
     * 检查边界
     */
    private checkBounds() {
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
}

