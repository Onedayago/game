/**
 * 武器卡片
 * 显示武器信息和购买按钮
 */

import { _decorator, Component, Node, Button, Label, Sprite, Color } from 'cc';
import { WeaponType, WeaponConfigs } from '../config/GameConfig';

const { ccclass, property } = _decorator;

@ccclass('WeaponCard')
export class WeaponCard extends Component {
    @property(Label)
    nameLabel: Label | null = null;
    
    @property(Label)
    costLabel: Label | null = null;
    
    @property(Label)
    descriptionLabel: Label | null = null;
    
    @property(Label)
    iconLabel: Label | null = null;
    
    @property(Button)
    button: Button | null = null;
    
    private weaponType: WeaponType = WeaponType.ROCKET;
    private onSelectCallback: ((type: WeaponType) => void) | null = null;
    
    /**
     * 初始化武器卡片
     */
    init(weaponType: WeaponType) {
        this.weaponType = weaponType;
        
        const config = WeaponConfigs.getConfig(weaponType);
        if (!config) return;
        
        // 设置名称
        if (this.nameLabel) {
            this.nameLabel.string = config.name;
        }
        
        // 设置价格
        if (this.costLabel) {
            this.costLabel.string = `💰 ${config.baseCost}`;
        }
        
        // 设置描述
        if (this.descriptionLabel) {
            this.descriptionLabel.string = config.description;
        }
        
        // 设置图标
        if (this.iconLabel) {
            this.iconLabel.string = config.icon;
        }
        
        // 设置按钮事件
        if (this.button) {
            this.button.node.on(Button.EventType.CLICK, this.onButtonClick, this);
        }
    }
    
    /**
     * 设置选择回调
     */
    setSelectCallback(callback: (type: WeaponType) => void) {
        this.onSelectCallback = callback;
    }
    
    /**
     * 按钮点击
     */
    private onButtonClick() {
        if (this.onSelectCallback) {
            this.onSelectCallback(this.weaponType);
        }
    }
    
    /**
     * 更新可购买状态
     */
    updateAffordable(gold: number) {
        const config = WeaponConfigs.getConfig(this.weaponType);
        if (!config || !this.button) return;
        
        const affordable = gold >= config.baseCost;
        this.button.interactable = affordable;
        
        // 更新视觉状态
        if (this.costLabel) {
            this.costLabel.color = affordable ? 
                new Color(255, 255, 255) : 
                new Color(200, 200, 200);
        }
    }
}

