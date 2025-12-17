/**
 * 粒子管理器
 */

import { GameConfig } from '../config/GameConfig';
import { GameColors } from '../config/Colors';

export class ParticleManager {
  // 固定的粒子颜色列表
  static PARTICLE_COLORS = [
    GameColors.ROCKET_BULLET,  // 0: 火箭/武器爆炸
    GameColors.LASER_BEAM,     // 1: 激光/武器击中
    GameColors.CANNON_BULLET,  // 2: 加农炮/武器爆炸
    GameColors.SNIPER_BULLET,  // 3: 狙击塔/武器爆炸
    GameColors.ENEMY_TANK,      // 4: 敌人爆炸
    GameColors.ENEMY_DETAIL,    // 5: 敌人击中
    GameColors.ENEMY_BULLET,    // 6: 敌人子弹击中
  ];
  
  // 颜色映射：将传入的颜色映射到固定颜色索引
  static getColorIndex(color) {
    // 根据颜色值映射到固定颜色
    if (color === GameColors.ROCKET_BULLET || color === GameColors.ROCKET_TOWER || color === GameColors.ROCKET_DETAIL) {
      return 0; // 火箭颜色
    }
    if (color === GameColors.LASER_BEAM || color === GameColors.LASER_TOWER || color === GameColors.LASER_DETAIL) {
      return 1; // 激光颜色
    }
    if (color === GameColors.CANNON_BULLET || color === GameColors.CANNON_TOWER || color === GameColors.CANNON_DETAIL) {
      return 2; // 加农炮颜色
    }
    if (color === GameColors.SNIPER_BULLET || color === GameColors.SNIPER_TOWER || color === GameColors.SNIPER_DETAIL) {
      return 3; // 狙击塔颜色
    }
    if (color === GameColors.ENEMY_TANK || color === GameColors.ENEMY_BODY || color === GameColors.ENEMY_BODY_DARK) {
      return 4; // 敌人爆炸
    }
    if (color === GameColors.ENEMY_DETAIL) {
      return 5; // 敌人击中
    }
    if (color === GameColors.ENEMY_BULLET) {
      return 6; // 敌人子弹
    }
    // 默认使用第一个颜色
    return 0;
  }
  
  // 离屏Canvas缓存（粒子）- { 'size_colorIndex': canvas }
  static _cachedCanvases = {};
  static _cachedCtxs = {};
  static _initialized = false;
  
  constructor(ctx) {
    this.ctx = ctx;
    this.particles = [];
    this.maxParticles = 500; // 限制最大粒子数量
  }
  
  /**
   * 获取缓存键
   */
  static getCacheKey(size, colorIndex) {
    return `${size}_${colorIndex}`;
  }
  
  /**
   * 初始化粒子缓存（为每种颜色和大小组合创建缓存）
   */
  static initCache() {
    if (this._initialized) {
      return; // 已经初始化
    }
    
    const sizes = [2, 3, 4, 5, 6, 7, 8];
    
    for (const size of sizes) {
      for (let colorIndex = 0; colorIndex < this.PARTICLE_COLORS.length; colorIndex++) {
        const color = this.PARTICLE_COLORS[colorIndex];
        const cacheKey = this.getCacheKey(size, colorIndex);
        const canvasSize = Math.ceil(size * 2.5);
        
        const canvas = wx.createCanvas();
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        const ctx = canvas.getContext('2d');
        
        this._cachedCanvases[cacheKey] = canvas;
        this._cachedCtxs[cacheKey] = ctx;
        
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        
        const centerX = canvasSize / 2;
        const centerY = canvasSize / 2;
        const { r, g, b } = ParticleManager.hexToRgb(color);
        const fixedAlpha = 0.9;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${fixedAlpha})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    this._initialized = true;
  }
  
  /**
   * 从缓存渲染粒子（使用固定颜色和固定透明度）
   */
  static renderFromCache(ctx, x, y, size, colorIndex) {
    if (!this._initialized) {
      return false;
    }
    
    // 找到最接近的缓存尺寸
    const cachedSize = Math.max(2, Math.min(8, Math.round(size)));
    const cacheKey = this.getCacheKey(cachedSize, colorIndex);
    const cachedCanvas = this._cachedCanvases[cacheKey];
    
    if (!cachedCanvas) {
      return false;
    }
    
    const canvasSize = cachedCanvas.width;
    const halfSize = canvasSize / 2;
    
    // 直接绘制（缓存中已包含固定透明度）
    ctx.drawImage(
      cachedCanvas,
      x - halfSize,
      y - halfSize,
      canvasSize,
      canvasSize
    );
    
    return true;
  }
  
  /**
   * 创建爆炸粒子（美化版：多层粒子、渐变色、冲击波）
   */
  createExplosion(x, y, color, count = GameConfig.PARTICLE_EXPLOSION_COUNT) {
    // 如果粒子数量过多，减少创建数量
    const availableSlots = this.maxParticles - this.particles.length;
    if (availableSlots <= 0) return;
    
    const actualCount = Math.min(count, availableSlots);
    const colorIndex = ParticleManager.getColorIndex(color);
    
    // 主爆炸粒子（快速外扩）
    for (let i = 0; i < actualCount; i++) {
      const angle = (Math.PI * 2 * i) / actualCount + (Math.random() - 0.5) * 0.3;
      const speed = 80 + Math.random() * 60;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      this.particles.push({
        x,
        y,
        vx,
        vy,
        colorIndex,
        lifetime: 600,
        maxLifetime: 600,
        size: 4 + Math.random() * 4,
        type: 'explosion'
      });
    }
    
    // 添加冲击波粒子（慢速扩散）
    const shockwaveCount = Math.min(8, availableSlots - actualCount);
    for (let i = 0; i < shockwaveCount; i++) {
      const angle = (Math.PI * 2 * i) / shockwaveCount;
      const speed = 40 + Math.random() * 20;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      this.particles.push({
        x,
        y,
        vx,
        vy,
        colorIndex,
        lifetime: 800,
        maxLifetime: 800,
        size: 6 + Math.random() * 3,
        type: 'shockwave'
      });
    }
    
    // 添加核心火花（向上飞溅）
    const sparkCount = Math.min(6, availableSlots - actualCount - shockwaveCount);
    for (let i = 0; i < sparkCount; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 3;
      const speed = 100 + Math.random() * 50;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      this.particles.push({
        x,
        y,
        vx,
        vy: vy - 20, // 添加重力效果
        colorIndex,
        lifetime: 400,
        maxLifetime: 400,
        size: 3 + Math.random() * 2,
        type: 'spark',
        gravity: 150 // 重力加速度
      });
    }
  }
  
  /**
   * 创建击中火花（美化版：螺旋扩散、渐变尺寸）
   */
  createHitSpark(x, y, color) {
    const availableSlots = this.maxParticles - this.particles.length;
    if (availableSlots <= 0) return;
    
    const count = Math.min(GameConfig.PARTICLE_MUZZLE_FLASH_COUNT, availableSlots);
    const colorIndex = ParticleManager.getColorIndex(color || GameColors.LASER_BEAM);
    
    // 主火花（螺旋扩散）
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spiralOffset = (i / count) * Math.PI * 0.5;
      const speed = 30 + Math.random() * 40;
      const vx = Math.cos(angle + spiralOffset) * speed;
      const vy = Math.sin(angle + spiralOffset) * speed;
      
      this.particles.push({
        x,
        y,
        vx,
        vy,
        colorIndex,
        lifetime: 250,
        maxLifetime: 250,
        size: 2 + Math.random() * 2.5,
        type: 'spark'
      });
    }
    
    // 添加拖尾粒子（慢速）
    const trailCount = Math.min(4, availableSlots - count);
    for (let i = 0; i < trailCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 10 + Math.random() * 15;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      this.particles.push({
        x,
        y,
        vx,
        vy,
        colorIndex,
        lifetime: 400,
        maxLifetime: 400,
        size: 1.5 + Math.random() * 1.5,
        type: 'trail'
      });
    }
  }
  
