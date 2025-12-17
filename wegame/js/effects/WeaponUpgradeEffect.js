/**
 * 武器升级特效
 * 使用离屏Canvas优化
 */

import { GameConfig } from '../config/GameConfig';
import { GameColors } from '../config/Colors';
import { ColorUtils } from '../config/Colors';
import { WeaponType } from '../config/WeaponConfig';

export class WeaponUpgradeEffect {
  // 离屏Canvas缓存（按武器类型和等级缓存）
  static _cachedCanvases = {};
  static _initialized = false;
  
  constructor(ctx, x, y, weaponType, level) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.weaponType = weaponType;
    this.level = level;
    this.duration = 800; // 特效持续时间（毫秒）
    this.elapsed = 0;
    this.size = GameConfig.CELL_SIZE * 1.2;
    
    // 初始化缓存
    if (!WeaponUpgradeEffect._initialized) {
      WeaponUpgradeEffect.initCache();
    }
  }
  
  /**
   * 获取武器颜色
   */
  static getWeaponColor(weaponType) {
    switch (weaponType) {
      case WeaponType.ROCKET:
        return GameColors.ROCKET_TOWER;
      case WeaponType.LASER:
        return GameColors.LASER_TOWER;
      case WeaponType.CANNON:
        return GameColors.CANNON_TOWER;
      case WeaponType.SNIPER:
        return GameColors.SNIPER_TOWER;
      default:
        return GameColors.ROCKET_TOWER;
    }
  }
  
  /**
   * 初始化离屏Canvas缓存
   */
  static initCache() {
    if (WeaponUpgradeEffect._initialized) {
      return;
    }
    
    const size = GameConfig.CELL_SIZE * 2;
    const weaponTypes = [WeaponType.ROCKET, WeaponType.LASER, WeaponType.CANNON, WeaponType.SNIPER];
    
    for (const weaponType of weaponTypes) {
      const color = WeaponUpgradeEffect.getWeaponColor(weaponType);
      const cacheKey = weaponType;
      
      const canvas = wx.createCanvas();
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      ctx.clearRect(0, 0, size, size);
      
      const centerX = size / 2;
      const centerY = size / 2;
      const maxRadius = size / 2;
      
      // 绘制多层圆形光晕（静态部分）
      for (let i = 0; i < 6; i++) {
        const radius = maxRadius * (0.2 + i * 0.13);
        const alpha = 0.25 - i * 0.03;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, ColorUtils.hexToCanvas(color, alpha));
        gradient.addColorStop(0.5, ColorUtils.hexToCanvas(0xffffff, alpha * 0.3));
        gradient.addColorStop(1, ColorUtils.hexToCanvas(color, 0));
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      WeaponUpgradeEffect._cachedCanvases[cacheKey] = canvas;
    }
    
    WeaponUpgradeEffect._initialized = true;
  }
  
  /**
   * 更新特效
   */
  update(deltaTime, deltaMS) {
    this.elapsed += deltaMS;
  }
  
  /**
   * 检查特效是否结束
   */
  isFinished() {
    return this.elapsed >= this.duration;
  }
  
  /**
   * 渲染特效
   */
  render(offsetX = 0, offsetY = 0) {
    if (this.isFinished()) {
      return;
    }
    
    const progress = this.elapsed / this.duration;
    const renderX = this.x + offsetX;
    const renderY = this.y + offsetY;
    const weaponColor = WeaponUpgradeEffect.getWeaponColor(this.weaponType);
    
    this.ctx.save();
    
    // 缩放动画（脉冲效果）
    let scale = 1;
    if (progress < 0.2) {
      // 快速放大
      scale = 0.5 + (progress / 0.2) * 0.8;
    } else if (progress < 0.4) {
      // 回弹
      scale = 1.3 - ((progress - 0.2) / 0.2) * 0.3;
    } else if (progress < 0.6) {
      // 再次放大
      scale = 1.0 + ((progress - 0.4) / 0.2) * 0.2;
    } else {
      // 稳定缩小
      scale = 1.2 - ((progress - 0.6) / 0.4) * 0.4;
    }
    
    // 透明度动画
    let alpha = 1;
    if (progress < 0.1) {
      alpha = progress / 0.1; // 淡入
    } else if (progress > 0.7) {
      alpha = 1 - (progress - 0.7) / 0.3; // 淡出
    }
    
    this.ctx.globalAlpha = alpha;
    this.ctx.translate(renderX, renderY);
    this.ctx.scale(scale, scale);
    
    // 使用缓存的静态部分
    const cacheKey = this.weaponType;
    if (WeaponUpgradeEffect._initialized && WeaponUpgradeEffect._cachedCanvases[cacheKey]) {
      this.ctx.drawImage(
        WeaponUpgradeEffect._cachedCanvases[cacheKey],
        -WeaponUpgradeEffect._cachedCanvases[cacheKey].width / 2,
        -WeaponUpgradeEffect._cachedCanvases[cacheKey].height / 2
      );
    }
    
    // 绘制动态星形粒子
    const starCount = 8;
    const starSize = 4;
    const starRadius = this.size * 0.5 * (1 + progress * 0.8);
    
    for (let i = 0; i < starCount; i++) {
      const angle = (i / starCount) * Math.PI * 2 + progress * Math.PI;
      const px = Math.cos(angle) * starRadius;
      const py = Math.sin(angle) * starRadius;
      
      const starAlpha = alpha * (1 - progress * 0.3);
      this.ctx.save();
      this.ctx.translate(px, py);
      this.ctx.rotate(angle + progress * Math.PI * 2);
      this.ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, starAlpha);
      this.ctx.beginPath();
      // 绘制五角星
      for (let j = 0; j < 5; j++) {
        const a = (j * 4 * Math.PI) / 5 - Math.PI / 2;
        const r = j % 2 === 0 ? starSize : starSize * 0.5;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (j === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    }
    
    // 绘制等级数字光晕
    if (this.level > 1) {
      const levelSize = this.size * 0.4;
      const levelAlpha = alpha * (1 - progress * 0.5);
      const levelGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, levelSize);
      levelGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, levelAlpha * 0.9));
      levelGradient.addColorStop(0.5, ColorUtils.hexToCanvas(weaponColor, levelAlpha * 0.6));
      levelGradient.addColorStop(1, ColorUtils.hexToCanvas(weaponColor, 0));
      this.ctx.fillStyle = levelGradient;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, levelSize, 0, Math.PI * 2);
      this.ctx.fill();
      
      // 绘制等级数字
      this.ctx.fillStyle = ColorUtils.hexToCanvas(weaponColor, levelAlpha);
      this.ctx.font = `bold ${levelSize * 0.6}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(this.level.toString(), 0, 0);
    }
    
    // 绘制中心闪光（脉冲）
    const flashPulse = Math.sin(progress * Math.PI * 4) * 0.3 + 0.7;
    const flashSize = this.size * 0.25 * flashPulse;
    const flashGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, flashSize);
    flashGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, alpha * 0.9));
    flashGradient.addColorStop(0.3, ColorUtils.hexToCanvas(weaponColor, alpha * 0.6));
    flashGradient.addColorStop(1, ColorUtils.hexToCanvas(weaponColor, 0));
    this.ctx.fillStyle = flashGradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, flashSize, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }
}

