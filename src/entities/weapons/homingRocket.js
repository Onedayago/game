import { Graphics } from 'pixi.js';
import {
  BULLET_DAMAGE,
  BULLET_RADIUS,
  BULLET_SPEED,
  WORLD_WIDTH,
  APP_HEIGHT,
  COLORS,
} from '../../constants';

export class HomingRocket {
  constructor(app, x, y, angle, target, options = {}) {
    this.app = app;
    this.target = target;
    this.speed = options.speed ?? BULLET_SPEED * 1.2;
    this.turnRate = options.turnRate ?? Math.PI * 1.5;
    this.damage = options.damage ?? BULLET_DAMAGE * 2;
    this.radius = options.radius ?? BULLET_RADIUS * 1.2;
    this.color = options.color ?? COLORS.ROCKET_BULLET;
    this.angle = angle;
    this.age = 0;

    this.sprite = new Graphics();
    this.draw();
    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.rotation = angle;

    const world = this.app.world || this.app.stage;
    world.addChild(this.sprite);
  }

  draw() {
    const length = this.radius * 4.2;
    const bodyWidth = this.radius * 1.4;
    const finWidth = bodyWidth * 0.6;
    const finHeight = this.radius * 1.6;

    this.sprite.clear();
    this.sprite
      .roundRect(-this.radius, -bodyWidth / 2, length, bodyWidth, bodyWidth * 0.45)
      .fill({ color: this.color })
      .stroke({ width: 2, color: 0x3f1d0b, alpha: 0.6 })
      .roundRect(
        length * 0.4,
        -bodyWidth * 0.35,
        length * 0.35,
        bodyWidth * 0.7,
        bodyWidth * 0.35,
      )
      .fill({ color: 0xf97316, alpha: 0.9 })
      .circle(length * 0.75, 0, bodyWidth * 0.35)
      .fill({ color: 0xfef3c7, alpha: 0.95 });

    this.sprite
      .roundRect(-this.radius, -finHeight / 2, finWidth, finHeight, finWidth * 0.4)
      .fill({ color: COLORS.ROCKET_BODY, alpha: 0.9 })
      .roundRect(-this.radius, finHeight / 2 - finWidth / 2, finWidth, finWidth, finWidth * 0.4)
      .fill({ color: COLORS.ROCKET_BODY, alpha: 0.85 });

    this.sprite
      .circle(-this.radius - bodyWidth * 0.25, 0, bodyWidth * 0.4)
      .fill({ color: 0xf97316, alpha: 0.7 });
  }

  update(deltaMS) {
    const dt = deltaMS / 1000;
    this.age += deltaMS;
    const scalePulse = 1 + Math.sin(this.age * 0.008) * 0.08;
    this.sprite.scale.set(scalePulse);

    if (
      this.target
      && this.target.sprite
      && !this.target._dead
      && !this.target._finished
    ) {
      const tx = this.target.sprite.x;
      const ty = this.target.sprite.y;
      const desired = Math.atan2(ty - this.sprite.y, tx - this.sprite.x);
      let diff = desired - this.angle;
      diff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;
      const maxTurn = this.turnRate * dt;
      if (Math.abs(diff) > maxTurn) {
        diff = maxTurn * Math.sign(diff);
      }
      this.angle += diff;
    }

    this.sprite.x += Math.cos(this.angle) * this.speed * dt;
    this.sprite.y += Math.sin(this.angle) * this.speed * dt;
    this.sprite.rotation = this.angle;
  }

  isOutOfBounds() {
    const r = this.radius;
    return (
      this.sprite.x < -r
      || this.sprite.x > WORLD_WIDTH + r
      || this.sprite.y < -r
      || this.sprite.y > APP_HEIGHT + r
    );
  }

  destroy() {
    const world = this.app.world || this.app.stage;
    world.removeChild(this.sprite);
  }
}


