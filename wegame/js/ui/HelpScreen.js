/**
 * 帮助界面
 */

import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';
import { ColorUtils, GameColors } from '../config/Colors';
import { polyfillRoundRect } from '../utils/CanvasUtils';

class HelpScreen {
  // 离屏Canvas缓存（静态部分）
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _cacheWidth = 0;
  static _cacheHeight = 0;
  static _initialized = false;
  
  // 按钮缓存
  static _buttonCache = null;
  static _buttonCtx = null;
  static _buttonInitialized = false;
  
  constructor(ctx) {
    this.ctx = ctx;
    this.visible = false;
    this.onCloseCallback = null;
    
    // 滚动相关
    this.scrollY = 0; // 当前滚动位置
    this.maxScrollY = 0; // 最大滚动位置
    this.isScrolling = false; // 是否正在滚动
    this.scrollStartY = 0; // 滚动开始时的Y坐标
    this.scrollStartScrollY = 0; // 滚动开始时的scrollY值
    this.contentHeight = 0; // 内容总高度（每次渲染时计算）
  }
  
  /**
   * 初始化静态部分缓存
   */
  static initStaticCache() {
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    
    // 如果已经初始化且尺寸相同，直接返回
    if (this._initialized && 
        this._cacheWidth === windowWidth && 
        this._cacheHeight === windowHeight) {
      return;
    }
    
    try {
      if (typeof wx !== 'undefined') {
        this._cachedCanvas = wx.createCanvas();
        this._cachedCanvas.width = windowWidth;
        this._cachedCanvas.height = windowHeight;
      } else {
        this._cachedCanvas = document.createElement('canvas');
        this._cachedCanvas.width = windowWidth;
        this._cachedCanvas.height = windowHeight;
      }
      
      this._cachedCtx = this._cachedCanvas.getContext('2d');
      this._cacheWidth = windowWidth;
      this._cacheHeight = windowHeight;
      
      // 清空缓存Canvas
      this._cachedCtx.clearRect(0, 0, windowWidth, windowHeight);
      
      // 绘制静态部分到缓存
      this.drawStaticToCache(this._cachedCtx, windowWidth, windowHeight);
      
      this._initialized = true;
    } catch (e) {
      console.warn('帮助界面静态缓存初始化失败:', e);
      this._initialized = false;
    }
  }
  
  /**
   * 绘制静态部分到缓存Canvas（遮罩、面板背景、标题）
   */
  static drawStaticToCache(ctx, windowWidth, windowHeight) {
    polyfillRoundRect(ctx);
    
    // 绘制半透明遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, windowWidth, windowHeight);
    
    // 绘制帮助面板背景（缩小宽度）
    const panelWidth = windowWidth * 0.65;
    const panelHeight = windowHeight * 0.75;
    const panelX = (windowWidth - panelWidth) / 2;
    const panelY = (windowHeight - panelHeight) / 2;
    const panelRadius = UIConfig.CONTAINER_RADIUS * 2;
    
    // 绘制面板阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;
    
    // 绘制面板背景（渐变）
    const bgGradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
    bgGradient.addColorStop(0, ColorUtils.hexToCanvas(0x1a1a2e, 0.95));
    bgGradient.addColorStop(1, ColorUtils.hexToCanvas(0x0f0f1e, 0.95));
    ctx.fillStyle = bgGradient;
    this.roundRectForCache(ctx, panelX, panelY, panelWidth, panelHeight, panelRadius);
    ctx.fill();
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // 绘制面板边框（发光效果）
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.8);
    ctx.lineWidth = UIConfig.BORDER_WIDTH * 2;
    this.roundRectForCache(ctx, panelX, panelY, panelWidth, panelHeight, panelRadius);
    ctx.stroke();
    
