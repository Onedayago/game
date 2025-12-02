import { Graphics, Text } from 'pixi.js';
import {
  APP_WIDTH,
  APP_HEIGHT,
  TANK_SIZE,
  WEAPON_CONTAINER_WIDTH,
  WEAPON_CONTAINER_HEIGHT,
  WEAPON_CONTAINER_MARGIN_BOTTOM,
  WEAPON_CONTAINER_BG_COLOR,
  WEAPON_CONTAINER_BORDER_COLOR,
  WEAPON_CONTAINER_BORDER_WIDTH,
  COLORS,
} from '../constants';
import { WeaponConfig, WEAPON_TYPES } from '../config/weaponTypes';
import { WeaponFactory } from '../entities/weapons/WeaponFactory';
import { WeaponIconRenderer } from './WeaponIconRenderer';
import { WeaponDragManager } from './WeaponDragManager';
import { NeonButton, NeonCard } from './components';

/**
 * 武器容器 - 重构版
 * 职责：
 * 1. 管理武器容器UI
 * 2. 管理已放置的武器
 * 3. 处理武器选择、升级、出售
 */
export class WeaponContainer {
  constructor(app, goldManager) {
    this.app = app;
    this.goldManager = goldManager;
    this.weapons = [];
    this.selectedWeapon = null;

    // 创建拖拽管理器
    this.dragManager = new WeaponDragManager(
      this.app,
      goldManager,
      (col, row) => this.isCellOccupied(col, row)
    );

    this.createContainer();
    this.createActionButtons();
    this.setupStageEvents();
    this.setupKeyboardEvents();
  }

  /**
   * 创建容器UI
   */
  createContainer() {
    const width = WEAPON_CONTAINER_WIDTH;
    const height = WEAPON_CONTAINER_HEIGHT;
    const centerX = APP_WIDTH / 2;
    const centerY = APP_HEIGHT - WEAPON_CONTAINER_MARGIN_BOTTOM - height / 2;

    // 主背景
    this.background = this.createBackground(width, height, centerX, centerY);
    this.app.stage.addChild(this.background);

    // 内层玻璃效果
    this.innerGlass = this.createInnerGlass(width, height, centerX, centerY);
    this.app.stage.addChild(this.innerGlass);

    // 标题
    this.header = this.createHeader(centerX, centerY, height);
    this.app.stage.addChild(this.header);

    this.subHeader = this.createSubHeader(centerX, centerY, height);
    this.app.stage.addChild(this.subHeader);

    // 两列武器卡片布局
    const cardWidth = width / 2.5 - 30;  // 更宽的卡片，有足够空间显示文字
    const cardHeight = height - 100;  // 减小卡片高度，为标题留出空间
    const cardSpacing = 30;  // 增加卡片间距
    const cardY = centerY + 35;  // 往下移动，避免遮挡副标题

    this.weaponCards = this.createWeaponCards(
      cardWidth,
      cardHeight,
      centerX,
      cardY,
      cardSpacing
    );
  }

  /**
   * 创建背景
   */
  createBackground(width, height, centerX, centerY) {
    const glowRadius = 16;
    const glowColor = COLORS.ALLY_BODY;

    const bg = new Graphics()
      .roundRect(
        -width / 2 - glowRadius,
        -height / 2 - glowRadius,
        width + glowRadius * 2,
        height + glowRadius * 2,
        20
      )
      .fill({ color: glowColor, alpha: 0.08 })
      .roundRect(
        -width / 2 - glowRadius / 2,
        -height / 2 - glowRadius / 2,
        width + glowRadius,
        height + glowRadius,
        18
      )
      .fill({ color: glowColor, alpha: 0.12 })
      .roundRect(-width / 2, -height / 2, width, height, 16)
      .fill({ color: WEAPON_CONTAINER_BG_COLOR, alpha: 0.95 })
      .stroke({ width: WEAPON_CONTAINER_BORDER_WIDTH + 2, color: glowColor, alpha: 0.6 })
      .stroke({ width: WEAPON_CONTAINER_BORDER_WIDTH, color: WEAPON_CONTAINER_BORDER_COLOR, alpha: 0.9 })
      .roundRect(-width / 2 + 4, -height / 2 + 4, width - 8, height - 8, 14)
      .stroke({ width: 1, color: glowColor, alpha: 0.4 })
      .roundRect(-width / 2 + 12, -height / 2 + 12, width - 24, height * 0.08, 8)
      .fill({ color: glowColor, alpha: 0.15 });

    bg.x = centerX;
    bg.y = centerY;
    bg.eventMode = 'none';

    return bg;
  }

