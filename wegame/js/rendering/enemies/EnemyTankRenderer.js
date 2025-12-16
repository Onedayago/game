/**
 * 敌人坦克渲染器
 * 负责敌人坦克的视觉绘制（带离屏缓存优化）
 */

import { ColorUtils, GameColors } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class EnemyTankRenderer {
  // 离屏Canvas缓存
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _cacheSize = 0;
  static _initialized = false;
  
  /**
   * 初始化敌人坦克渲染缓存
   */
  static initCache(size) {
    if (this._initialized && this._cacheSize === size) {
      return; // 已经初始化且尺寸相同
    }
    
    const canvasSize = Math.ceil(size * 1.2);
    
    this._cachedCanvas = wx.createCanvas();
    this._cachedCanvas.width = canvasSize;
    this._cachedCanvas.height = canvasSize;
    
    this._cachedCtx = this._cachedCanvas.getContext('2d');
    this._cacheSize = size;
    
    this._cachedCtx.clearRect(0, 0, canvasSize, canvasSize);
    
    polyfillRoundRect(this._cachedCtx);
    this.drawEnemyToCache(this._cachedCtx, size, canvasSize / 2, canvasSize / 2);
    
    this._initialized = true;
  }
  
  /**
   * 绘制敌人到缓存Canvas（模块化重装甲坦克）
   */
  static drawEnemyToCache(ctx, size, centerX, centerY) {
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // 绘制顺序：阴影 → 履带 → 车体 → 装甲板 → 炮塔 → 炮管 → 细节
    this.drawShadowLayers(ctx, size);
    this.drawTrackSystem(ctx, size);
    this.drawMainHull(ctx, size);
    this.drawArmorPlates(ctx, size);
    this.drawExhaustPorts(ctx, size);
    this.drawRivets(ctx, size);
    this.drawTurretSystem(ctx, size);
    this.drawMainGun(ctx, size);
    this.drawThreatMarkers(ctx, size);
    this.drawViewPorts(ctx, size);
    
    ctx.restore();
  }
  
  /**
   * 渲染敌人坦克（固定朝向，向右）
   */
  static render(ctx, x, y, size) {
    // 初始化缓存（如果未初始化或尺寸不同）
    if (!this._initialized || this._cacheSize !== size) {
      this.initCache(size);
    }
    // 使用缓存渲染
    this.renderFromCache(ctx, x, y, size);
  }
  
  /**
   * 从缓存渲染敌人（固定朝向）
   */
  static renderFromCache(ctx, x, y, size) {
    if (!this._cachedCanvas) return;
    
    const canvasSize = this._cachedCanvas.width;
    const halfSize = canvasSize * 0.5;
    
    // 从缓存Canvas绘制（居中绘制）
    ctx.drawImage(
      this._cachedCanvas,
      x - halfSize,
      y - halfSize,
      canvasSize,
      canvasSize
    );
  }
  
  /**
   * 绘制多层阴影（3层渐进阴影）
   */
  static drawShadowLayers(ctx, size) {
    // 第一层阴影（最深）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 3, -size / 2 + 5, size - 6, size - 5, size * 0.15);
    ctx.fill();
    
    // 第二层阴影（中等）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 4, -size / 2 + 6, size - 8, size - 7, size * 0.15);
    ctx.fill();
    
    // 第三层阴影（浅）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 5, -size / 2 + 7, size - 10, size - 9, size * 0.15);
    ctx.fill();
  }
  
  /**
   * 绘制履带系统（履带+装甲板+滚轮+悬挂）
   */
  static drawTrackSystem(ctx, size) {
    const trackHeight = size * 0.22;
    const wheelRadius = trackHeight * 0.35;
    const wheelCount = 5;
    
    // 绘制上下履带主体
    for (let side = 0; side < 2; side++) {
      const trackY = side === 0 ? -size / 2 : size / 2 - trackHeight;
      
      // 履带外壳（深黑色）
      const trackGradient = ctx.createLinearGradient(-size / 2, trackY, -size / 2, trackY + trackHeight);
      trackGradient.addColorStop(0, ColorUtils.hexToCanvas(0x0a0f1a, 1));
      trackGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x1e293b, 0.95));
      trackGradient.addColorStop(1, ColorUtils.hexToCanvas(0x0a0f1a, 1));
      ctx.fillStyle = trackGradient;
      ctx.beginPath();
      ctx.roundRect(-size / 2, trackY, size, trackHeight, trackHeight / 2);
      ctx.fill();
      
      // 履带边框
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x64748b, 0.6);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // 履带装甲板（6块）
      const plateCount = 6;
      for (let i = 0; i < plateCount; i++) {
        const px = -size / 2 + (size / plateCount) * i + 2;
        const plateWidth = size / plateCount - 3;
        
        // 装甲板渐变
        const plateGradient = ctx.createLinearGradient(px, trackY + 2, px, trackY + trackHeight - 4);
        plateGradient.addColorStop(0, ColorUtils.hexToCanvas(0x475569, 0.5));
        plateGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x334155, 0.6));
        plateGradient.addColorStop(1, ColorUtils.hexToCanvas(0x1e293b, 0.5));
        ctx.fillStyle = plateGradient;
        ctx.fillRect(px, trackY + 2, plateWidth, trackHeight - 4);
        
        // 装甲板边框
        ctx.strokeStyle = ColorUtils.hexToCanvas(0x1e293b, 0.8);
        ctx.lineWidth = 0.5;
        ctx.strokeRect(px, trackY + 2, plateWidth, trackHeight - 4);
      }
    }
    
    // 绘制负重轮（5个，带金属质感）
    for (let i = 0; i < wheelCount; i++) {
      const t = wheelCount === 1 ? 0.5 : i / (wheelCount - 1);
      const wx = -size / 2 + size * (0.12 + 0.76 * t);
      const wyTop = -size / 2 + trackHeight / 2;
      const wyBottom = size / 2 - trackHeight / 2;
      
      for (let side = 0; side < 2; side++) {
        const wy = side === 0 ? wyTop : wyBottom;
        
        // 滚轮阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(wx + 1, wy + 1, wheelRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // 滚轮外圈（金属灰）
        const wheelGradient = ctx.createRadialGradient(wx - wheelRadius * 0.3, wy - wheelRadius * 0.3, 0, wx, wy, wheelRadius);
        wheelGradient.addColorStop(0, ColorUtils.hexToCanvas(0x64748b, 1));
        wheelGradient.addColorStop(0.6, ColorUtils.hexToCanvas(0x475569, 1));
        wheelGradient.addColorStop(1, ColorUtils.hexToCanvas(0x334155, 1));
        ctx.fillStyle = wheelGradient;
        ctx.beginPath();
        ctx.arc(wx, wy, wheelRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // 滚轮边框
        ctx.strokeStyle = ColorUtils.hexToCanvas(0x1e293b, 1);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // 滚轮轴心
        const axleGradient = ctx.createRadialGradient(wx, wy, 0, wx, wy, wheelRadius * 0.4);
        axleGradient.addColorStop(0, ColorUtils.hexToCanvas(0x94a3b8, 1));
        axleGradient.addColorStop(1, ColorUtils.hexToCanvas(0x475569, 1));
        ctx.fillStyle = axleGradient;
        ctx.beginPath();
        ctx.arc(wx, wy, wheelRadius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // 轴心高光
        ctx.fillStyle = ColorUtils.hexToCanvas(0xcbd5e1, 0.7);
        ctx.beginPath();
        ctx.arc(wx - wheelRadius * 0.15, wy - wheelRadius * 0.15, wheelRadius * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  /**
   * 绘制主车体（重装甲多边形车体）
   */
  static drawMainHull(ctx, size) {
    const trackHeight = size * 0.22;
    const hullTop = -size / 2 + trackHeight * 0.7;
    const hullBottom = size / 2 - trackHeight * 0.7;
    const hullHeight = hullBottom - hullTop;
    const hullWidth = size - 14;
    
    // 主车体（倾斜前装甲设计）
    const hullGradient = ctx.createLinearGradient(-hullWidth / 2, hullTop, -hullWidth / 2, hullBottom);
    hullGradient.addColorStop(0, ColorUtils.hexToCanvas(0x1e293b, 1));
    hullGradient.addColorStop(0.2, ColorUtils.hexToCanvas(GameColors.ENEMY_TANK, 0.98));
    hullGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.ENEMY_TANK, 1));
    hullGradient.addColorStop(0.8, ColorUtils.hexToCanvas(GameColors.ENEMY_TANK, 0.98));
    hullGradient.addColorStop(1, ColorUtils.hexToCanvas(0x334155, 0.95));
    ctx.fillStyle = hullGradient;
    ctx.beginPath();
    ctx.roundRect(-hullWidth / 2, hullTop, hullWidth, hullHeight, size * 0.12);
    ctx.fill();
    
    // 车体主边框（加粗）
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_BODY_DARK, 1);
    ctx.lineWidth = 3.5;
    ctx.stroke();
    
    // 车体内边框（细节）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x475569, 0.6);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-hullWidth / 2 + 3, hullTop + 3, hullWidth - 6, hullHeight - 6, size * 0.1);
    ctx.stroke();
    
    // 顶部高光（金属光泽）
    const topHighlightGradient = ctx.createLinearGradient(-hullWidth / 2, hullTop, -hullWidth / 2, hullTop + hullHeight * 0.3);
    topHighlightGradient.addColorStop(0, ColorUtils.hexToCanvas(0x94a3b8, 0.35));
    topHighlightGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x64748b, 0.2));
    topHighlightGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = topHighlightGradient;
    ctx.beginPath();
    ctx.roundRect(-hullWidth / 2 + 5, hullTop + 4, hullWidth - 10, hullHeight * 0.3, size * 0.08);
    ctx.fill();
  }
  
  /**
   * 绘制装甲板（前后装甲+侧裙板）
   */
  static drawArmorPlates(ctx, size) {
    const hullWidth = size - 14;
    
    // 前装甲板（倾斜设计）
    const frontArmorGradient = ctx.createLinearGradient(-hullWidth / 2 + 8, -size * 0.12, -hullWidth / 2 + 8, size * 0.12);
    frontArmorGradient.addColorStop(0, ColorUtils.hexToCanvas(0x334155, 0.98));
    frontArmorGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.ENEMY_BODY_DARK, 1));
    frontArmorGradient.addColorStop(1, ColorUtils.hexToCanvas(0x334155, 0.98));
    ctx.fillStyle = frontArmorGradient;
    ctx.beginPath();
    ctx.roundRect(-hullWidth / 2 + 8, -size * 0.12, hullWidth - 16, size * 0.24, size * 0.05);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x1e293b, 1);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 装甲板细节纹理（3条加强筋）
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.35);
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const grooveY = -size * 0.08 + i * (size * 0.16 / 2);
      ctx.beginPath();
      ctx.moveTo(-hullWidth / 2 + 12, grooveY);
      ctx.lineTo(hullWidth / 2 - 12, grooveY);
      ctx.stroke();
    }
    
    // 侧裙板装饰（上下各2块）
    for (let side = 0; side < 2; side++) {
      const skirtY = side === 0 ? -size * 0.35 : size * 0.15;
      const skirtHeight = size * 0.15;
      
      ctx.fillStyle = ColorUtils.hexToCanvas(0x475569, 0.85);
      ctx.fillRect(-hullWidth / 2 + 5, skirtY, hullWidth - 10, skirtHeight);
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x334155, 0.9);
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-hullWidth / 2 + 5, skirtY, hullWidth - 10, skirtHeight);
    }
  }
  
  /**
   * 绘制排气口（左右各2个排气格栅）
   */
  static drawExhaustPorts(ctx, size) {
    const portWidth = size * 0.12;
    const portHeight = size * 0.18;
    const positions = [
      { x: -size * 0.42, y: size * 0.08 },
      { x: -size * 0.42, y: -size * 0.2 }
    ];
    
    positions.forEach(pos => {
      // 排气口外框
      ctx.fillStyle = ColorUtils.hexToCanvas(0x1e293b, 0.95);
      ctx.beginPath();
      ctx.roundRect(pos.x, pos.y, portWidth, portHeight, size * 0.02);
      ctx.fill();
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x0f172a, 1);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // 排气格栅（5条横线）
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x475569, 0.7);
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const grateY = pos.y + portHeight * (0.2 + i * 0.15);
        ctx.beginPath();
        ctx.moveTo(pos.x + portWidth * 0.15, grateY);
        ctx.lineTo(pos.x + portWidth * 0.85, grateY);
        ctx.stroke();
      }
      
      // 排气热辉光
      ctx.fillStyle = ColorUtils.hexToCanvas(0xff6b35, 0.15);
      ctx.fillRect(pos.x + 2, pos.y + 2, portWidth - 4, portHeight - 4);
    });
  }
  
  /**
   * 绘制铆钉（装甲铆接细节）
   */
  static drawRivets(ctx, size) {
    const rivetRadius = size * 0.018;
    const hullWidth = size - 14;
    
    // 车体周边铆钉（12个）
    const rivetPositions = [];
    
    // 上边铆钉（4个）
    for (let i = 0; i < 4; i++) {
      rivetPositions.push({
        x: -hullWidth / 2 + hullWidth * (0.2 + i * 0.2),
        y: -size * 0.35
      });
    }
    
    // 下边铆钉（4个）
    for (let i = 0; i < 4; i++) {
      rivetPositions.push({
        x: -hullWidth / 2 + hullWidth * (0.2 + i * 0.2),
        y: size * 0.35
      });
    }
    
    // 左右边铆钉（各2个）
    for (let i = 0; i < 2; i++) {
      rivetPositions.push({
        x: -hullWidth / 2 + 5,
        y: -size * 0.2 + i * size * 0.25
      });
      rivetPositions.push({
        x: hullWidth / 2 - 5,
        y: -size * 0.2 + i * size * 0.25
      });
    }
    
    rivetPositions.forEach(pos => {
      // 铆钉阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.arc(pos.x + 0.5, pos.y + 0.5, rivetRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // 铆钉主体（金属渐变）
      const rivetGradient = ctx.createRadialGradient(
        pos.x - rivetRadius * 0.3, pos.y - rivetRadius * 0.3, 0,
        pos.x, pos.y, rivetRadius
      );
      rivetGradient.addColorStop(0, ColorUtils.hexToCanvas(0x94a3b8, 1));
      rivetGradient.addColorStop(0.6, ColorUtils.hexToCanvas(0x64748b, 1));
      rivetGradient.addColorStop(1, ColorUtils.hexToCanvas(0x475569, 1));
      ctx.fillStyle = rivetGradient;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, rivetRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // 铆钉高光
      ctx.fillStyle = ColorUtils.hexToCanvas(0xe2e8f0, 0.8);
      ctx.beginPath();
      ctx.arc(pos.x - rivetRadius * 0.4, pos.y - rivetRadius * 0.4, rivetRadius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  /**
   * 绘制炮塔系统（重型炮塔+装甲环+细节）
   */
  static drawTurretSystem(ctx, size) {
    const turretRadius = size * 0.24;
    const turretY = -size * 0.06;
    
    // 炮塔基座阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.arc(1, turretY + 2, turretRadius * 1.15, 0, Math.PI * 2);
    ctx.fill();
    
    // 炮塔基座（六边形）
    ctx.save();
    ctx.translate(0, turretY);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = Math.cos(angle) * turretRadius * 1.05;
      const y = Math.sin(angle) * turretRadius * 1.05;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    
    const baseGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, turretRadius * 1.05);
    baseGradient.addColorStop(0, ColorUtils.hexToCanvas(0x475569, 1));
    baseGradient.addColorStop(0.7, ColorUtils.hexToCanvas(GameColors.ENEMY_BODY_DARK, 1));
    baseGradient.addColorStop(1, ColorUtils.hexToCanvas(0x1e293b, 1));
    ctx.fillStyle = baseGradient;
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x0f172a, 1);
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
    
    // 炮塔主体（圆形）
    const turretGradient = ctx.createRadialGradient(0, turretY, 0, 0, turretY, turretRadius);
    turretGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.ENEMY_TANK, 1));
    turretGradient.addColorStop(0.6, ColorUtils.hexToCanvas(GameColors.ENEMY_TANK, 0.95));
    turretGradient.addColorStop(1, ColorUtils.hexToCanvas(0x334155, 0.9));
    ctx.fillStyle = turretGradient;
    ctx.beginPath();
    ctx.arc(0, turretY, turretRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_BODY_DARK, 1);
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    // 炮塔装甲环（3圈同心圆）
    for (let i = 0; i < 3; i++) {
      const ringRadius = turretRadius * (0.55 + i * 0.12);
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x475569, 0.4 - i * 0.1);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, turretY, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // 炮塔顶部指挥舱
    const hatchWidth = size * 0.14;
    const hatchHeight = size * 0.32;
    const hatchGradient = ctx.createLinearGradient(-hatchWidth / 2, -size * 0.2, hatchWidth / 2, -size * 0.2);
    hatchGradient.addColorStop(0, ColorUtils.hexToCanvas(0x334155, 0.95));
    hatchGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.ENEMY_TANK, 1));
    hatchGradient.addColorStop(1, ColorUtils.hexToCanvas(0x334155, 0.95));
    ctx.fillStyle = hatchGradient;
    ctx.beginPath();
    ctx.roundRect(-hatchWidth / 2, -size * 0.22, hatchWidth, hatchHeight, size * 0.04);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x1e293b, 1);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 指挥舱观察口（3个）
    for (let i = 0; i < 3; i++) {
      const viewY = -size * 0.18 + i * (hatchHeight * 0.28);
      ctx.fillStyle = ColorUtils.hexToCanvas(0x0a0f1a, 0.9);
      ctx.fillRect(-hatchWidth * 0.35, viewY, hatchWidth * 0.7, size * 0.025);
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x64748b, 0.5);
      ctx.lineWidth = 0.5;
      ctx.strokeRect(-hatchWidth * 0.35, viewY, hatchWidth * 0.7, size * 0.025);
    }
  }
  
  /**
   * 绘制主炮（长炮管+炮口制退器）
   */
  static drawMainGun(ctx, size) {
    const barrelLength = size * 0.8;
    const barrelHeight = size * 0.1;
    
    // 炮管阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.roundRect(1, -barrelHeight / 2 + 2, barrelLength, barrelHeight, barrelHeight / 2);
    ctx.fill();
    
    // 炮管主体（渐变）
    const barrelGradient = ctx.createLinearGradient(0, -barrelHeight / 2, 0, barrelHeight / 2);
    barrelGradient.addColorStop(0, ColorUtils.hexToCanvas(0x334155, 1));
    barrelGradient.addColorStop(0.3, ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.95));
    barrelGradient.addColorStop(0.7, ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.95));
    barrelGradient.addColorStop(1, ColorUtils.hexToCanvas(0x334155, 1));
    ctx.fillStyle = barrelGradient;
    ctx.beginPath();
    ctx.roundRect(0, -barrelHeight / 2, barrelLength, barrelHeight, barrelHeight / 2);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_BODY_DARK, 1);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 炮管顶部高光
    const highlightGradient = ctx.createLinearGradient(0, -barrelHeight / 2, barrelLength * 0.4, -barrelHeight / 2);
    highlightGradient.addColorStop(0, ColorUtils.hexToCanvas(0x94a3b8, 0.5));
    highlightGradient.addColorStop(1, 'rgba(148, 163, 184, 0)');
    ctx.fillStyle = highlightGradient;
    ctx.fillRect(0, -barrelHeight / 2, barrelLength * 0.4, barrelHeight * 0.3);
    
    // 炮管加强环（3个）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x1e293b, 0.9);
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const ringX = barrelLength * (0.25 + i * 0.2);
      ctx.beginPath();
      ctx.moveTo(ringX, -barrelHeight * 0.5);
      ctx.lineTo(ringX, barrelHeight * 0.5);
      ctx.stroke();
    }
    
    // 炮管中段装甲罩
    const armorX = barrelLength * 0.45;
    const armorWidth = barrelLength * 0.35;
    const armorHeight = barrelHeight * 1.3;
    
    const armorGradient = ctx.createLinearGradient(armorX, -armorHeight / 2, armorX, armorHeight / 2);
    armorGradient.addColorStop(0, ColorUtils.hexToCanvas(0x475569, 0.95));
    armorGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.ENEMY_TANK, 0.95));
    armorGradient.addColorStop(1, ColorUtils.hexToCanvas(0x475569, 0.95));
    ctx.fillStyle = armorGradient;
    ctx.beginPath();
    ctx.roundRect(armorX, -armorHeight / 2, armorWidth, armorHeight, barrelHeight * 0.4);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x334155, 0.9);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // 炮口制退器（双筒设计）
    const muzzleX = barrelLength * 0.88;
    const muzzleWidth = barrelLength * 0.12;
    const muzzleHeight = barrelHeight * 1.6;
    
    ctx.fillStyle = ColorUtils.hexToCanvas(0x1e293b, 1);
    ctx.beginPath();
    ctx.roundRect(muzzleX, -muzzleHeight / 2, muzzleWidth, muzzleHeight, barrelHeight * 0.3);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x0f172a, 1);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 制退器通气孔（6个）
    ctx.fillStyle = ColorUtils.hexToCanvas(0x0a0f1a, 0.9);
    for (let i = 0; i < 6; i++) {
      const holeY = -muzzleHeight * 0.4 + i * (muzzleHeight * 0.15);
      ctx.fillRect(muzzleX + muzzleWidth * 0.15, holeY, muzzleWidth * 0.7, size * 0.015);
    }
    
    // 炮口光环（3层，红色威胁）
    const muzzleEndX = barrelLength;
    const muzzleRadius = barrelHeight * 0.5;
    
    // 最外层光晕
    const muzzleGlowGradient = ctx.createRadialGradient(muzzleEndX, 0, 0, muzzleEndX, 0, muzzleRadius * 1.5);
    muzzleGlowGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.4));
    muzzleGlowGradient.addColorStop(0.6, ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.2));
    muzzleGlowGradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = muzzleGlowGradient;
    ctx.beginPath();
    ctx.arc(muzzleEndX, 0, muzzleRadius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // 中层
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.95);
    ctx.shadowBlur = 6;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.7);
    ctx.beginPath();
    ctx.arc(muzzleEndX, 0, muzzleRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 内层高光
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.7);
    ctx.beginPath();
    ctx.arc(muzzleEndX, 0, muzzleRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * 绘制威胁标记（红色警示灯+识别标志）
   */
  static drawThreatMarkers(ctx, size) {
    // 主威胁标识（左前方）
    const mainIndicatorX = -size * 0.2;
    const mainIndicatorY = -size * 0.02;
    const mainRadius = size * 0.095;
    
    // 最外层脉冲光晕
    const pulseGradient = ctx.createRadialGradient(mainIndicatorX, mainIndicatorY, 0, mainIndicatorX, mainIndicatorY, mainRadius * 1.4);
    pulseGradient.addColorStop(0, ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.5));
    pulseGradient.addColorStop(0.6, ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.3));
    pulseGradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = pulseGradient;
    ctx.beginPath();
    ctx.arc(mainIndicatorX, mainIndicatorY, mainRadius * 1.4, 0, Math.PI * 2);
    ctx.fill();
    
    // 外层
    ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.4);
    ctx.beginPath();
    ctx.arc(mainIndicatorX, mainIndicatorY, mainRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 中层（径向渐变）
    const midGradient = ctx.createRadialGradient(mainIndicatorX, mainIndicatorY, 0, mainIndicatorX, mainIndicatorY, mainRadius * 0.8);
    midGradient.addColorStop(0, ColorUtils.hexToCanvas(0xfef2f2, 1));
    midGradient.addColorStop(0.4, ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 1));
    midGradient.addColorStop(1, ColorUtils.hexToCanvas(0xdc2626, 0.95));
    ctx.fillStyle = midGradient;
    ctx.shadowBlur = 8;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.8);
    ctx.beginPath();
    ctx.arc(mainIndicatorX, mainIndicatorY, mainRadius * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xfb7185, 1);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 内层高光
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.95);
    ctx.shadowBlur = 8;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xffffff, 0.6);
    ctx.beginPath();
    ctx.arc(mainIndicatorX, mainIndicatorY, mainRadius * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 炮塔顶部警示灯
    const topLightY = -size * 0.24;
    const topLightRadius = size * 0.038;
    
    const topLightGradient = ctx.createRadialGradient(0, topLightY, 0, 0, topLightY, topLightRadius);
    topLightGradient.addColorStop(0, ColorUtils.hexToCanvas(0xfef2f2, 0.95));
    topLightGradient.addColorStop(0.5, ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.95));
    topLightGradient.addColorStop(1, ColorUtils.hexToCanvas(0xdc2626, 0.9));
    ctx.fillStyle = topLightGradient;
    ctx.shadowBlur = 6;
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.7);
    ctx.beginPath();
    ctx.arc(0, topLightY, topLightRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 高光
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.9);
    ctx.beginPath();
    ctx.arc(-topLightRadius * 0.3, topLightY - topLightRadius * 0.3, topLightRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * 绘制观察窗（车体侧面观察窗）
   */
  static drawViewPorts(ctx, size) {
    const portWidth = size * 0.08;
    const portHeight = size * 0.04;
    
    // 左右各2个观察窗
    const positions = [
      { x: -size * 0.38, y: -size * 0.08 },
      { x: -size * 0.38, y: size * 0.05 },
      { x: size * 0.3, y: -size * 0.08 },
      { x: size * 0.3, y: size * 0.05 }
    ];
    
    positions.forEach(pos => {
      // 观察窗框
      ctx.fillStyle = ColorUtils.hexToCanvas(0x1e293b, 1);
      ctx.beginPath();
      ctx.roundRect(pos.x, pos.y, portWidth, portHeight, size * 0.01);
      ctx.fill();
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x64748b, 0.7);
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // 观察窗玻璃（青色反光）
      const glassGradient = ctx.createLinearGradient(pos.x, pos.y, pos.x + portWidth, pos.y);
      glassGradient.addColorStop(0, ColorUtils.hexToCanvas(0x0a0f1a, 0.9));
      glassGradient.addColorStop(0.3, ColorUtils.hexToCanvas(0x164e63, 0.7));
      glassGradient.addColorStop(0.7, ColorUtils.hexToCanvas(0x0e7490, 0.6));
      glassGradient.addColorStop(1, ColorUtils.hexToCanvas(0x0a0f1a, 0.9));
      ctx.fillStyle = glassGradient;
      ctx.fillRect(pos.x + 1, pos.y + 1, portWidth - 2, portHeight - 2);
      
      // 玻璃高光
      ctx.fillStyle = ColorUtils.hexToCanvas(0x06b6d4, 0.3);
      ctx.fillRect(pos.x + 2, pos.y + 1, portWidth * 0.4, portHeight * 0.4);
    });
  }
}

