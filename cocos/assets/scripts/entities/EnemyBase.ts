/**
 * 敌人基础类
 * 所有敌人的父类，提供通用功能
 */

import { _decorator, Component, Node, Vec3 } from 'cc';
import { GameConfig } from '../config/GameConfig';
import { PathfindingSystem } from '../systems/PathfindingSystem';

const { ccclass, property } = _decorator;

@ccclass('EnemyBase')
export class EnemyBase extends Component {
    // 网格位置
    gridX: number = 0;
    gridY: number = 0;
    
    // 敌人属性
    maxHp: number = GameConfig.ENEMY_MAX_HP;
    hp: number = GameConfig.ENEMY_MAX_HP;
    moveSpeed: number = GameConfig.ENEMY_MOVE_SPEED;
    attackRange: number = GameConfig.ENEMY_ATTACK_RANGE;
    fireInterval: number = GameConfig.ENEMY_FIRE_INTERVAL;
    damage: number = GameConfig.ENEMY_BULLET_DAMAGE;
    
    // 状态
    private dead: boolean = false;
    private finished: boolean = false;  // 是否到达终点
    private timeSinceLastFire: number = 0;
    private hitFlashTimer: number = 0;
    
    // 寻路相关
    private pathfindingSystem: PathfindingSystem | null = null;
    private targetGridX: number = 0; // 目标格子 X
    private targetGridY: number = 0; // 目标格子 Y
    private stuckTimer: number = 0; // 被堵住的时间
    private lastGridX: number = 0; // 上一帧的格子位置
    private lastGridY: number = 0; // 上一帧的格子位置
    
    onLoad() {
        // 子类将调用 initPosition 来设置位置
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
        if (this.dead || this.finished) return;
        
        // 更新闪烁效果
        if (this.hitFlashTimer > 0) {
            this.hitFlashTimer -= deltaMS;
        }
        
        // 移动（简单格子移动）
        this.moveInGrid(deltaTime);
        
        // 寻找并攻击武器
        if (weapons && weapons.length > 0) {
            const target = this.findNearestWeapon(weapons);
            if (target) {
                this.attackTarget(target, deltaMS);
            }
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
     */
    private findNearestWeapon(weapons: any[]): any {
        let nearest = null;
        let minDist = this.attackRange * GameConfig.CELL_SIZE;
        
        for (const weapon of weapons) {
            if (!weapon.isValid) continue;
            
            const dist = Vec3.distance(this.node.position, weapon.position);
            if (dist < minDist) {
                minDist = dist;
                nearest = weapon;
            }
        }
        
        return nearest;
    }
    
    /**
     * 攻击目标
     */
    private attackTarget(target: any, deltaMS: number) {
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
        if (this.node.position.x > GameConfig.DESIGN_WIDTH) {
            this.finished = true;
            this.node.destroy();
        }
    }
    
    /**
     * 受到伤害
     */
    registerHit(damage: number) {
        this.hp -= damage;
        this.hitFlashTimer = 150;
        
        if (this.hp <= 0) {
            this.dead = true;
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
}

