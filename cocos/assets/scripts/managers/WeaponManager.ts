/**
 * 武器管理器
 * 负责武器的创建、更新和管理
 */

import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from 'cc';
import { GameContext } from '../core/GameContext';
import { GameConfig } from '../config/GameConfig';
import { WeaponType } from '../config/WeaponConfig';
import { GoldManager } from './GoldManager';

const { ccclass, property } = _decorator;

@ccclass('WeaponManager')
export class WeaponManager extends Component {
    @property(Prefab)
    rocketTowerPrefab: Prefab | null = null;
    
    @property(Prefab)
    laserTowerPrefab: Prefab | null = null;
    
    private gameContext: GameContext;
    private weapons: any[] = [];
    private selectedWeapon: any = null;
    
    onLoad() {
        this.gameContext = GameContext.getInstance();
    }
    
    /**
     * 获取所有武器
     */
    getWeapons(): any[] {
        return this.weapons || [];
    }
    
    /**
     * 更新所有武器（由 GameMain 调用）
     */
    updateWeapons(deltaTime: number, deltaMS: number) {
        if (!this.gameContext.gameStarted || this.gameContext.gamePaused) {
            return;
        }
        
        const enemies = this.gameContext.enemies || [];
        
        // 从 gameContext 获取所有武器（包括拖拽创建的）
        const allWeapons = this.gameContext.weapons || [];
        
        // 更新所有武器
        for (const weapon of allWeapons) {
            if (!weapon || !weapon.isValid) {
                this.gameContext.removeWeapon(weapon);
                continue;
            }
            
            const weaponComp = weapon.getComponent('WeaponBase');
            if (weaponComp) {
                weaponComp.updateWeapon(deltaTime, deltaMS, enemies);
                
                // 如果武器被摧毁
                if (weaponComp.isDestroyed()) {
                    weapon.destroy();
                    this.gameContext.removeWeapon(weapon);
                }
            }
        }
    }
    
    /**
     * 放置武器
     */
    placeWeapon(type: WeaponType, gridX: number, gridY: number, goldManager: GoldManager): boolean {
        // 检查位置是否已有武器
        if (this.hasWeaponAt(gridX, gridY)) {
            return false;
        }
        
        // 检查金币
        const cost = type === WeaponType.ROCKET ? 
            GameConfig.ROCKET_BASE_COST : GameConfig.LASER_BASE_COST;
        
        if (!goldManager.spendGold(cost)) {
            return false;
        }
        
        // 创建武器
        const prefab = type === WeaponType.ROCKET ? 
            this.rocketTowerPrefab : this.laserTowerPrefab;
        
        if (!prefab) return false;
        
        const weapon = instantiate(prefab);
        const worldPos = this.gridToWorld(gridX, gridY);
        weapon.setPosition(worldPos);
        
        // 设置武器信息
        const weaponComp = weapon.getComponent('WeaponBase');
        if (weaponComp) {
            weaponComp.setGridPosition(gridX, gridY);
        }
        
        this.node.addChild(weapon);
        this.weapons.push(weapon);
        this.gameContext.addWeapon(weapon);
        
        return true;
    }
    
    /**
     * 检查位置是否已有武器
     */
    private hasWeaponAt(gridX: number, gridY: number): boolean {
        return this.weapons.some(weapon => {
            const weaponComp = weapon.getComponent('WeaponBase');
            return weaponComp && weaponComp.gridX === gridX && weaponComp.gridY === gridY;
        });
    }
    
    /**
     * 网格坐标转世界坐标
     */
    private gridToWorld(gridX: number, gridY: number): Vec3 {
        const cellSize = GameConfig.CELL_SIZE;
        const x = gridX * cellSize + cellSize / 2;
        const y = gridY * cellSize + cellSize / 2;
        return new Vec3(x, y, 0);
    }
    
    /**
     * 世界坐标转网格坐标
     */
    worldToGrid(worldPos: Vec3): { x: number, y: number } {
        const cellSize = GameConfig.CELL_SIZE;
        const x = Math.floor(worldPos.x / cellSize);
        const y = Math.floor(worldPos.y / cellSize);
        return { x, y };
    }
    
    /**
     * 选中武器
     */
    selectWeapon(weapon: any) {
        // 取消之前的选中
        if (this.selectedWeapon) {
            const prevComp = this.selectedWeapon.getComponent('WeaponBase');
            if (prevComp) {
                prevComp.setSelected(false);
            }
        }
        
        this.selectedWeapon = weapon;
        
        if (weapon) {
            const weaponComp = weapon.getComponent('WeaponBase');
            if (weaponComp) {
                weaponComp.setSelected(true);
            }
        }
    }
    
    /**
     * 获取选中的武器
     */
    getSelectedWeapon(): any {
        return this.selectedWeapon;
    }
    
    /**
     * 获取所有武器
     */
    getWeapons(): any[] {
        return this.weapons;
    }
    
    /**
     * 获取所有武器占用的网格坐标
     */
    getOccupiedGrids(): Array<{x: number, y: number}> {
        const occupied: Array<{x: number, y: number}> = [];
        const gameContext = GameContext.getInstance();
        
        // 从游戏上下文获取所有武器（包括通过拖拽创建的）
        const allWeapons = gameContext.weapons || [];
        
        for (const weapon of allWeapons) {
            if (!weapon || !weapon.isValid) continue;
            
            // 尝试获取 WeaponGridData 组件
            const gridData = weapon.getComponent('WeaponGridData');
            if (gridData && gridData.gridX !== undefined && gridData.gridY !== undefined) {
                occupied.push({
                    x: gridData.gridX,
                    y: gridData.gridY
                });
                continue;
            }
            
            // 尝试获取 WeaponBase 组件（预制体武器）
            const weaponComp = weapon.getComponent('WeaponBase');
            if (weaponComp && weaponComp.gridX !== undefined && weaponComp.gridY !== undefined) {
                occupied.push({
                    x: weaponComp.gridX,
                    y: weaponComp.gridY
                });
            }
        }
        
        return occupied;
    }
    
    /**
     * 检查指定网格是否被武器占用
     */
    isGridOccupied(gridX: number, gridY: number): boolean {
        return this.hasWeaponAt(gridX, gridY);
    }
    
    /**
     * 升级选中的武器
     */
    upgradeSelectedWeapon(goldManager: GoldManager): boolean {
        if (!this.selectedWeapon) return false;
        
        const weaponComp = this.selectedWeapon.getComponent('WeaponBase');
        if (!weaponComp) return false;
        
        const upgradeCost = weaponComp.getUpgradeCost();
        if (!goldManager.spendGold(upgradeCost)) {
            return false;
        }
        
        weaponComp.upgrade();
        return true;
    }
    
    /**
     * 出售选中的武器
     */
    sellSelectedWeapon(goldManager: GoldManager): boolean {
        if (!this.selectedWeapon) return false;
        
        const weaponComp = this.selectedWeapon.getComponent('WeaponBase');
        if (!weaponComp) return false;
        
        const sellGain = weaponComp.getSellGain();
        goldManager.addGold(sellGain);
        
        // 移除武器
        const index = this.weapons.indexOf(this.selectedWeapon);
        if (index > -1) {
            this.weapons.splice(index, 1);
        }
        
        this.gameContext.removeWeapon(this.selectedWeapon);
        this.selectedWeapon.destroy();
        this.selectedWeapon = null;
        
        return true;
    }
}

