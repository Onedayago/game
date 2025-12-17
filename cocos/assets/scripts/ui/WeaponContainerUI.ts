/**
 * 武器容器UI
 * 
 * 负责显示和管理武器选择界面，协调各个子模块：
 * - 武器卡片创建和管理（WeaponCardBuilder）
 * - 操作按钮管理（WeaponActionButtons）
 * - 拖拽交互（WeaponDragManager）
 * - 武器创建和放置
 */

import { _decorator, Component, Node, Label, UITransform, Graphics, Color, EventTouch, input, Input } from 'cc';
import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';
import { WeaponType, WeaponConfigs } from '../config/WeaponConfig';
import { GoldManager } from '../managers/GoldManager';
import { WeaponManager } from '../managers/WeaponManager';
import { WeaponDragManager } from './WeaponDragManager';
import { GameContext } from '../core/GameContext';
import { WeaponGridData } from '../components/WeaponGridData';
import { RocketTower } from '../entities/weapons/RocketTower';
import { LaserTower } from '../entities/weapons/LaserTower';
import { WeaponRenderer } from '../rendering/WeaponRenderer';
import { WeaponCardBuilder } from './WeaponCardBuilder';
import { WeaponActionButtons } from './WeaponActionButtons';

const { ccclass, property } = _decorator;

@ccclass('WeaponContainerUI')
export class WeaponContainerUI extends Component {
    declare node: Node;  // 显式声明 node 属性，用于 TypeScript 识别
    
    // === 管理器引用 ===
    private goldManager: GoldManager | null = null;
    private weaponManager: WeaponManager | null = null;
    private dragManager: WeaponDragManager | null = null;
    private actionButtons: WeaponActionButtons | null = null;
    
    // === 状态 ===
    private selectedWeaponType: WeaponType | null = null;
    private weaponCards: Map<WeaponType, Node> = new Map();
    
    start() {
        // 在 start 中创建UI，确保所有初始化完成
        this.setupContainer();
        this.createWeaponCards();
        this.setupKeyboardEvents();
    }
    
    /**
     * 设置容器位置和背景
     */
    private setupContainer() {
        // 获取或添加 UITransform
        let uiTransform = this.node.getComponent(UITransform);
        if (!uiTransform) {
            uiTransform = this.node.addComponent(UITransform);
        }
        
        // 设置容器属性（锚点必须先设置）
        uiTransform.setAnchorPoint(0.5, 0);
        
        // 设置尺寸（使用配置常量）
        const containerWidth = UIConfig.WEAPON_CONTAINER_WIDTH;
        const containerHeight = UIConfig.WEAPON_CONTAINER_HEIGHT;
        uiTransform.setContentSize(containerWidth, containerHeight);
        
        // 设置位置：底部居中
        const marginBottom = GameConfig.CELL_SIZE * 0.2;
        const posY = -GameConfig.DESIGN_HEIGHT / 2;
        this.node.setPosition(0, posY, 0);
        
        // 绘制背景
        this.drawBackground(containerWidth, containerHeight);
    }
    
    /**
     * 绘制武器容器背景
     */
    private drawBackground(width: number, height: number) {
        let graphics = this.node.getComponent(Graphics);
        if (!graphics) {
            graphics = this.node.addComponent(Graphics);
        }
        
        graphics.clear();
        
        // 锚点在 (0.5, 0) - 底部中心
        const x = -width * 0.5;  // 从左边界开始
        const y = 0;              // 从底部开始
        
        // 深色背景
        graphics.fillColor = new Color(30, 30, 50, 240);
        graphics.roundRect(x, y, width, height, 10);
        graphics.fill();
        
        // 青色边框
        graphics.lineWidth = 2;
        graphics.strokeColor = new Color(0, 255, 255, 200);
        graphics.roundRect(x, y, width, height, 10);
        graphics.stroke();
    }
    
    /**
     * 初始化
     */
    init(goldManager: GoldManager, weaponManager: WeaponManager) {
        this.goldManager = goldManager;
        this.weaponManager = weaponManager;
        
        const gameContext = GameContext.getInstance();
        
        // 创建操作按钮管理器
        if (this.node && this.node.parent) {
            this.actionButtons = new WeaponActionButtons(
                this.node.layer,
                goldManager,
                weaponManager
            );
            this.actionButtons.createButtons(this.node.parent);
        }
        
        // 创建拖拽管理器
        if (gameContext.worldNode && this.node && this.node.parent) {
            this.dragManager = new WeaponDragManager(
                goldManager,
                gameContext.worldNode,
                this.node.parent,
                (col, row) => this.isCellOccupied(col, row)
            );
        }
    }
    
