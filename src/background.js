import { Graphics } from 'pixi.js';
import {
  CELL_SIZE,
  WEAPON_CONTAINER_HEIGHT,
  WEAPON_CONTAINER_MARGIN_BOTTOM,
  WORLD_WIDTH,
} from './constants';

export class GridBackground {
  constructor(app) {
    this.app = app;
    // 战场地形层（在最底层）
    this.terrain = new Graphics();

    this.drawScene();

    const parent = this.app.world || this.app.stage;
    parent.addChild(this.terrain);
  }

  drawScene() {
    // 战场背景的世界总宽度（可被相机左右拖拽观察）
    const width = WORLD_WIDTH;
    const fullHeight = this.app.renderer.height;

    // 预留底部一块区域给武器容器，不再绘制网格线，相当于“画布外”的 UI 区域
    const gridHeight =
      fullHeight - WEAPON_CONTAINER_HEIGHT - WEAPON_CONTAINER_MARGIN_BOTTOM * 2;

    const rows = Math.floor(gridHeight / CELL_SIZE);
    const height = rows * CELL_SIZE;

    // 只绘制定制化战场背景，移除所有网格线
    this.drawBattlefield(width, height);
  }

  /**
   * 绘制战场风格的背景：分层渐变、装甲板、灯光与草地等视觉元素
   */
  drawBattlefield(width, height) {
    this.terrain.clear();

    // 1. 深色基底 + 分层渐变，营造更具科幻感的战场
    this.terrain
      .rect(0, 0, width, height)
      .fill({ color: 0x030712 });

    const gradientLayers = [
      { color: 0x061428, alpha: 0.95 },
      { color: 0x041425, alpha: 0.75 },
      { color: 0x081b34, alpha: 0.55 },
      { color: 0x050d1b, alpha: 0.8 },
    ];
    gradientLayers.forEach((layer, index) => {
      const layerHeight = height / gradientLayers.length;
      const y = index * layerHeight;
      this.terrain
        .rect(-CELL_SIZE, y - CELL_SIZE * 0.6, width + CELL_SIZE * 2, layerHeight + CELL_SIZE * 1.2)
        .fill(layer);
    });

    // 环境暗角
    this.terrain
      .circle(width * 0.28, height * 0.45, height * 0.9)
      .fill({ color: 0x000000, alpha: 0.22 })
      .circle(width * 0.85, height * 0.55, height)
      .fill({ color: 0x000000, alpha: 0.28 });

    // 2. 柔和的斜向光束，营造扫描/探照灯效果
    const stripeCount = 5;
    for (let i = 0; i < stripeCount; i += 1) {
      const y = (height / stripeCount) * i;
      const skew = CELL_SIZE * (1.2 + i * 0.1);
      this.terrain
        .moveTo(-CELL_SIZE * 2, y - CELL_SIZE * 0.5)
        .lineTo(width + CELL_SIZE * 2, y + skew)
        .stroke({
          width: CELL_SIZE * 0.45,
          color: 0x0ea5e9,
          alpha: 0.045,
        });
    }

    // 3. 装甲板 / 掩体块，提升质感
    const plateCount = 12;
    for (let i = 0; i < plateCount; i += 1) {
      const pw = CELL_SIZE * (1.4 + Math.random() * 2);
      const ph = CELL_SIZE * (0.9 + Math.random() * 1.1);
      const x = Math.random() * (width - pw);
      const y = Math.random() * (height - ph);

      this.terrain
        .roundRect(x, y, pw, ph, CELL_SIZE * 0.18)
        .fill({ color: 0x0f172a, alpha: 0.9 })
        .stroke({
          width: 2,
          color: 0x1f2937,
          alpha: 0.65,
        });

      this.terrain
        .rect(x + pw * 0.1, y + ph * 0.45, pw * 0.8, 1.5)
        .fill({ color: 0x1d4ed8, alpha: 0.25 });
    }

    // 4. 发光信标 / 电子点位
    const beaconCount = 18;
    for (let i = 0; i < beaconCount; i += 1) {
      const radius = CELL_SIZE * (0.08 + Math.random() * 0.12);
      const x = radius + Math.random() * (width - radius * 2);
      const y = radius + Math.random() * (height - radius * 2);
      const glow = radius * (2 + Math.random());

      this.terrain
        .circle(x, y, glow)
        .fill({ color: 0x0ea5e9, alpha: 0.08 })
        .circle(x, y, glow * 0.65)
        .fill({ color: 0x22d3ee, alpha: 0.18 })
        .circle(x, y, radius)
        .fill({ color: 0xfef3c7, alpha: 0.8 });
    }

    // 5. 绿色伪装区域，保留一些陆战氛围
    const camoColors = [0x064e3b, 0x0f5132, 0x0b5d3a];
    const camoCount = 6;
    for (let i = 0; i < camoCount; i += 1) {
      const gw = CELL_SIZE * (2.2 + Math.random() * 2.5);
      const gh = CELL_SIZE * (1.4 + Math.random() * 1.6);
      const x = Math.random() * (width - gw);
      const y = Math.random() * (height - gh);
      const color = camoColors[i % camoColors.length];

      this.terrain
        .roundRect(x, y, gw, gh, CELL_SIZE * 0.4)
        .fill({ color, alpha: 0.5 });
    }

    // 6. 顶部/底部的轻微雾气
    this.terrain
      .rect(-CELL_SIZE, -CELL_SIZE, width + CELL_SIZE * 2, height * 0.35)
      .fill({ color: 0xf8fafc, alpha: 0.03 })
      .rect(-CELL_SIZE, height * 0.6, width + CELL_SIZE * 2, height * 0.5)
      .fill({ color: 0x000000, alpha: 0.18 });
  }
}


