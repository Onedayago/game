import { Graphics } from 'pixi.js';
import {
  APP_WIDTH,
  APP_HEIGHT,
  CELL_SIZE,
  TANK_SIZE,
  ENEMY_SIZE,
  ENEMY_COLOR,
  ENEMY_MOVE_SPEED,
  ENEMY_SPAWN_INTERVAL,
  ENEMY_MAX_HP,
  WEAPON_CONTAINER_HEIGHT,
  WEAPON_CONTAINER_MARGIN_BOTTOM,
  ENEMY_KILL_REWARD,
  ENEMY_ATTACK_RANGE_CELLS,
  ENEMY_FIRE_INTERVAL,
  ENEMY_BULLET_SPEED,
  ENEMY_BULLET_RADIUS,
  ENEMY_BULLET_COLOR,
  ENEMY_BULLET_DAMAGE,
  WORLD_WIDTH,
} from './constants';
import { soundManager } from './soundManager';
import {
  createSoftShadow,
  getPerspectiveByY,
  updateShadowTransform,
} from './depthUtils';

class EnemyBullet {
  constructor(app, x, y, angle) {
    this.app = app;
    this.angle = angle;
    this.speed = ENEMY_BULLET_SPEED;
    this.radius = ENEMY_BULLET_RADIUS;

    this.sprite = new Graphics()
      .circle(0, 0, this.radius)
      .fill({ color: ENEMY_BULLET_COLOR });

    this.sprite.x = x;
    this.sprite.y = y;

    const world = this.app.world || this.app.stage;
    world.addChild(this.sprite);
  }

  update(deltaMS) {
    const step = (this.speed * deltaMS) / 1000;
    const vx = Math.cos(this.angle) * step;
    const vy = Math.sin(this.angle) * step;
    this.sprite.x += vx;
    this.sprite.y += vy;
  }

  isOutOfBounds() {
    const { x, y } = this.sprite;
    const r = this.radius;
    // 横向用世界总宽度，允许子弹飞出当前视窗但仍在战场内
    return x < -r || x > WORLD_WIDTH + r || y < -r || y > APP_HEIGHT + r;
  }

  destroy() {
    const world = this.app.world || this.app.stage;
    world.removeChild(this.sprite);
  }
}

