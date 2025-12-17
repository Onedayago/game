/**
 * 火箭塔渲染器
 * 负责火箭塔的视觉绘制
 */

import { GameConfig } from '../../config/GameConfig';
import { ColorUtils, GameColors } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class RocketTowerRenderer {
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
   * 初始化火箭塔渲染缓存
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
    this.drawRocketTowerToCache(ctx, size, level);
    ctx.restore();
  }
  
  /**
   * 绘制火箭塔到缓存Canvas
   */
  static drawRocketTowerToCache(ctx, size, level) {
    const baseWidth = size * 0.7;
    const baseHeight = size * 0.3;
    const towerWidth = size * 0.34;
    const towerHeight = size * 0.9;
    
    // 模块化绘制 - 导弹发射平台
    this.drawShadowLayers(ctx, baseWidth, baseHeight, towerWidth, towerHeight, size);
    this.drawRocketBase(ctx, baseWidth, baseHeight, size, level);
    this.drawStabilizers(ctx, baseWidth, baseHeight, size);
    this.drawRocketTower(ctx, towerWidth, towerHeight, size, level);
    this.drawLaunchRails(ctx, size, towerWidth, towerHeight);
    this.drawMissilePods(ctx, size, towerWidth, towerHeight, level);
    this.drawRadarSystem(ctx, size, towerWidth, towerHeight, level);
    this.drawLevelUpgrades(ctx, size, towerWidth, towerHeight, level);
  }
  
  /**
   * 从缓存渲染火箭塔（固定朝向）
   */
  static renderFromCache(ctx, x, y, size, level) {
    const cacheKey = this.getCacheKey(size, level);
    const cachedCanvas = this._cachedCanvases[cacheKey];
    
    if (!cachedCanvas) return;
    
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
   * 渲染火箭塔
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
    
    // 使用缓存渲染
    this.renderFromCache(ctx, x, y, size, level);
  }
  
  /**
   * 绘制多层阴影
   */
  static drawShadowLayers(ctx, baseWidth, baseHeight, towerWidth, towerHeight, size) {
    // 第一层阴影（主阴影）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(-baseWidth / 2, -size / 2 + 7, baseWidth, size - 8, size * 0.18);
    ctx.fill();
    
    // 第二层阴影（次阴影）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.roundRect(-baseWidth / 2 + 3, -size / 2 + 9, baseWidth - 6, size - 12, size * 0.15);
    ctx.fill();
    
    // 第三层阴影（软阴影）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.roundRect(-baseWidth / 2 + 6, -size / 2 + 11, baseWidth - 12, size - 16, size * 0.12);
    ctx.fill();
  }
  
  /**
   * 绘制火箭底座
   */
  static drawRocketBase(ctx, baseWidth, baseHeight, size, level) {
    // 底座主体（装甲板）
    const baseGradient = ctx.createLinearGradient(0, size / 2 - baseHeight, 0, size / 2);
    baseGradient.addColorStop(0, ColorUtils.hexToCanvas(0x374151, 1));
    baseGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x1f2937, 0.95));
    baseGradient.addColorStop(1, ColorUtils.hexToCanvas(0x111827, 0.9));
    ctx.fillStyle = baseGradient;
    ctx.beginPath();
    ctx.roundRect(-baseWidth / 2, size / 2 - baseHeight, baseWidth, baseHeight, baseHeight * 0.6);
    ctx.fill();
    
    // 装甲边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x0f172a, 1);
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 内层装甲板
    const innerWidth = baseWidth * 0.85;
    const innerHeight = baseHeight * 0.6;
    const innerGradient = ctx.createLinearGradient(0, size / 2 - innerHeight, 0, size / 2);
    innerGradient.addColorStop(0, ColorUtils.hexToCanvas(0x475569, 1));
    innerGradient.addColorStop(0.6, ColorUtils.hexToCanvas(0x334155, 0.95));
    innerGradient.addColorStop(1, ColorUtils.hexToCanvas(0x1e293b, 0.9));
    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.roundRect(-innerWidth / 2, size / 2 - innerHeight * 0.9, innerWidth, innerHeight, innerHeight * 0.3);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.6);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 装甲分段线（6段）
    for (let i = 1; i < 6; i++) {
      const segmentX = -baseWidth / 2 + (baseWidth / 6) * i;
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x1e293b, 0.7);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(segmentX, size / 2 - baseHeight);
      ctx.lineTo(segmentX, size / 2);
      ctx.stroke();
    }
    
    // 底座铆钉（12个）
    const rivetRadius = size * 0.02;
    const rivetCount = 12;
    for (let i = 0; i < rivetCount; i++) {
      const rivetX = -baseWidth / 2 + (baseWidth / (rivetCount - 1)) * i;
      const rivetY = size / 2 - baseHeight * 0.5;
      
      // 铆钉阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(rivetX + 1, rivetY + 1, rivetRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // 铆钉主体
      const rivetGradient = ctx.createRadialGradient(rivetX - rivetRadius * 0.3, rivetY - rivetRadius * 0.3, 0, rivetX, rivetY, rivetRadius);
      rivetGradient.addColorStop(0, ColorUtils.hexToCanvas(0x94a3b8, 1));
      rivetGradient.addColorStop(0.6, ColorUtils.hexToCanvas(0x64748b, 1));
      rivetGradient.addColorStop(1, ColorUtils.hexToCanvas(0x475569, 1));
      ctx.fillStyle = rivetGradient;
      ctx.beginPath();
      ctx.arc(rivetX, rivetY, rivetRadius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x334155, 0.8);
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }
  
  /**
   * 绘制稳定器
   */
  static drawStabilizers(ctx, baseWidth, baseHeight, size) {
    // 左右稳定器（三角形支架）
    const stabWidth = baseWidth * 0.2;
    const stabHeight = baseHeight * 1.2;
    
    for (let side = -1; side <= 1; side += 2) {
      const stabX = (baseWidth / 2) * side;
      
      // 稳定器阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.moveTo(stabX, size / 2 - baseHeight + 2);
      ctx.lineTo(stabX + stabWidth * side, size / 2 + 2);
      ctx.lineTo(stabX, size / 2 + 2);
      ctx.closePath();
      ctx.fill();
      
      // 稳定器主体
      const stabGradient = ctx.createLinearGradient(stabX, size / 2 - baseHeight, stabX + stabWidth * side, size / 2);
      stabGradient.addColorStop(0, ColorUtils.hexToCanvas(0x475569, 0.95));
      stabGradient.addColorStop(0.6, ColorUtils.hexToCanvas(0x334155, 0.9));
      stabGradient.addColorStop(1, ColorUtils.hexToCanvas(0x1e293b, 0.85));
      ctx.fillStyle = stabGradient;
      ctx.beginPath();
      ctx.moveTo(stabX, size / 2 - baseHeight);
      ctx.lineTo(stabX + stabWidth * side, size / 2);
      ctx.lineTo(stabX, size / 2);
      ctx.closePath();
      ctx.fill();
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x0f172a, 0.9);
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 稳定器加强筋
      ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.5);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(stabX, size / 2 - baseHeight * 0.5);
      ctx.lineTo(stabX + stabWidth * side * 0.6, size / 2);
      ctx.stroke();
    }
  }
  
  /**
   * 绘制火箭塔身
   */
  static drawRocketTower(ctx, towerWidth, towerHeight, size, level) {
    // 外层发光光晕
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.3);
    ctx.shadowBlur = 15;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.6);
    ctx.beginPath();
    ctx.roundRect(-towerWidth / 2 - 5, -towerHeight / 2 - 5, towerWidth + 10, towerHeight + 10, towerWidth * 0.5);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 塔身主体（多层渐变）
    const towerGradient = ctx.createLinearGradient(-towerWidth / 2, -towerHeight / 2, -towerWidth / 2, towerHeight / 2);
    towerGradient.addColorStop(0, ColorUtils.hexToCanvas(0x374151, 1));
    towerGradient.addColorStop(0.2, ColorUtils.hexToCanvas(0x334155, 0.98));
    towerGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x475569, 0.95));
    towerGradient.addColorStop(0.8, ColorUtils.hexToCanvas(0x334155, 0.98));
    towerGradient.addColorStop(1, ColorUtils.hexToCanvas(0x1e293b, 1));
    ctx.fillStyle = towerGradient;
    ctx.beginPath();
    ctx.roundRect(-towerWidth / 2, -towerHeight / 2, towerWidth, towerHeight, towerWidth * 0.5);
    ctx.fill();
    
    // 塔身发光边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 1);
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.8);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 塔身装甲板（3块）
    const plateHeight = towerHeight * 0.25;
    for (let i = 0; i < 3; i++) {
      const plateY = -towerHeight / 2 + towerHeight * (0.15 + i * 0.28);
      const plateWidth = towerWidth * 0.85;
      
      const plateGradient = ctx.createLinearGradient(-plateWidth / 2, plateY, plateWidth / 2, plateY);
      plateGradient.addColorStop(0, ColorUtils.hexToCanvas(0x1e293b, 0.8));
      plateGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x334155, 0.9));
      plateGradient.addColorStop(1, ColorUtils.hexToCanvas(0x1e293b, 0.8));
      ctx.fillStyle = plateGradient;
      ctx.beginPath();
      ctx.roundRect(-plateWidth / 2, plateY, plateWidth, plateHeight, plateHeight * 0.15);
      ctx.fill();
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x0f172a, 0.7);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // 观察窗（3个，青色发光）
    const windowWidth = towerWidth * 0.28;
    const windowHeight = towerHeight * 0.12;
    
    for (let i = 0; i < 3; i++) {
      const wy = -towerHeight * 0.3 + i * windowHeight * 1.8;
      
      // 窗口外层光晕
      ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ALLY_DETAIL, 0.4);
      ctx.shadowBlur = 12;
      ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.ALLY_DETAIL, 0.6);
      ctx.beginPath();
      ctx.roundRect(-windowWidth / 2 - 3, wy - 3, windowWidth + 6, windowHeight + 6, windowHeight * 0.5);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // 窗口主体（径向渐变）
      const windowGradient = ctx.createRadialGradient(0, wy + windowHeight / 2, 0, 0, wy + windowHeight / 2, windowWidth / 2);
      windowGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.9));
      windowGradient.addColorStop(0.4, ColorUtils.hexToCanvas(GameColors.ALLY_DETAIL, 1));
      windowGradient.addColorStop(0.8, ColorUtils.hexToCanvas(0x0891b2, 0.9));
      windowGradient.addColorStop(1, ColorUtils.hexToCanvas(0x164e63, 0.8));
      ctx.fillStyle = windowGradient;
      ctx.shadowBlur = 8;
      ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.ALLY_DETAIL, 0.8);
      ctx.beginPath();
      ctx.roundRect(-windowWidth / 2, wy, windowWidth, windowHeight, windowHeight * 0.4);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // 窗口边框
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x06b6d4, 1);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // 内部反光点
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(-windowWidth * 0.2, wy + windowHeight * 0.3, windowWidth * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 塔身加强筋（垂直线条）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x1e293b, 0.8);
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const lineX = -towerWidth / 2 + (towerWidth / 3) * i;
      if (Math.abs(lineX) < towerWidth * 0.15) continue; // 跳过中心
      
      ctx.beginPath();
      ctx.moveTo(lineX, -towerHeight / 2 + towerHeight * 0.1);
      ctx.lineTo(lineX, towerHeight / 2 - towerHeight * 0.1);
      ctx.stroke();
    }
  }
  
  /**
   * 绘制发射轨道
   */
  static drawLaunchRails(ctx, size, towerWidth, towerHeight) {
    const railWidth = towerWidth * 1.5;
    const railHeight = towerHeight * 0.25;
    const railY = -towerHeight * 0.05;
    
    // 导轨阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.roundRect(-railWidth / 2 + 2, railY + 2, railWidth, railHeight, railHeight * 0.2);
    ctx.fill();
    
    // 导轨主体
    const railGradient = ctx.createLinearGradient(0, railY, 0, railY + railHeight);
    railGradient.addColorStop(0, ColorUtils.hexToCanvas(0x0f172a, 1));
    railGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x1e293b, 0.95));
    railGradient.addColorStop(1, ColorUtils.hexToCanvas(0x0f172a, 1));
    ctx.fillStyle = railGradient;
    ctx.beginPath();
    ctx.roundRect(-railWidth / 2, railY, railWidth, railHeight, railHeight * 0.2);
    ctx.fill();
    
    // 导轨边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x334155, 0.8);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 导轨槽（3条）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x000000, 0.6);
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const slotY = railY + railHeight * (0.2 + i * 0.3);
      ctx.beginPath();
      ctx.moveTo(-railWidth / 2 + railWidth * 0.1, slotY);
      ctx.lineTo(railWidth / 2 - railWidth * 0.1, slotY);
      ctx.stroke();
    }
    
    // 左右两侧尾翼导轨
    const sideRailWidth = towerWidth * 0.25;
    const sideRailHeight = towerHeight * 0.4;
    
    for (let side = -1; side <= 1; side += 2) {
      const sideX = towerWidth * 0.85 * side;
      
      const sideGradient = ctx.createLinearGradient(sideX, -sideRailHeight / 2, sideX, sideRailHeight / 2);
      sideGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.9));
      sideGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 1));
      sideGradient.addColorStop(1, ColorUtils.hexToCanvas(0xd946ef, 0.85));
      ctx.fillStyle = sideGradient;
      ctx.shadowBlur = 8;
      ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.6);
      ctx.beginPath();
      ctx.roundRect(sideX - sideRailWidth / 2, -sideRailHeight / 2, sideRailWidth, sideRailHeight, sideRailWidth * 0.5);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 1);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  
  /**
   * 绘制导弹发射舱
   */
  static drawMissilePods(ctx, size, towerWidth, towerHeight, level) {
    const podWidth = towerWidth * 0.6;
    const podHeight = towerHeight * 0.35;
    const podY = -towerHeight * 0.42;
    
    // 发射舱阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.roundRect(-podWidth / 2 + 2, podY + 2, podWidth, podHeight, podWidth * 0.3);
    ctx.fill();
    
    // 发射舱主体
    const podGradient = ctx.createLinearGradient(-podWidth / 2, podY, podWidth / 2, podY);
    podGradient.addColorStop(0, ColorUtils.hexToCanvas(0x7c3aed, 0.9));
    podGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.ROCKET_BULLET, 1));
    podGradient.addColorStop(1, ColorUtils.hexToCanvas(0x7c3aed, 0.9));
    ctx.fillStyle = podGradient;
    ctx.shadowBlur = 10;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.ROCKET_BULLET, 0.6);
    ctx.beginPath();
    ctx.roundRect(-podWidth / 2, podY, podWidth, podHeight, podWidth * 0.3);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 发射舱边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x5b21b6, 1);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 弹药指示条纹（3条）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x1e1b4b, 0.7);
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const stripeY = podY + podHeight * (0.25 + i * 0.25);
      ctx.beginPath();
      ctx.moveTo(-podWidth / 2 + podWidth * 0.15, stripeY);
      ctx.lineTo(podWidth / 2 - podWidth * 0.15, stripeY);
      ctx.stroke();
    }
    
    // 弹头锁定装置（2个）
    const lockRadius = podWidth * 0.08;
    for (let i = 0; i < 2; i++) {
      const lockX = -podWidth * 0.25 + i * podWidth * 0.5;
      const lockY = podY + podHeight * 0.5;
      
      ctx.fillStyle = ColorUtils.hexToCanvas(0xfbbf24, 0.8);
      ctx.shadowBlur = 6;
      ctx.shadowColor = ColorUtils.hexToCanvas(0xfbbf24, 0.7);
      ctx.beginPath();
      ctx.arc(lockX, lockY, lockRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(0xf59e0b, 1);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
  
  /**
   * 绘制雷达系统
   */
  static drawRadarSystem(ctx, size, towerWidth, towerHeight, level) {
    const radarY = -towerHeight * 0.58;
    const radarRadius = towerWidth * 0.22;
    
    // 最外层脉冲光晕
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.3);
    ctx.shadowBlur = 18;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.7);
    ctx.beginPath();
    ctx.arc(0, radarY, radarRadius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 外层光环
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.25);
    ctx.shadowBlur = 12;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.6);
    ctx.beginPath();
    ctx.arc(0, radarY, radarRadius * 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 雷达主体（径向渐变）
    const radarGradient = ctx.createRadialGradient(0, radarY, 0, 0, radarY, radarRadius);
    radarGradient.addColorStop(0, ColorUtils.hexToCanvas(0xfef3c7, 1));
    radarGradient.addColorStop(0.3, ColorUtils.hexToCanvas(0xfde047, 1));
    radarGradient.addColorStop(0.6, ColorUtils.hexToCanvas(0xfbbf24, 0.95));
    radarGradient.addColorStop(0.9, ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 0.9));
    radarGradient.addColorStop(1, ColorUtils.hexToCanvas(0xca8a04, 0.85));
    ctx.fillStyle = radarGradient;
    ctx.shadowBlur = 15;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.ROCKET_DETAIL, 1);
    ctx.beginPath();
    ctx.arc(0, radarY, radarRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 雷达边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xfbbf24, 1);
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xfbbf24, 0.8);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 雷达扫描环
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xfde047, 0.7);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, radarY, radarRadius * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xfde047, 0.5);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, radarY, radarRadius * 0.45, 0, Math.PI * 2);
    ctx.stroke();
    
    // 雷达核心
    const coreRadius = radarRadius * 0.25;
    const coreGradient = ctx.createRadialGradient(0, radarY, 0, 0, radarY, coreRadius);
    coreGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 1));
    coreGradient.addColorStop(0.6, ColorUtils.hexToCanvas(0xfef3c7, 1));
    coreGradient.addColorStop(1, ColorUtils.hexToCanvas(0xfde047, 0.9));
    ctx.fillStyle = coreGradient;
    ctx.shadowBlur = 12;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xffffff, 1);
    ctx.beginPath();
    ctx.arc(0, radarY, coreRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 雷达扫描线（4条）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xfbbf24, 0.6);
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i;
      ctx.beginPath();
      ctx.moveTo(0, radarY);
      ctx.lineTo(Math.cos(angle) * radarRadius * 0.8, radarY + Math.sin(angle) * radarRadius * 0.8);
      ctx.stroke();
    }
  }
  
  /**
   * 绘制等级升级装饰
   */
  static drawLevelUpgrades(ctx, size, towerWidth, towerHeight, level) {
    if (level >= 2) {
      // 二级：双导弹发射架
      const podWidth = towerWidth * 0.35;
      const podHeight = towerHeight * 0.2;
      
      for (let side = -1; side <= 1; side += 2) {
        const podX = towerWidth * 1.1 * side;
        const podY = towerHeight * 0.15;
        
        // 发射架主体
        const podGradient = ctx.createLinearGradient(podX - podWidth / 2, podY, podX + podWidth / 2, podY);
        podGradient.addColorStop(0, ColorUtils.hexToCanvas(0x6366f1, 0.9));
        podGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x818cf8, 1));
        podGradient.addColorStop(1, ColorUtils.hexToCanvas(0x6366f1, 0.9));
        ctx.fillStyle = podGradient;
        ctx.shadowBlur = 8;
        ctx.shadowColor = ColorUtils.hexToCanvas(0x6366f1, 0.6);
        ctx.beginPath();
        ctx.roundRect(podX - podWidth / 2, podY, podWidth, podHeight, podWidth * 0.25);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = ColorUtils.hexToCanvas(0x4f46e5, 1);
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    
    if (level >= 3) {
      // 三级：护盾发生器
      const shieldRadius = towerWidth * 1.8;
      
      // 护盾主环
      ctx.strokeStyle = ColorUtils.hexToCanvas(0xa78bfa, 0.5);
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = ColorUtils.hexToCanvas(0xa78bfa, 0.7);
      ctx.beginPath();
      ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // 护盾脉冲环
      ctx.strokeStyle = ColorUtils.hexToCanvas(0xa78bfa, 0.3);
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = ColorUtils.hexToCanvas(0xa78bfa, 0.5);
      ctx.beginPath();
      ctx.arc(0, 0, shieldRadius + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // 护盾节点（4个）
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI / 2) * i + Math.PI / 4;
        const nodeX = Math.cos(angle) * shieldRadius;
        const nodeY = Math.sin(angle) * shieldRadius;
        
        ctx.fillStyle = ColorUtils.hexToCanvas(0xc4b5fd, 0.8);
        ctx.shadowBlur = 10;
        ctx.shadowColor = ColorUtils.hexToCanvas(0xc4b5fd, 0.9);
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, towerWidth * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.9);
        ctx.shadowBlur = 6;
        ctx.shadowColor = ColorUtils.hexToCanvas(0xffffff, 1);
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, towerWidth * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }
}

