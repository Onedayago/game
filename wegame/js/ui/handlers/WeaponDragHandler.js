/**
 * 武器拖拽处理器
 * 处理武器拖拽和放置逻辑
 */

import { GameConfig } from '../../config/GameConfig';
import { UIConfig } from '../../config/UIConfig';
import { WeaponConfigs } from '../../config/WeaponConfig';
import { CoordinateUtils } from '../../utils/CoordinateUtils';
import { GameContext } from '../../core/GameContext';

export class WeaponDragHandler {
  constructor(goldManager, weaponManager) {
    this.goldManager = goldManager;
    this.weaponManager = weaponManager;
  }
  
  /**
   * 处理拖拽结束，尝试放置武器
   */
  handleDrop(x, y, dragType) {
    if (!dragType) return false;
    
    // 检查是否在战斗区域内（直接使用 Canvas 坐标系，Y 轴从上往下，排除底部UI区域）
    const battleStartY = GameConfig.BATTLE_START_ROW * GameConfig.CELL_SIZE;
    const battleEndY = GameConfig.BATTLE_END_ROW * GameConfig.CELL_SIZE;
    
    if (y < battleStartY || y >= battleEndY) {
      return false;
    }
    
    // 尝试放置武器
    const config = WeaponConfigs.getConfig(dragType);
    if (!config || !this.goldManager.spend(config.baseCost)) {
      return false;
    }
    
    // 转换为世界坐标（考虑世界偏移）
    const gameContext = GameContext.getInstance();
    
    // 触摸坐标是 Canvas 左上角原点，需要转换为世界坐标
    // 在 GameRenderer 中，使用 offsetX = -worldOffsetX, offsetY = -worldOffsetY 来平移画布
    // 所以当 worldOffsetX > 0 时，画布向左移动，世界坐标需要加上这个偏移
    const worldX = x + gameContext.worldOffsetX;
    const worldY = y + gameContext.worldOffsetY;
    
    // 对齐到网格中心
    const col = Math.floor(worldX / GameConfig.CELL_SIZE);
    const row = Math.floor(worldY / GameConfig.CELL_SIZE);
    const gridX = col * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    const gridY = row * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    
    // 直接使用 Canvas 坐标系
    if (this.weaponManager.placeWeapon(gridX, gridY, dragType)) {
      return true;
    } else {
      // 放置失败，退还金币
      this.goldManager.addGold(config.baseCost);
      return false;
    }
  }
  
  /**
   * 检查是否可以开始拖拽（是否有足够金币）
   */
  canStartDrag(weaponType) {
    const config = WeaponConfigs.getConfig(weaponType);
    return config && this.goldManager.canAfford(config.baseCost);
  }
}

