/**
 * 敌人管理器
 */

import { GameContext } from '../core/GameContext';
import { GameConfig } from '../config/GameConfig';
import { EnemyConfig } from '../config/EnemyConfig';
import { EnemyTankConfig } from '../config/enemies/EnemyTankConfig';
import { WaveConfig } from '../config/WaveConfig';
import { EnemyTank } from '../entities/enemies/EnemyTank';
import { FastEnemy } from '../entities/enemies/FastEnemy';
import { HeavyEnemy } from '../entities/enemies/HeavyEnemy';
import { FlyingEnemy } from '../entities/enemies/FlyingEnemy';
import { BomberEnemy } from '../entities/enemies/BomberEnemy';
import { FastEnemyConfig } from '../config/enemies/FastEnemyConfig';
import { HeavyEnemyConfig } from '../config/enemies/HeavyEnemyConfig';
import { FlyingEnemyConfig } from '../config/enemies/FlyingEnemyConfig';
import { BomberEnemyConfig } from '../config/enemies/BomberEnemyConfig';
import { WeaponRenderer } from '../rendering/weapons/WeaponRenderer';
import { EnemyTankRenderer } from '../rendering/enemies/EnemyTankRenderer';
import { FastEnemyRenderer } from '../rendering/enemies/FastEnemyRenderer';
import { HeavyEnemyRenderer } from '../rendering/enemies/HeavyEnemyRenderer';
import { FlyingEnemyRenderer } from '../rendering/enemies/FlyingEnemyRenderer';
import { BomberEnemyRenderer } from '../rendering/enemies/BomberEnemyRenderer';

export class EnemyManager {
  constructor(ctx, weaponManager, goldManager) {
    this.ctx = ctx;
    this.weaponManager = weaponManager;
    this.goldManager = goldManager;
    this.enemies = [];
    this.spawnTimer = 0;
    this.spawnInterval = EnemyConfig.ENEMY_SPAWN_INTERVAL;
    this.waveTimer = 0;
    this.waveLevel = 1;
    this.hpBonus = 0;
    this.waveEnemyCount = 0; // 当前波次已生成的敌人数量
    this.maxEnemiesPerWave = 15; // 每波最多15个敌人
    this.isWaveComplete = false; // 当前波次是否完成
    this.waveStartTime = 0; // 波次开始时间（用于显示提示）
    this.showWaveNotification = false; // 是否显示波次提示
    this.obstacleManager = null; // 障碍物管理器引用
    this.currentWaveEnemyTypes = []; // 当前波次可用的敌人类型池
    this.effectManager = null; // 特效管理器引用
    this.audioManager = null; // 音频管理器引用
    this.tutorialPaused = false; // 引导期间暂停波次
  }
  
  /**
   * 设置特效管理器
   */
  setEffectManager(effectManager) {
    this.effectManager = effectManager;
  }
  
  /**
   * 设置障碍物管理器
   */
  setObstacleManager(obstacleManager) {
    this.obstacleManager = obstacleManager;
  }
  
  /**
   * 设置音频管理器
   */
  setAudioManager(audioManager) {
    this.audioManager = audioManager;
  }
  
  /**
   * 初始化敌人管理器（初始化缓存）
   */
  init() {
    // 初始化敌人渲染缓存（初始化所有敌人类型的缓存）
    EnemyTankRenderer.initCache(EnemyTankConfig.SIZE);
    FastEnemyRenderer.initCache(FastEnemyConfig.SIZE);
    HeavyEnemyRenderer.initCache(HeavyEnemyConfig.SIZE);
    FlyingEnemyRenderer.initCache(FlyingEnemyConfig.SIZE);
    BomberEnemyRenderer.initCache(BomberEnemyConfig.SIZE);
  }
  
  /**
   * 重置敌人管理器
   */
  reset() {
    this.enemies = [];
    this.spawnTimer = 0;
    this.spawnInterval = EnemyConfig.ENEMY_SPAWN_INTERVAL;
    this.waveTimer = 0;
    this.waveLevel = 0; // 初始化为0，startNewWave会将其设为1
    this.hpBonus = 0;
    this.waveEnemyCount = 0;
    this.currentWaveEnemyTypes = []; // 当前波次可用的敌人类型池
    this.isWaveComplete = false;
    this.waveStartTime = 0;
    this.showWaveNotification = false;
    // 初始化第一波
    this.startNewWave();
  }
  
