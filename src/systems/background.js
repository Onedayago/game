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
    // 只绘制纯色背景，不绘制装饰和网格
    this.drawSimpleBackground(width, height);
  }

  /**
   * 绘制简洁的纯色背景
   */
  drawSimpleBackground(width, height) {
    this.terrain.clear();
    // 只绘制纯色背景
    this.terrain.rect(0, 0, width, height).fill({ color: APP_BACKGROUND });
  }

  // 网格线已禁用

  update(deltaMS) {
    // 动画已禁用
  }
}


