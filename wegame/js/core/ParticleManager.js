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
    GameColors.ENEMY_TANK,      // 2: 敌人爆炸
    GameColors.ENEMY_DETAIL,    // 3: 敌人击中
    GameColors.ENEMY_BULLET,    // 4: 敌人子弹击中
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
    if (color === GameColors.ENEMY_TANK || color === GameColors.ENEMY_BODY || color === GameColors.ENEMY_BODY_DARK) {
      return 2; // 敌人爆炸
    }
    if (color === GameColors.ENEMY_DETAIL) {
      return 3; // 敌人击中
    }
    if (color === GameColors.ENEMY_BULLET) {
      return 4; // 敌人子弹
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
    
    try {
      // 缓存不同大小的粒子（2-8像素）
      const sizes = [2, 3, 4, 5, 6, 7, 8];
      
      // 为每种颜色和大小组合创建缓存
      for (const size of sizes) {
        for (let colorIndex = 0; colorIndex < this.PARTICLE_COLORS.length; colorIndex++) {
          const color = this.PARTICLE_COLORS[colorIndex];
          const cacheKey = this.getCacheKey(size, colorIndex);
          const canvasSize = Math.ceil(size * 2.5); // 包含一些边距
          
          let canvas;
          if (typeof wx !== 'undefined') {
            canvas = wx.createCanvas();
          } else {
            canvas = document.createElement('canvas');
          }
          canvas.width = canvasSize;
          canvas.height = canvasSize;
          const ctx = canvas.getContext('2d');
          
          this._cachedCanvases[cacheKey] = canvas;
          this._cachedCtxs[cacheKey] = ctx;
          
          // 清空缓存Canvas
          ctx.clearRect(0, 0, canvasSize, canvasSize);
          
          // 绘制粒子到缓存（居中，使用固定颜色和固定透明度）
          const centerX = canvasSize / 2;
          const centerY = canvasSize / 2;
          const { r, g, b } = ParticleManager.hexToRgb(color);
          const fixedAlpha = 0.9; // 固定透明度
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${fixedAlpha})`;
          ctx.beginPath();
          ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      this._initialized = true;
    } catch (e) {
      console.warn('粒子缓存初始化失败:', e);
      this._initialized = false;
    }
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
   * 创建爆炸粒子（使用固定颜色）
   */
  createExplosion(x, y, color, count = ParticleConfig.PARTICLE_EXPLOSION_COUNT) {
    // 如果粒子数量过多，减少创建数量
    const availableSlots = this.maxParticles - this.particles.length;
    if (availableSlots <= 0) return; // 没有空间创建新粒子
    
    const actualCount = Math.min(count, availableSlots);
    // 将传入的颜色映射到固定颜色索引
    const colorIndex = ParticleManager.getColorIndex(color);
    
    for (let i = 0; i < actualCount; i++) {
      const angle = (Math.PI * 2 * i) / actualCount;
      const speed = 50 + Math.random() * 50;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      this.particles.push({
        x,
        y,
        vx,
        vy,
        colorIndex, // 使用颜色索引而不是颜色值
        lifetime: 500,
        maxLifetime: 500,
        size: 3 + Math.random() * 3
      });
    }
  }
  
  /**
   * 创建击中火花（使用固定颜色）
   */
  createHitSpark(x, y, color) {
    // 如果粒子数量过多，减少创建数量
    const availableSlots = this.maxParticles - this.particles.length;
    if (availableSlots <= 0) return; // 没有空间创建新粒子
    
    const count = Math.min(GameConfig.PARTICLE_MUZZLE_FLASH_COUNT, availableSlots);
    // 将传入的颜色映射到固定颜色索引
    const colorIndex = ParticleManager.getColorIndex(color || GameColors.LASER_BEAM);
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 30;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      this.particles.push({
        x,
        y,
        vx,
        vy,
        colorIndex, // 使用颜色索引而不是颜色值
        lifetime: 200,
        maxLifetime: 200,
        size: 2 + Math.random() * 2
      });
    }
  }
  
  /**
   * 更新粒子（优化：批量删除，减少 splice 调用）
   */
  update(deltaTime) {
    const deltaMS = deltaTime * 1000;
    
    // 优化：先标记，再批量删除
    let writeIndex = 0;
    for (let readIndex = 0; readIndex < this.particles.length; readIndex++) {
      const particle = this.particles[readIndex];
      
      // 更新位置
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      
      // 更新生命周期
      particle.lifetime -= deltaMS;
      
      // 只保留未过期的粒子（原地覆盖）
      if (particle.lifetime > 0) {
        if (writeIndex !== readIndex) {
          this.particles[writeIndex] = particle;
        }
        writeIndex++;
      }
    }
    
    // 删除过期粒子
    this.particles.length = writeIndex;
  }
  
  /**
   * 渲染粒子（优化：使用离屏Canvas缓存，批量绘制）
   * 直接使用 Canvas 坐标系（Y 轴从上往下）
   */
  render(offsetX = 0, offsetY = 0) {
    if (this.particles.length === 0) return;
    
    // 初始化缓存（如果未初始化）
    if (!ParticleManager._initialized) {
      ParticleManager.initCache();
    }
    
    // 优化：如果粒子数量少，直接使用缓存绘制
    if (this.particles.length < 20) {
      for (const particle of this.particles) {
        const colorIndex = particle.colorIndex !== undefined ? particle.colorIndex : 0;
        
        // 使用缓存渲染（固定透明度）
        ParticleManager.renderFromCache(
          this.ctx,
          particle.x + offsetX,
          particle.y + offsetY,
          particle.size,
          colorIndex
        );
      }
    } else {
      // 粒子数量多时，按颜色索引和大小分组，减少状态切换
      const groups = new Map(); // { 'colorIndex_size': particles }
      
      for (const particle of this.particles) {
        const colorIndex = particle.colorIndex !== undefined ? particle.colorIndex : 0;
        const size = Math.round(particle.size);
        const groupKey = `${colorIndex}_${size}`;
        
        if (!groups.has(groupKey)) {
          groups.set(groupKey, []);
        }
        
        groups.get(groupKey).push({
          x: particle.x + offsetX,
          y: particle.y + offsetY,
          size: particle.size,
          colorIndex
        });
      }
      
      // 按组批量绘制（使用缓存，固定透明度）
      for (const [groupKey, particles] of groups.entries()) {
        for (const p of particles) {
          // 使用缓存渲染（固定透明度）
          ParticleManager.renderFromCache(
            this.ctx,
            p.x,
            p.y,
            p.size,
            p.colorIndex
          );
        }
      }
    }
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
  
  /**
   * 将十六进制颜色转换为 RGB（实例方法，兼容旧代码）
   */
  hexToRgb(hex) {
    return ParticleManager.hexToRgb(hex);
  }
}

