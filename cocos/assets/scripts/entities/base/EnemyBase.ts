/**
 * 敌人基础类
 * 
 * 所有敌人的父类，提供通用功能：
 * - 移动系统（格子移动、寻路）
 * - 攻击系统（目标锁定、攻击间隔）
 * - 生命系统（血量、血条显示）
 * - 状态管理（死亡、到达终点）
 * 
 * 子类需要实现：
 * - fire(target): 具体的开火逻辑
 * - createVisual(): 视觉创建（可选，如果使用统一渲染器）
 */
import { _decorator, Component, Node, Vec3 } from 'cc';
import { GameConfig } from '../../config/GameConfig';
import { PathfindingSystem } from '../../systems/PathfindingSystem';
import { WeaponRenderer } from '../../rendering/WeaponRenderer';
import { GameContext } from '../../core/GameContext';
import { hexToColor } from '../../config/Colors';
import { ParticleManager } from '../../core/ParticleManager';
import { GameColors } from '../../config/Colors';

const { ccclass, property } = _decorator;

@ccclass('EnemyBase')
export class EnemyBase extends Component {
    declare node: Node;  // 显式声明 node 属性，用于 TypeScript 识别
    
    // === 网格位置 ===
    gridX: number = 0;  // 当前格子 X 坐标
    gridY: number = 0;  // 当前格子 Y 坐标
    
    // === 敌人属性 ===
    maxHp: number = GameConfig.ENEMY_MAX_HP;  // 最大生命值
    hp: number = GameConfig.ENEMY_MAX_HP;  // 当前生命值
    moveSpeed: number = GameConfig.ENEMY_MOVE_SPEED;  // 移动速度（像素/秒）
    attackRange: number = GameConfig.ENEMY_ATTACK_RANGE;  // 攻击范围（格子数）
    fireInterval: number = GameConfig.ENEMY_FIRE_INTERVAL;  // 开火间隔（毫秒）
    damage: number = GameConfig.ENEMY_BULLET_DAMAGE;  // 伤害值
    
    // === 状态管理 ===
    private dead: boolean = false;  // 是否死亡
    private finished: boolean = false;  // 是否到达终点
    private timeSinceLastFire: number = 0;  // 距离上次开火的时间（毫秒）
    private hitFlashTimer: number = 0;  // 受击闪烁计时器（毫秒）
    
    // === 目标锁定系统 ===
    private currentTarget: any = null;  // 当前锁定的目标武器
    private targetLostTime: number = 0;  // 目标丢失的时间（毫秒）
    private readonly TARGET_LOCK_DURATION = 500;  // 目标丢失后仍保持锁定的时间（毫秒）
    
    // === 寻路系统 ===
    private pathfindingSystem: PathfindingSystem | null = null;  // 寻路系统引用
    private targetGridX: number = 0;  // 目标格子 X 坐标
    private targetGridY: number = 0;  // 目标格子 Y 坐标
    private stuckTimer: number = 0;  // 被堵住的时间（秒）
    private lastGridX: number = 0;  // 上一帧的格子 X 坐标
    private lastGridY: number = 0;  // 上一帧的格子 Y 坐标
    
    // === 血条UI ===
    private hpBarBg: Node | null = null;  // 血条背景节点
    private hpBarFill: Node | null = null;  // 血条填充节点
    
    onLoad() {
        // 子类将调用 initPosition 来设置位置
        this.createHealthBar();
    }
    
    /**
     * 初始化位置（由外部调用）
     * @param row 战斗区域的行号（0-3），会自动转换为实际行号（1-4）
     */
    initPosition(row: number) {
        this.gridX = 0;
        // 将战斗区域行号转换为实际行号
        this.gridY = GameConfig.BATTLE_START_ROW + row;
        
        // 初始化目标格子（初始时目标就是当前格子）
        this.targetGridX = this.gridX;
        this.targetGridY = this.gridY;
        
        // 初始化位置记录
        this.lastGridX = this.gridX;
        this.lastGridY = this.gridY;
        this.stuckTimer = 0;
        
        this.updateWorldPosition();
        this.updateHealthBar();
    }
    
