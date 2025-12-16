/**
 * 波次提示组件
 * 负责波次开始提示的渲染（动态动画）
 */

import { GameConfig } from '../../config/GameConfig';
import { ColorUtils } from '../../config/Colors';
import { UIConfig } from '../../config/UIConfig';

export class WaveNotification {
  static DURATION = 3000; // 显示3秒
  static FADE_IN_DURATION = 500; // 淡入时间
  static FADE_OUT_DURATION = 500; // 淡出时间
  static SCALE_DURATION = 800; // 缩放时间
  
  /**
   * 渲染波次提示（简化版：移除所有动态特效）
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
    
    ctx.save();
    
    const centerX = GameConfig.DESIGN_WIDTH / 2;
    const centerY = GameConfig.DESIGN_HEIGHT / 2;
    
    // 绘制半透明遮罩
    ctx.fillStyle = `rgba(0, 0, 0, ${0.6 * alpha})`;
    ctx.fillRect(0, 0, GameConfig.DESIGN_WIDTH, GameConfig.DESIGN_HEIGHT);
    
    // 绘制提示文字
    const text = `第 ${waveLevel} 波`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, alpha);
    ctx.font = `bold ${UIConfig.BUTTON_FONT_SIZE * 2.2}px Arial`;
    ctx.fillText(text, centerX, centerY);
    
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

