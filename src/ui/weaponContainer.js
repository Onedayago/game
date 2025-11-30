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

export class WeaponContainer {
  constructor(app, goldManager) {
    this.app = app;
    this.goldManager = goldManager;
    this.weapons = [];
    this.dragSprite = null;
    this.dragType = 'tank'; // 'tank' | 'rocket'
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

    // 升级按钮
    this.upgradeButton = new Graphics()
      .roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, radius)
      .fill({ color: COLORS.SUCCESS })
      .stroke({ width: ACTION_BUTTON_STROKE_WIDTH, color: 0x15803d, alpha: 1 });

    this.upgradeLabel = new Text({
      text: '升级',
      style: {
        fill: COLORS.TEXT_MAIN,
        fontSize: ACTION_BUTTON_FONT_SIZE,
      },
    });
    this.upgradeLabel.anchor.set(0.5);
    this.upgradeButton.addChild(this.upgradeLabel);

    this.upgradeButton.eventMode = 'static';
    this.upgradeButton.cursor = 'pointer';
    this.upgradeButton.visible = false;
    this.upgradeButton.on('pointerdown', (event) => {
      if (event && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
      }
      if (!this.selectedWeapon || !this.selectedWeapon.upgrade) return;

      const level = this.selectedWeapon.level ?? 1;
      const maxLevel = this.selectedWeapon.maxLevel ?? 1;
      if (level >= maxLevel) return;

      const upgradeCost = level * WEAPON_UPGRADE_BASE_COST;
      // 点击按钮升级同样要走金币扣除逻辑
      if (!this.goldManager || this.goldManager.spend(upgradeCost)) {
        this.selectedWeapon.upgrade();
        // 升级后立刻刷新按钮状态（可能达到满级，需要隐藏升级按钮）
        this.updateActionButtonsForSelection();
      }
    });

