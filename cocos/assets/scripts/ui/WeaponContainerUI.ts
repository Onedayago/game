/**
 * 武器容器UI
 * 负责显示和管理武器选择界面
 */

import { _decorator, Component, Node, Label, Button, UITransform, Graphics, Color, EventTouch, Vec3, input, Input } from 'cc';
import { GameConfig, WeaponType, WeaponConfigs } from '../config/GameConfig';
import { GoldManager } from '../managers/GoldManager';
import { WeaponManager } from '../managers/WeaponManager';
import { WeaponDragManager } from './WeaponDragManager';
import { GameContext } from '../core/GameContext';
import { WeaponGridData } from '../components/WeaponGridData';
import { RocketTower } from '../entities/weapons/RocketTower';
import { LaserTower } from '../entities/weapons/LaserTower';

const { ccclass, property } = _decorator;

@ccclass('WeaponContainerUI')
export class WeaponContainerUI extends Component {
    private goldManager: GoldManager | null = null;
    private weaponManager: WeaponManager | null = null;
    private selectedWeaponType: WeaponType | null = null;
    private weaponCards: Map<WeaponType, Node> = new Map();
    private dragManager: WeaponDragManager | null = null;
    
    start() {
        // 在 start 中创建卡片，确保所有初始化完成
        this.createWeaponCards();
    }
    
    /**
     * 初始化
     */
    init(goldManager: GoldManager, weaponManager: WeaponManager) {
        this.goldManager = goldManager;
        this.weaponManager = weaponManager;
        
        // 创建拖拽管理器
        const gameContext = GameContext.getInstance();
        if (gameContext.worldNode && gameContext.uiNode) {
            this.dragManager = new WeaponDragManager(
                goldManager,
                gameContext.worldNode,
                gameContext.uiNode,
                (col, row) => this.isCellOccupied(col, row)
            );
        }
    }
    
    onDestroy() {
        // 清理事件监听（如果需要的话）
    }
    
    /**
     * 检查格子是否被占用
     */
    private isCellOccupied(col: number, row: number): boolean {
        // TODO: 从 weaponManager 检查
        return false;
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
        const size = GameConfig.CELL_SIZE * GameConfig.WEAPON_MAP_SIZE_RATIO;
        const weaponTransform = weaponNode.addComponent(UITransform);
        weaponTransform.setContentSize(size, size);
        weaponTransform.setAnchorPoint(0.5, 0.5);
        
        // 设置位置（worldNode 的本地坐标）
        weaponNode.setPosition(placementInfo.worldX, placementInfo.worldY, 0);
        
        // 添加网格数据组件
        const gridData = weaponNode.addComponent(WeaponGridData);
        gridData.setGridPosition(placementInfo.col, placementInfo.row);
        
        // 添加到 worldNode（必须先添加到场景，组件才能正确初始化）
        gameContext.worldNode.addChild(weaponNode);
        
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
        const CARD_WIDTH = 150;
        const CARD_HEIGHT = 160;
        const CARD_SPACING = 30;
        
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
     * 创建单个武器卡片
     */
    private createWeaponCard(
        weaponType: WeaponType,
        x: number,
        y: number,
        width: number,
        height: number
    ): Node | null {
        const config = WeaponConfigs.getConfig(weaponType);
        if (!config) return null;
        
        // 创建卡片节点
        const card = new Node(`WeaponCard_${weaponType}`);
        card.active = true;
        
        // ⚠️ 关键：设置为父节点相同的 Layer，否则 UI 相机看不到！
        card.layer = this.node.layer;
        
        // 添加 UITransform 组件
        const cardTransform = card.addComponent(UITransform);
        cardTransform.setContentSize(width, height);
        cardTransform.setAnchorPoint(0.5, 0.5);
        
        // 设置位置
        card.setPosition(x, y, 0);
        
        // 绘制背景
        this.drawCardBackground(card, width, height, config.colorHex);
        
        // 添加卡片内容
        this.addCardIcon(card, weaponType);
        this.addCardName(card, config.name);
        this.addCardCost(card, config.baseCost);
        
        // 添加按钮交互
        const button = card.addComponent(Button);
        button.node.on(Button.EventType.CLICK, () => {
            this.onWeaponCardClick(weaponType);
        }, this);
        
        return card;
    }
    
    /**
     * 添加卡片图标（绘制武器图形）
     */
    private addCardIcon(card: Node, weaponType: WeaponType) {
        const iconNode = new Node('Icon');
        iconNode.layer = this.node.layer;
        
        const iconSize = 60;
        const iconTransform = iconNode.addComponent(UITransform);
        iconTransform.setContentSize(iconSize, iconSize);
        iconTransform.setAnchorPoint(0.5, 0.5);
        iconNode.setPosition(0, 30, 0); // 上方位置
        
        // 绘制武器图标
        this.drawWeaponIcon(iconNode, weaponType);
        
        // 不使用 Button 组件，直接使用触摸事件
        // const button = iconNode.addComponent(Button);
        
        // 监听完整的触摸事件流
        iconNode.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            this.onIconTouchStart(event, weaponType);
        }, this);
        
