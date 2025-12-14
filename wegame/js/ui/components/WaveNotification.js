/**
 * 波次提示组件
 * 负责波次开始提示的渲染（动态动画）
 */

import { GameConfig } from '../../config/GameConfig';
import { ColorUtils } from '../../config/Colors';
import { UIConfig } from '../../config/UIConfig';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class WaveNotification {
  static DURATION = 3000; // 显示3秒
  static FADE_IN_DURATION = 500; // 淡入时间
  static FADE_OUT_DURATION = 500; // 淡出时间
  static SCALE_DURATION = 800; // 缩放时间
  
  /**
   * 渲染波次提示
   */
  static render(ctx, waveLevel, elapsed) {
    const duration = this.DURATION;
    
    // 计算透明度（淡入淡出效果）
    let alpha = 1.0;
    if (elapsed < this.FADE_IN_DURATION) {
      // 前0.5秒淡入
      alpha = elapsed / this.FADE_IN_DURATION;
    } else if (elapsed > duration - this.FADE_OUT_DURATION) {
      // 最后0.5秒淡出
      alpha = (duration - elapsed) / this.FADE_OUT_DURATION;
    }
    
    // 计算缩放（放大效果）
    let scale = 1.0;
    if (elapsed < this.SCALE_DURATION) {
      // 前0.8秒放大
      scale = 0.5 + (elapsed / this.SCALE_DURATION) * 0.5;
    }
    
    polyfillRoundRect(ctx);
    ctx.save();
    
    const centerX = GameConfig.DESIGN_WIDTH / 2;
    const centerY = GameConfig.DESIGN_HEIGHT / 2;
    
    // 绘制半透明背景
    ctx.fillStyle = `rgba(0, 0, 0, ${0.6 * alpha})`;
    ctx.fillRect(0, 0, GameConfig.DESIGN_WIDTH, GameConfig.DESIGN_HEIGHT);
    
    // 绘制提示文字（带阴影和发光效果）
    const text = `第 ${waveLevel} 波`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 应用缩放
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    
    // 绘制文字阴影（多层）
    ctx.shadowColor = `rgba(157, 0, 255, ${0.8 * alpha})`;
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // 绘制外发光
    ctx.fillStyle = `rgba(157, 0, 255, ${0.3 * alpha})`;
    ctx.font = `bold ${UIConfig.TITLE_FONT_SIZE * 1.2}px Arial`;
    ctx.fillText(text, centerX, centerY);
    
    // 绘制主文字
    ctx.shadowColor = `rgba(0, 0, 0, ${0.8 * alpha})`;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = ColorUtils.hexToCanvas(0x9d00ff, alpha);
    ctx.font = `bold ${UIConfig.BUTTON_FONT_SIZE * 2}px Arial`;
    ctx.fillText(text, centerX, centerY);
    
    // 绘制高光文字
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, alpha * 0.5);
    ctx.fillText(text, centerX - 2, centerY - 2);
    
    ctx.restore();
    ctx.restore();
  }
}

