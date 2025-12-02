/**
 * 粒子类
 * 单个粒子对象，用于创建各种视觉特效
 * 
 * 特点：
 * - 支持生命周期管理
 * - 支持透明度和缩放动画
 * - 支持速度和旋转
 * - 自动渐变效果（从起始状态到结束状态）
 */

import { Graphics } from 'pixi.js';

/**
 * 粒子构造函数
 * @param {*} texture - 纹理对象（可选，通常为null）
 * @param {number} x - 初始X坐标
 * @param {number} y - 初始Y坐标
 * @param {Object} options - 粒子配置选项
 * @param {string} options.type - 粒子类型（'circle'或'rect'）
 * @param {number} options.color - 粒子颜色（十六进制）
 * @param {number} options.size - 粒子大小
 * @param {number} options.life - 生命时长（秒）
 * @param {Object} options.velocity - 速度向量 {x, y}
 * @param {number} options.alphaStart - 起始透明度（0-1）
 * @param {number} options.alphaEnd - 结束透明度（0-1）
 * @param {number} options.scaleStart - 起始缩放
 * @param {number} options.scaleEnd - 结束缩放
 * @param {number} options.rotationSpeed - 旋转速度（弧度/秒）
 */
export class Particle {
  constructor(texture, x, y, options = {}) {
    if (texture && texture.geometry) {
      this.sprite = new Graphics(texture.geometry);
    } else {
      this.sprite = new Graphics();
    }

    // 粒子外观属性
    this.type = options.type || 'circle';              // 粒子形状
    this.color = options.color || 0xffffff;            // 粒子颜色
    this.size = options.size || 5;                     // 粒子大小
    
    // 生命周期属性
    this.life = options.life || 1.0;                   // 剩余生命（秒）
    this.maxLife = this.life;                          // 最大生命（用于计算进度）
    
    // 运动属性
    this.velocity = options.velocity || { x: 0, y: 0 }; // 速度向量
    this.rotationSpeed = options.rotationSpeed || 0;   // 旋转速度
    
    // 动画属性（从起始值渐变到结束值）
    this.alphaStart = options.alphaStart ?? 1;         // 起始透明度
    this.alphaEnd = options.alphaEnd ?? 0;             // 结束透明度
    this.scaleStart = options.scaleStart ?? 1;         // 起始缩放
    this.scaleEnd = options.scaleEnd ?? 0;             // 结束缩放

    // 绘制粒子图形
    this.draw();

    // 设置初始位置和状态
    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.alpha = this.alphaStart;
    this.sprite.scale.set(this.scaleStart);
  }

  /**
   * 绘制粒子图形
   * 根据类型绘制圆形或矩形
   */
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

  /**
   * 更新粒子状态
   * 每帧调用，更新位置、旋转、透明度和缩放
   * 
   * @param {number} deltaMS - 距上一帧的时间（毫秒）
   * @returns {boolean} 粒子是否仍然存活
   */
  update(deltaMS) {
    // 转换为秒
    const dt = deltaMS / 1000;
    
    // 减少生命值
    this.life -= dt;

    // 更新位置（根据速度）
    this.sprite.x += this.velocity.x * dt;
    this.sprite.y += this.velocity.y * dt;
    
    // 更新旋转
    this.sprite.rotation += this.rotationSpeed * dt;

    // 计算生命周期进度（0到1）
    const progress = 1 - this.life / this.maxLife;

    // 根据进度在起始值和结束值之间插值
    // 透明度渐变
    this.sprite.alpha = this.alphaStart + (this.alphaEnd - this.alphaStart) * progress;

    // 缩放渐变
    const currentScale = this.scaleStart + (this.scaleEnd - this.scaleStart) * progress;
    this.sprite.scale.set(currentScale);

    // 返回粒子是否仍然存活
    return this.life > 0;
  }

  /**
   * 销毁粒子
   * 从父容器中移除并释放资源
   */
  destroy() {
    if (this.sprite.parent) {
      this.sprite.parent.removeChild(this.sprite);
    }
    this.sprite.destroy();
  }
}


