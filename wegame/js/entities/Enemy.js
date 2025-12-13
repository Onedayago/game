/**
 * 敌人基类
 */

import { GameConfig } from '../config/GameConfig';
import { EnemyRenderer } from '../rendering/EnemyRenderer';
import { WeaponRenderer } from '../rendering/WeaponRenderer';
import { GameContext } from '../core/GameContext';
import { GameColors } from '../config/Colors';
import { EnemyTargeting } from './EnemyTargeting';
import { EnemyMovement } from './EnemyMovement';

export class Enemy {
  constructor(ctx, x, y) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.gridX = 0;
    this.gridY = 0;
    
    this.maxHp = GameConfig.ENEMY_MAX_HP;
    this.hp = this.maxHp;
    this.moveSpeed = GameConfig.ENEMY_MOVE_SPEED;
    this.attackRange = GameConfig.ENEMY_ATTACK_RANGE;
    this.fireInterval = GameConfig.ENEMY_FIRE_INTERVAL;
    this.damage = GameConfig.ENEMY_BULLET_DAMAGE;
    
    this.timeSinceLastFire = 0;
    this.currentTarget = null;
    this.targetLostTime = 0;
    this.TARGET_LOCK_DURATION = 500;
    this.targetSearchTimer = 0;
    this.TARGET_SEARCH_INTERVAL = 300; // 每300ms查找一次目标，减少查找频率
    
    this.angle = 0;
    this.destroyed = false;
    this.finished = false;
    
    // 敌人尺寸
    this.size = GameConfig.ENEMY_SIZE;
  }
  
  /**
   * 设置血量加成
   */
  setHpBonus(bonus) {
    this.maxHp = GameConfig.ENEMY_MAX_HP + bonus;
    this.hp = this.maxHp;
  }
  
  /**
   * 初始化位置
   */
  initPosition(row) {
    this.gridX = 0;
    this.gridY = GameConfig.BATTLE_START_ROW + row;
    this.updateWorldPosition();
  }
  
  /**
   * 更新世界坐标
   * 敌人应该对齐到格子中心
   */
  updateWorldPosition() {
    // 敌人对齐到格子中心
    this.x = this.gridX * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    this.y = this.gridY * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
  }
  
  /**
   * 更新敌人（优化：减少目标验证频率）
   */
  update(deltaTime, deltaMS, weapons) {
    if (this.destroyed || this.finished) return;
    
    this.timeSinceLastFire += deltaMS;
    this.targetSearchTimer += deltaMS;
    
    // 降低目标查找频率：每300ms查找一次，而不是每帧
    const shouldSearchTarget = this.targetSearchTimer >= this.TARGET_SEARCH_INTERVAL || !this.currentTarget;
    
    if (shouldSearchTarget) {
      this.targetSearchTimer = 0;
      
      // 如果当前目标无效，清除它
      if (this.currentTarget && !EnemyTargeting.isTargetValid(this.currentTarget)) {
        this.currentTarget = null;
        this.targetLostTime = 0;
      }
      
      // 如果没有目标，寻找新目标
      if (!this.currentTarget) {
        const target = EnemyTargeting.findNearestWeapon(this, weapons);
        if (target) {
          this.currentTarget = target;
          this.targetLostTime = 0;
        }
      }
    }
    
    // 如果有目标，攻击目标（优化：减少每帧的距离计算）
    if (this.currentTarget) {
      // 只在查找目标时验证有效性，减少每帧验证
      if (shouldSearchTarget) {
        // 检查锁定目标是否仍然有效
        if (!EnemyTargeting.isTargetValid(this.currentTarget)) {
          this.currentTarget = null;
          this.targetLostTime = 0;
          this.timeSinceLastFire = 0;
        } else {
          // 验证距离（只在查找目标时）
          const attackRangeSq = (this.attackRange * GameConfig.CELL_SIZE) ** 2;
          const distSq = EnemyTargeting.getDistanceSqToTarget(this, this.currentTarget);
          
          if (distSq > attackRangeSq) {
            this.targetLostTime += deltaMS;
            if (this.targetLostTime > this.TARGET_LOCK_DURATION) {
              this.currentTarget = null;
              this.targetLostTime = 0;
              this.timeSinceLastFire = 0;
            }
          } else {
            this.targetLostTime = 0;
          }
        }
      }
      
      // 如果目标仍然有效，攻击它
      if (this.currentTarget && this.targetLostTime <= this.TARGET_LOCK_DURATION) {
        this.attackTarget(this.currentTarget, deltaMS);
      }
    }
    
    // 只有在没有攻击目标时才移动
    if (!this.currentTarget || this.targetLostTime > this.TARGET_LOCK_DURATION) {
      this.angle = 0; // 恢复默认朝向
      EnemyMovement.moveInGrid(this, deltaTime);
    }
    
    // 检查是否到达终点
    EnemyMovement.checkFinished(this);
  }
  
  
  /**
   * 攻击目标
   */
  attackTarget(target, deltaMS) {
    // 旋转敌人面向目标
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    this.angle = Math.atan2(dy, dx);
    
    if (this.timeSinceLastFire >= this.fireInterval) {
      this.timeSinceLastFire = 0;
      this.fire(target);
    }
  }
  
  
  /**
   * 开火（子类实现）
   */
  fire(target) {
    // 子类实现
  }
  
  /**
   * 受到伤害
   */
  takeDamage(damage) {
    this.hp -= damage;
    
    // 创建击中粒子效果
    const gameContext = GameContext.getInstance();
    if (gameContext.particleManager) {
      gameContext.particleManager.createHitSpark(
        this.x,
        this.y,
        GameColors.ENEMY_DETAIL
      );
    }
    
    if (this.hp <= 0) {
      this.destroyed = true;
      
      // 创建死亡爆炸效果
      if (gameContext.particleManager) {
        gameContext.particleManager.createExplosion(
          this.x,
          this.y,
          GameColors.ENEMY_TANK,
          GameConfig.PARTICLE_EXPLOSION_COUNT
        );
      }
    }
  }
  
  /**
   * 渲染敌人（带视锥剔除）
   */
  render(viewLeft = -Infinity, viewRight = Infinity, viewTop = -Infinity, viewBottom = Infinity) {
    if (this.destroyed || this.finished) return;
    
    // 渲染敌人本体（子类实现具体渲染）
    // 这里先使用默认渲染
    
    // 渲染血条（始终显示，但满血时显示为满）
    WeaponRenderer.renderHealthBar(this.ctx, this.x, this.y, this.hp, this.maxHp, this.size);
  }
}

