import { Graphics } from 'pixi.js';
import {
  TANK_SIZE,
  TANK_FIRE_INTERVAL,
  TANK_ATTACK_RANGE_CELLS,
  BULLET_RADIUS,
  BULLET_SPEED,
  BULLET_DAMAGE,
  WEAPON_MAX_HP,
  ENEMY_SIZE,
  COLORS,
} from '../../constants';
import { soundManager } from '../../core/soundManager';
import { particleSystem } from '../../core/particleSystem';
import { HomingRocket } from './homingRocket';

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

    this.maxHp = WEAPON_MAX_HP;
    this.hp = this.maxHp;
    this.hitFlashTimer = 0;

    this.fireInterval = TANK_FIRE_INTERVAL * 1.2;
    this.bulletRadius = BULLET_RADIUS * 1.05;
    this.bulletSpeed = BULLET_SPEED * 1.1;
    this.bulletColor = COLORS.ROCKET_BULLET;
    this.visualScale = 1;

    const baseWidth = TANK_SIZE * 0.7;
    const baseHeight = TANK_SIZE * 0.3;
    const towerWidth = TANK_SIZE * 0.34;
    const towerHeight = TANK_SIZE * 0.9;

    this.turret = new Graphics();
    this.idleAnimTime = 0; // 待机动画计时器
    
    // 多层阴影
    this.turret
      .roundRect(
        -baseWidth / 2,
        -TANK_SIZE / 2 + 8,
        baseWidth,
        TANK_SIZE - 10,
        TANK_SIZE * 0.18,
      )
      .fill({ color: 0x000000, alpha: 0.35 })
      .roundRect(
        -baseWidth / 2 + 4,
        -TANK_SIZE / 2 + 10,
        baseWidth - 8,
        TANK_SIZE - 14,
        TANK_SIZE * 0.15,
      )
      .fill({ color: 0x000000, alpha: 0.15 });
    
    // 底座（增强细节）
    this.turret
      .roundRect(
        -baseWidth / 2,
        TANK_SIZE / 2 - baseHeight,
        baseWidth,
        baseHeight,
        baseHeight * 0.6,
      )
      .fill({ color: 0x1f2937 })
      .stroke({ width: 2.5, color: 0x0f172a, alpha: 1 })
      .roundRect(
        -baseWidth / 2 + 6,
        TANK_SIZE / 2 - baseHeight * 0.75,
        baseWidth - 12,
        baseHeight * 0.45,
        baseHeight * 0.25,
      )
      .fill({ color: 0x475569, alpha: 0.95 })
      .stroke({ width: 1, color: COLORS.ROCKET_DETAIL, alpha: 0.3 });

    // 底座装甲条纹（增强对比）
    const stripeWidth = baseWidth / 5;
    for (let i = 0; i < 4; i += 1) {
      const sx = -baseWidth / 2 + 6 + i * stripeWidth;
      const color = i % 2 === 0 ? COLORS.ROCKET_DETAIL : 0x111827;
      this.turret
        .roundRect(
          sx,
          TANK_SIZE / 2 - baseHeight * 0.7,
          stripeWidth * 0.5,
          baseHeight * 0.4,
          stripeWidth * 0.2,
        )
        .fill({ color, alpha: 0.9 })
        .stroke({ width: 0.5, color: 0x000000, alpha: 0.5 });
    }

    // 主塔身（多层结构）
    this.turret
      .roundRect(
        -towerWidth / 2 - 2,
        -towerHeight / 2 - 2,
        towerWidth + 4,
        towerHeight + 4,
        towerWidth * 0.5,
      )
      .fill({ color: COLORS.ROCKET_BODY, alpha: 0.15 })
      .roundRect(
        -towerWidth / 2,
        -towerHeight / 2,
        towerWidth,
        towerHeight,
        towerWidth * 0.5,
      )
      .fill({ color: 0x334155 })
      .stroke({ width: 2.5, color: COLORS.ALLY_BODY, alpha: 1 });

    // 塔身高光
    this.turret
      .roundRect(
        -towerWidth / 2 + 3,
        -towerHeight / 2 + 3,
        towerWidth - 6,
        towerHeight * 0.25,
        towerWidth * 0.4,
      )
      .fill({ color: 0x475569, alpha: 0.3 });

    // 观察窗（增强辉光）
    const windowWidth = towerWidth * 0.28;
    const windowHeight = towerHeight * 0.16;
    for (let i = 0; i < 3; i += 1) {
      const wy = -towerHeight * 0.3 + i * windowHeight * 1.25;
      this.turret
        .roundRect(-windowWidth / 2 - 1, wy - 1, windowWidth + 2, windowHeight + 2, windowHeight * 0.5)
        .fill({ color: COLORS.ALLY_DETAIL, alpha: 0.2 })
        .roundRect(-windowWidth / 2, wy, windowWidth, windowHeight, windowHeight * 0.4)
        .fill({ color: COLORS.ALLY_DETAIL, alpha: 0.95 })
        .stroke({ width: 1, color: 0x0ea5e9, alpha: 0.8 });
    }

    // 侧翼装甲（增强立体感）
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
      .fill({ color: COLORS.ROCKET_BODY, alpha: 0.95 })
      .stroke({ width: 1.5, color: 0x7c2d12, alpha: 0.8 })
      .roundRect(
        finOffsetX - finWidth / 2,
        -finHeight / 2,
        finWidth,
        finHeight,
        finWidth * 0.5,
      )
      .fill({ color: COLORS.ROCKET_BODY, alpha: 0.95 })
      .stroke({ width: 1.5, color: 0x7c2d12, alpha: 0.8 });

    // 发射导轨
    this.turret
      .roundRect(
        -towerWidth * 0.7,
        -towerHeight * 0.05,
        towerWidth * 1.4,
        towerHeight * 0.22,
        towerHeight * 0.08,
      )
      .fill({ color: 0x0f172a })
      .stroke({ width: 1, color: 0x334155, alpha: 0.6 });

    // 火箭弹头（增强细节）
    this.turret
      .roundRect(
        -towerWidth * 0.26,
        -towerHeight * 0.44,
        towerWidth * 0.52,
        towerHeight * 0.38,
        towerWidth * 0.26,
      )
      .fill({ color: COLORS.ROCKET_BULLET })
      .stroke({ width: 1.5, color: COLORS.ROCKET_BODY, alpha: 0.8 })
      // 弹头条纹
      .rect(-towerWidth * 0.22, -towerHeight * 0.35, towerWidth * 0.44, 2)
      .fill({ color: 0x000000, alpha: 0.4 })
      .rect(-towerWidth * 0.22, -towerHeight * 0.25, towerWidth * 0.44, 2)
      .fill({ color: 0x000000, alpha: 0.4 });

    // 顶部雷达/天线（多层光环）
    this.turret
      .circle(0, -towerHeight * 0.52, towerWidth * 0.28)
      .fill({ color: COLORS.ROCKET_DETAIL, alpha: 0.15 })
      .circle(0, -towerHeight * 0.52, towerWidth * 0.22)
      .fill({ color: 0xfef3c7, alpha: 0.95 })
      .stroke({ width: 1, color: COLORS.ROCKET_BODY, alpha: 0.6 })
      .circle(0, -towerHeight * 0.6, towerWidth * 0.14)
      .fill({ color: COLORS.ROCKET_DETAIL, alpha: 0.3 })
      .circle(0, -towerHeight * 0.6, towerWidth * 0.12)
      .fill({ color: 0xfef08a, alpha: 0.95 })
      .circle(0, -towerHeight * 0.6, towerWidth * 0.06)
      .fill({ color: 0xffffff, alpha: 0.8 });

    this.turret.x = x;
    this.turret.y = y;

    const world = this.app.world || this.app.stage;
    // 选中高亮圈 - 霓虹多层效果（紫色主题）（先添加，在turret下面）
    this.selectionRing = new Graphics()
      // 外层光晕
      .circle(0, 0, TANK_SIZE * 0.85)
      .stroke({ width: 2, color: COLORS.ROCKET_DETAIL, alpha: 0.3 })
      // 中层光晕
      .circle(0, 0, TANK_SIZE * 0.75)
      .stroke({ width: 3, color: COLORS.ROCKET_DETAIL, alpha: 0.6 })
      // 内层主光环
      .circle(0, 0, TANK_SIZE * 0.7)
      .stroke({ width: 4, color: COLORS.ROCKET_BULLET, alpha: 1 })
      // 内圈细节
      .circle(0, 0, TANK_SIZE * 0.65)
      .stroke({ width: 1, color: 0xfbbf24, alpha: 0.8 });
    this.selectionRing.x = x;
    this.selectionRing.y = y;
    this.selectionRing.visible = false;
    this.selectionRing.eventMode = 'none';
    world.addChild(this.selectionRing);
    
    world.addChild(this.turret);

    this.hpBarBg = new Graphics();
    this.hpBarFill = new Graphics();
    world.addChild(this.hpBarBg);
    world.addChild(this.hpBarFill);

    this.updateHpBar();
    this.applyLevelStats();
  }

  applyLevelStats() {
    if (this.level === 1) {
    this.fireInterval = TANK_FIRE_INTERVAL * 1.2;
    this.bulletRadius = BULLET_RADIUS * 1.05;
      this.bulletSpeed = BULLET_SPEED * 1.1;
    } else if (this.level === 2) {
      this.fireInterval = TANK_FIRE_INTERVAL * 1.0;
      this.bulletRadius = BULLET_RADIUS * 1.25;
      this.bulletSpeed = BULLET_SPEED * 1.25;
    } else if (this.level === 3) {
      this.fireInterval = TANK_FIRE_INTERVAL * 0.8;
      this.bulletRadius = BULLET_RADIUS * 1.45;
      this.bulletSpeed = BULLET_SPEED * 1.35;
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
    if (this.selectionRing) world.removeChild(this.selectionRing);
    if (this.hpBarBg) world.removeChild(this.hpBarBg);
    if (this.hpBarFill) world.removeChild(this.hpBarFill);
    world.removeChild(this.turret);
  }

  update(delta, deltaMS, enemies = []) {
    // 待机动画：轻微呼吸效果
    this.idleAnimTime += deltaMS;
    const idlePulse = 1 + 0.025 * Math.sin(this.idleAnimTime * 0.0012);
    
    if (this.upgradeFlashTimer > 0) {
      this.upgradeFlashTimer -= deltaMS;
      const t = Math.max(0, 1 - this.upgradeFlashTimer / 260);
      const pulse = 1 + 0.18 * Math.sin(t * Math.PI);
      this.visualScale = pulse;
      this.turret.scale.set(this.visualScale);
      if (this.selectionRing) {
        this.selectionRing.alpha = 0.6 + 0.4 * Math.sin(t * Math.PI);
        this.selectionRing.scale.set(this.visualScale);
      }
      if (this.upgradeFlashTimer <= 0) {
        this.visualScale = 1;
        this.turret.scale.set(this.visualScale);
        if (this.selectionRing) {
          this.selectionRing.alpha = 1;
          this.selectionRing.scale.set(this.visualScale);
        }
      }
    } else {
      // 应用待机呼吸效果
      this.visualScale = idlePulse;
      this.turret.scale.set(this.visualScale);
      if (this.selectionRing) {
        this.selectionRing.scale.set(this.visualScale);
      }
    }

    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= deltaMS;
      this.turret.alpha = 0.6 + 0.4 * Math.sin((this.hitFlashTimer / 120) * Math.PI * 4);
      if (this.hitFlashTimer <= 0) {
        this.turret.alpha = 1;
        this.hitFlashTimer = 0;
      }
    }

    this.updateHpBar();
    const enemyList = Array.isArray(enemies) ? enemies : [];
    const aliveBullets = [];
    this.bullets.forEach((rocket) => {
      rocket.update(deltaMS);
      if (rocket.isOutOfBounds()) {
        rocket.destroy();
        return;
      }

      let hit = false;
      for (const enemy of enemyList) {
        if (!enemy.sprite) continue;
        const dx2 = rocket.sprite.x - enemy.sprite.x;
        const dy2 = rocket.sprite.y - enemy.sprite.y;
        const distSq = dx2 * dx2 + dy2 * dy2;
        const hitRadius = rocket.radius + ENEMY_SIZE * 0.5;
        if (distSq <= hitRadius * hitRadius) {
          particleSystem.createExplosion(rocket.sprite.x, rocket.sprite.y, rocket.color, 8);
          if (typeof enemy.registerHit === 'function') {
            enemy.registerHit(rocket.damage);
          }
          rocket.destroy();
          hit = true;
          break;
        }
      }

      if (!hit) {
        aliveBullets.push(rocket);
      }
    });

    this.bullets = aliveBullets;

    if (!enemyList.length) {
      return;
    }

    const maxRange = TANK_ATTACK_RANGE_CELLS + 1;
    let target = null;
    let targetDistCells = 0;

    enemyList.forEach((enemy) => {
      if (!enemy.sprite || enemy.gridCol == null || enemy.gridRow == null) return;
      const dxCells = enemy.gridCol - this.gridCol;
      const dyCells = enemy.gridRow - this.gridRow;
      const distCells = Math.hypot(dxCells, dyCells);
      if (distCells <= maxRange && distCells > targetDistCells) {
        targetDistCells = distCells;
        target = enemy;
      }
    });

    if (!target) {
      return;
    }

    const inRange = targetDistCells <= maxRange;
    const dx = target.sprite.x - this.turret.x;
    const dy = target.sprite.y - this.turret.y;
    const angle = Math.atan2(dy, dx);

    if (inRange) {
      this.timeSinceLastFire += deltaMS;
      if (this.timeSinceLastFire >= this.fireInterval) {
        this.fire(angle, target);
        this.timeSinceLastFire = 0;
      }
    }
  }

  fire(angle, target) {
    const barrelLength = TANK_SIZE * 0.7;
    const muzzleX = this.turret.x + Math.cos(angle) * barrelLength;
    const muzzleY = this.turret.y + Math.sin(angle) * barrelLength;

    const rocket = new HomingRocket(this.app, muzzleX, muzzleY, angle, target, {
      speed: this.bulletSpeed,
      radius: this.bulletRadius,
      color: this.bulletColor,
      damage: BULLET_DAMAGE * 2 + (this.level - 1),
      turnRate: Math.PI * (1.1 + this.level * 0.2),
    });

    this.bullets.push(rocket);
    particleSystem.createMuzzleFlash(muzzleX, muzzleY, angle, COLORS.ROCKET_BULLET);
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
    const hpBarHeight = 6;
    const offsetY = TANK_SIZE * 0.75;
    const borderRadius = 3;

    // 背景条（带边框和圆角）
    this.hpBarBg.clear()
      .roundRect(-hpBarWidth / 2 - 1, -hpBarHeight / 2 - 1, hpBarWidth + 2, hpBarHeight + 2, borderRadius + 1)
      .fill({ color: 0x000000, alpha: 0.6 })
      .roundRect(-hpBarWidth / 2, -hpBarHeight / 2, hpBarWidth, hpBarHeight, borderRadius)
      .fill({ color: COLORS.UI_BG, alpha: 0.8 })
      .stroke({ width: 1, color: COLORS.UI_BORDER, alpha: 0.5 });
    this.hpBarBg.position.set(this.turret.x, this.turret.y - offsetY);

    // 前景条（根据血量变色）
    this.hpBarFill.clear();
    if (ratio > 0) {
      let hpColor = COLORS.ROCKET_BULLET;
      if (ratio <= 0.3) {
        hpColor = COLORS.DANGER;
      } else if (ratio <= 0.6) {
        hpColor = 0xfbbf24; // Amber
      }
      
      this.hpBarFill
        .roundRect(-hpBarWidth / 2, -hpBarHeight / 2, hpBarWidth * ratio, hpBarHeight, borderRadius)
        .fill({ color: hpColor, alpha: 0.95 })
        // 高光效果
        .roundRect(-hpBarWidth / 2, -hpBarHeight / 2, hpBarWidth * ratio, hpBarHeight * 0.4, borderRadius)
        .fill({ color: 0xffffff, alpha: 0.2 });
      this.hpBarFill.position.set(this.turret.x, this.turret.y - offsetY);
    }
  }
}


