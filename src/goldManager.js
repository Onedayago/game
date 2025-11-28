import { Graphics, Text } from 'pixi.js';
import {
  APP_WIDTH,
  APP_HEIGHT,
  CELL_SIZE,
  INITIAL_GOLD,
  WORLD_WIDTH,
  WEAPON_CONTAINER_HEIGHT,
  WEAPON_CONTAINER_MARGIN_BOTTOM,
} from './constants';

export class GoldManager {
  constructor(app) {
    this.app = app;
    this.gold = 0;

    const barHeight = CELL_SIZE; // 占用一行格子的高度
    const barWidth = APP_WIDTH;
    const y = 0;

    this.bg = new Graphics()
      .rect(0, y, barWidth, barHeight)
      .fill({ color: 0x020617 });
    this.bg.alpha = 0.9;

    this.text = new Text({
      text: '',
      style: {
        fill: 0xfacc15,
        fontSize: 20,
      },
    });
    this.text.x = 16;
    this.text.y = y + barHeight / 2;
    this.text.anchor.set(0, 0.5);

    app.stage.addChild(this.bg);
    app.stage.addChild(this.text);

    // ====== 缩略小地图（显示整个战场状态） ======
    // 小地图尺寸：放在金币条右上角区域
    this.minimapWidth = 220;
    this.minimapHeight = barHeight - 10;
    this.minimapX = APP_WIDTH - this.minimapWidth - 10;
    this.minimapY = 5;

    // 世界战场的总高度（不包含底部武器容器区域）
    this.worldHeight =
      APP_HEIGHT - WEAPON_CONTAINER_HEIGHT - WEAPON_CONTAINER_MARGIN_BOTTOM * 2;

    this.minimapScaleX = this.minimapWidth / WORLD_WIDTH;
    this.minimapScaleY = this.minimapHeight / this.worldHeight;

    // 小地图背景
    this.minimapBg = new Graphics()
      .roundRect(
        this.minimapX,
        this.minimapY,
        this.minimapWidth,
        this.minimapHeight,
        10,
      )
      .fill({ color: 0x020617, alpha: 0.95 })
      .stroke({ width: 1, color: 0x4b5563, alpha: 1 });

    // 小地图内容层（敌人 / 武器点位）
    this.minimapContent = new Graphics();

    // 小地图视口矩形（当前屏幕所在区域）
    this.minimapViewport = new Graphics();

    app.stage.addChild(this.minimapBg);
    app.stage.addChild(this.minimapContent);
    app.stage.addChild(this.minimapViewport);

    this.setGold(INITIAL_GOLD);
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
    this.text.text = `金币：${this.gold}`;
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
      g.circle(mx, my, 2.5).fill({ color: 0xf97316, alpha: 1 });
    });

    // 我方武器点位（绿色）
    weapons.forEach((weapon) => {
      if (!weapon || !weapon.turret) return;
      const wx = weapon.turret.x;
      const wy = weapon.turret.y;
      const mx = this.minimapX + wx * this.minimapScaleX;
      const my = this.minimapY + wy * this.minimapScaleY;
      g.circle(mx, my, 2.2).fill({ color: 0x22c55e, alpha: 1 });
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
        .stroke({ width: 2, color: 0xf9fafb, alpha: 0.9 });
    }
  }
}


