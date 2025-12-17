/**
 * 文字渲染工具类
 * 提供统一的文字绘制方法，简化文字绘制代码
 */

import { ColorUtils, GameColors } from '../../config/Colors';
import { UIConfig } from '../../config/UIConfig';

export class TextRenderer {
  /**
   * 绘制文字（基础方法）
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {string} text - 文字内容
   * @param {number} x - X 坐标
   * @param {number} y - Y 坐标
   * @param {Object} options - 选项
   * @param {string} [options.font] - 字体样式（如 'bold 24px Arial'）
   * @param {string} [options.color] - 颜色（十六进制或颜色字符串）
   * @param {number} [options.alpha] - 透明度（0-1）
   * @param {string} [options.align] - 文字对齐方式（'left'|'center'|'right'）
   * @param {string} [options.baseline] - 文字基线（'top'|'middle'|'bottom'）
   * @param {Object} [options.shadow] - 阴影配置 {color, blur, offsetX, offsetY}
   * @param {Object} [options.gradient] - 渐变配置 {x0, y0, x1, y1, stops: [{offset, color, alpha}]}
   */
  static drawText(ctx, text, x, y, options = {}) {
    if (!text) return;
    
    ctx.save();
    
    // 设置字体
    if (options.font) {
      ctx.font = options.font;
    }
    
    // 设置对齐方式
    ctx.textAlign = options.align || 'left';
    ctx.textBaseline = options.baseline || 'top';
    
    // 设置阴影
    if (options.shadow) {
      ctx.shadowColor = options.shadow.color || 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = options.shadow.blur || 5;
      ctx.shadowOffsetX = options.shadow.offsetX || 0;
      ctx.shadowOffsetY = options.shadow.offsetY || 2;
    }
    
    // 设置颜色或渐变
    if (options.gradient) {
      const gradient = ctx.createLinearGradient(
        options.gradient.x0, options.gradient.y0,
        options.gradient.x1, options.gradient.y1
      );
      for (const stop of options.gradient.stops) {
        const color = typeof stop.color === 'number' 
          ? ColorUtils.hexToCanvas(stop.color, stop.alpha || 1)
          : stop.color;
        gradient.addColorStop(stop.offset, color);
      }
      ctx.fillStyle = gradient;
    } else {
      const color = options.color || GameColors.TEXT_MAIN;
      const alpha = options.alpha !== undefined ? options.alpha : 1;
      ctx.fillStyle = typeof color === 'number'
        ? ColorUtils.hexToCanvas(color, alpha)
        : color;
    }
    
    // 绘制文字
    ctx.fillText(text, x, y);
    
    // 重置阴影
    if (options.shadow) {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    
    ctx.restore();
  }
  
  /**
   * 绘制标题文字
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {string} text - 文字内容
   * @param {number} x - X 坐标
   * @param {number} y - Y 坐标
   * @param {Object} options - 选项
   * @param {number} [options.size] - 字体大小（默认使用 TITLE_FONT_SIZE）
   * @param {number} [options.color] - 颜色（默认使用 ROCKET_TOWER）
   * @param {boolean} [options.bold] - 是否加粗（默认 true）
   * @param {Object} [options.shadow] - 阴影配置
   * @param {Object} [options.gradient] - 渐变配置
   */
  static drawTitle(ctx, text, x, y, options = {}) {
    const size = options.size || UIConfig.TITLE_FONT_SIZE;
    const bold = options.bold !== false;
    const font = `${bold ? 'bold ' : ''}${size}px Arial`;
    
    this.drawText(ctx, text, x, y, {
      font,
      color: options.color || GameColors.ROCKET_TOWER,
      alpha: options.alpha,
      align: options.align || 'center',
      baseline: options.baseline || 'middle',
      shadow: options.shadow,
      gradient: options.gradient
    });
  }
  
  /**
   * 绘制副标题文字
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {string} text - 文字内容
   * @param {number} x - X 坐标
   * @param {number} y - Y 坐标
   * @param {Object} options - 选项
   * @param {number} [options.size] - 字体大小（默认使用 SUBTITLE_FONT_SIZE）
   * @param {number} [options.color] - 颜色（默认使用 TEXT_LIGHT）
   * @param {number} [options.alpha] - 透明度（默认 0.9）
   */
  static drawSubtitle(ctx, text, x, y, options = {}) {
    const size = options.size || UIConfig.SUBTITLE_FONT_SIZE;
    const font = `${size}px Arial`;
    
    this.drawText(ctx, text, x, y, {
      font,
      color: options.color || GameColors.TEXT_LIGHT,
      alpha: options.alpha !== undefined ? options.alpha : 0.9,
      align: options.align || 'center',
      baseline: options.baseline || 'middle'
    });
  }
  
  /**
   * 绘制正文文字
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {string} text - 文字内容
   * @param {number} x - X 坐标
   * @param {number} y - Y 坐标
   * @param {Object} options - 选项
   * @param {number} [options.size] - 字体大小（默认使用 SUBTITLE_FONT_SIZE * 0.9）
   * @param {number} [options.color] - 颜色（默认使用 TEXT_MAIN）
   * @param {string} [options.align] - 对齐方式（默认 'left'）
   * @param {string} [options.baseline] - 基线（默认 'top'）
   */
  static drawBody(ctx, text, x, y, options = {}) {
    const size = options.size || (UIConfig.SUBTITLE_FONT_SIZE * 0.9);
    const font = options.bold ? `bold ${size}px Arial` : `${size}px Arial`;
    
    this.drawText(ctx, text, x, y, {
      font,
      color: options.color || GameColors.TEXT_MAIN,
      alpha: options.alpha,
      align: options.align || 'left',
      baseline: options.baseline || 'top'
    });
  }
  
  /**
   * 绘制按钮文字
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {string} text - 文字内容
   * @param {number} x - X 坐标
   * @param {number} y - Y 坐标
   * @param {Object} options - 选项
   * @param {number} [options.size] - 字体大小（默认使用 BUTTON_FONT_SIZE）
   * @param {number} [options.color] - 颜色（默认使用 TEXT_MAIN）
   * @param {Object} [options.shadow] - 阴影配置
   */
  static drawButtonText(ctx, text, x, y, options = {}) {
    const size = options.size || UIConfig.BUTTON_FONT_SIZE;
    const font = `bold ${size}px Arial`;
    
    this.drawText(ctx, text, x, y, {
      font,
      color: options.color || GameColors.TEXT_MAIN,
      alpha: options.alpha,
      align: options.align || 'center',
      baseline: options.baseline || 'middle',
      shadow: options.shadow || {
        color: 'rgba(0, 0, 0, 0.6)',
        blur: 3,
        offsetX: 0,
        offsetY: 1
      }
    });
  }
  
  /**
   * 测量文字宽度
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {string} text - 文字内容
   * @param {string} font - 字体样式
   * @returns {number} 文字宽度
   */
  static measureText(ctx, text, font) {
    ctx.save();
    if (font) {
      ctx.font = font;
    }
    const width = ctx.measureText(text).width;
    ctx.restore();
    return width;
  }
  
  /**
   * 自动换行文字
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {string} text - 文字内容
   * @param {number} maxWidth - 最大宽度
   * @param {string} font - 字体样式
   * @returns {string[]} 换行后的文字数组
   */
  static wrapText(ctx, text, maxWidth, font) {
    if (!text) return [];
    
    ctx.save();
    if (font) {
      ctx.font = font;
    }
    
    const words = text.split('');
    const lines = [];
    let line = '';
    
    for (const char of words) {
      const testLine = line + char;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line.length > 0) {
        lines.push(line);
        line = char;
      } else {
        line = testLine;
      }
    }
    
    if (line.length > 0) {
      lines.push(line);
    }
    
    ctx.restore();
    return lines;
  }
  
  /**
   * 绘制多行文字
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {string[]} lines - 文字行数组
   * @param {number} x - X 坐标
   * @param {number} y - Y 坐标
   * @param {number} lineHeight - 行高
   * @param {Object} options - 选项（与 drawText 相同）
   * @returns {number} 返回最后一行文字的 Y 坐标
   */
  static drawMultilineText(ctx, lines, x, y, lineHeight, options = {}) {
    if (!lines || lines.length === 0) return y;
    
    let currentY = y;
    for (const line of lines) {
      this.drawText(ctx, line, x, currentY, options);
      currentY += lineHeight;
    }
    
    return currentY;
  }
}

