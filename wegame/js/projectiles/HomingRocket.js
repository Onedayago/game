/**
 * 追踪火箭
 */

import { GameConfig } from '../config/GameConfig';
import { WeaponStatsConfig } from '../config/WeaponStatsConfig';
import { HomingRocketConfig } from '../config/weapons/HomingRocketConfig';
import { EnemyTankConfig } from '../config/enemies/EnemyTankConfig';
import { ParticleConfig } from '../config/ParticleConfig';
import { ColorUtils, GameColors } from '../config/Colors';
import { GameContext } from '../core/GameContext';
import { HomingRocketRenderer } from '../rendering/projectiles/HomingRocketRenderer';

export class HomingRocket {
  // 离屏Canvas缓存（静态，只缓存火箭主体，不包含尾迹）
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _cacheRadius = 0;
  static _initialized = false;
  
  constructor(ctx, x, y, target, damage) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.target = target;
    this.damage = damage;
    this.speed = WeaponStatsConfig.BULLET_BASE_SPEED * HomingRocketConfig.SPEED_MULTIPLIER;
    this.radius = HomingRocketConfig.RADIUS;
    this.destroyed = false;
    this.lifetime = HomingRocketConfig.MAX_LIFETIME;
    this.age = 0;
    
    // 追踪相关属性
    this.angle = 0; // 当前飞行角度（弧度）
    this.turnRate = HomingRocketConfig.TURN_RATE;
    this.velocityX = 0; // 当前速度X分量
    this.velocityY = 0; // 当前速度Y分量
    
    // 视觉效果属性（简化）
    this.trailLength = 3; // 尾迹长度（历史位置数量）
    this.trailPositions = []; // 尾迹位置历史
  }
  
  /**
   * 初始化火箭渲染缓存（只缓存主体，尾迹动态绘制）
   */
  static initCache(radius) {
    if (this._initialized && this._cacheRadius === radius) {
      return;
    }
    
    const canvasSize = Math.ceil(radius * 3);
    
    this._cachedCanvas = wx.createCanvas();
    this._cachedCanvas.width = canvasSize;
    this._cachedCanvas.height = canvasSize;
    
    this._cachedCtx = this._cachedCanvas.getContext('2d');
    this._cacheRadius = radius;
    
    this._cachedCtx.clearRect(0, 0, canvasSize, canvasSize);
    
    this.drawRocketBodyToCache(this._cachedCtx, radius, canvasSize / 2, canvasSize / 2);
    
    this._initialized = true;
  }
  
  /**
   * 绘制火箭主体到缓存Canvas（角度=0，向右）
   */
  static drawRocketBodyToCache(ctx, radius, centerX, centerY) {
    // 绘制火箭主体（椭圆形，无发光效果）
    const bodyGradient = ctx.createLinearGradient(centerX - radius * 0.6, centerY, centerX + radius * 0.6, centerY);
    bodyGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 1));
    bodyGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.ROCKET_BULLET, 1));
    bodyGradient.addColorStop(1, ColorUtils.hexToCanvas(0xffffff, 1));
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius * 0.7, radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制头部高光
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.8);
    ctx.beginPath();
    ctx.ellipse(centerX + radius * 0.3, centerY, radius * 0.2, radius * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * 从缓存渲染火箭主体（固定朝向，向右）
   */
  static renderBodyFromCache(ctx, x, y, radius) {
    if (!this._cachedCanvas) return;
    
    const canvasSize = this._cachedCanvas.width;
    const halfSize = canvasSize * 0.5;
    
    ctx.drawImage(
      this._cachedCanvas,
      x - halfSize,
      y - halfSize,
      canvasSize,
      canvasSize
    );
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
    const targetSize = this.target.size || EnemyTankConfig.SIZE || 20;
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
          ParticleConfig.PARTICLE_EXPLOSION_COUNT
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
   * 渲染火箭（带视锥剔除，使用离屏Canvas缓存，应用战场偏移）
   */
  render(viewLeft = -Infinity, viewRight = Infinity, viewTop = -Infinity, viewBottom = Infinity, offsetX = 0, offsetY = 0) {
    if (this.destroyed) return;
    
    // 视锥剔除：只渲染屏幕内的火箭（使用世界坐标）
    if (!this.isInView(viewLeft, viewRight, viewTop, viewBottom)) {
      return;
    }
    
    // 计算Canvas坐标（应用战场偏移）
    const renderX = this.x + offsetX;
    const renderY = this.y + offsetY;
    
    // 计算尾迹位置
    let lastX, lastY;
    if (this.trailPositions.length > 1) {
      const lastPos = this.trailPositions[this.trailPositions.length - 2];
      lastX = lastPos.x + offsetX;
      lastY = lastPos.y + offsetY;
    }
    
    // 使用渲染器渲染（主体+尾迹）
    HomingRocketRenderer.render(this.ctx, renderX, renderY, this.radius, this.angle, lastX, lastY);
  }
}

