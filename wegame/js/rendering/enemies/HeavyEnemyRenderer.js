/**
 * 重型敌人渲染器
 * 负责重型敌人的视觉绘制（带离屏缓存优化）
 */

import { ColorUtils } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class HeavyEnemyRenderer {
  // 离屏Canvas缓存
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _cacheSize = 0;
  static _initialized = false;
  
  /**
   * 初始化重型敌人渲染缓存
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
   * 绘制到缓存Canvas
   */
  static drawToCache(ctx, size, centerX, centerY) {
    ctx.save();
    ctx.translate(centerX, centerY);
    
    const armorColor = ColorUtils.hexToCanvas(0x8b0000);      // 深红装甲
    const bodyColor = ColorUtils.hexToCanvas(0xcc2222);        // 主体红
    const darkColor = ColorUtils.hexToCanvas(0x660000);        // 暗红
    const lightColor = ColorUtils.hexToCanvas(0xff5555);       // 亮红
    const accentColor = ColorUtils.hexToCanvas(0xff8888);      // 强调色
    const metalColor = ColorUtils.hexToCanvas(0x554444);       // 金属色
    const glowColor = ColorUtils.hexToCanvas(0xff0000);        // 红色辉光
    
    // === 1. 多层阴影（厚重感）===
    this.drawShadowLayers(ctx, size);
    
    // === 2. 主装甲车体（渐变增强金属质感）===
    this.drawMainBody(ctx, size, armorColor, bodyColor, darkColor);
    
    // === 3. 多层装甲板系统 ===
    this.drawArmorPlates(ctx, size, darkColor, armorColor);
    
    // === 4. 装甲铆钉和焊接细节 ===
    this.drawArmorDetails(ctx, size, metalColor);
    
    // === 5. 侧边装甲护板（立体感）===
    this.drawSideArmor(ctx, size, darkColor, armorColor, lightColor);
    
    // === 6. 前方反应装甲（最新设计）===
    this.drawReactiveArmor(ctx, size, armorColor, accentColor, glowColor);
    
    // === 7. 装甲条纹和警告标识 ===
    this.drawWarningStripes(ctx, size, darkColor, accentColor);
    
    // === 8. 中心威胁指示器（脉冲发光）===
    this.drawThreatIndicator(ctx, size, glowColor);
    
    // === 9. 顶部金属高光（增强质感）===
    this.drawMetalHighlight(ctx, size, lightColor);
    
    ctx.restore();
  }
  
  /**
   * 绘制多层阴影
   */
  static drawShadowLayers(ctx, size) {
    // 第一层主阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 5, -size / 2 + 6, size - 10, size - 6, size * 0.15);
    ctx.fill();
    
    // 第二层次阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 6, -size / 2 + 7, size - 12, size - 8, size * 0.12);
    ctx.fill();
    
    // 第三层柔和阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 7, -size / 2 + 8, size - 14, size - 10, size * 0.1);
    ctx.fill();
  }
  
  /**
   * 绘制主装甲车体（渐变）
   */
  static drawMainBody(ctx, size, armorColor, bodyColor, darkColor) {
    // 使用径向渐变增强立体感
    const bodyGradient = ctx.createRadialGradient(0, -size * 0.1, 0, 0, 0, size * 0.6);
    bodyGradient.addColorStop(0, ColorUtils.hexToCanvas(0xdd3333, 0.95));
    bodyGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0xcc2222, 0.95));
    bodyGradient.addColorStop(0.8, ColorUtils.hexToCanvas(0xaa1111, 0.9));
    bodyGradient.addColorStop(1, ColorUtils.hexToCanvas(0x880000, 0.85));
    
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.roundRect(-size / 2, -size / 2, size, size, size * 0.15);
    ctx.fill();
    
    // 厚重边框（双层）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x550000, 1);
    ctx.lineWidth = 3.5;
    ctx.stroke();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x330000, 0.8);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  /**
   * 绘制多层装甲板
   */
  static drawArmorPlates(ctx, size, darkColor, armorColor) {
    // 外层装甲板
    const outerGradient = ctx.createLinearGradient(-size / 2 + 4, -size / 2 + 4, -size / 2 + 4, size / 2 - 4);
    outerGradient.addColorStop(0, ColorUtils.hexToCanvas(0x990000, 0.9));
    outerGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0x770000, 0.95));
    outerGradient.addColorStop(1, ColorUtils.hexToCanvas(0x660000, 0.9));
    
    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 4, -size / 2 + 4, size - 8, size - 8, size * 0.12);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x440000, 0.9);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 中层装甲（六边形设计）
    const midSize = size * 0.75;
    ctx.fillStyle = ColorUtils.hexToCanvas(0x660000, 0.95);
    ctx.beginPath();
    ctx.roundRect(-midSize / 2, -midSize / 2, midSize, midSize, size * 0.1);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xff4444, 0.4);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // 内层装甲核心
    const innerSize = size * 0.55;
    ctx.fillStyle = ColorUtils.hexToCanvas(0x550000, 0.9);
    ctx.beginPath();
    ctx.roundRect(-innerSize / 2, -innerSize / 2, innerSize, innerSize, size * 0.08);
    ctx.fill();
  }
  
  /**
   * 绘制装甲细节（铆钉和焊接痕迹）
   */
  static drawArmorDetails(ctx, size, metalColor) {
    // 四角铆钉组
    const cornerPositions = [
      [-size * 0.35, -size * 0.35],
      [size * 0.35, -size * 0.35],
      [-size * 0.35, size * 0.35],
      [size * 0.35, size * 0.35]
    ];
    
    for (const [cx, cy] of cornerPositions) {
      // 铆钉组（3个一组）
      for (let i = 0; i < 3; i++) {
        const offset = (i - 1) * size * 0.08;
        const rx = cx + (cx > 0 ? -offset : offset);
        const ry = cy;
        
        // 铆钉阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(rx + 1.5, ry + 1.5, size * 0.045, 0, Math.PI * 2);
        ctx.fill();
        
        // 铆钉主体（渐变）
        const rivetGradient = ctx.createRadialGradient(rx - 1, ry - 1, 0, rx, ry, size * 0.04);
        rivetGradient.addColorStop(0, ColorUtils.hexToCanvas(0x887777, 1));
        rivetGradient.addColorStop(0.7, ColorUtils.hexToCanvas(0x554444, 0.95));
        rivetGradient.addColorStop(1, ColorUtils.hexToCanvas(0x332222, 0.9));
        ctx.fillStyle = rivetGradient;
        ctx.beginPath();
        ctx.arc(rx, ry, size * 0.04, 0, Math.PI * 2);
        ctx.fill();
        
        // 铆钉高光
        ctx.fillStyle = ColorUtils.hexToCanvas(0xaa9999, 0.8);
        ctx.beginPath();
        ctx.arc(rx - size * 0.015, ry - size * 0.015, size * 0.02, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // 中央铆钉线（水平）
    for (let i = 0; i < 4; i++) {
      const rx = -size * 0.3 + i * size * 0.2;
      const ry = 0;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.arc(rx + 1, ry + 1, size * 0.035, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = ColorUtils.hexToCanvas(0x665555, 0.9);
      ctx.beginPath();
      ctx.arc(rx, ry, size * 0.035, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = ColorUtils.hexToCanvas(0x998888, 0.6);
      ctx.beginPath();
      ctx.arc(rx - size * 0.01, ry - size * 0.01, size * 0.015, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  /**
   * 绘制侧边装甲护板
   */
  static drawSideArmor(ctx, size, darkColor, armorColor, lightColor) {
    // 左侧装甲板
    const leftGradient = ctx.createLinearGradient(-size / 2 + 5, -size * 0.3, -size / 2 + 10, -size * 0.3);
    leftGradient.addColorStop(0, ColorUtils.hexToCanvas(0x550000, 0.95));
    leftGradient.addColorStop(1, ColorUtils.hexToCanvas(0x770000, 0.9));
    ctx.fillStyle = leftGradient;
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 5, -size * 0.35, size * 0.15, size * 0.7, size * 0.05);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xff4444, 0.4);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // 右侧装甲板（对称）
    const rightGradient = ctx.createLinearGradient(size / 2 - 10, -size * 0.3, size / 2 - 5, -size * 0.3);
    rightGradient.addColorStop(0, ColorUtils.hexToCanvas(0x770000, 0.9));
    rightGradient.addColorStop(1, ColorUtils.hexToCanvas(0x550000, 0.95));
    ctx.fillStyle = rightGradient;
    ctx.beginPath();
    ctx.roundRect(size / 2 - 5 - size * 0.15, -size * 0.35, size * 0.15, size * 0.7, size * 0.05);
    ctx.fill();
    
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xff4444, 0.4);
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  
  /**
   * 绘制前方反应装甲
   */
  static drawReactiveArmor(ctx, size, armorColor, accentColor, glowColor) {
    // 主反应装甲块
    const reactiveGradient = ctx.createLinearGradient(-size * 0.25, -size * 0.15, -size * 0.25, size * 0.15);
    reactiveGradient.addColorStop(0, ColorUtils.hexToCanvas(0x8b0000, 0.95));
    reactiveGradient.addColorStop(0.5, ColorUtils.hexToCanvas(0xaa0000, 0.9));
    reactiveGradient.addColorStop(1, ColorUtils.hexToCanvas(0x770000, 0.9));
    
    ctx.fillStyle = reactiveGradient;
    ctx.beginPath();
    ctx.roundRect(-size * 0.3, -size * 0.15, size * 0.6, size * 0.3, size * 0.06);
    ctx.fill();
    
    // 装甲边框（发光效果）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xff6666, 0.8);
    ctx.lineWidth = 2;
    ctx.shadowBlur = 4;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xff0000, 0.5);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 装甲内部细节线
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xff8888, 0.5);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-size * 0.28, -size * 0.13, size * 0.56, size * 0.26, size * 0.05);
    ctx.stroke();
    
    // 三段式装甲板纹理
    for (let i = 0; i < 3; i++) {
      const px = -size * 0.25 + i * size * 0.18;
      ctx.fillStyle = ColorUtils.hexToCanvas(i % 2 === 0 ? 0x660000 : 0x550000, 0.8);
      ctx.fillRect(px, -size * 0.12, size * 0.15, size * 0.24);
      
      ctx.strokeStyle = ColorUtils.hexToCanvas(0x880000, 0.6);
      ctx.lineWidth = 0.5;
      ctx.strokeRect(px, -size * 0.12, size * 0.15, size * 0.24);
    }
  }
  
  /**
   * 绘制警告条纹
   */
  static drawWarningStripes(ctx, size, darkColor, accentColor) {
    // 顶部警告条纹
    for (let i = 0; i < 3; i++) {
      const sy = -size * 0.38 + i * size * 0.08;
      ctx.fillStyle = ColorUtils.hexToCanvas(i % 2 === 0 ? 0x660000 : 0x440000, 0.9);
      ctx.fillRect(-size * 0.4, sy, size * 0.8, size * 0.03);
      
      ctx.fillStyle = ColorUtils.hexToCanvas(0xff4444, 0.4);
      ctx.fillRect(-size * 0.4, sy, size * 0.8, size * 0.015);
    }
    
    // 底部警告条纹（对称）
    for (let i = 0; i < 3; i++) {
      const sy = size * 0.22 + i * size * 0.08;
      ctx.fillStyle = ColorUtils.hexToCanvas(i % 2 === 0 ? 0x660000 : 0x440000, 0.9);
      ctx.fillRect(-size * 0.4, sy, size * 0.8, size * 0.03);
      
      ctx.fillStyle = ColorUtils.hexToCanvas(0xff4444, 0.4);
      ctx.fillRect(-size * 0.4, sy, size * 0.8, size * 0.015);
    }
  }
  
  /**
   * 绘制威胁指示器（脉冲发光）
   */
  static drawThreatIndicator(ctx, size, glowColor) {
    const indicatorRadius = size * 0.16;
    
    // 最外层脉冲光晕
    ctx.fillStyle = ColorUtils.hexToCanvas(0xff0000, 0.35);
    ctx.beginPath();
    ctx.arc(0, 0, indicatorRadius * 1.3, 0, Math.PI * 2);
    ctx.fill();
    
    // 外层辉光
    const outerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, indicatorRadius * 1.1);
    outerGradient.addColorStop(0, ColorUtils.hexToCanvas(0xff6666, 0.6));
    outerGradient.addColorStop(0.7, ColorUtils.hexToCanvas(0xff0000, 0.5));
    outerGradient.addColorStop(1, ColorUtils.hexToCanvas(0xff0000, 0.3));
    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.arc(0, 0, indicatorRadius * 1.1, 0, Math.PI * 2);
    ctx.fill();
    
    // 主指示器（径向渐变）
    const mainGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, indicatorRadius);
    mainGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 1));
    mainGradient.addColorStop(0.3, ColorUtils.hexToCanvas(0xffcccc, 1));
    mainGradient.addColorStop(0.6, ColorUtils.hexToCanvas(0xff4444, 0.95));
    mainGradient.addColorStop(1, ColorUtils.hexToCanvas(0xcc0000, 0.9));
    ctx.fillStyle = mainGradient;
    ctx.beginPath();
    ctx.arc(0, 0, indicatorRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 指示器边框（发光）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xff8888, 1);
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xff0000, 0.8);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 内层高亮核心
    ctx.fillStyle = ColorUtils.hexToCanvas(0xffffff, 0.9);
    ctx.shadowBlur = 6;
    ctx.shadowColor = ColorUtils.hexToCanvas(0xffffff, 0.6);
    ctx.beginPath();
    ctx.arc(0, 0, indicatorRadius * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 危险标识线（十字）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0x440000, 0.8);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-indicatorRadius * 0.6, 0);
    ctx.lineTo(indicatorRadius * 0.6, 0);
    ctx.moveTo(0, -indicatorRadius * 0.6);
    ctx.lineTo(0, indicatorRadius * 0.6);
    ctx.stroke();
  }
  
  /**
   * 绘制金属高光
   */
  static drawMetalHighlight(ctx, size, lightColor) {
    // 顶部主高光（增强金属感）
    const topGradient = ctx.createLinearGradient(-size / 2 + 8, -size / 2 + 8, -size / 2 + 8, -size / 2 + 8 + size * 0.3);
    topGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.4));
    topGradient.addColorStop(0.3, ColorUtils.hexToCanvas(0xff8888, 0.3));
    topGradient.addColorStop(0.7, ColorUtils.hexToCanvas(0xff4444, 0.2));
    topGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = topGradient;
    ctx.beginPath();
    ctx.roundRect(-size / 2 + 8, -size / 2 + 8, size - 16, size * 0.3, size * 0.08);
    ctx.fill();
    
    // 左侧边缘高光
    const leftGradient = ctx.createLinearGradient(-size / 2 + 8, -size * 0.25, -size / 2 + 8 + size * 0.2, -size * 0.25);
    leftGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffffff, 0.3));
    leftGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = leftGradient;
    ctx.fillRect(-size / 2 + 8, -size * 0.3, size * 0.15, size * 0.6);
  }
  
  /**
   * 渲染重型敌人（固定朝向，向右）
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

