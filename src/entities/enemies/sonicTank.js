/**
 * 声波坦克实体
 * 特殊类型的敌人，可以发射范围攻击的声波
 * 
 * 特点：
 * - 发射声波进行范围攻击
 * - 外观与普通坦克不同，带有声波发射器
 * - 攻击间隔较长但伤害范围大
 * - 移动速度较慢
 */

import { Graphics } from 'pixi.js';
import {
  CELL_SIZE,
  BATTLE_ROWS,
  WORLD_WIDTH,
  ENEMY_MOVE_SPEED,
  SONIC_TANK_ATTACK_RANGE_CELLS,
  SONIC_TANK_FIRE_INTERVAL,
  SONIC_TANK_SIZE,
  SONIC_TANK_MAX_HP,
  COLORS,
  TANK_SIZE,
  SONIC_WAVE_DAMAGE,
} from '../../constants';
import { soundManager } from '../../core/soundManager';
import { particleSystem } from '../../core/particleSystem';
import { SonicWave } from './sonicWave';

/**
 * 声波坦克实体，负责寻路、声波攻击、受击和子弹管理。
 */
export class SonicTank {
  constructor(app, gridCol, gridRow, hpBonus = 0) {
    this.app = app;
    this.gridCol = gridCol;
    this.gridRow = gridRow;

    const centerX = gridCol * CELL_SIZE + CELL_SIZE / 2;
    const centerY = gridRow * CELL_SIZE + CELL_SIZE / 2;

    const hullRadius = SONIC_TANK_SIZE * 0.3;
    const trackHeight = SONIC_TANK_SIZE * 0.22;

    this.sprite = new Graphics();
    this.idleAnimTime = 0; // 待机动画计时器

    // 多层阴影
    this.sprite
      .roundRect(-SONIC_TANK_SIZE / 2 + 4, -SONIC_TANK_SIZE / 2 + 6, SONIC_TANK_SIZE - 8, SONIC_TANK_SIZE - 6, hullRadius)
      .fill({ color: 0x000000, alpha: 0.3 })
      .roundRect(-SONIC_TANK_SIZE / 2 + 6, -SONIC_TANK_SIZE / 2 + 8, SONIC_TANK_SIZE - 12, SONIC_TANK_SIZE - 10, hullRadius * 0.8)
      .fill({ color: 0x000000, alpha: 0.15 });

    // 上下履带
    this.sprite
      .roundRect(-SONIC_TANK_SIZE / 2, -SONIC_TANK_SIZE / 2, SONIC_TANK_SIZE, trackHeight, trackHeight / 2)
      .fill({ color: 0x1e1b4b })
      .stroke({ width: 1, color: 0x312e81, alpha: 0.6 })
      .roundRect(
        -SONIC_TANK_SIZE / 2,
        SONIC_TANK_SIZE / 2 - trackHeight,
        SONIC_TANK_SIZE,
        trackHeight,
        trackHeight / 2,
      )
      .fill({ color: 0x1e1b4b })
      .stroke({ width: 1, color: 0x312e81, alpha: 0.6 });

    // 履带滚轮
    const wheelRadius = trackHeight * 0.32;
    const wheelCount = 4;
    for (let i = 0; i < wheelCount; i += 1) {
      const t = wheelCount === 1 ? 0.5 : i / (wheelCount - 1);
      const wx = -SONIC_TANK_SIZE / 2 + SONIC_TANK_SIZE * (0.18 + 0.64 * t);
      const wyTop = -SONIC_TANK_SIZE / 2 + trackHeight / 2;
      const wyBottom = SONIC_TANK_SIZE / 2 - trackHeight / 2;
      
      this.sprite
        .circle(wx, wyTop, wheelRadius)
        .fill({ color: 0x4c1d95 })
        .stroke({ width: 1, color: 0x312e81 })
        .circle(wx, wyTop, wheelRadius * 0.5)
        .fill({ color: 0x6d28d9 })
        .circle(wx, wyBottom, wheelRadius)
        .fill({ color: 0x4c1d95 })
        .stroke({ width: 1, color: 0x312e81 })
        .circle(wx, wyBottom, wheelRadius * 0.5)
        .fill({ color: 0x6d28d9 });
    }

    // 主车体（紫色主题）
    this.sprite
      .roundRect(
        -SONIC_TANK_SIZE / 2 + 6,
        -SONIC_TANK_SIZE / 2 + trackHeight * 0.65,
        SONIC_TANK_SIZE - 12,
        SONIC_TANK_SIZE - trackHeight * 1.3,
        hullRadius,
      )
      .fill({ color: 0x5b21b6 })
      .stroke({ width: 2.5, color: 0x4c1d95, alpha: 1 });

    // 车体高光
    this.sprite
      .roundRect(
        -SONIC_TANK_SIZE / 2 + 8,
        -SONIC_TANK_SIZE / 2 + trackHeight * 0.7,
        SONIC_TANK_SIZE - 16,
        (SONIC_TANK_SIZE - trackHeight * 1.3) * 0.25,
        hullRadius * 0.6,
      )
      .fill({ color: 0xa78bfa, alpha: 0.3 });

    // 声波发射器标识
    this.sprite
      .roundRect(
        -SONIC_TANK_SIZE / 2 + 10,
        -SONIC_TANK_SIZE * 0.08,
        SONIC_TANK_SIZE - 20,
        SONIC_TANK_SIZE * 0.18,
        SONIC_TANK_SIZE * 0.05,
      )
      .fill({ color: 0x4c1d95, alpha: 0.95 })
      .stroke({ width: 1, color: 0x8b5cf6, alpha: 0.5 });

    // 声波标识符号（波纹图案）
    const waveSymbolCount = 3;
    for (let i = 0; i < waveSymbolCount; i++) {
      const symbolRadius = SONIC_TANK_SIZE * (0.08 + i * 0.04);
      this.sprite
        .circle(0, 0, symbolRadius)
        .stroke({ width: 1.5, color: 0x8b5cf6, alpha: 0.6 - i * 0.15 });
    }

    // 声波发射器（圆形能量核心）
    const emitterRadius = SONIC_TANK_SIZE * 0.25;
    this.sprite
      .circle(0, -SONIC_TANK_SIZE * 0.05, emitterRadius * 1.15)
      .fill({ color: 0x8b5cf6, alpha: 0.2 })
      .circle(0, -SONIC_TANK_SIZE * 0.05, emitterRadius)
      .fill({ color: 0x4c1d95 })
      .stroke({ width: 2, color: 0x8b5cf6, alpha: 0.8 })
      .circle(0, -SONIC_TANK_SIZE * 0.05, emitterRadius * 0.7)
      .fill({ color: 0x6d28d9 });

    // 能量核心中心
    this.sprite
      .circle(0, -SONIC_TANK_SIZE * 0.05, emitterRadius * 0.4)
      .fill({ color: 0xa78bfa, alpha: 0.9 })
      .circle(0, -SONIC_TANK_SIZE * 0.05, emitterRadius * 0.2)
      .fill({ color: 0xffffff, alpha: 0.8 });

    // 声波放大器（前方的喇叭状结构）
    const amplifierWidth = SONIC_TANK_SIZE * 0.35;
    const amplifierLength = SONIC_TANK_SIZE * 0.6;
    this.sprite
      .moveTo(0, -amplifierWidth / 2)
      .lineTo(amplifierLength, -amplifierWidth * 0.8)
      .lineTo(amplifierLength, amplifierWidth * 0.8)
      .lineTo(0, amplifierWidth / 2)
      .fill({ color: 0x6d28d9, alpha: 0.7 })
      .stroke({ width: 2, color: 0x8b5cf6, alpha: 0.9 });

    // 放大器细节线条
    const detailLines = 3;
    for (let i = 1; i < detailLines; i++) {
      const t = i / detailLines;
      const x = amplifierLength * t;
      const halfWidth = amplifierWidth * (0.5 + 0.3 * t);
      this.sprite
        .moveTo(x, -halfWidth)
        .lineTo(x, halfWidth)
        .stroke({ width: 1, color: 0xa78bfa, alpha: 0.4 });
    }

    this.sprite.x = centerX;
    this.sprite.y = centerY;

    const world = this.app.world || this.app.stage;
    world.addChild(this.sprite);

    this.targetCol = gridCol;
    this.targetRow = gridRow;

    this.maxHp = SONIC_TANK_MAX_HP + hpBonus;
    this.hp = this.maxHp;
    this.hitTimer = 0;

    this.hpBarBg = new Graphics();
    this.hpBarFill = new Graphics();
    world.addChild(this.hpBarBg);
    world.addChild(this.hpBarFill);

    this.updateHpBar();

    this.path = [];
    this.sonicWaves = []; // 声波数组
    this.fireTimer = 0;
  }