  /**
   * 更新粒子（美化版：重力、拖尾衰减、旋转）
   */
  update(deltaTime) {
    const deltaMS = deltaTime * 1000;
    
    let writeIndex = 0;
    for (let readIndex = 0; readIndex < this.particles.length; readIndex++) {
      const particle = this.particles[readIndex];
      
      // 更新位置
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      
      // 应用重力（仅对火花粒子）
      if (particle.type === 'spark' && particle.gravity) {
        particle.vy += particle.gravity * deltaTime;
      }
      
      // 应用空气阻力（减速）
      const damping = particle.type === 'shockwave' ? 0.95 : 0.98;
      particle.vx *= damping;
      particle.vy *= damping;
      
      // 更新生命周期
      particle.lifetime -= deltaMS;
      
      // 粒子尺寸随时间衰减
      const lifeRatio = particle.lifetime / particle.maxLifetime;
      if (particle.type === 'explosion' || particle.type === 'shockwave') {
        // 爆炸粒子先变大再缩小
        particle.currentSize = particle.size * (1 + (1 - lifeRatio) * 0.5) * lifeRatio;
      } else {
        // 其他粒子线性缩小
        particle.currentSize = particle.size * lifeRatio;
      }
      
      // 只保留未过期的粒子
      if (particle.lifetime > 0) {
        if (writeIndex !== readIndex) {
          this.particles[writeIndex] = particle;
        }
        writeIndex++;
      }
    }
    
    this.particles.length = writeIndex;
  }
  
  /**
   * 渲染粒子（简化版：只使用离屏缓存）
   */
  render(offsetX = 0, offsetY = 0) {
    if (this.particles.length === 0) return;
    
    if (!ParticleManager._initialized) {
      ParticleManager.initCache();
    }
    
    // 直接渲染所有粒子（不分层、不添加特效）
    for (const particle of this.particles) {
      const x = particle.x + offsetX;
      const y = particle.y + offsetY;
      const size = particle.currentSize || particle.size;
      const colorIndex = particle.colorIndex !== undefined ? particle.colorIndex : 0;
      
      // 直接从缓存渲染
      ParticleManager.renderFromCache(this.ctx, x, y, size, colorIndex);
    }
  }
  
  /**
   * 获取粒子颜色（RGBA字符串）
   */
  getParticleColor(colorIndex, alpha) {
    const color = ParticleManager.PARTICLE_COLORS[colorIndex] || ParticleManager.PARTICLE_COLORS[0];
    const { r, g, b } = ParticleManager.hexToRgb(color);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  /**
   * 将十六进制颜色转换为 RGB（静态方法）
   */
  static hexToRgb(hex) {
    if (typeof hex === 'number') {
      const r = (hex >> 16) & 255;
      const g = (hex >> 8) & 255;
      const b = hex & 255;
      return { r, g, b };
    }
    // 如果是字符串格式的十六进制
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  }
  
}