  /**
   * 开始新波次
   */
  startNewWave() {
    this.waveLevel++;
    this.waveEnemyCount = 0;
    this.isWaveComplete = false;
    this.hpBonus = (this.waveLevel - 1) * WaveConfig.HP_BONUS_PER_WAVE;
    // 每波生成间隔递减（但不超过最小值）
    this.spawnInterval = Math.max(
      EnemyConfig.ENEMY_MIN_SPAWN_INTERVAL,
      EnemyConfig.ENEMY_SPAWN_INTERVAL * Math.pow(WaveConfig.SPAWN_INTERVAL_REDUCTION, this.waveLevel - 1)
    );
    this.waveTimer = 0;
    this.spawnTimer = 0; // 重置生成计时器
    this.waveStartTime = Date.now(); // 记录波次开始时间
    this.showWaveNotification = true; // 显示波次提示
    
    // 为当前波次生成随机的敌人种类组合
    this.generateWaveEnemyTypes();
  }
  
  /**
   * 为当前波次生成随机的敌人种类组合
   */
  generateWaveEnemyTypes() {
    // 所有可用的敌人类型
    const allEnemyTypes = [
      { type: 'tank', weight: 30 },      // 普通坦克：30% 权重
      { type: 'fast', weight: 25 },      // 快速敌人：25% 权重
      { type: 'heavy', weight: 20 },     // 重型敌人：20% 权重
      { type: 'flying', weight: 15 },    // 飞行敌人：15% 权重
      { type: 'bomber', weight: 10 }     // 自爆敌人：10% 权重
    ];
    
    // 根据波次调整权重（后期波次增加难度）
    const waveMultiplier = Math.min(1 + (this.waveLevel - 1) * 0.1, 2); // 最多2倍权重
    
    // 计算总权重
    let totalWeight = 0;
    for (const enemyType of allEnemyTypes) {
      totalWeight += enemyType.weight * waveMultiplier;
    }
    
    // 生成当前波次的敌人类型池（每个敌人类型至少出现一次，然后根据权重随机）
    this.currentWaveEnemyTypes = [];
    
    // 确保每种类型至少出现一次（前5个）
    for (let i = 0; i < Math.min(5, this.maxEnemiesPerWave); i++) {
      if (i < allEnemyTypes.length) {
        this.currentWaveEnemyTypes.push(allEnemyTypes[i].type);
      }
    }
    
    // 剩余敌人根据权重随机生成
    for (let i = this.currentWaveEnemyTypes.length; i < this.maxEnemiesPerWave; i++) {
      const random = Math.random() * totalWeight;
      let currentWeight = 0;
      
      for (const enemyType of allEnemyTypes) {
        currentWeight += enemyType.weight * waveMultiplier;
        if (random <= currentWeight) {
          this.currentWaveEnemyTypes.push(enemyType.type);
          break;
        }
      }
    }
    
    // 打乱顺序，使敌人种类更随机
    for (let i = this.currentWaveEnemyTypes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.currentWaveEnemyTypes[i], this.currentWaveEnemyTypes[j]] = 
        [this.currentWaveEnemyTypes[j], this.currentWaveEnemyTypes[i]];
    }
  }
  
  /**
   * 更新波次提示显示时间
   */
  updateWaveNotification() {
    if (this.showWaveNotification) {
      const elapsed = Date.now() - this.waveStartTime;
      // 显示3秒后隐藏
      if (elapsed > 3000) {
        this.showWaveNotification = false;
      }
    }
  }
  
  /**
   * 是否显示波次提示
   */
  shouldShowWaveNotification() {
    return this.showWaveNotification;
  }
  
  /**
   * 生成敌人
   */
  spawnEnemy() {
    // 检查是否达到每波上限
    if (this.waveEnemyCount >= this.maxEnemiesPerWave) {
      return; // 已达到本波上限，不再生成
    }
    
    // 随机选择一行（只在前三行生成）
    let row;
    let attempts = 0;
    const maxAttempts = 50; // 最多尝试50次
    
    // 计算实际的行号范围（只在前三行）
    const battleStartRow = GameConfig.BATTLE_START_ROW;
    const rowRange = 3; // 只在前三行生成
    
    do {
      row = Math.floor(Math.random() * rowRange);
      attempts++;
      
      // 检查起始位置（第一列）和第二列是否有障碍物
      const gridY = battleStartRow + row;
      const hasObstacleAtStart = this.obstacleManager && this.obstacleManager.hasObstacle(0, gridY);
      const hasObstacleAtNext = this.obstacleManager && this.obstacleManager.hasObstacle(1, gridY);
      
      // 确保起点和下一个格子都没有障碍物
      if (!hasObstacleAtStart && !hasObstacleAtNext) {
        break; // 找到没有障碍物的位置
      }
    } while (attempts < maxAttempts);
    
    // 如果尝试多次都找不到，选择第一个没有障碍物的行
    if (attempts >= maxAttempts) {
      for (let r = 0; r < rowRange; r++) {
        const gridY = battleStartRow + r;
        const hasObstacleAtStart = this.obstacleManager && this.obstacleManager.hasObstacle(0, gridY);
        const hasObstacleAtNext = this.obstacleManager && this.obstacleManager.hasObstacle(1, gridY);
        if (!hasObstacleAtStart && !hasObstacleAtNext) {
          row = r;
          break;
        }
      }
    }
    
    // 从当前波次的敌人类型池中随机选择（如果池为空，则使用默认随机）
    let enemyType;
    if (this.currentWaveEnemyTypes && this.currentWaveEnemyTypes.length > 0) {
      // 从当前波次的类型池中选择
      const randomIndex = Math.floor(Math.random() * this.currentWaveEnemyTypes.length);
      enemyType = this.currentWaveEnemyTypes[randomIndex];
      // 移除已使用的类型（避免重复）
      this.currentWaveEnemyTypes.splice(randomIndex, 1);
    } else {
      // 回退到随机选择（如果类型池为空）
      const random = Math.random();
      if (random < 0.4) {
        enemyType = 'tank';
      } else if (random < 0.6) {
        enemyType = 'fast';
      } else if (random < 0.75) {
        enemyType = 'heavy';
      } else if (random < 0.9) {
        enemyType = 'flying';
      } else {
        enemyType = 'bomber';
      }
    }
    
    // 根据类型创建敌人
    let enemy;
    switch (enemyType) {
      case 'tank':
        enemy = new EnemyTank(this.ctx, 0, 0);
        break;
      case 'fast':
        enemy = new FastEnemy(this.ctx, 0, 0);
        break;
      case 'heavy':
        enemy = new HeavyEnemy(this.ctx, 0, 0);
        break;
      case 'flying':
        enemy = new FlyingEnemy(this.ctx, 0, 0);
        break;
      case 'bomber':
        enemy = new BomberEnemy(this.ctx, 0, 0);
        break;
      default:
        enemy = new EnemyTank(this.ctx, 0, 0);
    }
    
    enemy.initPosition(row);
    enemy.setHpBonus(this.hpBonus);
    
    // 创建敌人生成特效
    if (this.effectManager) {
      this.effectManager.createEnemySpawnEffect(enemy.x, enemy.y, enemyType);
    }
    
    this.enemies.push(enemy);
    this.waveEnemyCount++;
    
    const gameContext = GameContext.getInstance();
    gameContext.addEnemy(enemy);
  }
  
  /**
   * 设置引导暂停状态
   */
  setTutorialPaused(paused) {
    this.tutorialPaused = paused;
  }
  
  /**
   * 更新敌人
   */
  update(deltaTime, deltaMS, weapons) {
  
    // 检查游戏是否已开始
    const gameContext = GameContext.getInstance();
    if (!gameContext.gameStarted) {
      // 游戏未开始，不更新敌人生成逻辑
      return;
    }
    
    // 检查游戏是否已暂停
    if (gameContext.gamePaused) {
      // 游戏已暂停，不更新敌人
      return;
    }
    
    // 检查是否在引导期间（引导期间暂停波次）
    if (this.tutorialPaused) {
      // 引导期间，不生成敌人，但更新现有敌人（如果有）
      // 只更新现有敌人，不生成新敌人
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        if (!enemy) continue;
        enemy.update(deltaTime, deltaMS, weapons);
      }
      return;
    }
    
    // 更新波次提示
    this.updateWaveNotification();
    
    // 波次管理
    if (this.isWaveComplete) {
      // 当前波次已完成，等待所有敌人被消灭或离开后开始新波次
      if (this.enemies.length === 0) {
        this.startNewWave();
      }
    } else {
      // 检查当前波次是否完成（已生成足够敌人且所有敌人都已离开或被消灭）
      if (this.waveEnemyCount >= this.maxEnemiesPerWave && this.enemies.length === 0) {
        this.isWaveComplete = true;
      }
    }
    
    // 更新生成计时器（只在波次未完成时生成）
    if (!this.isWaveComplete && this.waveEnemyCount < this.maxEnemiesPerWave) {
      this.spawnTimer += deltaMS;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer = 0;
        this.spawnEnemy();
      }
    }
    
    // 更新所有敌人
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      if (!enemy) {
        continue;
      }
      
      // 处理已销毁或已完成的敌人
      if (enemy.destroyed) {
        // 播放爆炸音效
        if (this.audioManager) {
          this.audioManager.playBoomSound();
        }
        
        // 奖励金币（根据敌人类型给予不同奖励）
        if (this.goldManager) {
          let reward = EnemyTankConfig.KILL_REWARD; // 默认奖励
          
          // 根据敌人类型确定奖励
          if (enemy instanceof FastEnemy) {
            reward = FastEnemyConfig.KILL_REWARD;
          } else if (enemy instanceof HeavyEnemy) {
            reward = HeavyEnemyConfig.KILL_REWARD;
          } else if (enemy instanceof FlyingEnemy) {
            reward = FlyingEnemyConfig.KILL_REWARD;
          } else if (enemy instanceof BomberEnemy) {
            reward = BomberEnemyConfig.KILL_REWARD;
          }
          
          this.goldManager.addGold(reward);
        }
        // 从 GameContext 移除
        const gameContext = GameContext.getInstance();
        gameContext.removeEnemy(enemy);
        this.enemies.splice(i, 1);
        continue;
      }
      
      if (enemy.finished) {
        // 敌人到达终点，游戏结束
        const gameContext = GameContext.getInstance();
        gameContext.gameOver = true;
        gameContext.gamePaused = true; // 暂停游戏
        // 游戏结束：敌人到达终点
        // 从 GameContext 移除
        gameContext.removeEnemy(enemy);
        this.enemies.splice(i, 1);
        continue;
      }
      
      
      // 更新敌人
      if (enemy.update) {
        enemy.update(deltaTime, deltaMS, weapons || []);
      }
    }
  }
  
  /**
   * 获取所有敌人
   */
  getEnemies() {
    return this.enemies;
  }
  
  /**
   * 获取当前波次
   */
  getWaveLevel() {
    return this.waveLevel;
  }
  
  /**
   * 获取当前波次进度
   */
  getWaveProgress() {
    return {
      current: this.waveEnemyCount,
      max: this.maxEnemiesPerWave,
      isComplete: this.isWaveComplete
    };
  }
  
  /**
   * 移除敌人
   */
  removeEnemy(enemy) {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
      const gameContext = GameContext.getInstance();
      gameContext.removeEnemy(enemy);
    }
  }
  
  /**
   * 渲染敌人（带视锥剔除，优化：减少 save/restore 调用）
   */
  render(viewLeft = -Infinity, viewRight = Infinity, viewTop = -Infinity, viewBottom = Infinity, offsetX = 0, offsetY = 0) {
    
    // 优化：只在需要时保存上下文，而不是每个敌人都保存
    let hasRendered = false;
    
    // 先收集需要渲染的敌人（减少循环中的条件判断）
    const enemiesToRender = [];
    for (const enemy of this.enemies) {
      if (!enemy || enemy.destroyed || enemy.finished) continue;
      
      // 视锥剔除：只渲染屏幕内的敌人
      const enemySize = enemy.size || EnemyTankConfig.SIZE;
      if (enemy.x + enemySize < viewLeft || 
          enemy.x - enemySize > viewRight ||
          enemy.y + enemySize < viewTop || 
          enemy.y - enemySize > viewBottom) {
        continue; // 跳过屏幕外的敌人
      }
      
      enemiesToRender.push(enemy);
    }
    
    // 如果没有需要渲染的敌人，直接返回
    if (enemiesToRender.length === 0) return;
    
    // 批量渲染敌人（优化：移除 save/restore）
    // 先批量渲染所有血条（相同状态）
    this.renderAllHealthBars(enemiesToRender, offsetX, offsetY);
    
    // 再渲染所有敌人本体
    for (const enemy of enemiesToRender) {
      if (enemy.render) {
        enemy.render(viewLeft, viewRight, viewTop, viewBottom, offsetX, offsetY);
        hasRendered = true;
      }
    }
  }
  
  /**
   * 批量渲染所有敌人的血条（优化：减少状态切换，应用战场偏移）
   */
  renderAllHealthBars(enemies, offsetX = 0, offsetY = 0) {
    // 收集所有需要渲染的血条
    const healthBars = [];
    for (const enemy of enemies) {
      if (enemy && !enemy.destroyed && !enemy.finished) {
        healthBars.push({
          x: enemy.x + offsetX,
          y: enemy.y + offsetY,
          hp: enemy.hp,
          maxHp: enemy.maxHp,
          size: enemy.size || GameConfig.ENEMY_SIZE
        });
      }
    }
    
    if (healthBars.length === 0) return;
    
    // 批量绘制血条（减少状态切换）
    for (const bar of healthBars) {
      WeaponRenderer.renderHealthBar(this.ctx, bar.x, bar.y, bar.hp, bar.maxHp, bar.size);
    }
  }
}

