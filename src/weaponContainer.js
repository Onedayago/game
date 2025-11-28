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
} from './constants';
import { TankWeapon } from './tank';

export class WeaponContainer {
  constructor(app, goldManager) {
    this.app = app;
    this.goldManager = goldManager;
    this.weapons = [];
    this.dragSprite = null;
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
    const buttonWidth = 72;
    const buttonHeight = 26;
    const radius = 8;

    // 升级按钮
    this.upgradeButton = new Graphics()
      .roundRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, radius)
      .fill({ color: 0x22c55e })
      .stroke({ width: 2, color: 0x15803d, alpha: 1 });

    this.upgradeLabel = new Text({
      text: '升级',
      style: {
        fill: 0xffffff,
        fontSize: 14,
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
      .fill({ color: 0xef4444 })
      .stroke({ width: 2, color: 0xb91c1c, alpha: 1 });

    this.sellLabel = new Text({
      text: '卖掉',
      style: {
        fill: 0xffffff,
        fontSize: 14,
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

    // 武器图标（显示在容器中间，可被拖拽）——与实际坦克造型保持一致
    const hullRadius = TANK_SIZE * 0.25;
    const turretRadius = TANK_SIZE * 0.18;
    const barrelLength = TANK_SIZE * 0.75;
    const barrelHalfHeight = TANK_SIZE * 0.09;

    this.icon = new Graphics()
      .roundRect(-TANK_SIZE / 2, -TANK_SIZE / 2, TANK_SIZE, TANK_SIZE, hullRadius)
      .fill({ color: TANK_COLOR })
      .circle(0, -TANK_SIZE * 0.08, turretRadius)
      .fill({ color: TANK_BARREL_COLOR })
      .roundRect(0, -barrelHalfHeight, barrelLength, barrelHalfHeight * 2, barrelHalfHeight)
      .fill({ color: TANK_BARREL_COLOR });

    this.icon.x = centerX;
    this.icon.y = centerY;

    // 容器武器价格显示（使用该武器需要的金币）
    this.iconPriceLabel = new Text({
      text: `${WEAPON_BASE_COST}`,
      style: {
        fill: 0xfacc15,
        fontSize: 16,
      },
    });
    this.iconPriceLabel.anchor.set(0.5);
    this.iconPriceLabel.x = centerX;
    this.iconPriceLabel.y = centerY - TANK_SIZE * 0.7;

    // 设置交互，作为拖拽起点
    this.icon.eventMode = 'static';
    this.icon.cursor = 'grab';
    this.icon.on('pointerdown', this.onIconPointerDown, this);

    this.app.stage.addChild(this.background);
    this.app.stage.addChild(this.icon);
    this.app.stage.addChild(this.iconPriceLabel);
  }

  setupStageEvents() {
    // 让 stage 可以接收指针事件，用于拖拽跟随与放置
    this.app.stage.eventMode = 'static';

    this.app.stage.on('pointermove', this.onPointerMove, this);
    this.app.stage.on('pointerup', this.onPointerUp, this);
    this.app.stage.on('pointerupoutside', this.onPointerUp, this);
  }

  onIconPointerDown(event) {
    const { x, y } = event.global;
    this.startDrag(x, y);
  }

  startDrag(x, y) {
    if (this.dragSprite) {
      this.app.stage.removeChild(this.dragSprite);
      this.dragSprite = null;
    }

    // 创建一个跟随鼠标移动的“幽灵武器”预览（与图标、实际坦克同造型）
    const hullRadius = TANK_SIZE * 0.25;
    const turretRadius = TANK_SIZE * 0.18;
    const barrelLength = TANK_SIZE * 0.75;
    const barrelHalfHeight = TANK_SIZE * 0.09;

    const sprite = new Graphics()
      .roundRect(-TANK_SIZE / 2, -TANK_SIZE / 2, TANK_SIZE, TANK_SIZE, hullRadius)
      .fill({ color: TANK_COLOR })
      .circle(0, -TANK_SIZE * 0.08, turretRadius)
      .fill({ color: TANK_BARREL_COLOR })
      .roundRect(0, -barrelHalfHeight, barrelLength, barrelHalfHeight * 2, barrelHalfHeight)
      .fill({ color: TANK_BARREL_COLOR });

    sprite.alpha = 0.85;
    sprite.x = x;
    sprite.y = y;

    this.dragSprite = sprite;
    this.app.stage.addChild(this.dragSprite);
  }

  onPointerMove(event) {
    if (!this.dragSprite) return;
    const { x, y } = event.global;
    this.dragSprite.x = x;
    this.dragSprite.y = y;
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
    const gridMaxY =
      APP_HEIGHT - WEAPON_CONTAINER_HEIGHT - WEAPON_CONTAINER_MARGIN_BOTTOM * 2;

    if (wy < 0 || wy > gridMaxY || wx < 0 || wx > WORLD_WIDTH) {
      return;
    }

    // 计算落在哪个格子，转为该格子中心点坐标
    const col = Math.floor(wx / CELL_SIZE);
    const row = Math.floor(wy / CELL_SIZE);

    const cellCenterX = col * CELL_SIZE + CELL_SIZE / 2;
    const cellCenterY = row * CELL_SIZE + CELL_SIZE / 2;

    // 使用金币放置武器
    const level = 1;
    const cost = level * WEAPON_BASE_COST;
    if (this.goldManager && !this.goldManager.spend(cost)) {
      // 金币不够，放置失败
      return;
    }

    // 创建一个坦克武器，后续由更新逻辑决定攻击哪个敌人
    const weapon = new TankWeapon(
      this.app,
      col,
      row,
      cellCenterX,
      cellCenterY,
    );
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

    const { x, y } = this.selectedWeapon.turret;
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

    const canUpgrade = level < maxLevel;
    if (this.upgradeButton) this.upgradeButton.visible = canUpgrade;
    if (this.sellButton) this.sellButton.visible = true;
  }
}


