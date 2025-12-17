/**
 * 狙击塔渲染器
 * 负责狙击塔的视觉绘制
 */

import { GameConfig } from '../../config/GameConfig';
import { ColorUtils, GameColors } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class SniperTowerRenderer {
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
   * 初始化狙击塔渲染缓存
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
    this.drawSniperTowerToCache(ctx, size, level);
    ctx.restore();
  }
  
  /**
   * 绘制狙击塔到缓存Canvas
   */
  static drawSniperTowerToCache(ctx, size, level) {
    // 绘制顺序：阴影层 → 底座 → 支撑架 → 主体平台 → 精密炮管 → 瞄准系统 → 稳定器 → 等级升级
    this.drawShadowLayers(ctx, size);
    this.drawSniperBase(ctx, size);
    this.drawSupportFrame(ctx, size);
    this.drawMainPlatform(ctx, size);
    this.drawPrecisionBarrel(ctx, size, level);
    this.drawTargetingSystem(ctx, size, level);
    this.drawStabilizers(ctx, size);
    this.drawLevelUpgrades(ctx, size, level);
  }
  
  /**
   * 绘制阴影层（3层渐进阴影）
   */
  static drawShadowLayers(ctx, size) {
    const baseRadius = size * 0.45;
    
    // 第一层阴影（最深）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 5, baseRadius + 3, 0, Math.PI * 2);
    ctx.fill();
    
    // 第二层阴影（中等）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.arc(0, 4, baseRadius + 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 第三层阴影（浅）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.beginPath();
    ctx.arc(0, 3, baseRadius + 1, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * 绘制狙击塔底座（八边形装甲底座+铆钉）
   */
  static drawSniperBase(ctx, size) {
    const baseRadius = size * 0.45;
    const sides = 8; // 八边形
    
    // 八边形外装甲
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
      const x = Math.cos(angle) * baseRadius;
      const y = Math.sin(angle) * baseRadius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    
    // 装甲渐变填充
    const armorGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, baseRadius);
    armorGradient.addColorStop(0, ColorUtils.hexToCanvas(0x475569, 1));
    armorGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x334155, 0.95));
    armorGradient.addColorStop(1, ColorUtils.hexToCanvas(0x1e293b, 0.9));
    ctx.fillStyle = armorGradient;
    ctx.fill();
    
    // 装甲边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x0f172a, 1);
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
    
    // 装甲铆钉（8个顶点）
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
      const x = Math.cos(angle) * baseRadius * 0.85;
      const y = Math.sin(angle) * baseRadius * 0.85;
      
      // 铆钉阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(x + 1, y + 1, size * 0.025, 0, Math.PI * 2);
      ctx.fill();
      
      // 铆钉主体
      const rivetGradient = ctx.createRadialGradient(x - 1, y - 1, 0, x, y, size * 0.025);
      rivetGradient.addColorStop(0, ColorUtils.hexToCanvas(0x64748b, 1));
      rivetGradient.addColorStop(1, ColorUtils.hexToCanvas(0x334155, 1));
      ctx.fillStyle = rivetGradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.025, 0, Math.PI * 2);
      ctx.fill();
      
      // 铆钉高光
      ctx.fillStyle = ColorUtils.hexToCanvas(0x94a3b8, 0.6);
      ctx.beginPath();
      ctx.arc(x - size * 0.008, y - size * 0.008, size * 0.01, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 底座装饰圆环（3层同心圆）
    for (let i = 0; i < 3; i++) {
      const ringRadius = baseRadius * (0.45 + i * 0.13);
      ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.SNIPER_DETAIL, 0.35 - i * 0.08);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  
  /**
   * 绘制支撑架（4个三角形稳定支架）
   */
  static drawSupportFrame(ctx, size) {
    const innerRadius = size * 0.28;
    const outerRadius = size * 0.4;
    
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      
      // 支架三角形
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cos * innerRadius, sin * innerRadius);
      ctx.lineTo(cos * outerRadius - sin * size * 0.05, sin * outerRadius + cos * size * 0.05);
      ctx.lineTo(cos * outerRadius + sin * size * 0.05, sin * outerRadius - cos * size * 0.05);
      ctx.closePath();
      
      // 支架渐变
      const supportGradient = ctx.createLinearGradient(
        cos * innerRadius, sin * innerRadius,
        cos * outerRadius, sin * outerRadius
      );
      supportGradient.addColorStop(0, ColorUtils.hexToCanvas(0x64748b, 0.9));
      supportGradient.addColorStop(1, ColorUtils.hexToCanvas(0x475569, 0.8));
      ctx.fillStyle = supportGradient;
      ctx.fill();
      
      // 支架边框
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x334155, 0.9);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
  }
  
  /**
   * 绘制主体平台（圆形精密平台+透视窗）
   */
  static drawMainPlatform(ctx, size) {
    const platformRadius = size * 0.3;
    
    // 平台主体渐变
    const platformGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, platformRadius);
    platformGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.SNIPER_TOWER, 1));
    platformGradient.addColorStop(0.6, ColorUtils.hexToCanvas(GameColors.SNIPER_BASE, 0.95));
    platformGradient.addColorStop(1, ColorUtils.hexToCanvas(0x1e293b, 0.9));
    ctx.fillStyle = platformGradient;
    ctx.beginPath();
    ctx.arc(0, 0, platformRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 平台边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x0f172a, 1);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 透视窗（3个青色观察窗）
    for (let i = 0; i < 3; i++) {
      const angle = (Math.PI * 2 / 3) * i - Math.PI / 2;
      const x = Math.cos(angle) * platformRadius * 0.65;
      const y = Math.sin(angle) * platformRadius * 0.65;
      
      // 窗口渐变
      const windowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 0.045);
      windowGradient.addColorStop(0, ColorUtils.hexToCanvas(0x06b6d4, 0.9));
      windowGradient.addColorStop(0.6, ColorUtils.hexToCanvas(0x0891b2, 0.7));
      windowGradient.addColorStop(1, ColorUtils.hexToCanvas(0x164e63, 0.5));
      ctx.fillStyle = windowGradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.045, 0, Math.PI * 2);
      ctx.fill();
      
      // 窗口发光
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x06b6d4, 0.8);
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = ColorUtils.hexToCanvas(0x06b6d4, 0.6);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    // 中央核心装饰
    const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, platformRadius * 0.25);
    coreGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.SNIPER_DETAIL, 0.8));
    coreGradient.addColorStop(1, ColorUtils.hexToCanvas(0x334155, 0.6));
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(0, 0, platformRadius * 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.SNIPER_DETAIL, 0.7);
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  
  /**
   * 绘制精密炮管（细长精密炮管+散热槽+高光）
   */
  static drawPrecisionBarrel(ctx, size, level) {
    const barrelLength = size * 0.7;
    const barrelWidth = size * 0.12;
    const startX = 0;
    
    // 炮管阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.roundRect(startX + 2, -barrelWidth / 2 + 2, barrelLength, barrelWidth, barrelWidth / 2);
    ctx.fill();
    
    // 炮管主体渐变
    const barrelGradient = ctx.createLinearGradient(startX, -barrelWidth / 2, startX, barrelWidth / 2);
    barrelGradient.addColorStop(0, ColorUtils.hexToCanvas(0x475569, 0.95));
    barrelGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.SNIPER_TOWER, 1));
    barrelGradient.addColorStop(1, ColorUtils.hexToCanvas(0x475569, 0.95));
    ctx.fillStyle = barrelGradient;
    ctx.beginPath();
    ctx.roundRect(startX, -barrelWidth / 2, barrelLength, barrelWidth, barrelWidth / 2);
    ctx.fill();
    
    // 炮管边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x1e293b, 1);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 炮管顶部高光
    const highlightGradient = ctx.createLinearGradient(startX, -barrelWidth / 2, startX + barrelLength * 0.4, -barrelWidth / 2);
    highlightGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.5));
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = highlightGradient;
    ctx.fillRect(startX, -barrelWidth / 2, barrelLength * 0.4, barrelWidth * 0.25);
    
    // 散热槽（6条）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x1e293b, 0.8);
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const x = startX + barrelLength * (0.2 + i * 0.12);
      ctx.beginPath();
      ctx.moveTo(x, -barrelWidth * 0.45);
      ctx.lineTo(x, barrelWidth * 0.45);
      ctx.stroke();
    }
    
    // 炮管接口（连接平台）
    const mountGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, barrelWidth * 0.8);
    mountGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.SNIPER_DETAIL, 0.9));
    mountGradient.addColorStop(1, ColorUtils.hexToCanvas(0x334155, 0.7));
    ctx.fillStyle = mountGradient;
    ctx.beginPath();
    ctx.arc(0, 0, barrelWidth * 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.SNIPER_DETAIL, 0.8);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 炮管装饰标记（上下对称）
    for (let i = 0; i < 2; i++) {
      const y = (i === 0 ? -1 : 1) * barrelWidth * 0.55;
      const x = barrelLength * 0.35;
      
      ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.SNIPER_DETAIL, 0.7);
      ctx.beginPath();
      ctx.arc(x, y, size * 0.022, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x0f172a, 0.8);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  
  /**
   * 绘制瞄准系统（高级光学瞄准镜+激光测距仪）
   */
  static drawTargetingSystem(ctx, size, level) {
    const scopeRadius = size * 0.16;
    const scopeX = size * 0.4;
    const scopeY = -size * 0.12;
    
    // 主瞄准镜外层光晕
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.SNIPER_DETAIL, 0.25);
    ctx.beginPath();
    ctx.arc(scopeX, scopeY, scopeRadius * 1.3, 0, Math.PI * 2);
    ctx.fill();
    
    // 主瞄准镜渐变
    const scopeGradient = ctx.createRadialGradient(scopeX, scopeY, 0, scopeX, scopeY, scopeRadius);
    scopeGradient.addColorStop(0, ColorUtils.hexToCanvas(0x0891b2, 0.9));
    scopeGradient.addColorStop(0.3, ColorUtils.hexToCanvas(GameColors.SNIPER_DETAIL, 1));
    scopeGradient.addColorStop(0.7, ColorUtils.hexToCanvas(GameColors.SNIPER_TOWER, 0.95));
    scopeGradient.addColorStop(1, ColorUtils.hexToCanvas(0x1e293b, 0.9));
    ctx.fillStyle = scopeGradient;
    ctx.beginPath();
    ctx.arc(scopeX, scopeY, scopeRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 瞄准镜边框发光
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.SNIPER_DETAIL, 1);
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.SNIPER_DETAIL, 0.7);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 瞄准镜十字线（精密）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xffffff, 0.95);
    ctx.lineWidth = 1.8;
    ctx.shadowBlur = 5;
    ctx.shadowColor = ColorUtils.hexToCanvas(0x06b6d4, 0.6);
    ctx.beginPath();
    // 水平线
    ctx.moveTo(scopeX - scopeRadius * 0.5, scopeY);
    ctx.lineTo(scopeX + scopeRadius * 0.5, scopeY);
    // 垂直线
    ctx.moveTo(scopeX, scopeY - scopeRadius * 0.5);
    ctx.lineTo(scopeX, scopeY + scopeRadius * 0.5);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 瞄准镜中心点
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.9);
    ctx.beginPath();
    ctx.arc(scopeX, scopeY, scopeRadius * 0.12, 0, Math.PI * 2);
    ctx.fill();
    
    // 瞄准镜刻度环
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x06b6d4, 0.6);
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i;
      const innerR = scopeRadius * 0.7;
      const outerR = scopeRadius * 0.85;
      const x1 = scopeX + Math.cos(angle) * innerR;
      const y1 = scopeY + Math.sin(angle) * innerR;
      const x2 = scopeX + Math.cos(angle) * outerR;
      const y2 = scopeY + Math.sin(angle) * outerR;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    
    // 副瞄准镜（激光测距仪）
    if (level >= 2) {
      const scope2X = size * 0.25;
      const scope2Y = size * 0.12;
      const scope2Radius = scopeRadius * 0.7;
      
      const scope2Gradient = ctx.createRadialGradient(scope2X, scope2Y, 0, scope2X, scope2Y, scope2Radius);
      scope2Gradient.addColorStop(0, ColorUtils.hexToCanvas(0xef4444, 0.8));
      scope2Gradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x991b1b, 0.7));
      scope2Gradient.addColorStop(1, ColorUtils.hexToCanvas(0x7f1d1d, 0.6));
      ctx.fillStyle = scope2Gradient;
      ctx.beginPath();
      ctx.arc(scope2X, scope2Y, scope2Radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(0xef4444, 0.9);
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 8;
      ctx.shadowColor = ColorUtils.hexToCanvas(0xef4444, 0.6);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // 激光测距标记
      ctx.fillStyle = ColorUtils.hexToCanvas(0xfef2f2, 0.9);
      ctx.beginPath();
      ctx.arc(scope2X, scope2Y, scope2Radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  /**
   * 绘制稳定器（液压稳定支架）
   */
  static drawStabilizers(ctx, size) {
    const stabilizers = [
      { angle: -Math.PI / 3, length: size * 0.18 },
      { angle: Math.PI / 3, length: size * 0.18 }
    ];
    
    stabilizers.forEach(({ angle, length }) => {
      const startX = Math.cos(angle) * size * 0.25;
      const startY = Math.sin(angle) * size * 0.25;
      const endX = Math.cos(angle) * (size * 0.25 + length);
      const endY = Math.sin(angle) * (size * 0.25 + length);
      
      // 稳定器主体
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x475569, 0.9);
      ctx.lineWidth = size * 0.035;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // 稳定器边框
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x1e293b, 0.8);
      ctx.lineWidth = size * 0.04;
      ctx.stroke();
      
      // 液压接头
      const jointGradient = ctx.createRadialGradient(endX, endY, 0, endX, endY, size * 0.04);
      jointGradient.addColorStop(0, ColorUtils.hexToCanvas(0x64748b, 1));
      jointGradient.addColorStop(1, ColorUtils.hexToCanvas(0x334155, 0.9));
      ctx.fillStyle = jointGradient;
      ctx.beginPath();
      ctx.arc(endX, endY, size * 0.04, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x0f172a, 0.9);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }
  
  /**
   * 绘制等级升级（Lv2: 消音器, Lv3: 电磁护盾）
   */
  static drawLevelUpgrades(ctx, size, level) {
    const barrelLength = size * 0.7;
    const barrelWidth = size * 0.12;
    
    if (level >= 2) {
      // Lv2: 高级消音器
      const silencerX = barrelLength * 0.82;
      const silencerLength = barrelLength * 0.18;
      const silencerHeight = barrelWidth * 1.5;
      
      // 消音器主体
      const silencerGradient = ctx.createLinearGradient(silencerX, -silencerHeight / 2, silencerX, silencerHeight / 2);
      silencerGradient.addColorStop(0, ColorUtils.hexToCanvas(0x334155, 0.95));
      silencerGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x475569, 1));
      silencerGradient.addColorStop(1, ColorUtils.hexToCanvas(0x334155, 0.95));
      ctx.fillStyle = silencerGradient;
      ctx.beginPath();
      ctx.roundRect(silencerX, -silencerHeight / 2, silencerLength, silencerHeight, barrelWidth * 0.35);
      ctx.fill();
      
      // 消音器边框
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x1e293b, 1);
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 消音器散热孔（5条）
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x0f172a, 0.8);
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        const x = silencerX + silencerLength * (0.2 + i * 0.15);
        ctx.beginPath();
        ctx.moveTo(x, -silencerHeight * 0.45);
        ctx.lineTo(x, silencerHeight * 0.45);
        ctx.stroke();
      }
      
      // 消音器接口环
      ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.SNIPER_DETAIL, 0.7);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(silencerX + silencerLength * 0.15, 0, silencerHeight * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    if (level >= 3) {
      // Lv3: 青色电磁护盾
      const shieldRadius = size * 0.58;
      
      // 护盾光晕
      const shieldGradient = ctx.createRadialGradient(0, 0, shieldRadius * 0.7, 0, 0, shieldRadius);
      shieldGradient.addColorStop(0, 'rgba(6, 182, 212, 0)');
      shieldGradient.addColorStop(0.7, ColorUtils.hexToCanvas(0x06b6d4, 0.15));
      shieldGradient.addColorStop(0.9, ColorUtils.hexToCanvas(0x06b6d4, 0.3));
      shieldGradient.addColorStop(1, ColorUtils.hexToCanvas(0x06b6d4, 0.1));
      ctx.fillStyle = shieldGradient;
      ctx.beginPath();
      ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // 护盾边缘
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x06b6d4, 0.7);
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 15;
      ctx.shadowColor = ColorUtils.hexToCanvas(0x06b6d4, 0.8);
      ctx.beginPath();
      ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // 护盾能量节点（6个）
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 / 6) * i;
        const x = Math.cos(angle) * shieldRadius;
        const y = Math.sin(angle) * shieldRadius;
        
        const nodeGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 0.035);
        nodeGradient.addColorStop(0, ColorUtils.hexToCanvas(0x22d3ee, 0.9));
        nodeGradient.addColorStop(1, ColorUtils.hexToCanvas(0x06b6d4, 0.3));
        ctx.fillStyle = nodeGradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.035, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = ColorUtils.hexToCanvas(0x06b6d4, 0.8);
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 8;
        ctx.shadowColor = ColorUtils.hexToCanvas(0x06b6d4, 0.6);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
  }
  
  /**
   * 从缓存渲染狙击塔（固定朝向，向右）
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
   * 渲染狙击塔
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

