/**
 * UI渲染器
 * 统一管理所有UI组件的渲染和缓存
 */

import { PauseButton } from '../components/PauseButton';
import { PauseScreen } from '../screens/PauseScreen';
import { GameOverScreen } from '../screens/GameOverScreen';
import { WaveInfo } from '../components/WaveInfo';
import { WaveNotification } from '../components/WaveNotification';

export class UIRenderer {
  /**
   * 初始化所有UI缓存
   */
  static initCaches() {
    PauseButton.initCache();
    PauseScreen.initCache();
    GameOverScreen.initCache();
    WaveInfo.initCache();
  }
  
  /**
   * 渲染暂停按钮
   */
  static renderPauseButton(ctx) {
    PauseButton.render(ctx);
  }
  
  /**
   * 渲染暂停界面
   */
  static renderPauseScreen(ctx) {
    PauseScreen.render(ctx);
  }
  
  /**
   * 渲染游戏结束界面
   */
  static renderGameOverScreen(ctx) {
    GameOverScreen.render(ctx);
  }
  
  /**
   * 渲染波次信息
   */
  static renderWaveInfo(ctx, enemyManager) {
    const waveLevel = enemyManager.getWaveLevel();
    const progress = enemyManager.getWaveProgress();
    WaveInfo.render(ctx, waveLevel, progress);
  }
  
  /**
   * 渲染波次提示
   */
  static renderWaveNotification(ctx, enemyManager) {
    const waveLevel = enemyManager.getWaveLevel();
    const elapsed = Date.now() - enemyManager.waveStartTime;
    WaveNotification.render(ctx, waveLevel, elapsed);
  }
  
  /**
   * 获取暂停按钮边界框
   */
  static getPauseButtonBounds() {
    return PauseButton.getBounds();
  }
  
  /**
   * 获取继续按钮边界框
   */
  static getResumeButtonBounds() {
    return PauseScreen.getResumeButtonBounds();
  }
  
  /**
   * 获取重新开始按钮边界框
   */
  static getRestartButtonBounds() {
    return GameOverScreen.getRestartButtonBounds();
  }
}

