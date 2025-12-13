/**
 * 武器管理器
 */

import { GameContext } from '../core/GameContext';
import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';
import { WeaponType } from '../config/WeaponConfig';
import { RocketTower } from '../entities/RocketTower';
import { LaserTower } from '../entities/LaserTower';
import { ComputeOptimizer } from '../core/ComputeOptimizer';

export class WeaponManager {
  constructor(ctx) {
    this.ctx = ctx;
    this.weapons = [];
    this.selectedWeapon = null;
    this.targetCache = new Map(); // 目标缓存
    this.cacheValid = false;
    this.batchUpdateTimer = 0; // 批量更新计时器
    this.BATCH_UPDATE_INTERVAL = 200; // 每200ms批量更新一次目标查找
  }
  
  /**
   * 放置武器
   */
  placeWeapon(x, y, weaponType) {
    // 转换为格子坐标
    const col = Math.floor(x / GameConfig.CELL_SIZE);
    const row = Math.floor(y / GameConfig.CELL_SIZE);
    
    // 检查是否在战斗区域内
    if (row < GameConfig.BATTLE_START_ROW || 
        row >= GameConfig.BATTLE_START_ROW + GameConfig.BATTLE_ROWS) {
      return false;
    }
    
    // 检查格子是否已被占用
    const gridX = col * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    const gridY = row * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    
    for (const weapon of this.weapons) {
      const weaponCol = Math.floor(weapon.x / GameConfig.CELL_SIZE);
      const weaponRow = Math.floor(weapon.y / GameConfig.CELL_SIZE);
      if (weaponCol === col && weaponRow === row) {
        return false; // 格子已被占用
      }
    }
    
    // 创建武器
    let weapon;
    if (weaponType === WeaponType.ROCKET) {
      weapon = new RocketTower(this.ctx, gridX, gridY);
    } else if (weaponType === WeaponType.LASER) {
      weapon = new LaserTower(this.ctx, gridX, gridY);
    } else {
      return false;
    }
    
    this.addWeapon(weapon);
    return true;
  }
  
  /**
   * 添加武器
   */
  addWeapon(weapon) {
    this.weapons.push(weapon);
    const gameContext = GameContext.getInstance();
    gameContext.addWeapon(weapon);
  }
  
  /**
   * 移除武器
   */
  removeWeapon(weapon) {
    const index = this.weapons.indexOf(weapon);
    if (index > -1) {
      // 快速删除：将最后一个元素移到当前位置
      const last = this.weapons.length - 1;
      if (index !== last) {
        this.weapons[index] = this.weapons[last];
      }
      this.weapons.pop();
      
      const gameContext = GameContext.getInstance();
      gameContext.removeWeapon(weapon);
    }
  }
  
  /**
   * 获取所有武器
   */
  getWeapons() {
    return this.weapons;
  }
  
  /**
   * 获取选中的武器
   */
  getSelectedWeapon() {
    return this.selectedWeapon;
  }
  
  /**
   * 设置选中的武器
   */
  setSelectedWeapon(weapon) {
    this.selectedWeapon = weapon;
  }
  