class EnemyTank {
  constructor(app, gridCol, gridRow) {
    this.app = app;
    this.gridCol = gridCol;
    this.gridRow = gridRow;
    this.perspectiveScale = 1;
    this.visualScale = 1;

    const centerX = gridCol * CELL_SIZE + CELL_SIZE / 2;
    const centerY = gridRow * CELL_SIZE + CELL_SIZE / 2;

    const hullRadius = ENEMY_SIZE * 0.25;
    const trackHeight = ENEMY_SIZE * 0.22;
    const turretRadius = ENEMY_SIZE * 0.22;
    const barrelLength = ENEMY_SIZE * 0.78;
    const barrelHalfHeight = ENEMY_SIZE * 0.08;

    this.sprite = new Graphics();

    // 阴影
    this.sprite
      .roundRect(
        -ENEMY_SIZE / 2 + 4,
        -ENEMY_SIZE / 2 + 6,
        ENEMY_SIZE - 8,
        ENEMY_SIZE - 6,
        hullRadius,
      )
      .fill({ color: 0x000000, alpha: 0.24 });

    // 上下履带
    this.sprite
      .roundRect(
        -ENEMY_SIZE / 2,
        -ENEMY_SIZE / 2,
        ENEMY_SIZE,
        trackHeight,
        trackHeight / 2,
      )
      .fill({ color: 0x0f172a })
      .roundRect(
        -ENEMY_SIZE / 2,
        ENEMY_SIZE / 2 - trackHeight,
        ENEMY_SIZE,
        trackHeight,
        trackHeight / 2,
      )
      .fill({ color: 0x0f172a });

    // 履带滚轮
    const wheelRadius = trackHeight * 0.32;
    const wheelCount = 4;
    for (let i = 0; i < wheelCount; i += 1) {
      const t = wheelCount === 1 ? 0.5 : i / (wheelCount - 1);
      const wx = -ENEMY_SIZE / 2 + ENEMY_SIZE * (0.18 + 0.64 * t);
      const wyTop = -ENEMY_SIZE / 2 + trackHeight / 2;
      const wyBottom = ENEMY_SIZE / 2 - trackHeight / 2;
      this.sprite.circle(wx, wyTop, wheelRadius).fill({ color: 0x1f2937 });
      this.sprite.circle(wx, wyBottom, wheelRadius).fill({ color: 0x1f2937 });
    }

    // 主车体
    this.sprite
      .roundRect(
        -ENEMY_SIZE / 2 + 6,
        -ENEMY_SIZE / 2 + trackHeight * 0.65,
        ENEMY_SIZE - 12,
        ENEMY_SIZE - trackHeight * 1.3,
        hullRadius,
      )
      .fill({ color: ENEMY_COLOR })
      .stroke({ width: 2, color: 0x7f1d1d, alpha: 1 });

    // 前装甲条与徽记
    this.sprite
      .roundRect(
        -ENEMY_SIZE / 2 + 10,
        -ENEMY_SIZE * 0.08,
        ENEMY_SIZE - 20,
        ENEMY_SIZE * 0.18,
        ENEMY_SIZE * 0.05,
      )
      .fill({ color: 0x991b1b, alpha: 0.9 })
      .circle(-ENEMY_SIZE * 0.18, -ENEMY_SIZE * 0.02, ENEMY_SIZE * 0.07)
      .fill({ color: 0xfda4af });

    // 炮塔与炮口
    this.sprite
      .circle(0, -ENEMY_SIZE * 0.05, turretRadius)
      .fill({ color: 0x7f1d1d })
      .stroke({ width: 2, color: 0x450a0a, alpha: 1 })
      .roundRect(
        -ENEMY_SIZE * 0.08,
        -ENEMY_SIZE * 0.18,
        ENEMY_SIZE * 0.16,
        ENEMY_SIZE * 0.36,
        ENEMY_SIZE * 0.06,
      )
      .fill({ color: 0xb91c1c, alpha: 0.95 })
      .roundRect(
        0,
        -barrelHalfHeight,
        barrelLength,
        barrelHalfHeight * 2,
        barrelHalfHeight,
      )
      .fill({ color: 0xf97316 });

    this.sprite.x = centerX;
    this.sprite.y = centerY;

    const world = this.app.world || this.app.stage;
    this.shadow = createSoftShadow(ENEMY_SIZE * 0.42);
    this.shadow.eventMode = 'none';
    this.shadow.zIndex = 0;
    world.addChild(this.shadow);
    world.addChild(this.sprite);

    this.targetCol = gridCol;
    this.targetRow = gridRow;

    // 血量与受击效果
    this.maxHp = ENEMY_MAX_HP;
    this.hp = this.maxHp;
    this.hitTimer = 0; // 被击中时的闪烁计时（毫秒）

    // 血条显示（单独添加到舞台，固定在敌人上方且不随旋转）
    this.hpBarBg = new Graphics();
    this.hpBarFill = new Graphics();
    world.addChild(this.hpBarBg);
    world.addChild(this.hpBarFill);

    this.updateHpBar();
    this.refreshDepthVisual();

    // 当前规划路径（按格子坐标序列）
    this.path = [];

    // 敌人子弹相关
    this.bullets = [];
    this.fireTimer = 0;
  }

