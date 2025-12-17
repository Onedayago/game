/**
 * 波次提示组件
 * 负责波次开始提示的渲染（动态动画）
 */

import { GameConfig } from '../../config/GameConfig';
import { ColorUtils, GameColors } from '../../config/Colors';
import { UIConfig } from '../../config/UIConfig';
import { TextRenderer } from '../utils/TextRenderer';

export class WaveNotification {
  static DURATION = 2000; // 显示2秒
  static FADE_IN_DURATION = 300; // 淡入时间
  static FADE_OUT_DURATION = 300; // 淡出时间
  
  /**
   * 渲染波次提示（优化版：只显示中间文字，无全屏遮罩）
   */
  static render(ctx, waveLevel, elapsed) {
    const duration = this.DURATION;
    
    // 计算透明度（淡入淡出效果）
    let alpha = 1.0;
    if (elapsed < this.FADE_IN_DURATION) {
      alpha = elapsed / this.FADE_IN_DURATION;
    } else if (elapsed > duration - this.FADE_OUT_DURATION) {
      alpha = (duration - elapsed) / this.FADE_OUT_DURATION;
    }
    
    // 计算缩放效果（淡入时放大，淡出时缩小）
    let scale = 1.0;
    if (elapsed < this.FADE_IN_DURATION) {
      scale = 0.8 + (elapsed / this.FADE_IN_DURATION) * 0.2; // 从0.8到1.0
    } else if (elapsed > duration - this.FADE_OUT_DURATION) {
      const fadeOutProgress = (elapsed - (duration - this.FADE_OUT_DURATION)) / this.FADE_OUT_DURATION;
      scale = 1.0 - fadeOutProgress * 0.2; // 从1.0到0.8
    }
    
    const centerX = GameConfig.DESIGN_WIDTH / 2;
    const centerY = GameConfig.DESIGN_HEIGHT * 0.3; // 稍微靠上一点
    
    ctx.save();
    
    // 应用缩放
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    
    // 使用 TextRenderer 绘制美化的文字
    const text = `第 ${waveLevel} 波`;
    const fontSize = UIConfig.TITLE_FONT_SIZE * 1.5;
    
    TextRenderer.drawText(ctx, text, centerX, centerY, {
      font: `bold ${fontSize}px Arial`,
      align: 'center',
      baseline: 'middle',
      alpha: alpha,
      shadow: {
        color: 'rgba(0, 0, 0, 0.9)',
        blur: 15,
        offsetX: 0,
        offsetY: 5
      },
      gradient: {
        x0: centerX - 150,
        y0: centerY - 30,
        x1: centerX + 150,
        y1: centerY + 30,
        stops: [
          { offset: 0, color: GameColors.ROCKET_TOWER, alpha: alpha },
          { offset: 0.5, color: 0xffaa44, alpha: alpha },
          { offset: 1, color: GameColors.ROCKET_TOWER, alpha: alpha }
        ]
      }
    });
    
    ctx.restore();
  }
  
  /**
   * HSL转RGB（用于彩虹色）
   */
  static hslToRgb(h, s, l) {
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }
}

