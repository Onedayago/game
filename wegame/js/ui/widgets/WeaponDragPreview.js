/**
 * 武器拖拽预览渲染器
 * 负责显示拖拽时的预览效果和放置反馈
 */

import { GameConfig } from '../../config/GameConfig';
import { UIConfig } from '../../config/UIConfig';
import { ColorUtils, GameColors } from '../../config/Colors';
import { WeaponConfigs } from '../../config/WeaponConfig';
import { WeaponRenderer } from '../../rendering/weapons/WeaponRenderer';
import { WeaponType } from '../../config/WeaponConfig';
import { CoordinateUtils } from '../../utils/CoordinateUtils';
import { GameContext } from '../../core/GameContext';

export class WeaponDragPreview {
  // 拖拽拖尾效果（静态属性）
  static _trailPositions = [];
  static _maxTrailLength = 8;
  static _animationTime = 0;
  
  /**
   * 更新动画时间
   */
  static updateAnimation(deltaTime) {
    this._animationTime += deltaTime * 1000;
  }
  
  /**
   * 添加拖尾位置
   */
  static addTrailPosition(x, y) {
    this._trailPositions.push({ x, y, time: this._animationTime });
    if (this._trailPositions.length > this._maxTrailLength) {
      this._trailPositions.shift();
    }
  }
  
  /**
   * 清空拖尾
   */
  static clearTrail() {
    this._trailPositions = [];
  }
  
  /**
   * 渲染拖拽预览（简化版：只显示范围和高亮）
   * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
   * @param {number} worldX - 世界坐标 X（已对齐到网格中心）
   * @param {number} worldY - 世界坐标 Y（已对齐到网格中心）
   * @param {string} weaponType - 武器类型
   * @param {WeaponManager} weaponManager - 武器管理器
   */
  static renderPreviewAt(ctx, worldX, worldY, weaponType, weaponManager, obstacleManager = null) {
    // 对齐到网格
    const col = Math.floor(worldX / GameConfig.CELL_SIZE);
    const row = Math.floor(worldY / GameConfig.CELL_SIZE);
    
    // 检查是否可以放置
    const canPlace = this.canPlaceAt(col, row, weaponManager, obstacleManager);
    
    // 计算预览位置（网格中心，世界坐标）
    const previewWorldX = col * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    const previewWorldY = row * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    
    // 转换为 Canvas 坐标（应用战场偏移）
    const gameContext = GameContext.getInstance();
    const previewX = previewWorldX - gameContext.worldOffsetX;
    const previewY = previewWorldY - gameContext.worldOffsetY;
    
    ctx.save();
    
    // 绘制攻击范围圈
    this.drawAttackRange(ctx, previewX, previewY, weaponType, canPlace);
    
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
    // 在 GameRenderer 中，使用 offsetX = -worldOffsetX, offsetY = -worldOffsetY 来平移画布
    // 所以当 worldOffsetX > 0 时，画布向左移动，世界坐标需要加上这个偏移
    const worldX = x + gameContext.worldOffsetX;
    const worldY = y + gameContext.worldOffsetY;
    
    // 对齐到网格
    const col = Math.floor(worldX / GameConfig.CELL_SIZE);
    const row = Math.floor(worldY / GameConfig.CELL_SIZE);
    
    // 检查是否可以放置
    const canPlace = this.canPlaceAt(col, row, weaponManager);
    
    // 计算预览位置（网格中心，世界坐标）
    const previewWorldX = col * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    const previewWorldY = row * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    
    // 转换回 Canvas 坐标（用于绘制）
    const canvasX = previewWorldX - gameContext.worldOffsetX;
    const canvasY = previewWorldY - gameContext.worldOffsetY;
    
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
  static canPlaceAt(col, row, weaponManager, obstacleManager = null) {
    // 检查是否在战斗区域内（排除底部UI区域）
    if (row < GameConfig.BATTLE_START_ROW || 
        row >= GameConfig.BATTLE_END_ROW) {
      return false;
    }
    
    // 检查格子是否有障碍物
    if (obstacleManager && obstacleManager.hasObstacle(col, row)) {
      return false; // 格子有障碍物，不能放置武器
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
   * 绘制拖尾效果
   */
  static drawTrail(ctx, weaponType, canPlace) {
    if (this._trailPositions.length < 2) return;
    
    const config = WeaponConfigs.getConfig(weaponType);
    const color = config ? config.colorHex : 0x00ff41;
    const baseColor = canPlace ? color : 0xff0000;
    
    // 绘制连接线（渐变透明度）
    for (let i = 1; i < this._trailPositions.length; i++) {
      const pos1 = this._trailPositions[i - 1];
      const pos2 = this._trailPositions[i];
      const alpha = (i / this._trailPositions.length) * 0.4;
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(baseColor, alpha);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(pos1.x, pos1.y);
      ctx.lineTo(pos2.x, pos2.y);
      ctx.stroke();
    }
    
    // 绘制拖尾圆点
    for (let i = 0; i < this._trailPositions.length; i++) {
      const pos = this._trailPositions[i];
      const alpha = (i / this._trailPositions.length) * 0.5;
      const size = (i / this._trailPositions.length) * 8;
      
      ctx.fillStyle = ColorUtils.hexToCanvas(baseColor, alpha);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  /**
   * 绘制攻击范围圈（简化版）
   */
  static drawAttackRange(ctx, x, y, weaponType, canPlace) {
    const config = WeaponConfigs.getConfig(weaponType);
    if (!config) return;
    
    const range = config.attackRange * GameConfig.CELL_SIZE;
    const color = canPlace ? config.colorHex : 0xff0000;
    
    // 数值验证
    if (!isFinite(range) || range <= 0 || !isFinite(x) || !isFinite(y)) {
      return;
    }
    
    // 绘制范围圈
    ctx.strokeStyle = ColorUtils.hexToCanvas(color, 0.5);
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.arc(x, y, range, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  
  /**
   * 绘制网格高亮（简化版）
   */
  static drawGridHighlight(ctx, x, y, canPlace) {
    const cellSize = GameConfig.CELL_SIZE;
    const halfSize = cellSize / 2;
    
    // 绘制背景
    if (canPlace) {
      ctx.fillStyle = 'rgba(0, 255, 100, 0.2)';
    } else {
      ctx.fillStyle = 'rgba(255, 50, 50, 0.3)';
    }
    ctx.fillRect(x - halfSize, y - halfSize, cellSize, cellSize);
    
    // 绘制边框
    if (canPlace) {
      ctx.strokeStyle = 'rgba(0, 255, 100, 0.8)';
    } else {
      ctx.strokeStyle = 'rgba(255, 50, 50, 0.9)';
    }
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
    } else if (weaponType === WeaponType.CANNON) {
      WeaponRenderer.renderCannonTower(ctx, x, y, size, 1);
    } else if (weaponType === WeaponType.SNIPER) {
      WeaponRenderer.renderSniperTower(ctx, x, y, size, 1);
    }
    
    ctx.restore();
  }
}

