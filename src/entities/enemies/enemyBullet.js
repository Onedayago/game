/**
 * 敌军子弹类
 * 敌人坦克发射的子弹，用于攻击玩家的防御武器
 * 
 * 特点：
 * - 直线飞行，不会追踪目标
 * - 碰到武器会造成伤害
 * - 超出边界自动销毁
 * - 支持响应式布局
 */

import { Graphics } from 'pixi.js';
import {
  ENEMY_BULLET_COLOR,
  ENEMY_BULLET_RADIUS,
  ENEMY_BULLET_SPEED,
} from '../../constants';
import { responsiveLayout } from '../../app/ResponsiveLayout';

/**
 * 敌军子弹类
 * 由 EnemyTank 发射，用于攻击玩家武器
 */
export class EnemyBullet {
  /**
   * 构造函数
   * @param {Application} app - PixiJS应用实例
   * @param {number} x - 初始X坐标
   * @param {number} y - 初始Y坐标
   * @param {number} angle - 飞行角度（弧度）
   */
  constructor(app, x, y, angle) {
    this.app = app;
    this.angle = angle;                   // 飞行角度
    
    // 速度和尺寸按比例缩放，保持视觉一致性
    const layout = responsiveLayout.getLayout();
    const scale = layout.scale || 1;
    this.speed = ENEMY_BULLET_SPEED * scale;  // 飞行速度（按比例缩放）
    this.radius = layout.ENEMY_BULLET_RADIUS || ENEMY_BULLET_RADIUS;  // 碰撞半径（按比例缩放）

    // 创建圆形子弹图形
    this.sprite = new Graphics().circle(0, 0, this.radius).fill({ color: ENEMY_BULLET_COLOR });
    this.sprite.x = x;
    this.sprite.y = y;

    // 添加到世界容器
    const world = this.app.world || this.app.stage;
    world.addChild(this.sprite);
  }

  /**
   * 更新子弹位置
   * @param {number} deltaMS - 距上一帧的时间（毫秒）
   */
  update(deltaMS) {
    // 计算本帧移动距离
    const step = (this.speed * deltaMS) / 1000;
    
    // 沿着角度方向移动
    this.sprite.x += Math.cos(this.angle) * step;
    this.sprite.y += Math.sin(this.angle) * step;
  }

  /**
   * 检查子弹是否飞出屏幕
   * @returns {boolean} 是否超出边界
   */
  isOutOfBounds() {
    const layout = responsiveLayout.getLayout();
    const { x, y } = this.sprite;
    const r = this.radius;
    return x < -r || x > layout.WORLD_WIDTH + r || y < -r || y > layout.BATTLE_HEIGHT + r;
  }

  /**
   * 销毁子弹
   * 从世界容器中移除
   */
  destroy() {
    const world = this.app.world || this.app.stage;
    world.removeChild(this.sprite);
  }
}
