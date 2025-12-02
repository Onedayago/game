import { Graphics } from 'pixi.js';
import {
  CELL_SIZE,
  BATTLE_ROWS,
  WORLD_WIDTH,
  ENEMY_MOVE_SPEED,
  ENEMY_ATTACK_RANGE_CELLS,
  ENEMY_FIRE_INTERVAL,
  ENEMY_SIZE,
  ENEMY_MAX_HP,
  COLORS,
  TANK_SIZE,
  ENEMY_BULLET_DAMAGE,
} from '../../constants';
import { soundManager } from '../../core/soundManager';
import { particleSystem } from '../../core/particleSystem';
import { EnemyBullet } from './enemyBullet';

/**
 * 敌方坦克实体，负责寻路、攻击、受击和子弹管理。
 */
export class EnemyTank {
  constructor(app, gridCol, gridRow, hpBonus = 0) {
    this.app = app;
    this.gridCol = gridCol;
    this.gridRow = gridRow;

    const centerX = gridCol * CELL_SIZE + CELL_SIZE / 2;
    const centerY = gridRow * CELL_SIZE + CELL_SIZE / 2;

    const hullRadius = ENEMY_SIZE * 0.25;
    const trackHeight = ENEMY_SIZE * 0.22;
    const turretRadius = ENEMY_SIZE * 0.22;
    const barrelLength = ENEMY_SIZE * 0.78;
    const barrelHalfHeight = ENEMY_SIZE * 0.08;

    this.sprite = new Graphics();
    this.idleAnimTime = 0; // 待机动画计时器

    // 多层阴影
    this.sprite
      .roundRect(-ENEMY_SIZE / 2 + 4, -ENEMY_SIZE / 2 + 6, ENEMY_SIZE - 8, ENEMY_SIZE - 6, hullRadius)
      .fill({ color: 0x000000, alpha: 0.3 })
      .roundRect(-ENEMY_SIZE / 2 + 6, -ENEMY_SIZE / 2 + 8, ENEMY_SIZE - 12, ENEMY_SIZE - 10, hullRadius * 0.8)
      .fill({ color: 0x000000, alpha: 0.15 });

    // 上下履带（增强立体感）
    this.sprite
      .roundRect(-ENEMY_SIZE / 2, -ENEMY_SIZE / 2, ENEMY_SIZE, trackHeight, trackHeight / 2)
      .fill({ color: 0x0a0f1a })
      .stroke({ width: 1, color: COLORS.ENEMY_BODY_DARK, alpha: 0.6 })
      .roundRect(
        -ENEMY_SIZE / 2,
        ENEMY_SIZE / 2 - trackHeight,
        ENEMY_SIZE,
        trackHeight,
        trackHeight / 2,
      )
      .fill({ color: 0x0a0f1a })
      .stroke({ width: 1, color: COLORS.ENEMY_BODY_DARK, alpha: 0.6 });

    // 履带装甲板纹理
    const plateCount = 5;
    for (let i = 0; i < plateCount; i += 1) {
      const px = -ENEMY_SIZE / 2 + (ENEMY_SIZE / plateCount) * i + 3;
      this.sprite
        .rect(px, -ENEMY_SIZE / 2 + 2, ENEMY_SIZE / plateCount - 2, trackHeight - 4)
        .fill({ color: 0x1e293b, alpha: 0.4 })
        .rect(px, ENEMY_SIZE / 2 - trackHeight + 2, ENEMY_SIZE / plateCount - 2, trackHeight - 4)
        .fill({ color: 0x1e293b, alpha: 0.4 });
    }

    // 履带滚轮（增加高光）
    const wheelRadius = trackHeight * 0.32;
    const wheelCount = 4;
    for (let i = 0; i < wheelCount; i += 1) {
      const t = wheelCount === 1 ? 0.5 : i / (wheelCount - 1);
      const wx = -ENEMY_SIZE / 2 + ENEMY_SIZE * (0.18 + 0.64 * t);
      const wyTop = -ENEMY_SIZE / 2 + trackHeight / 2;
      const wyBottom = ENEMY_SIZE / 2 - trackHeight / 2;
      
      this.sprite
        .circle(wx, wyTop, wheelRadius)
        .fill({ color: 0x334155 })
        .stroke({ width: 1, color: 0x1e293b })
        .circle(wx, wyTop, wheelRadius * 0.5)
        .fill({ color: 0x475569 })
        .circle(wx, wyBottom, wheelRadius)
        .fill({ color: 0x334155 })
        .stroke({ width: 1, color: 0x1e293b })
        .circle(wx, wyBottom, wheelRadius * 0.5)
        .fill({ color: 0x475569 });
    }

    // 主车体（渐变效果）
    this.sprite
      .roundRect(
        -ENEMY_SIZE / 2 + 6,
        -ENEMY_SIZE / 2 + trackHeight * 0.65,
        ENEMY_SIZE - 12,
        ENEMY_SIZE - trackHeight * 1.3,
        hullRadius,
      )
      .fill({ color: COLORS.ENEMY_BODY })
      .stroke({ width: 2.5, color: COLORS.ENEMY_BODY_DARK, alpha: 1 });

    // 车体高光
    this.sprite
      .roundRect(
        -ENEMY_SIZE / 2 + 8,
        -ENEMY_SIZE / 2 + trackHeight * 0.7,
        ENEMY_SIZE - 16,
        (ENEMY_SIZE - trackHeight * 1.3) * 0.25,
        hullRadius * 0.6,
      )
      .fill({ color: COLORS.ENEMY_DETAIL, alpha: 0.1 });

    // 前装甲条与徽记（增强细节）
    this.sprite
      .roundRect(
        -ENEMY_SIZE / 2 + 10,
        -ENEMY_SIZE * 0.08,
        ENEMY_SIZE - 20,
        ENEMY_SIZE * 0.18,
        ENEMY_SIZE * 0.05,
      )
      .fill({ color: COLORS.ENEMY_BODY_DARK, alpha: 0.95 })
      .stroke({ width: 1, color: COLORS.ENEMY_DETAIL, alpha: 0.3 });

    // 装甲条纹
    const enemyStripeCount = 2;
    for (let i = 0; i < enemyStripeCount; i += 1) {
      const sy = -ENEMY_SIZE / 2 + trackHeight * 0.75 + i * ((ENEMY_SIZE - trackHeight * 1.4) / enemyStripeCount);
      this.sprite
        .rect(-ENEMY_SIZE / 2 + 12, sy, ENEMY_SIZE - 24, 1.5)
        .fill({ color: COLORS.ENEMY_BODY_DARK, alpha: 0.7 });
    }

    // 威胁标识（红色辉光）
    this.sprite
      .circle(-ENEMY_SIZE * 0.18, -ENEMY_SIZE * 0.02, ENEMY_SIZE * 0.09)
      .fill({ color: COLORS.ENEMY_DETAIL, alpha: 0.3 })
      .circle(-ENEMY_SIZE * 0.18, -ENEMY_SIZE * 0.02, ENEMY_SIZE * 0.07)
      .fill({ color: COLORS.ENEMY_DETAIL, alpha: 0.95 })
      .stroke({ width: 1, color: 0xfb7185, alpha: 0.8 })
      .circle(-ENEMY_SIZE * 0.18, -ENEMY_SIZE * 0.02, ENEMY_SIZE * 0.04)
      .fill({ color: 0xffffff, alpha: 0.7 });

    // 炮塔（多层结构）
    this.sprite
      .circle(0, -ENEMY_SIZE * 0.05, turretRadius * 1.1)
      .fill({ color: COLORS.ENEMY_DETAIL, alpha: 0.15 })
      .circle(0, -ENEMY_SIZE * 0.05, turretRadius)
      .fill({ color: COLORS.ENEMY_BODY_DARK })
      .stroke({ width: 2, color: 0x000000, alpha: 0.6 })
      .circle(0, -ENEMY_SIZE * 0.05, turretRadius * 0.85)
      .fill({ color: COLORS.ENEMY_BODY, alpha: 0.8 });

    // 炮塔顶部细节
    this.sprite
      .roundRect(
        -ENEMY_SIZE * 0.08,
        -ENEMY_SIZE * 0.18,
        ENEMY_SIZE * 0.16,
        ENEMY_SIZE * 0.36,
        ENEMY_SIZE * 0.06,
      )
      .fill({ color: COLORS.ENEMY_BODY, alpha: 0.95 })
      .stroke({ width: 1, color: COLORS.ENEMY_DETAIL, alpha: 0.4 });

    // 炮塔警示灯
    this.sprite
      .circle(0, -ENEMY_SIZE * 0.2, ENEMY_SIZE * 0.035)
      .fill({ color: COLORS.ENEMY_DETAIL, alpha: 0.9 })
      .circle(0, -ENEMY_SIZE * 0.2, ENEMY_SIZE * 0.022)
      .fill({ color: 0xffffff, alpha: 0.8 });

    // 炮管（增强细节）
    this.sprite
      .roundRect(
        0,
        -barrelHalfHeight,
        barrelLength,
        barrelHalfHeight * 2,
        barrelHalfHeight,
      )
      .fill({ color: COLORS.ENEMY_DETAIL })
      .stroke({ width: 1.5, color: COLORS.ENEMY_BODY_DARK, alpha: 0.8 })
      // 炮管中段装甲
      .roundRect(
        barrelLength * 0.4,
        -barrelHalfHeight * 0.6,
        barrelLength * 0.4,
        barrelHalfHeight * 1.2,
        barrelHalfHeight * 0.5,
      )
      .fill({ color: COLORS.ENEMY_BODY, alpha: 0.9 })
      .stroke({ width: 1, color: COLORS.ENEMY_DETAIL, alpha: 0.4 })
      // 炮口光环
      .circle(barrelLength - barrelHalfHeight * 0.2, 0, barrelHalfHeight * 0.6)
      .fill({ color: COLORS.ENEMY_DETAIL, alpha: 0.3 })
      .circle(barrelLength - barrelHalfHeight * 0.2, 0, barrelHalfHeight * 0.5)
      .fill({ color: COLORS.ENEMY_DETAIL, alpha: 0.95 })
      .circle(barrelLength - barrelHalfHeight * 0.2, 0, barrelHalfHeight * 0.3)
      .fill({ color: 0xffffff, alpha: 0.6 });

    this.sprite.x = centerX;
    this.sprite.y = centerY;

    const world = this.app.world || this.app.stage;
    world.addChild(this.sprite);

    this.targetCol = gridCol;
    this.targetRow = gridRow;

    this.maxHp = ENEMY_MAX_HP + hpBonus;
    this.hp = this.maxHp;
    this.hitTimer = 0;

    this.hpBarBg = new Graphics();
    this.hpBarFill = new Graphics();
    world.addChild(this.hpBarBg);
    world.addChild(this.hpBarFill);

    this.updateHpBar();

    this.path = [];
    this.bullets = [];
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
    const idlePulse = 1 + 0.015 * Math.sin(this.idleAnimTime * 0.0015);
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
      closest && closestDistCells <= ENEMY_ATTACK_RANGE_CELLS;

    if (inAttackRange && closest) {
      const sx = this.sprite.x;
      const sy = this.sprite.y;
      // TankWeapon使用turretHead，其他武器使用turret或container
      const targetDisplay = closest.turret || closest.turretHead || closest.container;
      const tx = targetDisplay.x;
      const ty = targetDisplay.y;
      const angle = Math.atan2(ty - sy, tx - sx);

      this.sprite.rotation = angle;

      this.fireTimer += deltaMS;
      if (this.fireTimer >= ENEMY_FIRE_INTERVAL) {
        this.fireTimer = 0;
        const muzzleX = sx + Math.cos(angle) * (ENEMY_SIZE * 0.6);
        const muzzleY = sy + Math.sin(angle) * (ENEMY_SIZE * 0.6);
        const bullet = new EnemyBullet(this.app, muzzleX, muzzleY, angle);
        this.bullets.push(bullet);

        particleSystem.createMuzzleFlash(muzzleX, muzzleY, angle, COLORS.ENEMY_DETAIL);
        soundManager.playFire();
      }
    } else {
      this.sprite.rotation = 0;
      this.fireTimer = 0;
    }

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
        const step = (ENEMY_MOVE_SPEED * deltaMS) / 1000;
        const ratio = Math.min(step / moveDist, 1);
        this.sprite.x += moveDx * ratio;
        this.sprite.y += moveDy * ratio;
      }
    }

    const aliveBullets = [];
    this.bullets.forEach((bullet) => {
      bullet.update(deltaMS);

      if (bullet.isOutOfBounds()) {
        bullet.destroy();
        return;
      }

      let hit = false;
      for (const weapon of weapons) {
        // TankWeapon使用turretHead，其他武器使用turret或container
        const targetDisplay = weapon.turret || weapon.turretHead || weapon.container;
        if (!weapon || !targetDisplay) continue;
        const dx = bullet.sprite.x - targetDisplay.x;
        const dy = bullet.sprite.y - targetDisplay.y;
        const distSq = dx * dx + dy * dy;
        const hitRadius = bullet.radius + TANK_SIZE * 0.4;
        if (distSq <= hitRadius * hitRadius) {
          bullet.destroy();
          hit = true;

          particleSystem.createHitSpark(bullet.sprite.x, bullet.sprite.y, 0xaaaaaa);

          if (typeof weapon.registerHitFromEnemy === 'function') {
            const destroyed = weapon.registerHitFromEnemy(ENEMY_BULLET_DAMAGE);
            if (
              destroyed
              && weaponContainer
              && typeof weaponContainer.removeWeapon === 'function'
            ) {
              weaponContainer.removeWeapon(weapon);
            }
          }
          break;
        }
      }

      if (!hit) {
        aliveBullets.push(bullet);
      }
    });

    this.bullets = aliveBullets;
  }

  destroy() {
    this.bullets.forEach((b) => b.destroy());
    this.bullets = [];
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
      particleSystem.createExplosion(this.sprite.x, this.sprite.y, COLORS.ENEMY_DETAIL, 15);
    }
  }

  updateHpBar() {
    if (!this.hpBarBg || !this.hpBarFill) return;

    const ratio = Math.max(this.hp / this.maxHp, 0);
    const barWidth = ENEMY_SIZE * 0.8;
    const barHeight = 6;
    const offsetY = ENEMY_SIZE * 0.7;
    const borderRadius = 3;

    // 背景条（带边框和圆角）
    this.hpBarBg
      .clear()
      .roundRect(-barWidth / 2 - 1, -barHeight / 2 - 1, barWidth + 2, barHeight + 2, borderRadius + 1)
      .fill({ color: 0x000000, alpha: 0.6 })
      .roundRect(-barWidth / 2, -barHeight / 2, barWidth, barHeight, borderRadius)
      .fill({ color: COLORS.UI_BG, alpha: 0.8 })
      .stroke({ width: 1, color: COLORS.UI_BORDER, alpha: 0.5 });
    this.hpBarBg.position.set(this.sprite.x, this.sprite.y - offsetY);

    // 前景条（根据血量变色）
    this.hpBarFill.clear();
    if (ratio > 0) {
      let hpColor = COLORS.ENEMY_DETAIL;
      if (ratio <= 0.3) {
        hpColor = COLORS.DANGER;
      } else if (ratio <= 0.6) {
        hpColor = 0xfb923c; // Orange
      }
      
      this.hpBarFill
        .roundRect(-barWidth / 2, -barHeight / 2, barWidth * ratio, barHeight, borderRadius)
        .fill({ color: hpColor, alpha: 0.95 })
        // 高光效果
        .roundRect(-barWidth / 2, -barHeight / 2, barWidth * ratio, barHeight * 0.4, borderRadius)
        .fill({ color: 0xffffff, alpha: 0.2 });
      this.hpBarFill.position.set(this.sprite.x, this.sprite.y - offsetY);
    }
  }
}