  /**
   * 更新武器（使用批量目标查找优化，批量删除已销毁的武器）
   */
  update(deltaTime, deltaMS, enemies) {
    // 优化：先更新，再批量删除已销毁的武器
    let writeIndex = 0;
    for (let readIndex = 0; readIndex < this.weapons.length; readIndex++) {
      const weapon = this.weapons[readIndex];
      
      if (!weapon || weapon.destroyed) {
        // 清除缓存
        if (weapon) {
          this.targetCache.delete(weapon);
        }
        continue; // 跳过已销毁的武器
      }
      
      if (weapon.update) {
        // 使用缓存的目标（如果有效）
        const cachedTarget = this.targetCache.get(weapon);
        if (cachedTarget && !cachedTarget.destroyed) {
          // 检查目标是否仍在范围内
          const dx = cachedTarget.x - weapon.x;
          const dy = cachedTarget.y - weapon.y;
          const distSq = dx * dx + dy * dy;
          const rangeSq = (weapon.attackRange * GameConfig.CELL_SIZE) ** 2;
          
          if (distSq <= rangeSq) {
            // 使用缓存的目标，避免重复查找
            weapon.currentTarget = cachedTarget;
            weapon.update(deltaTime, deltaMS, enemies || []);
          } else {
            // 目标超出范围，清除缓存
            this.targetCache.delete(weapon);
            weapon.update(deltaTime, deltaMS, enemies || []);
          }
        } else {
          weapon.update(deltaTime, deltaMS, enemies || []);
        }
        
        // 更新缓存（如果武器找到了新目标）
        if (weapon.currentTarget) {
          this.targetCache.set(weapon, weapon.currentTarget);
        }
      }
      
      // 只保留未销毁的武器（原地覆盖）
      if (!weapon.destroyed) {
        if (writeIndex !== readIndex) {
          this.weapons[writeIndex] = weapon;
        }
        writeIndex++;
      } else {
        // 清除缓存
        this.targetCache.delete(weapon);
      }
    }
    
    // 删除已销毁的武器
    this.weapons.length = writeIndex;
  }
  
  /**
   * 批量更新目标查找（优化性能）
   * 限制查找频率，避免每帧都执行昂贵的计算
   */
  batchUpdateTargets(enemies, deltaMS) {
    if (!enemies || enemies.length === 0) return;
    
    // 限制批量查找频率
    this.batchUpdateTimer += deltaMS;
    if (this.batchUpdateTimer < this.BATCH_UPDATE_INTERVAL) {
      return; // 还没到更新时间
    }
    this.batchUpdateTimer = 0;
    
    // 限制查找范围：只查找屏幕内的敌人（粗略估计）
    // 这样可以大幅减少计算量
    const MAX_ENEMIES_TO_CHECK = 50; // 最多检查50个敌人
    const enemiesToCheck = enemies.length > MAX_ENEMIES_TO_CHECK 
      ? enemies.slice(0, MAX_ENEMIES_TO_CHECK) 
      : enemies;
    
    // 限制武器数量：只对屏幕内的武器进行批量查找
    const MAX_WEAPONS_TO_CHECK = 30; // 最多检查30个武器
    const weaponsToCheck = this.weapons.length > MAX_WEAPONS_TO_CHECK
      ? this.weapons.slice(0, MAX_WEAPONS_TO_CHECK)
      : this.weapons;
    
    // 使用批量查找优化（只对部分武器和敌人）
    const targets = ComputeOptimizer.batchFindTargets(weaponsToCheck, enemiesToCheck);
    
    // 更新缓存
    for (const [weapon, target] of targets.entries()) {
      this.targetCache.set(weapon, target);
      if (weapon) {
        weapon.currentTarget = target;
      }
    }
  }
  
  /**
   * 渲染武器（带视锥剔除）
   */
  render(viewLeft = -Infinity, viewRight = Infinity, viewTop = -Infinity, viewBottom = Infinity) {
    this.ctx.save();
    
    // 渲染所有武器（只渲染屏幕内的）
    for (const weapon of this.weapons) {
      if (!weapon || weapon.destroyed) continue;
      
      // 视锥剔除：只渲染屏幕内的武器
      const weaponSize = weapon.size || GameConfig.CELL_SIZE;
      if (weapon.x + weaponSize < viewLeft || 
          weapon.x - weaponSize > viewRight ||
          weapon.y + weaponSize < viewTop || 
          weapon.y - weaponSize > viewBottom) {
        continue; // 跳过屏幕外的武器
      }
      
      if (weapon.render) {
        weapon.render(viewLeft, viewRight, viewTop, viewBottom);
      }
    }
    
    this.ctx.restore();
  }
}

