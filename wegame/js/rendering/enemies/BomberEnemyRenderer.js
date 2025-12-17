/**
 * 自爆敌人渲染器
 * 负责自爆敌人的视觉绘制（带离屏缓存优化）
 */

import { ColorUtils } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class BomberEnemyRenderer {
  // 离屏Canvas缓存
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _cacheSize = 0;
  static _initialized = false;
  
  /**
   * 初始化自爆敌人渲染缓存
   */
  static initCache(size) {
    if (this._initialized && this._cacheSize === size) {
      return;
    }
    
    const canvasSize = Math.ceil(size * 1.2);
    
    this._cachedCanvas = wx.createCanvas();
    this._cachedCanvas.width = canvasSize;
    this._cachedCanvas.height = canvasSize;
    
    this._cachedCtx = this._cachedCanvas.getContext('2d');
    this._cacheSize = size;
    
    polyfillRoundRect(this._cachedCtx);
    this.drawToCache(this._cachedCtx, size, canvasSize / 2, canvasSize / 2);
    
    this._initialized = true;
  }
  
  /**
   * 绘制到缓存Canvas（危险爆破装置）
   */
  static drawToCache(ctx, size, centerX, centerY) {
    ctx.save();
    ctx.translate(centerX, centerY);
    
    const baseColor = ColorUtils.hexToCanvas(0xff6622);
    const bodyColor = ColorUtils.hexToCanvas(0xff8844);
    const darkColor = ColorUtils.hexToCanvas(0xcc4422);
    const dangerColor = ColorUtils.hexToCanvas(0xff0000);
    const warningColor = ColorUtils.hexToCanvas(0xffff00);
    const explosiveColor = ColorUtils.hexToCanvas(0xff3300);
    
    // === 1. 危险脉冲光晕（多层闪烁基础）===
    this.drawDangerPulse(ctx, size, dangerColor);
    
    // === 2. 爆炸性阴影 ===
    this.drawExplosiveShadow(ctx, size);
    
    // === 3. 主装甲外壳（渐变）===
    this.drawExplosiveShell(ctx, size, baseColor, bodyColor, darkColor);
    
    // === 4. 警告条纹系统（黑黄相间）===
    this.drawWarningStripes(ctx, size, warningColor, darkColor);
    
    // === 5. 爆炸物核心容器 ===
    this.drawExplosiveCore(ctx, size, explosiveColor, dangerColor);
    
    // === 6. 四角危险警示灯 ===
    this.drawCornerWarningLights(ctx, size, dangerColor, warningColor);
    
    // === 7. 中心爆破标识（骷髅头或X）===
    this.drawExplosiveSymbol(ctx, size, dangerColor, warningColor);
    
    // === 8. 引爆装置细节 ===
    this.drawDetonatorDetails(ctx, size, dangerColor);
    
    // === 9. 危险文字标识 ===
    this.drawDangerLabels(ctx, size, dangerColor, warningColor);
    
    ctx.restore();
  }
  
  /**
   * 绘制危险脉冲光晕
   */
  static drawDangerPulse(ctx, size, dangerColor) {
    // 最外层红色警告脉冲
    const outerGradient = ctx.createRadialGradient(0, 0, size * 0.3, 0, 0, size * 0.7);
    outerGradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
    outerGradient.addColorStop(0.7, ColorUtils.hexToCanvas(0xff0000, 0.2));
    outerGradient.addColorStop(1, ColorUtils.hexToCanvas(0xff0000, 0.35));
    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.65, 0, Math.PI * 2);
    ctx.fill();
    
    // 中层橙色辉光
    const midGradient = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, size * 0.6);
    midGradient.addColorStop(0, 'rgba(255, 102, 34, 0)');
    midGradient.addColorStop(0.6, ColorUtils.hexToCanvas(0xff6622, 0.25));
    midGradient.addColorStop(1, ColorUtils.hexToCanvas(0xff4400, 0.3));
    ctx.fillStyle = midGradient;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.58, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * 绘制爆炸性阴影
   */
  static drawExplosiveShadow(ctx, size) {
    // 第一层阴影（强烈）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 4, -size / 2 + 5, size - 8, size - 5, size * 0.12);
    ctx.fill();
    
    // 第二层阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 5, -size / 2 + 6, size - 10, size - 7, size * 0.1);
    ctx.fill();
  }
  
  /**
   * 绘制爆炸物外壳
   */
  static drawExplosiveShell(ctx, size, baseColor, bodyColor, darkColor) {
    // 主体渐变（橙红色警告色）
    const shellGradient = ctx.createRadialGradient(-size * 0.2, -size * 0.2, 0, 0, 0, size * 0.6);
    shellGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffaa77, 0.95));
    shellGradient.addColorStop(0.4, ColorUtils.hexToCanvas(0xff8844, 0.95));
    shellGradient.addColorStop(0.7, ColorUtils.hexToCanvas(0xff6622, 0.9));
    shellGradient.addColorStop(1, ColorUtils.hexToCanvas(0xcc4422, 0.85));
    ctx.fillStyle = shellGradient;
    ctx.beginPath();
    ctx.roundRect(-size / 2, -size / 2, size, size, size * 0.12);
    ctx.fill();
    
    // 双层危险边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xaa2200, 1);
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xff0000, 0.8);
    ctx.lineWidth = 2;
    ctx.shadowBlur = 4;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xff0000, 0.6);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 内层装甲
    const innerGradient = ctx.createLinearGradient(-size / 2 + 5, -size / 2 + 5, -size / 2 + 5, size / 2 - 5);
    innerGradient.addColorStop(0, ColorUtils.hexToCanvas(0xdd5533, 0.9));
    innerGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0xcc4422, 0.95));
    innerGradient.addColorStop(1, ColorUtils.hexToCanvas(0xaa3311, 0.9));
    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 5, -size / 2 + 5, size - 10, size - 10, size * 0.1);
    ctx.fill();
  }
  
  /**
   * 绘制警告条纹（黑黄相间）
   */
  static drawWarningStripes(ctx, size, warningColor, darkColor) {
    const stripeCount = 6;
    const stripeAngle = Math.PI / 6; // 30度倾斜
    
    ctx.save();
    ctx.rotate(stripeAngle);
    
    for (let i = 0; i < stripeCount; i++) {
      const sx = -size * 0.6 + i * (size * 1.2 / stripeCount);
      
      // 黑色条纹
      ctx.fillStyle = ColorUtils.hexToCanvas(0x222200, 0.8);
      ctx.fillRect(sx, -size * 0.5, (size * 1.2 / stripeCount) * 0.5, size);
      
      // 黄色条纹
      ctx.fillStyle = ColorUtils.hexToCanvas(0xffff00, 0.9);
      ctx.fillRect(sx + (size * 1.2 / stripeCount) * 0.5, -size * 0.5, (size * 1.2 / stripeCount) * 0.5, size);
    }
    
    ctx.restore();
    
    // 条纹边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xff0000, 0.4);
    ctx.lineWidth = 1;
    ctx.strokeRect(-size / 2 + 7, -size / 2 + 7, size - 14, size - 14);
  }
  
  /**
   * 绘制爆炸物核心容器
   */
  static drawExplosiveCore(ctx, size, explosiveColor, dangerColor) {
    const coreSize = size * 0.5;
    
    // 核心容器外框
    ctx.fillStyle = ColorUtils.hexToCanvas(0x440000, 0.9);
    ctx.beginPath();
    ctx.roundRect(-coreSize / 2, -coreSize / 2, coreSize, coreSize, coreSize * 0.15);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xff0000, 0.8);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 核心能量（脉冲渐变）
    const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize * 0.4);
    coreGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.9));
    coreGradient.addColorStop(0.3, ColorUtils.hexToCanvas(0xffff00, 0.8));
    coreGradient.addColorStop(0.6, ColorUtils.hexToCanvas(0xff8800, 0.7));
    coreGradient.addColorStop(1, ColorUtils.hexToCanvas(0xff0000, 0.6));
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.roundRect(-coreSize / 2 + 3, -coreSize / 2 + 3, coreSize - 6, coreSize - 6, coreSize * 0.12);
    ctx.fill();
  }
  
  /**
   * 绘制四角危险警示灯
   */
  static drawCornerWarningLights(ctx, size, dangerColor, warningColor) {
    const lightRadius = size * 0.1;
    const corners = [
      { x: -size * 0.38, y: -size * 0.38 },
      { x: size * 0.38, y: -size * 0.38 },
      { x: -size * 0.38, y: size * 0.38 },
      { x: size * 0.38, y: size * 0.38 }
    ];
    
    for (const corner of corners) {
      // 外层脉冲光晕
      ctx.fillStyle = ColorUtils.hexToCanvas(0xff0000, 0.4);
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, lightRadius * 1.4, 0, Math.PI * 2);
      ctx.fill();
      
      // 中层辉光
      const lightGradient = ctx.createRadialGradient(corner.x, corner.y, 0, corner.x, corner.y, lightRadius);
      lightGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffff00, 1));
      lightGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0xff8800, 0.9));
      lightGradient.addColorStop(1, ColorUtils.hexToCanvas(0xff0000, 0.8));
      ctx.fillStyle = lightGradient;
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, lightRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // 警示灯边框（发光）
      ctx.strokeStyle = ColorUtils.hexToCanvas(0xff0000, 1);
      ctx.lineWidth = 2;
      ctx.shadowBlur = 6;
      ctx.shadowColor = ColorUtils.hexToCanvas(0xff0000, 0.8);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // 内层高光
      ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.9);
      ctx.shadowBlur = 4;
      ctx.shadowColor = ColorUtils.hexToCanvas(0xffffff, 0.6);
      ctx.beginPath();
      ctx.arc(corner.x - lightRadius * 0.3, corner.y - lightRadius * 0.3, lightRadius * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  
  /**
   * 绘制爆破标识（骷髅头）
   */
  static drawExplosiveSymbol(ctx, size, dangerColor, warningColor) {
    const symbolSize = size * 0.35;
    
    // 骷髅头轮廓（简化版）
    ctx.fillStyle = ColorUtils.hexToCanvas(0x220000, 0.9);
    ctx.beginPath();
    // 头部（圆形）
    ctx.arc(0, -symbolSize * 0.15, symbolSize * 0.45, 0, Math.PI * 2);
    ctx.fill();
    
    // 下颚（梯形）
    ctx.beginPath();
    ctx.moveTo(-symbolSize * 0.3, symbolSize * 0.15);
    ctx.lineTo(symbolSize * 0.3, symbolSize * 0.15);
    ctx.lineTo(symbolSize * 0.2, symbolSize * 0.45);
    ctx.lineTo(-symbolSize * 0.2, symbolSize * 0.45);
    ctx.closePath();
    ctx.fill();
    
    // 眼睛（两个）
    ctx.fillStyle = ColorUtils.hexToCanvas(0xff0000, 1);
    ctx.shadowBlur = 4;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xff0000, 0.8);
    
    // 左眼
    ctx.beginPath();
    ctx.arc(-symbolSize * 0.18, -symbolSize * 0.2, symbolSize * 0.12, 0, Math.PI * 2);
    ctx.fill();
    
    // 右眼
    ctx.beginPath();
    ctx.arc(symbolSize * 0.18, -symbolSize * 0.2, symbolSize * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 眼睛高光
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffff00, 0.9);
    ctx.beginPath();
    ctx.arc(-symbolSize * 0.2, -symbolSize * 0.22, symbolSize * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(symbolSize * 0.16, -symbolSize * 0.22, symbolSize * 0.05, 0, Math.PI * 2);
    ctx.fill();
    
    // 鼻子（三角形）
    ctx.fillStyle = ColorUtils.hexToCanvas(0xff0000, 0.9);
    ctx.beginPath();
    ctx.moveTo(0, -symbolSize * 0.05);
    ctx.lineTo(-symbolSize * 0.08, symbolSize * 0.08);
    ctx.lineTo(symbolSize * 0.08, symbolSize * 0.08);
    ctx.closePath();
    ctx.fill();
    
    // 牙齿（3个）
    ctx.fillStyle = ColorUtils.hexToCanvas(0xff0000, 0.8);
    for (let i = 0; i < 3; i++) {
      const tx = -symbolSize * 0.15 + i * symbolSize * 0.15;
      ctx.fillRect(tx, symbolSize * 0.2, symbolSize * 0.08, symbolSize * 0.15);
    }
  }
  
  /**
   * 绘制引爆装置细节
   */
  static drawDetonatorDetails(ctx, size, dangerColor) {
    // 上下两个引爆按钮
    const buttonPositions = [
      { x: 0, y: -size * 0.42 },
      { x: 0, y: size * 0.42 }
    ];
    
    for (const pos of buttonPositions) {
      // 按钮基座
      ctx.fillStyle = ColorUtils.hexToCanvas(0x330000, 0.9);
      ctx.beginPath();
      ctx.roundRect(pos.x - size * 0.08, pos.y - size * 0.05, size * 0.16, size * 0.1, size * 0.03);
      ctx.fill();
      
      // 按钮主体（红色）
      const buttonGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size * 0.06);
      buttonGradient.addColorStop(0, ColorUtils.hexToCanvas(0xff0000, 1));
      buttonGradient.addColorStop(0.7, ColorUtils.hexToCanvas(0xcc0000, 0.95));
      buttonGradient.addColorStop(1, ColorUtils.hexToCanvas(0x990000, 0.9));
      ctx.fillStyle = buttonGradient;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size * 0.045, 0, Math.PI * 2);
      ctx.fill();
      
      // 按钮高光
      ctx.fillStyle = ColorUtils.hexToCanvas(0xff8888, 0.8);
      ctx.beginPath();
      ctx.arc(pos.x - size * 0.015, pos.y - size * 0.015, size * 0.02, 0, Math.PI * 2);
      ctx.fill();
      
      // 按钮边框（发光）
      ctx.strokeStyle = ColorUtils.hexToCanvas(0xff0000, 1);
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 3;
      ctx.shadowColor = ColorUtils.hexToCanvas(0xff0000, 0.6);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size * 0.045, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }
  
  /**
   * 绘制危险文字标识
   */
  static drawDangerLabels(ctx, size, dangerColor, warningColor) {
    // 左右两侧的"DANGER"标识（简化为感叹号）
    const labelPositions = [
      { x: -size * 0.42, y: 0 },
      { x: size * 0.42, y: 0 }
    ];
    
    for (const pos of labelPositions) {
      // 感叹号背景
      ctx.fillStyle = ColorUtils.hexToCanvas(0xff0000, 0.8);
      ctx.fillRect(pos.x - size * 0.035, pos.y - size * 0.15, size * 0.07, size * 0.3);
      
      // 感叹号上部（竖线）
      ctx.fillStyle = ColorUtils.hexToCanvas(0xffff00, 1);
      ctx.fillRect(pos.x - size * 0.02, pos.y - size * 0.12, size * 0.04, size * 0.16);
      
      // 感叹号下部（点）
      ctx.fillStyle = ColorUtils.hexToCanvas(0xffff00, 1);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y + size * 0.08, size * 0.025, 0, Math.PI * 2);
      ctx.fill();
      
      // 边框
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x000000, 0.8);
      ctx.lineWidth = 1;
      ctx.strokeRect(pos.x - size * 0.035, pos.y - size * 0.15, size * 0.07, size * 0.3);
    }
  }
  
  /**
   * 渲染自爆敌人（固定朝向，向右）
   */
  static render(ctx, x, y, size) {
    if (!this._initialized || this._cacheSize !== size) {
      this.initCache(size);
    }
    
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
}

