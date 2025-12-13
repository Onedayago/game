/**
 * 武器基础类
 * 所有武器的父类，提供通用功能
 */

import { _decorator, Component, Node, Vec3, Graphics } from 'cc';
import { GameConfig } from '../../config/GameConfig';
import { UIConfig } from '../../config/UIConfig';
import { WeaponType, WeaponConfigs } from '../../config/WeaponConfig';
import { ColorCache, GameColors } from '../../config/Colors';
import { WeaponRenderer } from '../../rendering/WeaponRenderer';

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
    
    // 血条
    private hpBarBg: Node | null = null;
    private hpBarFill: Node | null = null;
    
    onLoad() {
        this.createSelectionRing();
        this.createHealthBar();
    }
    
    /**
     * 创建选中光环（使用统一渲染器）
     */
    private createSelectionRing() {
        this.selectionRing = WeaponRenderer.renderSelectionRing(this.node);
    }
    
    /**
     * 创建血条（使用统一渲染器）
     */
    private createHealthBar() {
        const world = this.node.parent;
        if (!world) return;
        
        // 所有武器使用统一的尺寸比例
        const entitySize = GameConfig.CELL_SIZE * UIConfig.WEAPON_MAP_SIZE_RATIO;
        const normalColor = this.weaponType === WeaponType.ROCKET 
            ? GameColors.ROCKET_BULLET 
            : GameColors.LASER_BEAM;
        
        const entityTopY = entitySize / 2;  // 实体顶部相对于实体中心的偏移
        const gap = entitySize * 0.2;  // 血条和实体顶部之间的间隔
        const offsetY = entityTopY + gap;  // 从实体中心到血条的总偏移
        
        const healthBar = WeaponRenderer.renderHealthBar(world, {
            hp: this.hp,
            maxHp: this.maxHp,
            entitySize: entitySize,
            offsetY: offsetY,  // 从实体中心到血条的总偏移（实体顶部 + 间隔）
            barWidthRatio: 0.9,
            normalColor: normalColor
        });
        
        this.hpBarBg = healthBar.bg;
        this.hpBarFill = healthBar.fill;
        
        this.updateHealthBar();
    }
    
    /**
     * 更新血条
     */
    protected updateHealthBar() {
        if (!this.hpBarBg || !this.hpBarFill) return;
        
        const world = this.node.parent;
        if (!world) return;
        
        // 更新血条位置（跟随武器）
        // 使用世界坐标，并考虑 Y 偏移
        // Cocos Creator Y 轴向上（从下往上）
        // 实体顶部 = 实体中心Y + entitySize/2
        // 血条位置 = 实体顶部 + 间隔
        const worldPos = this.node.getWorldPosition();
        // 所有武器使用统一的尺寸比例
        const entitySize = GameConfig.CELL_SIZE * UIConfig.WEAPON_MAP_SIZE_RATIO;
        const entityTopY = entitySize / 2;  // 实体顶部相对于实体中心的偏移
        const gap = entitySize * 0.2;  // 血条和实体顶部之间的间隔
        const offsetY = entityTopY + gap;  // 从实体中心到血条的总偏移
        
        // 设置血条位置（在实体上方，Cocos Creator Y轴向上）
        const bgPos = new Vec3(worldPos.x, worldPos.y + offsetY, worldPos.z);
        const fillPos = new Vec3(worldPos.x, worldPos.y + offsetY, worldPos.z);
        
        this.hpBarBg.setWorldPosition(bgPos);
        this.hpBarFill.setWorldPosition(fillPos);
        
        // 更新血条内容
        const normalColor = this.weaponType === WeaponType.ROCKET 
            ? GameColors.ROCKET_BULLET 
            : GameColors.LASER_BEAM;
        
        WeaponRenderer.updateHealthBar(this.hpBarFill, {
            hp: this.hp,
            maxHp: this.maxHp,
            entitySize: entitySize,
            offsetY: offsetY,  // 从实体中心到血条的总偏移（实体顶部 + 间隔）
            barWidthRatio: 0.9,
            normalColor: normalColor
        });
    }
    
    /**
     * 更新武器（由 WeaponManager 调用，不是 Cocos 生命周期）
     */
    updateWeapon(deltaTime: number, deltaMS: number, enemies: any[]) {
        // 更新闪烁效果
        this.updateFlashEffects(deltaMS);
        
        // 更新血条位置
        this.updateHealthBar();
        
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
        this.updateHealthBar();
        
        if (this.hp <= 0) {
            this.destroyHealthBar();
            this.node.destroy();
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
    
    /**
     * 销毁血条
     */
    private destroyHealthBar() {
        if (this.hpBarBg && this.hpBarBg.isValid) {
            this.hpBarBg.destroy();
            this.hpBarBg = null;
        }
        if (this.hpBarFill && this.hpBarFill.isValid) {
            this.hpBarFill.destroy();
            this.hpBarFill = null;
        }
    }
    
    onDestroy() {
        // 清理血条
        this.destroyHealthBar();
    }
}

