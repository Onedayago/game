/**
 * 声波攻击类
 * 声波坦克发射的范围攻击，可以同时伤害多个目标
 * 
 * 特点：
 * - 圆形扩散，范围逐渐增大
 * - 可以同时攻击范围内的多个武器
 * - 有存活时间限制
 * - 视觉效果为波纹扩散
 */

import { Graphics } from 'pixi.js';
import {
  APP_HEIGHT,
  WORLD_WIDTH,
  SONIC_WAVE_INITIAL_RADIUS,
  SONIC_WAVE_MAX_RADIUS,
  SONIC_WAVE_EXPAND_SPEED,
  SONIC_WAVE_LIFETIME,
  SONIC_WAVE_COLOR,
} from '../../constants';

/**
 * 声波类
 * 由 SonicTank 发射，用于范围攻击玩家武器
 */
export class SonicWave {
  /**
   * 构造函数
   * @param {Application} app - PixiJS应用实例
   * @param {number} x - 初始X坐标
   * @param {number} y - 初始Y坐标
   */
  constructor(app, x, y) {
    this.app = app;
    this.radius = SONIC_WAVE_INITIAL_RADIUS; // 当前半径
    this.maxRadius = SONIC_WAVE_MAX_RADIUS;  // 最大半径
    this.expandSpeed = SONIC_WAVE_EXPAND_SPEED; // 扩散速度
    this.lifetime = SONIC_WAVE_LIFETIME;     // 存活时间
    this.age = 0;                            // 已存活时间
    this.hitTargets = new Set();             // 已经击中的目标（防止重复伤害）

    // 创建声波图形（多层波纹效果）
    this.sprite = new Graphics();
    this.sprite.x = x;
    this.sprite.y = y;
    this.updateVisuals();

    // 添加到世界容器
    const world = this.app.world || this.app.stage;
    world.addChild(this.sprite);
  }

  /**
   * 更新声波视觉效果
   */
  updateVisuals() {
    this.sprite.clear();
    
    // 计算透明度（随时间衰减）
    const lifeRatio = 1 - this.age / this.lifetime;
    const baseAlpha = Math.min(lifeRatio * 0.9, 0.9); // 提高基础透明度
    
    // 绘制填充区域（半透明的圆形区域）
    this.sprite.circle(0, 0, this.radius);
    this.sprite.fill({ color: SONIC_WAVE_COLOR, alpha: baseAlpha * 0.2 });
    
    // 绘制多层波纹（使用描边）
    const waveCount = 4;
    for (let i = 0; i < waveCount; i++) {
      const offset = (i / waveCount) * 30; // 波纹间距
      const currentRadius = this.radius - offset;
      
      if (currentRadius > 5) {
        const alpha = baseAlpha * (1 - i * 0.15);
        const thickness = 4 + i * 0.5;
        
        // 绘制波纹圆环
        this.sprite.circle(0, 0, currentRadius);
        this.sprite.stroke({ width: thickness, color: SONIC_WAVE_COLOR, alpha: alpha });
      }
    }
    
    // 外层光晕
    this.sprite.circle(0, 0, this.radius + 8);
    this.sprite.stroke({ width: 3, color: 0xffffff, alpha: baseAlpha * 0.5 });
    
    // 中心闪光效果
    if (this.age < this.lifetime * 0.4) {
      const centerRatio = 1 - (this.age / (this.lifetime * 0.4));
      const centerAlpha = baseAlpha * centerRatio * 0.8;
      
      this.sprite.circle(0, 0, this.radius * 0.25);
      this.sprite.fill({ color: 0xffffff, alpha: centerAlpha });
      
      this.sprite.circle(0, 0, this.radius * 0.15);
      this.sprite.fill({ color: SONIC_WAVE_COLOR, alpha: Math.min(centerAlpha * 1.2, 1) });
    }
  }

  /**
   * 更新声波状态
   * @param {number} deltaMS - 距上一帧的时间（毫秒）
   */
  update(deltaMS) {
    // 更新年龄
    this.age += deltaMS;
    
    // 扩大半径
    const expandAmount = (this.expandSpeed * deltaMS) / 1000;
    this.radius = Math.min(this.radius + expandAmount, this.maxRadius);
    
    // 更新视觉效果
    this.updateVisuals();
  }

  /**
   * 检查声波是否应该被销毁
   * @returns {boolean} 是否应该销毁
   */
  shouldDestroy() {
    return this.age >= this.lifetime;
  }

  /**
   * 检查是否在范围内击中目标
   * @param {Object} target - 目标对象（应有x和y属性）
   * @param {number} targetRadius - 目标的碰撞半径
   * @returns {boolean} 是否击中
   */
  isHitting(target, targetRadius) {
    // 如果已经击中过这个目标，不再重复伤害
    if (this.hitTargets.has(target)) {
      return false;
    }
    
    // 计算目标到声波中心的距离
    const dx = target.x - this.sprite.x;
    const dy = target.y - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 检查目标是否在当前声波范围内
    // 使用扩散波纹判定：目标在当前半径内，且在之前还没被标记为击中
    // 这样声波扩散到目标时就会击中
    const isInWave = distance <= this.radius + targetRadius;
    
    return isInWave;
  }

  /**
   * 标记目标已被击中
   * @param {Object} target - 被击中的目标
   */
  markAsHit(target) {
    this.hitTargets.add(target);
  }

  /**
   * 销毁声波
   * 从世界容器中移除
   */
  destroy() {
    const world = this.app.world || this.app.stage;
    world.removeChild(this.sprite);
  }
}

