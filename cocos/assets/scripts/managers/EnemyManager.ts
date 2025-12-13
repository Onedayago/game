/**
 * 敌人管理器
 * 负责敌人的生成、更新和管理
 */

import { _decorator, Component, Node, Prefab, instantiate, Graphics, UITransform, UIOpacity, tween, Vec3 } from 'cc';
import { GameContext } from '../core/GameContext';
import { GameConfig } from '../config/GameConfig';
import { WeaponManager } from './WeaponManager';
import { GoldManager } from './GoldManager';
import { PathfindingSystem } from '../systems/PathfindingSystem';

const { ccclass, property } = _decorator;

@ccclass('EnemyManager')
export class EnemyManager extends Component {
    @property(Prefab)
    enemyTankPrefab: Prefab | null = null;
    
    @property(Prefab)
    sonicTankPrefab: Prefab | null = null;
    
    private gameContext: GameContext;
    private weaponManager: WeaponManager | null = null;
    private goldManager: GoldManager | null = null;
    
    private enemies: any[] = [];
    private spawnTimer: number = 0;
    private spawnInterval: number = GameConfig.ENEMY_SPAWN_INTERVAL;
    private waveTimer: number = 0;
    private waveLevel: number = 1;
    private hpBonus: number = 0;
    
    // 寻路系统
    private pathfindingSystem: PathfindingSystem;
    
    onLoad() {
        this.gameContext = GameContext.getInstance();
        
        // 初始化寻路系统
        this.pathfindingSystem = new PathfindingSystem(
            GameConfig.BATTLE_COLS,
            GameConfig.TOTAL_ROWS
        );
        
        // 设置战场外区域为不可通行
        this.initBattleAreaConstraints();
        
        // 清理场景中预先存在的敌人节点
        this.clearExistingEnemies();
    }
    
    /**
     * 初始化战场区域约束（战场外不可通行）
     */
    private initBattleAreaConstraints() {
        if (!this.pathfindingSystem) return;
        
        const battleStartRow = GameConfig.BATTLE_START_ROW;
        const battleEndRow = GameConfig.BATTLE_START_ROW + GameConfig.BATTLE_ROWS - 1;
        
        // 将战场外的所有格子设置为不可通行
        for (let row = 0; row < GameConfig.TOTAL_ROWS; row++) {
            if (row < battleStartRow || row > battleEndRow) {
                for (let col = 0; col < GameConfig.BATTLE_COLS; col++) {
                    this.pathfindingSystem.setWalkable(col, row, false);
                }
            }
        }
    }
    
    init(weaponManager: WeaponManager, goldManager: GoldManager) {
        this.weaponManager = weaponManager;
        this.goldManager = goldManager;
    }
    
    /**
     * 清理场景中预先存在的敌人节点
     */
    private clearExistingEnemies() {
        if (!this.node) return;
        
        // 查找所有敌人节点并删除
        const children = [...this.node.children];
        children.forEach(child => {
            if (child.name.startsWith('Weapon_') || 
                child.name.startsWith('Enemy') || 
                child.name === 'EnemyTank' ||
                child.name === 'SonicTank') {
                child.destroy();
            }
        });
    }
    
    /**
     * Cocos Component 生命周期方法
     * 注意：Cocos 只传入 deltaTime 参数
     */
    update(deltaTime: number) {
        // 只在游戏开始后才更新
        if (!this.gameContext || !this.gameContext.gameStarted || this.gameContext.gamePaused) {
            return;
        }
        
        // 计算 deltaMS（毫秒）
        const deltaMS = deltaTime * 1000;
        
        // 更新波次系统
        this.updateWaveSystem(deltaMS);
        
        // 生成敌人
        this.updateSpawning(deltaMS);
        
        // 更新所有敌人
        this.updateEnemies(deltaTime, deltaMS);
    }
    
    /**
     * 更新波次系统
     */
    private updateWaveSystem(deltaMS: number) {
        this.waveTimer += deltaMS;
        
        if (this.waveTimer >= GameConfig.WAVE_DURATION) {
            this.waveTimer = 0;
            this.waveLevel++;
            this.hpBonus = (this.waveLevel - 1) * GameConfig.HP_BONUS_PER_WAVE;
            
            // 更新生成间隔（越来越快）
            this.spawnInterval = Math.max(
                GameConfig.ENEMY_MIN_SPAWN_INTERVAL,
                GameConfig.ENEMY_SPAWN_INTERVAL * Math.pow(GameConfig.SPAWN_INTERVAL_REDUCTION, this.waveLevel - 1)
            );
            
            // 更新游戏上下文的波次
            this.gameContext.currentWave = this.waveLevel;
        }
    }
    
