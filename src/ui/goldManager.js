import { Graphics, Text } from 'pixi.js';
import {
  APP_WIDTH,
  APP_HEIGHT,
  CELL_SIZE,
  INITIAL_GOLD,
  WORLD_WIDTH,
  COLORS,
  BATTLE_HEIGHT,
  GOLD_TEXT_FONT_SIZE,
  GOLD_TEXT_PADDING_X,
  MINIMAP_WIDTH,
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

export class GoldManager {
  constructor(app, worldContainer = null) {
    this.app = app;
    this.gold = 0;
    this.worldContainer = worldContainer;
    this.isDraggingMinimap = false;

    const barHeight = CELL_SIZE; // 占用一行格子的高度
    const barWidth = APP_WIDTH;
    const y = 0;

    // 背景（霓虹渐变效果）
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
    
    // 金币图标 - 霓虹效果
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

    app.stage.addChild(this.bg);
    app.stage.addChild(this.goldIcon);
    app.stage.addChild(this.text);

    // ====== 缩略小地图（显示整个战场状态） ======
    // 小地图尺寸：放在金币条右上角区域
    this.minimapWidth = MINIMAP_WIDTH;
    this.minimapHeight = Math.max(20, barHeight - MINIMAP_HEIGHT_PADDING);
    this.minimapX = APP_WIDTH - this.minimapWidth - MINIMAP_HORIZONTAL_MARGIN;
    this.minimapY = MINIMAP_VERTICAL_MARGIN;

    // 世界战场的总高度（不包含底部武器容器区域）
    this.worldHeight = BATTLE_HEIGHT;

    this.minimapScaleX = this.minimapWidth / WORLD_WIDTH;
    this.minimapScaleY = this.minimapHeight / this.worldHeight;

    // 小地图背景 - 霓虹效果
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
    this.minimapBg.eventMode = 'static';
    this.minimapBg.cursor = 'grab';

    // 小地图内容层（敌人 / 武器点位）
    this.minimapContent = new Graphics();
    this.minimapContent.eventMode = 'none';

    // 小地图视口矩形（当前屏幕所在区域）
    this.minimapViewport = new Graphics();
    this.minimapViewport.eventMode = 'none';

    app.stage.addChild(this.minimapBg);
    app.stage.addChild(this.minimapContent);
    app.stage.addChild(this.minimapViewport);

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

    this.setGold(INITIAL_GOLD);
    this.setWaveInfo(1, 0, 1);

    this.minimapBg.on('pointerdown', this.handleMinimapPointerDown, this);
    app.stage.on('pointermove', this.handleMinimapPointerMove, this);
    app.stage.on('pointerup', this.handleMinimapPointerUp, this);
    app.stage.on('pointerupoutside', this.handleMinimapPointerUp, this);
  }

  setGold(value) {
    this.gold = Math.max(0, Math.floor(value));
    this.updateText();
  }

  add(amount) {
    if (!amount) return;
    this.gold += amount;
    if (this.gold < 0) this.gold = 0;
    this.updateText();
  }

  canAfford(amount) {
    return this.gold >= amount;
  }

  spend(amount) {
    if (amount <= 0) return true;
    if (this.gold < amount) return false;
    this.gold -= amount;
    this.updateText();
    return true;
  }

  updateText() {
    this.text.text = `💰 ${this.gold}`;
  }

  /**
   * 更新右上角缩略小地图：
   * - 敌人：橙色小点
   * - 我方武器：绿色小点
   * - 当前屏幕视口：白色描边矩形
   */
  updateMiniMap(enemies = [], weapons = [], worldContainer = null) {
    if (!this.minimapContent || !this.minimapViewport) return;

    const g = this.minimapContent;
    g.clear();

    // 敌人点位（橙色）
    enemies.forEach((enemy) => {
      if (!enemy || !enemy.sprite || enemy._dead || enemy._finished) return;
      const wx = enemy.sprite.x;
      const wy = enemy.sprite.y;
      const mx = this.minimapX + wx * this.minimapScaleX;
      const my = this.minimapY + wy * this.minimapScaleY;
      g.circle(mx, my, MINIMAP_ENEMY_DOT_RADIUS).fill({ color: COLORS.ENEMY_DETAIL, alpha: 1 });
    });

    // 我方武器点位（绿色）
    weapons.forEach((weapon) => {
      if (!weapon || !weapon.turret) return;
      const wx = weapon.turret.x;
      const wy = weapon.turret.y;
      const mx = this.minimapX + wx * this.minimapScaleX;
      const my = this.minimapY + wy * this.minimapScaleY;
      g.circle(mx, my, MINIMAP_WEAPON_DOT_RADIUS).fill({ color: COLORS.ALLY_DETAIL, alpha: 1 });
    });

    // 当前屏幕视口矩形（使用 worldContainer.x 确定可视区域）
    this.minimapViewport.clear();
    if (worldContainer) {
      const worldLeft = -worldContainer.x; // 当前视口在世界中的左边界
      const worldWidthVisible = APP_WIDTH;
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

  setWaveInfo(wave = 1, timeLeftMS = 0, durationMS = 1) {
    if (!this.waveText) return;
    const safeDuration = Math.max(1, durationMS);
    const nextSeconds = Math.max(0, Math.ceil(timeLeftMS / 1000));
    const progress = 1 - Math.min(1, Math.max(0, timeLeftMS / safeDuration));
    this.waveText.text = `⚡ 第 ${wave} 波   下波 ${nextSeconds}s ⚡`;
    this.waveText.alpha = 0.85 + progress * 0.15;
  }

  handleMinimapPointerDown(event) {
    this.isDraggingMinimap = true;
    this.minimapBg.cursor = 'grabbing';
    this.updateWorldFromMinimap(event);
  }

  handleMinimapPointerMove(event) {
    if (!this.isDraggingMinimap) return;
    this.updateWorldFromMinimap(event);
  }

  handleMinimapPointerUp() {
    if (!this.isDraggingMinimap) return;
    this.isDraggingMinimap = false;
    this.minimapBg.cursor = 'grab';
  }

  updateWorldFromMinimap(event) {
    if (!this.worldContainer) return;
    const globalX = event.global.x;
    const localX = globalX - this.minimapX;
    const clampedX = Math.min(Math.max(localX, 0), this.minimapWidth);
    const normalized = clampedX / this.minimapWidth;

    const worldVisibleWidth = APP_WIDTH;
    const maxWorldLeft = Math.max(0, WORLD_WIDTH - worldVisibleWidth);
    const desiredLeft = Math.min(
      Math.max(normalized * WORLD_WIDTH - worldVisibleWidth / 2, 0),
      maxWorldLeft,
    );

    this.worldContainer.x = -desiredLeft;
  }
}


