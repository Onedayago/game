/**
 * 金币管理器
 * 负责管理游戏货币系统和顶部UI显示
 * 
 * 主要功能：
 * - 金币数量显示和管理
 * - 小地图显示（显示敌人、武器和视口位置）
 * - 波次信息显示
 * - 小地图交互（点击/拖动快速定位）
 * - 支持响应式布局
 * 
 * UI布局：
 * ┌────────────────────────────────────┐
 * │ 💰金币  波次信息      [小地图]    │
 * └────────────────────────────────────┘
 */

import { Graphics, Text } from 'pixi.js';
import {
  INITIAL_GOLD,
  COLORS,
  GOLD_TEXT_FONT_SIZE,
  GOLD_TEXT_PADDING_X,
  MINIMAP_HEIGHT_PADDING,
  MINIMAP_HORIZONTAL_MARGIN,
  MINIMAP_VERTICAL_MARGIN,
  MINIMAP_CORNER_RADIUS,
  MINIMAP_BORDER_WIDTH,
  MINIMAP_ENEMY_DOT_RADIUS,
  MINIMAP_WEAPON_DOT_RADIUS,
  MINIMAP_VIEWPORT_STROKE_WIDTH,
  MINIMAP_VIEWPORT_COLOR,
  MINIMAP_VIEWPORT_ALPHA,
  WAVE_TEXT_FONT_SIZE,
  WAVE_TEXT_OFFSET_Y,
} from '../constants';
import { responsiveLayout } from '../app/ResponsiveLayout';

/**
 * 金币管理器类
 */
