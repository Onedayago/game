/**
 * 帮助界面
 */

import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';
import { ColorUtils, GameColors } from '../config/Colors';
import { polyfillRoundRect } from '../utils/CanvasUtils';
import { WeaponRenderer } from '../rendering/WeaponRenderer';
import { EnemyRenderer } from '../rendering/EnemyRenderer';
import { WeaponType } from '../config/WeaponConfig';
import { RocketTowerConfig } from '../config/weapons/RocketTowerConfig';
import { LaserTowerConfig } from '../config/weapons/LaserTowerConfig';
import { CannonTowerConfig } from '../config/weapons/CannonTowerConfig';
import { SniperTowerConfig } from '../config/weapons/SniperTowerConfig';
import { EnemyTankConfig } from '../config/enemies/EnemyTankConfig';
import { FastEnemyConfig } from '../config/enemies/FastEnemyConfig';
import { HeavyEnemyConfig } from '../config/enemies/HeavyEnemyConfig';
import { FlyingEnemyConfig } from '../config/enemies/FlyingEnemyConfig';
import { BomberEnemyConfig } from '../config/enemies/BomberEnemyConfig';

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
    
    this._cachedCanvas = wx.createCanvas();
    this._cachedCanvas.width = windowWidth;
    this._cachedCanvas.height = windowHeight;
    
    this._cachedCtx = this._cachedCanvas.getContext('2d');
    this._cacheWidth = windowWidth;
    this._cacheHeight = windowHeight;
    
    this._cachedCtx.clearRect(0, 0, windowWidth, windowHeight);
    
    this.drawStaticToCache(this._cachedCtx, windowWidth, windowHeight);
    
    this._initialized = true;
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
    
    const btnWidth = UIConfig.HELP_BTN_WIDTH * 0.8;
    const btnHeight = UIConfig.HELP_BTN_HEIGHT * 0.9;
    const btnRadius = UIConfig.HELP_BTN_RADIUS;
    
    this._buttonCache = wx.createCanvas();
    this._buttonCache.width = Math.ceil(btnWidth);
    this._buttonCache.height = Math.ceil(btnHeight);
    this._buttonCtx = this._buttonCache.getContext('2d');
    
    this._buttonCtx.clearRect(0, 0, btnWidth, btnHeight);
    
    this.drawButtonToCache(this._buttonCtx, btnWidth / 2, btnHeight / 2, btnWidth, btnHeight, btnRadius, '关闭', GameColors.ROCKET_TOWER);
    
    this._buttonInitialized = true;
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
    const previewSize = 50; // 预览图片尺寸
    const previewSpacing = 10; // 预览图片与文字的间距
    
    // 临时设置字体以测量文本
    this.ctx.save();
    this.ctx.font = `${UIConfig.SUBTITLE_FONT_SIZE * 0.9}px Arial`;
    
    let currentY = 0;
    
    // 游戏目标
    currentY += this.measureTextHeight('【游戏目标】', contentWidth, lineHeight);
    currentY += this.measureTextHeight('阻止敌人到达战场右端，保护基地！', contentWidth, lineHeight);
    currentY += lineHeight * 1.5;
    
    // 操作说明
    currentY += this.measureTextHeight('【操作说明】', contentWidth, lineHeight);
    currentY += this.measureTextHeight('1. 拖拽武器卡片到战场放置防御塔', contentWidth, lineHeight);
    currentY += this.measureTextHeight('2. 防御塔会自动攻击范围内的敌人', contentWidth, lineHeight);
    currentY += this.measureTextHeight('3. 击败敌人获得金币，购买更多武器', contentWidth, lineHeight);
    currentY += lineHeight * 1.5;
    
    // 武器类型（包含预览图片）
    currentY += this.measureTextHeight('【武器类型】', contentWidth, lineHeight);
    currentY += lineHeight * 0.5;
    
    // 4种武器，每种包含预览图片和介绍
    const weapons = [
      { type: WeaponType.ROCKET, name: '火箭塔', desc: `追踪火箭，高爆溅射伤害\n射程：${RocketTowerConfig.ATTACK_RANGE}格 | 伤害：高 | 成本：${RocketTowerConfig.BASE_COST}金币` },
      { type: WeaponType.LASER, name: '激光塔', desc: `持续射线，高射速攻击\n射程：${LaserTowerConfig.ATTACK_RANGE}格 | 伤害：中 | 成本：${LaserTowerConfig.BASE_COST}金币` },
      { type: WeaponType.CANNON, name: '加农炮', desc: `直线炮弹，高爆伤害\n射程：${CannonTowerConfig.ATTACK_RANGE}格 | 伤害：很高 | 成本：${CannonTowerConfig.BASE_COST}金币` },
      { type: WeaponType.SNIPER, name: '狙击塔', desc: `快速子弹，超远射程\n射程：${SniperTowerConfig.ATTACK_RANGE}格 | 伤害：极高 | 成本：${SniperTowerConfig.BASE_COST}金币` }
    ];
    
    for (const weapon of weapons) {
      currentY += previewSize + previewSpacing; // 预览图片高度
      currentY += this.measureTextHeight(weapon.name, contentWidth, lineHeight);
      currentY += this.measureTextHeight(weapon.desc, contentWidth, lineHeight);
      currentY += lineHeight * 1.2;
    }
    
    currentY += lineHeight * 0.5;
    
    // 敌人类型（包含预览图片）
    currentY += this.measureTextHeight('【敌人类型】', contentWidth, lineHeight);
    currentY += lineHeight * 0.5;
    
    // 5种敌人，每种包含预览图片和介绍
    const enemies = [
      { name: '普通坦克', desc: `基础敌人\n生命：${EnemyTankConfig.MAX_HP} | 速度：中等 | 奖励：${EnemyTankConfig.KILL_REWARD}金币`, size: EnemyTankConfig.SIZE, type: 'tank' },
      { name: '快速敌人', desc: `移动速度快\n生命：${FastEnemyConfig.MAX_HP} | 速度：快 | 奖励：${FastEnemyConfig.KILL_REWARD}金币`, size: FastEnemyConfig.SIZE, type: 'fast' },
      { name: '重型敌人', desc: `生命值高，移动慢\n生命：${HeavyEnemyConfig.MAX_HP} | 速度：慢 | 奖励：${HeavyEnemyConfig.KILL_REWARD}金币`, size: HeavyEnemyConfig.SIZE, type: 'heavy' },
      { name: '飞行敌人', desc: `可飞越障碍物\n生命：${FlyingEnemyConfig.MAX_HP} | 速度：中快 | 奖励：${FlyingEnemyConfig.KILL_REWARD}金币`, size: FlyingEnemyConfig.SIZE, type: 'flying' },
      { name: '自爆敌人', desc: `死亡时爆炸造成范围伤害\n生命：${BomberEnemyConfig.MAX_HP} | 速度：中 | 奖励：${BomberEnemyConfig.KILL_REWARD}金币`, size: BomberEnemyConfig.SIZE, type: 'bomber' }
    ];
    
    for (const enemy of enemies) {
      currentY += previewSize + previewSpacing; // 预览图片高度
      currentY += this.measureTextHeight(enemy.name, contentWidth, lineHeight);
      currentY += this.measureTextHeight(enemy.desc, contentWidth, lineHeight);
      currentY += lineHeight * 1.2;
    }
    
    currentY += lineHeight * 0.5;
    
    // 提示
    currentY += this.measureTextHeight('【提示】', contentWidth, lineHeight);
    currentY += this.measureTextHeight('• 合理布局武器位置', contentWidth, lineHeight);
    currentY += this.measureTextHeight('• 优先升级高价值武器', contentWidth, lineHeight);
    currentY += this.measureTextHeight('• 注意敌人的移动路径', contentWidth, lineHeight);
    
    this.ctx.restore();
    
    return currentY;
  }
  
  /**
   * 测量文本高度（考虑换行）
   */
  measureTextHeight(text, contentWidth, lineHeight) {
    if (!text || text.length === 0) {
      return lineHeight;
    }
    
    const words = text.split('');
    let line = '';
    let lineCount = 0;
    
    for (const char of words) {
      const testLine = line + char;
      const metrics = this.ctx.measureText(testLine);
      if (metrics.width > contentWidth && line.length > 0) {
        line = char;
        lineCount++;
      } else {
        line = testLine;
      }
    }
    
    if (line.length > 0) {
      lineCount++;
    }
    
    return lineCount * lineHeight;
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
    this.ctx.textBaseline = 'top';
    this.ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.TEXT_MAIN, 0.9);
    
    const previewSize = 50; // 预览图片尺寸
    const previewSpacing = 10; // 预览图片与文字的间距
    
    // 内容从 contentStartY 开始，减去滚动偏移
    let currentY = contentStartY - this.scrollY;
    
    // 绘制游戏目标
    currentY = this.drawTextSection(this.ctx, contentX, currentY, contentWidth, lineHeight, '【游戏目标】', '阻止敌人到达战场右端，保护基地！');
    currentY += lineHeight * 1.5;
    
    // 绘制操作说明
    currentY = this.drawTextSection(this.ctx, contentX, currentY, contentWidth, lineHeight, '【操作说明】', 
      '1. 拖拽武器卡片到战场放置防御塔\n2. 防御塔会自动攻击范围内的敌人\n3. 击败敌人获得金币，购买更多武器');
    currentY += lineHeight * 1.5;
    
    // 绘制武器类型（包含预览图片）
    currentY = this.drawTextSection(this.ctx, contentX, currentY, contentWidth, lineHeight, '【武器类型】', '');
    currentY += lineHeight * 0.5;
    
    const weapons = [
      { type: WeaponType.ROCKET, name: '火箭塔', desc: `追踪火箭，高爆溅射伤害\n射程：${RocketTowerConfig.ATTACK_RANGE}格 | 伤害：高 | 成本：${RocketTowerConfig.BASE_COST}金币` },
      { type: WeaponType.LASER, name: '激光塔', desc: `持续射线，高射速攻击\n射程：${LaserTowerConfig.ATTACK_RANGE}格 | 伤害：中 | 成本：${LaserTowerConfig.BASE_COST}金币` },
      { type: WeaponType.CANNON, name: '加农炮', desc: `直线炮弹，高爆伤害\n射程：${CannonTowerConfig.ATTACK_RANGE}格 | 伤害：很高 | 成本：${CannonTowerConfig.BASE_COST}金币` },
      { type: WeaponType.SNIPER, name: '狙击塔', desc: `快速子弹，超远射程\n射程：${SniperTowerConfig.ATTACK_RANGE}格 | 伤害：极高 | 成本：${SniperTowerConfig.BASE_COST}金币` }
    ];
    
    for (const weapon of weapons) {
      // 绘制武器预览图片
      const previewX = contentX + previewSize / 2;
      const previewY = currentY + previewSize / 2;
      this.drawWeaponPreview(this.ctx, previewX, previewY, weapon.type, previewSize);
      
      // 绘制武器名称和介绍（在预览图片右侧）
      const textX = contentX + previewSize + previewSpacing;
      currentY = this.drawTextSection(this.ctx, textX, currentY, contentWidth - previewSize - previewSpacing, lineHeight, weapon.name, weapon.desc);
      currentY += lineHeight * 1.2;
    }
    
    currentY += lineHeight * 0.5;
    
    // 绘制敌人类型（包含预览图片）
    currentY = this.drawTextSection(this.ctx, contentX, currentY, contentWidth, lineHeight, '【敌人类型】', '');
    currentY += lineHeight * 0.5;
    
    const enemies = [
      { name: '普通坦克', desc: `基础敌人\n生命：${EnemyTankConfig.MAX_HP} | 速度：中等 | 奖励：${EnemyTankConfig.KILL_REWARD}金币`, size: EnemyTankConfig.SIZE, type: 'tank' },
      { name: '快速敌人', desc: `移动速度快\n生命：${FastEnemyConfig.MAX_HP} | 速度：快 | 奖励：${FastEnemyConfig.KILL_REWARD}金币`, size: FastEnemyConfig.SIZE, type: 'fast' },
      { name: '重型敌人', desc: `生命值高，移动慢\n生命：${HeavyEnemyConfig.MAX_HP} | 速度：慢 | 奖励：${HeavyEnemyConfig.KILL_REWARD}金币`, size: HeavyEnemyConfig.SIZE, type: 'heavy' },
      { name: '飞行敌人', desc: `可飞越障碍物\n生命：${FlyingEnemyConfig.MAX_HP} | 速度：中快 | 奖励：${FlyingEnemyConfig.KILL_REWARD}金币`, size: FlyingEnemyConfig.SIZE, type: 'flying' },
      { name: '自爆敌人', desc: `死亡时爆炸造成范围伤害\n生命：${BomberEnemyConfig.MAX_HP} | 速度：中 | 奖励：${BomberEnemyConfig.KILL_REWARD}金币`, size: BomberEnemyConfig.SIZE, type: 'bomber' }
    ];
    
    for (const enemy of enemies) {
      // 绘制敌人预览图片
      const previewX = contentX + previewSize / 2;
      const previewY = currentY + previewSize / 2;
      this.drawEnemyPreview(this.ctx, previewX, previewY, enemy.size, previewSize, enemy.type);
      
      // 绘制敌人名称和介绍（在预览图片右侧）
      const textX = contentX + previewSize + previewSpacing;
      currentY = this.drawTextSection(this.ctx, textX, currentY, contentWidth - previewSize - previewSpacing, lineHeight, enemy.name, enemy.desc);
      currentY += lineHeight * 1.2;
    }
    
    currentY += lineHeight * 0.5;
    
    // 绘制提示
    currentY = this.drawTextSection(this.ctx, contentX, currentY, contentWidth, lineHeight, '【提示】', 
      '• 合理布局武器位置\n• 优先升级高价值武器\n• 注意敌人的移动路径');
    
    // 恢复裁剪区域
    this.ctx.restore();
    
    // 绘制关闭按钮（使用缓存）
    const closeBtnY = panelY + panelHeight * 0.88;
    HelpScreen.renderButtonFromCache(this.ctx, windowWidth / 2, closeBtnY);
  }
  
  /**
   * 绘制文本段落（标题+内容）
   */
  drawTextSection(ctx, x, y, width, lineHeight, title, content) {
    ctx.save();
    
    // 绘制标题
    if (title) {
      ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_TOWER, 0.9);
      ctx.font = `bold ${UIConfig.SUBTITLE_FONT_SIZE * 0.9}px Arial`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      const titleLines = this.wrapText(ctx, title, width);
      let currentY = y;
      for (const line of titleLines) {
        ctx.fillText(line, x, currentY);
        currentY += lineHeight;
      }
      y = currentY + lineHeight * 0.3;
    }
    
    // 绘制内容
    if (content) {
      ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.TEXT_MAIN, 0.85);
      ctx.font = `${UIConfig.SUBTITLE_FONT_SIZE * 0.9}px Arial`;
      
      const contentLines = content.split('\n');
      let currentY = y;
      for (const line of contentLines) {
        if (line.startsWith('•')) {
          ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_TOWER, 0.8);
        } else {
          ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.TEXT_MAIN, 0.85);
        }
        
        const wrappedLines = this.wrapText(ctx, line, width);
        for (const wrappedLine of wrappedLines) {
          ctx.fillText(wrappedLine, x, currentY);
          currentY += lineHeight;
        }
      }
      y = currentY;
    }
    
    ctx.restore();
    return y;
  }
  
  /**
   * 文本换行
   */
  wrapText(ctx, text, maxWidth) {
    if (!text || text.length === 0) {
      return [];
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
    
    return lines;
  }
  
  /**
   * 绘制武器预览图片
   */
  drawWeaponPreview(ctx, x, y, weaponType, size) {
    polyfillRoundRect(ctx);
    ctx.save();
    
    // 绘制背景框
    ctx.fillStyle = ColorUtils.hexToCanvas(0x1a1a2e, 0.8);
    ctx.beginPath();
    ctx.roundRect(x - size / 2 - 2, y - size / 2 - 2, size + 4, size + 4, 4);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.5);
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // 绘制武器图标
    ctx.translate(x, y);
    WeaponRenderer.renderWeaponIcon(ctx, 0, 0, weaponType, size * 0.8);
    
    ctx.restore();
  }
  
  /**
   * 绘制敌人预览图片
   */
  drawEnemyPreview(ctx, x, y, enemySize, previewSize, enemyType = 'tank') {
    polyfillRoundRect(ctx);
    ctx.save();
    
    // 绘制背景框
    ctx.fillStyle = ColorUtils.hexToCanvas(0x1a1a2e, 0.8);
    ctx.beginPath();
    ctx.roundRect(x - previewSize / 2 - 2, y - previewSize / 2 - 2, previewSize + 4, previewSize + 4, 4);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.5);
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // 绘制敌人图标（使用实际尺寸的比例）
    const scale = previewSize / enemySize;
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // 根据敌人类型调用不同的渲染方法
    switch (enemyType) {
      case 'tank':
        EnemyRenderer.renderEnemyTank(ctx, 0, 0, enemySize, 0);
        break;
      case 'fast':
        EnemyRenderer.renderFastEnemy(ctx, 0, 0, enemySize, 0);
        break;
      case 'heavy':
        EnemyRenderer.renderHeavyEnemy(ctx, 0, 0, enemySize, 0);
        break;
      case 'flying':
        EnemyRenderer.renderFlyingEnemy(ctx, 0, 0, enemySize, 0);
        break;
      case 'bomber':
        EnemyRenderer.renderBomberEnemy(ctx, 0, 0, enemySize, 0);
        break;
      default:
        EnemyRenderer.renderEnemyTank(ctx, 0, 0, enemySize, 0);
    }
    
    ctx.restore();
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