        iconNode.on(Node.EventType.TOUCH_MOVE, (event: EventTouch) => {
            this.onIconTouchMove(event);
        }, this);
        
        iconNode.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            this.onIconTouchEnd(event);
        }, this);
        
        iconNode.on(Node.EventType.TOUCH_CANCEL, (event: EventTouch) => {
            this.onIconTouchCancel(event);
        }, this);
        
        card.addChild(iconNode);
    }
    
    /**
     * 绘制武器图标（可被 WeaponDragManager 调用）
     */
    private drawWeaponIcon(node: Node, weaponType: WeaponType) {
        const graphics = node.addComponent(Graphics);
        const iconSize = GameConfig.DRAG_GHOST_SIZE;
        
        // 根据武器类型绘制不同图标
        if (weaponType === WeaponType.ROCKET) {
            this.drawRocketIcon(graphics, iconSize);
        } else if (weaponType === WeaponType.LASER) {
            this.drawLaserIcon(graphics, iconSize);
        }
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
     * 绘制火箭塔图标
     */
    private drawRocketIcon(graphics: Graphics, size: number) {
        const scale = size / 64; // 原始设计基于 64 大小
        
        // 底座
        graphics.fillColor = new Color(31, 41, 55, 255);
        graphics.roundRect(-size * 0.35, size * 0.1, size * 0.7, size * 0.24, size * 0.12);
        graphics.fill();
        
        // 塔身
        graphics.fillColor = new Color(51, 65, 85, 255);
        graphics.roundRect(-size * 0.16, -size * 0.39, size * 0.32, size * 0.78, size * 0.12);
        graphics.fill();
        
        graphics.lineWidth = 2;
        graphics.strokeColor = new Color(14, 165, 233, 255);
        graphics.roundRect(-size * 0.16, -size * 0.39, size * 0.32, size * 0.78, size * 0.12);
        graphics.stroke();
        
        // 窗口
        graphics.fillColor = new Color(16, 185, 129, 200);
        for (let i = 0; i < 3; i++) {
            const wy = -size * 0.3 + i * size * 0.16 * 1.2;
            graphics.roundRect(-size * 0.045, wy, size * 0.09, size * 0.128, size * 0.04);
            graphics.fill();
        }
        
        // 火箭头
        graphics.fillColor = new Color(157, 0, 255, 255);
        graphics.circle(size * 0.16, -size * 0.02, size * 0.18);
        graphics.fill();
    }
    
    /**
     * 绘制激光塔图标
     */
    private drawLaserIcon(graphics: Graphics, size: number) {
        // 基座（六边形）
        const points: number[] = [];
        const baseSize = size * 0.4;
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            points.push(Math.cos(angle) * baseSize, Math.sin(angle) * baseSize);
        }
        
        graphics.fillColor = new Color(10, 26, 15, 230);
        graphics.moveTo(points[0], points[1]);
        for (let i = 2; i < points.length; i += 2) {
            graphics.lineTo(points[i], points[i + 1]);
        }
        graphics.close();
        graphics.fill();
        
        graphics.lineWidth = 2;
        graphics.strokeColor = new Color(0, 255, 65, 180);
        graphics.moveTo(points[0], points[1]);
        for (let i = 2; i < points.length; i += 2) {
            graphics.lineTo(points[i], points[i + 1]);
        }
        graphics.close();
        graphics.stroke();
        
        // 中央能量核心
        graphics.fillColor = new Color(0, 255, 65, 80);
        graphics.circle(0, 0, size * 0.12 * 1.6);
        graphics.fill();
        
        graphics.fillColor = new Color(0, 255, 65, 130);
        graphics.circle(0, 0, size * 0.12 * 1.2);
        graphics.fill();
        
        graphics.fillColor = new Color(50, 255, 150, 240);
        graphics.circle(0, 0, size * 0.12);
        graphics.fill();
        
        // 霓虹细节点
        graphics.fillColor = new Color(0, 255, 65, 200);
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const dotX = Math.cos(angle) * baseSize * 0.75;
            const dotY = Math.sin(angle) * baseSize * 0.75;
            graphics.circle(dotX, dotY, 3);
            graphics.fill();
        }
    }
    
    /**
     * 添加卡片名称
     */
    private addCardName(card: Node, name: string) {
        const nameNode = new Node('Name');
        const nameTransform = nameNode.addComponent(UITransform);
        nameTransform.setAnchorPoint(0.5, 0.5);
        nameNode.setPosition(0, 0, 0);
        
        const nameLabel = nameNode.addComponent(Label);
        nameLabel.string = name;
        nameLabel.fontSize = 20;
        nameLabel.color = new Color(255, 255, 255, 255);
        nameLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        
        card.addChild(nameNode);
    }
    
    /**
     * 添加卡片成本
     */
    private addCardCost(card: Node, cost: number) {
        const costNode = new Node('Cost');
        const costTransform = costNode.addComponent(UITransform);
        costTransform.setAnchorPoint(0.5, 0.5);
        costNode.setPosition(0, -40, 0);
        
        const costLabel = costNode.addComponent(Label);
        costLabel.string = `💰 ${cost}`;
        costLabel.fontSize = 18;
        costLabel.color = new Color(255, 215, 0, 255);
        costLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        
        card.addChild(costNode);
    }
    
    /**
     * 绘制卡片背景
     */
    private drawCardBackground(card: Node, width: number, height: number, color: number) {
        const graphics = card.addComponent(Graphics);
        graphics.clear();
        
        // 卡片锚点在中心 (0.5, 0.5)
        const x = -width / 2;
        const y = -height / 2;
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;
        
        // 外发光效果
        graphics.fillColor = new Color(r, g, b, 30);
        graphics.roundRect(x - 2, y - 2, width + 4, height + 4, 12);
        graphics.fill();
        
        // 主背景
        graphics.fillColor = new Color(20, 20, 40, 230);
        graphics.roundRect(x, y, width, height, 10);
        graphics.fill();
        
        // 主边框
        graphics.lineWidth = 2;
        graphics.strokeColor = new Color(r, g, b, 180);
        graphics.roundRect(x, y, width, height, 10);
        graphics.stroke();
        
        // 内边框高光
        graphics.lineWidth = 1;
        graphics.strokeColor = new Color(r, g, b, 100);
        graphics.roundRect(x + 4, y + 4, width - 8, height - 8, 8);
        graphics.stroke();
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
            const graphics = card.getComponent(Graphics);
            if (graphics) {
                const config = WeaponConfigs.getConfig(type);
                if (!config) return;
                
                const isSelected = type === this.selectedWeaponType;
                const alpha = isSelected ? 255 : 180;
                
                // 重新绘制边框以显示选中状态
                const uiTransform = card.getComponent(UITransform);
                if (uiTransform) {
                    const width = uiTransform.width;
                    const height = uiTransform.height;
                    
                    // 清除并重绘
                    graphics.clear();
                    
                    // 如果选中，绘制更亮的外发光
                    if (isSelected) {
                        graphics.fillColor = new Color(
                            (config.colorHex >> 16) & 0xFF,
                            (config.colorHex >> 8) & 0xFF,
                            config.colorHex & 0xFF,
                            80
                        );
                        graphics.roundRect(-4, -4, width + 8, height + 8, 14);
                        graphics.fill();
                    }
                    
                    // 重绘背景
                    this.drawCardBackground(card, width, height, config.colorHex);
                }
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
