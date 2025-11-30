import { Graphics, Text } from 'pixi.js';
import {
  APP_WIDTH,
  APP_HEIGHT,
  CELL_SIZE,
  TANK_SIZE,
  TANK_COLOR,
  TANK_BARREL_COLOR,
  WEAPON_CONTAINER_WIDTH,
  WEAPON_CONTAINER_HEIGHT,
  WEAPON_CONTAINER_MARGIN_BOTTOM,
  WEAPON_CONTAINER_BG_COLOR,
  WEAPON_CONTAINER_BORDER_COLOR,
  WEAPON_CONTAINER_BORDER_WIDTH,
  WEAPON_BASE_COST,
  WEAPON_UPGRADE_BASE_COST,
  WEAPON_SELL_BASE_GAIN,
  WORLD_WIDTH,
  ROCKET_BASE_COST,
  LASER_BASE_COST,
  LASER_UPGRADE_BASE_COST,
  LASER_SELL_BASE_GAIN,
  COLORS,
  BATTLE_ROWS,
  BATTLE_HEIGHT,
  ACTION_BUTTON_WIDTH,
  ACTION_BUTTON_HEIGHT,
  ACTION_BUTTON_RADIUS,
  ACTION_BUTTON_FONT_SIZE,
  ACTION_BUTTON_STROKE_WIDTH,
} from '../constants';
import { TankWeapon } from '../entities/weapons/tankWeapon';
import { RocketTower } from '../entities/weapons/rocketTower';
import { LaserTower } from '../entities/weapons/laserTower';

export class WeaponContainer {
  constructor(app, goldManager) {
    this.app = app;
    this.goldManager = goldManager;
    this.weapons = [];
    this.dragSprite = null;
    this.dragType = 'tank'; // 'tank' | 'rocket' | 'laser'
    this.selectedWeapon = null;
    this.upgradeButton = null;
    this.sellButton = null;
    this.upgradeLabel = null;
    this.sellLabel = null;
    
    this.createContainer();
    this.setupStageEvents();

    this.createActionButtons();

    this.handleKeyDown = this.onKeyDown.bind(this);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  createActionButtons() {
    const buttonWidth = ACTION_BUTTON_WIDTH;
    const buttonHeight = ACTION_BUTTON_HEIGHT;
    const radius = ACTION_BUTTON_RADIUS;

    // 升级按钮 - 霓虹绿色主题
    this.upgradeButton = new Graphics()
      // 外部光晕
      .roundRect(-buttonWidth / 2 - 2, -buttonHeight / 2 - 2, buttonWidth + 4, buttonHeight + 4, radius + 2)
      .fill({ color: COLORS.SUCCESS, alpha: 0.2 })
      // 主体
      .roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, radius)
      .fill({ color: COLORS.SUCCESS, alpha: 0.9 })
      .stroke({ width: ACTION_BUTTON_STROKE_WIDTH, color: COLORS.SUCCESS, alpha: 1 })
      // 内部高光
      .roundRect(-buttonWidth / 2 + 2, -buttonHeight / 2 + 2, buttonWidth - 4, buttonHeight - 4, radius - 2)
      .stroke({ width: 1, color: 0xffffff, alpha: 0.4 });

    this.upgradeLabel = new Text({
      text: '⬆️ 升级',
      style: {
        fill: COLORS.TEXT_MAIN,
        fontSize: ACTION_BUTTON_FONT_SIZE,
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowColor: COLORS.SUCCESS,
        dropShadowBlur: 4,
        dropShadowDistance: 0,
      },
    });
    this.upgradeLabel.anchor.set(0.5);
    this.upgradeButton.addChild(this.upgradeLabel);

    this.upgradeButton.eventMode = 'static';
    this.upgradeButton.cursor = 'pointer';
    this.upgradeButton.visible = false;
    
    // Hover效果
    this.upgradeButton.on('pointerover', () => {
      this.upgradeButton.alpha = 1.2;
    });
    this.upgradeButton.on('pointerout', () => {
      this.upgradeButton.alpha = 1;
    });
    this.upgradeButton.on('pointerdown', (event) => {
      if (event && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
      }
      if (!this.selectedWeapon || !this.selectedWeapon.upgrade) return;

      const level = this.selectedWeapon.level ?? 1;
      const maxLevel = this.selectedWeapon.maxLevel ?? 1;
      if (level >= maxLevel) return;

      // 根据武器类型确定升级成本
      let upgradeBaseCost = WEAPON_UPGRADE_BASE_COST;
      if (this.selectedWeapon instanceof RocketTower) {
        upgradeBaseCost = ROCKET_UPGRADE_BASE_COST;
      } else if (this.selectedWeapon instanceof LaserTower) {
        upgradeBaseCost = LASER_UPGRADE_BASE_COST;
      }
      
      const upgradeCost = level * upgradeBaseCost;
      // 点击按钮升级同样要走金币扣除逻辑
      if (!this.goldManager || this.goldManager.spend(upgradeCost)) {
        this.selectedWeapon.upgrade();
        // 升级后立刻刷新按钮状态（可能达到满级，需要隐藏升级按钮）
        this.updateActionButtonsForSelection();
      }
    });

    // 卖掉按钮 - 霓虹红色主题
    this.sellButton = new Graphics()
      // 外部光晕
      .roundRect(-buttonWidth / 2 - 2, -buttonHeight / 2 - 2, buttonWidth + 4, buttonHeight + 4, radius + 2)
      .fill({ color: COLORS.DANGER, alpha: 0.2 })
      // 主体
      .roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, radius)
      .fill({ color: COLORS.DANGER, alpha: 0.9 })
      .stroke({ width: ACTION_BUTTON_STROKE_WIDTH, color: COLORS.DANGER, alpha: 1 })
      // 内部高光
      .roundRect(-buttonWidth / 2 + 2, -buttonHeight / 2 + 2, buttonWidth - 4, buttonHeight - 4, radius - 2)
      .stroke({ width: 1, color: 0xffffff, alpha: 0.4 });

    this.sellLabel = new Text({
      text: '💰 出售',
      style: {
        fill: COLORS.TEXT_MAIN,
        fontSize: ACTION_BUTTON_FONT_SIZE,
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowColor: COLORS.DANGER,
        dropShadowBlur: 4,
        dropShadowDistance: 0,
      },
    });
    this.sellLabel.anchor.set(0.5);
    this.sellButton.addChild(this.sellLabel);

    this.sellButton.eventMode = 'static';
    this.sellButton.cursor = 'pointer';
    this.sellButton.visible = false;
    
    // Hover效果
    this.sellButton.on('pointerover', () => {
      this.sellButton.alpha = 1.2;
    });
    this.sellButton.on('pointerout', () => {
      this.sellButton.alpha = 1;
    });
    
    this.sellButton.on('pointerdown', (event) => {
      if (event && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
      }
      this.sellSelectedWeapon();
    });