  findPath(weaponContainer, allEnemies, allowThroughTowers = false) {
    const cols = Math.floor(WORLD_WIDTH / CELL_SIZE);
    const rows = BATTLE_ROWS;
    const minRow = 0;
    const maxRow = rows - 1;

    const startRow = Math.min(Math.max(this.gridRow, minRow), maxRow);
    const startKey = `${this.gridCol},${startRow}`;
    const queue = [];
    const visited = new Set();
    const parent = new Map();

    queue.push({ col: this.gridCol, row: startRow });
    visited.add(startKey);

    const directions = [
      [1, 0], // 右
      [0, -1], // 上
      [0, 1], // 下
      [-1, 0], // 左
    ];

    let goal = null;

    while (queue.length) {
      const node = queue.shift();
      const key = `${node.col},${node.row}`;

      if (node.col === cols - 1) {
        goal = node;
        break;
      }

      for (const [dx, dy] of directions) {
        const nc = node.col + dx;
        const nr = node.row + dy;
        if (nc < 0 || nc >= cols || nr < minRow || nr > maxRow) continue;

        const nKey = `${nc},${nr}`;
        if (visited.has(nKey)) continue;

        if (!allowThroughTowers && weaponContainer.isCellOccupied(nc, nr)) {
          continue;
        }

        if (allEnemies && !allowThroughTowers) {
          const blockedByEnemy = allEnemies.some(
            (enemy) =>
              enemy !== this
              && enemy.gridCol === nc
              && enemy.gridRow === nr
              && !enemy._dead
              && !enemy._finished,
          );
          if (blockedByEnemy) continue;
        }

        visited.add(nKey);
        parent.set(nKey, key);
        queue.push({ col: nc, row: nr });
      }
    }

    if (!goal) return null;

    const path = [];
    let curKey = `${goal.col},${goal.row}`;
    while (curKey !== startKey) {
      const [c, r] = curKey.split(',').map((v) => parseInt(v, 10));
      path.push({ col: c, row: r });
      const p = parent.get(curKey);
      if (!p) break;
      curKey = p;
    }
    path.reverse();
    return path;
  }

