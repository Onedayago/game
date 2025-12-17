/**
 * 游戏状态管理器
 * 负责管理游戏状态（开始、暂停、恢复、重启等）
 */

import { EconomyConfig } from '../config/EconomyConfig';
import { GameContext } from './GameContext';

export class GameStateManager {
  constructor(gameContext, managers) {
    this.gameContext = gameContext;
    this.managers = managers;
  }

  /**
   * 开始游戏
   */
  startGame() {
    // 重置游戏状态
    this.gameContext.reset();
    this.gameContext.gameStarted = true;

    // 重置金币管理器
    if (this.managers.goldManager) {
      this.managers.goldManager.init(EconomyConfig.INITIAL_GOLD);
      this.gameContext.gold = EconomyConfig.INITIAL_GOLD;
    }

    // 清空武器和敌人
    if (this.managers.weaponManager) {
      this.managers.weaponManager.weapons = [];
    }
    if (this.managers.enemyManager) {
      this.managers.enemyManager.reset();
    }

    // 重置障碍物管理器（重新生成障碍物）
    if (this.managers.obstacleManager) {
      this.managers.obstacleManager.reset();
    }
  }

  /**
   * 暂停游戏
   */
  pauseGame() {
    if (this.gameContext.gameStarted && !this.gameContext.gamePaused) {
      this.gameContext.gamePaused = true;
    }
  }

  /**
   * 恢复游戏
   */
  resumeGame() {
    if (this.gameContext.gameStarted && 
        this.gameContext.gamePaused && 
        !this.gameContext.gameOver) {
      this.gameContext.gamePaused = false;
    }
  }

  /**
   * 重新开始游戏
   */
  restartGame() {
    // 重置游戏状态
    this.gameContext.reset();

    // 重置敌人管理器
    if (this.managers.enemyManager) {
      this.managers.enemyManager.reset();
    }

    // 重置障碍物管理器（重新生成障碍物）
    if (this.managers.obstacleManager) {
      this.managers.obstacleManager.reset();
    }

    // 清空武器
    if (this.managers.weaponManager) {
      this.managers.weaponManager.weapons = [];
      this.managers.weaponManager.selectedWeapon = null;
    }

    // 重置金币管理器
    if (this.managers.goldManager) {
      this.managers.goldManager.init(EconomyConfig.INITIAL_GOLD);
      this.gameContext.gold = EconomyConfig.INITIAL_GOLD;
    }

    // 清空粒子
    if (this.managers.particleManager) {
      this.managers.particleManager.particles = [];
    }

    // 清空特效
    if (this.managers.effectManager) {
      this.managers.effectManager.clear();
    }
  }
}

