/**
 * 武器拖拽管理器
 * 负责处理武器拖拽、吸附、验证等逻辑
 */

import { Node, UITransform, Graphics, Color, Vec3, EventTouch, Camera } from 'cc';
import { GameConfig, WeaponType } from '../config/GameConfig';
import { GoldManager } from '../managers/GoldManager';

export class WeaponDragManager {
    private dragGhost: Node | null = null;
    private dragGlow: Node | null = null;
    private dragType: WeaponType | null = null;
    private isDraggingFlag: boolean = false;
    
    private goldManager: GoldManager | null = null;
    private worldNode: Node | null = null;
    private uiNode: Node | null = null;
    private checkOccupied: ((col: number, row: number) => boolean) | null = null;
    private lastDragX: number = 0;
    private lastDragY: number = 0;
    
    constructor(
        goldManager: GoldManager,
        worldNode: Node,
        uiNode: Node,
        checkOccupied: (col: number, row: number) => boolean
    ) {
        this.goldManager = goldManager;
        this.worldNode = worldNode;
        this.uiNode = uiNode;
        this.checkOccupied = checkOccupied;
    }
    
    /**
     * 开始拖拽
     */
    startDrag(worldX: number, worldY: number, weaponType: WeaponType, createIconFn: (node: Node, type: WeaponType) => void) {
        this.stopDrag();
        
        this.dragType = weaponType;
        this.isDraggingFlag = true;
        
        // 创建拖拽幽灵（半透明的武器图标）
        this.dragGhost = new Node('DragGhost');
        this.dragGhost.layer = this.uiNode!.layer;
        
        const ghostSize = GameConfig.DRAG_GHOST_SIZE;
        const ghostTransform = this.dragGhost.addComponent(UITransform);
        ghostTransform.setContentSize(ghostSize, ghostSize);
        ghostTransform.setAnchorPoint(0.5, 0.5);
        
        // 使用传入的绘制函数创建图标
        createIconFn(this.dragGhost, weaponType);
        
        // 设置初始位置和缩放
        this.dragGhost.setPosition(worldX, worldY, 0);
        this.dragGhost.setScale(GameConfig.DRAG_GHOST_SCALE, GameConfig.DRAG_GHOST_SCALE, 1);
        
        // 添加到 UI 节点
        this.uiNode!.addChild(this.dragGhost);
        
        // 创建光晕
        this.createDragGlow(weaponType);
    }
    
    /**
     * 创建拖拽光晕
     */
    private createDragGlow(weaponType: WeaponType) {
        this.dragGlow = new Node('DragGlow');
        this.dragGlow.layer = this.uiNode!.layer;
        
        const glowTransform = this.dragGlow.addComponent(UITransform);
        glowTransform.setContentSize(100, 100);
        glowTransform.setAnchorPoint(0.5, 0.5);
        
        const graphics = this.dragGlow.addComponent(Graphics);
        const color = weaponType === WeaponType.ROCKET ? new Color(157, 0, 255) : new Color(0, 255, 65);
        
        // 绘制光晕圆圈
        graphics.fillColor = new Color(color.r, color.g, color.b, 50);
        graphics.circle(0, 0, 40);
        graphics.fill();
        
        graphics.fillColor = new Color(color.r, color.g, color.b, 30);
        graphics.circle(0, 0, 50);
        graphics.fill();
        
        graphics.lineWidth = 2;
        graphics.strokeColor = new Color(color.r, color.g, color.b, 100);
        graphics.circle(0, 0, 45);
        graphics.stroke();
        
        this.uiNode!.addChild(this.dragGlow);
    }
    
    /**
     * 拖拽移动
     */
    onDragMove(worldX: number, worldY: number) {
        if (!this.isDraggingFlag || !this.dragGhost) return;
        
        // 保存最后的拖拽位置
        this.lastDragX = worldX;
        this.lastDragY = worldY;
        
        // 更新幽灵位置
        this.dragGhost.setPosition(worldX, worldY, 0);
        if (this.dragGlow) {
            this.dragGlow.setPosition(worldX, worldY, 0);
        }
        
        // 尝试吸附到网格
        const snapInfo = this.trySnapToGrid(worldX, worldY);
        
        if (snapInfo.inGrid) {
            // 吸附到格子中心
            this.dragGhost.setPosition(snapInfo.snapX!, snapInfo.snapY!, 0);
            if (this.dragGlow) {
                this.dragGlow.setPosition(snapInfo.snapX!, snapInfo.snapY!, 0);
            }
            
            // 检查是否可放置
            const valid = this.validatePlacement(snapInfo.col!, snapInfo.row!);
            
            // 根据有效性改变颜色
            const tintColor = valid ? new Color(0, 255, 0) : new Color(255, 0, 0);
            this.setGhostTint(tintColor, valid ? 0.95 : 0.7);
        } else {
            // 不在网格内
            this.setGhostTint(new Color(255, 255, 255), 0.6);
        }
    }
    