  update(delta, deltaMS, weaponContainer, allEnemies) {
    const cols = Math.floor(WORLD_WIDTH / CELL_SIZE);
    const rows = BATTLE_ROWS;
    const minRow = 0;
    const maxRow = rows - 1;

    // 待机动画：轻微呼吸效果
    this.idleAnimTime += deltaMS;
    const idlePulse = 1 + 0.02 * Math.sin(this.idleAnimTime * 0.0012);
    this.sprite.scale.set(idlePulse);

    if (this.hitTimer > 0) {
      this.hitTimer -= deltaMS;
      this.sprite.alpha = 0.4;
      if (this.hitTimer <= 0) {
        this.sprite.alpha = 1;
        this.hitTimer = 0;
      }
    }

    this.updateHpBar();

    const weapons = (weaponContainer && weaponContainer.weapons) || [];
    let closest = null;
    let closestDistCells = Infinity;

    if (weapons.length > 0) {
      weapons.forEach((weapon) => {
        if (!weapon || weapon.gridCol == null || weapon.gridRow == null) return;
        const dxCells = weapon.gridCol - this.gridCol;
        const dyCells = weapon.gridRow - this.gridRow;
        const distCells = Math.hypot(dxCells, dyCells);
        if (distCells < closestDistCells) {
          closestDistCells = distCells;
          closest = weapon;
        }
      });
    }

    const inAttackRange =
      closest && closestDistCells <= SONIC_TANK_ATTACK_RANGE_CELLS;

    if (inAttackRange && closest) {
      const sx = this.sprite.x;
      const sy = this.sprite.y;
      const targetDisplay = closest.turret || closest.turretHead || closest.container;
      const tx = targetDisplay.x;
      const ty = targetDisplay.y;
      const angle = Math.atan2(ty - sy, tx - sx);

      this.sprite.rotation = angle;

      this.fireTimer += deltaMS;
      if (this.fireTimer >= SONIC_TANK_FIRE_INTERVAL) {
        this.fireTimer = 0;
        // 发射声波
        const wave = new SonicWave(this.app, sx, sy);
        this.sonicWaves.push(wave);

        // 声波发射特效
        particleSystem.createMuzzleFlash(sx, sy, angle, 0x8b5cf6);
        soundManager.playFire();
      }
    } else {
      this.sprite.rotation = 0;
      this.fireTimer = 0;
    }

    // 如果不在攻击范围，则移动
    if (!inAttackRange) {
      const targetX = this.targetCol * CELL_SIZE + CELL_SIZE / 2;
      const targetY = this.targetRow * CELL_SIZE + CELL_SIZE / 2;
      const dx = targetX - this.sprite.x;
      const dy = targetY - this.sprite.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 1) {
        this.gridCol = this.targetCol;
        this.gridRow = Math.min(Math.max(this.targetRow, minRow), maxRow);

        if (this.gridCol >= cols - 1) {
          this._finished = true;
          return;
        }

        const forwardCol = this.gridCol + 1;
        const forwardRow = this.gridRow;
        let blockedForward =
          forwardCol >= cols
          || forwardRow < minRow
          || forwardRow > maxRow;

        if (!blockedForward) {
          if (
            weaponContainer
            && typeof weaponContainer.isCellOccupied === 'function'
            && weaponContainer.isCellOccupied(forwardCol, forwardRow)
          ) {
            blockedForward = true;
          }

          if (!blockedForward && allEnemies) {
            blockedForward = allEnemies.some(
              (enemy) =>
                enemy !== this
                && !enemy._dead
                && !enemy._finished
                && enemy.gridCol === forwardCol
                && enemy.gridRow === forwardRow,
            );
          }
        }

        if (!blockedForward) {
          this.targetCol = forwardCol;
          this.targetRow = forwardRow;
          this.path = [];
        } else {
          let path =
            this.findPath(weaponContainer, allEnemies, false)
            || this.findPath(weaponContainer, allEnemies, true);

          this.path = Array.isArray(path) ? path : [];

          if (this.path.length > 0) {
            const nextStep = this.path.shift();
            this.targetCol = nextStep.col;
            this.targetRow = nextStep.row;
          } else {
            const nextCol = Math.min(this.gridCol + 1, cols - 1);
            this.targetCol = nextCol;
            this.targetRow = this.gridRow;
          }
        }
      }

      const moveTargetX = this.targetCol * CELL_SIZE + CELL_SIZE / 2;
      const moveTargetY = this.targetRow * CELL_SIZE + CELL_SIZE / 2;
      const moveDx = moveTargetX - this.sprite.x;
      const moveDy = moveTargetY - this.sprite.y;
      const moveDist = Math.hypot(moveDx, moveDy);

      if (moveDist > 0) {
        // 声波坦克移动速度较慢
        const step = (ENEMY_MOVE_SPEED * 0.7 * deltaMS) / 1000;
        const ratio = Math.min(step / moveDist, 1);
        this.sprite.x += moveDx * ratio;
        this.sprite.y += moveDy * ratio;
      }
    }

