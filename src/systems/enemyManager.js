/**
 * 敌人管理器
 * 负责生成、更新和管理所有敌人
 * 
 * 功能：
 * - 定时生成敌人坦克
 * - 管理敌人生命周期（更新、死亡、完成）
 * - 实现波次系统，随时间增加难度
 * - 处理敌人击杀奖励
 * - 避免在同一位置重复生成敌人
 * 
 * 波次系统：
 * - 每15秒一波，波次越高敌人越强
 * - 生成间隔随波次递减（但有最小值限制）
 * - 敌人血量随波次增加
 */

import { ENEMY_SPAWN_INTERVAL, ENEMY_KILL_REWARD, BATTLE_ROWS } from '../constants';
import { EnemyTank } from '../entities/enemies/enemyTank';

/**
 * 敌人管理器类
 */
export class EnemyManager {
  /**
   * 构造函数
   * @param {Application} app - PixiJS应用实例
   * @param {WeaponContainer} weaponContainer - 武器容器，用于敌人寻路和攻击
   * @param {GoldManager} goldManager - 金币管理器，用于奖励结算
   */
  constructor(app, weaponContainer, goldManager) {
    this.app = app;
    this.weaponContainer = weaponContainer;  // 武器容器引用
    this.goldManager = goldManager;          // 金币管理器引用
    
    // 敌人管理
    this.enemies = [];                       // 所有活跃的敌人
    
    // 生成计时
    this.timeSinceLastSpawn = 0;             // 距上次生成的时间
    this.baseSpawnInterval = ENEMY_SPAWN_INTERVAL; // 基础生成间隔
    this.spawnInterval = this.baseSpawnInterval;   // 当前生成间隔
    this.minSpawnInterval = 800;             // 最小生成间隔（毫秒）
    
    // 波次系统
    this.waveDuration = 15000;               // 每波持续时间（15秒）
    this.waveTimer = 0;                      // 当前波次计时器
    this.waveLevel = 1;                      // 当前波次等级
    this.hpBonusPerWave = 2;                 // 每波增加的血量
    this.hpBonus = 0;                        // 当前波次的血量加成
  }

  /**
   * 生成一个敌人
   * 在左侧边界随机行位置生成敌人坦克
   * 会尝试避开已有敌人的位置
   */
  spawnEnemy() {
    const rows = BATTLE_ROWS;
    const minRow = 0;
    const maxRow = rows - 1;
    const playableRows = Math.max(0, rows);

    // 如果没有可用行，则不生成
    if (playableRows <= 0) return;
    
    // 尝试找到一个未被占用的行
    let row = null;
    const maxTries = 8;  // 最多尝试8次
    
    for (let i = 0; i < maxTries; i += 1) {
      // 随机选择一行
      const candidate = minRow + Math.floor(Math.random() * playableRows);
      
      // 检查该行的起始位置是否已有敌人
      const occupied = this.enemies.some(
        (e) => !e._dead && !e._finished && e.gridCol === 0 && e.gridRow === candidate,
      );
      
      // 如果未被占用，使用该行
      if (!occupied) {
        row = candidate;
        break;
      }
    }
    
    // 如果所有尝试都失败，则不生成
    if (row == null) {
      return;
    }
    
    // 在左侧边界（第0列）生成敌人
    const col = 0;

    // 创建敌人坦克，带有当前波次的血量加成
    const enemy = new EnemyTank(this.app, col, row, this.hpBonus);
    this.enemies.push(enemy);
  }

  /**
   * 更新所有敌人
   * 处理波次系统、敌人生成、敌人更新和清理
   * 
   * @param {number} delta - 帧增量（通常为1）
   * @param {number} deltaMS - 距上一帧的时间（毫秒）
   */
  update(delta, deltaMS) {
    // === 更新波次系统 ===
    this.waveTimer += deltaMS;
    
    // 当一波结束时，进入下一波
    if (this.waveTimer >= this.waveDuration) {
      this.waveTimer -= this.waveDuration;
      this.waveLevel += 1;
      
      // 缩短生成间隔（每波乘以0.9，但不低于最小值）
      this.spawnInterval = Math.max(
        this.minSpawnInterval,
        this.baseSpawnInterval * 0.9 ** (this.waveLevel - 1),
      );
      
      // 增加敌人血量
      this.hpBonus = (this.waveLevel - 1) * this.hpBonusPerWave;
    }

    // 更新金币管理器的波次信息显示
    if (this.goldManager && typeof this.goldManager.setWaveInfo === 'function') {
      const timeLeft = Math.max(0, this.waveDuration - this.waveTimer);
      this.goldManager.setWaveInfo(this.waveLevel, timeLeft, this.waveDuration);
    }

    // === 敌人生成 ===
    this.timeSinceLastSpawn += deltaMS;
    if (this.timeSinceLastSpawn >= this.spawnInterval) {
      this.spawnEnemy();
      this.timeSinceLastSpawn = 0;
    }

    // === 更新所有敌人 ===
    this.enemies.forEach((enemy) =>
      enemy.update(delta, deltaMS, this.weaponContainer, this.enemies),
    );

    // === 清理死亡和完成的敌人 ===
    this.enemies = this.enemies.filter((enemy) => {
      // 如果敌人死亡或到达终点
      if (enemy._finished || enemy._dead) {
        // 击杀敌人时给予金币奖励
        if (enemy._dead && this.goldManager) {
          this.goldManager.add(ENEMY_KILL_REWARD);
        }
        // 销毁敌人并从数组中移除
        enemy.destroy();
        return false;
      }
      return true;
    });
  }

  /**
   * 获取所有活跃的敌人
   * @returns {Array<EnemyTank>} 敌人数组
   */
  getEnemies() {
    return this.enemies;
  }
}


