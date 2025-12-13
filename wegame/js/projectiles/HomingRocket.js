/**
 * 追踪火箭
 */

import { GameConfig } from '../config/GameConfig';
import { ColorUtils, GameColors } from '../config/Colors';
import { GameContext } from '../core/GameContext';

export class HomingRocket {
  constructor(ctx, x, y, target, damage) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.target = target;
    this.damage = damage;
    this.speed = GameConfig.BULLET_SPEED * 1.5;
    this.radius = GameConfig.BULLET_RADIUS;
    this.destroyed = false;
    this.lifetime = 5000; // 5秒
    this.age = 0;
    
    // 追踪相关属性
    this.angle = 0; // 当前飞行角度（弧度）
    this.turnRate = Math.PI * 2; // 转向速度（弧度/秒），每秒可以转一圈
    this.velocityX = 0; // 当前速度X分量
    this.velocityY = 0; // 当前速度Y分量
    
    // 视觉效果属性（简化）
    this.trailLength = 3; // 尾迹长度（历史位置数量）
    this.trailPositions = []; // 尾迹位置历史
  }
  
  /**
   * 更新火箭
   */
  update(deltaTime, deltaMS, enemies) {
    if (this.destroyed) return;
    
    this.age += deltaMS;
    if (this.age >= this.lifetime) {
      this.destroyed = true;
      return;
    }
    
    // 检查目标是否有效
    if (!this.target || this.target.destroyed) {
      // 寻找新目标
      this.target = this.findNearestEnemy(enemies);
      if (!this.target) {
        this.destroyed = true;
        return;
      }
    }
    
    // 计算到目标的方向
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // 如果到达目标，造成伤害
    const targetSize = this.target.size || GameConfig.ENEMY_SIZE || 20;
    if (dist < this.radius + targetSize / 2) {
      this.target.takeDamage(this.damage);
      this.destroyed = true;
      
      // 创建爆炸粒子效果
      const gameContext = GameContext.getInstance();
      if (gameContext.particleManager) {
        gameContext.particleManager.createExplosion(
          this.x,
          this.y,
          GameColors.ROCKET_BULLET,
          GameConfig.PARTICLE_EXPLOSION_COUNT
        );
      }
      
      return;
    }
    
    // 平滑追踪目标
    const targetAngle = Math.atan2(dy, dx);
    
    // 计算角度差（归一化到 -π 到 π）
    let angleDiff = targetAngle - this.angle;
    // 将角度差归一化到 [-π, π]
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    
    // 根据转向速度平滑转向
    const maxTurn = this.turnRate * deltaTime;
    if (Math.abs(angleDiff) > maxTurn) {
      // 如果角度差大于最大转向角度，则转向最大角度
      this.angle += Math.sign(angleDiff) * maxTurn;
    } else {
      // 否则直接转向目标角度
      this.angle = targetAngle;
    }
    
    // 根据当前角度更新速度
    this.velocityX = Math.cos(this.angle) * this.speed;
    this.velocityY = Math.sin(this.angle) * this.speed;
    
    // 更新位置
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
    
    // 更新尾迹历史
    this.trailPositions.push({ x: this.x, y: this.y, age: 0 });
    if (this.trailPositions.length > this.trailLength) {
      this.trailPositions.shift();
    }
    
    // 更新尾迹年龄
    for (let i = 0; i < this.trailPositions.length; i++) {
      this.trailPositions[i].age += deltaMS;
    }
  }
  
  /**
   * 寻找最近的敌人（优化：使用距离平方）
   */
  findNearestEnemy(enemies) {
    if (!enemies || enemies.length === 0) return null;
    
    let nearest = null;
    let minDistSq = Infinity;
    
    for (const enemy of enemies) {
      if (!enemy || enemy.destroyed) continue;
      
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const distSq = dx * dx + dy * dy; // 使用距离平方，避免sqrt
      
      if (distSq < minDistSq) {
        minDistSq = distSq;
        nearest = enemy;
      }
    }
    
    return nearest;
  }
  
  /**
   * 检查是否在视锥内
   */
  isInView(viewLeft, viewRight, viewTop, viewBottom) {
    const margin = this.radius * 3; // 考虑尾迹大小
    return this.x + margin >= viewLeft && 
           this.x - margin <= viewRight &&
           this.y + margin >= viewTop && 
           this.y - margin <= viewBottom;
  }
  
  /**
   * 渲染火箭（带视锥剔除，参考原 Cocos 游戏简洁风格）
   */
  render(viewLeft = -Infinity, viewRight = Infinity, viewTop = -Infinity, viewBottom = Infinity) {
    if (this.destroyed) return;
    
    // 视锥剔除：只渲染屏幕内的火箭
    if (!this.isInView(viewLeft, viewRight, viewTop, viewBottom)) {
      return;
    }
    
    this.ctx.save();
    
    // 移动到火箭位置并旋转
    this.ctx.translate(this.x, this.y);
    this.ctx.rotate(this.angle);
    
    // 绘制短尾迹（简洁版）
    if (this.trailPositions.length > 1) {
      const lastPos = this.trailPositions[this.trailPositions.length - 2];
      const dx = this.x - lastPos.x;
      const dy = this.y - lastPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0.1) {
        const angle = Math.atan2(dy, dx);
        
        this.ctx.save();
        this.ctx.translate(lastPos.x - this.x, lastPos.y - this.y);
        this.ctx.rotate(angle);
        
        // 简洁尾迹
        const trailGradient = this.ctx.createLinearGradient(0, 0, Math.min(dist, this.radius * 1.5), 0);
        trailGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.ROCKET_BULLET, 0.4));
        trailGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.ROCKET_BULLET, 0));
        
        this.ctx.strokeStyle = trailGradient;
        this.ctx.lineWidth = this.radius * 0.8;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(Math.min(dist, this.radius * 1.5), 0);
        this.ctx.stroke();
        
        this.ctx.restore();
      }
    }
    
    // 绘制火箭主体（椭圆形，无发光效果）
    const bodyGradient = this.ctx.createLinearGradient(-this.radius * 0.6, 0, this.radius * 0.6, 0);
    bodyGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 1));
    bodyGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.ROCKET_BULLET, 1));
    bodyGradient.addColorStop(1, ColorUtils.hexToCanvas(0xffffff, 1));
    this.ctx.fillStyle = bodyGradient;
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, this.radius * 0.7, this.radius * 0.5, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 绘制头部高光
    this.ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.8);
    this.ctx.beginPath();
    this.ctx.ellipse(this.radius * 0.3, 0, this.radius * 0.2, this.radius * 0.15, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }
}

