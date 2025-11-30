import { Container } from 'pixi.js';
import { Particle } from './particle';

/**
 * Lightweight particle instance used by ParticleSystem.
 * texture 参数仅在想要克隆已有 Graphics 几何体时使用，
 * 常规情况直接生成新的 Graphics 即可。
 */
/**
 * 粒子系统：负责管理场景中所有一次性特效
 * （炮口闪光、爆炸、火花等），集中更新与销毁。
 */
export class ParticleSystem {
  constructor(app) {
    this.app = app;
    this.container = new Container();
    this.particles = [];
    this.maxParticles = 300;
  }

  init(worldContainer) {
    this.container.zIndex = 1000;
    this.container.eventMode = 'none';
    worldContainer.addChild(this.container);
  }

  update(deltaMS) {
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const particle = this.particles[i];
      if (!particle.update(deltaMS)) {
        particle.destroy();
        this.particles.splice(i, 1);
      }
    }
  }

  emit(x, y, options = {}) {
    const {
      count = 1,
      speed = 100,
      angle: baseAngle,
      spread = 0,
    } = options;

    for (let i = 0; i < count; i += 1) {
      const angle = baseAngle !== undefined ? baseAngle : Math.random() * Math.PI * 2;
      const finalAngle = angle + (Math.random() - 0.5) * spread;
      const finalSpeed = speed * (0.8 + Math.random() * 0.4);

      const velocity = {
        x: Math.cos(finalAngle) * finalSpeed,
        y: Math.sin(finalAngle) * finalSpeed,
      };

      const particle = new Particle(null, x, y, {
        ...options,
        velocity,
      });
      this.container.addChild(particle.sprite);
      this.particles.push(particle);

      if (this.particles.length > this.maxParticles) {
        const overflow = this.particles.length - this.maxParticles;
        for (let j = 0; j < overflow; j += 1) {
          const old = this.particles.shift();
          if (old) old.destroy();
        }
      }
    }
  }

  createExplosion(x, y, color = 0x00ffff, count = 10) {
    // 电子脉冲主波
    this.emit(x, y, {
      count,
      color,
      size: 6,
      life: 0.8,
      speed: 200,
      spread: Math.PI * 2,
      scaleStart: 2,
      scaleEnd: 0,
      alphaStart: 1,
      alphaEnd: 0,
      rotationSpeed: Math.PI * 3,
    });

    // 霓虹白色核心闪光
    this.emit(x, y, {
      count: 1,
      color: 0xffffff,
      size: 15,
      life: 0.2,
      speed: 0,
      scaleStart: 1.8,
      scaleEnd: 3,
      alphaStart: 1,
      alphaEnd: 0,
    });

    // 电子烟雾/数据碎片
    this.emit(x, y, {
      count: Math.max(1, Math.floor(count / 2)),
      color: 0x9d00ff, // 紫色数据碎片
      size: 8,
      life: 1.3,
      speed: 70,
      spread: Math.PI * 2,
      alphaStart: 0.8,
      alphaEnd: 0,
      scaleStart: 1.2,
      scaleEnd: 2,
    });

    // 霓虹光环扩散
    this.emit(x, y, {
      count: 4,
      color,
      size: 10,
      life: 0.5,
      speed: 140,
      spread: Math.PI * 2,
      alphaStart: 0.7,
      alphaEnd: 0,
      scaleStart: 1.5,
      scaleEnd: 0.3,
    });

    // 额外的电弧效果
    this.emit(x, y, {
      count: 6,
      color: 0xff00ff, // 洋红电弧
      size: 4,
      life: 0.4,
      speed: 160,
      spread: Math.PI * 2,
      alphaStart: 0.9,
      alphaEnd: 0,
      scaleStart: 1,
      scaleEnd: 0,
      rotationSpeed: Math.PI * 4,
    });
  }

  createMuzzleFlash(x, y, angle, color = 0x00ffff) {
    // 霓虹中心闪光
    this.emit(x, y, {
      count: 1,
      color: 0xffffff,
      size: 12,
      life: 0.15,
      speed: 0,
      scaleStart: 1.5,
      scaleEnd: 2.2,
      alphaStart: 1,
      alphaEnd: 0,
    });

    // 霓虹彩色光环
    this.emit(x, y, {
      count: 1,
      color,
      size: 10,
      life: 0.18,
      speed: 0,
      scaleStart: 1,
      scaleEnd: 1.8,
      alphaStart: 0.9,
      alphaEnd: 0,
    });

    // 电子火花飞溅
    this.emit(x, y, {
      count: 8,
      color,
      size: 3,
      life: 0.3,
      speed: 240,
      angle,
      spread: 0.7,
      scaleStart: 1.3,
      scaleEnd: 0,
      alphaStart: 1,
      alphaEnd: 0,
      rotationSpeed: Math.PI * 4,
    });

    // 电子尾迹
    this.emit(x, y, {
      count: 4,
      color: 0x9d00ff, // 紫色电子尾迹
      size: 5,
      life: 0.35,
      speed: 100,
      angle,
      spread: 0.5,
      alphaStart: 0.7,
      alphaEnd: 0,
      scaleStart: 1,
      scaleEnd: 1.5,
    });

    // 额外的霓虹脉冲
    this.emit(x, y, {
      count: 1,
      color: 0xff00ff, // 洋红脉冲
      size: 8,
      life: 0.2,
      speed: 0,
      scaleStart: 0.8,
      scaleEnd: 1.6,
      alphaStart: 0.6,
      alphaEnd: 0,
    });
  }

  createHitSpark(x, y, color = 0x00ffff) {
    // 霓虹击中闪光
    this.emit(x, y, {
      count: 1,
      color: 0xffffff,
      size: 10,
      life: 0.12,
      speed: 0,
      scaleStart: 1.2,
      scaleEnd: 1.8,
      alphaStart: 1,
      alphaEnd: 0,
    });

    // 电子火花飞溅
    this.emit(x, y, {
      count: 10,
      color,
      size: 3,
      life: 0.35,
      speed: 180,
      spread: Math.PI * 1.8,
      alphaStart: 1,
      alphaEnd: 0,
      scaleStart: 1.4,
      scaleEnd: 0,
      rotationSpeed: Math.PI * 3,
    });

    // 霓虹光环
    this.emit(x, y, {
      count: 1,
      color,
      size: 8,
      life: 0.18,
      speed: 0,
      scaleStart: 1,
      scaleEnd: 2,
      alphaStart: 0.8,
      alphaEnd: 0,
    });

    // 电弧效果
    this.emit(x, y, {
      count: 5,
      color: 0xff00ff, // 洋红电弧
      size: 2,
      life: 0.25,
      speed: 140,
      spread: Math.PI,
      alphaStart: 0.9,
      alphaEnd: 0,
      scaleStart: 1,
      scaleEnd: 0,
      rotationSpeed: Math.PI * 4,
    });
  }
}

export const particleSystem = new ParticleSystem();

