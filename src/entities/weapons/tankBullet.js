import { Graphics } from 'pixi.js';
import { APP_HEIGHT, WORLD_WIDTH } from '../../constants';

/**
 * 绿色主战坦克的子弹，带轻微呼吸光效，使尺寸看起来更精致。
 */
export class TankBullet {
  constructor(app, x, y, angle, radius, color, speed) {
    this.app = app;
    this.speed = speed;
    this.angle = angle;
    this.baseRadius = radius;
    this.radius = radius;
    this.color = color;
    this.age = 0;

    this.sprite = new Graphics();
    this.draw(radius);
    this.sprite.x = x;
    this.sprite.y = y;

    const world = this.app.world || this.app.stage;
    world.addChild(this.sprite);
  }

  draw(radius) {
    this.sprite.clear();
    const glowRadius = radius * 1.9;
    const coreRadius = radius * 1.15;

    this.sprite
      .circle(0, 0, glowRadius)
      .fill({ color: this.color, alpha: 0.18 })
      .circle(0, 0, coreRadius)
      .fill({ color: this.color, alpha: 0.65 })
      .circle(0, 0, radius)
      .fill({ color: 0xffffff, alpha: 0.9 });
  }

  update(deltaMS) {
    const dt = deltaMS / 1000;
    this.age += deltaMS;

    // 轻微的呼吸动画，让子弹尺寸显得更柔和
    const pulse = 1 + Math.sin(this.age * 0.01) * 0.12;
    this.radius = this.baseRadius * pulse;
    this.draw(this.radius);

    const step = this.speed * dt;
    this.sprite.x += Math.cos(this.angle) * step;
    this.sprite.y += Math.sin(this.angle) * step;
  }

  isOutOfBounds() {
    const { x, y } = this.sprite;
    const r = this.baseRadius * 2; // 依据最大可视尺寸来判断出界
    return x < -r || x > WORLD_WIDTH + r || y < -r || y > APP_HEIGHT + r;
  }

  destroy() {
    const world = this.app.world || this.app.stage;
    world.removeChild(this.sprite);
  }
}

