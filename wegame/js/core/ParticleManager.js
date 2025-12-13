/**
 * 粒子管理器
 */

import { GameConfig } from '../config/GameConfig';

export class ParticleManager {
  constructor(ctx) {
    this.ctx = ctx;
    this.particles = [];
    this.maxParticles = 500; // 限制最大粒子数量
  }
  
  /**
   * 创建爆炸粒子
   */
  createExplosion(x, y, color, count = GameConfig.PARTICLE_EXPLOSION_COUNT) {
    // 如果粒子数量过多，减少创建数量
    const availableSlots = this.maxParticles - this.particles.length;
    if (availableSlots <= 0) return; // 没有空间创建新粒子
    
    const actualCount = Math.min(count, availableSlots);
    
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
        color,
        lifetime: 500,
        maxLifetime: 500,
        size: 3 + Math.random() * 3
      });
    }
  }
  
  /**
   * 创建击中火花
   */
  createHitSpark(x, y, color) {
    // 如果粒子数量过多，减少创建数量
    const availableSlots = this.maxParticles - this.particles.length;
    if (availableSlots <= 0) return; // 没有空间创建新粒子
    
    const count = Math.min(GameConfig.PARTICLE_MUZZLE_FLASH_COUNT, availableSlots);
    
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
        color: color || 0x00ffff, // 默认青色
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
   * 渲染粒子（优化：批量绘制，减少 drawCall）
   * 直接使用 Canvas 坐标系（Y 轴从上往下）
   */
  render() {
    if (this.particles.length === 0) return;
    
    this.ctx.save();
    
    // 优化：如果粒子数量少，直接绘制，避免分组开销
    if (this.particles.length < 20) {
      for (const particle of this.particles) {
        const alpha = particle.lifetime / particle.maxLifetime;
        const { r, g, b } = this.hexToRgb(particle.color);
        this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    } else {
      // 粒子数量多时，按颜色分组，减少 fillStyle 切换
      const colorGroups = new Map();
      
      for (const particle of this.particles) {
        const alpha = particle.lifetime / particle.maxLifetime;
        const { r, g, b } = this.hexToRgb(particle.color);
        const colorKey = `${r},${g},${b}`;
        
        if (!colorGroups.has(colorKey)) {
          colorGroups.set(colorKey, []);
        }
        
        colorGroups.get(colorKey).push({
          x: particle.x,
          y: particle.y,
          size: particle.size,
          alpha
        });
      }
      
      // 按颜色分组批量绘制
      for (const [colorKey, particles] of colorGroups.entries()) {
        const [r, g, b] = colorKey.split(',').map(Number);
        
        // 使用相同的 fillStyle 绘制多个粒子
        for (const p of particles) {
          // 注意：每个粒子的 alpha 可能不同，需要单独设置
          this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }
    
    this.ctx.restore();
  }
  
  /**
   * 将十六进制颜色转换为 RGB
   */
  hexToRgb(hex) {
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

