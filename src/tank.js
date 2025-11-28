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
} from './constants';
import { soundManager } from './soundManager';

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

    // 坦克底盘和炮塔（略小于格子，使用圆角矩形 + 炮塔圆头，美观一些）
    const hullRadius = TANK_SIZE * 0.25;
    const turretRadius = TANK_SIZE * 0.18;

    this.turret = new Graphics()
      // 车体
      .roundRect(-TANK_SIZE / 2, -TANK_SIZE / 2, TANK_SIZE, TANK_SIZE, hullRadius)
      .fill({ color: TANK_COLOR })
      // 炮塔圆头
      .circle(0, -TANK_SIZE * 0.08, turretRadius)
      .fill({ color: TANK_BARREL_COLOR });

    // 炮管：从中心指向右侧，稍微细一点
    const barrelLength = TANK_SIZE * 0.75;
    const barrelHalfHeight = TANK_SIZE * 0.09;
    this.barrel = new Graphics()
      .roundRect(0, -barrelHalfHeight, barrelLength, barrelHalfHeight * 2, barrelHalfHeight)
      .fill({ color: TANK_BARREL_COLOR });

    this.turret.addChild(this.barrel);

    // 坦克放置位置：由外部决定（网格中心）
    this.turret.x = x;
    this.turret.y = y;

    const world = this.app.world || this.app.stage;
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
      this.turret.scale.set(pulse);
      if (this.selectionRing) {
        this.selectionRing.alpha = 0.6 + 0.4 * Math.sin(t * Math.PI);
      }
      if (this.upgradeFlashTimer <= 0) {
        this.turret.scale.set(1);
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
}


