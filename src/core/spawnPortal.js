/**
 * 敌人生成传送门特效
 * 在敌人出现位置显示传送门动画
 */

import { Graphics } from 'pixi.js';
import { COLORS, CELL_SIZE } from '../constants';

/**
 * 传送门特效类
 */
export class SpawnPortal {
  /**
   * @param {Application} app - PixiJS应用实例
   * @param {number} x - 传送门X坐标
   * @param {number} y - 传送门Y坐标
   * @param {number} color - 传送门颜色（可选）
   */
  constructor(app, x, y, color = COLORS.ENEMY_DETAIL) {
    this.app = app;
    this.x = x;
    this.y = y;
    this.color = color;
    this.age = 0;
    this.lifetime = 800; // 存活时间（毫秒）
    this.maxRadius = CELL_SIZE * 0.7;
    
    // 创建传送门图形
    this.sprite = new Graphics();
    this.sprite.x = x;
    this.sprite.y = y;
    
    // 添加到世界容器
    const world = this.app.world || this.app.stage;
    world.addChild(this.sprite);
    
    this.updateVisuals();
  }

  /**
   * 更新传送门视觉效果
   */
  updateVisuals() {
    this.sprite.clear();
    
    const progress = this.age / this.lifetime;
    
    // 计算当前半径（从大到小）
    const radius = this.maxRadius * (1 - progress * 0.3);
    
    // 计算透明度（先增后减）
    let alpha;
    if (progress < 0.3) {
      alpha = progress / 0.3;
    } else if (progress < 0.7) {
      alpha = 1;
    } else {
      alpha = 1 - (progress - 0.7) / 0.3;
    }
    alpha = Math.max(0, Math.min(1, alpha));
    
    // 旋转角度
    const rotation = progress * Math.PI * 4;
    
    // 绘制外圈光晕
    this.sprite.circle(0, 0, radius * 1.2);
    this.sprite.fill({ color: this.color, alpha: alpha * 0.2 });
    
    // 绘制多层旋转圆环
    const ringCount = 3;
    for (let i = 0; i < ringCount; i++) {
      const ringRadius = radius * (0.8 - i * 0.2);
      const ringAlpha = alpha * (1 - i * 0.2);
      const ringRotation = rotation + (i * Math.PI / ringCount);
      
      // 绘制圆环
      this.sprite.circle(0, 0, ringRadius);
      this.sprite.stroke({ 
        width: 3, 
        color: this.color, 
        alpha: ringAlpha 
      });
      
      // 绘制旋转的装饰线
      const lineCount = 6;
      for (let j = 0; j < lineCount; j++) {
        const angle = ringRotation + (j * Math.PI * 2 / lineCount);
        const startX = Math.cos(angle) * ringRadius * 0.7;
        const startY = Math.sin(angle) * ringRadius * 0.7;
        const endX = Math.cos(angle) * ringRadius;
        const endY = Math.sin(angle) * ringRadius;
        
        this.sprite.moveTo(startX, startY);
        this.sprite.lineTo(endX, endY);
        this.sprite.stroke({ 
          width: 2, 
          color: 0xffffff, 
          alpha: ringAlpha * 0.6 
        });
      }
    }
    
    // 中心亮点
    const centerRadius = radius * 0.3 * (1 - progress * 0.5);
    this.sprite.circle(0, 0, centerRadius);
    this.sprite.fill({ color: 0xffffff, alpha: alpha * 0.8 });
    
    this.sprite.circle(0, 0, centerRadius * 0.6);
    this.sprite.fill({ color: this.color, alpha: alpha });
  }

  /**
   * 更新传送门状态
   * @param {number} deltaMS - 距上一帧的时间（毫秒）
   */
  update(deltaMS) {
    this.age += deltaMS;
    this.updateVisuals();
  }

  /**
   * 检查传送门是否应该被销毁
   * @returns {boolean}
   */
  shouldDestroy() {
    return this.age >= this.lifetime;
  }

  /**
   * 销毁传送门
   */
  destroy() {
    const world = this.app.world || this.app.stage;
    world.removeChild(this.sprite);
  }
}

