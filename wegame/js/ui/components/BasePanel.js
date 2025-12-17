/**
 * 基础面板组件类
 * 提供统一的面板实现，支持离屏渲染和自定义样式
 */

import { ColorUtils, GameColors } from '../../config/Colors';
import { UIConfig } from '../../config/UIConfig';
import { polyfillRoundRect } from '../../utils/CanvasUtils';
import { TextRenderer } from '../utils/TextRenderer';

export class BasePanel {
  /**
   * 构造函数
   * @param {number} width - 面板宽度
   * @param {number} height - 面板高度
   * @param {number} radius - 圆角半径
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文（可选）
   */
  constructor(width, height, radius = UIConfig.PANEL_RADIUS_LARGE, ctx = null) {
    this.width = width;
    this.height = height;
    this.radius = radius;
    this.ctx = ctx;
    
    // 样式配置
    this.backgroundColor = null; // 背景颜色（十六进制或颜色字符串）
    this.backgroundGradient = null; // 背景渐变配置
    this.overlayGradient = null; // 覆盖层渐变（用于主题色）
    this.borderColor = GameColors.UI_BORDER;
    this.borderWidth = 3;
    this.borderShadow = {
      color: null,
      blur: 15,
      offsetX: 0,
      offsetY: 0
    };
    
    // 阴影配置
    this.shadow = {
      color: 'rgba(0, 0, 0, 0.6)',
      blur: 25,
      offsetX: 0,
      offsetY: 10
    };
    
    // 可见性
    this.visible = true;
    
    // 离屏 Canvas（用于缓存渲染结果）
    this._offScreenCanvas = null;
    this._offScreenCtx = null;
    this._cacheDirty = true;
    this._useOffScreen = false;
  }
  
  /**
   * 设置是否使用离屏渲染
   * @param {boolean} use - 是否使用离屏渲染
   */
  setUseOffScreen(use) {
    this._useOffScreen = use;
    if (use && !this._offScreenCanvas) {
      this._initOffScreenCanvas();
    }
    this._cacheDirty = true;
  }
  
  /**
   * 初始化离屏 Canvas
   */
  _initOffScreenCanvas() {
    if (this._offScreenCanvas) {
      return;
    }
    
    const padding = UIConfig.CACHE_PADDING;
    this._offScreenCanvas = wx.createCanvas();
    this._offScreenCanvas.width = this.width + padding * 2;
    this._offScreenCanvas.height = this.height + padding * 2;
    this._offScreenCtx = this._offScreenCanvas.getContext('2d');
  }
  
  /**
   * 标记缓存为脏（需要重新渲染）
   */
  invalidate() {
    this._cacheDirty = true;
  }
  
  /**
   * 设置背景颜色
   * @param {number|string} color - 颜色（十六进制或颜色字符串）
   */
  setBackgroundColor(color) {
    this.backgroundColor = color;
    this.backgroundGradient = null;
    this.invalidate();
  }
  
  /**
   * 设置背景渐变
   * @param {Array} stops - 渐变停止点数组 [{offset, color, alpha}, ...]
   */
  setBackgroundGradient(stops) {
    this.backgroundGradient = stops;
    this.backgroundColor = null;
    this.invalidate();
  }
  
  /**
   * 设置覆盖层渐变（用于主题色）
   * @param {Array} stops - 渐变停止点数组 [{offset, color, alpha}, ...]
   */
  setOverlayGradient(stops) {
    this.overlayGradient = stops;
    this.invalidate();
  }
  
  /**
   * 设置边框颜色
   * @param {number} color - 颜色（十六进制）
   * @param {number} width - 边框宽度
   */
  setBorderColor(color, width = 3) {
    this.borderColor = color;
    this.borderWidth = width;
    this.invalidate();
  }
  
  /**
   * 设置边框阴影
   * @param {Object} shadow - 阴影配置 {color, blur, offsetX, offsetY}
   */
  setBorderShadow(shadow) {
    this.borderShadow = shadow;
    this.invalidate();
  }
  
  /**
   * 设置面板阴影
   * @param {Object} shadow - 阴影配置 {color, blur, offsetX, offsetY}
   */
  setShadow(shadow) {
    this.shadow = shadow;
    this.invalidate();
  }
  
