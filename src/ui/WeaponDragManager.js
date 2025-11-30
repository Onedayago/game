import { COLORS, CELL_SIZE, BATTLE_HEIGHT, BATTLE_ROWS, WORLD_WIDTH } from '../constants';
import { WeaponIconRenderer } from './WeaponIconRenderer';
import { WeaponConfig, WEAPON_TYPES } from '../config/weaponTypes';

/**
 * 武器拖拽管理器
 * 负责处理武器拖拽、吸附、验证等逻辑
 */
export class WeaponDragManager {
  constructor(app, goldManager, checkOccupied) {
    this.app = app;
    this.goldManager = goldManager;
    this.checkOccupied = checkOccupied; // 检查格子是否被占用的回调

    this.dragSprite = null;
    this.dragGlow = null;
    this.dragType = 'rocket'; // 当前拖拽的武器类型
  }

  /**
   * 开始拖拽
   */
  startDrag(x, y, weaponType) {
    this.stopDrag();

    this.dragType = weaponType;
    const config = WeaponConfig.getConfigById(weaponType);

    // 创建拖拽光晕
    this.dragGlow = WeaponIconRenderer.createDragGlow(config.color);
    this.dragGlow.x = x;
    this.dragGlow.y = y;
    this.app.stage.addChild(this.dragGlow);

    // 创建拖拽幽灵
    this.dragSprite = WeaponIconRenderer.createIcon(weaponType, true);
    this.dragSprite.alpha = 0.9;
    this.dragSprite.x = x;
    this.dragSprite.y = y;
    this.app.stage.addChild(this.dragSprite);
  }

  /**
   * 拖拽移动
   */
  onDragMove(x, y) {
    if (!this.dragSprite) return;

    // 更新光晕和幽灵位置
    if (this.dragGlow) {
      this.dragGlow.x = x;
      this.dragGlow.y = y;
    }

    this.dragSprite.x = x;
    this.dragSprite.y = y;
    this.dragSprite.alpha = 0.85;
    this.dragSprite.tint = 0xffffff;

    // 尝试吸附到网格
    const snapInfo = this.trySnapToGrid(x, y);

    if (snapInfo.inGrid) {
      // 吸附到格子中心
      this.dragSprite.x = snapInfo.globalX;
      this.dragSprite.y = snapInfo.globalY;

      if (this.dragGlow) {
        this.dragGlow.x = snapInfo.globalX;
        this.dragGlow.y = snapInfo.globalY;
      }

      // 检查是否可放置
      const valid = this.validatePlacement(snapInfo.col, snapInfo.row);

      // 根据有效性改变颜色
      if (valid) {
        this.dragSprite.tint = COLORS.SUCCESS;
        this.dragSprite.alpha = 0.95;
        if (this.dragGlow) {
          this.dragGlow.tint = COLORS.SUCCESS;
          this.dragGlow.alpha = 1.2;
        }
      } else {
        this.dragSprite.tint = COLORS.DANGER;
        this.dragSprite.alpha = 0.7;
        if (this.dragGlow) {
          this.dragGlow.tint = COLORS.DANGER;
          this.dragGlow.alpha = 0.8;
        }
      }
    } else {
      // 不在网格内
      this.dragSprite.tint = 0xffffff;
      this.dragSprite.alpha = 0.6;
      if (this.dragGlow) {
        this.dragGlow.tint = 0xffffff;
        this.dragGlow.alpha = 0.5;
      }
    }
  }

  /**
   * 停止拖拽
   */
  stopDrag() {
    if (this.dragSprite) {
      this.app.stage.removeChild(this.dragSprite);
      this.dragSprite = null;
    }
    if (this.dragGlow) {
      this.app.stage.removeChild(this.dragGlow);
      this.dragGlow = null;
    }
  }

  /**
   * 尝试吸附到网格
   */
  trySnapToGrid(globalX, globalY) {
    const world = this.app.world || this.app.stage;
    const worldPos = world.toLocal({ x: globalX, y: globalY });
    const wx = worldPos.x;
    const wy = worldPos.y;

    // 网格区域判定
    const gridMinY = 0;
    const gridHeight = BATTLE_HEIGHT;
    const gridMaxY = gridMinY + gridHeight;
    const minRowIndex = 0;
    const maxRowIndex = Math.max(minRowIndex, BATTLE_ROWS - 1);

    const inGrid = wy >= gridMinY && wy < gridMaxY && wx >= 0 && wx <= WORLD_WIDTH;

    if (!inGrid) {
      return { inGrid: false };
    }

    // 计算格子坐标
    const col = Math.floor(wx / CELL_SIZE);
    const rawRow = Math.floor((wy - gridMinY) / CELL_SIZE);
    const row = Math.min(maxRowIndex, Math.max(minRowIndex, rawRow));

    // 计算格子中心
    const cellCenterX = col * CELL_SIZE + CELL_SIZE / 2;
    const cellCenterY = gridMinY + row * CELL_SIZE + CELL_SIZE / 2;

    // 转换回全局坐标
    const snappedGlobal = world.toGlobal({ x: cellCenterX, y: cellCenterY });

    return {
      inGrid: true,
      col,
      row,
      worldX: cellCenterX,
      worldY: cellCenterY,
      globalX: snappedGlobal.x,
      globalY: snappedGlobal.y,
    };
  }

  /**
   * 验证是否可以放置
   */
  validatePlacement(col, row) {
    // 检查是否被占用
    if (this.checkOccupied(col, row)) {
      return false;
    }

    // 检查金币
    const cost = WeaponConfig.getPlacementCost(this.dragType, 1);
    if (this.goldManager && !this.goldManager.canAfford(cost)) {
      return false;
    }

    return true;
  }

  /**
   * 尝试放置武器
   * @returns {Object|null} 返回放置信息或null
   */
  tryPlaceWeapon(globalX, globalY) {
    const snapInfo = this.trySnapToGrid(globalX, globalY);

    if (!snapInfo.inGrid) {
      return null;
    }

    if (!this.validatePlacement(snapInfo.col, snapInfo.row)) {
      return null;
    }

    // 扣除金币
    const cost = WeaponConfig.getPlacementCost(this.dragType, 1);
    if (this.goldManager && !this.goldManager.spend(cost)) {
      return null;
    }

    return {
      type: this.dragType,
      col: snapInfo.col,
      row: snapInfo.row,
      x: snapInfo.worldX,
      y: snapInfo.worldY,
    };
  }

  isDragging() {
    return this.dragSprite !== null;
  }

  getCurrentDragType() {
    return this.dragType;
  }
}

