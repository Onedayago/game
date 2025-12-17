/**
 * 游戏颜色配置
 */

export class GameColors {
  // 武器颜色
  static ROCKET_BASE = 0x4a148c;
  static ROCKET_TOWER = 0x9d00ff;
  static ROCKET_DETAIL = 0xff00ff;
  static ROCKET_BULLET = 0xff00ff;
  
  static LASER_BASE = 0x004d00;
  static LASER_TOWER = 0x00ff41;
  static LASER_BEAM = 0x00ff41;
  static LASER_DETAIL = 0x00ff41;
  
  static CANNON_BASE = 0x8b4513;
  static CANNON_TOWER = 0xff8800;
  static CANNON_BULLET = 0xff8800;
  static CANNON_DETAIL = 0xffaa00;
  
  static SNIPER_BASE = 0x1a1a2e;
  static SNIPER_TOWER = 0x00d4ff;
  static SNIPER_BULLET = 0x00d4ff;
  static SNIPER_DETAIL = 0x00ffff;
  
  // 友军颜色（用于武器）
  static ALLY_BODY = 0x334155;
  static ALLY_DETAIL = 0x0ea5e9;
  
  // 敌人颜色
  static ENEMY_TANK = 0xff4444;
  static ENEMY_DETAIL = 0xff8888;
  static ENEMY_BULLET = 0xff6666;
  static ENEMY_BODY = 0xff4444;
  static ENEMY_BODY_DARK = 0xcc2222;
  
  // 血量条颜色
  static DANGER = 0xff0000;
  
  // UI 颜色
  static UI_BORDER = 0x00ffff;
  static UI_BACKGROUND = 0x2a3a4a;
  static TEXT_MAIN = 0xffffff;
  static TEXT_LIGHT = 0xcccccc;
  
  // 背景颜色
  static BACKGROUND = 0x1a1a2e;
  static GRID_LINE = 0x16213e;
}

/**
 * 颜色工具类
 * 微信小游戏性能优化：缓存颜色字符串，减少字符串创建
 */
export class ColorUtils {
  // 颜色缓存
  static colorCache = new Map();
  static rgbaCache = new Map();
  
  /**
   * 将十六进制颜色转换为 RGB
   */
  static hexToRgb(hex) {
    const r = (hex >> 16) & 255;
    const g = (hex >> 8) & 255;
    const b = hex & 255;
    return { r, g, b };
  }
  
  /**
   * 将十六进制颜色转换为 CSS 颜色字符串（带缓存）
   */
  static hexToCss(hex) {
    if (this.colorCache.has(hex)) {
      return this.colorCache.get(hex);
    }
    
    const { r, g, b } = this.hexToRgb(hex);
    const css = `rgb(${r}, ${g}, ${b})`;
    this.colorCache.set(hex, css);
    return css;
  }
  
  /**
   * 将十六进制颜色转换为 Canvas 颜色字符串（带透明度，带缓存）
   */
  static hexToCanvas(hex, alpha = 1) {
    // 使用组合键进行缓存
    const cacheKey = `${hex}_${alpha}`;
    if (this.rgbaCache.has(cacheKey)) {
      return this.rgbaCache.get(cacheKey);
    }
    
    const { r, g, b } = this.hexToRgb(hex);
    const rgba = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    this.rgbaCache.set(cacheKey, rgba);
    return rgba;
  }
  
  /**
   * 使颜色变暗
   * @param {number} hex - 十六进制颜色值
   * @param {number} factor - 变暗因子（0-1，0 不变，1 完全变黑）
   * @returns {number} 变暗后的十六进制颜色值
   */
  static darkenColor(hex, factor) {
    const { r, g, b } = this.hexToRgb(hex);
    const newR = Math.max(0, Math.floor(r * (1 - factor)));
    const newG = Math.max(0, Math.floor(g * (1 - factor)));
    const newB = Math.max(0, Math.floor(b * (1 - factor)));
    return (newR << 16) | (newG << 8) | newB;
  }
  
  /**
   * 使颜色变亮
   * @param {number} hex - 十六进制颜色值
   * @param {number} factor - 变亮因子（0-1，0 不变，1 完全变白）
   * @returns {number} 变亮后的十六进制颜色值
   */
  static lightenColor(hex, factor) {
    const { r, g, b } = this.hexToRgb(hex);
    const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
    const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
    const newB = Math.min(255, Math.floor(b + (255 - b) * factor));
    return (newR << 16) | (newG << 8) | newB;
  }
  
  /**
   * 清理颜色缓存（在内存紧张时调用）
   */
  static clearCache() {
    // 限制缓存大小，防止内存泄漏
    if (this.colorCache.size > 100) {
      this.colorCache.clear();
    }
    if (this.rgbaCache.size > 500) {
      this.rgbaCache.clear();
    }
  }
}

