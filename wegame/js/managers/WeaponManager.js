/**
 * 武器管理器
 */

import { GameContext } from '../core/GameContext';
import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';
import { WeaponType } from '../config/WeaponConfig';
import { RocketTower } from '../entities/weapons/RocketTower';
import { LaserTower } from '../entities/weapons/LaserTower';
import { CannonTower } from '../entities/weapons/CannonTower';
import { SniperTower } from '../entities/weapons/SniperTower';
import { LogUtils } from '../utils/LogUtils';

export class WeaponManager {
  constructor(ctx) {
    this.ctx = ctx;
    this.weapons = [];
    this.selectedWeapon = null;
    this.obstacleManager = null; // 障碍物管理器引用
    this.effectManager = null; // 特效管理器引用
    this.audioManager = null; // 音频管理器引用
  }
  
  /**
   * 设置障碍物管理器
   */
  setObstacleManager(obstacleManager) {
    this.obstacleManager = obstacleManager;
  }
  
  /**
   * 设置特效管理器
   */
  setEffectManager(effectManager) {
    this.effectManager = effectManager;
  }
  
  /**
   * 设置音频管理器
   */
  setAudioManager(audioManager) {
    this.audioManager = audioManager;
  }
  
  /**
   * 放置武器
   */
  placeWeapon(x, y, weaponType) {
    // 转换为格子坐标
    const col = Math.floor(x / GameConfig.CELL_SIZE);
    const row = Math.floor(y / GameConfig.CELL_SIZE);
    
    // 检查是否在战斗区域内（排除底部UI区域）
    if (row < GameConfig.BATTLE_START_ROW || 
        row >= GameConfig.BATTLE_END_ROW) {
      return false;
    }
    
    // 检查格子是否有障碍物
    if (this.obstacleManager && this.obstacleManager.hasObstacle(col, row)) {
      return false; // 格子有障碍物，不能放置武器
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
    } else if (weaponType === WeaponType.CANNON) {
      weapon = new CannonTower(this.ctx, gridX, gridY);
    } else if (weaponType === WeaponType.SNIPER) {
      weapon = new SniperTower(this.ctx, gridX, gridY);
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
      this.weapons.splice(index, 1);
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
   * 升级武器
   */
  upgradeWeapon(weapon) {
    if (!weapon || weapon.destroyed) {
      return false;
    }
    
    if (weapon.level >= weapon.maxLevel) {
      return false; // 已满级
    }
    
    const upgradeCost = weapon.getUpgradeCost();
    const gameContext = GameContext.getInstance();
    
    // 检查金币是否足够
    if (gameContext.gold < upgradeCost) {
      return false; // 金币不足
    }
    
    // 扣除金币
    gameContext.gold -= upgradeCost;
    
    // 升级武器
    const oldLevel = weapon.level;
    weapon.upgrade();
    
    // 创建武器升级特效
    if (this.effectManager && weapon.level > oldLevel) {
      this.effectManager.createWeaponUpgradeEffect(weapon.x, weapon.y, weapon.weaponType, weapon.level);
    }
    
    return true;
  }
  
  /**
   * 出售武器
   */
  sellWeapon(weapon) {
    if (!weapon || weapon.destroyed) {
      return false;
    }
    
    const sellGain = weapon.getSellGain();
    const gameContext = GameContext.getInstance();
    
    // 增加金币
    gameContext.gold += sellGain;
    
    // 标记为销毁
    weapon.destroyed = true;
    
    // 从管理器中移除
    this.removeWeapon(weapon);
    
    // 如果选中的是这个武器，清除选中
    if (this.selectedWeapon === weapon) {
      this.selectedWeapon = null;
    }
    
    return true;
  }
  
  /**
   * 根据坐标查找武器
   */
  findWeaponAt(x, y) {
    for (const weapon of this.weapons) {
      if (!weapon || weapon.destroyed) continue;
      
      // 使用武器的实际尺寸
      const weaponSize = weapon.size || GameConfig.CELL_SIZE;
      const halfSize = weaponSize / 2;
      
      // 检查点击是否在武器范围内（圆形检测）
      const dx = weapon.x - x;
      const dy = weapon.y - y;
      const distSq = dx * dx + dy * dy;
      const radiusSq = halfSize * halfSize;
      
      if (distSq <= radiusSq) {
        return weapon;
      }
    }
    
    return null;
  }
  
  /**
   * 更新武器
   */
  update(deltaTime, deltaMS, enemies) {
   
    
    // 更新所有武器（传递选中的武器，让武器自己判断是否被选中）
    for (let i = this.weapons.length - 1; i >= 0; i--) {
      const weapon = this.weapons[i];
      
      if (!weapon || weapon.destroyed) {
        this.weapons.splice(i, 1);
        continue;
      }
      
      LogUtils.log('WeaponManager.update: weapon', 10000,this.selectedWeapon);
      
      weapon.update(deltaTime, deltaMS, enemies || [], this.selectedWeapon);
    }
  }
  
  /**
   * 渲染武器（带视锥剔除，优化：移除 save/restore）
   */
  render(viewLeft = -Infinity, viewRight = Infinity, viewTop = -Infinity, viewBottom = Infinity, offsetX = 0, offsetY = 0) {
    
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
      
      // 渲染武器（选中状态已在update中处理，存储在weapon.isSelected中）
      if (weapon.render) {
        weapon.render(viewLeft, viewRight, viewTop, viewBottom, offsetX, offsetY);
      }
      
      // 调试：如果选中了武器，输出日志（使用延时打印，每2000ms输出一次）
      if (weapon.isSelected) {
        LogUtils.log('WeaponManager.render.selectedWeapon', 2000, 'WeaponManager.render: 渲染选中的武器', {
          x: weapon.x,
          y: weapon.y,
          weaponType: weapon.weaponType,
          level: weapon.level,
          maxLevel: weapon.maxLevel
        });
      }
    }
  }
}

