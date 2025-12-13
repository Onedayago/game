/**
 * 金币管理器
 */

import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';
import { ColorUtils, GameColors } from '../config/Colors';
import { GameContext } from '../core/GameContext';

export class GoldManager {
  constructor() {
    this.gold = 0;
  }
  
  /**
   * 初始化
   */
  init(initialGold = GameConfig.INITIAL_GOLD) {
    this.gold = initialGold;
  }
  
  /**
   * 获取当前金币
   */
  getGold() {
    return this.gold;
  }
  
  /**
   * 增加金币
   */
  addGold(amount) {
    this.gold += amount;
    // 同步到游戏上下文
    const gameContext = GameContext.getInstance();
    if (gameContext) {
      gameContext.gold = this.gold;
    }
  }
  
  /**
   * 消费金币
   */
  spend(amount) {
    if (this.gold >= amount) {
      this.gold -= amount;
      // 同步到游戏上下文
      const gameContext = GameContext.getInstance();
      if (gameContext) {
        gameContext.gold = this.gold;
      }
      return true;
    }
    return false;
  }
  
  /**
   * 检查是否有足够的金币
   */
  canAfford(amount) {
    return this.gold >= amount;
  }
  
  /**
   * 更新
   */
  update() {
    // 金币管理器不需要每帧更新
  }
  
  /**
   * 渲染金币显示
   */
  render(ctx) {
    ctx.save();
    
    // 获取实际 Canvas 尺寸（现在从 GameConfig 获取，已经是屏幕尺寸）
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    
    const x = 20;
    const y = windowHeight - 30;
    
    // 绘制背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x - 10, y - 20, 150, 30);
    
    // 绘制文字
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.TEXT_MAIN);
    ctx.font = `${UIConfig.BUTTON_FONT_SIZE}px Arial`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`金币: ${this.gold}`, x, y);
    
    ctx.restore();
  }
}