    onDestroy() {
        // 清理键盘事件监听
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }
    
    /**
     * 检查格子是否被占用
     */
    private isCellOccupied(col: number, row: number): boolean {
        if (!this.weaponManager) return false;
        return this.weaponManager.isGridOccupied(col, row);
    }
    
    
    /**
     * 设置键盘事件
     */
    private setupKeyboardEvents() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }
    
    /**
     * 键盘按下事件
     */
    private onKeyDown(event: any) {
        if (!this.weaponManager || !this.weaponManager.getSelectedWeapon()) {
            return;
        }
        
        const keyCode = event.keyCode;
        
        // U键 - 升级
        if (keyCode === 85) {
            this.actionButtons?.updateButtons();
        }
        // S键 - 出售
        else if (keyCode === 83) {
            // 出售逻辑在 WeaponActionButtons 中处理
        }
    }
    
    /**
     * 更新操作按钮（供外部调用）
     */
    updateActionButtons() {
        this.actionButtons?.updateButtons();
    }
    
    /**
     * 在地图上创建武器
     */
    private createWeaponOnMap(placementInfo: {
        type: WeaponType;
        col: number;
        row: number;
        worldX: number;
        worldY: number;
    }) {
        const gameContext = GameContext.getInstance();
        if (!gameContext.worldNode) {
            console.error('worldNode 未找到！');
            return;
        }
        
        // 创建武器节点
        const weaponNode = new Node(`Weapon_${placementInfo.type}_${placementInfo.col}_${placementInfo.row}`);
        weaponNode.layer = gameContext.worldNode.layer;
        weaponNode.active = true;
        
        // 设置 UITransform
        const size = GameConfig.CELL_SIZE * UIConfig.WEAPON_MAP_SIZE_RATIO;
        const weaponTransform = weaponNode.addComponent(UITransform);
        weaponTransform.setContentSize(size, size);
        weaponTransform.setAnchorPoint(0.5, 0.5);
        
        // 添加到 worldNode（必须先添加到场景，组件才能正确初始化）
        gameContext.worldNode.addChild(weaponNode);
        
        // 设置位置（worldNode 的本地坐标）
        // placementInfo.worldX 和 worldY 已经是 worldNode 的本地坐标
        weaponNode.setPosition(placementInfo.worldX, placementInfo.worldY, 0);
        
        // 添加网格数据组件
        const gridData = weaponNode.addComponent(WeaponGridData);
        gridData.setGridPosition(placementInfo.col, placementInfo.row);
        
        // 添加实际的武器组件（会自动创建视觉）
        let weaponComp = null;
        if (placementInfo.type === WeaponType.ROCKET) {
            weaponComp = weaponNode.addComponent(RocketTower);
        } else if (placementInfo.type === WeaponType.LASER) {
            weaponComp = weaponNode.addComponent(LaserTower);
        }
    
        // 设置网格位置
        if (weaponComp) {
            weaponComp.setGridPosition(placementInfo.col, placementInfo.row);
        }
        
        // 将武器添加到游戏上下文（用于寻路系统）
        gameContext.addWeapon(weaponNode);
        
    }
    
    /**
     * 创建武器卡片
     */
    private createWeaponCards() {
        const uiTransform = this.node.getComponent(UITransform);
        if (!uiTransform) return;
        
        const containerWidth = uiTransform.width;
        const containerHeight = uiTransform.height;
        
        // 卡片布局参数（常量）
        // 由于删除了描述，金币移到顶部，适当减小高度使布局更紧凑
        const CARD_WIDTH = GameConfig.CELL_SIZE;
        const CARD_HEIGHT = GameConfig.CELL_SIZE;
        const CARD_SPACING = UIConfig.WEAPON_CARD_SPACING;
        
        // 计算卡片位置（容器锚点在底部中心 0.5, 0）
        const totalWidth = CARD_WIDTH * 2 + CARD_SPACING;
        const startX = -totalWidth / 2 + CARD_WIDTH / 2;
        const cardY = containerHeight / 2;
        
        // 创建两种武器卡片
        const weaponTypes = [WeaponType.ROCKET, WeaponType.LASER];
        weaponTypes.forEach((type, index) => {
            const x = startX + index * (CARD_WIDTH + CARD_SPACING);
            
            const card = this.createWeaponCard(
                type,
                x,
                cardY,
                CARD_WIDTH,
                CARD_HEIGHT
            );
            
            if (card) {
                this.node.addChild(card);
                this.weaponCards.set(type, card);
            }
        });
    }
    
    /**
     * 创建单个武器卡片（使用 WeaponCardBuilder）
     */
    private createWeaponCard(
        weaponType: WeaponType,
        x: number,
        y: number,
        width: number,
        height: number
    ): Node | null {
        return WeaponCardBuilder.createWeaponCard(
            weaponType,
            x,
            y,
            width,
            height,
            this.node.layer,
            (type) => this.onWeaponCardClick(type),
            (event, type) => this.onIconTouchStart(event, type),
            (event) => this.onIconTouchMove(event),
            (event) => this.onIconTouchEnd(event),
            (event) => this.onIconTouchCancel(event)
        );
    }
    
    /**
     * 绘制武器图标（可被 WeaponDragManager 调用）
     * 使用统一的 WeaponRenderer 来绘制
     */
    private drawWeaponIcon(node: Node, weaponType: WeaponType) {
        const iconSize = UIConfig.DRAG_GHOST_SIZE;
        WeaponRenderer.renderWeaponIcon(node, weaponType, {
            size: iconSize,
            isGhost: false
        });
    }
    
    /**
     * 图标触摸开始
     */
    private onIconTouchStart(event: EventTouch, weaponType: WeaponType) {
        if (!this.dragManager) return;
        
        const centerPos = this.convertToCenterCoords(event.touch!);
        
        // 开始拖拽
        this.dragManager.startDrag(
            centerPos.x,
            centerPos.y,
            weaponType,
            (node, type) => this.drawWeaponIcon(node, type)
        );
    }
    
    /**
     * 图标触摸移动
     */
    private onIconTouchMove(event: EventTouch) {
        if (!this.dragManager || !this.dragManager.isDragging()) return;
        
        const centerPos = this.convertToCenterCoords(event.touch!);
        this.dragManager.onDragMove(centerPos.x, centerPos.y);
    }
    
    /**
     * 图标触摸结束
     */
    private onIconTouchEnd(event: EventTouch) {
        if (!this.dragManager || !this.dragManager.isDragging()) {
            return;
        }
        
        const centerPos = this.convertToCenterCoords(event.touch!);
        const placementInfo = this.dragManager.tryPlaceWeapon(centerPos.x, centerPos.y);
        
        if (placementInfo) {
            this.createWeaponOnMap(placementInfo);
        }
        
        this.dragManager.stopDrag();
    }
    
    /**
     * 图标触摸取消
     */
    private onIconTouchCancel(event?: EventTouch) {
        if (!this.dragManager || !this.dragManager.isDragging()) {
            return;
        }
        
        // TOUCH_CANCEL 时，使用最后的拖拽位置（而不是 event 的位置）
        const lastPos = this.dragManager.getLastDragPosition();
        const placementInfo = this.dragManager.tryPlaceWeapon(lastPos.x, lastPos.y);
        
        if (placementInfo) {
            this.createWeaponOnMap(placementInfo);
        }
        
        this.dragManager.stopDrag();
    }
    
    /**
     * 转换 UI 坐标为中心原点坐标
     */
    private convertToCenterCoords(touch: any): { x: number; y: number } {
        const uiLocation = touch.getUILocation();
        return {
            x: uiLocation.x - GameConfig.DESIGN_WIDTH / 2,
            y: uiLocation.y - GameConfig.DESIGN_HEIGHT / 2
        };
    }
    
    
    
    /**
     * 武器卡片点击处理
     */
    private onWeaponCardClick(weaponType: WeaponType) {
        const config = WeaponConfigs.getConfig(weaponType);
        if (!config || !this.goldManager) return;
        
        // 检查金币
        if (this.goldManager.getGold() < config.baseCost) {
            return;
        }
        
        // 设置选中状态
        this.selectedWeaponType = weaponType;
        this.updateCardSelection();
    }
    
    /**
     * 更新卡片选中状态
     */
    private updateCardSelection() {
        this.weaponCards.forEach((card, type) => {
            const config = WeaponConfigs.getConfig(type);
            if (!config) return;
            
            const isSelected = type === this.selectedWeaponType;
            const uiTransform = card.getComponent(UITransform);
            if (uiTransform) {
                WeaponCardBuilder.updateCardSelection(
                    card,
                    type,
                    isSelected,
                    config.colorHex
                );
            }
        });
    }
    
    /**
     * 获取选中的武器类型
     */
    getSelectedWeaponType(): WeaponType | null {
        return this.selectedWeaponType;
    }
    
    /**
     * 清除选中
     */
    clearSelection() {
        this.selectedWeaponType = null;
        this.updateCardSelection();
    }
}
