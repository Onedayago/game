/**
 * 武器操作按钮管理器
 * 负责升级和出售按钮的创建、更新和位置管理
 */

import { Node, Label, Button, UITransform, Graphics, Color } from 'cc';
import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';

/**
 * 武器操作按钮管理器
 */
export class WeaponActionButtons {
    private upgradeButton: Node | null = null;
    private sellButton: Node | null = null;
    private layer: number;
    private goldManager: any;
    private weaponManager: any;

    constructor(layer: number, goldManager: any, weaponManager: any) {
        this.layer = layer;
        this.goldManager = goldManager;
        this.weaponManager = weaponManager;
    }

    /**
     * 创建操作按钮
     */
    createButtons(uiNode: Node): void {
        // 升级按钮
        this.upgradeButton = this.createButton('⬆️ 升级', new Color(16, 185, 129, 255));
        this.upgradeButton.on(Button.EventType.CLICK, () => this.onUpgradeClick(), this);
        uiNode.addChild(this.upgradeButton);
        this.upgradeButton.active = false;

        // 出售按钮
        this.sellButton = this.createButton('💰 出售', new Color(239, 68, 68, 255));
        this.sellButton.on(Button.EventType.CLICK, () => this.onSellClick(), this);
        uiNode.addChild(this.sellButton);
        this.sellButton.active = false;
    }

    /**
     * 创建按钮
     */
    private createButton(text: string, color: Color): Node {
        const button = new Node('ActionButton');
        button.layer = this.layer;

        const transform = button.addComponent(UITransform);
        transform.setContentSize(UIConfig.ACTION_BUTTON_WIDTH, UIConfig.ACTION_BUTTON_HEIGHT);
        transform.setAnchorPoint(0.5, 0.5);

        // 绘制按钮背景
        const graphics = button.addComponent(Graphics);
        const r = color.r;
        const g = color.g;
        const b = color.b;

        const btnWidth = UIConfig.ACTION_BUTTON_WIDTH;
        const btnHeight = UIConfig.ACTION_BUTTON_HEIGHT;
        const btnRadius = UIConfig.ACTION_BUTTON_RADIUS;
        const borderWidth = GameConfig.UI_BORDER_WIDTH;
        const padding = borderWidth * 2;

        // 外发光
        graphics.fillColor = new Color(r, g, b, 50);
        graphics.roundRect(-btnWidth / 2 - padding, -btnHeight / 2 - padding, btnWidth + padding * 2, btnHeight + padding * 2, btnRadius * 1.1);
        graphics.fill();

        // 主背景
        graphics.fillColor = new Color(20, 20, 40, 230);
        graphics.roundRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, btnRadius);
        graphics.fill();

        // 边框
        graphics.lineWidth = GameConfig.UI_BORDER_WIDTH;
        graphics.strokeColor = new Color(r, g, b, 200);
        graphics.roundRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, btnRadius);
        graphics.stroke();

        // 按钮文本
        const labelNode = new Node('Label');
        labelNode.layer = this.layer;
        const label = labelNode.addComponent(Label);
        label.string = text;
        label.fontSize = UIConfig.ACTION_BUTTON_FONT_SIZE;
        label.color = new Color(255, 255, 255, 255);
        label.horizontalAlign = Label.HorizontalAlign.CENTER;

        const labelTransform = labelNode.addComponent(UITransform);
        labelTransform.setAnchorPoint(0.5, 0.5);
        labelNode.setPosition(0, 0, 0);

        button.addChild(labelNode);
        button.addComponent(Button);

        return button;
    }

    /**
     * 更新操作按钮
     */
    updateButtons(): void {
        if (!this.weaponManager) return;

        const weapon = this.weaponManager.getSelectedWeapon();
        if (!weapon) {
            this.hideButtons();
            return;
        }

        const weaponComp = weapon.getComponent('WeaponBase');
        if (!weaponComp) {
            this.hideButtons();
            return;
        }

        // 获取武器信息
        const level = weaponComp.level || 1;
        const maxLevel = weaponComp.maxLevel || 3;
        const upgradeCost = weaponComp.getUpgradeCost();
        const sellGain = weaponComp.getSellGain();

        // 更新升级按钮
        if (this.upgradeButton) {
            const labelNode = this.upgradeButton.getChildByName('Label');
            if (labelNode) {
                const label = labelNode.getComponent(Label);
                if (label) {
                    label.string = level < maxLevel ? `⬆️ 升级 ${upgradeCost}` : '✓ 已满级';
                }
            }

            const canUpgrade = level < maxLevel &&
                              this.goldManager &&
                              this.goldManager.getGold() >= upgradeCost;
            this.upgradeButton.active = canUpgrade;
        }

        // 更新出售按钮
        if (this.sellButton) {
            const labelNode = this.sellButton.getChildByName('Label');
            if (labelNode) {
                const label = labelNode.getComponent(Label);
                if (label) {
                    label.string = `💰 出售 ${sellGain}`;
                }
            }
            this.sellButton.active = true;
        }

        // 更新按钮位置
        this.updateButtonsPosition(weapon);
    }

    /**
     * 更新按钮位置
     */
    private updateButtonsPosition(weapon: Node): void {
        if (!weapon || !this.upgradeButton || !this.sellButton) return;

        const worldPos = weapon.getWorldPosition();

        // 转换为UI坐标（中心原点）
        const uiX = worldPos.x - GameConfig.DESIGN_WIDTH / 2;
        const uiY = worldPos.y - GameConfig.DESIGN_HEIGHT / 2;

        // 按钮位置：武器上方
        const offsetY = GameConfig.CELL_SIZE * 0.9;
        const offsetX = UIConfig.ACTION_BUTTON_OFFSET_X;

        if (this.upgradeButton.active) {
            this.upgradeButton.setPosition(uiX - offsetX, uiY + offsetY, 0);
        }

        this.sellButton.setPosition(uiX + offsetX, uiY + offsetY, 0);
    }

    /**
     * 隐藏操作按钮
     */
    hideButtons(): void {
        if (this.upgradeButton) {
            this.upgradeButton.active = false;
        }
        if (this.sellButton) {
            this.sellButton.active = false;
        }
    }

    /**
     * 升级按钮点击
     */
    private onUpgradeClick(): void {
        if (!this.weaponManager || !this.goldManager) return;

        const weapon = this.weaponManager.getSelectedWeapon();
        if (!weapon) return;

        const success = this.weaponManager.upgradeSelectedWeapon(this.goldManager);
        if (success) {
            this.updateButtons();
        }
    }

    /**
     * 出售按钮点击
     */
    private onSellClick(): void {
        if (!this.weaponManager || !this.goldManager) return;

        const weapon = this.weaponManager.getSelectedWeapon();
        if (!weapon) return;

        const success = this.weaponManager.sellSelectedWeapon(this.goldManager);
        if (success) {
            this.hideButtons();
        }
    }
}

