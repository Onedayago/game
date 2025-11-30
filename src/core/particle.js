import { Graphics } from 'pixi.js';

/**
 * 基础粒子对象，供 ParticleSystem 复用。
 */
export class Particle {
  constructor(texture, x, y, options = {}) {
    if (texture && texture.geometry) {
      this.sprite = new Graphics(texture.geometry);
    } else {
      this.sprite = new Graphics();
    }

    this.type = options.type || 'circle';
    this.color = options.color || 0xffffff;
    this.size = options.size || 5;
    this.life = options.life || 1.0;
    this.maxLife = this.life;
    this.velocity = options.velocity || { x: 0, y: 0 };
    this.alphaStart = options.alphaStart ?? 1;
    this.alphaEnd = options.alphaEnd ?? 0;
    this.scaleStart = options.scaleStart ?? 1;
    this.scaleEnd = options.scaleEnd ?? 0;
    this.rotationSpeed = options.rotationSpeed || 0;

    this.draw();

    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.alpha = this.alphaStart;
    this.sprite.scale.set(this.scaleStart);
  }

  draw() {
    this.sprite.clear();
    if (this.type === 'circle') {
      this.sprite.circle(0, 0, this.size).fill({ color: this.color });
    } else if (this.type === 'rect') {
      this.sprite.rect(-this.size / 2, -this.size / 2, this.size, this.size).fill({
        color: this.color,
      });
    }
  }

  update(deltaMS) {
    const dt = deltaMS / 1000;
    this.life -= dt;

    this.sprite.x += this.velocity.x * dt;
    this.sprite.y += this.velocity.y * dt;
    this.sprite.rotation += this.rotationSpeed * dt;

    const progress = 1 - this.life / this.maxLife;

    this.sprite.alpha = this.alphaStart + (this.alphaEnd - this.alphaStart) * progress;

    const currentScale = this.scaleStart + (this.scaleEnd - this.scaleStart) * progress;
    this.sprite.scale.set(currentScale);

    return this.life > 0;
  }

  destroy() {
    if (this.sprite.parent) {
      this.sprite.parent.removeChild(this.sprite);
    }
    this.sprite.destroy();
  }
}