    this.app.stage.addChild(this.upgradeButton);
    this.app.stage.addChild(this.sellButton);
  }

  createContainer() {
    const width = WEAPON_CONTAINER_WIDTH;
    const height = WEAPON_CONTAINER_HEIGHT;
    const centerX = APP_WIDTH / 2;
    const centerY = APP_HEIGHT - WEAPON_CONTAINER_MARGIN_BOTTOM - height / 2;

    // 霓虹外光晕
    const glowRadius = 16;
    const glowColor = COLORS.ALLY_BODY;

    this.background = new Graphics()
      // 外部光晕层
      .roundRect(-width / 2 - glowRadius, -height / 2 - glowRadius, 
                 width + glowRadius * 2, height + glowRadius * 2, 20)
      .fill({ color: glowColor, alpha: 0.08 })
      .roundRect(-width / 2 - glowRadius / 2, -height / 2 - glowRadius / 2, 
                 width + glowRadius, height + glowRadius, 18)
      .fill({ color: glowColor, alpha: 0.12 })
      // 边框
      .roundRect(-width / 2, -height / 2, width, height, 16)
      .fill({ color: WEAPON_CONTAINER_BG_COLOR, alpha: 0.95 })
      .stroke({ width: WEAPON_CONTAINER_BORDER_WIDTH + 2, color: glowColor, alpha: 0.6 })
      .stroke({ width: WEAPON_CONTAINER_BORDER_WIDTH, color: WEAPON_CONTAINER_BORDER_COLOR, alpha: 0.9 })
      // 内部光晕边框
      .roundRect(-width / 2 + 4, -height / 2 + 4, width - 8, height - 8, 14)
      .stroke({ width: 1, color: glowColor, alpha: 0.4 })
      // 顶部装饰条
      .roundRect(-width / 2 + 12, -height / 2 + 12, width - 24, height * 0.08, 8)
      .fill({ color: glowColor, alpha: 0.15 });

    this.background.x = centerX;
    this.background.y = centerY;
    this.background.eventMode = 'none';

    // 内层玻璃效果
    this.innerGlass = new Graphics()
      .roundRect(-width / 2 + 10, -height / 2 + 10, width - 20, height - 20, 18)
      .fill({ color: 0x0f172a, alpha: 0.85 })
      .stroke({ width: 1, color: 0x1f2937, alpha: 0.8 });
    this.innerGlass.x = centerX;
    this.innerGlass.y = centerY;
    this.innerGlass.eventMode = 'none';

    // 顶部标题 - 添加霓虹效果
    this.header = new Text({
      text: '⚔️ 武器库 ⚔️',
      style: {
        fill: 0xf9fafb,
        fontSize: 22,
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowColor: glowColor,
        dropShadowBlur: 8,
        dropShadowDistance: 0,
      },
    });
    this.header.anchor.set(0.5, 0.5);
    this.header.position.set(centerX, centerY - height / 2 + 32);

    this.subHeader = new Text({
      text: '点击图标拖拽部署武器  |  点击武器进行升级/出售',
      style: {
        fill: COLORS.TEXT_SUB,
        fontSize: 12,
        dropShadow: true,
        dropShadowColor: 0x000000,
        dropShadowBlur: 4,
        dropShadowDistance: 1,
      },
    });
    this.subHeader.anchor.set(0.5, 0);
    this.subHeader.position.set(centerX, centerY - height / 2 + 52);

    // 三列卡片布局
    const cardWidth = width / 3 - 20;
    const cardHeight = height - 72;
    const cardPadding = 18;
    const iconAreaWidth = TANK_SIZE * 1.6;
    const textAreaWidth = cardWidth - iconAreaWidth - cardPadding * 2;
    const cardSpacing = 14;
    
    // 左侧坦克卡片（青色主题）
    const tankColor = COLORS.ALLY_BODY;
    this.leftCard = new Graphics()
      // 外部光晕
      .roundRect(-cardWidth / 2 - 3, -cardHeight / 2 - 3, cardWidth + 6, cardHeight + 6, 16)
      .fill({ color: tankColor, alpha: 0.12 })
      // 边框
      .roundRect(-cardWidth / 2 - 2, -cardHeight / 2 - 2, cardWidth + 4, cardHeight + 4, 15)
      .stroke({ width: 2, color: tankColor, alpha: 0.4 })
      // 主背景
      .roundRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 14)
      .fill({ color: 0x111827, alpha: 0.9 })
      .stroke({ width: 2, color: 0x0a1929, alpha: 0.6 })
      // 内部光晕
      .roundRect(-cardWidth / 2 + 2, -cardHeight / 2 + 2, cardWidth - 4, cardHeight - 4, 12)
      .stroke({ width: 1, color: tankColor, alpha: 0.35 })
      // 顶部装饰条
      .roundRect(-cardWidth / 2 + 8, -cardHeight / 2 + 8, cardWidth - 16, cardHeight * 0.15, 8)
      .fill({ color: tankColor, alpha: 0.15 });
    this.leftCard.x = centerX - cardWidth - cardSpacing;
    this.leftCard.y = centerY + 20;
    this.leftCard.eventMode = 'none';

    // 中间激光塔卡片（绿色主题）
    const laserColor = COLORS.LASER_BODY;
    this.middleCard = new Graphics()
      // 外部光晕
      .roundRect(-cardWidth / 2 - 3, -cardHeight / 2 - 3, cardWidth + 6, cardHeight + 6, 16)
      .fill({ color: laserColor, alpha: 0.12 })
      // 边框
      .roundRect(-cardWidth / 2 - 2, -cardHeight / 2 - 2, cardWidth + 4, cardHeight + 4, 15)
      .stroke({ width: 2, color: laserColor, alpha: 0.4 })
      // 主背景
      .roundRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 14)
      .fill({ color: 0x111827, alpha: 0.9 })
      .stroke({ width: 2, color: 0x0a1a0f, alpha: 0.6 })
      // 内部光晕
      .roundRect(-cardWidth / 2 + 2, -cardHeight / 2 + 2, cardWidth - 4, cardHeight - 4, 12)
      .stroke({ width: 1, color: laserColor, alpha: 0.35 })
      // 顶部装饰条
      .roundRect(-cardWidth / 2 + 8, -cardHeight / 2 + 8, cardWidth - 16, cardHeight * 0.15, 8)
      .fill({ color: laserColor, alpha: 0.15 });
    this.middleCard.x = centerX;
    this.middleCard.y = centerY + 20;
    this.middleCard.eventMode = 'none';

    // 右侧火箭塔卡片（紫色主题）
    const rocketColor = COLORS.ROCKET_BODY;
    this.rightCard = new Graphics()
      // 外部光晕
      .roundRect(-cardWidth / 2 - 3, -cardHeight / 2 - 3, cardWidth + 6, cardHeight + 6, 16)
      .fill({ color: rocketColor, alpha: 0.12 })
      // 边框
      .roundRect(-cardWidth / 2 - 2, -cardHeight / 2 - 2, cardWidth + 4, cardHeight + 4, 15)
      .stroke({ width: 2, color: rocketColor, alpha: 0.4 })
      // 主背景
      .roundRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 14)
      .fill({ color: 0x111827, alpha: 0.9 })
      .stroke({ width: 2, color: 0x1a0a29, alpha: 0.6 })
      // 内部光晕
      .roundRect(-cardWidth / 2 + 2, -cardHeight / 2 + 2, cardWidth - 4, cardHeight - 4, 12)
      .stroke({ width: 1, color: rocketColor, alpha: 0.35 })
      // 顶部装饰条
      .roundRect(-cardWidth / 2 + 8, -cardHeight / 2 + 8, cardWidth - 16, cardHeight * 0.15, 8)
      .fill({ color: rocketColor, alpha: 0.15 });
    this.rightCard.x = centerX + cardWidth + cardSpacing;
    this.rightCard.y = centerY + 20;
    this.rightCard.eventMode = 'none';

    // 武器图标（显示在容器中间，可被拖拽）——与实际坦克造型保持一致（美化版）
    const hullRadius = TANK_SIZE * 0.24;
    const turretRadius = TANK_SIZE * 0.18;
    const barrelLength = TANK_SIZE * 0.75;
    const barrelHalfHeight = TANK_SIZE * 0.09;
    const trackHeight = TANK_SIZE * 0.22;

    this.icon = new Graphics();

    // 阴影
    this.icon
      .roundRect(
        -TANK_SIZE / 2 + 4,
        -TANK_SIZE / 2 + 6,
        TANK_SIZE - 8,
        TANK_SIZE - 4,
        hullRadius,
      )
      .fill({ color: 0x000000, alpha: 0.22 });

    // 上下履带
    this.icon
      .roundRect(
        -TANK_SIZE / 2,
        -TANK_SIZE / 2,
        TANK_SIZE,
        trackHeight,
        trackHeight / 2,
      )
      .fill({ color: 0x111827 })
      .roundRect(
        -TANK_SIZE / 2,
        TANK_SIZE / 2 - trackHeight,
        TANK_SIZE,
        trackHeight,
        trackHeight / 2,
      )
      .fill({ color: 0x111827 });

    // 简化轮子
    const wheelRadius = trackHeight * 0.32;
    const wheelCount = 4;
    for (let i = 0; i < wheelCount; i += 1) {
      const t = wheelCount === 1 ? 0.5 : i / (wheelCount - 1);
      const wx = -TANK_SIZE / 2 + TANK_SIZE * (0.18 + 0.64 * t);
      const wyTop = -TANK_SIZE / 2 + trackHeight / 2;
      const wyBottom = TANK_SIZE / 2 - trackHeight / 2;
      this.icon.circle(wx, wyTop, wheelRadius).fill({ color: 0x1f2937 });
      this.icon.circle(wx, wyBottom, wheelRadius).fill({ color: 0x1f2937 });
    }

    // 主车体
    this.icon
      .roundRect(
        -TANK_SIZE / 2 + 6,
        -TANK_SIZE / 2 + trackHeight * 0.6,
        TANK_SIZE - 12,
        TANK_SIZE - trackHeight * 1.2,
        hullRadius,
      )
        .fill({ color: TANK_COLOR })
      .stroke({ width: 2, color: 0x15803d, alpha: 1 });

    // 装甲亮面与分割线
    this.icon
      .roundRect(
        -TANK_SIZE / 2 + 10,
        -TANK_SIZE / 2 + trackHeight * 0.8,
        TANK_SIZE - 20,
        TANK_SIZE - trackHeight * 1.6,
        hullRadius * 0.85,
      )
      .fill({ color: COLORS.ALLY_BODY_DARK, alpha: 0.75 })
      .rect(-TANK_SIZE / 2 + 12, 0, TANK_SIZE - 24, 2)
      .fill({ color: COLORS.ALLY_BODY_DARK, alpha: 0.45 });

    // 前灯
    const iconLightY = TANK_SIZE / 2 - trackHeight * 0.55;
    const iconLightRadius = TANK_SIZE * 0.08;
    this.icon
      .circle(-TANK_SIZE * 0.2, iconLightY, iconLightRadius)
      .fill({ color: COLORS.ALLY_DETAIL, alpha: 0.9 })
      .circle(TANK_SIZE * 0.2, iconLightY, iconLightRadius)
      .fill({ color: COLORS.ALLY_DETAIL, alpha: 0.9 });

    // 侧边防护条
    this.icon
      .roundRect(
        -TANK_SIZE / 2 + 8,
        -TANK_SIZE / 2 + trackHeight * 0.55,
        6,
        TANK_SIZE - trackHeight * 1.1,
        3,
      )
      .fill({ color: 0x0f172a, alpha: 0.4 })
      .roundRect(
        TANK_SIZE / 2 - 14,
        -TANK_SIZE / 2 + trackHeight * 0.55,
        6,
        TANK_SIZE - trackHeight * 1.1,
        3,
      )
      .fill({ color: 0x0f172a, alpha: 0.4 });

    // 炮塔 + 炮管
    this.icon
      .circle(0, -TANK_SIZE * 0.06, turretRadius * 1.05)
      .fill({ color: COLORS.ALLY_BARREL })
      .stroke({ width: 2, color: 0x0f172a, alpha: 0.6 })
      .circle(0, -TANK_SIZE * 0.06, turretRadius)
      .fill({ color: TANK_BARREL_COLOR })
      .stroke({ width: 2, color: COLORS.ALLY_BODY_DARK, alpha: 1 })
      .roundRect(
        -TANK_SIZE * 0.08,
        -TANK_SIZE * 0.16,
        TANK_SIZE * 0.16,
        TANK_SIZE * 0.32,
        TANK_SIZE * 0.04,
      )
      .fill({ color: COLORS.ALLY_DETAIL, alpha: 0.92 })
      .roundRect(0, -barrelHalfHeight, barrelLength, barrelHalfHeight * 2, barrelHalfHeight)
      .fill({ color: TANK_BARREL_COLOR })
      .stroke({ width: 2, color: 0x0f172a, alpha: 0.5 })
      .roundRect(
        barrelLength * 0.35,
        -barrelHalfHeight * 0.55,
        barrelLength * 0.45,
        barrelHalfHeight * 1.1,
        barrelHalfHeight * 0.45,
      )
      .fill({ color: COLORS.ALLY_BODY, alpha: 0.85 })
      .circle(barrelLength - barrelHalfHeight * 0.2, 0, barrelHalfHeight * 0.55)
      .fill({ color: COLORS.ALLY_DETAIL, alpha: 0.95 });

    const iconY = centerY + 8;
    const leftIconX = this.leftCard.x + cardWidth / 2 - iconAreaWidth / 2;
    
    // 添加图标背景光晕
    this.iconGlow = new Graphics()
      .circle(0, 0, TANK_SIZE * 0.65)
      .fill({ color: COLORS.ALLY_BODY, alpha: 0.15 })
      .circle(0, 0, TANK_SIZE * 0.55)
      .fill({ color: COLORS.ALLY_BODY, alpha: 0.1 })
      .circle(0, 0, TANK_SIZE * 0.5)
      .stroke({ width: 2, color: COLORS.ALLY_DETAIL, alpha: 0.4 })
      .circle(0, 0, TANK_SIZE * 0.45)
      .stroke({ width: 1, color: COLORS.ALLY_BODY, alpha: 0.3 });
    this.iconGlow.x = leftIconX;
    this.iconGlow.y = iconY;
    this.iconGlow.eventMode = 'none';
    
    this.icon.x = leftIconX;
    this.icon.y = iconY;
    this.icon.scale.x = -1;

    // 容器武器价格显示（使用该武器需要的金币）- 美化版
    this.iconPriceLabel = new Text({
      text: `💰 ${WEAPON_BASE_COST}`,
      style: {
        fill: COLORS.GOLD,
        fontSize: 16,
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowColor: COLORS.GOLD,
        dropShadowBlur: 4,
        dropShadowDistance: 0,
        },
      });
    this.iconPriceLabel.anchor.set(0, 0);
    this.iconPriceLabel.x = this.leftCard.x - cardWidth / 2 + cardPadding;
    this.iconPriceLabel.y = this.leftCard.y - cardHeight / 2 + cardPadding;

    this.iconDesc = new Text({
      text: '⚔️ 标准坦克·均衡射速\n适合前线压制敌军',
      style: {
        fill: COLORS.TEXT_SUB,
        fontSize: 13,
        lineHeight: 18,
        wordWrap: true,
        wordWrapWidth: textAreaWidth,
        dropShadow: true,
        dropShadowColor: 0x000000,
        dropShadowBlur: 2,
        dropShadowDistance: 1,
      },
    });
    this.iconDesc.anchor.set(0, 0);
    this.iconDesc.position.set(
      this.leftCard.x - cardWidth / 2 + cardPadding,
      this.iconPriceLabel.y + 26,
    );

    // 火箭塔图标（右侧）
    const rocketRadius = TANK_SIZE * 0.18;
    const rocketTrackHeight = TANK_SIZE * 0.24;
    const rocketBaseWidth = TANK_SIZE * 0.7;
    const rocketBaseHeight = TANK_SIZE * 0.24;
    const rocketTowerWidth = TANK_SIZE * 0.32;
    const rocketTowerHeight = TANK_SIZE * 0.78;

    this.rocketIcon = new Graphics();
    // 火箭塔底座
    this.rocketIcon
      .roundRect(
        -rocketBaseWidth / 2,
        TANK_SIZE * 0.18,
        rocketBaseWidth,
        rocketBaseHeight,
        TANK_SIZE * 0.12,
      )
      .fill({ color: 0x1f2937 })
      .stroke({ width: 2, color: 0x0f172a, alpha: 1 })
      .roundRect(
        -rocketBaseWidth / 2 + 6,
        TANK_SIZE * 0.18 + rocketBaseHeight * 0.2,
        rocketBaseWidth - 12,
        rocketBaseHeight * 0.45,
        rocketBaseHeight * 0.25,
      )
      .fill({ color: 0x475569, alpha: 0.9 });

    const iconStripeWidth = rocketBaseWidth / 5;
    for (let i = 0; i < 4; i += 1) {
      const sx = -rocketBaseWidth / 2 + 6 + i * iconStripeWidth;
      const color = i % 2 === 0 ? COLORS.ROCKET_DETAIL : 0x111827;
      this.rocketIcon
        .roundRect(
          sx,
          TANK_SIZE * 0.18 + rocketBaseHeight * 0.35,
          iconStripeWidth * 0.5,
          rocketBaseHeight * 0.4,
          iconStripeWidth * 0.2,
        )
        .fill({ color, alpha: 0.85 });
    }

    // 塔身
    this.rocketIcon
      .roundRect(
        -rocketTowerWidth / 2,
        -rocketTowerHeight / 2,
        rocketTowerWidth,
        rocketTowerHeight,
        TANK_SIZE * 0.12,
      )
      .fill({ color: 0x334155 })
      .stroke({ width: 2, color: 0x0ea5e9, alpha: 1 });

    // 塔身窗口
    const iconWindowWidth = rocketTowerWidth * 0.28;
    const iconWindowHeight = rocketTowerHeight * 0.16;
    for (let i = 0; i < 3; i += 1) {
      const wy = -rocketTowerHeight * 0.3 + i * iconWindowHeight * 1.2;
      this.rocketIcon
        .roundRect(
          -iconWindowWidth / 2,
          wy,
          iconWindowWidth,
          iconWindowHeight,
          iconWindowHeight * 0.4,
        )
        .fill({ color: COLORS.ALLY_DETAIL, alpha: 0.85 });
    }

    // 侧翼
    const iconFinWidth = rocketTowerWidth * 0.24;
    const iconFinHeight = rocketTowerHeight * 0.42;
    const iconFinOffsetX = rocketTowerWidth * 0.72;
    this.rocketIcon
      .roundRect(
        -iconFinOffsetX - iconFinWidth / 2,
        -iconFinHeight / 2,
        iconFinWidth,
        iconFinHeight,
        iconFinWidth * 0.5,
      )
      .fill({ color: COLORS.ROCKET_BODY, alpha: 0.9 })
      .roundRect(
        iconFinOffsetX - iconFinWidth / 2,
        -iconFinHeight / 2,
        iconFinWidth,
        iconFinHeight,
        iconFinWidth * 0.5,
      )
      .fill({ color: COLORS.ROCKET_BODY, alpha: 0.9 });

    // 导轨与火箭头
    this.rocketIcon
      .roundRect(
        -TANK_SIZE * 0.26,
        -TANK_SIZE * 0.10,
        TANK_SIZE * 0.52,
        rocketTrackHeight,
        rocketTrackHeight * 0.4,
      )
      .fill({ color: 0x0f172a })
      .circle(TANK_SIZE * 0.16, -TANK_SIZE * 0.02, rocketRadius)
      .fill({ color: COLORS.ROCKET_BULLET })
      .circle(0, -rocketTowerHeight * 0.5, rocketTowerWidth * 0.2)
      .fill({ color: 0xfef3c7, alpha: 0.95 });

    const middleIconX = this.middleCard.x + cardWidth / 2 - iconAreaWidth / 2;
    const rightIconX = this.rightCard.x + cardWidth / 2 - iconAreaWidth / 2;
    
    // 火箭塔图标背景光晕
    this.rocketIconGlow = new Graphics()
      .circle(0, 0, TANK_SIZE * 0.65)
      .fill({ color: COLORS.ROCKET_BODY, alpha: 0.15 })
      .circle(0, 0, TANK_SIZE * 0.55)
      .fill({ color: COLORS.ROCKET_BODY, alpha: 0.1 })
      .circle(0, 0, TANK_SIZE * 0.5)
      .stroke({ width: 2, color: COLORS.ROCKET_DETAIL, alpha: 0.4 })
      .circle(0, 0, TANK_SIZE * 0.45)
      .stroke({ width: 1, color: COLORS.ROCKET_BODY, alpha: 0.3 });
    this.rocketIconGlow.x = rightIconX;
    this.rocketIconGlow.y = iconY;
    this.rocketIconGlow.eventMode = 'none';
    
    this.rocketIcon.x = rightIconX;
    this.rocketIcon.y = iconY;
    this.rocketIcon.scale.x = -1;

    this.rocketPriceLabel = new Text({
      text: `💰 ${ROCKET_BASE_COST}`,
      style: {
        fill: COLORS.GOLD,
        fontSize: 16,
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowColor: COLORS.GOLD,
        dropShadowBlur: 4,
        dropShadowDistance: 0,
      },
    });
    this.rocketPriceLabel.anchor.set(0, 0);
    this.rocketPriceLabel.x = this.rightCard.x - cardWidth / 2 + cardPadding;
    this.rocketPriceLabel.y = this.rightCard.y - cardHeight / 2 + cardPadding;

    this.rocketDesc = new Text({
      text: '🚀 追踪火箭·高爆溅射\n有效打击集群敌人',
      style: {
        fill: COLORS.TEXT_SUB,
        fontSize: 13,
        lineHeight: 18,
        wordWrap: true,
        wordWrapWidth: textAreaWidth,
        dropShadow: true,
        dropShadowColor: 0x000000,
        dropShadowBlur: 2,
        dropShadowDistance: 1,
      },
    });
    this.rocketDesc.anchor.set(0, 0);
    this.rocketDesc.position.set(
      this.rocketPriceLabel.x,
      this.rocketPriceLabel.y + 26,
    );

    // 激光塔图标（中间）
    this.laserIcon = new Graphics();
    const towerRadius = TANK_SIZE * 0.20;
    const coreRadius = TANK_SIZE * 0.12;
    
    // 基座（六边形）
    const baseSize = TANK_SIZE * 0.4;
    const hexPoints = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      hexPoints.push(Math.cos(angle) * baseSize);
      hexPoints.push(Math.sin(angle) * baseSize);
    }
    this.laserIcon
      .poly(hexPoints)
      .fill({ color: COLORS.LASER_BODY, alpha: 0.9 })
      .stroke({ width: 2, color: COLORS.LASER_DETAIL, alpha: 0.7 });
    
    // 内层六边形装饰
    const innerHexPoints = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + Math.PI / 6;
      innerHexPoints.push(Math.cos(angle) * baseSize * 0.6);
      innerHexPoints.push(Math.sin(angle) * baseSize * 0.6);
    }
    this.laserIcon
      .poly(innerHexPoints)
      .fill({ color: 0x0a1a0f, alpha: 0.8 })
      .stroke({ width: 1, color: COLORS.LASER_DETAIL, alpha: 0.5 });
    
    // 中央能量核心（圆形发光）
    this.laserIcon
      .circle(0, 0, coreRadius * 1.6)
      .fill({ color: COLORS.LASER_DETAIL, alpha: 0.3 })
      .circle(0, 0, coreRadius * 1.2)
      .fill({ color: COLORS.LASER_DETAIL, alpha: 0.5 })
      .circle(0, 0, coreRadius)
      .fill({ color: COLORS.LASER_BEAM, alpha: 0.95 });
    
    // 顶部霓虹细节点（6个小光点）
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const dotX = Math.cos(angle) * baseSize * 0.75;
      const dotY = Math.sin(angle) * baseSize * 0.75;
      this.laserIcon
        .circle(dotX, dotY, 3)
        .fill({ color: COLORS.LASER_DETAIL, alpha: 0.8 });
    }
    
    // 激光发射器（4个小圆柱）
    const emitterDist = baseSize * 0.85;
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i;
      const emitX = Math.cos(angle) * emitterDist;
      const emitY = Math.sin(angle) * emitterDist;
      this.laserIcon
        .roundRect(emitX - 2, emitY - 4, 4, 8, 2)
        .fill({ color: COLORS.LASER_BEAM, alpha: 0.7 });
    }
    
    // 激光塔图标背景光晕
    this.laserIconGlow = new Graphics()
      .circle(0, 0, TANK_SIZE * 0.65)
      .fill({ color: COLORS.LASER_BODY, alpha: 0.15 })
      .circle(0, 0, TANK_SIZE * 0.55)
      .fill({ color: COLORS.LASER_BODY, alpha: 0.1 })
      .circle(0, 0, TANK_SIZE * 0.5)
      .stroke({ width: 2, color: COLORS.LASER_DETAIL, alpha: 0.4 })
      .circle(0, 0, TANK_SIZE * 0.45)
      .stroke({ width: 1, color: COLORS.LASER_BODY, alpha: 0.3 });
    this.laserIconGlow.x = middleIconX;
    this.laserIconGlow.y = iconY;
    this.laserIconGlow.eventMode = 'none';
    
    this.laserIcon.x = middleIconX;
    this.laserIcon.y = iconY;
    
    this.laserPriceLabel = new Text({
      text: `💰 ${LASER_BASE_COST}`,
      style: {
        fill: COLORS.GOLD,
        fontSize: 16,
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowColor: COLORS.GOLD,
        dropShadowBlur: 4,
        dropShadowDistance: 0,
      },
    });
    this.laserPriceLabel.anchor.set(0, 0);
    this.laserPriceLabel.x = this.middleCard.x - cardWidth / 2 + cardPadding;
    this.laserPriceLabel.y = this.middleCard.y - cardHeight / 2 + cardPadding;
    
    this.laserDesc = new Text({
      text: '⚡ 激光塔·持续射线\n高射速远距离攻击',
      style: {
        fill: COLORS.TEXT_SUB,
        fontSize: 13,
        lineHeight: 18,
        wordWrap: true,
        wordWrapWidth: textAreaWidth,
        dropShadow: true,
        dropShadowColor: 0x000000,
        dropShadowBlur: 2,
        dropShadowDistance: 1,
      },
    });
    this.laserDesc.anchor.set(0, 0);
    this.laserDesc.position.set(
      this.laserPriceLabel.x,
      this.laserPriceLabel.y + 26,
    );

    // 设置交互，作为拖拽起点
    this.icon.eventMode = 'static';
    this.icon.cursor = 'grab';
    
    // 添加hover效果
    this.icon.on('pointerover', () => {
      this.icon.alpha = 1;
      if (this.iconGlow) {
        this.iconGlow.alpha = 1.5;
      }
    });
    this.icon.on('pointerout', () => {
      this.icon.alpha = 1;
      if (this.iconGlow) {
        this.iconGlow.alpha = 1;
      }
    });
    
    this.icon.on('pointerdown', (event) => {
      const { x, y } = event.global;
      this.dragType = 'tank';
      this.startDrag(x, y);
    });

    this.rocketIcon.eventMode = 'static';
    this.rocketIcon.cursor = 'grab';
    
    // 添加hover效果
    this.rocketIcon.on('pointerover', () => {
      this.rocketIcon.alpha = 1;
      if (this.rocketIconGlow) {
        this.rocketIconGlow.alpha = 1.5;
      }
    });
    this.rocketIcon.on('pointerout', () => {
      this.rocketIcon.alpha = 1;
      if (this.rocketIconGlow) {
        this.rocketIconGlow.alpha = 1;
      }
    });
    
    this.rocketIcon.on('pointerdown', (event) => {
      const { x, y } = event.global;
      this.dragType = 'rocket';
      this.startDrag(x, y);
    });

    this.laserIcon.eventMode = 'static';
    this.laserIcon.cursor = 'grab';
    
    // 添加hover效果
    this.laserIcon.on('pointerover', () => {
      this.laserIcon.alpha = 1;
      if (this.laserIconGlow) {
        this.laserIconGlow.alpha = 1.5;
      }
    });
    this.laserIcon.on('pointerout', () => {
      this.laserIcon.alpha = 1;
      if (this.laserIconGlow) {
        this.laserIconGlow.alpha = 1;
      }
    });
    
    this.laserIcon.on('pointerdown', (event) => {
      const { x, y } = event.global;
      this.dragType = 'laser';
      this.startDrag(x, y);
    });

    this.app.stage.addChild(this.background);
    this.app.stage.addChild(this.innerGlass);
    this.app.stage.addChild(this.leftCard);
    this.app.stage.addChild(this.middleCard);
    this.app.stage.addChild(this.rightCard);
    // 先添加光晕，再添加图标
    this.app.stage.addChild(this.iconGlow);
    this.app.stage.addChild(this.icon);
    this.app.stage.addChild(this.laserIconGlow);
    this.app.stage.addChild(this.laserIcon);
    this.app.stage.addChild(this.rocketIconGlow);
    this.app.stage.addChild(this.rocketIcon);
    this.app.stage.addChild(this.iconPriceLabel);
    this.app.stage.addChild(this.laserPriceLabel);
    this.app.stage.addChild(this.rocketPriceLabel);
    this.app.stage.addChild(this.header);
    this.app.stage.addChild(this.subHeader);
    this.app.stage.addChild(this.iconDesc);
    this.app.stage.addChild(this.laserDesc);
    this.app.stage.addChild(this.rocketDesc);
  }

  setupStageEvents() {
    // 让 stage 可以接收指针事件，用于拖拽跟随与放置
    this.app.stage.eventMode = 'static';

    this.app.stage.on('pointermove', this.onPointerMove, this);
    this.app.stage.on('pointerup', this.onPointerUp, this);
    this.app.stage.on('pointerupoutside', this.onPointerUp, this);
  }

  startDrag(x, y) {
    if (this.dragSprite) {
        this.app.stage.removeChild(this.dragSprite);
        this.dragSprite = null;
    }
    if (this.dragGlow) {
        this.app.stage.removeChild(this.dragGlow);
        this.dragGlow = null;
    }

    // 创建拖拽光晕背景
    let glowColor = COLORS.ALLY_BODY;
    if (this.dragType === 'rocket') glowColor = COLORS.ROCKET_BODY;
    else if (this.dragType === 'laser') glowColor = COLORS.LASER_BODY;
    this.dragGlow = new Graphics()
      .circle(0, 0, TANK_SIZE * 0.8)
      .fill({ color: glowColor, alpha: 0.2 })
      .circle(0, 0, TANK_SIZE * 0.65)
      .fill({ color: glowColor, alpha: 0.15 })
      .circle(0, 0, TANK_SIZE * 0.55)
      .stroke({ width: 3, color: glowColor, alpha: 0.5 })
      .circle(0, 0, TANK_SIZE * 0.5)
      .stroke({ width: 2, color: glowColor, alpha: 0.3 });
    this.dragGlow.x = x;
    this.dragGlow.y = y;
    this.app.stage.addChild(this.dragGlow);

    let sprite;
    if (this.dragType === 'laser') {
      // 激光塔幽灵
      const towerRadius = TANK_SIZE * 0.20;
      const coreRadius = TANK_SIZE * 0.12;
      const baseSize = TANK_SIZE * 0.4;
      
      sprite = new Graphics();
      
      // 基座（六边形）
      const hexPoints = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        hexPoints.push(Math.cos(angle) * baseSize);
        hexPoints.push(Math.sin(angle) * baseSize);
      }
      sprite
        .poly(hexPoints)
        .fill({ color: COLORS.LASER_BODY, alpha: 0.7 })
        .stroke({ width: 2, color: COLORS.LASER_DETAIL, alpha: 0.5 });
      
      // 内层六边形装饰
      const innerHexPoints = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 6;
        innerHexPoints.push(Math.cos(angle) * baseSize * 0.6);
        innerHexPoints.push(Math.sin(angle) * baseSize * 0.6);
      }
      sprite
        .poly(innerHexPoints)
        .fill({ color: 0x0a1a0f, alpha: 0.6 })
        .stroke({ width: 1, color: COLORS.LASER_DETAIL, alpha: 0.4 });
      
      // 中央能量核心
      sprite
        .circle(0, 0, coreRadius * 1.6)
        .fill({ color: COLORS.LASER_DETAIL, alpha: 0.3 })
        .circle(0, 0, coreRadius * 1.2)
        .fill({ color: COLORS.LASER_DETAIL, alpha: 0.5 })
        .circle(0, 0, coreRadius)
        .fill({ color: COLORS.LASER_BEAM, alpha: 0.8 });
      
      // 顶部霓虹细节点
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const dotX = Math.cos(angle) * baseSize * 0.75;
        const dotY = Math.sin(angle) * baseSize * 0.75;
        sprite
          .circle(dotX, dotY, 3)
          .fill({ color: COLORS.LASER_DETAIL, alpha: 0.7 });
      }
      
      // 激光发射器
      const emitterDist = baseSize * 0.85;
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI / 2) * i;
        const emitX = Math.cos(angle) * emitterDist;
        const emitY = Math.sin(angle) * emitterDist;
        sprite
          .roundRect(emitX - 2, emitY - 4, 4, 8, 2)
          .fill({ color: COLORS.LASER_BEAM, alpha: 0.6 });
      }
    } else if (this.dragType === 'rocket') {
      // 火箭塔幽灵
      const rocketRadius = TANK_SIZE * 0.18;
      const rocketTrackHeight = TANK_SIZE * 0.24;
      const rocketBaseWidth = TANK_SIZE * 0.7;
      const rocketBaseHeight = TANK_SIZE * 0.24;
      const rocketTowerWidth = TANK_SIZE * 0.32;
      const rocketTowerHeight = TANK_SIZE * 0.78;

      sprite = new Graphics()
        .roundRect(
          -rocketBaseWidth / 2,
          TANK_SIZE * 0.18,
          rocketBaseWidth,
          rocketBaseHeight,
          TANK_SIZE * 0.12,
        )
        .fill({ color: 0x1f2937, alpha: 0.9 })
        .roundRect(
          -rocketBaseWidth / 2 + 6,
          TANK_SIZE * 0.18 + rocketBaseHeight * 0.2,
          rocketBaseWidth - 12,
          rocketBaseHeight * 0.45,
          rocketBaseHeight * 0.25,
        )
        .fill({ color: 0x475569, alpha: 0.9 });

      const ghostStripeWidth = rocketBaseWidth / 5;
      for (let i = 0; i < 4; i += 1) {
        const sx = -rocketBaseWidth / 2 + 6 + i * ghostStripeWidth;
        const color = i % 2 === 0 ? 0xfacc15 : 0x111827;
        sprite
          .roundRect(
            sx,
            TANK_SIZE * 0.18 + rocketBaseHeight * 0.35,
            ghostStripeWidth * 0.5,
            rocketBaseHeight * 0.4,
            ghostStripeWidth * 0.2,
          )
          .fill({ color, alpha: 0.85 });
      }

      sprite
        .roundRect(
          -rocketTowerWidth / 2,
          -rocketTowerHeight / 2,
          rocketTowerWidth,
          rocketTowerHeight,
          TANK_SIZE * 0.12,
        )
        .fill({ color: 0x334155 })
        .stroke({ width: 2, color: 0x0ea5e9, alpha: 1 });

      const ghostWindowWidth = rocketTowerWidth * 0.28;
      const ghostWindowHeight = rocketTowerHeight * 0.16;
      for (let i = 0; i < 3; i += 1) {
        const wy = -rocketTowerHeight * 0.3 + i * ghostWindowHeight * 1.2;
        sprite
          .roundRect(
            -ghostWindowWidth / 2,
            wy,
            ghostWindowWidth,
            ghostWindowHeight,
            ghostWindowHeight * 0.4,
          )
          .fill({ color: 0x38bdf8, alpha: 0.85 });
      }

      const ghostFinWidth = rocketTowerWidth * 0.24;
      const ghostFinHeight = rocketTowerHeight * 0.42;
      const ghostFinOffsetX = rocketTowerWidth * 0.72;
      sprite
        .roundRect(
          -ghostFinOffsetX - ghostFinWidth / 2,
          -ghostFinHeight / 2,
          ghostFinWidth,
          ghostFinHeight,
          ghostFinWidth * 0.5,
        )
        .fill({ color: 0x7c2d12, alpha: 0.9 })
        .roundRect(
          ghostFinOffsetX - ghostFinWidth / 2,
          -ghostFinHeight / 2,
          ghostFinWidth,
          ghostFinHeight,
          ghostFinWidth * 0.5,
        )
        .fill({ color: 0x7c2d12, alpha: 0.9 });

      sprite
        .roundRect(
          -TANK_SIZE * 0.26,
          -TANK_SIZE * 0.1,
          TANK_SIZE * 0.52,
          rocketTrackHeight,
          rocketTrackHeight * 0.4,
        )
        .fill({ color: 0x0f172a })
        .circle(TANK_SIZE * 0.16, -TANK_SIZE * 0.02, rocketRadius)
        .fill({ color: 0xf97316 })
        .circle(0, -rocketTowerHeight * 0.5, rocketTowerWidth * 0.2)
        .fill({ color: 0xfef3c7, alpha: 0.95 });
      sprite.rotation = Math.PI;
    } else {
      // 坦克幽灵（与实际坦克一致造型）
      const hullRadius = TANK_SIZE * 0.24;
      const turretRadius = TANK_SIZE * 0.18;
      const barrelLength = TANK_SIZE * 0.75;
      const barrelHalfHeight = TANK_SIZE * 0.09;
      const trackHeight = TANK_SIZE * 0.22;

      sprite = new Graphics();
      sprite
        .roundRect(
          -TANK_SIZE / 2 + 4,
          -TANK_SIZE / 2 + 6,
          TANK_SIZE - 8,
          TANK_SIZE - 4,
          hullRadius,
        )
        .fill({ color: 0x000000, alpha: 0.22 })
        .roundRect(
          -TANK_SIZE / 2,
          -TANK_SIZE / 2,
          TANK_SIZE,
          trackHeight,
          trackHeight / 2,
        )
        .fill({ color: 0x111827 })
        .roundRect(
          -TANK_SIZE / 2,
          TANK_SIZE / 2 - trackHeight,
          TANK_SIZE,
          trackHeight,
          trackHeight / 2,
        )
        .fill({ color: 0x111827 });

      const wheelRadius = trackHeight * 0.32;
      const wheelCount = 4;
      for (let i = 0; i < wheelCount; i += 1) {
        const t = wheelCount === 1 ? 0.5 : i / (wheelCount - 1);
        const wx = -TANK_SIZE / 2 + TANK_SIZE * (0.18 + 0.64 * t);
        const wyTop = -TANK_SIZE / 2 + trackHeight / 2;
        const wyBottom = TANK_SIZE / 2 - trackHeight / 2;
        sprite.circle(wx, wyTop, wheelRadius).fill({ color: 0x1f2937 });
        sprite.circle(wx, wyBottom, wheelRadius).fill({ color: 0x1f2937 });
      }

      sprite
        .roundRect(
          -TANK_SIZE / 2 + 6,
          -TANK_SIZE / 2 + trackHeight * 0.6,
          TANK_SIZE - 12,
          TANK_SIZE - trackHeight * 1.2,
          hullRadius,
        )
        .fill({ color: TANK_COLOR })
        .stroke({ width: 2, color: 0x15803d, alpha: 1 })
        .roundRect(
          -TANK_SIZE / 2 + 10,
          -TANK_SIZE / 2 + trackHeight * 0.8,
          TANK_SIZE - 20,
          TANK_SIZE - trackHeight * 1.6,
          hullRadius * 0.85,
        )
        .fill({ color: 0x34d399, alpha: 0.75 })
        .rect(-TANK_SIZE / 2 + 12, 0, TANK_SIZE - 24, 2)
        .fill({ color: 0x14532d, alpha: 0.45 });

      const ghostLightY = TANK_SIZE / 2 - trackHeight * 0.55;
      const ghostLightRadius = TANK_SIZE * 0.08;
      sprite
        .circle(-TANK_SIZE * 0.2, ghostLightY, ghostLightRadius)
        .fill({ color: 0xfef08a, alpha: 0.9 })
        .circle(TANK_SIZE * 0.2, ghostLightY, ghostLightRadius)
        .fill({ color: 0xfef3c7, alpha: 0.9 });

      sprite
        .roundRect(
          -TANK_SIZE / 2 + 8,
          -TANK_SIZE / 2 + trackHeight * 0.55,
          6,
          TANK_SIZE - trackHeight * 1.1,
          3,
        )
        .fill({ color: 0x0f172a, alpha: 0.4 })
        .roundRect(
          TANK_SIZE / 2 - 14,
          -TANK_SIZE / 2 + trackHeight * 0.55,
          6,
          TANK_SIZE - trackHeight * 1.1,
          3,
        )
        .fill({ color: 0x0f172a, alpha: 0.4 });

      sprite
        .circle(0, -TANK_SIZE * 0.06, turretRadius * 1.05)
        .fill({ color: 0x15803d })
        .stroke({ width: 2, color: 0x0f172a, alpha: 0.6 })
        .circle(0, -TANK_SIZE * 0.06, turretRadius)
        .fill({ color: TANK_BARREL_COLOR })
        .stroke({ width: 2, color: 0x14532d, alpha: 1 })
        .roundRect(
          -TANK_SIZE * 0.08,
          -TANK_SIZE * 0.16,
          TANK_SIZE * 0.16,
          TANK_SIZE * 0.32,
          TANK_SIZE * 0.04,
        )
        .fill({ color: 0x16a34a, alpha: 0.92 })
        .roundRect(
          0,
          -barrelHalfHeight,
          barrelLength,
          barrelHalfHeight * 2,
          barrelHalfHeight,
        )
        .fill({ color: TANK_BARREL_COLOR })
        .stroke({ width: 2, color: 0x0f172a, alpha: 0.5 })
        .roundRect(
          barrelLength * 0.35,
          -barrelHalfHeight * 0.55,
          barrelLength * 0.45,
          barrelHalfHeight * 1.1,
          barrelHalfHeight * 0.45,
        )
        .fill({ color: 0x16a34a, alpha: 0.85 })
        .circle(barrelLength - barrelHalfHeight * 0.2, 0, barrelHalfHeight * 0.55)
        .fill({ color: 0xfef08a, alpha: 0.95 });
      sprite.rotation = Math.PI;
    }

    sprite.alpha = 0.9;
    sprite.x = x;
    sprite.y = y;

    this.dragSprite = sprite;
    this.app.stage.addChild(this.dragSprite);
  }

  onPointerMove(event) {
    if (!this.dragSprite) return;
    const { x, y } = event.global;
    
    // 光晕跟随
    if (this.dragGlow) {
      this.dragGlow.x = x;
      this.dragGlow.y = y;
    }
    
    // 默认跟随鼠标
    this.dragSprite.x = x;
    this.dragSprite.y = y;
    this.dragSprite.alpha = 0.85;
    this.dragSprite.tint = 0xFFFFFF; // 重置颜色

    // 尝试计算网格位置，进行吸附与有效性提示
    const world = this.app.world || this.app.stage;
    const worldPos = world.toLocal({ x, y });
    const wx = worldPos.x;
    const wy = worldPos.y;

    // 网格区域判定（world 坐标原点即为战场顶部）
    const gridMinY = 0;
    const gridHeight = BATTLE_HEIGHT;
    const gridMaxY = gridMinY + gridHeight;
    const minRowIndex = 0;
    const maxRowIndex = Math.max(minRowIndex, BATTLE_ROWS - 1);

    const inGrid =
      wy >= gridMinY && wy < gridMaxY && wx >= 0 && wx <= WORLD_WIDTH;

    if (inGrid) {
      const col = Math.floor(wx / CELL_SIZE);
      const rawRow = Math.floor((wy - gridMinY) / CELL_SIZE);
      const row = Math.min(maxRowIndex, Math.max(minRowIndex, rawRow));

      const cellCenterX = col * CELL_SIZE + CELL_SIZE / 2;
      const cellCenterY = gridMinY + row * CELL_SIZE + CELL_SIZE / 2;
      
      // 将 ghost 坐标转换回全局坐标以进行吸附显示（因为 dragSprite 在 stage 上）
      const snappedGlobal = world.toGlobal({ x: cellCenterX, y: cellCenterY });
      this.dragSprite.x = snappedGlobal.x;
      this.dragSprite.y = snappedGlobal.y;
      
      // 光晕也要跟随吸附
      if (this.dragGlow) {
        this.dragGlow.x = snappedGlobal.x;
        this.dragGlow.y = snappedGlobal.y;
      }

      // 检查是否可放置
      let valid = true;

      // 1. 检查是否被占用
      if (this.isCellOccupied(col, row)) {
        valid = false;
      }

      // 2. 检查金币
      const level = 1;
      let cost = level * WEAPON_BASE_COST;
      if (this.dragType === 'rocket') {
        cost = level * ROCKET_BASE_COST;
      } else if (this.dragType === 'laser') {
        cost = level * LASER_BASE_COST;
      }
      if (this.goldManager && !this.goldManager.canAfford(cost)) {
        valid = false;
      }

      // 根据有效性改变颜色和光晕
      if (valid) {
        this.dragSprite.tint = COLORS.SUCCESS; // 绿色，表示可放
        this.dragSprite.alpha = 0.95;
        if (this.dragGlow) {
          this.dragGlow.tint = COLORS.SUCCESS;
          this.dragGlow.alpha = 1.2;
        }
      } else {
        this.dragSprite.tint = COLORS.DANGER; // 红色，表示不可放
        this.dragSprite.alpha = 0.7;
        if (this.dragGlow) {
          this.dragGlow.tint = COLORS.DANGER;
          this.dragGlow.alpha = 0.8;
        }
      }
    } else {
      // 即使不在网格内，如果是在 UI 区域，也显示半透明
      this.dragSprite.tint = 0xFFFFFF;
      this.dragSprite.alpha = 0.6;
      if (this.dragGlow) {
        this.dragGlow.tint = 0xFFFFFF;
        this.dragGlow.alpha = 0.5;
      }
    }
  }

  onPointerUp(event) {
    if (!this.dragSprite) return;

    const { x, y } = event.global;

    // 尝试将武器放置到网格中
    this.placeWeaponAt(x, y);

    // 删除幽灵武器和光晕
    this.app.stage.removeChild(this.dragSprite);
    this.dragSprite = null;
    if (this.dragGlow) {
      this.app.stage.removeChild(this.dragGlow);
      this.dragGlow = null;
    }
  }

  placeWeaponAt(x, y) {
    // 转换为世界坐标（考虑中间战场容器的平移）
    const world = this.app.world || this.app.stage;
    const worldPos = world.toLocal({ x, y });
    const wx = worldPos.x;
    const wy = worldPos.y;

    // 不能放在武器容器区域内，只能放在上方网格区域
    const gridMinY = 0;
    const gridHeight = BATTLE_HEIGHT;
    const gridMaxY = gridMinY + gridHeight;
    const minRowIndex = 0;
    const maxRowIndex = Math.max(minRowIndex, BATTLE_ROWS - 1);

    if (wy < gridMinY || wy >= gridMaxY || wx < 0 || wx > WORLD_WIDTH) {
      return;
    }

    // 计算落在哪个格子，转为该格子中心点坐标
    const col = Math.floor(wx / CELL_SIZE);
    const rawRow = Math.floor((wy - gridMinY) / CELL_SIZE);
    const row = Math.min(maxRowIndex, Math.max(minRowIndex, rawRow));

    const cellCenterX = col * CELL_SIZE + CELL_SIZE / 2;
    const cellCenterY = gridMinY + row * CELL_SIZE + CELL_SIZE / 2;

    // 使用金币放置武器（根据拖拽类型区分）
    const level = 1;
    let cost = level * WEAPON_BASE_COST;
    if (this.dragType === 'rocket') {
      cost = level * ROCKET_BASE_COST;
    } else if (this.dragType === 'laser') {
      cost = level * LASER_BASE_COST;
    }

    // 再次检查占用（防止并发问题或鼠标快速移动的边缘情况）
    if (this.isCellOccupied(col, row)) {
      return;
    }

    if (this.goldManager && !this.goldManager.spend(cost)) {
      // 金币不够，放置失败
      return;
    }

    let weapon;
    if (this.dragType === 'rocket') {
      weapon = new RocketTower(
      this.app,
      col,
      row,
      cellCenterX,
        cellCenterY,
      );
    } else if (this.dragType === 'laser') {
      weapon = new LaserTower(
        this.app,
        col,
        row,
        cellCenterX,
        cellCenterY,
      );
    } else {
      weapon = new TankWeapon(
        this.app,
        col,
        row,
        cellCenterX,
        cellCenterY,
      );
    }
      this.weapons.push(weapon);

    // 允许点击画布上的坦克进行选中/升级/卖掉
    weapon.turret.eventMode = 'static';
    weapon.turret.cursor = 'pointer';
    weapon.turret.on('pointerdown', (event) => {
      if (event && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
      }
      this.selectWeapon(weapon);
    });
  }

  update(delta, deltaMS, enemies = []) {
    this.weapons.forEach((weapon) => weapon.update(delta, deltaMS, enemies));
    if (this.selectedWeapon) {
      this.updateActionButtonsPosition();
    }
  }

  // 判断指定格子上是否已有武器坦克，用于敌人路径避让
  isCellOccupied(col, row) {
    return this.weapons.some(
      (weapon) => weapon.gridCol === col && weapon.gridRow === row,
    );
  }

  // 敌人攻击用：移除某个武器（不返还金币）
  removeWeapon(weapon) {
    if (!weapon) return;
    if (weapon.destroy) {
      weapon.destroy();
    }
    this.weapons = this.weapons.filter((w) => w !== weapon);
    if (this.selectedWeapon === weapon) {
      this.selectedWeapon = null;
      this.setActionButtonsVisible(false);
    }
  }

  selectWeapon(weapon) {
    if (this.selectedWeapon === weapon) return;
    if (this.selectedWeapon && this.selectedWeapon.setSelected) {
      this.selectedWeapon.setSelected(false);
    }
    this.selectedWeapon = weapon;
    if (this.selectedWeapon && this.selectedWeapon.setSelected) {
      this.selectedWeapon.setSelected(true);
    }

    this.updateActionButtonsPosition();
    this.updateActionButtonsForSelection();
  }

  sellSelectedWeapon() {
    if (!this.selectedWeapon) return;
    const target = this.selectedWeapon;
    if (target.destroy) {
      target.destroy();
    }
    // 卖掉返还金币
    const level = target.level ?? 1;
    let sellBaseGain = WEAPON_SELL_BASE_GAIN;
    
    if (target instanceof RocketTower) {
      sellBaseGain = ROCKET_SELL_BASE_GAIN;
    } else if (target instanceof LaserTower) {
      sellBaseGain = LASER_SELL_BASE_GAIN;
    }
    
    const sellGain = level * sellBaseGain;
    if (this.goldManager) {
      this.goldManager.add(sellGain);
    }
    this.weapons = this.weapons.filter((w) => w !== target);
    this.selectedWeapon = null;
    this.setActionButtonsVisible(false);
  }

  onKeyDown(event) {
    if (!this.selectedWeapon) return;
    const key = event.key;
    if (key === 'u' || key === 'U') {
      if (this.selectedWeapon.upgrade) {
    const level = this.selectedWeapon.level ?? 1;
    const maxLevel = this.selectedWeapon.maxLevel ?? 1;
        if (level < maxLevel) {
          // 根据武器类型确定升级成本
          let upgradeBaseCost = WEAPON_UPGRADE_BASE_COST;
          if (this.selectedWeapon instanceof RocketTower) {
            upgradeBaseCost = ROCKET_UPGRADE_BASE_COST;
          } else if (this.selectedWeapon instanceof LaserTower) {
            upgradeBaseCost = LASER_UPGRADE_BASE_COST;
          }
          
          const upgradeCost = level * upgradeBaseCost;
          if (!this.goldManager || this.goldManager.spend(upgradeCost)) {
            this.selectedWeapon.upgrade();
            this.updateActionButtonsForSelection();
          }
        }
      }
    } else if (key === 's' || key === 'S') {
      this.sellSelectedWeapon();
    }
  }

  setActionButtonsVisible(visible) {
    if (this.upgradeButton) this.upgradeButton.visible = visible && !!this.selectedWeapon;
    if (this.sellButton) this.sellButton.visible = visible && !!this.selectedWeapon;
  }

  updateActionButtonsPosition() {
    if (!this.selectedWeapon || !this.upgradeButton || !this.sellButton) return;

    const targetDisplay =
      this.selectedWeapon.turret
      || this.selectedWeapon.sprite
      || this.selectedWeapon.container;

    if (!targetDisplay || typeof targetDisplay.getGlobalPosition !== 'function') {
      return;
    }

    const { x, y } = targetDisplay.getGlobalPosition();
    const offsetY = -TANK_SIZE * 0.9;
    const offsetX = TANK_SIZE * 0.65;

    this.upgradeButton.x = x - offsetX;
    this.upgradeButton.y = y + offsetY;

    this.sellButton.x = x + offsetX;
    this.sellButton.y = y + offsetY;
  }

  // 根据当前选择的武器，刷新按钮文案与可见性（控制是否可升级）
  updateActionButtonsForSelection() {
    if (!this.selectedWeapon) {
      this.setActionButtonsVisible(false);
      return;
    }
    
    const level = this.selectedWeapon.level ?? 1;
    const maxLevel = this.selectedWeapon.maxLevel ?? 1;

    // 根据武器类型确定升级成本和出售收益
    let upgradeBaseCost = WEAPON_UPGRADE_BASE_COST;
    let sellBaseGain = WEAPON_SELL_BASE_GAIN;
    
    if (this.selectedWeapon instanceof RocketTower) {
      upgradeBaseCost = ROCKET_UPGRADE_BASE_COST;
      sellBaseGain = ROCKET_SELL_BASE_GAIN;
    } else if (this.selectedWeapon instanceof LaserTower) {
      upgradeBaseCost = LASER_UPGRADE_BASE_COST;
      sellBaseGain = LASER_SELL_BASE_GAIN;
    }
    
    const upgradeCost = level * upgradeBaseCost;
    const sellGain = level * sellBaseGain;

    if (this.upgradeLabel) {
      if (level < maxLevel) {
        this.upgradeLabel.text = `升级 ${upgradeCost}`;
    } else {
        this.upgradeLabel.text = '已满级';
      }
    }

    if (this.sellLabel) {
      this.sellLabel.text = `卖掉 ${sellGain}`;
    }

    // 只有在未满级且金币足够时才显示升级按钮
    const canUpgradeByLevel = level < maxLevel;
    const canAfford =
      !this.goldManager ||
      (typeof this.goldManager.canAfford === 'function'
        && this.goldManager.canAfford(upgradeCost));
    const showUpgrade = canUpgradeByLevel && canAfford;

    if (this.upgradeButton) this.upgradeButton.visible = showUpgrade;
    if (this.sellButton) this.sellButton.visible = true;
  }
}


