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