export class GoldManager {
  /**
   * 构造函数
   * @param {Application} app - PixiJS应用实例
   * @param {Container} worldContainer - 世界容器，用于小地图交互
   */
  constructor(app, worldContainer = null) {
    this.app = app;
    this.gold = 0;                          // 当前金币数量
    this.worldContainer = worldContainer;    // 世界容器引用
    this.isDraggingMinimap = false;         // 是否正在拖动小地图

    // 从响应式布局获取当前尺寸
    const layout = responsiveLayout.getLayout();
    
    // 顶部UI栏的尺寸
    const barHeight = layout.CELL_SIZE;  // 占用一行格子的高度
    const barWidth = layout.APP_WIDTH;
    const y = 0;

    // === 创建背景（霓虹赛博朋克风格） ===
    this.bg = new Graphics()
      .rect(0, y, barWidth, barHeight)
      .fill({ color: COLORS.UI_BG, alpha: 0.98 })
      // 顶部光晕条
      .rect(0, y, barWidth, 3)
      .fill({ color: COLORS.ALLY_BODY, alpha: 0.3 })
      // 底部光晕条
      .rect(0, y + barHeight - 3, barWidth, 3)
      .fill({ color: COLORS.UI_BORDER, alpha: 0.8 })
      .rect(0, y + barHeight - 1, barWidth, 1)
      .fill({ color: COLORS.ALLY_BODY, alpha: 0.6 });
    
    // === 创建金币图标 - 多层霓虹发光效果 ===
    const iconSize = GOLD_TEXT_FONT_SIZE * 1.2;
    const iconX = GOLD_TEXT_PADDING_X + iconSize;
    const iconY = y + barHeight / 2;
    this.goldIcon = new Graphics()
      // 外部光晕
      .circle(iconX, iconY, iconSize * 0.8)
      .fill({ color: COLORS.GOLD, alpha: 0.15 })
      .circle(iconX, iconY, iconSize * 0.65)
      .fill({ color: COLORS.GOLD, alpha: 0.25 })
      // 主体
      .circle(iconX, iconY, iconSize * 0.5)
      .fill({ color: COLORS.GOLD, alpha: 0.95 })
      .stroke({ width: 2, color: 0xfef3c7, alpha: 0.9 })
      // 内部高光
      .circle(iconX, iconY, iconSize * 0.25)
      .fill({ color: 0xfef3c7, alpha: 0.7 })
      .circle(iconX - iconSize * 0.15, iconY - iconSize * 0.15, iconSize * 0.12)
      .fill({ color: 0xffffff, alpha: 0.8 });

    // === 创建金币数量文本 ===
    this.text = new Text({
      text: '',
      style: {
        fill: COLORS.GOLD,
        fontSize: GOLD_TEXT_FONT_SIZE + 2,
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowColor: COLORS.GOLD,
        dropShadowBlur: 6,
        dropShadowDistance: 0,
      },
    });
    this.text.x = GOLD_TEXT_PADDING_X + iconSize * 2.2;
    this.text.y = y + barHeight / 2;
    this.text.anchor.set(0, 0.5);

    // 添加到舞台
    app.stage.addChild(this.bg);
    app.stage.addChild(this.goldIcon);
    app.stage.addChild(this.text);

    // ====== 缩略小地图（显示整个战场状态） ======
    // 小地图位置：放在顶部UI栏右上角
    this.minimapWidth = layout.MINIMAP_WIDTH;
    this.minimapHeight = Math.max(20, barHeight - MINIMAP_HEIGHT_PADDING);
    this.minimapX = layout.APP_WIDTH - this.minimapWidth - MINIMAP_HORIZONTAL_MARGIN;
    this.minimapY = MINIMAP_VERTICAL_MARGIN;

    // 世界战场的总高度（不包含底部武器容器区域）
    this.worldHeight = layout.BATTLE_HEIGHT;
    this.worldWidth = layout.WORLD_WIDTH;

    // 计算小地图与世界坐标的缩放比例
    this.minimapScaleX = this.minimapWidth / this.worldWidth;
    this.minimapScaleY = this.minimapHeight / this.worldHeight;

    // === 创建小地图背景 - 多层霓虹发光效果 ===
    this.minimapBg = new Graphics()
      // 外部光晕
      .roundRect(
        this.minimapX - 2,
        this.minimapY - 2,
        this.minimapWidth + 4,
        this.minimapHeight + 4,
        MINIMAP_CORNER_RADIUS + 2,
      )
      .fill({ color: COLORS.UI_BORDER, alpha: 0.2 })
      // 主背景
      .roundRect(
        this.minimapX,
        this.minimapY,
        this.minimapWidth,
        this.minimapHeight,
        MINIMAP_CORNER_RADIUS,
      )
      .fill({ color: COLORS.UI_BG, alpha: 0.95 })
      .stroke({ width: MINIMAP_BORDER_WIDTH, color: COLORS.UI_BORDER, alpha: 1 })
      // 内部光晕
      .roundRect(
        this.minimapX + 2,
        this.minimapY + 2,
        this.minimapWidth - 4,
        this.minimapHeight - 4,
        MINIMAP_CORNER_RADIUS - 2,
      )
      .stroke({ width: 1, color: COLORS.ALLY_BODY, alpha: 0.3 });
    this.minimapBg.eventMode = 'static';  // 可交互
    this.minimapBg.cursor = 'grab';       // 鼠标样式

    // 小地图内容层（显示敌人和武器点位）
    this.minimapContent = new Graphics();
    this.minimapContent.eventMode = 'none';  // 不响应交互

    // 小地图视口矩形（显示当前屏幕所在区域）
    this.minimapViewport = new Graphics();
    this.minimapViewport.eventMode = 'none';  // 不响应交互

    // 添加到舞台
    app.stage.addChild(this.minimapBg);
    app.stage.addChild(this.minimapContent);
    app.stage.addChild(this.minimapViewport);

    // === 创建波次信息文本 ===
    this.waveText = new Text({
      text: '',
      style: {
        fill: 0xf9fafb,
        fontSize: WAVE_TEXT_FONT_SIZE + 2,
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowColor: COLORS.ALLY_BODY,
        dropShadowBlur: 6,
        dropShadowDistance: 0,
      },
    });
    this.waveText.anchor.set(1, 0);
    this.waveText.position.set(
      this.minimapX - 8,
      this.minimapY + WAVE_TEXT_OFFSET_Y,
    );
    app.stage.addChild(this.waveText);

    // 初始化数值
    this.setGold(INITIAL_GOLD);
    this.setWaveInfo(1, 0, 1);

    // 注册小地图交互事件
    this.minimapBg.on('pointerdown', this.handleMinimapPointerDown, this);
    app.stage.on('pointermove', this.handleMinimapPointerMove, this);
    app.stage.on('pointerup', this.handleMinimapPointerUp, this);
    app.stage.on('pointerupoutside', this.handleMinimapPointerUp, this);
  }

  /**
   * 设置金币数量
   * @param {number} value - 金币数量
   */
  setGold(value) {
    this.gold = Math.max(0, Math.floor(value));
    this.updateText();
  }

