/**
 * 基础按钮组件类
 * 提供统一的按钮实现，支持离屏渲染和点击检测
 */

import { ColorUtils, GameColors } from '../../config/Colors';
import { UIConfig } from '../../config/UIConfig';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class BaseButton {
  /**
   * 构造函数
   * @param {number} x - 按钮 X 坐标（中心点）
   * @param {number} y - 按钮 Y 坐标（中心点）
   * @param {number} width - 按钮宽度
   * @param {number} height - 按钮高度
   * @param {string} text - 按钮文本
   * @param {number} color - 按钮颜色（十六进制）
   * @param {number} radius - 按钮圆角半径
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文（可选）
   */
  constructor(x, y, width, height, text, color = GameColors.UI_BACKGROUND, radius = UIConfig.BUTTON_RADIUS, ctx = null) {
    // 位置和尺寸（中心点坐标）
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.radius = radius;
    
    // 文本和样式
    this.text = text;
    this.color = color;
    this.textColor = GameColors.TEXT_MAIN;
    
    // 可见性和启用状态
    this.visible = true;
    this.enabled = true;
    
    // 渲染上下文
    this.ctx = ctx;
    
    // 离屏 Canvas（用于缓存渲染结果）
    this._offScreenCanvas = null;
    this._offScreenCtx = null;
    this._cacheDirty = true;
    this._useOffScreen = false;
    
    // 点击回调
    this.onClickCallback = null;
    
    // 按钮状态（用于悬停效果等）
    this.hovered = false;
    this.pressed = false;
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
    
    // 添加一些边距用于阴影等效果
    const padding = 20;
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
   * 判断点是否在按钮边界内
   * @param {number} x - 点的 X 坐标
   * @param {number} y - 点的 Y 坐标
   * @returns {boolean} 是否在边界内
   */
  isPointInBounds(x, y) {
    if (!this.visible || !this.enabled) {
      return false;
    }
    
    // 按钮是中心点坐标，需要转换为左上角坐标
    const left = this.x - this.width / 2;
    const top = this.y - this.height / 2;
    const right = this.x + this.width / 2;
    const bottom = this.y + this.height / 2;
    
    return x >= left && x <= right && y >= top && y <= bottom;
  }
  
  /**
   * 判断点是否点击了按钮（用于事件处理）
   * @param {number} x - 点的 X 坐标
   * @param {number} y - 点的 Y 坐标
   * @returns {boolean} 是否点击了按钮
   */
  isClicked(x, y) {
    if (!this.isPointInBounds(x, y)) {
      return false;
    }
    
    // 触发点击回调
    if (this.onClickCallback) {
      this.onClickCallback(this, x, y);
    }
    
    return true;
  }
  
  /**
   * 设置点击回调
   * @param {Function} callback - 回调函数，参数为 (button, x, y)
   */
  setOnClick(callback) {
    this.onClickCallback = callback;
  }
  
  /**
   * 绘制按钮内容（子类可以重写此方法自定义样式）
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {number} x - 绘制 X 坐标（左上角）
   * @param {number} y - 绘制 Y 坐标（左上角）
   * @param {number} width - 绘制宽度
   * @param {number} height - 绘制高度
   */
  draw(ctx, x, y, width, height) {
    polyfillRoundRect(ctx);
    ctx.save();
    
    // 根据状态调整颜色
    let buttonColor = this.color;
    if (!this.enabled) {
      // 禁用状态：降低亮度
      buttonColor = ColorUtils.darkenColor(this.color, 0.5);
    } else if (this.pressed) {
      // 按下状态：稍微变暗
      buttonColor = ColorUtils.darkenColor(this.color, 0.2);
    } else if (this.hovered) {
      // 悬停状态：稍微变亮
      buttonColor = ColorUtils.lightenColor(this.color, 0.1);
    }
    
    // 绘制按钮阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;
    
    // 绘制按钮背景（渐变）
    const btnGradient = ctx.createLinearGradient(x, y, x, y + height);
    btnGradient.addColorStop(0, ColorUtils.hexToCanvas(buttonColor, 0.95));
    btnGradient.addColorStop(0.5, ColorUtils.hexToCanvas(buttonColor, 0.85));
    btnGradient.addColorStop(1, ColorUtils.hexToCanvas(buttonColor, 0.75));
    ctx.fillStyle = btnGradient;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, this.radius);
    ctx.fill();
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // 绘制按钮高光
    const highlightGradient = ctx.createLinearGradient(x, y, x, y + height * 0.4);
    highlightGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.4));
    highlightGradient.addColorStop(1, ColorUtils.hexToCanvas(0xffffff, 0));
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height * 0.4, this.radius);
    ctx.fill();
    
    // 绘制按钮边框（发光效果）
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.9);
    ctx.lineWidth = UIConfig.BORDER_WIDTH * 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, this.radius);
    ctx.stroke();
    
    // 绘制按钮文字（带阴影）
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = this.enabled 
      ? ColorUtils.hexToCanvas(this.textColor) 
      : ColorUtils.hexToCanvas(this.textColor, 0.5);
    ctx.font = `bold ${UIConfig.BUTTON_FONT_SIZE}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, x + width / 2, y + height / 2);
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.restore();
  }
  
  /**
   * 渲染按钮
   * @param {CanvasRenderingContext2D} ctx - 主渲染上下文（可选）
   */
  render(ctx = null) {
    if (!this.visible) {
      return;
    }
    
    // 如果提供了主渲染上下文，使用它；否则使用组件自身的 ctx
    const mainCtx = ctx || this.ctx;
    if (!mainCtx) {
      // 警告：没有可用的渲染上下文
      return;
    }
    
    // 计算按钮左上角坐标
    const drawX = this.x - this.width / 2;
    const drawY = this.y - this.height / 2;
    
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
      const padding = 20;
      mainCtx.drawImage(
        this._offScreenCanvas,
        drawX - padding,
        drawY - padding
      );
    } else {
      // 直接渲染到主 Canvas
      this.draw(mainCtx, drawX, drawY, this.width, this.height);
    }
  }
  
  /**
   * 渲染到离屏 Canvas
   */
  _renderToOffScreen() {
    if (!this._offScreenCtx) {
      return;
    }
    
    const padding = 20;
    const canvasWidth = this._offScreenCanvas.width;
    const canvasHeight = this._offScreenCanvas.height;
    
    // 清空离屏 Canvas
    this._offScreenCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // 绘制按钮（在 padding 偏移后）
    this.draw(this._offScreenCtx, padding, padding, this.width, this.height);
  }
  
  /**
   * 设置按钮位置
   * @param {number} x - X 坐标（中心点）
   * @param {number} y - Y 坐标（中心点）
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.invalidate();
  }
  
  /**
   * 设置按钮尺寸
   * @param {number} width - 宽度
   * @param {number} height - 高度
   */
  setSize(width, height) {
    this.width = width;
    this.height = height;
    
    // 如果使用离屏渲染，需要重新创建离屏 Canvas
    if (this._useOffScreen && this._offScreenCanvas) {
      const padding = 20;
      this._offScreenCanvas.width = width + padding * 2;
      this._offScreenCanvas.height = height + padding * 2;
      this._cacheDirty = true;
    }
    
    this.invalidate();
  }
  
  /**
   * 设置按钮文本
   * @param {string} text - 文本内容
   */
  setText(text) {
    this.text = text;
    this.invalidate();
  }
  
  /**
   * 设置按钮颜色
   * @param {number} color - 颜色（十六进制）
   */
  setColor(color) {
    this.color = color;
    this.invalidate();
  }
  
  /**
   * 启用按钮
   */
  enable() {
    this.enabled = true;
    this.invalidate();
  }
  
  /**
   * 禁用按钮
   */
  disable() {
    this.enabled = false;
    this.invalidate();
  }
  
  /**
   * 显示按钮
   */
  show() {
    this.visible = true;
    this.invalidate();
  }
  
  /**
   * 隐藏按钮
   */
  hide() {
    this.visible = false;
  }
  
  /**
   * 获取按钮边界框
   * @returns {Object} 边界框对象 {x, y, width, height}
   */
  getBounds() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height
    };
  }
  
  /**
   * 销毁按钮
   */
  destroy() {
    // 清理离屏 Canvas
    this._offScreenCanvas = null;
    this._offScreenCtx = null;
    
    // 清理回调
    this.onClickCallback = null;
    this.ctx = null;
  }
}