    // 更新所有声波
    const aliveWaves = [];
    this.sonicWaves.forEach((wave) => {
      wave.update(deltaMS);

      if (wave.shouldDestroy()) {
        wave.destroy();
        return;
      }

      // 检查声波是否击中武器
      for (const weapon of weapons) {
        const targetDisplay = weapon.turret || weapon.turretHead || weapon.container;
        if (!weapon || !targetDisplay) continue;
        
        const hitRadius = TANK_SIZE * 0.4;
        if (wave.isHitting(targetDisplay, hitRadius)) {
          wave.markAsHit(weapon);
          
          // 造成伤害
          particleSystem.createHitSpark(targetDisplay.x, targetDisplay.y, 0x8b5cf6);
          
          if (typeof weapon.registerHitFromEnemy === 'function') {
            const destroyed = weapon.registerHitFromEnemy(SONIC_WAVE_DAMAGE);
            if (
              destroyed
              && weaponContainer
              && typeof weaponContainer.removeWeapon === 'function'
            ) {
              weaponContainer.removeWeapon(weapon);
            }
          }
        }
      }

      aliveWaves.push(wave);
    });

    this.sonicWaves = aliveWaves;
  }

  destroy() {
    this.sonicWaves.forEach((w) => w.destroy());
    this.sonicWaves = [];
    const world = this.app.world || this.app.stage;
    if (this.hpBarBg) world.removeChild(this.hpBarBg);
    if (this.hpBarFill) world.removeChild(this.hpBarFill);
    world.removeChild(this.sprite);
  }

  registerHit(damage = 1) {
    if (this.hp <= 0) return;

    this.hp -= damage;
    this.hitTimer = 120;
    this.updateHpBar();

    if (this.hp <= 0) {
      this._dead = true;
      soundManager.playEnemyDeath();
      particleSystem.createExplosion(this.sprite.x, this.sprite.y, 0x8b5cf6, 15);
    }
  }

  updateHpBar() {
    if (!this.hpBarBg || !this.hpBarFill) return;

    const ratio = Math.max(this.hp / this.maxHp, 0);
    const barWidth = SONIC_TANK_SIZE * 0.8;
    const barHeight = 6;
    const offsetY = SONIC_TANK_SIZE * 0.7;
    const borderRadius = 3;

    // 背景条
    this.hpBarBg
      .clear()
      .roundRect(-barWidth / 2 - 1, -barHeight / 2 - 1, barWidth + 2, barHeight + 2, borderRadius + 1)
      .fill({ color: 0x000000, alpha: 0.6 })
      .roundRect(-barWidth / 2, -barHeight / 2, barWidth, barHeight, borderRadius)
      .fill({ color: COLORS.UI_BG, alpha: 0.8 })
      .stroke({ width: 1, color: COLORS.UI_BORDER, alpha: 0.5 });
    this.hpBarBg.position.set(this.sprite.x, this.sprite.y - offsetY);

    // 前景条（紫色主题）
    this.hpBarFill.clear();
    if (ratio > 0) {
      let hpColor = 0x8b5cf6; // 紫色
      if (ratio <= 0.3) {
        hpColor = COLORS.DANGER;
      } else if (ratio <= 0.6) {
        hpColor = 0xa78bfa; // 浅紫色
      }
      
      this.hpBarFill
        .roundRect(-barWidth / 2, -barHeight / 2, barWidth * ratio, barHeight, borderRadius)
        .fill({ color: hpColor, alpha: 0.95 })
        .roundRect(-barWidth / 2, -barHeight / 2, barWidth * ratio, barHeight * 0.4, borderRadius)
        .fill({ color: 0xffffff, alpha: 0.2 });
      this.hpBarFill.position.set(this.sprite.x, this.sprite.y - offsetY);
    }
  }
}