  /**
   * 增加金币
   * @param {number} amount - 增加的金币数量
   */
  add(amount) {
    if (!amount) return;
    this.gold += amount;
    if (this.gold < 0) this.gold = 0;
    this.updateText();
  }

  /**
   * 检查是否有足够的金币
   * @param {number} amount - 需要的金币数量
   * @returns {boolean} 是否有足够金币
   */
  canAfford(amount) {
    return this.gold >= amount;
  }

  /**
   * 花费金币
   * @param {number} amount - 花费的金币数量
   * @returns {boolean} 是否成功花费
   */
  spend(amount) {
    if (amount <= 0) return true;
    if (this.gold < amount) return false;
    this.gold -= amount;
    this.updateText();
    return true;
  }

  /**
   * 更新金币显示文本
   */
  updateText() {
    this.text.text = `💰 ${this.gold}`;
  }

  /**
   * 更新小地图显示
   * 绘制敌人、武器和当前视口位置
   * 
   * @param {Array} enemies - 敌人数组
   * @param {Array} weapons - 武器数组
   * @param {Container} worldContainer - 世界容器
   */
  updateMiniMap(enemies = [], weapons = [], worldContainer = null) {
    if (!this.minimapContent || !this.minimapViewport) return;

    const g = this.minimapContent;
    g.clear();

    // === 绘制敌人点位（洋红色） ===
    enemies.forEach((enemy) => {
      if (!enemy || !enemy.sprite || enemy._dead || enemy._finished) return;
      const wx = enemy.sprite.x;
      const wy = enemy.sprite.y;
      const mx = this.minimapX + wx * this.minimapScaleX;
      const my = this.minimapY + wy * this.minimapScaleY;
      g.circle(mx, my, MINIMAP_ENEMY_DOT_RADIUS).fill({ color: COLORS.ENEMY_DETAIL, alpha: 1 });
    });

    // === 绘制我方武器点位（青色） ===
    weapons.forEach((weapon) => {
      if (!weapon || !weapon.turret) return;
      const wx = weapon.turret.x;
      const wy = weapon.turret.y;
      const mx = this.minimapX + wx * this.minimapScaleX;
      const my = this.minimapY + wy * this.minimapScaleY;
      g.circle(mx, my, MINIMAP_WEAPON_DOT_RADIUS).fill({ color: COLORS.ALLY_DETAIL, alpha: 1 });
    });

    // === 绘制当前屏幕视口矩形（白色边框） ===
    // 使用 worldContainer.x 确定可视区域在世界中的位置
    this.minimapViewport.clear();
    if (worldContainer) {
      const layout = responsiveLayout.getLayout();
      const worldLeft = -worldContainer.x; // 当前视口在世界中的左边界
      const worldWidthVisible = layout.APP_WIDTH;
      const vx =
        this.minimapX + worldLeft * this.minimapScaleX;
      const vy = this.minimapY;
      const vw = worldWidthVisible * this.minimapScaleX;
      const vh = this.minimapHeight;

      this.minimapViewport
        .rect(vx, vy, vw, vh)
        .stroke({
          width: MINIMAP_VIEWPORT_STROKE_WIDTH,
          color: MINIMAP_VIEWPORT_COLOR,
          alpha: MINIMAP_VIEWPORT_ALPHA,
        });
    }
  }

  /**
   * 设置波次信息显示
   * @param {number} wave - 当前波次
   * @param {number} timeLeftMS - 距离下一波的剩余时间（毫秒）
   * @param {number} durationMS - 每波持续时间（毫秒）
   */
  setWaveInfo(wave = 1, timeLeftMS = 0, durationMS = 1) {
    if (!this.waveText) return;
    const safeDuration = Math.max(1, durationMS);
    const nextSeconds = Math.max(0, Math.ceil(timeLeftMS / 1000));
    const progress = 1 - Math.min(1, Math.max(0, timeLeftMS / safeDuration));
    this.waveText.text = `⚡ 第 ${wave} 波   下波 ${nextSeconds}s ⚡`;
    // 随波次进度改变透明度（产生呼吸效果）
    this.waveText.alpha = 0.85 + progress * 0.15;
  }

  /**
   * 处理小地图点击事件
   * @param {PointerEvent} event - 指针事件
   */
  handleMinimapPointerDown(event) {
    this.isDraggingMinimap = true;
    this.minimapBg.cursor = 'grabbing';  // 改变鼠标样式
    this.updateWorldFromMinimap(event);
  }