    /**
     * 更新敌人生成
     */
    private updateSpawning(deltaMS: number) {
        this.spawnTimer += deltaMS;
        
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnEnemy();
        }
    }
    
    /**
     * 生成一个敌人
     */
    private spawnEnemy() {
        if (!this.gameContext.worldNode) return;
        
        // 随机选择一行（战斗区域内的相对行号：0-3）
        const row = Math.floor(Math.random() * GameConfig.BATTLE_ROWS);
        
        // 检查该行是否已有敌人（避免重叠）
        const occupied = this.enemies.some(enemyNode => {
            const enemyComp = enemyNode.getComponent('EnemyBase');
            return enemyComp && enemyComp.gridX === 0 && enemyComp.gridY === row;
        });
        
        if (occupied) return;
        
        // 决定生成普通坦克还是声波坦克
        const sonicChance = Math.min(0.25 + (this.waveLevel - 1) * 0.05, 0.5);
        const isSonic = Math.random() < sonicChance;
        
        const prefab = isSonic ? this.sonicTankPrefab : this.enemyTankPrefab;
        if (!prefab) {
            console.warn('敌人预制体未设置！');
            return;
        }
        
        // 计算生成位置（从最左边生成）
        const enemyHalfSize = GameConfig.ENEMY_SIZE / 2;
        const spawnX = 0 * GameConfig.CELL_SIZE + enemyHalfSize;  // 敌人中心在最左边
        // 将战斗区域行号转换为实际行号
        const actualRow = GameConfig.BATTLE_START_ROW + row;
        const spawnY = actualRow * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
        
        // 创建传送门特效
        const portalColor = isSonic ? 0x8b5cf6 : 0xff0080;
        this.createSpawnPortal(spawnX, spawnY, portalColor);
        
        // 延迟 400ms 后生成敌人（等待传送门动画）
        this.scheduleOnce(() => {
            if (!this.gameContext.worldNode) {
                console.error('worldNode 不存在！');
                return;
            }
            
            // 实例化敌人
            const enemy = instantiate(prefab);
            enemy.layer = this.gameContext.worldNode.layer;
            
            // 先添加到场景（必须先添加才能正确初始化）
            this.gameContext.worldNode.addChild(enemy);
            
            // 设置敌人属性
            const enemyComp = enemy.getComponent('EnemyBase');
            if (enemyComp) {
                enemyComp.setHpBonus(this.hpBonus);
                enemyComp.initPosition(row);
                enemyComp.setPathfindingSystem(this.pathfindingSystem);
            }
            
            this.enemies.push(enemy);
            
            // 添加到游戏上下文（让武器能够找到敌人）
            this.gameContext.addEnemy(enemy);
            
            // 淡入动画（从透明到不透明）
            this.fadeInEnemy(enemy);
        }, 0.4);
    }
    
    /**
     * 创建传送门生成特效
     */
    private createSpawnPortal(x: number, y: number, color: number) {
        if (!this.gameContext.worldNode) return;
        
        const portalNode = new Node('SpawnPortal');
        portalNode.layer = this.gameContext.worldNode.layer;
        portalNode.setPosition(x, y, 0);
        
        // 添加 UITransform
        const transform = portalNode.addComponent(UITransform);
        transform.setContentSize(100, 100);
        transform.setAnchorPoint(0.5, 0.5);
        
        // 绘制传送门圆环
        const graphics = portalNode.addComponent(Graphics);
        
        this.gameContext.worldNode.addChild(portalNode);
        
        // 扩散动画（0.4秒）
        let elapsed = 0;
        const duration = 400; // 毫秒
        const maxRadius = 40;
        const portalColor = this.hexToColor(color, 255);
        
        const updatePortal = (dt: number) => {
            if (!graphics || !graphics.isValid) return;
            
            elapsed += dt * 1000;
            const progress = Math.min(elapsed / duration, 1);
            
            // 更新圆环大小
            const radius = 5 + (maxRadius - 5) * progress;
            const alpha = Math.floor(255 * (1 - progress));
            const lineWidth = 3 * (1 - progress * 0.5); // 线条变细
            
            graphics.clear();
            graphics.lineWidth = Math.max(lineWidth, 0.5);
            graphics.strokeColor = this.hexToColor(color, Math.max(alpha, 0));
            graphics.circle(0, 0, radius);
            graphics.stroke();
            
            // 动画结束，销毁节点
            if (progress >= 1) {
                portalNode.destroy();
            }
        };
        
        // 使用 schedule 更新动画
        this.schedule(updatePortal, 0, 60, 0);
    }
    
    /**
     * 敌人淡入动画
     */
    private fadeInEnemy(enemyNode: Node) {
        // 添加 UIOpacity 组件
        let opacity = enemyNode.getComponent(UIOpacity);
        if (!opacity) {
            opacity = enemyNode.addComponent(UIOpacity);
        }
        
        // 使用 tween 动画（更简洁）
        opacity.opacity = 0;
        tween(opacity)
            .to(0.3, { opacity: 255 }, { easing: 'sineOut' })
            .start();
    }
    
    /**
     * 将十六进制颜色转换为 Cocos Color
     */
    private hexToColor(hex: number, alpha: number = 255): cc.Color {
        const r = (hex >> 16) & 0xff;
        const g = (hex >> 8) & 0xff;
        const b = hex & 0xff;
        return new cc.Color(r, g, b, alpha);
    }
    
    /**
     * 更新所有敌人
     */
    private updateEnemies(deltaTime: number, deltaMS: number) {
        // 从 gameContext 获取所有武器（包括拖拽创建的）
        // 武器是 Node 数组，需要转换为组件数组
        let weapons: any[] = [];
        const weaponNodes = this.gameContext.weapons || [];
        
        // 将 Node 数组转换为组件数组
        for (const weaponNode of weaponNodes) {
            if (!weaponNode || !weaponNode.isValid) continue;
            
            const weaponComp = weaponNode.getComponent('WeaponBase');
            if (weaponComp) {
                weapons.push(weaponComp);  // 添加组件而不是 Node
            }
        }
        
        
        // 更新寻路系统的障碍物信息
        this.updatePathfindingObstacles();
        
        // 过滤已死亡的敌人
        this.enemies = this.enemies.filter(enemy => {
            if (!enemy || !enemy.isValid) {
                return false;
            }
            
            const enemyComp = enemy.getComponent('EnemyBase');
            if (enemyComp) {
                enemyComp.updateEnemy(deltaTime, deltaMS, weapons);
                
                // 如果敌人死亡，给予奖励
                if (enemyComp.isDead()) {
                    this.goldManager?.addGold(GameConfig.ENEMY_KILL_REWARD);
                    this.gameContext.removeEnemy(enemy);
                    enemy.destroy();
                    return false;
                }
                
                // 如果敌人到达终点
                if (enemyComp.isFinished()) {
                    this.gameContext.removeEnemy(enemy);
                    enemy.destroy();
                    return false;
                }
            }
            
            return true;
        });
    }
    
    /**
     * 更新寻路系统的障碍物信息
     */
    private updatePathfindingObstacles() {
        if (!this.weaponManager || !this.pathfindingSystem) return;
        
        // 获取所有武器占用的网格
        const obstacles = this.weaponManager.getOccupiedGrids();
        
        // 先重置战场区域内的格子为可通行
        const battleStartRow = GameConfig.BATTLE_START_ROW;
        const battleEndRow = GameConfig.BATTLE_START_ROW + GameConfig.BATTLE_ROWS - 1;
        
        for (let row = battleStartRow; row <= battleEndRow; row++) {
            for (let col = 0; col < GameConfig.BATTLE_COLS; col++) {
                this.pathfindingSystem.setWalkable(col, row, true);
            }
        }
        
        // 设置武器障碍物（不重置战场外区域）
        this.pathfindingSystem.setObstacles(obstacles, false);
    }
    
    /**
     * 获取所有敌人
     */
    getEnemies(): any[] {
        return this.enemies;
    }
    
    /**
     * 获取当前波次
     */
    getWaveLevel(): number {
        return this.waveLevel;
    }
}

