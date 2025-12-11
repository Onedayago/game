/**
 * 火箭塔
 * 发射追踪火箭，高伤害，追踪能力
 */

import { _decorator, Vec3, instantiate, Prefab, Node } from 'cc';
import { WeaponBase } from '../WeaponBase';
import { GameConfig, WeaponType } from '../../config/GameConfig';
import { HomingRocket } from './HomingRocket';
import { ColorCache, GameColors } from '../../config/Colors';

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
     * 创建火箭塔视觉
     */
    private createVisual() {
        const graphics = this.node.addComponent(cc.Graphics);
        if (!graphics) return;
        
        const size = GameConfig.CELL_SIZE;
        const baseWidth = size * 0.7;
        const baseHeight = size * 0.3;
        const towerWidth = size * 0.34;
        const towerHeight = size * 0.9;
        
        graphics.clear();
        
        // 阴影
        graphics.fillColor = cc.color(0, 0, 0, 89);
        graphics.roundRect(-baseWidth/2, -size/2 + 8, baseWidth, size - 10, size * 0.18);
        graphics.fill();
        
        // 底座
        graphics.fillColor = cc.color(31, 41, 55, 255);
        graphics.roundRect(-baseWidth/2, size/2 - baseHeight, baseWidth, baseHeight, baseHeight * 0.6);
        graphics.fill();
        graphics.lineWidth = 2.5;
        graphics.strokeColor = cc.color(15, 23, 42, 255);
        graphics.stroke();
        
        // 主塔身
        const rocketColor = ColorCache.get(GameColors.ROCKET_BODY);
        graphics.fillColor = cc.color(rocketColor.r, rocketColor.g, rocketColor.b, 255);
        graphics.roundRect(-towerWidth/2, -towerHeight/2, towerWidth, towerHeight, towerWidth * 0.5);
        graphics.fill();
        
        const allyColor = ColorCache.get(GameColors.ALLY_BODY);
        graphics.lineWidth = 2.5;
        graphics.strokeColor = cc.color(allyColor.r, allyColor.g, allyColor.b, 255);
        graphics.stroke();
        
        // 观察窗
        const detailColor = ColorCache.get(GameColors.ALLY_DETAIL);
        const windowWidth = towerWidth * 0.28;
        const windowHeight = towerHeight * 0.16;
        for (let i = 0; i < 3; i++) {
            const wy = -towerHeight * 0.3 + i * windowHeight * 1.25;
            graphics.fillColor = cc.color(detailColor.r, detailColor.g, detailColor.b, 242);
            graphics.roundRect(-windowWidth/2, wy, windowWidth, windowHeight, windowHeight * 0.4);
            graphics.fill();
        }
        
        // 顶部雷达
        graphics.fillColor = cc.color(254, 243, 199, 242);
        graphics.circle(0, -towerHeight * 0.52, towerWidth * 0.22);
        graphics.fill();
        graphics.fillColor = cc.color(254, 240, 138, 242);
        graphics.circle(0, -towerHeight * 0.6, towerWidth * 0.12);
        graphics.fill();
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
        
        // 计算发射位置
        const angle = Math.atan2(
            target.position.y - this.node.position.y,
            target.position.x - this.node.position.x
        );
        
        const barrelLength = GameConfig.CELL_SIZE * 0.7;
        const muzzleX = this.node.position.x + Math.cos(angle) * barrelLength;
        const muzzleY = this.node.position.y + Math.sin(angle) * barrelLength;
        
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