  /**
   * 处理小地图指针移动事件
   * @param {PointerEvent} event - 指针事件
   */
  handleMinimapPointerMove(event) {
    if (!this.isDraggingMinimap) return;
    this.updateWorldFromMinimap(event);
  }

  /**
   * 处理小地图指针抬起事件
   */
  handleMinimapPointerUp() {
    if (!this.isDraggingMinimap) return;
    this.isDraggingMinimap = false;
    this.minimapBg.cursor = 'grab';  // 恢复鼠标样式
  }

  /**
   * 根据小地图点击位置更新世界视图
   * 实现点击小地图快速定位功能
   * 
   * @param {PointerEvent} event - 指针事件
   */
  updateWorldFromMinimap(event) {
    if (!this.worldContainer) return;
    
    const layout = responsiveLayout.getLayout();
    
    // 获取点击位置相对于小地图的X坐标
    const globalX = event.global.x;
    const localX = globalX - this.minimapX;
    
    // 限制在小地图范围内
    const clampedX = Math.min(Math.max(localX, 0), this.minimapWidth);
    
    // 归一化到 [0, 1] 范围
    const normalized = clampedX / this.minimapWidth;

    // 计算世界坐标
    const worldVisibleWidth = layout.APP_WIDTH;
    const maxWorldLeft = Math.max(0, layout.WORLD_WIDTH - worldVisibleWidth);
    
    // 计算期望的世界左边界（点击位置居中）
    const desiredLeft = Math.min(
      Math.max(normalized * layout.WORLD_WIDTH - worldVisibleWidth / 2, 0),
      maxWorldLeft,
    );

    // 更新世界容器位置
    this.worldContainer.x = -desiredLeft;
  }

  /**
   * 响应尺寸变化
   * 重新计算小地图位置和尺寸
   * @param {Object} layout - 新的布局参数
   */
  onResize(layout) {
    const barHeight = layout.CELL_SIZE;
    const barWidth = layout.APP_WIDTH;
    
    // 更新背景
    this.bg.clear();
    this.bg.rect(0, 0, barWidth, barHeight)
      .fill({ color: COLORS.UI_BG, alpha: 0.98 })
      .rect(0, 0, barWidth, 3)
      .fill({ color: COLORS.ALLY_BODY, alpha: 0.3 })
      .rect(0, barHeight - 3, barWidth, 3)
      .fill({ color: COLORS.UI_BORDER, alpha: 0.8 })
      .rect(0, barHeight - 1, barWidth, 1)
      .fill({ color: COLORS.ALLY_BODY, alpha: 0.6 });
    
    // 更新小地图尺寸和位置
    this.minimapWidth = layout.MINIMAP_WIDTH;
    this.minimapHeight = Math.max(20, barHeight - MINIMAP_HEIGHT_PADDING);
    this.minimapX = layout.APP_WIDTH - this.minimapWidth - MINIMAP_HORIZONTAL_MARGIN;
    this.worldHeight = layout.BATTLE_HEIGHT;
    this.worldWidth = layout.WORLD_WIDTH;
    this.minimapScaleX = this.minimapWidth / this.worldWidth;
    this.minimapScaleY = this.minimapHeight / this.worldHeight;
    
    // 重绘小地图背景
    this.minimapBg.clear();
    this.minimapBg
      .roundRect(
        this.minimapX - 2,
        this.minimapY - 2,
        this.minimapWidth + 4,
        this.minimapHeight + 4,
        MINIMAP_CORNER_RADIUS + 2,
      )
      .fill({ color: COLORS.UI_BORDER, alpha: 0.2 })
      .roundRect(
        this.minimapX,
        this.minimapY,
        this.minimapWidth,
        this.minimapHeight,
        MINIMAP_CORNER_RADIUS,
      )
      .fill({ color: COLORS.UI_BG, alpha: 0.95 })
      .stroke({ width: MINIMAP_BORDER_WIDTH, color: COLORS.UI_BORDER, alpha: 1 })
      .roundRect(
        this.minimapX + 2,
        this.minimapY + 2,
        this.minimapWidth - 4,
        this.minimapHeight - 4,
        MINIMAP_CORNER_RADIUS - 2,
      )
      .stroke({ width: 1, color: COLORS.ALLY_BODY, alpha: 0.3 });
    
    // 更新波次文本位置
    this.waveText.position.set(
      this.minimapX - 8,
      this.minimapY + WAVE_TEXT_OFFSET_Y,
    );
  }
}