  /**
   * 创建内层玻璃效果
   */
  createInnerGlass(width, height, centerX, centerY) {
    const glass = new Graphics()
      .roundRect(-width / 2 + 10, -height / 2 + 10, width - 20, height - 20, 18)
      .fill({ color: 0x0f172a, alpha: 0.85 })
      .stroke({ width: 1, color: 0x1f2937, alpha: 0.8 });

    glass.x = centerX;
    glass.y = centerY;
    glass.eventMode = 'none';

    return glass;
  }

  /**
   * 创建标题
   */
  createHeader(centerX, centerY, height) {
    const header = new Text({
      text: '⚔️ 武器库 ⚔️',
      style: {
        fill: 0xf9fafb,
        fontSize: 22,
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowColor: COLORS.ALLY_BODY,
        dropShadowBlur: 8,
        dropShadowDistance: 0,
      },
    });
    header.anchor.set(0.5, 0.5);
    header.position.set(centerX, centerY - height / 2 + 32);
    return header;
  }

  /**
   * 创建副标题
   */
  createSubHeader(centerX, centerY, height) {
    const subHeader = new Text({
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
    subHeader.anchor.set(0.5, 0);
    subHeader.position.set(centerX, centerY - height / 2 + 52);
    return subHeader;
  }

  /**
   * 创建武器卡片
   */
  createWeaponCards(cardWidth, cardHeight, centerX, cardY, cardSpacing) {
    // 确保 WEAPON_TYPES 已加载
    if (!WEAPON_TYPES || !WEAPON_TYPES.LASER || !WEAPON_TYPES.ROCKET) {
      console.error('[WeaponContainer] WEAPON_TYPES not properly loaded!', WEAPON_TYPES);
      return [];
    }
    
    const types = [WEAPON_TYPES.LASER, WEAPON_TYPES.ROCKET];
    const spacing = cardWidth / 2 + cardSpacing;
    const positions = [
      centerX - spacing,
      centerX + spacing,
    ];

    return types.map((type, index) => 
      this.createWeaponCard(type, cardWidth, cardHeight, positions[index], cardY)
    );
  }

  /**
   * 创建单个武器卡片
   */
  createWeaponCard(weaponType, cardWidth, cardHeight, x, y) {
    // 卡片背景
    const card = new NeonCard(cardWidth, cardHeight, weaponType.color);
    card.x = x;
    card.y = y;
    this.app.stage.addChild(card);

    // 图标区域
    const iconAreaWidth = TANK_SIZE * 1.6;
    const iconX = x + cardWidth / 2 - iconAreaWidth / 2;

    // 光晕
    const glow = WeaponIconRenderer.createIconGlow(weaponType.color);
    glow.x = iconX;
    glow.y = y;
    glow.eventMode = 'none';
    this.app.stage.addChild(glow);

    // 图标
    const icon = WeaponIconRenderer.createIcon(weaponType.id);
    icon.x = iconX;
    icon.y = y;
    icon.eventMode = 'static';
    icon.cursor = 'grab';

    // Hover效果
    icon.on('pointerover', () => {
      icon.alpha = 1;
      glow.alpha = 1.5;
    });
    icon.on('pointerout', () => {
      icon.alpha = 1;
      glow.alpha = 1;
    });

    // 拖拽事件
    icon.on('pointerdown', (event) => {
      const { x, y } = event.global;
      this.dragManager.startDrag(x, y, weaponType.id);
    });

    this.app.stage.addChild(icon);

    // 价格标签
    const cardPadding = 18;
    const priceLabel = new Text({
      text: `💰 ${weaponType.baseCost}`,
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
    priceLabel.anchor.set(0, 0);
    priceLabel.x = x - cardWidth / 2 + cardPadding;
    priceLabel.y = y - cardHeight / 2 + cardPadding;
    this.app.stage.addChild(priceLabel);

    // 描述文本
    // 修正：图标在右侧，文字在左侧，需要留出更多空间
    const textAreaWidth = cardWidth - iconAreaWidth - cardPadding * 3;
    const desc = new Text({
      text: weaponType.description,
      style: {
        fill: COLORS.TEXT_SUB,
        fontSize: 12,
        lineHeight: 16,
        wordWrap: true,
        wordWrapWidth: textAreaWidth - 10, // 留出更多边距
        dropShadow: true,
        dropShadowColor: 0x000000,
        dropShadowBlur: 2,
        dropShadowDistance: 1,
      },
    });
    desc.anchor.set(0, 0);
    desc.position.set(priceLabel.x, priceLabel.y + 24);
    this.app.stage.addChild(desc);

    return { card, glow, icon, priceLabel, desc };
  }

  /**
   * 创建操作按钮
   */
  createActionButtons() {
    // 升级按钮
    this.upgradeButton = new NeonButton('⬆️ 升级', COLORS.SUCCESS);
    this.upgradeButton.onClick(() => this.onUpgradeClick());
    this.app.stage.addChild(this.upgradeButton);

    // 出售按钮
    this.sellButton = new NeonButton('💰 出售', COLORS.DANGER);
    this.sellButton.onClick(() => this.sellSelectedWeapon());
    this.app.stage.addChild(this.sellButton);
  }

  /**
   * 设置舞台事件
   */
  setupStageEvents() {
    this.app.stage.eventMode = 'static';
    this.app.stage.on('pointermove', this.onPointerMove, this);
    this.app.stage.on('pointerup', this.onPointerUp, this);
    this.app.stage.on('pointerupoutside', this.onPointerUp, this);
  }

  /**
   * 设置键盘事件
   */
  setupKeyboardEvents() {
    this.handleKeyDown = this.onKeyDown.bind(this);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * 鼠标移动事件
   */
  onPointerMove(event) {
    if (this.dragManager.isDragging()) {
    const { x, y } = event.global;
      this.dragManager.onDragMove(x, y);
    }
  }

  /**
   * 鼠标抬起事件
   */
  onPointerUp(event) {
    if (!this.dragManager.isDragging()) return;

    const { x, y } = event.global;
    const placementInfo = this.dragManager.tryPlaceWeapon(x, y);

    if (placementInfo) {
      this.placeWeapon(placementInfo);
    }

    this.dragManager.stopDrag();
  }

  /**
   * 放置武器
   */
  placeWeapon(info) {
    console.log('[WeaponContainer] 放置武器:', {
      type: info.type,
      col: info.col,
      row: info.row,
      x: info.x,
      y: info.y,
      app: this.app,
      world: this.app?.world
    });

    const weapon = WeaponFactory.create(
      info.type,
      this.app,
      info.col,
      info.row,
      info.x,
      info.y
    );

    console.log('[WeaponContainer] 武器创建成功:', {
      weapon,
      container: weapon.container,
      containerX: weapon.container?.x,
      containerY: weapon.container?.y,
      containerVisible: weapon.container?.visible,
      containerParent: weapon.container?.parent
    });

    this.weapons.push(weapon);

    // 设置点击事件 - TankWeapon使用turretHead，其他使用turret或container
    const clickTarget = weapon.turret || weapon.turretHead || weapon.sprite || weapon.container;
    if (clickTarget) {
      clickTarget.eventMode = 'static';
      clickTarget.cursor = 'pointer';
      clickTarget.on('pointerdown', (event) => {
        if (event && typeof event.stopPropagation === 'function') {
          event.stopPropagation();
        }
        this.selectWeapon(weapon);
      });
    }
  }

  /**
   * 选择武器
   */
  selectWeapon(weapon) {
    if (this.selectedWeapon === weapon) return;

    // 取消之前的选中
    if (this.selectedWeapon && this.selectedWeapon.setSelected) {
      this.selectedWeapon.setSelected(false);
    }

    // 设置新选中
    this.selectedWeapon = weapon;
    if (this.selectedWeapon && this.selectedWeapon.setSelected) {
      this.selectedWeapon.setSelected(true);
    }

    this.updateActionButtons();
  }

  /**
   * 升级按钮点击
   */
  onUpgradeClick() {
    if (!this.selectedWeapon || !this.selectedWeapon.upgrade) return;

    const level = this.selectedWeapon.level ?? 1;
    const maxLevel = this.selectedWeapon.maxLevel ?? 1;
    if (level >= maxLevel) return;

    const upgradeCost = WeaponConfig.getUpgradeCost(this.selectedWeapon);
    if (!this.goldManager || this.goldManager.spend(upgradeCost)) {
      this.selectedWeapon.upgrade();
      this.updateActionButtons();
    }
  }

  /**
   * 出售选中的武器
   */
  sellSelectedWeapon() {
    if (!this.selectedWeapon) return;

    const target = this.selectedWeapon;
    if (target.destroy) {
      target.destroy();
    }

    // 返还金币
    const sellGain = WeaponConfig.getSellGain(target);
    if (this.goldManager) {
      this.goldManager.add(sellGain);
    }

    this.weapons = this.weapons.filter((w) => w !== target);
    this.selectedWeapon = null;
    this.setActionButtonsVisible(false);
  }

  /**
   * 键盘事件
   */
  onKeyDown(event) {
    if (!this.selectedWeapon) return;

    const key = event.key;
    if (key === 'u' || key === 'U') {
      this.onUpgradeClick();
    } else if (key === 's' || key === 'S') {
      this.sellSelectedWeapon();
    }
  }

  /**
   * 更新操作按钮
   */
  updateActionButtons() {
    if (!this.selectedWeapon) {
      this.setActionButtonsVisible(false);
      return;
    }

    const level = this.selectedWeapon.level ?? 1;
    const maxLevel = this.selectedWeapon.maxLevel ?? 1;
    const upgradeCost = WeaponConfig.getUpgradeCost(this.selectedWeapon);
    const sellGain = WeaponConfig.getSellGain(this.selectedWeapon);

    // 更新按钮文本
        if (level < maxLevel) {
      this.upgradeButton.setText(`升级 ${upgradeCost}`);
    } else {
      this.upgradeButton.setText('已满级');
    }
    this.sellButton.setText(`卖掉 ${sellGain}`);

    // 更新按钮位置
    this.updateActionButtonsPosition();

    // 更新按钮可见性
    const canUpgrade =
      level < maxLevel &&
      (!this.goldManager || this.goldManager.canAfford(upgradeCost));

    this.upgradeButton.visible = canUpgrade;
    this.sellButton.visible = true;
  }

  /**
   * 更新按钮位置
   */
  updateActionButtonsPosition() {
    if (!this.selectedWeapon) return;

    const targetDisplay =
      this.selectedWeapon.turret ||
      this.selectedWeapon.turretHead ||
      this.selectedWeapon.sprite ||
      this.selectedWeapon.container;

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

  /**
   * 设置按钮可见性
   */
  setActionButtonsVisible(visible) {
    if (this.upgradeButton) {
      this.upgradeButton.visible = visible && !!this.selectedWeapon;
    }
    if (this.sellButton) {
      this.sellButton.visible = visible && !!this.selectedWeapon;
    }
  }

  /**
   * 更新
   */
  update(delta, deltaMS, enemies = []) {
    this.weapons.forEach((weapon) => weapon.update(delta, deltaMS, enemies));
    if (this.selectedWeapon) {
      this.updateActionButtonsPosition();
    }
  }

  /**
   * 判断格子是否被占用
   */
  isCellOccupied(col, row) {
    return this.weapons.some(
      (weapon) => weapon.gridCol === col && weapon.gridRow === row
    );
  }

  /**
   * 移除武器
   */
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

  /**
   * 清理资源
   */
  dispose() {
    window.removeEventListener('keydown', this.handleKeyDown);
    this.weapons.forEach((w) => this.removeWeapon(w));
  }
}
