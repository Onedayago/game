/**
 * 金币管理器
 */

import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';
import { ColorUtils, GameColors } from '../config/Colors';
import { GameContext } from '../core/GameContext';
import { polyfillRoundRect } from '../utils/CanvasUtils';

export class GoldManager {
  // 离屏Canvas缓存（静态部分：背景、图标）
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _initialized = false;
  
  constructor() {
    this.gold = 0;
  }
  
  /**
   * 初始化静态部分缓存
   */
  static initCache() {
    if (this._initialized) {
      return;
    }
    
    const panelWidth = UIConfig.GOLD_PANEL_WIDTH;
    const panelHeight = UIConfig.GOLD_PANEL_HEIGHT;
    
    const canvas = wx.createCanvas();
    canvas.width = panelWidth;
    canvas.height = panelHeight;
    
    const ctx = canvas.getContext('2d');
    this._cachedCanvas = canvas;
    this._cachedCtx = ctx;
    
    ctx.clearRect(0, 0, panelWidth, panelHeight);
    
    this.drawStaticToCache(ctx, panelWidth, panelHeight);
    
    this._initialized = true;
  }
  
  /**
   * 绘制静态部分到缓存Canvas（背景、图标）
   */
  static drawStaticToCache(ctx, panelWidth, panelHeight) {
    polyfillRoundRect(ctx);
    
    const radius = 8;
    
    // 绘制面板阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;
    
    // 绘制面板背景（金色渐变）
    const bgGradient = ctx.createLinearGradient(0, 0, 0, panelHeight);
    bgGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffd700, 0.25));
    bgGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0xffb300, 0.2));
    bgGradient.addColorStop(1, ColorUtils.hexToCanvas(0xff8c00, 0.25));
    
    // 主背景（深色半透明）
    const mainBgGradient = ctx.createLinearGradient(0, 0, 0, panelHeight);
    mainBgGradient.addColorStop(0, 'rgba(30, 35, 45, 0.95)');
    mainBgGradient.addColorStop(0.3, 'rgba(20, 25, 35, 0.93)');
    mainBgGradient.addColorStop(0.7, 'rgba(15, 20, 30, 0.92)');
    mainBgGradient.addColorStop(1, 'rgba(10, 15, 25, 0.9)');
    ctx.fillStyle = mainBgGradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, panelWidth, panelHeight, radius);
    ctx.fill();
    
    // 金色叠加层
    ctx.fillStyle = bgGradient;
    ctx.fill();
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // 绘制发光边框（金色）
    ctx.shadowBlur = 8;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xffd700, 0.6);
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xffd700, 0.9);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(0, 0, panelWidth, panelHeight, radius);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 绘制内部高光边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xffd700, 0.4);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(1, 1, panelWidth - 2, panelHeight - 2, radius - 1);
    ctx.stroke();
    
    // 绘制金币图标（简单圆形）
    const coinRadius = 12;
    const coinX = 20;
    const coinY = panelHeight / 2;
    const coinGradient = ctx.createRadialGradient(coinX, coinY, 0, coinX, coinY, coinRadius);
    coinGradient.addColorStop(0, 'rgba(255, 215, 0, 1)');
    coinGradient.addColorStop(0.7, 'rgba(255, 193, 7, 0.9)');
    coinGradient.addColorStop(1, 'rgba(255, 152, 0, 0.8)');
    ctx.fillStyle = coinGradient;
    ctx.beginPath();
    ctx.arc(coinX, coinY, coinRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制金币边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xffd700, 0.8);
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  
  /**
   * 从缓存渲染静态部分
   */
  static renderStaticFromCache(ctx, x, y) {
    if (!this._cachedCanvas || !this._initialized) {
      return false;
    }
    
    ctx.drawImage(
      this._cachedCanvas,
      x,
      y,
      this._cachedCanvas.width,
      this._cachedCanvas.height
    );
    
    return true;
  }
  
  /**
   * 初始化
   */
  init(initialGold) {
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
   * 渲染金币显示（使用离屏Canvas缓存静态部分）
   */
  render(ctx) {
    // 初始化缓存（如果未初始化）
    if (!GoldManager._initialized) {
      GoldManager.initCache();
    }
    
    // 获取实际 Canvas 尺寸
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    
    // 金币面板尺寸和位置（顶部中间偏左）
    const panelWidth = UIConfig.GOLD_PANEL_WIDTH;
    const panelHeight = UIConfig.GOLD_PANEL_HEIGHT;
    const panelX = windowWidth / 2 - panelWidth - UIConfig.PANEL_SPACING; // 中间偏左
    const panelY = UIConfig.MARGIN_MEDIUM; // 顶部
    
    // 使用缓存渲染静态部分（背景、图标）
    GoldManager.renderStaticFromCache(ctx, panelX, panelY);
    
    // 动态渲染金币文字（带阴影）
    const coinRadius = 12;
    const coinX = panelX + 20;
    const coinY = panelY + panelHeight / 2;
    
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffd700, 1.0);
    ctx.font = `bold ${UIConfig.BUTTON_FONT_SIZE}px Arial`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this.gold}`, coinX + coinRadius + 10, coinY);
    ctx.restore();
  }
}

