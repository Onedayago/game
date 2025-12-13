/**
 * 游戏上下文
 * 存储全局游戏状态和管理器引用
 */

import { Node } from 'cc';
import { SoundManager } from './SoundManager';
import { ParticleManager } from './ParticleManager';

export class GameContext {
    private static instance: GameContext;
    
    // 游戏状态
    gameStarted: boolean = false;
    gamePaused: boolean = false;
    
    // 当前波次
    currentWave: number = 1;
    
    // 金币
    gold: number = 1000;
    
    // 管理器引用
    soundManager: SoundManager | null = null;
    particleManager: ParticleManager | null = null;  // 粒子管理器引用
    weaponManager: any = null;  // 武器管理器引用
    weaponContainerUI: any = null;  // 武器容器 UI 引用
    
    // 场景节点引用
    worldNode: Node | null = null;
    
    // 敌人和武器数组
    enemies: any[] = [];
    weapons: any[] = [];
    
    static getInstance(): GameContext {
        if (!GameContext.instance) {
            GameContext.instance = new GameContext();
        }
        return GameContext.instance;
    }
    
    /**
     * 重置游戏状态
     */
    reset() {
        this.gameStarted = false;
        this.gamePaused = false;
        this.currentWave = 1;
        this.gold = 1000;
        this.enemies = [];
        this.weapons = [];
    }
    
    /**
     * 添加金币
     */
    addGold(amount: number) {
        this.gold += amount;
    }
    
    /**
     * 扣除金币
     */
    spendGold(amount: number): boolean {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    }
    
    /**
     * 添加敌人
     */
    addEnemy(enemy: any) {
        this.enemies.push(enemy);
    }
    
    /**
     * 移除敌人
     */
    removeEnemy(enemy: any) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
    }
    
    /**
     * 添加武器
     */
    addWeapon(weapon: any) {
        this.weapons.push(weapon);
    }
    
    /**
     * 移除武器
     */
    removeWeapon(weapon: any) {
        const index = this.weapons.indexOf(weapon);
        if (index > -1) {
            this.weapons.splice(index, 1);
        }
    }
}

