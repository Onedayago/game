import { Graphics } from 'pixi.js';
import {
  CELL_SIZE,
  WORLD_WIDTH,
  COLORS,
  APP_BACKGROUND,
  BATTLE_HEIGHT,
  GRID_LINE_WIDTH,
  GRID_LINE_COLOR,
  GRID_LINE_ALPHA,
} from '../constants';

export class GridBackground {
  constructor(app) {
    this.app = app;
    // 战场地形层（在最底层）
    this.terrain = new Graphics();
    this.terrain.zIndex = -100;

    this.drawScene();

    const parent = this.app.world || this.app.stage;
    parent.addChild(this.terrain);
  }

  drawScene() {
    // 战场背景的世界总宽度（可被相机左右拖拽观察）
    const width = WORLD_WIDTH;
    const height = BATTLE_HEIGHT;
    this.battleHeight = height;
    this.drawBattlefield(width, height);
    this.drawGridLines(width, height);
  }

  /**
   * 绘制战场风格的背景：分层渐变、装甲板、灯光与草地等视觉元素
   */
  drawBattlefield(width, height) {
    this.terrain.clear();

    // 1. 赛博朋克深色基底 + 霓虹渐变层
    this.terrain.rect(0, 0, width, height).fill({ color: APP_BACKGROUND });
    const gradientLayers = [
      { color: 0x1a0a2e, alpha: 0.95 }, // 深紫
      { color: 0x0f0520, alpha: 0.85 }, // 深紫黑
      { color: 0x1a0a2e, alpha: 0.75 }, // 深紫
      { color: 0x0a0014, alpha: 0.9 },  // 极深紫黑
    ];
    gradientLayers.forEach((layer, index) => {
      const layerHeight = height / gradientLayers.length;
      const y = index * layerHeight;
      this.terrain
        .rect(-CELL_SIZE, y - CELL_SIZE * 0.6, width + CELL_SIZE * 2, layerHeight + CELL_SIZE * 1.2)
        .fill(layer);
    });

    // 霓虹光晕环境
    this.terrain
      .circle(width * 0.25, height * 0.4, height * 1.2)
      .fill({ color: 0x00ffff, alpha: 0.05 }) // 青色光晕
      .circle(width * 0.75, height * 0.6, height * 1.1)
      .fill({ color: 0xff00ff, alpha: 0.05 }); // 洋红光晕

    // 2. 霓虹扫描线
    const stripeCount = 6;
    for (let i = 0; i < stripeCount; i += 1) {
      const y = (height / stripeCount) * i;
      const skew = CELL_SIZE * (1.5 + i * 0.15);
      const neonColor = i % 2 === 0 ? 0x00ffff : 0xff00ff;
      this.terrain
        .moveTo(-CELL_SIZE * 2, y - CELL_SIZE * 0.5)
        .lineTo(width + CELL_SIZE * 2, y + skew)
        .stroke({
          width: CELL_SIZE * 0.3,
          color: neonColor,
          alpha: 0.08,
        });
    }

    // 3. 赛博朋克数据块 / 全息面板
    const plateCount = 15;
    for (let i = 0; i < plateCount; i += 1) {
      const pw = CELL_SIZE * (1.2 + Math.random() * 1.8);
      const ph = CELL_SIZE * (0.8 + Math.random() * 1.2);
      const x = Math.random() * (width - pw);
      const y = Math.random() * (height - ph);
      const neonBorder = [0x00ffff, 0xff00ff, 0x9d00ff][i % 3];

      this.terrain
        .roundRect(x, y, pw, ph, CELL_SIZE * 0.15)
        .fill({ color: 0x0a0014, alpha: 0.7 })
        .stroke({
          width: 2,
          color: neonBorder,
          alpha: 0.6,
        });

      // 内部扫描线
      this.terrain
        .rect(x + pw * 0.1, y + ph * 0.3, pw * 0.8, 1)
        .fill({ color: neonBorder, alpha: 0.4 })
        .rect(x + pw * 0.1, y + ph * 0.6, pw * 0.8, 1)
        .fill({ color: neonBorder, alpha: 0.4 });
    }

    // 4. 霓虹信标 / 电子节点
    const beaconCount = 25;
    for (let i = 0; i < beaconCount; i += 1) {
      const radius = CELL_SIZE * (0.06 + Math.random() * 0.1);
      const x = radius + Math.random() * (width - radius * 2);
      const y = radius + Math.random() * (height - radius * 2);
      const glow = radius * (3 + Math.random() * 2);
      const neonColors = [0x00ffff, 0xff00ff, 0x9d00ff, 0x00ff41];
      const color = neonColors[i % neonColors.length];

      this.terrain
        .circle(x, y, glow * 1.2)
        .fill({ color, alpha: 0.06 })
        .circle(x, y, glow * 0.7)
        .fill({ color, alpha: 0.12 })
        .circle(x, y, glow * 0.4)
        .fill({ color, alpha: 0.2 })
        .circle(x, y, radius)
        .fill({ color, alpha: 0.95 });
    }

    // 5. 全息投影区域（霓虹装饰）
    const holoCount = 8;
    for (let i = 0; i < holoCount; i += 1) {
      const gw = CELL_SIZE * (2.5 + Math.random() * 3);
      const gh = CELL_SIZE * (1.6 + Math.random() * 2);
      const x = Math.random() * (width - gw);
      const y = Math.random() * (height - gh);
      const holoColors = [0x00ffff, 0xff00ff, 0x9d00ff];
      const color = holoColors[i % holoColors.length];

      this.terrain
        .roundRect(x, y, gw, gh, CELL_SIZE * 0.5)
        .fill({ color: 0x0a0014, alpha: 0.2 })
        .stroke({ width: 1, color, alpha: 0.3 });
    }

    // 6. 霓虹雾气效果
    this.terrain
      .rect(-CELL_SIZE, -CELL_SIZE, width + CELL_SIZE * 2, height * 0.4)
      .fill({ color: 0x00ffff, alpha: 0.02 })
      .rect(-CELL_SIZE, height * 0.5, width + CELL_SIZE * 2, height * 0.6)
      .fill({ color: 0xff00ff, alpha: 0.03 });

    // 7. 动态霓虹扫描线
    this.scanLineY = 0;
    this.scanLine = new Graphics()
      .rect(0, 0, width, 3)
      .fill({ color: 0x00ffff, alpha: 0.6 });
    this.terrain.addChild(this.scanLine);
  }

