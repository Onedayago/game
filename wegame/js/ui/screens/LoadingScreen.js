/**
 * 加载界面
 */

import { GameConfig } from '../../config/GameConfig';
import { UIConfig } from '../../config/UIConfig';
import { ColorUtils, GameColors } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class LoadingScreen {
  // 离屏Canvas缓存（静态背景）
  static _bgCache = null;
  static _bgCtx = null;
  static _bgInitialized = false;
  
  constructor(ctx) {
    this.ctx = ctx;
    this.visible = false;
    this.progress = 0; // 0-1
    this.loadingText = '加载中...';
    this.animationTime = 0; // 用于动画
  }
  
  /**
   * 初始化背景缓存
   */
  static initBgCache(width, height) {
    if (this._bgInitialized) {
      return;
    }
    
    const canvas = wx.createCanvas();
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    this._bgCache = canvas;
    this._bgCtx = ctx;
    
    // 绘制渐变背景
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height) * 0.8
    );
    gradient.addColorStop(0, 'rgba(26, 26, 46, 1)');
    gradient.addColorStop(0.5, 'rgba(15, 15, 30, 1)');
    gradient.addColorStop(1, 'rgba(5, 5, 15, 1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // 绘制星空背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    this._bgInitialized = true;
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
   * 渲染加载界面（优化版：添加动画效果和更好的视觉效果）
   */
  render() {
    if (!this.visible) return;
    
    const ctx = this.ctx;
    const width = GameConfig.DESIGN_WIDTH;
    const height = GameConfig.DESIGN_HEIGHT;
    
    // 初始化并使用缓存背景
    if (!LoadingScreen._bgInitialized) {
      LoadingScreen.initBgCache(width, height);
    }
    ctx.drawImage(LoadingScreen._bgCache, 0, 0, width, height);
    
    // 绘制标题（带渐变和阴影效果）
    const titleFontSize = UIConfig.TITLE_FONT_SIZE * 1.3;
    const titleY = height * 0.3;
    
    ctx.save();
    // 添加阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;
    
    // 创建渐变
    const titleGradient = ctx.createLinearGradient(
      width / 2 - 150, titleY - 30,
      width / 2 + 150, titleY + 30
    );
    titleGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.ROCKET_TOWER, 1.0));
    titleGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0xffaa44, 1.0));
    titleGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.ROCKET_TOWER, 1.0));
    
    ctx.fillStyle = titleGradient;
    ctx.font = `bold ${titleFontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('塔防游戏', width / 2, titleY);
    ctx.restore();
    
    // 绘制加载文本（带脉冲动画）
    const textFontSize = UIConfig.SUBTITLE_FONT_SIZE;
    const pulse = Math.sin(this.animationTime * 0.003) * 0.3 + 0.7; // 0.4 到 1.0 之间脉冲
    const textY = height * 0.5;
    
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.TEXT_LIGHT, pulse);
    ctx.font = `${textFontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.loadingText, width / 2, textY);
    ctx.restore();
    
    // 绘制进度条（带发光效果）
    const progressBarWidth = width * 0.6;
    const progressBarHeight = height * 0.05;
    const progressBarX = (width - progressBarWidth) / 2;
    const progressBarY = height * 0.6;
    const progressBarRadius = progressBarHeight / 2;
    
    polyfillRoundRect(ctx);
    
    // 进度条背景（带边框和阴影）
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = 'rgba(30, 30, 40, 0.95)';
    ctx.beginPath();
    ctx.roundRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, progressBarRadius);
    ctx.fill();
    ctx.restore();
    
    // 进度条边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x666666, 0.5);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 进度条前景（带渐变和发光）
    const progressWidth = progressBarWidth * this.progress;
    if (progressWidth > 0) {
      ctx.save();
      // 发光效果
      ctx.shadowColor = ColorUtils.hexToCanvas(0x00ff41, 0.8);
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // 渐变填充
      const progressGradient = ctx.createLinearGradient(
        progressBarX, progressBarY,
        progressBarX, progressBarY + progressBarHeight
      );
      progressGradient.addColorStop(0, ColorUtils.hexToCanvas(0x00ff88, 1.0));
      progressGradient.addColorStop(1, ColorUtils.hexToCanvas(0x00cc44, 1.0));
      
      ctx.fillStyle = progressGradient;
      ctx.beginPath();
      ctx.roundRect(progressBarX + 2, progressBarY + 2, progressWidth - 4, progressBarHeight - 4, progressBarRadius - 1);
      ctx.fill();
      ctx.restore();
    }
    
    // 绘制进度百分比（带阴影）
    const percentText = Math.floor(this.progress * 100) + '%';
    const percentY = progressBarY + progressBarHeight + textFontSize + 10;
    
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 1.0);
    ctx.font = `bold ${textFontSize * 1.2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(percentText, width / 2, percentY);
    ctx.restore();
  }
}
