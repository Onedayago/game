/**
 * 坐标转换工具类
 */

import { GameConfig } from '../config/GameConfig';

export class CoordinateUtils {
  /**
   * 将 Canvas 中心原点坐标转换为 Canvas 左上角原点坐标
   */
  static canvasCenterToTopLeft(x, y) {
    return {
      x: x + GameConfig.DESIGN_WIDTH / 2,
      y: y + GameConfig.DESIGN_HEIGHT / 2
    };
  }
  
  /**
   * 将 Canvas 左上角原点坐标转换为 Canvas 中心原点坐标
   */
  static canvasTopLeftToCenter(x, y) {
    return {
      x: x - GameConfig.DESIGN_WIDTH / 2,
      y: y - GameConfig.DESIGN_HEIGHT / 2
    };
  }
  
  /**
   * 将 Canvas 中心原点坐标转换为 World 节点本地坐标（Canvas 坐标系）
   * @param {number} x - Canvas 中心原点 X 坐标
   * @param {number} y - Canvas 中心原点 Y 坐标（Canvas 坐标系，从上往下）
   * @param {number} worldOffsetX - 世界偏移 X
   * @returns {{x: number, y: number}} World 节点本地坐标（Canvas 坐标系，Y 从上往下）
   */
  static canvasCenterToWorldLocal(x, y, worldOffsetX = 0) {
    // 获取实际 Canvas 尺寸（现在从 GameConfig 获取，已经是屏幕尺寸）
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    
    // 将 Canvas 中心原点坐标转换为 Canvas 左上角原点坐标
    const topLeftX = x + windowWidth / 2;
    const topLeftY = y + windowHeight / 2;
    
    // World 节点本地坐标（Canvas 坐标系）
    // X: 从 0 开始（世界左边界）
    // Y: 从 0 开始（世界上边界，Canvas 坐标系）
    const worldNodeStartX = 0;
    const worldNodeStartY = 0;
    
    // 转换为 World 节点本地坐标（考虑偏移）
    return {
      x: topLeftX - worldNodeStartX - worldOffsetX,
      y: topLeftY - worldNodeStartY
    };
  }
  
  /**
   * 将 World 节点本地坐标转换为 Canvas 中心原点坐标
   */
  static worldLocalToCanvasCenter(worldX, worldY, worldOffsetX = 0) {
    const worldNodeStartX = -GameConfig.DESIGN_WIDTH / 2;
    const worldNodeStartY = -GameConfig.DESIGN_HEIGHT / 2;
    
    // 转换为 Canvas 左上角原点坐标
    const topLeftX = worldX + worldNodeStartX + worldOffsetX;
    const topLeftY = worldY + worldNodeStartY;
    
    // 转换为 Canvas 中心原点坐标
    return this.canvasTopLeftToCenter(topLeftX, topLeftY);
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

