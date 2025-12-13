/**
 * 武器卡片构建器
 * 负责武器卡片的创建、绘制和交互
 */

import { Node, Label, Button, UITransform, Graphics, Color, EventTouch } from 'cc';
import { GameConfig } from '../config/GameConfig';
import { WeaponType, WeaponConfigs } from '../config/WeaponConfig';
import { UIConfig } from '../config/UIConfig';
import { WeaponRenderer } from '../rendering/WeaponRenderer';

/**
 * 武器卡片构建器
 */
export class WeaponCardBuilder {
    /**
     * 创建武器卡片
     * @param weaponType 武器类型
     * @param x X 坐标
     * @param y Y 坐标
     * @param width 卡片宽度
     * @param height 卡片高度
     * @param layer 图层
     * @param onCardClick 卡片点击回调
     * @param onIconTouchStart 图标触摸开始回调
     * @param onIconTouchMove 图标触摸移动回调
     * @param onIconTouchEnd 图标触摸结束回调
     * @param onIconTouchCancel 图标触摸取消回调
     * @returns 创建的卡片节点
     */
    static createWeaponCard(
        weaponType: WeaponType,
        x: number,
        y: number,
        width: number,
        height: number,
        layer: number,
        onCardClick: (type: WeaponType) => void,
        onIconTouchStart: (event: EventTouch, type: WeaponType) => void,
        onIconTouchMove: (event: EventTouch) => void,
        onIconTouchEnd: (event: EventTouch) => void,
        onIconTouchCancel: (event?: EventTouch) => void
    ): Node | null {
        const config = WeaponConfigs.getConfig(weaponType);
        if (!config) return null;

        // 创建卡片节点
        const card = new Node(`WeaponCard_${weaponType}`);
        card.active = true;
        card.layer = layer;

        // 添加 UITransform 组件
        const cardTransform = card.addComponent(UITransform);
        cardTransform.setContentSize(width, height);
        cardTransform.setAnchorPoint(0.5, 0.5);
        card.setPosition(x, y, 0);

        // 绘制背景
        WeaponCardBuilder.drawCardBackground(card, width, height, config.colorHex);

        // 添加卡片内容（从上到下：成本、图标、名称）
        WeaponCardBuilder.addCardCost(card, config.baseCost, layer);
        WeaponCardBuilder.addCardIcon(card, weaponType, layer, onIconTouchStart, onIconTouchMove, onIconTouchEnd, onIconTouchCancel);
    

        // 添加按钮交互
        const button = card.addComponent(Button);
        button.node.on(Button.EventType.CLICK, () => {
            onCardClick(weaponType);
        });

        return card;
    }

