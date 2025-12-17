/**
 * 日志工具类 - 提供延时打印功能，控制日志输出频率
 */
export class LogUtils {
  // 存储每个标签的最后打印时间
  static _lastLogTimes = {};
  
  /**
   * 延时打印日志（节流方式）
   * @param {string} tag - 日志标签，用于区分不同的日志源
   * @param {number} interval - 最小间隔时间（毫秒），默认1000ms
   * @param {Function} logFunc - 日志函数，如 console.log, console.warn, console.error
   * @param {...any} args - 要打印的参数
   * @returns {boolean} 是否实际打印了日志
   */
  static logThrottled(tag, interval = 1000, logFunc = console.log, ...args) {
    const now = Date.now();
    const lastTime = this._lastLogTimes[tag] || 0;
    
    if (now - lastTime >= interval) {
      this._lastLogTimes[tag] = now;
      logFunc(...args);
      return true;
    }
    
    return false;
  }
  
  /**
   * 延时打印 console.log（默认间隔1000ms）
   * @param {string} tag - 日志标签
   * @param {number} interval - 最小间隔时间（毫秒），默认1000ms
   * @param {...any} args - 要打印的参数
   */
  static log(tag, interval = 1000, ...args) {
    this.logThrottled(tag, interval, console.log, ...args);
  }
  
  /**
   * 延时打印 console.warn（默认间隔1000ms）
   * @param {string} tag - 日志标签
   * @param {number} interval - 最小间隔时间（毫秒），默认1000ms
   * @param {...any} args - 要打印的参数
   */
  static warn(tag, interval = 1000, ...args) {
    this.logThrottled(tag, interval, console.warn, ...args);
  }
  
  /**
   * 延时打印 console.error（默认间隔1000ms）
   * @param {string} tag - 日志标签
   * @param {number} interval - 最小间隔时间（毫秒），默认1000ms
   * @param {...any} args - 要打印的参数
   */
  static error(tag, interval = 1000, ...args) {
    this.logThrottled(tag, interval, console.error, ...args);
  }
  
  /**
   * 清除指定标签的计时器（重置该标签的打印时间）
   * @param {string} tag - 日志标签
   */
  static clearTimer(tag) {
    if (tag) {
      delete this._lastLogTimes[tag];
    } else {
      // 如果不传tag，清除所有计时器
      this._lastLogTimes = {};
    }
  }
  
  /**
   * 立即打印日志（不受节流限制）
   * @param {Function} logFunc - 日志函数
   * @param {...any} args - 要打印的参数
   */
  static logImmediate(logFunc = console.log, ...args) {
    logFunc(...args);
  }
}

