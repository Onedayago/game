import { Graphics } from 'pixi.js';
import { ENEMY_SIZE, ENEMY_COLOR } from '../../constants';

/**
 * 简易敌人展示用类（历史遗留），目前未在实际逻辑中使用。
 */
export class Enemy {
  constructor(app, x, y) {
    this.app = app;
    this.sprite = new Graphics()
      .roundRect(-ENEMY_SIZE / 2, -ENEMY_SIZE / 2, ENEMY_SIZE, ENEMY_SIZE, ENEMY_SIZE * 0.25)
      .fill({ color: ENEMY_COLOR });

    this.sprite.x = x;
    this.sprite.y = y;

    const world = this.app.world || this.app.stage;
    world.addChild(this.sprite);
  }
}


