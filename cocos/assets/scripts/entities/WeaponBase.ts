/**
 * 武器基础类
 * 所有武器的父类，提供通用功能
 */

import { _decorator, Component, Node, Vec3, Graphics } from 'cc';
import { GameConfig, WeaponType, WeaponConfigs } from '../config/GameConfig';
import { ColorCache } from '../config/Colors';

const { ccclass, property } = _decorator;

@ccclass('WeaponBase')
export class WeaponBase extends Component {
    @property
    weaponType: WeaponType = WeaponType.ROCKET;
    
    // 网格位置
    gridX: number = 0;
    gridY: number = 0;
    
    // 武器属性
    level: number = 1;
    maxLevel: number = GameConfig.WEAPON_MAX_LEVEL;
    hp: number = GameConfig.WEAPON_MAX_HP;
    maxHp: number = GameConfig.WEAPON_MAX_HP;
    
    // 攻击属性
    fireInterval: number = 500;
    attackRange: number = 4;
    damage: number = 1;
    timeSinceLastFire: number = 0;
    
    // 视觉效果
    private selectionRing: Node | null = null;
    private isSelected: boolean = false;
    private hitFlashTimer: number = 0;
    private upgradeFlashTimer: number = 0;
    
    onLoad() {
        this.createSelectionRing();
    }
    
    /**
     * 创建选中光环
     */
    private createSelectionRing() {
        this.selectionRing = new Node('SelectionRing');
        const graphics = this.selectionRing.addComponent(Graphics);
        
        graphics.lineWidth = 4;
        graphics.strokeColor = ColorCache.UI_BORDER;
        graphics.circle(0, 0, GameConfig.CELL_SIZE * 0.7);
        graphics.stroke();
        
        this.selectionRing.active = false;
        this.node.addChild(this.selectionRing);
    }
    
    /**
     * 更新武器（由 WeaponManager 调用，不是 Cocos 生命周期）
     */
    updateWeapon(deltaTime: number, deltaMS: number, enemies: any[]) {
        // 更新闪烁效果
        this.updateFlashEffects(deltaMS);
        
        // 确保 enemies 是数组
        if (!enemies || !Array.isArray(enemies)) {
            return;
        }
        
        // 寻找目标并攻击
        if (enemies.length > 0) {
            const target = this.findNearestEnemy(enemies);
            if (target) {
                this.attackTarget(target, deltaMS);
            }
        }
    }
    
    /**
     * 更新闪烁效果
     */
    private updateFlashEffects(deltaMS: number) {
        if (this.hitFlashTimer > 0) {
            this.hitFlashTimer -= deltaMS;
        }
        if (this.upgradeFlashTimer > 0) {
            this.upgradeFlashTimer -= deltaMS;
        }
    }
    
    /**
     * 寻找最近的敌人
     */
    protected findNearestEnemy(enemies: any[]): any {
        let nearest = null;
        let minDist = this.attackRange * GameConfig.CELL_SIZE;
        
        for (const enemy of enemies) {
            if (!enemy.isValid) continue;
            
            const dist = Vec3.distance(this.node.position, enemy.position);
            if (dist < minDist) {
                minDist = dist;
                nearest = enemy;
            }
        }
        
        return nearest;
    }
    
    /**
     * 攻击目标（子类实现）
     */
    protected attackTarget(target: any, deltaMS: number) {
        this.timeSinceLastFire += deltaMS;
        
        if (this.timeSinceLastFire >= this.fireInterval) {
            this.timeSinceLastFire = 0;
            this.fire(target);
        }
    }
    
    /**
     * 开火（子类实现）
     */
    protected fire(target: any) {
        // 子类实现具体的开火逻辑
    }
    
    /**
     * 受到伤害
     */
    takeDamage(damage: number): boolean {
        this.hp -= damage;
        this.hitFlashTimer = GameConfig.HIT_FLASH_DURATION;
        
        if (this.hp <= 0) {
            return true;  // 武器被摧毁
        }
        return false;
    }
    
    /**
     * 升级武器
     */
    upgrade() {
        if (this.level >= this.maxLevel) return;
        
        this.level++;
        this.upgradeFlashTimer = GameConfig.UPGRADE_FLASH_DURATION;
        this.applyLevelStats();
    }
    
    /**
     * 应用等级属性（子类实现）
     */
    protected applyLevelStats() {
        // 子类实现具体的升级逻辑
    }
    
    /**
     * 设置网格位置
     */
    setGridPosition(x: number, y: number) {
        this.gridX = x;
        this.gridY = y;
    }
    
    /**
     * 设置选中状态
     */
    setSelected(selected: boolean) {
        this.isSelected = selected;
        if (this.selectionRing) {
            this.selectionRing.active = selected;
        }
    }
    
    /**
     * 获取升级成本
     */
    getUpgradeCost(): number {
        return WeaponConfigs.getUpgradeCost(this.weaponType, this.level);
    }
    
    /**
     * 获取出售收益
     */
    getSellGain(): number {
        return WeaponConfigs.getSellGain(this.weaponType, this.level);
    }
    
    /**
     * 是否被摧毁
     */
    isDestroyed(): boolean {
        return this.hp <= 0;
    }
}

