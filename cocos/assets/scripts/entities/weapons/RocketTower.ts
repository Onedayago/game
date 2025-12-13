/**
 * 火箭塔
 * 发射追踪火箭，高伤害，追踪能力
 */

import { _decorator, Vec3, instantiate, Prefab, Node } from 'cc';
import { WeaponBase } from '../base/WeaponBase';
import { GameConfig } from '../../config/GameConfig';
import { WeaponType } from '../../config/WeaponConfig';
import { HomingRocket } from '../projectiles/HomingRocket';
import { ColorCache, GameColors } from '../../config/Colors';
import { WeaponRenderer } from '../../rendering/WeaponRenderer';

const { ccclass, property } = _decorator;

@ccclass('RocketTower')
export class RocketTower extends WeaponBase {
    @property(Prefab)
    rocketPrefab: Prefab | null = null;
    
    private rockets: HomingRocket[] = [];
    
    onLoad() {
        super.onLoad();
        
        // 设置火箭塔属性
        this.weaponType = WeaponType.ROCKET;
        this.fireInterval = GameConfig.ROCKET_FIRE_INTERVAL;
        this.attackRange = 5;
        this.damage = GameConfig.BULLET_DAMAGE * GameConfig.ROCKET_DAMAGE_MULTIPLIER;
        
        this.applyLevelStats();
        this.createVisual();
    }
    
    /**
     * 创建火箭塔视觉（使用统一渲染器）
     */
    private createVisual() {
        WeaponRenderer.renderRocketTower(this.node, { level: this.level });
    }
    
    /**
     * 应用等级属性
     */
    protected applyLevelStats() {
        if (this.level === 1) {
            this.fireInterval = GameConfig.ROCKET_FIRE_INTERVAL * 1.2;
            this.damage = GameConfig.BULLET_DAMAGE * 2;
        } else if (this.level === 2) {
            this.fireInterval = GameConfig.ROCKET_FIRE_INTERVAL * 1.0;
            this.damage = GameConfig.BULLET_DAMAGE * 2.5;
        } else if (this.level === 3) {
            this.fireInterval = GameConfig.ROCKET_FIRE_INTERVAL * 0.8;
            this.damage = GameConfig.BULLET_DAMAGE * 3;
        }
    }
    
    /**
     * 更新火箭塔（由 WeaponManager 调用）
     */
    updateWeapon(deltaTime: number, deltaMS: number, enemies: any[]) {
        super.updateWeapon(deltaTime, deltaMS, enemies);
        
        // 确保 enemies 是数组
        const enemyList = enemies || [];
        
        // 更新所有火箭
        this.rockets = this.rockets.filter(rocket => {
            if (!rocket || !rocket.node || !rocket.node.isValid) return false;
            
            rocket.updateRocket(deltaTime, deltaMS, enemyList);
            
            if (rocket.shouldDestroy()) {
                rocket.node.destroy();
                return false;
            }
            
            return true;
        });
    }
    
    /**
     * 开火
     */
    protected fire(target: any) {
        if (!target || !target.isValid) {
            return;
        }
        
        // 计算发射位置（从武器中心发射）
        // 注意：Cocos Creator Y 轴向上，需要适配角度计算
        const dx = target.position.x - this.node.position.x;
        const dy = target.position.y - this.node.position.y;
        // 对 dy 取反，适配 Y 轴向上的坐标系
        const angle = Math.atan2(-dy, dx);
        
        // 从武器中心发射
        const muzzleX = this.node.position.x;
        const muzzleY = this.node.position.y;
        
        // 直接创建火箭节点和组件
        const rocketNode = new Node('Rocket');
        rocketNode.setPosition(muzzleX, muzzleY, 0);
        
        const rocket = rocketNode.addComponent(HomingRocket);
        
        // 初始化火箭
        rocket.init(target, {
            speed: GameConfig.BULLET_SPEED * 1.1,
            damage: this.damage,
            turnRate: Math.PI * (1.1 + this.level * 0.2),
            color: 0xc026d3  // 紫色火箭
        });
        
        // 设置火箭的 layer（重要！）
        rocketNode.layer = this.node.layer;
        
        // 添加到场景
        const world = this.node.parent;
        if (world) {
            world.addChild(rocketNode);
            this.rockets.push(rocket);
        }
    }
    
    onDestroy() {
        // 清理所有火箭
        this.rockets.forEach(rocket => {
            if (rocket.node.isValid) {
                rocket.node.destroy();
            }
        });
        this.rockets = [];
    }
}