  drawGridLines(width, height) {
    if (!this.gridLayer) {
      this.gridLayer = new Graphics();
      this.gridLayer.eventMode = 'none';
      this.gridLayer.zIndex = -50;
      const parent = this.app.world || this.app.stage;
      parent.addChild(this.gridLayer);
    }
    const lines = this.gridLayer;
    lines.clear();
    lines.alpha = GRID_LINE_ALPHA; // 霓虹网格透明度

    for (let x = 0; x <= width; x += CELL_SIZE) {
      lines.moveTo(x, 0).lineTo(x, height);
    }
    for (let y = 0; y <= height; y += CELL_SIZE) {
      lines.moveTo(0, y).lineTo(width, y);
    }
    lines.stroke({ width: GRID_LINE_WIDTH, color: GRID_LINE_COLOR }); // 霓虹青色网格
  }

  update(deltaMS) {
    if (!this.scanLine) return;
    
    // 简单的垂直扫描移动
    const speed = 60; // pixels per second
    this.scanLineY += (speed * deltaMS) / 1000;
    
    const battleHeight = this.battleHeight || 0;
    if (this.scanLineY > battleHeight) {
      this.scanLineY = -50; // Loop back
    }
    
    this.scanLine.y = this.scanLineY;
    this.scanLine.alpha = 0.1 + 0.2 * Math.sin(this.scanLineY * 0.02);
  }
}


