/**
 * 存储工具类
 * 用于管理本地存储（微信小游戏）
 */

export class StorageUtils {
  /**
   * 获取存储值
   * @param {string} key - 存储键
   * @param {*} defaultValue - 默认值
   * @returns {*} 存储的值或默认值
   */
  static get(key, defaultValue = null) {
    try {
      const value = wx.getStorageSync(key);
      return value !== '' ? value : defaultValue;
    } catch (e) {
      console.warn(`获取存储失败: ${key}`, e);
      return defaultValue;
    }
  }

  /**
   * 设置存储值
   * @param {string} key - 存储键
   * @param {*} value - 存储的值
   * @returns {boolean} 是否成功
   */
  static set(key, value) {
    try {
      wx.setStorageSync(key, value);
      return true;
    } catch (e) {
      console.warn(`设置存储失败: ${key}`, e);
      return false;
    }
  }

  /**
   * 删除存储值
   * @param {string} key - 存储键
   * @returns {boolean} 是否成功
   */
  static remove(key) {
    try {
      wx.removeStorageSync(key);
      return true;
    } catch (e) {
      console.warn(`删除存储失败: ${key}`, e);
      return false;
    }
  }

}

