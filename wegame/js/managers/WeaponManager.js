/**
 * 武器管理器
 */

import { GameContext } from '../core/GameContext';
import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';
import { WeaponType } from '../config/WeaponConfig';
import { RocketTower } from '../entities/RocketTower';
import { LaserTower } from '../entities/LaserTower';

export class WeaponManager {
  constructor(ctx) {
    this.ctx = ctx;
    this.weapons = [];
    this.selectedWeapon = null;
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
   * 更新武器
   */
  update(deltaTime, deltaMS, enemies) {
    // 更新所有武器
    for (let i = this.weapons.length - 1; i >= 0; i--) {
      const weapon = this.weapons[i];
      
      if (!weapon || weapon.destroyed) {
        this.weapons.splice(i, 1);
        continue;
      }
      
      if (weapon.update) {
        weapon.update(deltaTime, deltaMS, enemies || []);
      }
    }
  }
  
  /**
   * 渲染武器（带视锥剔除，优化：移除 save/restore）
   */
  render(viewLeft = -Infinity, viewRight = Infinity, viewTop = -Infinity, viewBottom = Infinity) {
    // 获取战场偏移（如果传入）
    const offsetX = arguments[4] || 0;
    const offsetY = arguments[5] || 0;
    
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
        weapon.render(viewLeft, viewRight, viewTop, viewBottom, offsetX, offsetY);
      }
    }
  }
}

