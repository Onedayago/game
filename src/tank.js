import { Graphics } from 'pixi.js';
import {
  APP_WIDTH,
  APP_HEIGHT,
  TANK_SIZE,
  TANK_COLOR,
  TANK_BARREL_COLOR,
  TANK_FIRE_INTERVAL,
  TANK_ATTACK_RANGE_CELLS,
  CELL_SIZE,
  BULLET_SPEED,
  BULLET_RADIUS,
  BULLET_COLOR,
  ENEMY_SIZE,
  ENEMY_COLOR,
  BULLET_DAMAGE,
  WEAPON_MAX_HP,
  WORLD_WIDTH,
  ROCKET_BASE_COST,
  ROCKET_UPGRADE_BASE_COST,
  ROCKET_SELL_BASE_GAIN,
} from './constants';
import { soundManager } from './soundManager';
import {
  createSoftShadow,
  getPerspectiveByY,
  updateShadowTransform,
} from './depthUtils';

class Bullet {
  constructor(app, x, y, angle, radius, color, speed) {
    this.app = app;
    this.speed = speed;
    this.angle = angle;
    this.radius = radius;
    this.color = color;

    this.sprite = new Graphics()
      .circle(0, 0, this.radius)
      .fill({ color: this.color });

    this.sprite.x = x;
    this.sprite.y = y;

    const world = this.app.world || this.app.stage;
    world.addChild(this.sprite);
  }

