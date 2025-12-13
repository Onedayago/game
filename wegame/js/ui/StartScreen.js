/**
 * 开始界面
 */

import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';
import { ColorUtils, GameColors } from '../config/Colors';
import { polyfillRoundRect } from '../utils/CanvasUtils';

export class StartScreen {
  constructor(ctx) {
    this.ctx = ctx;
    this.visible = true;
    this.onStartCallback = null;
    this.onHelpCallback = null;
    this.pulseTime = 0; // 用于脉冲动画
  }
  
  /**
   * 显示开始界面
   */
  show(onStartCallback, onHelpCallback) {
    this.visible = true;
    this.onStartCallback = onStartCallback;
    this.onHelpCallback = onHelpCallback;
    this.pulseTime = 0;
  }
  
  /**
   * 更新动画
   */
  update(deltaTime) {
    if (this.visible) {
      this.pulseTime += deltaTime;
    }
  }
  
  /**
   * 隐藏开始界面
   */
  hide() {
    this.visible = false;
  }
  
  /**
   * 渲染开始界面
   */
  render() {
    if (!this.visible) return;
    
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    
    this.ctx.save();
    
    // 绘制渐变遮罩
    const bgGradient = this.ctx.createLinearGradient(0, 0, 0, windowHeight);
    bgGradient.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    bgGradient.addColorStop(1, 'rgba(26, 26, 46, 0.9)');
    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, windowWidth, windowHeight);
    
