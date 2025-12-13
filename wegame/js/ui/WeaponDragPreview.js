/**
 * 武器拖拽预览渲染器
 * 负责显示拖拽时的预览效果和放置反馈
 */

import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';
import { ColorUtils, GameColors } from '../config/Colors';
import { WeaponConfigs } from '../config/WeaponConfig';
import { WeaponRenderer } from '../rendering/WeaponRenderer';
import { WeaponType } from '../config/WeaponConfig';
import { CoordinateUtils } from '../utils/CoordinateUtils';
import { GameContext } from '../core/GameContext';

export class WeaponDragPreview {
  /**
   * 渲染拖拽预览（在指定世界坐标位置）
   * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
   * @param {number} worldX - 世界坐标 X（已对齐到网格中心）
   * @param {number} worldY - 世界坐标 Y（已对齐到网格中心）
   * @param {string} weaponType - 武器类型
   * @param {WeaponManager} weaponManager - 武器管理器
   */
  static renderPreviewAt(ctx, worldX, worldY, weaponType, weaponManager) {
    // 对齐到网格
    const col = Math.floor(worldX / GameConfig.CELL_SIZE);
    const row = Math.floor(worldY / GameConfig.CELL_SIZE);
    
    // 检查是否可以放置
    const canPlace = this.canPlaceAt(col, row, weaponManager);
    
    // 计算预览位置（网格中心）
    const previewX = col * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    const previewY = row * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    
    ctx.save();
    
    // 绘制预览网格高亮
    this.drawGridHighlight(ctx, previewX, previewY, canPlace);
    
    // 绘制预览武器图标
    this.drawPreviewWeapon(ctx, previewX, previewY, weaponType, canPlace);
    
    ctx.restore();
  }
  
  /**
   * 渲染拖拽预览（从触摸坐标）
   * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
   * @param {number} x - 触摸点 X 坐标（Canvas 左上角原点）
   * @param {number} y - 触摸点 Y 坐标（Canvas 左上角原点）
   * @param {string} weaponType - 武器类型
   * @param {WeaponManager} weaponManager - 武器管理器
   */
  static render(ctx, x, y, weaponType, weaponManager) {
    const config = WeaponConfigs.getConfig(weaponType);
    if (!config) return;
    
    // 转换为世界坐标（考虑世界偏移）
    const gameContext = GameContext.getInstance();
    
    // 触摸坐标是 Canvas 左上角原点，需要转换为世界坐标
    // 在 GameRenderer 中，使用 offsetX = -worldOffsetX 来平移画布
    // 所以当 worldOffsetX > 0 时，画布向左移动，世界坐标需要加上这个偏移
    const worldX = x + gameContext.worldOffsetX;
    const worldY = y;
    
    // 对齐到网格
    const col = Math.floor(worldX / GameConfig.CELL_SIZE);
    const row = Math.floor(worldY / GameConfig.CELL_SIZE);
    
    // 检查是否可以放置
    const canPlace = this.canPlaceAt(col, row, weaponManager);
    
    // 计算预览位置（网格中心，世界坐标）
    const previewWorldX = col * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    const previewWorldY = row * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    
    // 转换回 Canvas 坐标（用于绘制）
    const canvasX = previewWorldX + gameContext.worldOffsetX;
    const canvasY = previewWorldY;
    
    ctx.save();
    
    // 绘制预览网格高亮
    this.drawGridHighlight(ctx, canvasX, canvasY, canPlace);
    
    // 绘制预览武器图标
    this.drawPreviewWeapon(ctx, canvasX, canvasY, weaponType, canPlace);
    
    ctx.restore();
  }
  
  /**
   * 检查是否可以在指定位置放置武器
   */
  static canPlaceAt(col, row, weaponManager) {
    // 检查是否在战斗区域内
    if (row < GameConfig.BATTLE_START_ROW || 
        row >= GameConfig.BATTLE_START_ROW + GameConfig.BATTLE_ROWS) {
      return false;
    }
    
    // 检查格子是否已被占用
    if (weaponManager) {
      for (const weapon of weaponManager.getWeapons()) {
        const weaponCol = Math.floor(weapon.x / GameConfig.CELL_SIZE);
        const weaponRow = Math.floor(weapon.y / GameConfig.CELL_SIZE);
        if (weaponCol === col && weaponRow === row) {
          return false; // 格子已被占用
        }
      }
    }
    
    return true;
  }
  
  /**
   * 绘制网格高亮
   */
  static drawGridHighlight(ctx, x, y, canPlace) {
    const cellSize = GameConfig.CELL_SIZE;
    const halfSize = cellSize / 2;
    
    // 绘制半透明背景
    ctx.fillStyle = canPlace 
      ? 'rgba(0, 255, 0, 0.2)'  // 绿色：可以放置
      : 'rgba(255, 0, 0, 0.2)'; // 红色：不能放置
    
    ctx.fillRect(x - halfSize, y - halfSize, cellSize, cellSize);
    
    // 绘制边框
    ctx.strokeStyle = canPlace
      ? 'rgba(0, 255, 0, 0.8)'  // 绿色边框
      : 'rgba(255, 0, 0, 0.8)'; // 红色边框
    ctx.lineWidth = 2;
    ctx.strokeRect(x - halfSize, y - halfSize, cellSize, cellSize);
  }
  
  /**
   * 绘制预览武器
   */
  static drawPreviewWeapon(ctx, x, y, weaponType, canPlace) {
    const size = GameConfig.CELL_SIZE * UIConfig.WEAPON_MAP_SIZE_RATIO;
    const alpha = canPlace ? 0.7 : 0.4;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    
    // 使用武器渲染器绘制预览
    if (weaponType === WeaponType.ROCKET) {
      WeaponRenderer.renderRocketTower(ctx, x, y, size, 1);
    } else if (weaponType === WeaponType.LASER) {
      WeaponRenderer.renderLaserTower(ctx, x, y, size, 1);
    }
    
    ctx.restore();
  }
}