  findPath(weaponContainer, allEnemies, allowThroughTowers = false) {
    const cols = Math.floor(WORLD_WIDTH / CELL_SIZE);
    const gridHeight =
      APP_HEIGHT - WEAPON_CONTAINER_HEIGHT - WEAPON_CONTAINER_MARGIN_BOTTOM * 2;
    const rows = Math.floor(gridHeight / CELL_SIZE);
    const minRow = 1; // 0 行用于金币显示，不允许敌人进入
    const maxRow = rows - 1;

    const startRow = Math.min(Math.max(this.gridRow, minRow), maxRow);
    const startKey = `${this.gridCol},${startRow}`;
    const queue = [];
    const visited = new Set();
    const parent = new Map();

    queue.push({ col: this.gridCol, row: startRow });
    visited.add(startKey);

    // 固定方向优先级：先尝试向右，其次上、下，最后左（轻微回退）
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

      // 目标：尽量到达最右侧任意一行
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

        // 第一轮寻路中把塔当作障碍；如果 allowThroughTowers=true 则忽略它们
        if (!allowThroughTowers && weaponContainer.isCellOccupied(nc, nr)) {
          continue;
        }

        // 敌人不能通过其他敌人所在的格子（避免重叠）
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

    // 回溯路径（不包含起点格子）
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
    const gridHeight =
      APP_HEIGHT - WEAPON_CONTAINER_HEIGHT - WEAPON_CONTAINER_MARGIN_BOTTOM * 2;
    const rows = Math.floor(gridHeight / CELL_SIZE);
    const minRow = 1;
    const maxRow = rows - 1;

    // 击中效果：短暂闪烁
    if (this.hitTimer > 0) {
      this.hitTimer -= deltaMS;
      // 简单闪烁：在 0.1 秒内降低透明度
      this.sprite.alpha = 0.4;
      if (this.hitTimer <= 0) {
        this.sprite.alpha = 1;
        this.hitTimer = 0;
      }
    }

    // 每帧同步血条位置（固定在敌人上方一格内，不随旋转）
    this.updateHpBar();

    // 敌人攻击：朝最近的武器坦克发射子弹
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
      const tx = closest.turret.x;
      const ty = closest.turret.y;
      const angle = Math.atan2(ty - sy, tx - sx);

      // 敌人炮管（整车朝向）指向当前攻击目标
      this.sprite.rotation = angle;

      this.fireTimer += deltaMS;
      if (this.fireTimer >= ENEMY_FIRE_INTERVAL) {
        this.fireTimer = 0;
        const muzzleX = sx + Math.cos(angle) * (ENEMY_SIZE * 0.6);
        const muzzleY = sy + Math.sin(angle) * (ENEMY_SIZE * 0.6);
        const bullet = new EnemyBullet(this.app, muzzleX, muzzleY, angle);
        this.bullets.push(bullet);
      }
    } else {
      // 不在攻击状态时恢复默认朝向
      this.sprite.rotation = 0;
      this.fireTimer = 0;
    }

    // 只有不在攻击状态时才继续移动
    if (!inAttackRange) {
      // 当前目标格子中心
      const targetX = this.targetCol * CELL_SIZE + CELL_SIZE / 2;
      const targetY = this.targetRow * CELL_SIZE + CELL_SIZE / 2;
      const dx = targetX - this.sprite.x;
      const dy = targetY - this.sprite.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 1) {
        // 同步网格坐标
        this.gridCol = this.targetCol;
        this.gridRow = Math.min(Math.max(this.targetRow, minRow), maxRow);

        // 到达最右边则标记为出界，外层会清理
        if (this.gridCol >= cols - 1) {
          this._finished = true;
          return;
        }

        // 先检查正前方（gridCol+1, gridRow）是否有障碍；只有真正被挡住才重新寻路
        const forwardCol = this.gridCol + 1;
        const forwardRow = this.gridRow;
        let blockedForward =
          forwardCol >= cols
          || forwardRow < minRow
          || forwardRow > maxRow;

        if (!blockedForward) {
          // 塔是否阻挡
          if (
            weaponContainer
            && typeof weaponContainer.isCellOccupied === 'function'
            && weaponContainer.isCellOccupied(forwardCol, forwardRow)
          ) {
            blockedForward = true;
          }

          // 其他敌人是否阻挡
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
          // 前方没有障碍，继续直走
          this.targetCol = forwardCol;
          this.targetRow = forwardRow;
          this.path = [];
        } else {
          // 碰到障碍时才重新寻路
          let path =
            this.findPath(weaponContainer, allEnemies, false)
            || this.findPath(weaponContainer, allEnemies, true);

          this.path = Array.isArray(path) ? path : [];

          if (this.path.length > 0) {
            const nextStep = this.path.shift();
            this.targetCol = nextStep.col;
            this.targetRow = nextStep.row;
          } else {
            // 理论上不会走到这里，兜底：继续尝试往右走（即使被挡，下一帧仍会再次尝试寻路）
            const nextCol = Math.min(this.gridCol + 1, cols - 1);
            this.targetCol = nextCol;
            this.targetRow = this.gridRow;
          }
        }
      }

      // 向目标格子中心移动（匀速）
      const moveTargetX = this.targetCol * CELL_SIZE + CELL_SIZE / 2;
      const moveTargetY = this.targetRow * CELL_SIZE + CELL_SIZE / 2;
      const moveDx = moveTargetX - this.sprite.x;
      const moveDy = moveTargetY - this.sprite.y;
      const moveDist = Math.hypot(moveDx, moveDy);