    /**
     * 创建血条（使用统一渲染器）
     */
    private createHealthBar() {
        const world = this.node.parent;
        if (!world) return;
        
        const entitySize = GameConfig.ENEMY_SIZE;
        const entityTopY = entitySize / 2;  // 实体顶部相对于实体中心的偏移
        const gap = entitySize * 0.2;  // 血条和实体顶部之间的间隔
        const offsetY = entityTopY + gap;  // 从实体中心到血条的总偏移
        
        const healthBar = WeaponRenderer.renderHealthBar(world, {
            hp: this.hp,
            maxHp: this.maxHp,
            entitySize: entitySize,
            offsetY: offsetY,  // 从实体中心到血条的总偏移（实体顶部 + 间隔）
            barWidthRatio: 0.8,
            normalColor: GameColors.ENEMY_DETAIL
        });
        
        this.hpBarBg = healthBar.bg;
        this.hpBarFill = healthBar.fill;
        
        this.updateHealthBar();
    }

    /**
     * 销毁血条
     */
    private destroyHealthBar() {
        if (this.hpBarBg && this.hpBarBg.isValid) this.hpBarBg.destroy();
        if (this.hpBarFill && this.hpBarFill.isValid) this.hpBarFill.destroy();
        this.hpBarBg = null;
        this.hpBarFill = null;
    }
    
    /**
     * 更新血条
     */
    private updateHealthBar() {
        if (!this.hpBarBg || !this.hpBarFill) return;
        
        const world = this.node.parent;
        if (!world) return;
        
        // 更新血条位置（跟随敌人）
        // 使用世界坐标，并考虑 Y 偏移
        // Cocos Creator Y 轴向上（从下往上）
        // 实体顶部 = 实体中心Y + entitySize/2
        // 血条位置 = 实体顶部 + 间隔
        const worldPos = this.node.getWorldPosition();
        const entitySize = GameConfig.ENEMY_SIZE;
        const entityTopY = entitySize / 2;  // 实体顶部相对于实体中心的偏移
        const gap = entitySize * 0.2;  // 血条和实体顶部之间的间隔
        const offsetY = entityTopY + gap;  // 从实体中心到血条的总偏移
        
        // 设置血条位置（在实体上方，Cocos Creator Y轴向上）
        const bgPos = new Vec3(worldPos.x, worldPos.y + offsetY, worldPos.z);
        const fillPos = new Vec3(worldPos.x, worldPos.y + offsetY, worldPos.z);
        
        this.hpBarBg.setWorldPosition(bgPos);
        this.hpBarFill.setWorldPosition(fillPos);
        
        // 更新血条内容
        WeaponRenderer.updateHealthBar(this.hpBarFill, {
            hp: this.hp,
            maxHp: this.maxHp,
            entitySize: entitySize,
            offsetY: offsetY,  // 从实体中心到血条的总偏移（实体顶部 + 间隔）
            barWidthRatio: 0.8,
            normalColor: GameColors.ENEMY_DETAIL
        });
    }
    
    /**
     * 设置血量加成
     */
    setHpBonus(bonus: number) {
        this.maxHp = GameConfig.ENEMY_MAX_HP + bonus;
        this.hp = this.maxHp;
    }
    
    /**
     * 设置寻路系统
     */
    setPathfindingSystem(system: PathfindingSystem) {
        this.pathfindingSystem = system;
    }
    