    // 绘制标题
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.TEXT_MAIN);
    ctx.font = `bold ${UIConfig.TITLE_FONT_SIZE * 0.8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const titleY = panelY + panelHeight * 0.12;
    ctx.fillText('游戏帮助', windowWidth / 2, titleY);
  }
  
  /**
   * 绘制圆角矩形（用于缓存）
   */
  static roundRectForCache(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
  
  /**
   * 初始化按钮缓存
   */
  static initButtonCache() {
    if (this._buttonInitialized) {
      return;
    }
    
    try {
      const btnWidth = UIConfig.HELP_BTN_WIDTH * 0.8;
      const btnHeight = UIConfig.HELP_BTN_HEIGHT * 0.9;
      const btnRadius = UIConfig.HELP_BTN_RADIUS;
      
      if (typeof wx !== 'undefined') {
        this._buttonCache = wx.createCanvas();
      } else {
        this._buttonCache = document.createElement('canvas');
      }
      this._buttonCache.width = Math.ceil(btnWidth);
      this._buttonCache.height = Math.ceil(btnHeight);
      this._buttonCtx = this._buttonCache.getContext('2d');
      
      // 清空缓存Canvas
      this._buttonCtx.clearRect(0, 0, btnWidth, btnHeight);
      
      // 绘制按钮到缓存
      this.drawButtonToCache(this._buttonCtx, btnWidth / 2, btnHeight / 2, btnWidth, btnHeight, btnRadius, '关闭', GameColors.ROCKET_TOWER);
      
      this._buttonInitialized = true;
    } catch (e) {
      console.warn('帮助界面按钮缓存初始化失败:', e);
      this._buttonInitialized = false;
    }
  }
  
  /**
   * 绘制按钮到缓存Canvas
   */
  static drawButtonToCache(ctx, x, y, width, height, radius, text, color) {
    polyfillRoundRect(ctx);
    
    // 绘制按钮背景（渐变）
    const btnGradient = ctx.createLinearGradient(x - width / 2, y - height / 2, x - width / 2, y + height / 2);
    btnGradient.addColorStop(0, ColorUtils.hexToCanvas(color, 0.9));
    btnGradient.addColorStop(1, ColorUtils.hexToCanvas(color, 0.7));
    ctx.fillStyle = btnGradient;
    this.roundRectForCache(ctx, x - width / 2, y - height / 2, width, height, radius);
    ctx.fill();
    
    // 绘制按钮高光
    const highlightGradient = ctx.createLinearGradient(x - width / 2, y - height / 2, x - width / 2, y);
    highlightGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.3));
    highlightGradient.addColorStop(1, ColorUtils.hexToCanvas(0xffffff, 0));
    ctx.fillStyle = highlightGradient;
    this.roundRectForCache(ctx, x - width / 2, y - height / 2, width, height * 0.3, radius);
    ctx.fill();
    
    // 绘制按钮边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.8);
    ctx.lineWidth = UIConfig.BORDER_WIDTH;
    this.roundRectForCache(ctx, x - width / 2, y - height / 2, width, height, radius);
    ctx.stroke();
    
    // 绘制按钮文字
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.TEXT_MAIN);
    ctx.font = `${UIConfig.BUTTON_FONT_SIZE}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  }
  
  /**
   * 从缓存渲染静态部分
   */
  static renderStaticFromCache(ctx) {
    if (!this._cachedCanvas || !this._initialized) {
      return false;
    }
    
    ctx.drawImage(
      this._cachedCanvas,
      0,
      0,
      this._cacheWidth,
      this._cacheHeight
    );
    
    return true;
  }
  
  /**
   * 从缓存渲染按钮
   */
  static renderButtonFromCache(ctx, x, y) {
    if (!this._buttonCache || !this._buttonInitialized) {
      return false;
    }
    
    ctx.drawImage(
      this._buttonCache,
      x - this._buttonCache.width / 2,
      y - this._buttonCache.height / 2,
      this._buttonCache.width,
      this._buttonCache.height
    );
    
    return true;
  }
  
  /**
   * 显示帮助界面
   */
  show(onCloseCallback) {
    this.visible = true;
    this.onCloseCallback = onCloseCallback;
    this.scrollY = 0; // 重置滚动位置
    this.isScrolling = false;
  }
  
  /**
   * 计算内容高度
   */
  calculateContentHeight(contentWidth) {
    const lineHeight = UIConfig.SUBTITLE_FONT_SIZE * 1.5;
    
    // 临时设置字体以测量文本
    this.ctx.save();
    this.ctx.font = `${UIConfig.SUBTITLE_FONT_SIZE * 0.9}px Arial`;
    
    const helpTexts = [
      '【游戏目标】',
      '阻止敌人到达战场右端，保护基地！',
      '',
      '【操作说明】',
      '1. 拖拽武器卡片到战场放置防御塔',
      '2. 防御塔会自动攻击范围内的敌人',
      '3. 击败敌人获得金币，购买更多武器',
      '',
      '【武器类型】',
      '• 火箭塔：远程范围攻击',
      '• 激光塔：持续伤害，攻击速度快',
      '',
      '【提示】',
      '• 合理布局武器位置',
      '• 优先升级高价值武器',
      '• 注意敌人的移动路径'
    ];
    
    let currentY = 0;
    for (const text of helpTexts) {
      // 处理文本换行
      const words = text.split('');
      let line = '';
      let lineY = currentY;
      
      for (const char of words) {
        const testLine = line + char;
        const metrics = this.ctx.measureText(testLine);
        if (metrics.width > contentWidth && line.length > 0) {
          line = char;
          lineY += lineHeight;
        } else {
          line = testLine;
        }
      }
      
      if (line.length > 0) {
        lineY += lineHeight;
      }
      
      currentY = lineY + lineHeight * 1.2;
    }
    
    this.ctx.restore();
    
    return currentY;
  }
  
  /**
   * 隐藏帮助界面
   */
  hide() {
    this.visible = false;
  }
  
  /**
   * 渲染帮助界面（优化：使用离屏Canvas缓存静态部分）
   */
  render() {
    if (!this.visible) return;
    
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    
    // 初始化缓存（如果未初始化）
    if (!HelpScreen._initialized) {
      HelpScreen.initStaticCache();
    }
    if (!HelpScreen._buttonInitialized) {
      HelpScreen.initButtonCache();
    }
    
    // 使用缓存渲染静态部分（遮罩、面板背景、标题）
    HelpScreen.renderStaticFromCache(this.ctx);
    
    // 计算面板尺寸（用于内容区域计算）
    const panelWidth = windowWidth * 0.65;
    const panelHeight = windowHeight * 0.75;
    const panelX = (windowWidth - panelWidth) / 2;
    const panelY = (windowHeight - panelHeight) / 2;
    
    // 计算内容区域（确保标题下方有足够空间）
    // 标题在 panelY + panelHeight * 0.12，标题高度约为 TITLE_FONT_SIZE * 0.8
    // 内容区域从标题下方开始，留出足够的间距，确保第一行文字完全可见
    const titleY = panelY + panelHeight * 0.12;
    const titleBottom = titleY + UIConfig.TITLE_FONT_SIZE * 0.8 * 0.5;
    // 增加间距，确保第一行文字（包括行高）完全可见
    const contentStartY = Math.max(titleBottom + 20, panelY + panelHeight * 0.22);
    const contentEndY = panelY + panelHeight * 0.88 - UIConfig.HELP_BTN_HEIGHT * 0.9;
    const contentAreaHeight = contentEndY - contentStartY;
    const lineHeight = UIConfig.SUBTITLE_FONT_SIZE * 1.5;
    // 内容居中显示，左右留出边距
    const contentPadding = panelWidth * 0.12; // 左右各12%的边距
    const contentX = panelX + contentPadding;
    const contentWidth = panelWidth - contentPadding * 2;
    
    // 计算内容总高度（每次渲染时重新计算，确保准确）
    this.contentHeight = this.calculateContentHeight(contentWidth);
    
    // 计算最大滚动位置
    this.maxScrollY = Math.max(0, this.contentHeight - contentAreaHeight);
    
    // 限制滚动位置（确保不会滚动过头）
    this.scrollY = Math.max(0, Math.min(this.maxScrollY, this.scrollY));
    
    // 设置裁剪区域（只显示内容区域）
    // 注意：裁剪区域的上边界是 contentStartY，所以内容应该从 contentStartY 开始绘制
    // 优化：使用 save/restore 来管理 clip（clip 需要 restore 来恢复）
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(contentX, contentStartY, contentWidth, contentAreaHeight);
    this.ctx.clip();
    
    this.ctx.font = `${UIConfig.SUBTITLE_FONT_SIZE * 0.9}px Arial`;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top'; // 使用 top baseline，确保文字从顶部开始绘制
    this.ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.TEXT_MAIN, 0.9);
    
    const helpTexts = [
      '【游戏目标】',
      '阻止敌人到达战场右端，保护基地！',
      '',
      '【操作说明】',
      '1. 拖拽武器卡片到战场放置防御塔',
      '2. 防御塔会自动攻击范围内的敌人',
      '3. 击败敌人获得金币，购买更多武器',
      '',
      '【武器类型】',
      '• 火箭塔：远程范围攻击',
      '• 激光塔：持续伤害，攻击速度快',
      '',
      '【提示】',
      '• 合理布局武器位置',
      '• 优先升级高价值武器',
      '• 注意敌人的移动路径'
    ];
    
    // 内容从 contentStartY 开始，减去滚动偏移
    // 当 scrollY = 0 时，第一行文字从 contentStartY 开始显示
    // 使用 textBaseline = 'top'，所以文字从 currentY 的顶部开始绘制
    // 这样第一行文字就能完全可见
    let currentY = contentStartY - this.scrollY;
    for (const text of helpTexts) {
      if (text.startsWith('【') || text.startsWith('•')) {
        // 标题或列表项，使用更亮的颜色
        this.ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_TOWER, 0.9);
        this.ctx.font = `bold ${UIConfig.SUBTITLE_FONT_SIZE * 0.9}px Arial`;
      } else {
        this.ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.TEXT_MAIN, 0.85);
        this.ctx.font = `${UIConfig.SUBTITLE_FONT_SIZE * 0.9}px Arial`;
      }
      
      // 处理文本换行
      const words = text.split('');
      let line = '';
      let lineY = currentY;
      
      for (const char of words) {
        const testLine = line + char;
        const metrics = this.ctx.measureText(testLine);
        if (metrics.width > contentWidth && line.length > 0) {
          this.ctx.fillText(line, contentX, lineY);
          line = char;
          lineY += lineHeight;
        } else {
          line = testLine;
        }
      }
      
      if (line.length > 0) {
        this.ctx.fillText(line, contentX, lineY);
      }
      
      currentY = lineY + lineHeight * 1.2;
    }
    
    // 恢复裁剪区域
    this.ctx.restore();
    
    // 绘制关闭按钮（使用缓存）
    const closeBtnY = panelY + panelHeight * 0.88;
    HelpScreen.renderButtonFromCache(this.ctx, windowWidth / 2, closeBtnY);
  }
  
  /**
   * 绘制按钮
   */
  drawButton(x, y, width, height, radius, text, color) {
    polyfillRoundRect(this.ctx);
    this.ctx.save();
    
    // 绘制按钮背景（渐变）
    const btnGradient = this.ctx.createLinearGradient(x - width / 2, y - height / 2, x - width / 2, y + height / 2);
    btnGradient.addColorStop(0, ColorUtils.hexToCanvas(color, 0.9));
    btnGradient.addColorStop(1, ColorUtils.hexToCanvas(color, 0.7));
    this.ctx.fillStyle = btnGradient;
    this.roundRect(x - width / 2, y - height / 2, width, height, radius);
    this.ctx.fill();
    
    // 绘制按钮高光
    const highlightGradient = this.ctx.createLinearGradient(x - width / 2, y - height / 2, x - width / 2, y);
    highlightGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.3));
    highlightGradient.addColorStop(1, ColorUtils.hexToCanvas(0xffffff, 0));
    this.ctx.fillStyle = highlightGradient;
    this.roundRect(x - width / 2, y - height / 2, width, height * 0.3, radius);
    this.ctx.fill();
    
    // 绘制按钮边框
    this.ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.8);
    this.ctx.lineWidth = UIConfig.BORDER_WIDTH;
    this.roundRect(x - width / 2, y - height / 2, width, height, radius);
    this.ctx.stroke();
    
    // 绘制按钮文字
    this.ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.TEXT_MAIN);
    this.ctx.font = `${UIConfig.BUTTON_FONT_SIZE}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, x, y);
    
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
    
    const touch = e.touches && e.touches[0] ? e.touches[0] : e;
    if (!touch) return;
    
    const x = touch.x || touch.clientX || 0;
    const y = touch.y || touch.clientY || 0;
    
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    
    // 检查是否点击了关闭按钮（使用与渲染时相同的尺寸）
    const panelWidth = windowWidth * 0.65;
    const panelHeight = windowHeight * 0.75;
    const panelX = (windowWidth - panelWidth) / 2;
    const panelY = (windowHeight - panelHeight) / 2;
    const btnX = windowWidth / 2;
    const btnY = panelY + panelHeight * 0.88;
    const btnWidth = UIConfig.HELP_BTN_WIDTH * 0.8;
    const btnHeight = UIConfig.HELP_BTN_HEIGHT * 0.9;
    
    if (
      x >= btnX - btnWidth / 2 &&
      x <= btnX + btnWidth / 2 &&
      y >= btnY - btnHeight / 2 &&
      y <= btnY + btnHeight / 2
    ) {
      if (this.onCloseCallback) {
        this.onCloseCallback();
      }
      this.hide();
      return;
    }
    
    // 检查是否在内容区域（可以滚动，使用与渲染时相同的尺寸）
    const titleY = panelY + panelHeight * 0.12;
    const titleBottom = titleY + UIConfig.TITLE_FONT_SIZE * 0.8 * 0.5;
    const contentStartY = Math.max(titleBottom + 20, panelY + panelHeight * 0.22);
    const contentEndY = panelY + panelHeight * 0.88 - UIConfig.HELP_BTN_HEIGHT * 0.9;
    const contentPadding = panelWidth * 0.12;
    const contentX = panelX + contentPadding;
    const contentWidth = panelWidth - contentPadding * 2;
    
    if (
      x >= contentX &&
      x <= contentX + contentWidth &&
      y >= contentStartY &&
      y <= contentEndY &&
      this.maxScrollY > 0
    ) {
      // 在内容区域，开始滚动
      this.isScrolling = true;
      this.scrollStartY = y;
      this.scrollStartScrollY = this.scrollY;
    }
  }
  
  /**
   * 触摸移动
   */
  onTouchMove(e) {
    if (!this.visible || !this.isScrolling) return;
    
    const touch = e.touches && e.touches[0] ? e.touches[0] : e;
    if (!touch) return;
    
    const y = touch.y || touch.clientY || 0;
    const dy = y - this.scrollStartY;
    
    // 更新滚动位置（向上滑动时scrollY增加，向下滑动时scrollY减少）
    this.scrollY = this.scrollStartScrollY - dy;
    
    // 限制滚动范围
    this.scrollY = Math.max(0, Math.min(this.maxScrollY, this.scrollY));
  }
  
  /**
   * 触摸结束
   */
  onTouchEnd(e) {
    if (this.isScrolling) {
      this.isScrolling = false;
    }
  }
}

export { HelpScreen };
export default HelpScreen;