    /**
     * 设置幽灵染色
     */
    private setGhostTint(color: Color, alpha: number) {
        if (!this.dragGhost) return;
        
        // 调整所有 Graphics 组件的颜色
        const graphics = this.dragGhost.getComponentsInChildren(Graphics);
        graphics.forEach(g => {
            // 简单地调整透明度
            if (g.fillColor) {
                g.fillColor = new Color(
                    Math.min(255, g.fillColor.r + (color.r - 255) * 0.3),
                    Math.min(255, g.fillColor.g + (color.g - 255) * 0.3),
                    Math.min(255, g.fillColor.b + (color.b - 255) * 0.3),
                    g.fillColor.a * alpha
                );
            }
        });
    }
    
    /**
     * 尝试吸附到网格
     */
    private trySnapToGrid(worldX: number, worldY: number): {
        inGrid: boolean;
        col?: number;
        row?: number;
        snapX?: number;
        snapY?: number;
    } {
        if (!this.worldNode) return { inGrid: false };
        
        const worldTransform = this.worldNode.getComponent(UITransform);
        if (!worldTransform) return { inGrid: false };
        
        // 将世界坐标转换为 worldNode 的本地坐标
        const localX = worldX - this.worldNode.worldPosition.x;
        const localY = worldY - this.worldNode.worldPosition.y;
        
        // 检查是否在战斗区域内（第2-5行，索引1-4）
        const battleStartY = GameConfig.BATTLE_START_ROW * GameConfig.CELL_SIZE;
        const battleEndY = (GameConfig.BATTLE_START_ROW + GameConfig.BATTLE_ROWS) * GameConfig.CELL_SIZE;
        const inGrid = localX >= 0 && localX <= GameConfig.DESIGN_WIDTH && 
                      localY >= battleStartY && localY < battleEndY;
        
        if (!inGrid) return { inGrid: false };
        
        // 计算格子坐标
        const col = Math.floor(localX / GameConfig.CELL_SIZE);
        const row = Math.floor(localY / GameConfig.CELL_SIZE);
        
        // 计算格子中心（本地坐标）
        const cellCenterLocalX = col * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
        const cellCenterLocalY = row * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
        
        // 转换回世界坐标
        const snapX = this.worldNode.worldPosition.x + cellCenterLocalX;
        const snapY = this.worldNode.worldPosition.y + cellCenterLocalY;
        
        return {
            inGrid: true,
            col,
            row,
            snapX,
            snapY
        };
    }
    
    /**
     * 验证是否可以放置
     */
    private validatePlacement(col: number, row: number): boolean {
        // 检查是否被占用
        if (this.checkOccupied && this.checkOccupied(col, row)) {
            return false;
        }
        
        // 检查金币
        if (this.goldManager && this.dragType) {
            const cost = this.getWeaponCost(this.dragType);
            if (!this.goldManager.canAfford(cost)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 获取武器成本
     */
    private getWeaponCost(weaponType: WeaponType): number {
        // 这里应该从配置中获取，暂时硬编码
        return weaponType === WeaponType.ROCKET ? 100 : 80;
    }
    
    /**
     * 尝试放置武器
     */
    tryPlaceWeapon(worldX: number, worldY: number): {
        type: WeaponType;
        col: number;
        row: number;
        worldX: number;
        worldY: number;
    } | null {
        const snapInfo = this.trySnapToGrid(worldX, worldY);
        
        if (!snapInfo.inGrid || snapInfo.col === undefined || snapInfo.row === undefined) {
            return null;
        }
        
        if (!this.validatePlacement(snapInfo.col, snapInfo.row)) {
            return null;
        }
        
        // 扣除金币
        if (this.goldManager && this.dragType) {
            const cost = this.getWeaponCost(this.dragType);
            if (!this.goldManager.spend(cost)) {
                return null;
            }
        }
        
        // 计算放置位置（worldNode 的本地坐标）
        const localX = snapInfo.col * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
        const localY = snapInfo.row * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
        
        return {
            type: this.dragType!,
            col: snapInfo.col,
            row: snapInfo.row,
            worldX: localX,
            worldY: localY
        };
    }
    
    /**
     * 停止拖拽
     */
    stopDrag() {
        if (this.dragGhost) {
            this.dragGhost.destroy();
            this.dragGhost = null;
        }
        if (this.dragGlow) {
            this.dragGlow.destroy();
            this.dragGlow = null;
        }
        this.isDraggingFlag = false;
        this.dragType = null;
    }
    
    /**
     * 是否正在拖拽
     */
    isDragging(): boolean {
        return this.isDraggingFlag;
    }
    
    /**
     * 获取最后的拖拽位置
     */
    getLastDragPosition(): { x: number; y: number } {
        return { x: this.lastDragX, y: this.lastDragY };
    }
}
