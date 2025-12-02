/**
 * 追踪火箭类
 * 火箭塔发射的追踪导弹，可以自动追踪目标
 * 
 * 特点：
 * - 自动追踪最近的敌人
 * - 平滑转向，不会瞬间改变方向
 * - 带有呼吸动画效果
 * - 造成更高伤害
 */

import { Graphics } from 'pixi.js';
import {
  BULLET_DAMAGE,
  BULLET_RADIUS,
  BULLET_SPEED,
  WORLD_WIDTH,
  APP_HEIGHT,
  COLORS,
} from '../../constants';

/**
 * 追踪火箭类
 */
export class HomingRocket {
  /**
   * 构造函数
   * @param {Application} app - PixiJS应用实例
   * @param {number} x - 初始X坐标
   * @param {number} y - 初始Y坐标
   * @param {number} angle - 初始发射角度（弧度）
   * @param {Object} target - 目标敌人对象
   * @param {Object} options - 配置选项
   * @param {number} options.speed - 飞行速度
   * @param {number} options.turnRate - 转向速率
   * @param {number} options.damage - 伤害值
   * @param {number} options.radius - 碰撞半径
   * @param {number} options.color - 颜色
   */
  constructor(app, x, y, angle, target, options = {}) {
    this.app = app;
    this.target = target;                                  // 追踪目标
    this.speed = options.speed ?? BULLET_SPEED * 1.2;      // 飞行速度
    this.turnRate = options.turnRate ?? Math.PI * 1.5;     // 转向速率（弧度/秒）
    this.damage = options.damage ?? BULLET_DAMAGE * 2;     // 伤害值
    this.radius = options.radius ?? BULLET_RADIUS * 1.2;   // 碰撞半径
    this.color = options.color ?? COLORS.ROCKET_BULLET;    // 火箭颜色
    this.angle = angle;                                    // 当前飞行角度
    this.age = 0;                                          // 存活时间（用于动画）

    // 创建火箭图形
    this.sprite = new Graphics();
    this.draw();
    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.rotation = angle;

    // 添加到世界容器
    const world = this.app.world || this.app.stage;
    world.addChild(this.sprite);
  }

  /**
   * 绘制火箭图形
   * 火箭外形：主体、弹头、尾翼、尾焰
   */
  draw() {
    const length = this.radius * 4.2;         // 火箭长度
    const bodyWidth = this.radius * 1.4;      // 弹体宽度
    const finWidth = bodyWidth * 0.6;         // 尾翼宽度
    const finHeight = this.radius * 1.6;      // 尾翼高度

    this.sprite.clear();
    
    // 主弹体
    this.sprite
      .roundRect(-this.radius, -bodyWidth / 2, length, bodyWidth, bodyWidth * 0.45)
      .fill({ color: this.color })
      .stroke({ width: 2, color: 0x3f1d0b, alpha: 0.6 });
    
    // 弹头装甲段
    this.sprite
      .roundRect(
        length * 0.4,
        -bodyWidth * 0.35,
        length * 0.35,
        bodyWidth * 0.7,
        bodyWidth * 0.35,
      )
      .fill({ color: 0xf97316, alpha: 0.9 });
    
    // 弹头顶端光点
    this.sprite
      .circle(length * 0.75, 0, bodyWidth * 0.35)
      .fill({ color: 0xfef3c7, alpha: 0.95 });

    // 上下尾翼
    this.sprite
      .roundRect(-this.radius, -finHeight / 2, finWidth, finHeight, finWidth * 0.4)
      .fill({ color: COLORS.ROCKET_BODY, alpha: 0.9 })
      .roundRect(-this.radius, finHeight / 2 - finWidth / 2, finWidth, finWidth, finWidth * 0.4)
      .fill({ color: COLORS.ROCKET_BODY, alpha: 0.85 });

    // 尾焰效果
    this.sprite
      .circle(-this.radius - bodyWidth * 0.25, 0, bodyWidth * 0.4)
      .fill({ color: 0xf97316, alpha: 0.7 });
  }

  /**
   * 更新火箭状态
   * 包括追踪目标、更新位置和动画
   * @param {number} deltaMS - 距上一帧的时间（毫秒）
   */
  update(deltaMS) {
    const dt = deltaMS / 1000;
    
    // 更新存活时间
    this.age += deltaMS;
    
    // 呼吸动画效果（轻微缩放）
    const scalePulse = 1 + Math.sin(this.age * 0.008) * 0.08;
    this.sprite.scale.set(scalePulse);

    // 如果目标存在且有效，则追踪目标
    if (
      this.target
      && this.target.sprite
      && !this.target._dead
      && !this.target._finished
    ) {
      // 计算目标位置
      const tx = this.target.sprite.x;
      const ty = this.target.sprite.y;
      
      // 计算到目标的期望角度
      const desired = Math.atan2(ty - this.sprite.y, tx - this.sprite.x);
      
      // 计算角度差
      let diff = desired - this.angle;
      
      // 标准化角度差到 [-π, π] 范围
      diff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;
      
      // 限制每帧最大转向角度（平滑转向）
      const maxTurn = this.turnRate * dt;
      if (Math.abs(diff) > maxTurn) {
        diff = maxTurn * Math.sign(diff);
      }
      
      // 更新当前角度
      this.angle += diff;
    }

    // 根据当前角度更新位置
    this.sprite.x += Math.cos(this.angle) * this.speed * dt;
    this.sprite.y += Math.sin(this.angle) * this.speed * dt;
    
    // 更新旋转（朝向飞行方向）
    this.sprite.rotation = this.angle;
  }

  /**
   * 检查火箭是否飞出屏幕
   * @returns {boolean} 是否超出边界
   */
  isOutOfBounds() {
    const r = this.radius;
    return (
      this.sprite.x < -r
      || this.sprite.x > WORLD_WIDTH + r
      || this.sprite.y < -r
      || this.sprite.y > APP_HEIGHT + r
    );
  }

  /**
   * 销毁火箭
   * 从世界容器中移除
   */
  destroy() {
    const world = this.app.world || this.app.stage;
    world.removeChild(this.sprite);
  }
}


