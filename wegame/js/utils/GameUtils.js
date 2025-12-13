/**
 * 游戏工具类
 */

import { GameConfig } from '../config/GameConfig';

export class GameUtils {
  /**
   * 检查点是否在矩形内
   */
  static isPointInRect(x, y, rectX, rectY, width, height) {
    return x >= rectX && x <= rectX + width && y >= rectY && y <= rectY + height;
  }
  
  /**
   * 检查点是否在圆形内
   */
  static isPointInCircle(x, y, circleX, circleY, radius) {
    const dx = x - circleX;
    const dy = y - circleY;
    return dx * dx + dy * dy <= radius * radius;
  }
  
  /**
   * 检查两个圆形是否碰撞
   */
  static checkCircleCollision(x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < r1 + r2;
  }
  
  /**
   * 检查是否在战斗区域内
   */
  static isInBattleArea(x, y) {
    // x, y 是 Canvas 中心原点坐标
    // 转换为 Canvas 左上角原点坐标
    const canvasY = y + GameConfig.DESIGN_HEIGHT / 2;
    
    const battleStartY = GameConfig.BATTLE_START_ROW * GameConfig.CELL_SIZE;
    const battleEndY = (GameConfig.BATTLE_START_ROW + GameConfig.BATTLE_ROWS) * GameConfig.CELL_SIZE;
    
    return canvasY >= battleStartY && canvasY <= battleEndY;
  }
  
  /**
   * 将世界坐标转换为格子坐标
   */
  static worldToGrid(worldX, worldY) {
    return {
      col: Math.floor(worldX / GameConfig.CELL_SIZE),
      row: Math.floor(worldY / GameConfig.CELL_SIZE)
    };
  }
  
  /**
   * 将格子坐标转换为世界坐标（格子中心）
   */
  static gridToWorld(col, row) {
    return {
      x: col * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2,
      y: row * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2
    };
  }
}