  update(deltaMS) {
    // 按“像素/秒”计算子弹位移，保证在不同帧率下速度一致
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

export class Enemy {
  constructor(app, x, y) {
    this.app = app;
    this.sprite = new Graphics()
      .roundRect(-ENEMY_SIZE / 2, -ENEMY_SIZE / 2, ENEMY_SIZE, ENEMY_SIZE, ENEMY_SIZE * 0.25)
      .fill({ color: ENEMY_COLOR });

    this.sprite.x = x;
    this.sprite.y = y;

    const world = this.app.world || this.app.stage;
    world.addChild(this.sprite);
  }
}

export class TankWeapon {
  constructor(app, gridCol, gridRow, x, y) {
    this.app = app;
    this.gridCol = gridCol;
    this.gridRow = gridRow;
    this.bullets = [];
    this.timeSinceLastFire = 0;
    this.level = 1;
    this.maxLevel = 3;
    this.upgradeFlashTimer = 0; // 升级时的短暂特效计时（毫秒）

    // 武器血量
    this.maxHp = WEAPON_MAX_HP;
    this.hp = this.maxHp;
    this.hitFlashTimer = 0;

    // 射速与子弹属性（会随升级变化）
    this.fireInterval = TANK_FIRE_INTERVAL;
    this.bulletRadius = BULLET_RADIUS;
    this.bulletSpeed = BULLET_SPEED;
    this.bulletColor = BULLET_COLOR;
    this.perspectiveScale = 1;
    this.visualScale = 1;

    // 坦克底盘和炮塔（美化版：履带 + 轮子 + 车体 + 炮塔 + 灯光细节）
    const hullRadius = TANK_SIZE * 0.24;
    const turretRadius = TANK_SIZE * 0.18;
    const trackHeight = TANK_SIZE * 0.22;

    this.turret = new Graphics();

    // 底部柔和阴影
    this.turret
      .roundRect(
        -TANK_SIZE / 2 + 4,
        -TANK_SIZE / 2 + 6,
        TANK_SIZE - 8,
        TANK_SIZE - 4,
        hullRadius,
      )
      .fill({ color: 0x000000, alpha: 0.22 });

    // 上下两条履带
    this.turret
      .roundRect(
        -TANK_SIZE / 2,
        -TANK_SIZE / 2,
        TANK_SIZE,
        trackHeight,
        trackHeight / 2,
      )
      .fill({ color: 0x111827 })
      .roundRect(
        -TANK_SIZE / 2,
        TANK_SIZE / 2 - trackHeight,
        TANK_SIZE,
        trackHeight,
        trackHeight / 2,
      )
      .fill({ color: 0x111827 });

    // 履带轮子（暗灰小圆）
    const wheelRadius = trackHeight * 0.32;
    const wheelCount = 4;
    for (let i = 0; i < wheelCount; i += 1) {
      const t = wheelCount === 1 ? 0.5 : i / (wheelCount - 1);
      const wx = -TANK_SIZE / 2 + TANK_SIZE * (0.18 + 0.64 * t);
      const wyTop = -TANK_SIZE / 2 + trackHeight / 2;
      const wyBottom = TANK_SIZE / 2 - trackHeight / 2;
      this.turret.circle(wx, wyTop, wheelRadius).fill({ color: 0x1f2937 });
      this.turret.circle(wx, wyBottom, wheelRadius).fill({ color: 0x1f2937 });
    }

    // 主车体
    this.turret
      .roundRect(
        -TANK_SIZE / 2 + 6,
        -TANK_SIZE / 2 + trackHeight * 0.6,
        TANK_SIZE - 12,
        TANK_SIZE - trackHeight * 1.2,
        hullRadius,
      )
      .fill({ color: TANK_COLOR })
      .stroke({ width: 2, color: 0x15803d, alpha: 1 });

    // 中央装甲与分割线
    this.turret
      .roundRect(
        -TANK_SIZE / 2 + 10,
        -TANK_SIZE / 2 + trackHeight * 0.8,
        TANK_SIZE - 20,
        TANK_SIZE - trackHeight * 1.6,
        hullRadius * 0.85,
      )
      .fill({ color: 0x34d399, alpha: 0.75 })
      .rect(-TANK_SIZE / 2 + 12, 0, TANK_SIZE - 24, 2)
      .fill({ color: 0x14532d, alpha: 0.45 });

    // 前方灯光
    const lightY = TANK_SIZE / 2 - trackHeight * 0.55;
    const lightRadius = TANK_SIZE * 0.08;
    this.turret
      .circle(-TANK_SIZE * 0.2, lightY, lightRadius)
      .fill({ color: 0xfef08a, alpha: 0.9 })
      .circle(TANK_SIZE * 0.2, lightY, lightRadius)
      .fill({ color: 0xfef3c7, alpha: 0.9 });

    // 车体侧边防护条
    this.turret
      .roundRect(
        -TANK_SIZE / 2 + 8,
        -TANK_SIZE / 2 + trackHeight * 0.55,
        6,
        TANK_SIZE - trackHeight * 1.1,
        3,
      )
      .fill({ color: 0x0f172a, alpha: 0.4 })
      .roundRect(
        TANK_SIZE / 2 - 14,
        -TANK_SIZE / 2 + trackHeight * 0.55,
        6,
        TANK_SIZE - trackHeight * 1.1,
        3,
      )
      .fill({ color: 0x0f172a, alpha: 0.4 });

    // 炮塔圆头 + 舱盖
    this.turret
      .circle(0, -TANK_SIZE * 0.06, turretRadius * 1.05)
      .fill({ color: 0x15803d })
      .stroke({ width: 2, color: 0x0f172a, alpha: 0.6 })
      .circle(0, -TANK_SIZE * 0.06, turretRadius)
      .fill({ color: TANK_BARREL_COLOR })
      .stroke({ width: 2, color: 0x14532d, alpha: 1 })
      .roundRect(
        -TANK_SIZE * 0.08,
        -TANK_SIZE * 0.16,
        TANK_SIZE * 0.16,
        TANK_SIZE * 0.32,
        TANK_SIZE * 0.04,
      )
      .fill({ color: 0x16a34a, alpha: 0.92 });

    // 炮管：从中心指向右侧，添加亮条与炮口
    const barrelLength = TANK_SIZE * 0.75;
    const barrelHalfHeight = TANK_SIZE * 0.09;
    this.barrel = new Graphics()
      .roundRect(0, -barrelHalfHeight, barrelLength, barrelHalfHeight * 2, barrelHalfHeight)
      .fill({ color: TANK_BARREL_COLOR })
      .stroke({ width: 2, color: 0x0f172a, alpha: 0.5 })
      .roundRect(
        barrelLength * 0.35,
        -barrelHalfHeight * 0.55,
        barrelLength * 0.45,
        barrelHalfHeight * 1.1,
        barrelHalfHeight * 0.45,
      )
      .fill({ color: 0x16a34a, alpha: 0.85 })
      .circle(barrelLength - barrelHalfHeight * 0.2, 0, barrelHalfHeight * 0.55)
      .fill({ color: 0xfef08a, alpha: 0.95 });

    this.turret.addChild(this.barrel);

    // 坦克放置位置：由外部决定（网格中心）
    this.turret.x = x;
    this.turret.y = y;

    const world = this.app.world || this.app.stage;
    this.shadow = createSoftShadow(TANK_SIZE * 0.45);
    this.shadow.zIndex = 0;
    this.shadow.eventMode = 'none';
    world.addChild(this.shadow);
    world.addChild(this.turret);

    // 选中高亮圈
    this.selectionRing = new Graphics()
      .circle(0, 0, TANK_SIZE * 0.7)
      .stroke({ width: 3, color: 0xfacc15, alpha: 1 });
    this.selectionRing.visible = false;
    this.turret.addChildAt(this.selectionRing, 0);

    // 血条显示（单独添加到舞台，保持始终在武器上方且不随旋转缩放）
    this.hpBarBg = new Graphics();
    this.hpBarFill = new Graphics();
    world.addChild(this.hpBarBg);
    world.addChild(this.hpBarFill);

    this.updateHpBar();

    this.applyLevelStats();
    this.refreshDepthVisual();
  }

  applyLevelStats() {
    // 根据等级调整子弹半径、颜色和射速
    if (this.level === 1) {
      this.fireInterval = TANK_FIRE_INTERVAL;
      this.bulletRadius = BULLET_RADIUS;
      this.bulletSpeed = BULLET_SPEED;
      this.bulletColor = BULLET_COLOR;
    } else if (this.level === 2) {
      this.fireInterval = TANK_FIRE_INTERVAL * 0.8;
      this.bulletRadius = BULLET_RADIUS * 1.35;
      this.bulletSpeed = BULLET_SPEED * 1.15;
      this.bulletColor = 0x38bdf8; // 更亮的蓝色
    } else if (this.level === 3) {
      this.fireInterval = TANK_FIRE_INTERVAL * 0.6;
      this.bulletRadius = BULLET_RADIUS * 1.7;
      this.bulletSpeed = BULLET_SPEED * 1.3;
      this.bulletColor = 0xf97316; // 橙色，表现高等级
    }
  }

  setSelected(selected) {
    if (!this.selectionRing) return;
    this.selectionRing.visible = !!selected;
  }

  upgrade() {
    if (this.level >= this.maxLevel) return;
    this.level += 1;
    this.applyLevelStats();
    // 触发一次升级特效：轻微缩放与高亮
    this.upgradeFlashTimer = 260;
  }

  destroy() {
    this.bullets.forEach((b) => b.destroy());
    this.bullets = [];
    const world = this.app.world || this.app.stage;
    if (this.shadow) world.removeChild(this.shadow);
    if (this.hpBarBg) world.removeChild(this.hpBarBg);
    if (this.hpBarFill) world.removeChild(this.hpBarFill);
    world.removeChild(this.turret);
  }

  update(delta, deltaMS, enemies = []) {
    // 升级特效：短暂的呼吸缩放
    if (this.upgradeFlashTimer > 0) {
      this.upgradeFlashTimer -= deltaMS;
      const t = Math.max(0, 1 - this.upgradeFlashTimer / 260);
      const pulse = 1 + 0.18 * Math.sin(t * Math.PI); // 轻微放大再恢复
      this.visualScale = pulse;
      this.applyCombinedScale();
      if (this.selectionRing) {
        this.selectionRing.alpha = 0.6 + 0.4 * Math.sin(t * Math.PI);
      }
      if (this.upgradeFlashTimer <= 0) {
        this.visualScale = 1;
        this.applyCombinedScale();
        if (this.selectionRing) {
          this.selectionRing.alpha = 1;
        }
      }
    }

    // 受击闪烁
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= deltaMS;
      this.turret.alpha = 0.6 + 0.4 * Math.sin((this.hitFlashTimer / 120) * Math.PI * 4);
      if (this.hitFlashTimer <= 0) {
        this.turret.alpha = 1;
        this.hitFlashTimer = 0;
      }
    }

    // 每帧同步血条位置（固定在武器上方一格内，不随旋转）
    this.updateHpBar();
    this.refreshDepthVisual();

    if (!enemies.length) return;

    // 选择最近的敌人（按格子距离）
    let closest = null;
    let closestDistCells = Infinity;

    enemies.forEach((enemy) => {
      if (!enemy.sprite || enemy.gridCol == null || enemy.gridRow == null) return;
      const dxCells = enemy.gridCol - this.gridCol;
      const dyCells = enemy.gridRow - this.gridRow;
      const distCells = Math.hypot(dxCells, dyCells);
      if (distCells < closestDistCells) {
        closestDistCells = distCells;
        closest = enemy;
      }
    });

    if (!closest) return;

    // 若在攻击范围内，则转向并射击
    const inRange = closestDistCells <= TANK_ATTACK_RANGE_CELLS;
    const dx = closest.sprite.x - this.turret.x;
    const dy = closest.sprite.y - this.turret.y;
    const angle = Math.atan2(dy, dx);

    if (inRange) {
      // 炮塔转向敌人
      this.turret.rotation = angle;

      // 更新开火计时器，在范围内时才射击
      this.timeSinceLastFire += deltaMS;
      if (this.timeSinceLastFire >= this.fireInterval) {
        this.fire(angle);
        this.timeSinceLastFire = 0;
      }
    }

    // 更新子弹 & 碰撞检测
    const aliveBullets = [];

    this.bullets.forEach((bullet) => {
      bullet.update(deltaMS);

      // 若子弹飞出屏幕则直接销毁
      if (bullet.isOutOfBounds()) {
        bullet.destroy();
        return;
      }

      let hit = false;

      for (const enemy of enemies) {
        if (!enemy.sprite) continue;
        const dx = bullet.sprite.x - enemy.sprite.x;
        const dy = bullet.sprite.y - enemy.sprite.y;
        const distSq = dx * dx + dy * dy;

        const hitRadius = bullet.radius + ENEMY_SIZE * 0.4; // 简单的圆形碰撞半径
        if (distSq <= hitRadius * hitRadius) {
          // 击中：子弹销毁，敌人表现受击效果
          bullet.destroy();
          hit = true;
          if (typeof enemy.registerHit === 'function') {
            enemy.registerHit(BULLET_DAMAGE);
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

  fire(angle) {
    // 计算炮口世界坐标：以炮塔为原点，沿 x 轴方向末端
    const barrelLength = TANK_SIZE * 0.75;
    const muzzleX = this.turret.x + Math.cos(angle) * barrelLength;
    const muzzleY = this.turret.y + Math.sin(angle) * barrelLength;

    const bullet = new Bullet(
      this.app,
      muzzleX,
      muzzleY,
      angle,
      this.bulletRadius,
      this.bulletColor,
      this.bulletSpeed,
    );
    this.bullets.push(bullet);

    // 播放武器开火音效
    soundManager.playFire();
  }

  // 敌人子弹命中武器时调用，返回是否被摧毁
  registerHitFromEnemy(damage = 1) {
    if (this.hp <= 0) return false;

    this.hp -= damage;
    this.hitFlashTimer = 120;
    this.updateHpBar();

    if (this.hp <= 0) {
      return true;
    }
    return false;
  }

  updateHpBar() {
    if (!this.hpBarBg || !this.hpBarFill) return;
    const ratio = Math.max(this.hp / this.maxHp, 0);
    const hpBarWidth = TANK_SIZE * 0.9;
    const hpBarHeight = 5;
    const offsetY = TANK_SIZE * 0.7;

    // 背景条
    this.hpBarBg.clear()
      .rect(-hpBarWidth / 2, -hpBarHeight / 2, hpBarWidth, hpBarHeight)
      .fill({ color: 0x020617 });
    this.hpBarBg.position.set(this.turret.x, this.turret.y - offsetY);

    // 前景条
    this.hpBarFill.clear();
    if (ratio > 0) {
      this.hpBarFill
        .rect(-hpBarWidth / 2, -hpBarHeight / 2, hpBarWidth * ratio, hpBarHeight)
        .fill({ color: 0x22c55e });
      this.hpBarFill.position.set(this.turret.x, this.turret.y - offsetY);
    }
  }

  applyCombinedScale() {
    this.turret.scale.set(this.perspectiveScale * this.visualScale);
  }

  refreshDepthVisual() {
    const perspective = getPerspectiveByY(this.turret.y);
    this.perspectiveScale = perspective.scale;
    this.applyCombinedScale();
    updateShadowTransform(this.shadow, this.turret.x, this.turret.y, perspective);
  }
}

// 火箭塔：第二种武器，射速略慢、伤害更高、子弹为火箭外观
export class RocketTower {
  constructor(app, gridCol, gridRow, x, y) {
    this.app = app;
    this.gridCol = gridCol;
    this.gridRow = gridRow;
    this.bullets = [];
    this.timeSinceLastFire = 0;
    this.level = 1;
    this.maxLevel = 3;
    this.upgradeFlashTimer = 0;

    // 武器血量与受击效果
    this.maxHp = WEAPON_MAX_HP;
    this.hp = this.maxHp;
    this.hitFlashTimer = 0;

    // 射速与子弹属性（会随升级变化）
    this.fireInterval = TANK_FIRE_INTERVAL * 1.2; // 默认比坦克略慢
    this.bulletRadius = BULLET_RADIUS * 1.1;
    this.bulletSpeed = BULLET_SPEED * 1.05;
    this.bulletColor = 0xfbbf24; // 金色偏橙
    this.perspectiveScale = 1;
    this.visualScale = 1;

    // 塔身造型：竖直的导弹发射塔
    const baseWidth = TANK_SIZE * 0.7;
    const baseHeight = TANK_SIZE * 0.3;
    const towerWidth = TANK_SIZE * 0.34;
    const towerHeight = TANK_SIZE * 0.9;

    this.turret = new Graphics();

    // 阴影
    this.turret
      .roundRect(
        -baseWidth / 2,
        -TANK_SIZE / 2 + 8,
        baseWidth,
        TANK_SIZE - 10,
        TANK_SIZE * 0.18,
      )
      .fill({ color: 0x000000, alpha: 0.22 });

    // 底座
    this.turret
      .roundRect(
        -baseWidth / 2,
        TANK_SIZE / 2 - baseHeight,
        baseWidth,
        baseHeight,
        baseHeight * 0.6,
      )
      .fill({ color: 0x1f2937 })
      .stroke({ width: 2, color: 0x0f172a, alpha: 1 })
      .roundRect(
        -baseWidth / 2 + 6,
        TANK_SIZE / 2 - baseHeight * 0.75,
        baseWidth - 12,
        baseHeight * 0.45,
        baseHeight * 0.25,
      )
      .fill({ color: 0x475569, alpha: 0.9 });

    const stripeWidth = baseWidth / 5;
    for (let i = 0; i < 4; i += 1) {
      const sx = -baseWidth / 2 + 6 + i * stripeWidth;
      const color = i % 2 === 0 ? 0xfacc15 : 0x111827;
      this.turret
        .roundRect(
          sx,
          TANK_SIZE / 2 - baseHeight * 0.7,
          stripeWidth * 0.5,
          baseHeight * 0.4,
          stripeWidth * 0.2,
        )
        .fill({ color, alpha: 0.85 });
    }

    // 塔身
    this.turret
      .roundRect(
        -towerWidth / 2,
        -towerHeight / 2,
        towerWidth,
        towerHeight,
        towerWidth * 0.5,
      )
      .fill({ color: 0x334155 })
      .stroke({ width: 2, color: 0x0ea5e9, alpha: 1 });

    // 塔身发光窗口
    const windowWidth = towerWidth * 0.28;
    const windowHeight = towerHeight * 0.16;
    for (let i = 0; i < 3; i += 1) {
      const wy = -towerHeight * 0.3 + i * windowHeight * 1.25;
      this.turret
        .roundRect(-windowWidth / 2, wy, windowWidth, windowHeight, windowHeight * 0.4)
        .fill({ color: 0x38bdf8, alpha: 0.85 });
    }

    // 侧翼稳定器
    const finWidth = towerWidth * 0.28;
    const finHeight = towerHeight * 0.45;
    const finOffsetX = towerWidth * 0.75;
    this.turret
      .roundRect(
        -finOffsetX - finWidth / 2,
        -finHeight / 2,
        finWidth,
        finHeight,
        finWidth * 0.5,
      )
      .fill({ color: 0x7c2d12, alpha: 0.9 })
      .roundRect(
        finOffsetX - finWidth / 2,
        -finHeight / 2,
        finWidth,
        finHeight,
        finWidth * 0.5,
      )
      .fill({ color: 0x7c2d12, alpha: 0.9 });

    // 导轨 + 火箭顶部轮廓（不再额外画炮筒，仅保留火箭头）
    this.turret
      .roundRect(
        -towerWidth * 0.7,
        -towerHeight * 0.05,
        towerWidth * 1.4,
        towerHeight * 0.22,
        towerHeight * 0.08,
      )
      .fill({ color: 0x0f172a })
      .roundRect(
        -towerWidth * 0.26,
        -towerHeight * 0.44,
        towerWidth * 0.52,
        towerHeight * 0.38,
        towerWidth * 0.26,
      )
      .fill({ color: 0xf97316 });

    // 火箭头与顶端灯
    this.turret
      .circle(0, -towerHeight * 0.52, towerWidth * 0.22)
      .fill({ color: 0xfef3c7, alpha: 0.95 })
      .circle(0, -towerHeight * 0.6, towerWidth * 0.12)
      .fill({ color: 0xfef08a, alpha: 0.85 });

    // 位置
    this.turret.x = x;
    this.turret.y = y;

    const world = this.app.world || this.app.stage;
    this.shadow = createSoftShadow(TANK_SIZE * 0.5);
    this.shadow.eventMode = 'none';
    this.shadow.zIndex = 0;
    world.addChild(this.shadow);
    world.addChild(this.turret);

    // 选中高亮圈
    this.selectionRing = new Graphics()
      .circle(0, 0, TANK_SIZE * 0.7)
      .stroke({ width: 3, color: 0xf97316, alpha: 1 });
    this.selectionRing.visible = false;
    this.turret.addChildAt(this.selectionRing, 0);

    // 血条
    this.hpBarBg = new Graphics();
    this.hpBarFill = new Graphics();
    world.addChild(this.hpBarBg);
    world.addChild(this.hpBarFill);
    this.updateHpBar();

    this.applyLevelStats();
    this.refreshDepthVisual();
  }

  applyLevelStats() {
    // 根据等级调整火箭塔的射速 / 范围 / 伤害表现（子弹更大更快）
    if (this.level === 1) {
      this.fireInterval = TANK_FIRE_INTERVAL * 1.2;
      this.bulletRadius = BULLET_RADIUS * 1.2;
      this.bulletSpeed = BULLET_SPEED * 1.05;
      this.bulletColor = 0xfbbf24;
    } else if (this.level === 2) {
      this.fireInterval = TANK_FIRE_INTERVAL * 1.0;
      this.bulletRadius = BULLET_RADIUS * 1.45;
      this.bulletSpeed = BULLET_SPEED * 1.2;
      this.bulletColor = 0xf97316;
    } else if (this.level === 3) {
      this.fireInterval = TANK_FIRE_INTERVAL * 0.75;
      this.bulletRadius = BULLET_RADIUS * 1.8;
      this.bulletSpeed = BULLET_SPEED * 1.35;
      this.bulletColor = 0xef4444;
    }
  }

  setSelected(selected) {
    if (!this.selectionRing) return;
    this.selectionRing.visible = !!selected;
  }

  upgrade() {
    if (this.level >= this.maxLevel) return;
    this.level += 1;
    this.applyLevelStats();
    this.upgradeFlashTimer = 260;
  }

  destroy() {
    this.bullets.forEach((b) => b.destroy());
    this.bullets = [];
    const world = this.app.world || this.app.stage;
    if (this.shadow) world.removeChild(this.shadow);
    if (this.hpBarBg) world.removeChild(this.hpBarBg);
    if (this.hpBarFill) world.removeChild(this.hpBarFill);
    world.removeChild(this.turret);
  }

  update(delta, deltaMS, enemies = []) {
    // 升级特效
    if (this.upgradeFlashTimer > 0) {
      this.upgradeFlashTimer -= deltaMS;
      const t = Math.max(0, 1 - this.upgradeFlashTimer / 260);
      const pulse = 1 + 0.18 * Math.sin(t * Math.PI);
      this.visualScale = pulse;
      this.applyCombinedScale();
      if (this.selectionRing) {
        this.selectionRing.alpha = 0.6 + 0.4 * Math.sin(t * Math.PI);
      }
      if (this.upgradeFlashTimer <= 0) {
        this.visualScale = 1;
        this.applyCombinedScale();
        if (this.selectionRing) {
          this.selectionRing.alpha = 1;
        }
      }
    }

    // 受击闪烁
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= deltaMS;
      this.turret.alpha = 0.6 + 0.4 * Math.sin((this.hitFlashTimer / 120) * Math.PI * 4);
      if (this.hitFlashTimer <= 0) {
        this.turret.alpha = 1;
        this.hitFlashTimer = 0;
      }
    }

    // 血条
    this.updateHpBar();

    if (!enemies.length) return;

    // 火箭塔：优先打“射程内最远”的敌人，保持远程支援定位
    const maxRange = TANK_ATTACK_RANGE_CELLS + 1;
    let target = null;
    let targetDistCells = 0;

    enemies.forEach((enemy) => {
      if (!enemy.sprite || enemy.gridCol == null || enemy.gridRow == null) return;
      const dxCells = enemy.gridCol - this.gridCol;
      const dyCells = enemy.gridRow - this.gridRow;
      const distCells = Math.hypot(dxCells, dyCells);
      if (distCells <= maxRange && distCells > targetDistCells) {
        targetDistCells = distCells;
        target = enemy;
      }
    });

    if (!target) return;

    // 火箭塔保持固定姿态，不随目标旋转
    this.turret.rotation = 0;

    const inRange = targetDistCells <= maxRange;
    const dx = target.sprite.x - this.turret.x;
    const dy = target.sprite.y - this.turret.y;
    const angle = Math.atan2(dy, dx);

    if (inRange) {
      this.timeSinceLastFire += deltaMS;
      if (this.timeSinceLastFire >= this.fireInterval) {
        this.fire(angle);
        this.timeSinceLastFire = 0;
      }
    }

    // 子弹更新与碰撞（沿用 TankWeapon 的简单单体伤害逻辑）
    const aliveBullets = [];
    this.bullets.forEach((bullet) => {
      bullet.update(deltaMS);
      if (bullet.isOutOfBounds()) {
        bullet.destroy();
        return;
      }

      let hit = false;
      for (const enemy of enemies) {
        if (!enemy.sprite) continue;
        const bx = bullet.sprite.x;
        const by = bullet.sprite.y;
        const dx2 = bx - enemy.sprite.x;
        const dy2 = by - enemy.sprite.y;
        const distSq = dx2 * dx2 + dy2 * dy2;
        const hitRadius = bullet.radius + ENEMY_SIZE * 0.5;
        if (distSq <= hitRadius * hitRadius) {
          bullet.destroy();
          hit = true;
          if (typeof enemy.registerHit === 'function') {
            enemy.registerHit(BULLET_DAMAGE * 2); // 比普通坦克伤害更高
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

  fire(angle) {
    const barrelLength = TANK_SIZE * 0.7;
    const muzzleX = this.turret.x + Math.cos(angle) * barrelLength;
    const muzzleY = this.turret.y + Math.sin(angle) * barrelLength;

    const bullet = new Bullet(
      this.app,
      muzzleX,
      muzzleY,
      angle,
      this.bulletRadius,
      this.bulletColor,
      this.bulletSpeed,
    );
    this.bullets.push(bullet);

    soundManager.playFire();
  }

  registerHitFromEnemy(damage = 1) {
    if (this.hp <= 0) return false;
    this.hp -= damage;
    this.hitFlashTimer = 120;
    this.updateHpBar();
    if (this.hp <= 0) {
      return true;
    }
    return false;
  }

  updateHpBar() {
    if (!this.hpBarBg || !this.hpBarFill) return;
    const ratio = Math.max(this.hp / this.maxHp, 0);
    const hpBarWidth = TANK_SIZE * 0.9;
    const hpBarHeight = 5;
    const offsetY = TANK_SIZE * 0.75;

    this.hpBarBg.clear()
      .rect(-hpBarWidth / 2, -hpBarHeight / 2, hpBarWidth, hpBarHeight)
      .fill({ color: 0x020617 });
    this.hpBarBg.position.set(this.turret.x, this.turret.y - offsetY);

    this.hpBarFill.clear();
    if (ratio > 0) {
      this.hpBarFill
        .rect(-hpBarWidth / 2, -hpBarHeight / 2, hpBarWidth * ratio, hpBarHeight)
        .fill({ color: 0xf97316 });
      this.hpBarFill.position.set(this.turret.x, this.turret.y - offsetY);
    }
  }

  applyCombinedScale() {
    this.turret.scale.set(this.perspectiveScale * this.visualScale);
  }

  refreshDepthVisual() {
    const perspective = getPerspectiveByY(this.turret.y);
    this.perspectiveScale = perspective.scale;
    this.applyCombinedScale();
    updateShadowTransform(this.shadow, this.turret.x, this.turret.y, perspective);
  }
}


