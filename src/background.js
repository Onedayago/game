import { Graphics } from 'pixi.js';
import {
  CELL_SIZE,
  GRID_LINE_WIDTH,
  GRID_LINE_COLOR,
  GRID_LINE_ALPHA,
  WEAPON_CONTAINER_HEIGHT,
  WEAPON_CONTAINER_MARGIN_BOTTOM,
  WORLD_WIDTH,
  WORLD_COLS,
} from './constants';

export class GridBackground {
  constructor(app) {
    this.app = app;
    // 战场地形层（在最底层）
    this.terrain = new Graphics();
    // 网格线层（在地形之上，方便看清格子）
    this.grid = new Graphics();

    this.drawGrid();

    const parent = this.app.world || this.app.stage;
    parent.addChild(this.terrain);
    parent.addChild(this.grid);
  }

  drawGrid() {
    // 网格和战场背景的世界总宽度（可被相机左右拖拽观察）
    const width = WORLD_WIDTH;
    const fullHeight = this.app.renderer.height;

    // 预留底部一块区域给武器容器，不再绘制网格线，相当于“画布外”的 UI 区域
    const gridHeight =
      fullHeight - WEAPON_CONTAINER_HEIGHT - WEAPON_CONTAINER_MARGIN_BOTTOM * 2;

    const cols = WORLD_COLS;
    const rows = Math.floor(gridHeight / CELL_SIZE);
    const height = rows * CELL_SIZE;

    // 先画战场背景，再画网格线
    this.drawBattlefield(width, height);

    this.grid.clear();

    // 竖直线（从画布顶端画到画布底端）
    for (let i = 0; i <= cols; i++) {
      const x = i * CELL_SIZE;
      this.grid.moveTo(x, 0);
      this.grid.lineTo(x, height);
    }

    // 水平线（从画布左侧画到画布右侧）
    for (let j = 0; j <= rows; j++) {
      const y = j * CELL_SIZE;
      this.grid.moveTo(0, y);
      this.grid.lineTo(width, y);
    }

    // 应用描边样式，一次性描边当前路径
    this.grid.stroke({
      width: GRID_LINE_WIDTH,
      color: GRID_LINE_COLOR,
      alpha: GRID_LINE_ALPHA,
    });
  }

  /**
   * 绘制战场风格的背景：土路、草地块、掩体和弹坑等视觉元素
   */
  drawBattlefield(width, height) {
    this.terrain.clear();

    // 1. 整体深色基底，让战场层次感更强
    this.terrain
      .rect(0, 0, width, height)
      .fill({ color: 0x020617, alpha: 0.7 });

    // 2. 几条横向 / 斜向“履带路”和土路
    const roadColors = [0x292524, 0x1f2937];
    const roadCount = 3;
    for (let i = 0; i < roadCount; i += 1) {
      const y = (height / (roadCount + 1)) * (i + 1);
      const thickness = CELL_SIZE * 0.7;
      const color = roadColors[i % roadColors.length];
      this.terrain
        .moveTo(-CELL_SIZE * 2, y - thickness / 2)
        .lineTo(width + CELL_SIZE * 2, y + thickness / 2)
        .stroke({
          width: thickness,
          color,
          alpha: 0.55,
        });
    }

    // 3. 零散的“掩体 / 碉堡”方块
    const bunkerColor = 0x111827;
    const bunkerBorder = 0x4b5563;
    const bunkerCount = 10;
    for (let i = 0; i < bunkerCount; i += 1) {
      const bw = CELL_SIZE * (0.8 + Math.random() * 0.4);
      const bh = CELL_SIZE * (0.7 + Math.random() * 0.4);
      const x = Math.random() * (width - bw);
      const y = Math.random() * (height - bh);

      this.terrain
        .roundRect(x, y, bw, bh, CELL_SIZE * 0.15)
        .fill({ color: bunkerColor, alpha: 0.95 })
        .stroke({
          width: 2,
          color: bunkerBorder,
          alpha: 0.9,
        });
    }

    // 4. 弹坑效果（圆形深色坑 + 浅色边缘）
    const craterCount = 14;
    for (let i = 0; i < craterCount; i += 1) {
      const radius = CELL_SIZE * (0.25 + Math.random() * 0.25);
      const x = radius + Math.random() * (width - radius * 2);
      const y = radius + Math.random() * (height - radius * 2);

      // 阴影
      this.terrain
        .circle(x + radius * 0.18, y + radius * 0.18, radius * 1.1)
        .fill({ color: 0x020617, alpha: 0.6 });

      // 坑体
      this.terrain
        .circle(x, y, radius)
        .fill({ color: 0x1f2937, alpha: 0.95 })
        .stroke({
          width: 3,
          color: 0x9ca3af,
          alpha: 0.6,
        });
    }

    // 5. 一些绿色“草地区域”，增加一点军营 / 野外战场的感觉
    const grassColors = [0x064e3b, 0x14532d];
    const grassCount = 6;
    for (let i = 0; i < grassCount; i += 1) {
      const gw = CELL_SIZE * (2 + Math.random() * 2);
      const gh = CELL_SIZE * (1.5 + Math.random() * 1.5);
      const x = Math.random() * (width - gw);
      const y = Math.random() * (height - gh);
      const color = grassColors[i % grassColors.length];

      this.terrain
        .roundRect(x, y, gw, gh, CELL_SIZE * 0.4)
        .fill({ color, alpha: 0.55 });
    }
  }
}