      if (moveDist > 0) {
        const step = (ENEMY_MOVE_SPEED * deltaMS) / 1000; // 像素/秒 * 秒
        const ratio = Math.min(step / moveDist, 1);
        this.sprite.x += moveDx * ratio;
        this.sprite.y += moveDy * ratio;
      }
    }

    // 更新敌人子弹并检测与武器的碰撞
    const aliveBullets = [];
    this.bullets.forEach((bullet) => {
      bullet.update(deltaMS);

      if (bullet.isOutOfBounds()) {
        bullet.destroy();
        return;
      }

      let hit = false;
      for (const weapon of weapons) {
        if (!weapon || !weapon.turret) continue;
        const dx = bullet.sprite.x - weapon.turret.x;
        const dy = bullet.sprite.y - weapon.turret.y;
        const distSq = dx * dx + dy * dy;
        const hitRadius = bullet.radius + TANK_SIZE * 0.4;
        if (distSq <= hitRadius * hitRadius) {
          bullet.destroy();
          hit = true;
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
    this.refreshDepthVisual();
  }

  destroy() {
    this.bullets.forEach((b) => b.destroy());
    this.bullets = [];
    const world = this.app.world || this.app.stage;
    if (this.shadow) world.removeChild(this.shadow);
    if (this.hpBarBg) world.removeChild(this.hpBarBg);
    if (this.hpBarFill) world.removeChild(this.hpBarFill);
    world.removeChild(this.sprite);
  }

  // 被子弹击中时调用，触发一次短暂的受击效果
  registerHit(damage = 1) {
    if (this.hp <= 0) return;

    this.hp -= damage;
    this.hitTimer = 120; // 毫秒
    this.updateHpBar();

    if (this.hp <= 0) {
      this._dead = true;
      // 敌人死亡音效
      soundManager.playEnemyDeath();
    }
  }

  updateHpBar() {
    if (!this.hpBarBg || !this.hpBarFill) return;

    const ratio = Math.max(this.hp / this.maxHp, 0);
    const barWidth = ENEMY_SIZE * 0.8;
    const barHeight = 6;
    const offsetY = ENEMY_SIZE * 0.7;

    // 背景条
    this.hpBarBg.clear()
      .rect(-barWidth / 2, -barHeight / 2, barWidth, barHeight)
      .fill({ color: 0x111827 });
    this.hpBarBg.position.set(this.sprite.x, this.sprite.y - offsetY);

    // 前景条
    this.hpBarFill.clear();
    if (ratio > 0) {
      this.hpBarFill
        .rect(-barWidth / 2, -barHeight / 2, barWidth * ratio, barHeight)
        .fill({ color: 0x22c55e });
      this.hpBarFill.position.set(this.sprite.x, this.sprite.y - offsetY);
    }
  }

  applyCombinedScale() {
    this.sprite.scale.set(this.perspectiveScale * this.visualScale);
  }

  refreshDepthVisual() {
    const perspective = getPerspectiveByY(this.sprite.y);
    this.perspectiveScale = perspective.scale;
    this.applyCombinedScale();
    updateShadowTransform(this.shadow, this.sprite.x, this.sprite.y, perspective);
  }
}

export class EnemyManager {
  constructor(app, weaponContainer, goldManager) {
    this.app = app;
    this.weaponContainer = weaponContainer;
    this.goldManager = goldManager;
    this.enemies = [];
    this.timeSinceLastSpawn = 0;
  }

  spawnEnemy() {
    const gridHeight =
      APP_HEIGHT - WEAPON_CONTAINER_HEIGHT - WEAPON_CONTAINER_MARGIN_BOTTOM * 2;
    const rows = Math.floor(gridHeight / CELL_SIZE);
    const minRow = 1;
    const maxRow = rows - 1;
    const playableRows = Math.max(0, maxRow - minRow + 1);

    // 在画布最左侧随机选择一行生成敌人坦克（不包含金币行）
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
      // 所有行前方都有敌人，占满则本轮不再生成
      return;
    }
    const col = 0;

    const enemy = new EnemyTank(this.app, col, row);
    this.enemies.push(enemy);
  }

  update(delta, deltaMS) {
    // 生成新敌人
    this.timeSinceLastSpawn += deltaMS;
    if (this.timeSinceLastSpawn >= ENEMY_SPAWN_INTERVAL) {
      this.spawnEnemy();
      this.timeSinceLastSpawn = 0;
    }

    // 更新现有敌人
    this.enemies.forEach((enemy) =>
      enemy.update(delta, deltaMS, this.weaponContainer, this.enemies),
    );

    // 清理到达终点或被标记完成 / 击杀的敌人，并处理金币奖励
    this.enemies = this.enemies.filter((enemy) => {
      if (enemy._finished || enemy._dead) {
        if (enemy._dead && this.goldManager) {
          // 击杀奖励金币
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