    /**
     * 更新敌人（由 EnemyManager 调用，不是 Cocos 生命周期）
     */
    updateEnemy(deltaTime: number, deltaMS: number, weapons: any[] = []) {
        if (this.dead || this.finished) {
            return;
        }
        
        // 更新闪烁效果
        if (this.hitFlashTimer > 0) {
            this.hitFlashTimer -= deltaMS;
        }
        
        // 更新血条位置
        this.updateHealthBar();
        
        // 先寻找目标武器
        let hasTarget = false;
        if (weapons && weapons.length > 0) {
            const target = this.findNearestWeapon(weapons);
            
            if (target) {
                // 找到新目标，更新锁定
                this.currentTarget = target;
                this.targetLostTime = 0;
                hasTarget = true;
                this.attackTarget(target, deltaMS);
            } else if (this.currentTarget) {
                // 没有找到新目标，但之前有锁定目标
                // 检查锁定目标是否仍然有效
                if (this.isTargetValid(this.currentTarget)) {
                    // 检查是否仍在攻击范围内
                    const distCells = this.getDistanceToTarget(this.currentTarget);
                    if (distCells <= this.attackRange) {
                        // 仍在范围内，继续攻击
                        hasTarget = true;
                        this.attackTarget(this.currentTarget, deltaMS);
                    } else {
                        // 超出范围，开始计时
                        this.targetLostTime += deltaMS;
                        if (this.targetLostTime <= this.TARGET_LOCK_DURATION) {
                            // 仍在锁定时间内，继续攻击（防止频繁切换目标）
                            hasTarget = true;
                            this.attackTarget(this.currentTarget, deltaMS);
                        } else {
                            // 锁定时间已过，清除目标
                            this.currentTarget = null;
                            this.targetLostTime = 0;
                            this.timeSinceLastFire = 0;
                        }
                    }
                } else {
                    // 目标已无效（被摧毁），清除锁定
                    this.currentTarget = null;
                    this.targetLostTime = 0;
                    this.timeSinceLastFire = 0;
                }
            }
        } else {
            // 没有武器，清除目标锁定
            this.currentTarget = null;
            this.targetLostTime = 0;
            this.timeSinceLastFire = 0;
        }
        
        // 只有在没有攻击目标时才移动
        if (!hasTarget) {
            // 没有目标时，恢复默认朝向（向右，角度为0）
            this.node.angle = 0;
            this.moveInGrid(deltaTime);
        }
        
        // 检查是否到达终点
        this.checkFinished();
    }
    
    /**
     * 简单的格子移动逻辑（平滑连续移动）
     */
    private moveInGrid(deltaTime: number) {
        const currentPos = this.node.position;
        
        // 计算目标格子的世界坐标（中心点）
        const targetWorldX = this.targetGridX * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
        const targetWorldY = this.targetGridY * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
        
        // 计算到目标的距离
        const dx = targetWorldX - currentPos.x;
        const dy = targetWorldY - currentPos.y;
        const distanceToTarget = Math.sqrt(dx * dx + dy * dy);
        
        // 如果接近目标格子，选择下一个目标格子
        if (distanceToTarget < 5) {
            // 记录上一个位置
            this.lastGridX = this.gridX;
            this.lastGridY = this.gridY;
            
            this.gridX = this.targetGridX;
            this.gridY = this.targetGridY;
            this.selectNextTargetGrid();
            
            // 成功移动，重置被堵计时器
            if (this.gridX !== this.lastGridX || this.gridY !== this.lastGridY) {
                this.stuckTimer = 0;
            }
        }
        
        // 检测是否被堵住
        this.checkIfStuck(deltaTime);
        
        // 平滑移动到目标格子
        const moveDistance = this.moveSpeed * deltaTime;
        
        if (distanceToTarget > 0.1) {
            // 计算移动方向（单位向量）
            const dirX = dx / distanceToTarget;
            const dirY = dy / distanceToTarget;
            
            // 计算新位置
            const actualMove = Math.min(moveDistance, distanceToTarget);
            const newX = currentPos.x + dirX * actualMove;
            const newY = currentPos.y + dirY * actualMove;
            
            this.node.setPosition(new Vec3(newX, newY, 0));
        }
    }
    
    /**
     * 检测敌人是否被堵住
     */
    private checkIfStuck(deltaTime: number) {
        // 如果目标格子就是当前格子，说明无法前进
        if (this.targetGridX === this.gridX && this.targetGridY === this.gridY) {
            this.stuckTimer += deltaTime;
            
            // 被堵超过 1 秒，尝试后退
            if (this.stuckTimer > 1.0) {
                this.tryRetreat();
                this.stuckTimer = 0; // 重置计时器
            }
        } else {
            // 正在移动，重置计时器
            this.stuckTimer = 0;
        }
    }
    
