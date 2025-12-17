/**
 * 引导管理器
 * 管理游戏引导状态，使用本地存储记录是否已显示过引导
 */

export class TutorialManager {
  static STORAGE_KEY = 'tower_game_tutorial_completed';
  
  /**
   * 检查是否已显示过引导
   * @returns {boolean}
   */
  static hasCompletedTutorial() {
    try {
      const value = wx.getStorageSync(TutorialManager.STORAGE_KEY);
      return value === true;
    } catch (e) {
      console.error('读取引导状态失败:', e);
      return false;
    }
  }
  
  /**
   * 标记引导已完成
   */
  static markTutorialCompleted() {
    try {
      wx.setStorageSync(TutorialManager.STORAGE_KEY, true);
    } catch (e) {
      console.error('保存引导状态失败:', e);
    }
  }
  
  /**
   * 重置引导状态（用于测试）
   */
  static resetTutorial() {
    try {
      wx.removeStorageSync(TutorialManager.STORAGE_KEY);
      console.log('引导状态已重置');
    } catch (e) {
      console.error('重置引导状态失败:', e);
    }
  }
}

