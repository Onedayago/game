/**
 * 加农炮塔渲染器
 * 负责加农炮塔的视觉绘制
 */

import { GameConfig } from '../../config/GameConfig';
import { ColorUtils, GameColors } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class CannonTowerRenderer {
  // 离屏Canvas缓存（按尺寸和等级缓存）
  static _cachedCanvases = {}; // { 'size_level': canvas }
  static _cachedCtxs = {}; // { 'size_level': ctx }
  
  /**
   * 获取缓存键
   */
  static getCacheKey(size, level) {
    return `${size}_${level}`;
  }
  
  /**
   * 初始化加农炮塔渲染缓存
   */
  static initCache(size, level = 1) {
    const cacheKey = this.getCacheKey(size, level);
    
    if (this._cachedCanvases[cacheKey]) {
      return; // 已经初始化
    }
    
    const canvasSize = Math.ceil(size * 1.2);
    
    const canvas = wx.createCanvas();
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    const ctx = canvas.getContext('2d');
    this._cachedCanvases[cacheKey] = canvas;
    this._cachedCtxs[cacheKey] = ctx;
    
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    polyfillRoundRect(ctx);
    ctx.save();
    ctx.translate(canvasSize / 2, canvasSize / 2);
    this.drawCannonTowerToCache(ctx, size, level);
    ctx.restore();
  }
  
  /**
   * 绘制加农炮塔到缓存Canvas
   */
  static drawCannonTowerToCache(ctx, size, level) {
    const baseWidth = size * 1.0;
    const baseRadius = baseWidth / 2;
    const barrelLength = size * 0.55;
    const barrelWidth = size * 0.18;
    const turretRadius = size * 0.25;
    const baseY = 0;
    
    // 模块化绘制
    this.drawHeavyShadow(ctx, baseRadius, baseY);
    this.drawArmoredBase(ctx, baseRadius, baseY);
    this.drawBaseRivets(ctx, baseRadius, baseY);
    this.drawTurretPlatform(ctx, turretRadius, baseY);
    this.drawHeatVents(ctx, turretRadius, baseY);
    this.drawBarrelSystem(ctx, barrelLength, barrelWidth, baseY, level);
    this.drawAmmoFeed(ctx, turretRadius, barrelWidth, baseY);
    this.drawTargetingSystem(ctx, size, baseY, level);
    this.drawLevelUpgrades(ctx, barrelLength, barrelWidth, baseY, turretRadius, level);
  }
  
  /**
   * 绘制重型阴影
   */
  static drawHeavyShadow(ctx, baseRadius, baseY) {
    // 三层阴影增强厚重感
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(0, baseY + 5, baseRadius + 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.arc(0, baseY + 7, baseRadius + 1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.arc(0, baseY + 9, baseRadius - 1, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * 绘制装甲底座
   */
  static drawArmoredBase(ctx, baseRadius, baseY) {
    // 外层装甲环
    const outerGradient = ctx.createRadialGradient(0, baseY, 0, 0, baseY, baseRadius);
    outerGradient.addColorStop(0, ColorUtils.hexToCanvas(0x64748b, 1));
    outerGradient.addColorStop(0.6, ColorUtils.hexToCanvas(GameColors.CANNON_BASE, 0.95));
    outerGradient.addColorStop(0.85, ColorUtils.hexToCanvas(0x334155, 0.9));
    outerGradient.addColorStop(1, ColorUtils.hexToCanvas(0x1e293b, 0.85));
    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.arc(0, baseY, baseRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 装甲边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x0f172a, 1);
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 内层装甲板
    const innerRadius = baseRadius * 0.7;
    const innerGradient = ctx.createRadialGradient(0, baseY, 0, 0, baseY, innerRadius);
    innerGradient.addColorStop(0, ColorUtils.hexToCanvas(0x475569, 1));
    innerGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.CANNON_BASE, 0.95));
    innerGradient.addColorStop(1, ColorUtils.hexToCanvas(0x334155, 0.9));
    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.arc(0, baseY, innerRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.6);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 装甲分段线（6段）
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const startR = innerRadius;
      const endR = baseRadius;
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x1e293b, 0.6);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * startR, baseY + Math.sin(angle) * startR);
      ctx.lineTo(Math.cos(angle) * endR, baseY + Math.sin(angle) * endR);
      ctx.stroke();
    }
  }
  
  /**
   * 绘制底座铆钉
   */
  static drawBaseRivets(ctx, baseRadius, baseY) {
    // 外圈铆钉（12个）
    const rivetCount = 12;
    const rivetRadius = baseRadius * 0.06;
    const rivetDist = baseRadius * 0.88;
    
    for (let i = 0; i < rivetCount; i++) {
      const angle = (Math.PI * 2 / rivetCount) * i;
      const rx = Math.cos(angle) * rivetDist;
      const ry = baseY + Math.sin(angle) * rivetDist;
      
      // 铆钉阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(rx + 1, ry + 1, rivetRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // 铆钉主体
      const rivetGradient = ctx.createRadialGradient(rx - rivetRadius * 0.3, ry - rivetRadius * 0.3, 0, rx, ry, rivetRadius);
      rivetGradient.addColorStop(0, ColorUtils.hexToCanvas(0x94a3b8, 1));
      rivetGradient.addColorStop(0.6, ColorUtils.hexToCanvas(0x64748b, 1));
      rivetGradient.addColorStop(1, ColorUtils.hexToCanvas(0x475569, 1));
      ctx.fillStyle = rivetGradient;
      ctx.beginPath();
      ctx.arc(rx, ry, rivetRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // 铆钉边框
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x334155, 0.8);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // 内圈铆钉（8个）
    const innerRivetDist = baseRadius * 0.55;
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const rx = Math.cos(angle) * innerRivetDist;
      const ry = baseY + Math.sin(angle) * innerRivetDist;
      
      ctx.fillStyle = ColorUtils.hexToCanvas(0x64748b, 0.8);
      ctx.beginPath();
      ctx.arc(rx, ry, rivetRadius * 0.7, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x334155, 0.6);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  
  /**
   * 绘制炮塔转台
   */
  static drawTurretPlatform(ctx, turretRadius, baseY) {
    // 外层发光光晕
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.3);
    ctx.shadowBlur = 15;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.6);
    ctx.beginPath();
    ctx.arc(0, baseY, turretRadius * 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 转台主体
    const turretGradient = ctx.createRadialGradient(0, baseY, 0, 0, baseY, turretRadius);
    turretGradient.addColorStop(0, ColorUtils.hexToCanvas(0x60a5fa, 1));
    turretGradient.addColorStop(0.3, ColorUtils.hexToCanvas(GameColors.CANNON_TOWER, 1));
    turretGradient.addColorStop(0.7, ColorUtils.hexToCanvas(GameColors.CANNON_TOWER, 0.9));
    turretGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.85));
    ctx.fillStyle = turretGradient;
    ctx.beginPath();
    ctx.arc(0, baseY, turretRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 转台强化边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 1);
    ctx.lineWidth = 3;
    ctx.shadowBlur = 8;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.8);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 四方向装甲锁
    const lockRadius = turretRadius * 0.18;
    const lockDist = turretRadius * 0.68;
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i;
      const lx = Math.cos(angle) * lockDist;
      const ly = baseY + Math.sin(angle) * lockDist;
      
      // 锁光晕
      ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.4);
      ctx.beginPath();
      ctx.arc(lx, ly, lockRadius * 1.4, 0, Math.PI * 2);
      ctx.fill();
      
      // 锁主体
      ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 1);
      ctx.shadowBlur = 5;
      ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.8);
      ctx.beginPath();
      ctx.arc(lx, ly, lockRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // 锁中心
      ctx.fillStyle = ColorUtils.hexToCanvas(0x1e40af, 1);
      ctx.beginPath();
      ctx.arc(lx, ly, lockRadius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 中心能量核心
    const coreRadius = turretRadius * 0.35;
    const coreGradient = ctx.createRadialGradient(0, baseY, 0, 0, baseY, coreRadius);
    coreGradient.addColorStop(0, ColorUtils.hexToCanvas(0x60a5fa, 1));
    coreGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x3b82f6, 0.9));
    coreGradient.addColorStop(1, ColorUtils.hexToCanvas(0x1e40af, 0.8));
    ctx.fillStyle = coreGradient;
    ctx.shadowBlur = 10;
    ctx.shadowColor = ColorUtils.hexToCanvas(0x60a5fa, 0.8);
    ctx.beginPath();
    ctx.arc(0, baseY, coreRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.8);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  /**
   * 绘制散热孔
   */
  static drawHeatVents(ctx, turretRadius, baseY) {
    const ventCount = 8;
    const ventDist = turretRadius * 0.85;
    const ventLength = turretRadius * 0.15;
    const ventWidth = 2;
    
    for (let i = 0; i < ventCount; i++) {
      const angle = (Math.PI * 2 / ventCount) * i + Math.PI / 16;
      const vx = Math.cos(angle) * ventDist;
      const vy = baseY + Math.sin(angle) * ventDist;
      
      ctx.save();
      ctx.translate(vx, vy);
      ctx.rotate(angle);
      
      // 散热孔发光
      ctx.strokeStyle = ColorUtils.hexToCanvas(0xff6b35, 0.6);
      ctx.lineWidth = ventWidth + 2;
      ctx.shadowBlur = 4;
      ctx.shadowColor = ColorUtils.hexToCanvas(0xff6b35, 0.5);
      ctx.beginPath();
      ctx.moveTo(-ventLength / 2, 0);
      ctx.lineTo(ventLength / 2, 0);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // 散热孔主体
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x334155, 0.8);
      ctx.lineWidth = ventWidth;
      ctx.stroke();
      
      ctx.restore();
    }
  }
  
  /**
   * 绘制炮管系统
   */
  static drawBarrelSystem(ctx, barrelLength, barrelWidth, baseY, level) {
    const barrelY = baseY;
    const barrelStartX = 0;
    
    // 炮管发光光晕
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.25);
    ctx.shadowBlur = 12;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.4);
    ctx.beginPath();
    ctx.roundRect(barrelStartX - 3, barrelY - barrelWidth / 2 - 3, barrelLength + 6, barrelWidth + 6, barrelWidth / 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 炮管主体（多层渐变）
    const barrelGradient = ctx.createLinearGradient(barrelStartX, barrelY - barrelWidth / 2, barrelStartX + barrelLength, barrelY - barrelWidth / 2);
    barrelGradient.addColorStop(0, ColorUtils.hexToCanvas(0x64748b, 1));
    barrelGradient.addColorStop(0.15, ColorUtils.hexToCanvas(GameColors.CANNON_TOWER, 0.95));
    barrelGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.CANNON_TOWER, 0.92));
    barrelGradient.addColorStop(0.85, ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.9));
    barrelGradient.addColorStop(1, ColorUtils.hexToCanvas(0x1e40af, 0.85));
    ctx.fillStyle = barrelGradient;
    ctx.beginPath();
    ctx.roundRect(barrelStartX, barrelY - barrelWidth / 2, barrelLength, barrelWidth, barrelWidth / 2);
    ctx.fill();
    
    // 炮管加强环（4个）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x334155, 0.9);
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 4; i++) {
      const ringX = barrelStartX + barrelLength * (0.2 + i * 0.2);
      ctx.beginPath();
      ctx.moveTo(ringX, barrelY - barrelWidth / 2);
      ctx.lineTo(ringX, barrelY + barrelWidth / 2);
      ctx.stroke();
    }
    
    // 炮管上部高光
    const highlightGradient = ctx.createLinearGradient(barrelStartX, barrelY - barrelWidth / 2, barrelStartX + barrelLength * 0.5, barrelY - barrelWidth / 2);
    highlightGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.6));
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = highlightGradient;
    ctx.fillRect(barrelStartX, barrelY - barrelWidth / 2, barrelLength * 0.5, barrelWidth * 0.35);
    
    // 炮管下部阴影
    const shadowGradient = ctx.createLinearGradient(barrelStartX, barrelY + barrelWidth / 2 - barrelWidth * 0.3, barrelStartX, barrelY + barrelWidth / 2);
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = shadowGradient;
    ctx.fillRect(barrelStartX, barrelY + barrelWidth / 2 - barrelWidth * 0.3, barrelLength, barrelWidth * 0.3);
    
    // 炮管边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.7);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(barrelStartX, barrelY - barrelWidth / 2, barrelLength, barrelWidth, barrelWidth / 2);
    ctx.stroke();
    
    // 炮口制退器
    const muzzleX = barrelStartX + barrelLength;
    const muzzleWidth = barrelWidth * 1.3;
    const muzzleLength = barrelWidth * 0.6;
    
    ctx.fillStyle = ColorUtils.hexToCanvas(0x475569, 0.95);
    ctx.beginPath();
    ctx.roundRect(muzzleX - muzzleLength, barrelY - muzzleWidth / 2, muzzleLength, muzzleWidth, muzzleWidth / 2);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x1e293b, 0.8);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 炮口散热孔（3条）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x1e293b, 0.9);
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const slotY = barrelY - muzzleWidth / 2 + (muzzleWidth / 4) * (i + 1);
      ctx.beginPath();
      ctx.moveTo(muzzleX - muzzleLength + 2, slotY);
      ctx.lineTo(muzzleX - 2, slotY);
      ctx.stroke();
    }
    
    // 炮管与转台连接处
    const jointRadius = barrelWidth * 0.8;
    const jointGradient = ctx.createRadialGradient(barrelStartX, barrelY, 0, barrelStartX, barrelY, jointRadius);
    jointGradient.addColorStop(0, ColorUtils.hexToCanvas(0x64748b, 1));
    jointGradient.addColorStop(0.6, ColorUtils.hexToCanvas(0x475569, 0.95));
    jointGradient.addColorStop(1, ColorUtils.hexToCanvas(0x334155, 0.9));
    ctx.fillStyle = jointGradient;
    ctx.beginPath();
    ctx.arc(barrelStartX, barrelY, jointRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.CANNON_DETAIL, 0.8);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  /**
   * 绘制弹药装填系统
   */
  static drawAmmoFeed(ctx, turretRadius, barrelWidth, baseY) {
    const feedX = -turretRadius * 0.3;
    const feedY = baseY;
    const feedWidth = barrelWidth * 0.7;
    const feedHeight = turretRadius * 0.6;
    
    // 弹药箱阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(feedX + 2, feedY - feedHeight / 2 + 2, feedWidth, feedHeight);
    
    // 弹药箱主体
    const feedGradient = ctx.createLinearGradient(feedX, feedY - feedHeight / 2, feedX + feedWidth, feedY - feedHeight / 2);
    feedGradient.addColorStop(0, ColorUtils.hexToCanvas(0x475569, 1));
    feedGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x64748b, 0.95));
    feedGradient.addColorStop(1, ColorUtils.hexToCanvas(0x475569, 0.9));
    ctx.fillStyle = feedGradient;
    ctx.fillRect(feedX, feedY - feedHeight / 2, feedWidth, feedHeight);
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x334155, 0.9);
    ctx.lineWidth = 2;
    ctx.strokeRect(feedX, feedY - feedHeight / 2, feedWidth, feedHeight);
    
    // 弹药装填指示灯（3个）
    const ledRadius = feedWidth * 0.15;
    for (let i = 0; i < 3; i++) {
      const ledY = feedY - feedHeight / 2 + feedHeight * (0.25 + i * 0.25);
      
      // LED发光
      ctx.fillStyle = ColorUtils.hexToCanvas(0xfbbf24, 0.8);
      ctx.shadowBlur = 6;
      ctx.shadowColor = ColorUtils.hexToCanvas(0xfbbf24, 0.6);
      ctx.beginPath();
      ctx.arc(feedX + feedWidth / 2, ledY, ledRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // LED边框
      ctx.strokeStyle = ColorUtils.hexToCanvas(0xf59e0b, 1);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  
  /**
   * 绘制瞄准系统
   */
  static drawTargetingSystem(ctx, size, baseY, level) {
    const sightSize = size * 0.08;
    const sightY = baseY - size * 0.35;
    
    // 瞄准镜光晕
    ctx.fillStyle = ColorUtils.hexToCanvas(0x22d3ee, 0.3);
    ctx.shadowBlur = 12;
    ctx.shadowColor = ColorUtils.hexToCanvas(0x22d3ee, 0.5);
    ctx.beginPath();
    ctx.arc(0, sightY, sightSize * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 瞄准镜主体
    const sightGradient = ctx.createRadialGradient(0, sightY, 0, 0, sightY, sightSize);
    sightGradient.addColorStop(0, ColorUtils.hexToCanvas(0x06b6d4, 1));
    sightGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x0891b2, 0.9));
    sightGradient.addColorStop(1, ColorUtils.hexToCanvas(0x164e63, 0.8));
    ctx.fillStyle = sightGradient;
    ctx.beginPath();
    ctx.arc(0, sightY, sightSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x22d3ee, 1);
    ctx.lineWidth = 2;
    ctx.shadowBlur = 6;
    ctx.shadowColor = ColorUtils.hexToCanvas(0x22d3ee, 0.8);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 十字准星
    const crossSize = sightSize * 0.6;
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x22d3ee, 0.9);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-crossSize, sightY);
    ctx.lineTo(crossSize, sightY);
    ctx.moveTo(0, sightY - crossSize);
    ctx.lineTo(0, sightY + crossSize);
    ctx.stroke();
    
    // 激光瞄准器（等级2+）
    if (level >= 2) {
      const laserX = size * 0.25;
      const laserY = baseY - size * 0.15;
      const laserSize = size * 0.05;
      
      ctx.fillStyle = ColorUtils.hexToCanvas(0xef4444, 0.8);
      ctx.shadowBlur = 8;
      ctx.shadowColor = ColorUtils.hexToCanvas(0xef4444, 0.7);
      ctx.beginPath();
      ctx.arc(laserX, laserY, laserSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(0xdc2626, 1);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
  
  /**
   * 绘制等级升级装饰
   */
  static drawLevelUpgrades(ctx, barrelLength, barrelWidth, baseY, turretRadius, level) {
    if (level >= 2) {
      // 二级：双炮管支架
      const supportY = baseY + barrelWidth * 0.8;
      const supportLength = barrelLength * 0.6;
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x64748b, 0.9);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, supportY);
      ctx.lineTo(supportLength, supportY);
      ctx.stroke();
      
      // 支架连接点
      for (let i = 0; i < 3; i++) {
        const jointX = supportLength * (0.3 * i);
        ctx.fillStyle = ColorUtils.hexToCanvas(0x475569, 1);
        ctx.beginPath();
        ctx.arc(jointX, supportY, barrelWidth * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = ColorUtils.hexToCanvas(0x334155, 0.8);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
    
    if (level >= 3) {
      // 三级：能量护盾发生器
      const shieldRadius = turretRadius * 1.4;
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x60a5fa, 0.4);
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = ColorUtils.hexToCanvas(0x60a5fa, 0.6);
      ctx.beginPath();
      ctx.arc(0, baseY, shieldRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // 护盾节点（4个）
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI / 2) * i + Math.PI / 4;
        const nx = Math.cos(angle) * shieldRadius;
        const ny = baseY + Math.sin(angle) * shieldRadius;
        
        ctx.fillStyle = ColorUtils.hexToCanvas(0x60a5fa, 0.7);
        ctx.shadowBlur = 8;
        ctx.shadowColor = ColorUtils.hexToCanvas(0x60a5fa, 0.8);
        ctx.beginPath();
        ctx.arc(nx, ny, turretRadius * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }
  
  /**
   * 从缓存渲染加农炮塔（固定朝向，向右）
   */
  static renderFromCache(ctx, x, y, size, level) {
    const cacheKey = this.getCacheKey(size, level);
    const cachedCanvas = this._cachedCanvases[cacheKey];
    
    if (!cachedCanvas) {
      this.initCache(size, level);
      return this.renderFromCache(ctx, x, y, size, level);
    }
    
    const canvasSize = cachedCanvas.width;
    const halfSize = canvasSize * 0.5;
    
    ctx.drawImage(
      cachedCanvas,
      x - halfSize,
      y - halfSize,
      canvasSize,
      canvasSize
    );
  }
  
  /**
   * 渲染加农炮塔
   * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
   * @param {number} x - Canvas 坐标系 X
   * @param {number} y - Canvas 坐标系 Y（从上往下）
   * @param {number} size - 尺寸
   * @param {number} level - 等级
   */
  static render(ctx, x, y, size, level = 1) {
    // 初始化缓存（如果未初始化）
    if (!this._cachedCanvases[this.getCacheKey(size, level)]) {
      this.initCache(size, level);
    }
    
    this.renderFromCache(ctx, x, y, size, level);
  }
}

