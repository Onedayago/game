/**
 * 粒子系统
 * 负责管理场景中所有一次性视觉特效
 * 
 * 主要功能：
 * - 集中管理所有粒子的生命周期
 * - 提供各种预设特效（爆炸、枪口火光、击中火花等）
 * - 自动清理过期粒子，控制性能
 * - 支持粒子池，避免频繁创建销毁对象
 */

import { Container } from 'pixi.js';
import { Particle } from './particle';

/**
 * 粒子系统类
 */
export class ParticleSystem {
  /**
   * 构造函数
   * @param {Application} app - PixiJS应用实例
   */
  constructor(app) {
    this.app = app;
    this.container = new Container();      // 粒子容器
    this.particles = [];                   // 活跃粒子数组
    this.maxParticles = 300;               // 最大粒子数量限制
  }

  /**
   * 初始化粒子系统
   * 将粒子容器添加到世界容器中
   * @param {Container} worldContainer - 世界容器
   */
  init(worldContainer) {
    this.container.zIndex = 1000;          // 设置为高层级，确保粒子在最上层显示
    this.container.eventMode = 'none';     // 禁用交互，粒子不响应鼠标事件
    worldContainer.addChild(this.container);
  }

  /**
   * 更新所有粒子
   * 每帧调用，更新粒子状态并清理死亡粒子
   * @param {number} deltaMS - 距上一帧的时间（毫秒）
   */
  update(deltaMS) {
    // 反向遍历，方便删除元素
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const particle = this.particles[i];
      // 如果粒子已死亡（update返回false），则销毁并移除
      if (!particle.update(deltaMS)) {
        particle.destroy();
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * 发射粒子
   * 基础粒子发射方法，可配置各种参数
   * 
   * @param {number} x - 发射位置X坐标
   * @param {number} y - 发射位置Y坐标
   * @param {Object} options - 配置选项
   * @param {number} options.count - 发射粒子数量
   * @param {number} options.speed - 粒子速度
   * @param {number} options.angle - 基础角度
   * @param {number} options.spread - 扩散范围（弧度）
   * @param {number} options.color - 粒子颜色
   * @param {number} options.size - 粒子大小
   * @param {number} options.life - 生命时长
   * @param {number} options.scaleStart - 起始缩放
   * @param {number} options.scaleEnd - 结束缩放
   * @param {number} options.alphaStart - 起始透明度
   * @param {number} options.alphaEnd - 结束透明度
   */
  emit(x, y, options = {}) {
    const {
      count = 1,              // 粒子数量
      speed = 100,            // 基础速度
      angle: baseAngle,       // 基础角度
      spread = 0,             // 扩散角度
    } = options;

    // 创建指定数量的粒子
    for (let i = 0; i < count; i += 1) {
      // 计算粒子发射角度（如果未指定则随机）
      const angle = baseAngle !== undefined ? baseAngle : Math.random() * Math.PI * 2;
      
      // 在基础角度上添加随机扩散
      const finalAngle = angle + (Math.random() - 0.5) * spread;
      
      // 速度添加随机变化（80%-120%）
      const finalSpeed = speed * (0.8 + Math.random() * 0.4);

      // 计算速度向量
      const velocity = {
        x: Math.cos(finalAngle) * finalSpeed,
        y: Math.sin(finalAngle) * finalSpeed,
      };

      // 创建粒子
      const particle = new Particle(null, x, y, {
        ...options,
        velocity,
      });
      
      // 添加到容器和管理数组
      this.container.addChild(particle.sprite);
      this.particles.push(particle);

      // 如果超过最大粒子数，移除最老的粒子
      if (this.particles.length > this.maxParticles) {
        const overflow = this.particles.length - this.maxParticles;
        for (let j = 0; j < overflow; j += 1) {
          const old = this.particles.shift();
          if (old) old.destroy();
        }
      }
    }
  }

  /**
   * 创建爆炸特效
   * 赛博朋克风格的霓虹爆炸效果
   * 包含多层粒子：冲击波、电子脉冲、核心闪光、余波、数据碎片、光环、电弧
   * 
   * @param {number} x - 爆炸位置X坐标
   * @param {number} y - 爆炸位置Y坐标
   * @param {number} color - 主色调（默认青色）
   * @param {number} count - 主粒子数量（默认12个）
   */
  createExplosion(x, y, color = 0x00ffff, count = 12) {
    // 外圈冲击波
    this.emit(x, y, {
      count: 1,
      color,
      size: 20,
      life: 0.6,
      speed: 0,
      scaleStart: 1,
      scaleEnd: 4,
      alphaStart: 0.8,
      alphaEnd: 0,
    });
    
    // 电子脉冲主波
    this.emit(x, y, {
      count,
      color,
      size: 8,
      life: 0.9,
      speed: 250,
      spread: Math.PI * 2,
      scaleStart: 2.5,
      scaleEnd: 0,
      alphaStart: 1,
      alphaEnd: 0,
      rotationSpeed: Math.PI * 3,
    });

    // 霓虹白色核心闪光
    this.emit(x, y, {
      count: 1,
      color: 0xffffff,
      size: 20,
      life: 0.25,
      speed: 0,
      scaleStart: 2,
      scaleEnd: 3.5,
      alphaStart: 1,
      alphaEnd: 0,
    });
    
    // 余波粒子
    this.emit(x, y, {
      count: 6,
      color,
      size: 4,
      life: 0.5,
      speed: 120,
      spread: Math.PI * 2,
      scaleStart: 1.5,
      scaleEnd: 0.3,
      alphaStart: 0.8,
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

  /**
   * 创建枪口火光特效
   * 武器开火时的霓虹闪光效果
   * 包含：能量波纹、中心闪光、能量环、前向冲击波、尾迹粒子、霓虹脉冲
   * 
   * @param {number} x - 发射位置X坐标
   * @param {number} y - 发射位置Y坐标
   * @param {number} angle - 发射角度（弧度）
   * @param {number} color - 主色调（默认青色）
   */
  createMuzzleFlash(x, y, angle, color = 0x00ffff) {
    // 外圈能量波纹
    this.emit(x, y, {
      count: 1,
      color,
      size: 18,
      life: 0.3,
      speed: 0,
      scaleStart: 1,
      scaleEnd: 3,
      alphaStart: 0.4,
      alphaEnd: 0,
    });
    
    // 霓虹中心闪光
    this.emit(x, y, {
      count: 1,
      color: 0xffffff,
      size: 15,
      life: 0.18,
      speed: 0,
      scaleStart: 2,
      scaleEnd: 2.8,
      alphaStart: 1,
      alphaEnd: 0,
    });

    // 主色能量环
    this.emit(x, y, {
      count: 1,
      color,
      size: 12,
      life: 0.22,
      speed: 0,
      scaleStart: 1.2,
      scaleEnd: 2.2,
      alphaStart: 0.9,
      alphaEnd: 0,
    });

    // 前向冲击波
    this.emit(x, y, {
      count: 6,
      color,
      size: 6,
      life: 0.3,
      angle,
      speed: 220,
      spread: Math.PI * 0.4,
      scaleStart: 1.5,
      scaleEnd: 0.2,
      alphaStart: 0.95,
      alphaEnd: 0,
    });

    // 霓虹尾迹粒子
    this.emit(x, y, {
      count: 4,
      color,
      size: 5,
      life: 0.25,
      angle: angle + Math.PI,
      speed: 120,
      spread: Math.PI * 0.7,
      scaleStart: 1.2,
      scaleEnd: 0.1,
      alphaStart: 0.8,
      alphaEnd: 0,
    });
    
    // 额外的霓虹脉冲
    this.emit(x, y, {
      count: 1,
      color: 0xff00ff, // 洋红脉冲
      size: 10,
      life: 0.22,
      speed: 0,
      scaleStart: 0.9,
      scaleEnd: 1.8,
      alphaStart: 0.7,
      alphaEnd: 0,
    });
  }

  /**
   * 创建击中火花特效
   * 子弹击中目标时的霓虹火花效果
   * 包含：冲击波、霓虹闪光、能量爆裂、小型火花、光环、电弧
   * 
   * @param {number} x - 击中位置X坐标
   * @param {number} y - 击中位置Y坐标
   * @param {number} color - 主色调（默认青色）
   */
  createHitSpark(x, y, color = 0x00ffff) {
    // 外圈冲击波
    this.emit(x, y, {
      count: 1,
      color,
      size: 16,
      life: 0.4,
      speed: 0,
      scaleStart: 1,
      scaleEnd: 3,
      alphaStart: 0.6,
      alphaEnd: 0,
    });
    
    // 霓虹击中闪光
    this.emit(x, y, {
      count: 1,
      color: 0xffffff,
      size: 14,
      life: 0.15,
      speed: 0,
      scaleStart: 1.5,
      scaleEnd: 2.2,
      alphaStart: 1,
      alphaEnd: 0,
    });

    // 主色能量爆裂
    this.emit(x, y, {
      count: 8,
      color,
      size: 6,
      life: 0.35,
      speed: 150,
      spread: Math.PI * 2,
      scaleStart: 1.5,
      scaleEnd: 0.1,
      alphaStart: 1,
      alphaEnd: 0,
      rotationSpeed: Math.PI * 2,
    });
    
    // 小型火花
    this.emit(x, y, {
      count: 4,
      color: 0xfef3c7,
      size: 3,
      life: 0.2,
      speed: 80,
      spread: Math.PI * 2,
      scaleStart: 1,
      scaleEnd: 0,
      alphaStart: 0.8,
      alphaEnd: 0,
    });

    // 霓虹光环
    this.emit(x, y, {
      count: 1,
      color,
      size: 10,
      life: 0.2,
      speed: 0,
      scaleStart: 1,
      scaleEnd: 2.5,
      alphaStart: 0.9,
      alphaEnd: 0,
    });

    // 电弧效果
    this.emit(x, y, {
      count: 6,
      color: 0xff00ff, // 洋红电弧
      size: 3,
      life: 0.3,
      speed: 160,
      spread: Math.PI * 1.5,
      alphaStart: 0.95,
      alphaEnd: 0,
      scaleStart: 1.2,
      scaleEnd: 0,
      rotationSpeed: Math.PI * 5,
    });
  }
}

// 导出全局单例
export const particleSystem = new ParticleSystem();

