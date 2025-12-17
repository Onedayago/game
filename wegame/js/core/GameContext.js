/**
 * 游戏上下文
 * 存储全局游戏状态和管理器引用
 */

export class GameContext {
  static instance = null;
  
  // 游戏状态
  gameStarted = false;
  gamePaused = false;
  gameOver = false;
  
  // 当前波次
  currentWave = 1;
  
  // 金币（降低初始金币，增加策略性）
  gold = 500;
  
  // 管理器引用
  particleManager = null;
  weaponManager = null;
  weaponContainerUI = null;
  obstacleManager = null; // 障碍物管理器引用
  audioManager = null; // 音频管理器引用
  
  // 敌人和武器数组
  enemies = [];
  weapons = [];
  
  // 战场偏移（用于拖拽）
  // worldOffsetX: 相对于初始位置的偏移（初始为 0）
  // 初始位置：worldNode 在 -DESIGN_WIDTH/2
  // 最大偏移：DESIGN_WIDTH - BATTLE_WIDTH
  worldOffsetX = 0;
  worldOffsetY = 0;
  
  static getInstance() {
    if (!GameContext.instance) {
      GameContext.instance = new GameContext();
    }
    return GameContext.instance;
  }
  
  /**
   * 重置游戏状态
   */
  reset() {
    this.gameStarted = false;
    this.gamePaused = false;
    this.gameOver = false;
    this.currentWave = 1;
    this.gold = 500;
    this.enemies = [];
    this.weapons = [];
    this.worldOffsetX = 0;
    this.worldOffsetY = 0;
  }
  
  /**
   * 添加敌人
   */
  addEnemy(enemy) {
    this.enemies.push(enemy);
  }
  
  /**
   * 移除敌人（优化：使用快速删除）
   */
  removeEnemy(enemy) {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      // 快速删除：将最后一个元素移到当前位置
      const last = this.enemies.length - 1;
      if (index !== last) {
        this.enemies[index] = this.enemies[last];
      }
      this.enemies.pop();
    }
  }
  
  /**
   * 添加武器
   */
  addWeapon(weapon) {
    this.weapons.push(weapon);
  }
  
  /**
   * 移除武器（优化：使用快速删除）
   */
  removeWeapon(weapon) {
    const index = this.weapons.indexOf(weapon);
    if (index > -1) {
      // 快速删除：将最后一个元素移到当前位置
      const last = this.weapons.length - 1;
      if (index !== last) {
        this.weapons[index] = this.weapons[last];
      }
      this.weapons.pop();
    }
  }
}