  /**
   * 绘制面板背景和边框
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {number} x - 绘制 X 坐标（左上角）
   * @param {number} y - 绘制 Y 坐标（左上角）
   */
  draw(ctx, x, y) {
    polyfillRoundRect(ctx);
    ctx.save();
    
    // 绘制面板阴影
    if (this.shadow) {
      ctx.shadowColor = this.shadow.color || 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = this.shadow.blur || 25;
      ctx.shadowOffsetX = this.shadow.offsetX || 0;
      ctx.shadowOffsetY = this.shadow.offsetY || 10;
    }
    
    // 绘制背景
    if (this.backgroundGradient) {
      const gradient = ctx.createLinearGradient(x, y, x, y + this.height);
      for (const stop of this.backgroundGradient) {
        const color = typeof stop.color === 'number'
          ? ColorUtils.hexToCanvas(stop.color, stop.alpha || 1)
          : stop.color;
        gradient.addColorStop(stop.offset, color);
      }
      ctx.fillStyle = gradient;
    } else if (this.backgroundColor) {
      const color = typeof this.backgroundColor === 'number'
        ? ColorUtils.hexToCanvas(this.backgroundColor, 0.98)
        : this.backgroundColor;
      ctx.fillStyle = color;
    } else {
      // 默认背景渐变
      const defaultGradient = ctx.createLinearGradient(x, y, x, y + this.height);
      defaultGradient.addColorStop(0, 'rgba(30, 35, 45, 0.98)');
      defaultGradient.addColorStop(0.3, 'rgba(20, 25, 35, 0.96)');
      defaultGradient.addColorStop(0.7, 'rgba(15, 20, 30, 0.95)');
      defaultGradient.addColorStop(1, 'rgba(10, 15, 25, 0.94)');
      ctx.fillStyle = defaultGradient;
    }
    
    ctx.beginPath();
    ctx.roundRect(x, y, this.width, this.height, this.radius);
    ctx.fill();
    
    // 绘制覆盖层渐变（主题色）
    if (this.overlayGradient) {
      const overlay = ctx.createLinearGradient(x, y, x, y + this.height);
      for (const stop of this.overlayGradient) {
        const color = typeof stop.color === 'number'
          ? ColorUtils.hexToCanvas(stop.color, stop.alpha || 1)
          : stop.color;
        overlay.addColorStop(stop.offset, color);
      }
      ctx.fillStyle = overlay;
      ctx.fill();
    }
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // 绘制边框（带阴影）
    if (this.borderShadow && this.borderShadow.color) {
      ctx.shadowBlur = this.borderShadow.blur || 15;
      ctx.shadowColor = this.borderShadow.color;
      ctx.shadowOffsetX = this.borderShadow.offsetX || 0;
      ctx.shadowOffsetY = this.borderShadow.offsetY || 0;
    }
    
    ctx.strokeStyle = typeof this.borderColor === 'number'
      ? ColorUtils.hexToCanvas(this.borderColor, 0.9)
      : this.borderColor;
    ctx.lineWidth = this.borderWidth;
    ctx.beginPath();
    ctx.roundRect(x, y, this.width, this.height, this.radius);
    ctx.stroke();
    
    // 重置阴影
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    
    // 绘制内边框（高光）
    ctx.strokeStyle = typeof this.borderColor === 'number'
      ? ColorUtils.hexToCanvas(this.borderColor, 0.4)
      : ColorUtils.hexToCanvas(this.borderColor, 0.4);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, this.width - 4, this.height - 4, this.radius - 2);
    ctx.stroke();
    
    ctx.restore();
  }
  
  /**
   * 渲染面板
   * @param {CanvasRenderingContext2D} ctx - 主渲染上下文（可选）
   * @param {number} x - 绘制 X 坐标（左上角）
   * @param {number} y - 绘制 Y 坐标（左上角）
   */
  render(ctx = null, x, y) {
    if (!this.visible) {
      return;
    }
    
    // 如果提供了主渲染上下文，使用它；否则使用组件自身的 ctx
    const mainCtx = ctx || this.ctx;
    if (!mainCtx) {
      // 警告：没有可用的渲染上下文
      return;
    }
    
    // 如果使用离屏渲染
    if (this._useOffScreen) {
      // 确保离屏 Canvas 已初始化
      if (!this._offScreenCanvas) {
        this._initOffScreenCanvas();
      }
      
      // 如果缓存脏了，重新渲染到离屏 Canvas
      if (this._cacheDirty) {
        this._renderToOffScreen();
        this._cacheDirty = false;
      }
      
      // 将离屏 Canvas 绘制到主 Canvas
      const padding = UIConfig.CACHE_PADDING;
      mainCtx.drawImage(
        this._offScreenCanvas,
        x - padding,
        y - padding
      );
    } else {
      // 直接渲染到主 Canvas
      this.draw(mainCtx, x, y);
    }
  }
  
  /**
   * 渲染到离屏 Canvas
   */
  _renderToOffScreen() {
    if (!this._offScreenCtx) {
      return;
    }
    
    const padding = UIConfig.CACHE_PADDING;
    const canvasWidth = this._offScreenCanvas.width;
    const canvasHeight = this._offScreenCanvas.height;
    
    // 清空离屏 Canvas
    this._offScreenCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // 绘制面板（在 padding 偏移后）
    this.draw(this._offScreenCtx, padding, padding);
  }
  
  /**
   * 设置面板尺寸
   * @param {number} width - 宽度
   * @param {number} height - 高度
   */
  setSize(width, height) {
    this.width = width;
    this.height = height;
    
    // 如果使用离屏渲染，需要重新创建离屏 Canvas
    if (this._useOffScreen && this._offScreenCanvas) {
      const padding = UIConfig.CACHE_PADDING;
      this._offScreenCanvas.width = width + padding * 2;
      this._offScreenCanvas.height = height + padding * 2;
      this._cacheDirty = true;
    }
    
    this.invalidate();
  }
  
  /**
   * 显示面板
   */
  show() {
    this.visible = true;
  }
  
  /**
   * 隐藏面板
   */
  hide() {
    this.visible = false;
  }
  
  /**
   * 获取面板边界框
   * @returns {Object} 边界框对象 {width, height}
   */
  getSize() {
    return {
      width: this.width,
      height: this.height
    };
  }
  
  /**
   * 销毁面板
   */
  destroy() {
    // 清理离屏 Canvas
    this._offScreenCanvas = null;
    this._offScreenCtx = null;
    
    this.ctx = null;
  }
}

