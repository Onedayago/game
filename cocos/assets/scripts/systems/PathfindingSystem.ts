/**
 * A* 寻路系统
 * 为敌人提供绕过障碍物的路径规划
 */

import { GameConfig } from '../config/GameConfig';

/**
 * 网格节点
 */
class PathNode {
    x: number; // 网格 X 坐标
    y: number; // 网格 Y 坐标
    walkable: boolean = true; // 是否可通行
    
    // A* 算法相关
    g: number = 0; // 从起点到当前节点的代价
    h: number = 0; // 从当前节点到终点的启发式估计
    f: number = 0; // 总代价 f = g + h
    parent: PathNode | null = null; // 父节点
    
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    
    /**
     * 重置节点状态
     */
    reset() {
        this.g = 0;
        this.h = 0;
        this.f = 0;
        this.parent = null;
    }
}

/**
 * 寻路系统
 */
export class PathfindingSystem {
    private grid: PathNode[][];
    private width: number;
    private height: number;
    
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.initGrid();
    }
    
    /**
     * 初始化网格
     */
    private initGrid() {
        this.grid = [];
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = new PathNode(x, y);
            }
        }
    }
    
    /**
     * 设置障碍物
     * @param obstacles 障碍物坐标数组 [{x, y}, ...]
     * @param resetAll 是否重置所有格子为可通行（默认 false，保留现有的不可通行区域）
     */
    setObstacles(obstacles: Array<{x: number, y: number}>, resetAll: boolean = false) {
        // 如果需要重置，先将所有格子设置为可通行
        if (resetAll) {
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    this.grid[y][x].walkable = true;
                }
            }
        }
        
        // 设置障碍物
        for (const obs of obstacles) {
            if (this.isInBounds(obs.x, obs.y)) {
                this.grid[obs.y][obs.x].walkable = false;
            }
        }
    }
    
    /**
     * 设置单个格子的可通行状态
     */
    setWalkable(x: number, y: number, walkable: boolean) {
        if (this.isInBounds(x, y)) {
            this.grid[y][x].walkable = walkable;
        }
    }
    
    /**
     * 检查坐标是否在网格范围内
     */
    private isInBounds(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    
    /**
     * 获取节点
     */
    private getNode(x: number, y: number): PathNode | null {
        if (!this.isInBounds(x, y)) return null;
        return this.grid[y][x];
    }
    
    /**
     * 查找路径（A* 算法）
     * @param startX 起点 X
     * @param startY 起点 Y
     * @param endX 终点 X
     * @param endY 终点 Y
     * @returns 路径节点数组，如果找不到路径返回 null
     */
    findPath(startX: number, startY: number, endX: number, endY: number): Array<{x: number, y: number}> | null {
        // 重置所有节点
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x].reset();
            }
        }
        
        const startNode = this.getNode(startX, startY);
        const endNode = this.getNode(endX, endY);
        
        if (!startNode || !endNode || !endNode.walkable) {
            return null;
        }
        
        const openList: PathNode[] = [];
        const closedList: Set<PathNode> = new Set();
        
        openList.push(startNode);
        let steps = 0;
        const maxSteps = GameConfig.PATHFINDING_MAX_STEPS;
        
        while (openList.length > 0 && steps < maxSteps) {
            steps++;
            
            // 找到 f 值最小的节点
            let currentNode = openList[0];
            let currentIndex = 0;
            
            for (let i = 1; i < openList.length; i++) {
                if (openList[i].f < currentNode.f) {
                    currentNode = openList[i];
                    currentIndex = i;
                }
            }
            
            // 从 openList 中移除当前节点
            openList.splice(currentIndex, 1);
            closedList.add(currentNode);
            
            // 到达终点
            if (currentNode === endNode) {
                return this.reconstructPath(currentNode);
            }
            
            // 检查相邻节点
            const neighbors = this.getNeighbors(currentNode);
            
            for (const neighbor of neighbors) {
                if (closedList.has(neighbor) || !neighbor.walkable) {
                    continue;
                }
                
                // 计算从起点到相邻节点的代价
                const isDiagonal = Math.abs(neighbor.x - currentNode.x) + Math.abs(neighbor.y - currentNode.y) === 2;
                const moveCost = isDiagonal ? 
                    GameConfig.PATHFINDING_DIAGONAL_COST : 
                    GameConfig.PATHFINDING_STRAIGHT_COST;
                
                const tentativeG = currentNode.g + moveCost;
                
                if (!openList.includes(neighbor)) {
                    openList.push(neighbor);
                } else if (tentativeG >= neighbor.g) {
                    continue;
                }
                
                // 更新节点信息
                neighbor.parent = currentNode;
                neighbor.g = tentativeG;
                neighbor.h = this.heuristic(neighbor, endNode);
                neighbor.f = neighbor.g + neighbor.h;
            }
        }
        
        // 找不到路径
        return null;
    }
    
    /**
     * 获取相邻节点（8方向）
     */
    private getNeighbors(node: PathNode): PathNode[] {
        const neighbors: PathNode[] = [];
        const directions = [
            {x: 1, y: 0},   // 右
            {x: -1, y: 0},  // 左
            {x: 0, y: 1},   // 上
            {x: 0, y: -1},  // 下
            {x: 1, y: 1},   // 右上
            {x: 1, y: -1},  // 右下
            {x: -1, y: 1},  // 左上
            {x: -1, y: -1}, // 左下
        ];
        
        for (const dir of directions) {
            const newX = node.x + dir.x;
            const newY = node.y + dir.y;
            const neighbor = this.getNode(newX, newY);
            
            if (neighbor) {
                neighbors.push(neighbor);
            }
        }
        
        return neighbors;
    }
    
    /**
     * 启发式函数（曼哈顿距离）
     */
    private heuristic(node: PathNode, endNode: PathNode): number {
        const dx = Math.abs(node.x - endNode.x);
        const dy = Math.abs(node.y - endNode.y);
        return dx + dy;
    }
    
    /**
     * 重建路径
     */
    private reconstructPath(endNode: PathNode): Array<{x: number, y: number}> {
        const path: Array<{x: number, y: number}> = [];
        let current: PathNode | null = endNode;
        
        while (current) {
            path.unshift({x: current.x, y: current.y});
            current = current.parent;
        }
        
        return path;
    }
    
    /**
     * 简化路径（移除不必要的中间点）
     */
    simplifyPath(path: Array<{x: number, y: number}>): Array<{x: number, y: number}> {
        if (path.length <= 2) return path;
        
        const simplified: Array<{x: number, y: number}> = [path[0]];
        
        for (let i = 1; i < path.length - 1; i++) {
            const prev = path[i - 1];
            const current = path[i];
            const next = path[i + 1];
            
            // 如果三点不共线，保留中间点
            const dx1 = current.x - prev.x;
            const dy1 = current.y - prev.y;
            const dx2 = next.x - current.x;
            const dy2 = next.y - current.y;
            
            // 不同方向 -> 转折点
            if (dx1 !== dx2 || dy1 !== dy2) {
                simplified.push(current);
            }
        }
        
        simplified.push(path[path.length - 1]);
        return simplified;
    }
}
