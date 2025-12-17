/**
 * 金币管理器
 * 负责金币的增减和显示
 */

import { _decorator, Component, Node, Label } from 'cc';
import { GameContext } from '../core/GameContext';
import { GameConfig } from '../config/GameConfig';

const { ccclass, property } = _decorator;

@ccclass('GoldManager')
export class GoldManager extends Component {
    @property(Label)
    goldLabel: Label | null = null;
    
    private gameContext: GameContext;
    
    onLoad() {
        this.gameContext = GameContext.getInstance();
        this.gameContext.gold = GameConfig.INITIAL_GOLD;
    }
    
    start() {
        this.updateGoldDisplay();
    }
    
    update() {
        this.updateGoldDisplay();
    }
    
    /**
     * 更新金币显示
     */
    private updateGoldDisplay() {
        if (this.goldLabel) {
            this.goldLabel.string = `💰 ${this.gameContext.gold}`;
        }
    }
    
    /**
     * 添加金币
     */
    addGold(amount: number) {
        this.gameContext.addGold(amount);
        this.updateGoldDisplay();
    }
    
    /**
     * 花费金币
     */
    spendGold(amount: number): boolean {
        const success = this.gameContext.spendGold(amount);
        if (success) {
            this.updateGoldDisplay();
        }
        return success;
    }
    
    /**
     * 获取当前金币数量
     */
    getGold(): number {
        return this.gameContext.gold;
    }
    
    /**
     * 检查是否能够支付指定金额
     */
    canAfford(amount: number): boolean {
        return this.gameContext.gold >= amount;
    }
    
    /**
     * 花费金币（别名）
     */
    spend(amount: number): boolean {
        return this.spendGold(amount);
    }
    
    /**
     * 添加金币（别名）
     */
    add(amount: number): void {
        this.addGold(amount);
    }
}