    /**
     * 尝试后退
     */
    private tryRetreat() {
        const currentGridX = this.gridX;
        const currentGridY = this.gridY;
        
        // 尝试后退（向左）
        if (this.canMoveTo(currentGridX - 1, currentGridY)) {
            this.targetGridX = currentGridX - 1;
            this.targetGridY = currentGridY;
            return;
        }
        
        // 如果不能向左，尝试向上或向下移动
        if (this.canMoveTo(currentGridX, currentGridY + 1)) {
            this.targetGridX = currentGridX;
            this.targetGridY = currentGridY + 1;
            return;
        }
        
        if (this.canMoveTo(currentGridX, currentGridY - 1)) {
            this.targetGridX = currentGridX;
            this.targetGridY = currentGridY - 1;
            return;
        }
        
        // 真的被完全堵死了（周围四格都不能走）
        // 保持当前位置
    }
    
    /**
     * 选择下一个目标格子
     * 优先级：右 > 上 > 下（只能上下左右，不能斜线）
     */
    private selectNextTargetGrid() {
        const currentGridX = this.gridX;
        const currentGridY = this.gridY;
        
        // 优先尝试向右移动
        if (this.canMoveTo(currentGridX + 1, currentGridY)) {
            this.targetGridX = currentGridX + 1;
            this.targetGridY = currentGridY;
            return;
        }
        
        // 右边被堵，尝试上下移动
        const canMoveUp = this.canMoveTo(currentGridX, currentGridY + 1);
        const canMoveDown = this.canMoveTo(currentGridX, currentGridY - 1);
        
        if (canMoveUp && canMoveDown) {
            // 上下都可以，选择更接近中心行的方向
            const centerY = GameConfig.BATTLE_START_ROW + GameConfig.BATTLE_ROWS / 2;
            if (currentGridY < centerY) {
                this.targetGridX = currentGridX;
                this.targetGridY = currentGridY + 1;
            } else {
                this.targetGridX = currentGridX;
                this.targetGridY = currentGridY - 1;
            }
            return;
        } else if (canMoveUp) {
            this.targetGridX = currentGridX;
            this.targetGridY = currentGridY + 1;
            return;
        } else if (canMoveDown) {
            this.targetGridX = currentGridX;
            this.targetGridY = currentGridY - 1;
            return;
        }
        
        // 无法移动（被完全堵住），保持当前目标，等待后退逻辑
        this.targetGridX = currentGridX;
        this.targetGridY = currentGridY;
    }
    
    /**
     * 检查是否可以移动到指定格子
     */
    private canMoveTo(gridX: number, gridY: number): boolean {
        if (!this.pathfindingSystem) {
            // 没有寻路系统，只检查边界
            return gridX >= 0 && gridX < GameConfig.BATTLE_COLS &&
                   gridY >= GameConfig.BATTLE_START_ROW && 
                   gridY <= GameConfig.BATTLE_START_ROW + GameConfig.BATTLE_ROWS - 1;
        }
        
        // 使用寻路系统检查格子是否可通行
        const grid = this.pathfindingSystem['grid'];
        if (grid && grid[gridY] && grid[gridY][gridX]) {
            return grid[gridY][gridX].walkable;
        }
        
        return false;
    }
    
    /**
     * 寻找最近的武器
     * 使用格子距离（与原游戏一致），而不是像素距离
     */
    private findNearestWeapon(weapons: any[]): any {
        let nearest = null;
        let minDistCells = this.attackRange;  // 攻击范围（格子数）
        
        // 将敌人位置转换为格子坐标
        const enemyGridX = Math.floor(this.node.position.x / GameConfig.CELL_SIZE);
        const enemyGridY = Math.floor(this.node.position.y / GameConfig.CELL_SIZE);
        
        for (const weapon of weapons) {
            // weapon 现在是 IWeapon（组件），需要访问 node
            if (!weapon || !weapon.node || !weapon.node.isValid) continue;
            
            // 获取武器的网格位置（优先使用组件的 gridX/gridY，如果没有则从位置计算）
            let weaponGridX: number;
            let weaponGridY: number;
            
            if (weapon.gridX !== undefined && weapon.gridY !== undefined) {
                weaponGridX = weapon.gridX;
                weaponGridY = weapon.gridY;
            } else {
                weaponGridX = Math.floor(weapon.node.position.x / GameConfig.CELL_SIZE);
                weaponGridY = Math.floor(weapon.node.position.y / GameConfig.CELL_SIZE);
            }
            
            // 计算格子距离
            const dxCells = weaponGridX - enemyGridX;
            const dyCells = weaponGridY - enemyGridY;
            const distCells = Math.sqrt(dxCells * dxCells + dyCells * dyCells);
            
            if (distCells <= minDistCells) {
                minDistCells = distCells;
                nearest = weapon;
            }
        }
        
        return nearest;
    }
    