    /**
     * 添加卡片图标
     */
    private static addCardIcon(
        card: Node,
        weaponType: WeaponType,
        layer: number,
        onTouchStart: (event: EventTouch, type: WeaponType) => void,
        onTouchMove: (event: EventTouch) => void,
        onTouchEnd: (event: EventTouch) => void,
        onTouchCancel: (event?: EventTouch) => void
    ): void {
        const iconNode = new Node('Icon');
        iconNode.layer = layer;

        const iconSize = UIConfig.CARD_ICON_SIZE;
        const iconTransform = iconNode.addComponent(UITransform);
        iconTransform.setContentSize(iconSize, iconSize);
        iconTransform.setAnchorPoint(0.5, 0.5);
        
        // 调整图标位置，向下移动一些，避免与顶部的金币重叠
        const cardHeight = card.getComponent(UITransform)?.height || GameConfig.CELL_SIZE;
        iconNode.setPosition(0, -cardHeight * 0.15, 0);  // 稍微向下偏移

        // 使用与战场上相同的渲染方法，按比例缩小
        // renderWeaponIcon 现在内部会调用 renderRocketTower/renderLaserTower 并传入自定义尺寸
        // 这样武器容器中的图标和战场上的武器外观完全一致
        WeaponRenderer.renderWeaponIcon(iconNode, weaponType, {
            size: iconSize,
            isGhost: false
        });

        // 监听触摸事件
        iconNode.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            onTouchStart(event, weaponType);
        });
        iconNode.on(Node.EventType.TOUCH_MOVE, onTouchMove);
        iconNode.on(Node.EventType.TOUCH_END, onTouchEnd);
        iconNode.on(Node.EventType.TOUCH_CANCEL, onTouchCancel);

        card.addChild(iconNode);
    }

    /**
     * 添加卡片成本（显示在顶部）
     */
    private static addCardCost(card: Node, cost: number, layer: number): void {
        const costNode = new Node('Cost');
        costNode.layer = layer;

        const costTransform = costNode.addComponent(UITransform);
        costTransform.setAnchorPoint(0.5, 0.5);
        // 顶部位置，基于卡片高度比例
        const cardHeight = card.getComponent(UITransform)?.height || GameConfig.CELL_SIZE;
        costNode.setPosition(0, cardHeight * 0.32, 0);

        const costLabel = costNode.addComponent(Label);
        costLabel.string = `💰 ${cost}`;
        costLabel.fontSize = UIConfig.CARD_COST_FONT_SIZE;
        costLabel.color = new Color(255, 215, 0, 255);
        costLabel.horizontalAlign = Label.HorizontalAlign.CENTER;

        card.addChild(costNode);
    }

    /**
     * 绘制卡片背景
     */
    static drawCardBackground(card: Node, width: number, height: number, color: number): void {
        const graphics = card.getComponent(Graphics) || card.addComponent(Graphics);
        graphics.clear();

        // 卡片锚点在中心 (0.5, 0.5)
        const x = -width / 2;
        const y = -height / 2;
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;

        const borderWidth = UIConfig.CARD_BORDER_WIDTH;
        const radius = UIConfig.CARD_RADIUS;
        const innerRadius = radius * 0.8;
        const padding = borderWidth * 2;

        // 外发光效果
        graphics.fillColor = new Color(r, g, b, 30);
        graphics.roundRect(x - borderWidth, y - borderWidth, width + borderWidth * 2, height + borderWidth * 2, radius * 1.2);
        graphics.fill();

        // 主背景
        graphics.fillColor = new Color(20, 20, 40, 230);
        graphics.roundRect(x, y, width, height, radius);
        graphics.fill();

        // 主边框
            graphics.lineWidth = UIConfig.CARD_BORDER_WIDTH;
        graphics.strokeColor = new Color(r, g, b, 180);
        graphics.roundRect(x, y, width, height, radius);
        graphics.stroke();

        // 内边框高光
        graphics.lineWidth = borderWidth * 0.5;
        graphics.strokeColor = new Color(r, g, b, 100);
        graphics.roundRect(x + padding, y + padding, width - padding * 2, height - padding * 2, innerRadius);
        graphics.stroke();
    }

    /**
     * 更新卡片选中状态
     */
    static updateCardSelection(
        card: Node,
        weaponType: WeaponType,
        isSelected: boolean,
        colorHex: number
    ): void {
        const graphics = card.getComponent(Graphics);
        if (!graphics) return;

        const uiTransform = card.getComponent(UITransform);
        if (!uiTransform) return;

        const width = uiTransform.width;
        const height = uiTransform.height;

        // 清除并重绘
        graphics.clear();

        // 如果选中，绘制更亮的外发光
        if (isSelected) {
            graphics.fillColor = new Color(
                (colorHex >> 16) & 0xFF,
                (colorHex >> 8) & 0xFF,
                colorHex & 0xFF,
                80
            );
            const selectedRadius = UIConfig.CARD_SELECTED_RADIUS;
            const selectedPadding = UIConfig.CARD_BORDER_WIDTH * 2;
            graphics.roundRect(-selectedPadding, -selectedPadding, width + selectedPadding * 2, height + selectedPadding * 2, selectedRadius);
            graphics.fill();
        }

        // 重绘背景
        WeaponCardBuilder.drawCardBackground(card, width, height, colorHex);
    }
}

