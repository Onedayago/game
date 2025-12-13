/**
 * 游戏接口定义
 * 统一所有实体、管理器、组件的接口
 */

import { Node, Vec3 } from 'cc';
import { WeaponType } from '../config/GameConfig';

/**
 * 基础实体接口
 */
export interface IEntity {
    node: Node;
    hp: number;
    maxHp: number;
    isDestroyed(): boolean;
    takeDamage(damage: number): boolean;
    destroy(): void;
}

/**
 * 可更新接口
 */
export interface IUpdatable {
    update?(deltaTime: number): void;
    updateEnemy?(deltaTime: number, deltaMS: number, targets: any[]): void;
    updateWeapon?(deltaTime: number, deltaMS: number, targets: any[]): void;
}

/**
 * 武器接口
 */
export interface IWeapon extends IEntity, IUpdatable {
    weaponType: WeaponType;
    level: number;
    maxLevel: number;
    gridX: number;
    gridY: number;
    damage: number;
    attackRange: number;
    fireInterval: number;
    
    setGridPosition(x: number, y: number): void;
    setSelected(selected: boolean): void;
    upgrade(): void;
    getUpgradeCost(): number;
    getSellGain(): number;
}

/**
 * 敌人接口
 */
export interface IEnemy extends IEntity, IUpdatable {
    gridX: number;
    gridY: number;
    moveSpeed: number;
    attackRange: number;
    damage: number;
    
    setGridPosition(x: number, y: number): void;
    moveTo(gridX: number, gridY: number): void;
    getKillReward(): number;
}

/**
 * 子弹接口
 */
export interface IBullet extends IUpdatable {
    node: Node;
    damage: number;
    speed: number;
    shouldDestroyed: boolean;
    
    init(angle: number, config: BulletConfig): void;
    destroy(): void;
}

/**
 * 子弹配置
 */
export interface BulletConfig {
    speed: number;
    damage: number;
    radius: number;
    color: number;
}

/**
 * 管理器接口
 */
export interface IManager {
    init(...args: any[]): void;
    onDestroy?(): void;
}

/**
 * 武器管理器接口
 */
export interface IWeaponManager extends IManager {
    getWeapons(): IWeapon[];
    getSelectedWeapon(): IWeapon | null;
    selectWeapon(weapon: IWeapon | Node): void;
    upgradeSelectedWeapon(goldManager: IGoldManager): boolean;
    sellSelectedWeapon(goldManager: IGoldManager): boolean;
    isGridOccupied(gridX: number, gridY: number): boolean;
    getOccupiedGrids(): Array<{x: number, y: number}>;
}

/**
 * 敌人管理器接口
 */
export interface IEnemyManager extends IManager {
    getEnemies(): IEnemy[];
    getWaveLevel(): number;
    spawnEnemy(): void;
    removeEnemy(enemy: IEnemy): void;
}

/**
 * 金币管理器接口
 */
export interface IGoldManager {
    getGold(): number;
    addGold(amount: number): void;
    spendGold(amount: number): boolean;
    canAfford(amount: number): boolean;
}

/**
 * UI管理器接口
 */
export interface IUIManager extends IManager {
    showStartScreen(): void;
    hideStartScreen(): void;
    update(deltaTime: number): void;
}

/**
 * 游戏上下文接口
 */
export interface IGameContext {
    gameStarted: boolean;
    gamePaused: boolean;
    currentWave: number;
    gold: number;
    
    soundManager: any;
    weaponManager: IWeaponManager | null;
    weaponContainerUI: any;
    
    worldNode: Node | null;
    uiNode: Node | null;
    
    enemies: IEnemy[];
    weapons: IWeapon[];
    
    reset(): void;
    addGold(amount: number): void;
    spendGold(amount: number): boolean;
    addEnemy(enemy: IEnemy): void;
    removeEnemy(enemy: IEnemy): void;
    addWeapon(weapon: Node): void;
    removeWeapon(weapon: Node): void;
}

/**
 * 位置接口
 */
export interface IPosition {
    x: number;
    y: number;
}

/**
 * 网格位置接口
 */
export interface IGridPosition {
    col: number;
    row: number;
}

/**
 * 拖拽信息接口
 */
export interface IDragInfo {
    type: WeaponType;
    col: number;
    row: number;
    worldX: number;
    worldY: number;
}

/**
 * 放置信息接口
 */
export interface IPlacementInfo extends IDragInfo {
    x: number;
    y: number;
}

/**
 * 对象池接口
 */
export interface IObjectPool<T> {
    get(): T | null;
    release(obj: T): void;
    clear(): void;
    getSize(): number;
    getActiveCount(): number;
}

/**
 * 事件接口
 */
export interface IGameEvent {
    type: string;
    data?: any;
}

/**
 * 事件监听器
 */
export type EventListener = (event: IGameEvent) => void;

/**
 * 服务接口
 */
export interface IService {
    initialize(): void;
    dispose(): void;
}

/**
 * 配置接口
 */
export interface IConfig {
    [key: string]: any;
}

/**
 * 寻路结果接口
 */
export interface IPathfindingResult {
    path: IGridPosition[];
    found: boolean;
}

/**
 * 伤害信息接口
 */
export interface IDamageInfo {
    damage: number;
    source: IEntity;
    target: IEntity;
    isCritical?: boolean;
}

/**
 * 升级信息接口
 */
export interface IUpgradeInfo {
    level: number;
    cost: number;
    bonuses: {
        damage?: number;
        fireRate?: number;
        range?: number;
    };
}

/**
 * 波次信息接口
 */
export interface IWaveInfo {
    waveNumber: number;
    enemyCount: number;
    enemyHpBonus: number;
    spawnInterval: number;
}