    /**
     * 检查目标是否有效
     */
    private isTargetValid(target: any): boolean {
        return target && target.node && target.node.isValid;
    }
    
    /**
     * 获取到目标的距离（格子数）
     */
    private getDistanceToTarget(target: any): number {
        if (!this.isTargetValid(target)) return Infinity;
        
        const enemyGridX = Math.floor(this.node.position.x / GameConfig.CELL_SIZE);
        const enemyGridY = Math.floor(this.node.position.y / GameConfig.CELL_SIZE);
        
        let weaponGridX: number;
        let weaponGridY: number;
        
        if (target.gridX !== undefined && target.gridY !== undefined) {
            weaponGridX = target.gridX;
            weaponGridY = target.gridY;
        } else {
            weaponGridX = Math.floor(target.node.position.x / GameConfig.CELL_SIZE);
            weaponGridY = Math.floor(target.node.position.y / GameConfig.CELL_SIZE);
        }
        
        const dxCells = weaponGridX - enemyGridX;
        const dyCells = weaponGridY - enemyGridY;
        return Math.sqrt(dxCells * dxCells + dyCells * dyCells);
    }
    
    /**
     * 攻击目标
     */
    private attackTarget(target: any, deltaMS: number) {
        // 旋转敌人面向目标武器
        if (target && target.node && target.node.isValid) {
            const dx = target.node.position.x - this.node.position.x;
            const dy = target.node.position.y - this.node.position.y;
            // 对 dy 取反，适配 Y 轴向上的坐标系
            const angleRad = Math.atan2(-dy, dx);
            // Cocos Creator 的 angle 属性是顺时针旋转，需要取负号
            this.node.angle = -angleRad * 180 / Math.PI;
        }
        
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
        // 子类实现
    }
    
    /**
     * 检查是否到达终点
     */
    private checkFinished() {
        // 敌人到达战场右边界（战场宽度是画布的两倍）
        if (this.node.position.x > GameConfig.BATTLE_WIDTH) {
            this.finished = true;
            this.node.destroy();
        }
    }
    
    /**
     * 受到伤害
     */
    registerHit(damage: number) {
        // 创建击中粒子效果（在敌人位置）
        // 优先使用 gameContext 中的 particleManager，如果没有则尝试从静态实例获取
        let particleManager = GameContext.getInstance().particleManager;
        if (!particleManager) {
            particleManager = ParticleManager.getInstance();
        }
        
        if (particleManager) {
            const hitColor = hexToColor(0x00ffff); // 青色火花（武器攻击颜色）
            const worldPos = this.node.getWorldPosition();
            particleManager.createHitSpark(
                worldPos.x,
                worldPos.y,
                hitColor
            );
        }
        
        this.hp -= damage;
        this.hitFlashTimer = 150;
        this.updateHealthBar();
        
        if (this.hp <= 0) {
            this.dead = true;
            this.destroyHealthBar();
            // 播放死亡动画和特效（简化）
            this.node.destroy();
        }
    }
    
    /**
     * 更新世界坐标
     */
    private updateWorldPosition() {
        // 敌人从最左边生成（x=0），然后向右移动
        // 初始 gridX=0 时，敌人在最左边边缘（考虑敌人尺寸）
        const enemyHalfSize = GameConfig.ENEMY_SIZE / 2;
        const x = this.gridX * GameConfig.CELL_SIZE + enemyHalfSize;
        const y = this.gridY * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
        this.node.setPosition(new Vec3(x, y, 0));
    }
    
    /**
     * 是否死亡
     */
    isDead(): boolean {
        return this.dead;
    }
    
    /**
     * 是否完成（到达终点）
     */
    isFinished(): boolean {
        return this.finished;
    }
    
    onDestroy() {
        // 清理血条
        this.destroyHealthBar();
    }
}