    // 卖掉按钮
    this.sellButton = new Graphics()
      .roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, radius)
      .fill({ color: COLORS.DANGER })
      .stroke({ width: ACTION_BUTTON_STROKE_WIDTH, color: 0xb91c1c, alpha: 1 });

    this.sellLabel = new Text({
      text: '卖掉',
      style: {
        fill: COLORS.TEXT_MAIN,
        fontSize: ACTION_BUTTON_FONT_SIZE,
      },
    });
    this.sellLabel.anchor.set(0.5);
    this.sellButton.addChild(this.sellLabel);

    this.sellButton.eventMode = 'static';
    this.sellButton.cursor = 'pointer';
    this.sellButton.visible = false;
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

    // 背景条
    this.background = new Graphics()
      .roundRect(-width / 2, -height / 2, width, height, 16)
      .fill({ color: WEAPON_CONTAINER_BG_COLOR })
      .stroke({
        width: WEAPON_CONTAINER_BORDER_WIDTH,
        color: WEAPON_CONTAINER_BORDER_COLOR,
        alpha: 1,
      });

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

    // 顶部标题
    this.header = new Text({
      text: '武器库',
      style: {
        fill: COLORS.GOLD,
        fontSize: 22,
        fontWeight: 'bold',
      },
    });
    this.header.anchor.set(0.5, 0);
    this.header.position.set(centerX, centerY - height / 2 + 8);

    this.subHeader = new Text({
      text: '拖拽至战场以部署',
      style: {
        fill: COLORS.TEXT_SUB,
        fontSize: 14,
      },
    });
    this.subHeader.anchor.set(0.5, 0);
    this.subHeader.position.set(centerX, centerY - height / 2 + 32);

    // 左右卡片背景
    const cardWidth = width / 2 - 24;
    const cardHeight = height - 56;
    const cardPadding = 18;
    const iconAreaWidth = TANK_SIZE * 1.6;
    const textAreaWidth = cardWidth - iconAreaWidth - cardPadding * 2;
    this.leftCard = new Graphics()
      .roundRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 14)
      .fill({ color: 0x111827, alpha: 0.85 })
      .stroke({ width: 1, color: 0x1f2937, alpha: 0.9 });
    this.leftCard.x = centerX - cardWidth / 2 - 8;
    this.leftCard.y = centerY + 12;
    this.leftCard.eventMode = 'none';

    this.rightCard = new Graphics()
      .roundRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 14)
      .fill({ color: 0x111827, alpha: 0.85 })
      .stroke({ width: 1, color: 0x1f2937, alpha: 0.9 });
    this.rightCard.x = centerX + cardWidth / 2 + 8;
    this.rightCard.y = centerY + 12;
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
    this.icon.x = leftIconX;
    this.icon.y = iconY;
    this.icon.scale.x = -1;

    // 容器武器价格显示（使用该武器需要的金币）
    this.iconPriceLabel = new Text({
      text: `${WEAPON_BASE_COST}`,
      style: {
        fill: COLORS.GOLD,
        fontSize: 15,
      },
    });
    this.iconPriceLabel.anchor.set(0, 0);
    this.iconPriceLabel.x = this.leftCard.x - cardWidth / 2 + cardPadding;
    this.iconPriceLabel.y = this.leftCard.y - cardHeight / 2 + cardPadding - 4;

    this.iconDesc = new Text({
      text: '标准坦克·均衡射速\n适合前线压制',
      style: {
        fill: COLORS.TEXT_SUB,
        fontSize: 13,
        lineHeight: 18,
        wordWrap: true,
        wordWrapWidth: textAreaWidth,
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

    const rightIconX = this.rightCard.x + cardWidth / 2 - iconAreaWidth / 2;
    this.rocketIcon.x = rightIconX;
    this.rocketIcon.y = iconY;
    this.rocketIcon.scale.x = -1;

    this.rocketPriceLabel = new Text({
      text: `${ROCKET_BASE_COST}`,
      style: {
        fill: COLORS.ROCKET_BODY,
        fontSize: 15,
      },
    });
    this.rocketPriceLabel.anchor.set(0, 0);
    this.rocketPriceLabel.x = this.rightCard.x - cardWidth / 2 + cardPadding;
    this.rocketPriceLabel.y = this.rightCard.y - cardHeight / 2 + cardPadding - 4;

    this.rocketDesc = new Text({
      text: '追踪火箭·爆炸溅射\n擅长远距离收割',
      style: {
        fill: COLORS.TEXT_SUB,
        fontSize: 13,
        lineHeight: 18,
        wordWrap: true,
        wordWrapWidth: textAreaWidth,
      },
    });
    this.rocketDesc.anchor.set(0, 0);
    this.rocketDesc.position.set(
      this.rocketPriceLabel.x,
      this.rocketPriceLabel.y + 26,
    );

    // 设置交互，作为拖拽起点
    this.icon.eventMode = 'static';
    this.icon.cursor = 'grab';
    this.icon.on('pointerdown', (event) => {
      const { x, y } = event.global;
      this.dragType = 'tank';
      this.startDrag(x, y);
    });

    this.rocketIcon.eventMode = 'static';
    this.rocketIcon.cursor = 'grab';
    this.rocketIcon.on('pointerdown', (event) => {
      const { x, y } = event.global;
      this.dragType = 'rocket';
      this.startDrag(x, y);
    });

    this.app.stage.addChild(this.background);
    this.app.stage.addChild(this.innerGlass);
    this.app.stage.addChild(this.leftCard);
    this.app.stage.addChild(this.rightCard);
    this.app.stage.addChild(this.icon);
    this.app.stage.addChild(this.iconPriceLabel);
    this.app.stage.addChild(this.rocketIcon);
    this.app.stage.addChild(this.rocketPriceLabel);
    this.app.stage.addChild(this.header);
    this.app.stage.addChild(this.subHeader);
    this.app.stage.addChild(this.iconDesc);
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

    let sprite;
    if (this.dragType === 'rocket') {
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

    sprite.alpha = 0.85;
    sprite.x = x;
    sprite.y = y;

    this.dragSprite = sprite;
    this.app.stage.addChild(this.dragSprite);
  }

  onPointerMove(event) {
    if (!this.dragSprite) return;
    const { x, y } = event.global;
    
    // 默认跟随鼠标
    this.dragSprite.x = x;
    this.dragSprite.y = y;
    this.dragSprite.alpha = 0.8;
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
      }
      if (this.goldManager && !this.goldManager.canAfford(cost)) {
        valid = false;
      }

      // 根据有效性改变颜色
      if (valid) {
        this.dragSprite.tint = COLORS.SUCCESS; // 绿色，表示可放
      } else {
        this.dragSprite.tint = COLORS.DANGER; // 红色，表示不可放
      }
    } else {
      // 即使不在网格内，如果是在 UI 区域，也显示红色提示无法放置
      this.dragSprite.tint = 0xFFFFFF;
      this.dragSprite.alpha = 0.5;
    }
  }

  onPointerUp(event) {
    if (!this.dragSprite) return;

    const { x, y } = event.global;

    // 尝试将武器放置到网格中
    this.placeWeaponAt(x, y);

    // 删除幽灵武器
    this.app.stage.removeChild(this.dragSprite);
    this.dragSprite = null;
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
    const sellGain = level * WEAPON_SELL_BASE_GAIN;
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
          const upgradeCost = level * WEAPON_UPGRADE_BASE_COST;
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

    // 简单的金币公式：升级花费 WEAPON_UPGRADE_BASE_COST * 当前等级，卖掉获得 WEAPON_SELL_BASE_GAIN * 当前等级
    const upgradeCost = level * WEAPON_UPGRADE_BASE_COST;
    const sellGain = level * WEAPON_SELL_BASE_GAIN;

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


