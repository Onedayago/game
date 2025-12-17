/**
 * 激光塔渲染器
 * 负责激光塔的视觉绘制
 */

import { GameConfig } from '../../config/GameConfig';
import { ColorUtils, GameColors } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class LaserTowerRenderer {
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
   * 初始化激光塔渲染缓存
   */
  static initCache(size, level = 1) {
    const cacheKey = this.getCacheKey(size, level);
    
    if (this._cachedCanvases[cacheKey]) {
      return; // 已经初始化
    }
    
    const canvasSize = Math.ceil(size * 1.3); // 留出护盾空间
    
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
    this.drawLaserTowerToCache(ctx, size, level);
    ctx.restore();
  }
  
  /**
   * 绘制激光塔到缓存Canvas
   */
  static drawLaserTowerToCache(ctx, size, level) {
    const towerRadius = size * 0.20;
    const coreRadius = size * 0.12;
    const baseSize = size * 0.5;
    
    // 模块化绘制 - 未来科技能量塔
    this.drawLaserShadow(ctx, size, towerRadius);
    this.drawHexagonBase(ctx, size, baseSize);
    this.drawEnergyConduits(ctx, size, baseSize);
    this.drawPowerCells(ctx, size, baseSize, level);
    this.drawLaserEmitters(ctx, size, baseSize, level);
    this.drawEnergyCore(ctx, coreRadius, size, level);
    this.drawHolographicRing(ctx, size, baseSize);
    this.drawCrystalPrisms(ctx, size, baseSize, level);
    this.drawLevelUpgrades(ctx, size, baseSize, level);
  }
  
  /**
   * 从缓存渲染激光塔（固定朝向）
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
   * 渲染激光塔
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
  
  /**
   * 绘制激光塔阴影
   */
  static drawLaserShadow(ctx, size, towerRadius) {
    // 多层阴影增强科技感
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 4, size * 0.45, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.arc(0, 6, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.arc(0, 8, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * 绘制六边形基座
   */
  static drawHexagonBase(ctx, size, baseSize) {
    const hexPoints = [];
    
    // 生成外层六边形顶点
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      hexPoints.push(Math.cos(angle) * baseSize);
      hexPoints.push(Math.sin(angle) * baseSize);
    }
    
    // 外层六边形基座（深色科技感）
    const outerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, baseSize);
    outerGradient.addColorStop(0, ColorUtils.hexToCanvas(0x1a3a2e, 1));
    outerGradient.addColorStop(0.6, ColorUtils.hexToCanvas(GameColors.LASER_BASE, 0.95));
    outerGradient.addColorStop(0.85, ColorUtils.hexToCanvas(0x0f2419, 0.9));
    outerGradient.addColorStop(1, ColorUtils.hexToCanvas(0x0a1a0f, 0.85));
    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.moveTo(hexPoints[0], hexPoints[1]);
    for (let i = 2; i < hexPoints.length; i += 2) {
      ctx.lineTo(hexPoints[i], hexPoints[i + 1]);
    }
    ctx.closePath();
    ctx.fill();
    
    // 六边形发光边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.8);
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.6);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 六边形边缘线（6条）
    for (let i = 0; i < 6; i++) {
      const angle1 = (Math.PI / 3) * i;
      const angle2 = (Math.PI / 3) * ((i + 1) % 6);
      const x1 = Math.cos(angle1) * baseSize;
      const y1 = Math.sin(angle1) * baseSize;
      const x2 = Math.cos(angle2) * baseSize;
      const y2 = Math.sin(angle2) * baseSize;
      
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.6));
      gradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.9));
      gradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.6));
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 4;
      ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.5);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    // 内层六边形（旋转30度）
    const innerHexPoints = [];
    const innerSize = baseSize * 0.65;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + Math.PI / 6;
      innerHexPoints.push(Math.cos(angle) * innerSize);
      innerHexPoints.push(Math.sin(angle) * innerSize);
    }
    
    const innerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, innerSize);
    innerGradient.addColorStop(0, ColorUtils.hexToCanvas(0x0f2419, 1));
    innerGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x1a3a2e, 0.9));
    innerGradient.addColorStop(1, ColorUtils.hexToCanvas(0x0a1a0f, 0.85));
    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.moveTo(innerHexPoints[0], innerHexPoints[1]);
    for (let i = 2; i < innerHexPoints.length; i += 2) {
      ctx.lineTo(innerHexPoints[i], innerHexPoints[i + 1]);
    }
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.5);
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 3;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.4);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  
  /**
   * 绘制能量导管
   */
  static drawEnergyConduits(ctx, size, baseSize) {
    // 从六个角向中心的能量导管
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const startX = Math.cos(angle) * baseSize * 0.9;
      const startY = Math.sin(angle) * baseSize * 0.9;
      const endX = Math.cos(angle) * baseSize * 0.4;
      const endY = Math.sin(angle) * baseSize * 0.4;
      
      // 导管发光
      const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
      gradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.3));
      gradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.6));
      gradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.8));
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 6;
      ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.6);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // 导管边缘细线
      ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.4);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  
  /**
   * 绘制能量电池组
   */
  static drawPowerCells(ctx, size, baseSize, level) {
    // 六个角的能量电池
    const cellCount = 6;
    const cellRadius = baseSize * 0.12;
    const cellDist = baseSize * 0.85;
    
    for (let i = 0; i < cellCount; i++) {
      const angle = (Math.PI / 3) * i;
      const cx = Math.cos(angle) * cellDist;
      const cy = Math.sin(angle) * cellDist;
      
      // 电池外壳
      const shellGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, cellRadius);
      shellGradient.addColorStop(0, ColorUtils.hexToCanvas(0x1a3a2e, 1));
      shellGradient.addColorStop(0.6, ColorUtils.hexToCanvas(0x2d5a45, 0.95));
      shellGradient.addColorStop(1, ColorUtils.hexToCanvas(0x0f2419, 0.9));
      ctx.fillStyle = shellGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, cellRadius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.7);
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 能量指示器（根据等级调整亮度）
      const energyLevel = Math.min(1, level / 3);
      const energyGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, cellRadius * 0.7);
      energyGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.9 * energyLevel));
      energyGradient.addColorStop(0.6, ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.7 * energyLevel));
      energyGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.3 * energyLevel));
      ctx.fillStyle = energyGradient;
      ctx.shadowBlur = 8 * energyLevel;
      ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.8);
      ctx.beginPath();
      ctx.arc(cx, cy, cellRadius * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // 电池纹理线
      ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.4);
      ctx.lineWidth = 1;
      for (let j = 0; j < 3; j++) {
        const lineAngle = angle + (j - 1) * 0.3;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(lineAngle) * cellRadius * 0.5, cy + Math.sin(lineAngle) * cellRadius * 0.5);
        ctx.lineTo(cx + Math.cos(lineAngle) * cellRadius * 0.9, cy + Math.sin(lineAngle) * cellRadius * 0.9);
        ctx.stroke();
      }
    }
  }
  
  /**
   * 绘制激光发射器
   */
  static drawLaserEmitters(ctx, size, baseSize, level) {
    // 四方向主发射器
    const emitterCount = 4;
    const emitterDist = baseSize * 0.72;
    const emitterWidth = size * 0.08;
    const emitterHeight = size * 0.15;
    
    for (let i = 0; i < emitterCount; i++) {
      const angle = (Math.PI / 2) * i;
      const ex = Math.cos(angle) * emitterDist;
      const ey = Math.sin(angle) * emitterDist;
      
      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(angle);
      
      // 发射器外壳
      const shellGradient = ctx.createLinearGradient(0, -emitterHeight / 2, 0, emitterHeight / 2);
      shellGradient.addColorStop(0, ColorUtils.hexToCanvas(0x2d5a45, 1));
      shellGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x1a3a2e, 0.95));
      shellGradient.addColorStop(1, ColorUtils.hexToCanvas(0x0f2419, 0.9));
      ctx.fillStyle = shellGradient;
      ctx.beginPath();
      ctx.roundRect(-emitterWidth / 2, -emitterHeight / 2, emitterWidth, emitterHeight, emitterWidth / 4);
      ctx.fill();
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.7);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // 发射口发光
      const muzzleHeight = emitterHeight * 0.4;
      const muzzleGradient = ctx.createLinearGradient(0, -muzzleHeight / 2, 0, muzzleHeight / 2);
      muzzleGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.3));
      muzzleGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.8));
      muzzleGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.3));
      ctx.fillStyle = muzzleGradient;
      ctx.shadowBlur = 8;
      ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.7);
      ctx.fillRect(-emitterWidth / 2 + 1, -muzzleHeight / 2, emitterWidth - 2, muzzleHeight);
      ctx.shadowBlur = 0;
      
      // 散热槽（3条）
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x0a1a0f, 0.8);
      ctx.lineWidth = 1;
      for (let j = 0; j < 3; j++) {
        const slotY = -emitterHeight / 2 + emitterHeight * (0.3 + j * 0.2);
        ctx.beginPath();
        ctx.moveTo(-emitterWidth / 2 + 1, slotY);
        ctx.lineTo(emitterWidth / 2 - 1, slotY);
        ctx.stroke();
      }
      
      ctx.restore();
    }
  }
  
  /**
   * 绘制能量核心
   */
  static drawEnergyCore(ctx, coreRadius, size, level) {
    // 最外层光晕（脉冲效果）
    const pulseRadius = coreRadius * 2.2;
    const pulseGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseRadius);
    pulseGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.5));
    pulseGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.3));
    pulseGradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
    ctx.fillStyle = pulseGradient;
    ctx.shadowBlur = 15;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.8);
    ctx.beginPath();
    ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 外层发光环
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.4);
    ctx.shadowBlur = 12;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.7);
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius * 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 中层发光（使用径向渐变）
    const midGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius * 1.3);
    midGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.6));
    midGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.8));
    midGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.5));
    ctx.fillStyle = midGradient;
    ctx.shadowBlur = 10;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.8);
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius * 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 核心主体（亮白中心）
    const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius);
    coreGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 1));
    coreGradient.addColorStop(0.2, ColorUtils.hexToCanvas(0xe0ffe0, 1));
    coreGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 1));
    coreGradient.addColorStop(0.8, ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.95));
    coreGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.85));
    ctx.fillStyle = coreGradient;
    ctx.shadowBlur = 12;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xffffff, 1);
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 核心边框（强发光）
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 1);
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 1);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 核心旋转装饰环
    const innerRingRadius = coreRadius * 0.6;
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xffffff, 0.7);
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 6;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xffffff, 0.8);
    ctx.beginPath();
    ctx.arc(0, 0, innerRingRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  
  /**
   * 绘制全息投影环
   */
  static drawHolographicRing(ctx, size, baseSize) {
    // 三层全息环
    const ringRadii = [baseSize * 0.92, baseSize * 0.96, baseSize * 1.0];
    
    for (let i = 0; i < ringRadii.length; i++) {
      const radius = ringRadii[i];
      const opacity = 0.5 - i * 0.1;
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, opacity);
      ctx.lineWidth = 1.5 - i * 0.3;
      ctx.shadowBlur = 5 - i;
      ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, opacity);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    // 全息扫描线（12条径向线）
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI / 6) * i;
      const startR = baseSize * 0.88;
      const endR = baseSize * 1.0;
      
      const gradient = ctx.createLinearGradient(
        Math.cos(angle) * startR, Math.sin(angle) * startR,
        Math.cos(angle) * endR, Math.sin(angle) * endR
      );
      gradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.6));
      gradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0));
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * startR, Math.sin(angle) * startR);
      ctx.lineTo(Math.cos(angle) * endR, Math.sin(angle) * endR);
      ctx.stroke();
    }
  }
  
  /**
   * 绘制水晶棱镜
   */
  static drawCrystalPrisms(ctx, size, baseSize, level) {
    // 六个顶点的小水晶
    const prismCount = 6;
    const prismDist = baseSize * 0.75;
    const prismSize = size * 0.06;
    
    for (let i = 0; i < prismCount; i++) {
      const angle = (Math.PI / 3) * i + Math.PI / 6;
      const px = Math.cos(angle) * prismDist;
      const py = Math.sin(angle) * prismDist;
      
      // 水晶光晕
      ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.4);
      ctx.shadowBlur = 8;
      ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.6);
      ctx.beginPath();
      ctx.arc(px, py, prismSize * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // 水晶主体（钻石形状）
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle);
      
      const prismGradient = ctx.createLinearGradient(-prismSize, -prismSize, prismSize, prismSize);
      prismGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.8));
      prismGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.9));
      prismGradient.addColorStop(1, ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.7));
      ctx.fillStyle = prismGradient;
      ctx.shadowBlur = 6;
      ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.8);
      
      ctx.beginPath();
      ctx.moveTo(0, -prismSize);
      ctx.lineTo(prismSize * 0.6, 0);
      ctx.lineTo(0, prismSize);
      ctx.lineTo(-prismSize * 0.6, 0);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(0xffffff, 0.9);
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.restore();
    }
  }
  
  /**
   * 绘制等级升级装饰
   */
  static drawLevelUpgrades(ctx, size, baseSize, level) {
    if (level >= 2) {
      // 二级：增强能量环
      const enhancedRingRadius = baseSize * 1.08;
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.7);
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.LASER_DETAIL, 0.8);
      ctx.beginPath();
      ctx.arc(0, 0, enhancedRingRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // 能量节点（8个）
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i;
        const nx = Math.cos(angle) * enhancedRingRadius;
        const ny = Math.sin(angle) * enhancedRingRadius;
        
        ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.8);
        ctx.shadowBlur = 6;
        ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.LASER_BEAM, 0.9);
        ctx.beginPath();
        ctx.arc(nx, ny, size * 0.04, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    
    if (level >= 3) {
      // 三级：等离子护盾
      const shieldRadius = baseSize * 1.15;
      
      // 护盾主环
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x00ff88, 0.5);
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = ColorUtils.hexToCanvas(0x00ff88, 0.7);
      ctx.beginPath();
      ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // 护盾脉冲波
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x00ff88, 0.3);
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = ColorUtils.hexToCanvas(0x00ff88, 0.5);
      ctx.beginPath();
      ctx.arc(0, 0, shieldRadius + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // 护盾发生器（4个）
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI / 2) * i + Math.PI / 4;
        const gx = Math.cos(angle) * shieldRadius;
        const gy = Math.sin(angle) * shieldRadius;
        
        // 发生器光晕
        ctx.fillStyle = ColorUtils.hexToCanvas(0x00ff88, 0.6);
        ctx.shadowBlur = 10;
        ctx.shadowColor = ColorUtils.hexToCanvas(0x00ff88, 0.8);
        ctx.beginPath();
        ctx.arc(gx, gy, size * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // 发生器核心
        ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.9);
        ctx.shadowBlur = 6;
        ctx.shadowColor = ColorUtils.hexToCanvas(0x00ff88, 1);
        ctx.beginPath();
        ctx.arc(gx, gy, size * 0.03, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }
}

