/**
 * 数学工具类
 */

export class MathUtils {
  /**
   * 计算两点之间的距离
   */
  static distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * 计算两点之间的角度（弧度）
   */
  static angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  }
  
  /**
   * 将角度转换为弧度
   */
  static degToRad(degrees) {
    return degrees * Math.PI / 180;
  }
  
  /**
   * 将弧度转换为角度
   */
  static radToDeg(radians) {
    return radians * 180 / Math.PI;
  }
  
  /**
   * 限制值在范围内
   */
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  
  /**
   * 线性插值
   */
  static lerp(start, end, t) {
    return start + (end - start) * t;
  }
}

