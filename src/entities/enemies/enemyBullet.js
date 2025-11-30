import { Graphics } from 'pixi.js';
import {
  APP_HEIGHT,
  ENEMY_BULLET_COLOR,
  ENEMY_BULLET_RADIUS,
  ENEMY_BULLET_SPEED,
  WORLD_WIDTH,
} from '../../constants';

/**
 * 敌军炮弹：由 EnemyTank 发射，用于攻击玩家武器。
 */
export class EnemyBullet {
  constructor(app, x, y, angle) {
    this.app = app;
    this.angle = angle;
    this.speed = ENEMY_BULLET_SPEED;
    this.radius = ENEMY_BULLET_RADIUS;

    this.sprite = new Graphics().circle(0, 0, this.radius).fill({ color: ENEMY_BULLET_COLOR });
    this.sprite.x = x;
    this.sprite.y = y;

    const world = this.app.world || this.app.stage;
    world.addChild(this.sprite);
  }

  update(deltaMS) {
    const step = (this.speed * deltaMS) / 1000;
    this.sprite.x += Math.cos(this.angle) * step;
    this.sprite.y += Math.sin(this.angle) * step;
  }

  isOutOfBounds() {
    const { x, y } = this.sprite;
    const r = this.radius;
    return x < -r || x > WORLD_WIDTH + r || y < -r || y > APP_HEIGHT + r;
  }

  destroy() {
    const world = this.app.world || this.app.stage;
    world.removeChild(this.sprite);
  }
}


