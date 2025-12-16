/**
 * A* 寻路算法
 * 用于敌人寻路，只允许水平和垂直移动（禁止斜向移动）
 */

import { GameConfig } from '../config/GameConfig';

export class AStarPathfinder {
  /**
   * 节点类
   */
  static Node = class {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.g = 0; // 从起点到当前节点的实际成本
      this.h = 0; // 从当前节点到终点的启发式估计成本
      this.f = 0; // f = g + h
      this.parent = null; // 父节点（用于重建路径）
    }
    
    equals(other) {
      return this.x === other.x && this.y === other.y;
    }
  };
  
  /**
   * 使用 A* 算法查找路径
   * @param {number} startX - 起点 X 坐标（格子）
   * @param {number} startY - 起点 Y 坐标（格子）
   * @param {number} endX - 终点 X 坐标（格子，通常是最右边）
   * @param {number} endY - 终点 Y 坐标（格子，可选）
   * @param {ObstacleManager} obstacleManager - 障碍物管理器
   * @param {boolean} canFlyOverObstacles - 是否可以飞过障碍物
   * @returns {Array} 路径数组，每个元素是 {x, y} 对象，如果没有路径返回空数组
   */
  static findPath(startX, startY, endX, endY, obstacleManager, canFlyOverObstacles = false) {
    // 边界检查
    const battleStartRow = GameConfig.BATTLE_START_ROW;
    const battleEndRow = GameConfig.BATTLE_END_ROW - 1;
    
    if (startX < 0 || startX >= GameConfig.BATTLE_COLS ||
        startY < battleStartRow || startY > battleEndRow) {
      return [];
    }
    
    // 如果终点 Y 未指定，使用起点 Y（水平移动）
    if (endY === undefined || endY === null) {
      endY = startY;
    }
    
    // 如果起点已经到达或超过终点，返回包含起点的路径
    if (startX >= endX) {
      return [{ x: startX, y: startY }];
    }
    
    // 开放列表（待探索的节点）
    const openList = [];
    // 关闭列表（已探索的节点）
    const closedSet = new Set();
    
    // 创建起点节点
    const startNode = new this.Node(startX, startY);
    startNode.g = 0;
    startNode.h = this.heuristic(startX, startY, endX, endY);
    startNode.f = startNode.g + startNode.h;
    
    openList.push(startNode);
    
    // 最大迭代次数，防止无限循环
    const maxIterations = GameConfig.BATTLE_COLS * GameConfig.BATTLE_ROWS;
    let iterations = 0;
    
    while (openList.length > 0 && iterations < maxIterations) {
      iterations++;
      
      // 找到开放列表中 f 值最小的节点
      let currentNodeIndex = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < openList[currentNodeIndex].f) {
          currentNodeIndex = i;
        }
      }
      
      const currentNode = openList[currentNodeIndex];
      
      // 从开放列表移除，加入关闭列表
      openList.splice(currentNodeIndex, 1);
      closedSet.add(`${currentNode.x},${currentNode.y}`);
      
      // 检查是否到达终点
      if (currentNode.x >= endX) {
        // 重建路径
        const path = [];
        let node = currentNode;
        while (node) {
          path.unshift({ x: node.x, y: node.y });
          node = node.parent;
        }
        return path;
      }
      
      // 获取相邻节点（只允许水平和垂直移动，禁止斜向）
      const neighbors = this.getNeighbors(currentNode.x, currentNode.y, battleStartRow, battleEndRow);
      
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        
        // 如果已在关闭列表中，跳过
        if (closedSet.has(neighborKey)) {
          continue;
        }
        
        // 检查是否有障碍物（飞行敌人可以飞过）
        if (!canFlyOverObstacles && obstacleManager && obstacleManager.hasObstacle(neighbor.x, neighbor.y)) {
          continue;
        }
        
        // 计算从起点到相邻节点的成本（移动成本为1，因为只能水平和垂直移动）
        const tentativeG = currentNode.g + 1;
        
        // 检查相邻节点是否在开放列表中
        let neighborNode = null;
        for (const node of openList) {
          if (node.x === neighbor.x && node.y === neighbor.y) {
            neighborNode = node;
            break;
          }
        }
        
        if (!neighborNode) {
          // 不在开放列表中，创建新节点
          neighborNode = new this.Node(neighbor.x, neighbor.y);
          neighborNode.g = tentativeG;
          neighborNode.h = this.heuristic(neighbor.x, neighbor.y, endX, endY);
          neighborNode.f = neighborNode.g + neighborNode.h;
          neighborNode.parent = currentNode;
          openList.push(neighborNode);
        } else {
          // 如果找到更短的路径，更新节点
          if (tentativeG < neighborNode.g) {
            neighborNode.parent = currentNode;
            neighborNode.g = tentativeG;
            neighborNode.f = neighborNode.g + neighborNode.h;
          }
        }
      }
    }
    
    // 没有找到路径，返回空数组
    return [];
  }
  
  /**
   * 获取相邻节点（只允许水平和垂直移动）
   * @param {number} x - 当前节点 X
   * @param {number} y - 当前节点 Y
   * @param {number} battleStartRow - 战斗区域起始行
   * @param {number} battleEndRow - 战斗区域结束行
   * @returns {Array} 相邻节点数组
   */
  static getNeighbors(x, y, battleStartRow, battleEndRow) {
    const neighbors = [];
    
    // 只允许水平和垂直移动：右、上、下、左（优先向右）
    const directions = [
      { dx: 1, dy: 0 },   // 右（优先）
      { dx: 0, dy: -1 },  // 上
      { dx: 0, dy: 1 },   // 下
      { dx: -1, dy: 0 }   // 左（后退）
    ];
    
    for (const dir of directions) {
      const newX = x + dir.dx;
      const newY = y + dir.dy;
      
      // 检查边界
      if (newX >= 0 && newX < GameConfig.BATTLE_COLS &&
          newY >= battleStartRow && newY <= battleEndRow) {
        neighbors.push({ x: newX, y: newY });
      }
    }
    
    return neighbors;
  }
  
  /**
   * 启发式函数（曼哈顿距离，因为只能水平和垂直移动）
   * @param {number} x1 - 起点 X
   * @param {number} y1 - 起点 Y
   * @param {number} x2 - 终点 X
   * @param {number} y2 - 终点 Y
   * @returns {number} 估计成本
   */
  static heuristic(x1, y1, x2, y2) {
    // 曼哈顿距离：|x1-x2| + |y1-y2|
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }
}

