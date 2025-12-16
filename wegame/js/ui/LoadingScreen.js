/**
 * 加载界面
 */

import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';
import { ColorUtils, GameColors } from '../config/Colors';
import { polyfillRoundRect } from '../utils/CanvasUtils';

export class LoadingScreen {
  constructor(ctx) {
    this.ctx = ctx;
    this.visible = false;
    this.progress = 0; // 0-1
    this.loadingText = '加载中...';
    this.animationTime = 0; // 用于动画
  }
  
  /**
   * 显示加载界面
   */
  show() {
    this.visible = true;
    this.progress = 0;
    this.loadingText = '加载中...';
    this.animationTime = 0;
  }
  
  /**
   * 隐藏加载界面
   */
  hide() {
    this.visible = false;
  }
  
  /**
   * 设置加载进度
   * @param {number} progress - 0-1
   * @param {string} text - 加载文本
   */
  setProgress(progress, text) {
    this.progress = Math.max(0, Math.min(1, progress));
    if (text) {
      this.loadingText = text;
    }
  }
  
  /**
   * 更新动画
   * @param {number} deltaTime - 时间差（毫秒）
   */
  update(deltaTime) {
    if (this.visible) {
      this.animationTime += deltaTime;
    }
  }
  
  /**
   * 渲染加载界面
   */
  render() {
    if (!this.visible) return;
    
    const ctx = this.ctx;
    const width = GameConfig.DESIGN_WIDTH;
    const height = GameConfig.DESIGN_HEIGHT;
    
    // 绘制背景（半透明黑色）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, width, height);
    
    // 绘制标题
    const titleFontSize = UIConfig.TITLE_FONT_SIZE;
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.TEXT_MAIN);
    ctx.font = `bold ${titleFontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('塔防游戏', width / 2, height * 0.3);
    
    // 绘制加载文本
    const textFontSize = UIConfig.SUBTITLE_FONT_SIZE;
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.TEXT_LIGHT);
    ctx.font = `${textFontSize}px Arial`;
    ctx.fillText(this.loadingText, width / 2, height * 0.5);
    
    // 绘制进度条背景
    const progressBarWidth = width * 0.6;
    const progressBarHeight = height * 0.04;
    const progressBarX = (width - progressBarWidth) / 2;
    const progressBarY = height * 0.6;
    const progressBarRadius = progressBarHeight / 2;
    
    // 进度条背景
    polyfillRoundRect(ctx);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, progressBarRadius);
    ctx.fill();
    
    // 进度条前景
    const progressWidth = progressBarWidth * this.progress;
    if (progressWidth > 0) {
      // 添加渐变效果
      const gradient = ctx.createLinearGradient(
        progressBarX,
        progressBarY,
        progressBarX + progressWidth,
        progressBarY + progressBarHeight
      );
      gradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.ALLY_DETAIL));
      gradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.LASER_TOWER));
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(progressBarX, progressBarY, progressWidth, progressBarHeight, progressBarRadius);
      ctx.fill();
      
      // 添加发光效果（动画）
      const glowAlpha = 0.3 + Math.sin(this.animationTime / 200) * 0.2;
      ctx.fillStyle = `rgba(0, 255, 65, ${glowAlpha})`;
      ctx.beginPath();
      ctx.roundRect(progressBarX, progressBarY, progressWidth, progressBarHeight, progressBarRadius);
      ctx.fill();
    }
    
    // 绘制进度百分比
    const percentText = Math.floor(this.progress * 100) + '%';
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.TEXT_MAIN);
    ctx.font = `${textFontSize}px Arial`;
    ctx.fillText(percentText, width / 2, progressBarY + progressBarHeight + textFontSize + 10);
    
    // 绘制加载动画（旋转的点）
    const dotCount = 3;
    const dotRadius = 8;
    const dotSpacing = 20;
    const dotY = height * 0.75;
    const dotStartX = width / 2 - (dotCount - 1) * dotSpacing / 2;
    
    for (let i = 0; i < dotCount; i++) {
      const dotX = dotStartX + i * dotSpacing;
      const delay = i * 200;
      const alpha = 0.3 + Math.sin((this.animationTime + delay) / 300) * 0.7;
      
      ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
      ctx.beginPath();
      ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