    // 绘制标题（带发光效果）
    const titleY = windowHeight * 0.25;
    this.ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.ROCKET_TOWER, 0.6);
    this.ctx.shadowBlur = 30;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    // 标题渐变
    const titleGradient = this.ctx.createLinearGradient(
      windowWidth / 2 - 100, titleY - 30,
      windowWidth / 2 + 100, titleY + 30
    );
    titleGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.ROCKET_TOWER, 1));
    titleGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.TEXT_MAIN, 1));
    titleGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 1));
    
    this.ctx.fillStyle = titleGradient;
    this.ctx.font = `bold ${UIConfig.TITLE_FONT_SIZE * 1.2}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('塔防游戏', windowWidth / 2, titleY);
    
    // 重置阴影
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    
    // 绘制副标题（带脉冲效果）
    const pulse = Math.sin(this.pulseTime * 0.003) * 0.1 + 1;
    this.ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.TEXT_LIGHT, 0.9 * pulse);
    this.ctx.font = `${UIConfig.SUBTITLE_FONT_SIZE}px Arial`;
    this.ctx.fillText('点击开始游戏', windowWidth / 2, windowHeight * 0.35);
    
    // 绘制开始按钮（带脉冲效果）
    const startBtnY = windowHeight * 0.55;
    const startBtnScale = 1 + Math.sin(this.pulseTime * 0.004) * 0.02;
    this.ctx.save();
    this.ctx.translate(windowWidth / 2, startBtnY);
    this.ctx.scale(startBtnScale, startBtnScale);
    this.drawButton(
      0, 0,
      UIConfig.START_BTN_WIDTH,
      UIConfig.START_BTN_HEIGHT,
      UIConfig.START_BTN_RADIUS,
      '开始游戏',
      GameColors.ROCKET_TOWER
    );
    this.ctx.restore();
    
    // 绘制帮助按钮
    const helpBtnY = windowHeight * 0.7;
    this.drawButton(
      windowWidth / 2,
      helpBtnY,
      UIConfig.HELP_BTN_WIDTH,
      UIConfig.HELP_BTN_HEIGHT,
      UIConfig.HELP_BTN_RADIUS,
      '游戏帮助',
      GameColors.LASER_TOWER
    );
    
    this.ctx.restore();
  }
  
  /**
   * 绘制按钮（美化版）
   */
  drawButton(x, y, width, height, radius, text, color) {
    polyfillRoundRect(this.ctx);
    this.ctx.save();
    
    // 绘制按钮阴影
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    this.ctx.shadowBlur = 15;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 5;
    
    // 绘制按钮背景（渐变）
    const btnGradient = this.ctx.createLinearGradient(
      x - width / 2, y - height / 2,
      x - width / 2, y + height / 2
    );
    btnGradient.addColorStop(0, ColorUtils.hexToCanvas(color, 0.95));
    btnGradient.addColorStop(0.5, ColorUtils.hexToCanvas(color, 0.85));
    btnGradient.addColorStop(1, ColorUtils.hexToCanvas(color, 0.75));
    this.ctx.fillStyle = btnGradient;
    this.roundRect(x - width / 2, y - height / 2, width, height, radius);
    this.ctx.fill();
    
    // 重置阴影
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    // 绘制按钮高光
    const highlightGradient = this.ctx.createLinearGradient(
      x - width / 2, y - height / 2,
      x - width / 2, y - height / 2 + height * 0.4
    );
    highlightGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.4));
    highlightGradient.addColorStop(1, ColorUtils.hexToCanvas(0xffffff, 0));
    this.ctx.fillStyle = highlightGradient;
    this.roundRect(x - width / 2, y - height / 2, width, height * 0.4, radius);
    this.ctx.fill();
    
    // 绘制按钮边框（发光效果）
    this.ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.9);
    this.ctx.lineWidth = UIConfig.BORDER_WIDTH * 1.5;
    this.roundRect(x - width / 2, y - height / 2, width, height, radius);
    this.ctx.stroke();
    
    // 绘制按钮文字（带阴影）
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 5;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 2;
    this.ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.TEXT_MAIN);
    this.ctx.font = `bold ${UIConfig.BUTTON_FONT_SIZE}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, x, y);
    
    // 重置阴影
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    this.ctx.restore();
  }
  
  /**
   * 绘制圆角矩形
   */
  roundRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }
  
  /**
   * 触摸开始
   */
  onTouchStart(e) {
    if (!this.visible) return;
    
    // 微信小游戏的触摸事件格式
    const touch = e.touches && e.touches[0] ? e.touches[0] : e;
    if (!touch) return;
    
    // 获取触摸坐标（微信小游戏触摸坐标是相对于 Canvas 左上角的）
    const x = touch.x || touch.clientX || 0;
    const y = touch.y || touch.clientY || 0;
    
    // 获取实际 Canvas 尺寸（现在从 GameConfig 获取，已经是屏幕尺寸）
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    
    // 检查是否点击了开始按钮
    const startBtnX = windowWidth / 2;
    const startBtnY = windowHeight * 0.55;
    const startBtnWidth = UIConfig.START_BTN_WIDTH;
    const startBtnHeight = UIConfig.START_BTN_HEIGHT;
    
    if (
      x >= startBtnX - startBtnWidth / 2 &&
      x <= startBtnX + startBtnWidth / 2 &&
      y >= startBtnY - startBtnHeight / 2 &&
      y <= startBtnY + startBtnHeight / 2
    ) {
      if (this.onStartCallback) {
        this.onStartCallback();
      }
      this.hide();
      return;
    }
    
    // 检查是否点击了帮助按钮
    const helpBtnX = windowWidth / 2;
    const helpBtnY = windowHeight * 0.7;
    const helpBtnWidth = UIConfig.HELP_BTN_WIDTH;
    const helpBtnHeight = UIConfig.HELP_BTN_HEIGHT;
    
    if (
      x >= helpBtnX - helpBtnWidth / 2 &&
      x <= helpBtnX + helpBtnWidth / 2 &&
      y >= helpBtnY - helpBtnHeight / 2 &&
      y <= helpBtnY + helpBtnHeight / 2
    ) {
      if (this.onHelpCallback) {
        this.onHelpCallback();
      }
    }
  }
  
  /**
   * 触摸结束
   */
  onTouchEnd(e) {
    // 开始界面不需要处理触摸结束
  }
}

