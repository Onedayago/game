import { ENEMY_SPAWN_INTERVAL, ENEMY_KILL_REWARD, BATTLE_ROWS } from '../constants';
import { EnemyTank } from '../entities/enemies/enemyTank';

export class EnemyManager {
  constructor(app, weaponContainer, goldManager) {
    this.app = app;
    this.weaponContainer = weaponContainer;
    this.goldManager = goldManager;
    this.enemies = [];
    this.timeSinceLastSpawn = 0;
    this.baseSpawnInterval = ENEMY_SPAWN_INTERVAL;
    this.spawnInterval = this.baseSpawnInterval;
    this.minSpawnInterval = 800;
    this.waveDuration = 15000;
    this.waveTimer = 0;
    this.waveLevel = 1;
    this.hpBonusPerWave = 2;
    this.hpBonus = 0;
  }

  spawnEnemy() {
    const rows = BATTLE_ROWS;
    const minRow = 0;
    const maxRow = rows - 1;
    const playableRows = Math.max(0, rows);

    if (playableRows <= 0) return;
    let row = null;
    const maxTries = 8;
    for (let i = 0; i < maxTries; i += 1) {
      const candidate = minRow + Math.floor(Math.random() * playableRows);
      const occupied = this.enemies.some(
        (e) => !e._dead && !e._finished && e.gridCol === 0 && e.gridRow === candidate,
      );
      if (!occupied) {
        row = candidate;
        break;
      }
    }
    if (row == null) {
      return;
    }
    const col = 0;

    const enemy = new EnemyTank(this.app, col, row, this.hpBonus);
    this.enemies.push(enemy);
  }

  update(delta, deltaMS) {
    this.waveTimer += deltaMS;
    if (this.waveTimer >= this.waveDuration) {
      this.waveTimer -= this.waveDuration;
      this.waveLevel += 1;
      this.spawnInterval = Math.max(
        this.minSpawnInterval,
        this.baseSpawnInterval * 0.9 ** (this.waveLevel - 1),
      );
      this.hpBonus = (this.waveLevel - 1) * this.hpBonusPerWave;
    }

    if (this.goldManager && typeof this.goldManager.setWaveInfo === 'function') {
      const timeLeft = Math.max(0, this.waveDuration - this.waveTimer);
      this.goldManager.setWaveInfo(this.waveLevel, timeLeft, this.waveDuration);
    }

    this.timeSinceLastSpawn += deltaMS;
    if (this.timeSinceLastSpawn >= this.spawnInterval) {
      this.spawnEnemy();
      this.timeSinceLastSpawn = 0;
    }

    this.enemies.forEach((enemy) =>
      enemy.update(delta, deltaMS, this.weaponContainer, this.enemies),
    );

    this.enemies = this.enemies.filter((enemy) => {
      if (enemy._finished || enemy._dead) {
        if (enemy._dead && this.goldManager) {
          this.goldManager.add(ENEMY_KILL_REWARD);
        }
        enemy.destroy();
        return false;
      }
      return true;
    });
  }

  getEnemies() {
    return this.enemies;
  }
}


