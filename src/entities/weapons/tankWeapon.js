import { Graphics } from 'pixi.js';
import {
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
  BULLET_DAMAGE,
  WEAPON_MAX_HP,
  COLORS,
} from '../../constants';
import { soundManager } from '../../core/soundManager';
import { particleSystem } from '../../core/particleSystem';
import {
  createSoftShadow,
  getPerspectiveByY,
  updateShadowTransform,
} from '../../core/depthUtils';
import { TankBullet } from './tankBullet';
export { Enemy } from '../enemies/enemySprite';

/**
 * 绿色主力坦克武器：负责网格上的常规防御。
 * 逻辑较多（阴影、血条、子弹、受击等），因此在关键步骤添加说明。
 */
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
    
    this.recoil = 0; // 炮管后坐力位移
    this.idleAnimTime = 0; // 待机动画计时器

    // 底部柔和阴影（多层渐变）
    this.turret
      .roundRect(
        -TANK_SIZE / 2 + 4,
        -TANK_SIZE / 2 + 6,
        TANK_SIZE - 8,
        TANK_SIZE - 4,
        hullRadius,
      )
      .fill({ color: 0x000000, alpha: 0.35 })
      .roundRect(
        -TANK_SIZE / 2 + 6,
        -TANK_SIZE / 2 + 8,
        TANK_SIZE - 12,
        TANK_SIZE - 8,
        hullRadius * 0.8,
      )
      .fill({ color: 0x000000, alpha: 0.15 });

    // 上下两条履带（增强立体感）
    this.turret
      .roundRect(
        -TANK_SIZE / 2,
        -TANK_SIZE / 2,
        TANK_SIZE,
        trackHeight,
        trackHeight / 2,
      )
      .fill({ color: 0x0a0f1a })
      .stroke({ width: 1, color: COLORS.ALLY_BODY_DARK, alpha: 0.6 })
      .roundRect(
        -TANK_SIZE / 2,
        TANK_SIZE / 2 - trackHeight,
        TANK_SIZE,
        trackHeight,
        trackHeight / 2,
      )
      .fill({ color: 0x0a0f1a })
      .stroke({ width: 1, color: COLORS.ALLY_BODY_DARK, alpha: 0.6 });

    // 履带装甲板纹理
    const plateCount = 6;
    for (let i = 0; i < plateCount; i += 1) {
      const px = -TANK_SIZE / 2 + (TANK_SIZE / plateCount) * i + 4;
      this.turret
        .rect(px, -TANK_SIZE / 2 + 2, TANK_SIZE / plateCount - 2, trackHeight - 4)
        .fill({ color: 0x1e293b, alpha: 0.4 })
        .rect(px, TANK_SIZE / 2 - trackHeight + 2, TANK_SIZE / plateCount - 2, trackHeight - 4)
        .fill({ color: 0x1e293b, alpha: 0.4 });
    }

    // 履带轮子（增加高光）
    const wheelRadius = trackHeight * 0.32;
    const wheelCount = 4;
    for (let i = 0; i < wheelCount; i += 1) {
      const t = wheelCount === 1 ? 0.5 : i / (wheelCount - 1);
      const wx = -TANK_SIZE / 2 + TANK_SIZE * (0.18 + 0.64 * t);
      const wyTop = -TANK_SIZE / 2 + trackHeight / 2;
      const wyBottom = TANK_SIZE / 2 - trackHeight / 2;
      
      // 轮子主体
      this.turret
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
    this.turret
      .roundRect(
        -TANK_SIZE / 2 + 6,
        -TANK_SIZE / 2 + trackHeight * 0.6,
        TANK_SIZE - 12,
        TANK_SIZE - trackHeight * 1.2,
        hullRadius,
      )
      .fill({ color: COLORS.ALLY_BODY })
      .stroke({ width: 2.5, color: COLORS.ALLY_BODY_DARK, alpha: 1 });

    // 车体高光
    this.turret
      .roundRect(
        -TANK_SIZE / 2 + 8,
        -TANK_SIZE / 2 + trackHeight * 0.65,
        TANK_SIZE - 16,
        (TANK_SIZE - trackHeight * 1.2) * 0.3,
        hullRadius * 0.6,
      )
      .fill({ color: 0x0ea5e9, alpha: 0.15 });

    // 中央装甲与分割线（更多细节）
    this.turret
      .roundRect(
        -TANK_SIZE / 2 + 10,
        -TANK_SIZE / 2 + trackHeight * 0.8,
        TANK_SIZE - 20,
        TANK_SIZE - trackHeight * 1.6,
        hullRadius * 0.85,
      )
      .fill({ color: COLORS.ALLY_BODY_DARK, alpha: 0.6 })
      .stroke({ width: 1, color: COLORS.ALLY_DETAIL, alpha: 0.3 });

    // 横向装甲条纹
    const stripeCount = 3;
    for (let i = 0; i < stripeCount; i += 1) {
      const sy = -TANK_SIZE / 2 + trackHeight * 0.85 + i * ((TANK_SIZE - trackHeight * 1.7) / stripeCount);
      this.turret
        .rect(-TANK_SIZE / 2 + 12, sy, TANK_SIZE - 24, 1.5)
        .fill({ color: COLORS.ALLY_BODY_DARK, alpha: 0.7 });
    }

    // 前方大灯（增强辉光效果）
    const lightY = TANK_SIZE / 2 - trackHeight * 0.55;
    const lightRadius = TANK_SIZE * 0.08;
    this.turret
      .circle(-TANK_SIZE * 0.2, lightY, lightRadius * 1.6)
      .fill({ color: COLORS.ALLY_DETAIL, alpha: 0.12 })
      .circle(-TANK_SIZE * 0.2, lightY, lightRadius * 1.2)
      .fill({ color: COLORS.ALLY_DETAIL, alpha: 0.25 })
      .circle(-TANK_SIZE * 0.2, lightY, lightRadius)
      .fill({ color: COLORS.ALLY_DETAIL, alpha: 0.95 })
      .stroke({ width: 1, color: 0x0ea5e9, alpha: 0.8 })
      .circle(TANK_SIZE * 0.2, lightY, lightRadius * 1.6)
      .fill({ color: COLORS.ALLY_DETAIL, alpha: 0.12 })
      .circle(TANK_SIZE * 0.2, lightY, lightRadius * 1.2)
      .fill({ color: COLORS.ALLY_DETAIL, alpha: 0.25 })
      .circle(TANK_SIZE * 0.2, lightY, lightRadius)
      .fill({ color: COLORS.ALLY_DETAIL, alpha: 0.95 })
      .stroke({ width: 1, color: 0x0ea5e9, alpha: 0.8 });

    // 车体侧边防护条（增强立体感）
    this.turret
      .roundRect(
        -TANK_SIZE / 2 + 8,
        -TANK_SIZE / 2 + trackHeight * 0.55,
        6,
        TANK_SIZE - trackHeight * 1.1,
        3,
      )
      .fill({ color: 0x0f172a, alpha: 0.5 })
      .stroke({ width: 1, color: 0x334155, alpha: 0.4 })
      .roundRect(
        TANK_SIZE / 2 - 14,
        -TANK_SIZE / 2 + trackHeight * 0.55,
        6,
        TANK_SIZE - trackHeight * 1.1,
        3,
      )
      .fill({ color: 0x0f172a, alpha: 0.5 })
      .stroke({ width: 1, color: 0x334155, alpha: 0.4 });

    // 炮塔（多层结构）
    this.turret
      .circle(0, -TANK_SIZE * 0.06, turretRadius * 1.15)
      .fill({ color: 0x0ea5e9, alpha: 0.1 })
      .circle(0, -TANK_SIZE * 0.06, turretRadius * 1.05)
      .fill({ color: 0x15803d })
      .stroke({ width: 2, color: 0x0f172a, alpha: 0.6 })
      .circle(0, -TANK_SIZE * 0.06, turretRadius)
      .fill({ color: COLORS.ALLY_BARREL })
      .stroke({ width: 2, color: COLORS.ALLY_BODY_DARK, alpha: 1 });

    // 炮塔顶部细节（增加装甲板）
    this.turret
      .roundRect(
        -TANK_SIZE * 0.08,
        -TANK_SIZE * 0.16,
        TANK_SIZE * 0.16,
        TANK_SIZE * 0.32,
        TANK_SIZE * 0.04,
      )
      .fill({ color: 0x16a34a, alpha: 0.95 })
      .stroke({ width: 1, color: COLORS.ALLY_DETAIL, alpha: 0.5 });

    // 炮塔顶部指示灯
    this.turret
      .circle(0, -TANK_SIZE * 0.18, TANK_SIZE * 0.04)
      .fill({ color: COLORS.ALLY_DETAIL, alpha: 0.9 })
      .circle(0, -TANK_SIZE * 0.18, TANK_SIZE * 0.025)
      .fill({ color: 0xffffff, alpha: 0.8 });

    // 炮管（增强细节）
    const barrelLength = TANK_SIZE * 0.75;
    const barrelHalfHeight = TANK_SIZE * 0.09;
    this.barrel = new Graphics()
      .roundRect(0, -barrelHalfHeight, barrelLength, barrelHalfHeight * 2, barrelHalfHeight)
      .fill({ color: COLORS.ALLY_BARREL })
      .stroke({ width: 2, color: 0x0f172a, alpha: 0.6 })
      // 炮管中段装甲
      .roundRect(
        barrelLength * 0.35,
        -barrelHalfHeight * 0.6,
        barrelLength * 0.45,
        barrelHalfHeight * 1.2,
        barrelHalfHeight * 0.5,
      )
      .fill({ color: 0x16a34a, alpha: 0.9 })
      .stroke({ width: 1, color: COLORS.ALLY_DETAIL, alpha: 0.4 })
      // 炮口制退器
      .roundRect(
        barrelLength * 0.88,
        -barrelHalfHeight * 0.75,
        barrelLength * 0.12,
        barrelHalfHeight * 1.5,
        barrelHalfHeight * 0.3,
      )
      .fill({ color: 0x0f172a, alpha: 0.8 })
      .stroke({ width: 1, color: COLORS.ALLY_BODY, alpha: 0.6 })
      // 炮口光环
      .circle(barrelLength - barrelHalfHeight * 0.2, 0, barrelHalfHeight * 0.65)
      .fill({ color: COLORS.ALLY_DETAIL, alpha: 0.3 })
      .circle(barrelLength - barrelHalfHeight * 0.2, 0, barrelHalfHeight * 0.55)
      .fill({ color: COLORS.ALLY_DETAIL, alpha: 0.95 })
      .circle(barrelLength - barrelHalfHeight * 0.2, 0, barrelHalfHeight * 0.35)
      .fill({ color: 0xffffff, alpha: 0.7 });

    this.turret.addChild(this.barrel);

    // 坦克放置位置：由外部决定（网格中心）
    this.turret.x = x;
    this.turret.y = y;

    const world = this.app.world || this.app.stage;
    this.shadow = createSoftShadow(TANK_SIZE * 0.45);
    this.shadow.zIndex = 0;
    this.shadow.eventMode = 'none';
    world.addChild(this.shadow);
    
    // 选中高亮圈 - 霓虹多层效果（先添加，在turret下面）
    this.selectionRing = new Graphics()
      // 外层光晕
      .circle(0, 0, TANK_SIZE * 0.85)
      .stroke({ width: 2, color: COLORS.GOLD, alpha: 0.3 })
      // 中层光晕
      .circle(0, 0, TANK_SIZE * 0.75)
      .stroke({ width: 3, color: COLORS.GOLD, alpha: 0.6 })
      // 内层主光环
      .circle(0, 0, TANK_SIZE * 0.7)
      .stroke({ width: 4, color: COLORS.GOLD, alpha: 1 })
      // 内圈细节
      .circle(0, 0, TANK_SIZE * 0.65)
      .stroke({ width: 1, color: 0xfef3c7, alpha: 0.8 });
    this.selectionRing.x = x;
    this.selectionRing.y = y;
    this.selectionRing.visible = false;
    this.selectionRing.eventMode = 'none';
    world.addChild(this.selectionRing);
    
    world.addChild(this.turret);

    // 血条显示（单独添加到舞台，保持始终在武器上方且不随旋转缩放）
    this.hpBarBg = new Graphics();
    this.hpBarFill = new Graphics();
    world.addChild(this.hpBarBg);
    world.addChild(this.hpBarFill);

    this.updateHpBar();

    this.applyLevelStats();
    this.refreshDepthVisual();
    this.defaultAngle = Math.PI;
    this.turret.rotation = this.defaultAngle;
  }

  applyLevelStats() {
    // 根据等级调整子弹半径、颜色和射速
    if (this.level === 1) {
      this.fireInterval = TANK_FIRE_INTERVAL;
      this.bulletRadius = BULLET_RADIUS * 0.85;
      this.bulletSpeed = BULLET_SPEED;
      this.bulletColor = BULLET_COLOR;
    } else if (this.level === 2) {
      this.fireInterval = TANK_FIRE_INTERVAL * 0.8;
      this.bulletRadius = BULLET_RADIUS * 1.15;
      this.bulletSpeed = BULLET_SPEED * 1.15;
      this.bulletColor = COLORS.ALLY_DETAIL; // 亮色
    } else if (this.level === 3) {
      this.fireInterval = TANK_FIRE_INTERVAL * 0.6;
      this.bulletRadius = BULLET_RADIUS * 1.35;
      this.bulletSpeed = BULLET_SPEED * 1.3;
      this.bulletColor = 0xffffff; // 白色能量
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
    if (this.selectionRing) world.removeChild(this.selectionRing);
    if (this.hpBarBg) world.removeChild(this.hpBarBg);
    if (this.hpBarFill) world.removeChild(this.hpBarFill);
    world.removeChild(this.turret);
  }

  update(delta, deltaMS, enemies = []) {
    // 0) 待机动画：轻微呼吸效果
    this.idleAnimTime += deltaMS;
    const idlePulse = 1 + 0.02 * Math.sin(this.idleAnimTime * 0.001);
    
    // 1) 升级动画：短暂的呼吸缩放与高亮
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
    } else {
      // 应用待机呼吸效果
      this.visualScale = idlePulse;
      this.applyCombinedScale();
    }

    // 2) 受击闪烁
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= deltaMS;
      this.turret.alpha = 0.6 + 0.4 * Math.sin((this.hitFlashTimer / 120) * Math.PI * 4);
      if (this.hitFlashTimer <= 0) {
        this.turret.alpha = 1;
        this.hitFlashTimer = 0;
      }
    }

    // 3) 后坐力缓动回位
    if (this.recoil > 0) {
      this.recoil -= deltaMS * 0.1; // 恢复速度
      if (this.recoil < 0) this.recoil = 0;
      if (this.barrel) {
        this.barrel.x = -this.recoil;
      }
    }

    // 4) 同步血条和景深
    this.updateHpBar();
    this.refreshDepthVisual();

    if (!enemies.length) {
      this.turret.rotation = this.defaultAngle;
      return;
    }

    // 5) 寻找最近目标（按格子距离）
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

    if (!closest) {
      this.turret.rotation = this.defaultAngle;
      return;
    }

    // 6) 若目标在射程内则旋转炮塔并尝试射击
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
    } else {
      this.turret.rotation = this.defaultAngle;
    }

    // 7) 更新所有子弹并处理碰撞/销毁
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
          
          // 击中粒子效果
          particleSystem.createHitSpark(bullet.sprite.x, bullet.sprite.y, COLORS.ALLY_DETAIL);

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

    const bullet = new TankBullet(
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

    // 视觉效果：炮口火焰
    particleSystem.createMuzzleFlash(muzzleX, muzzleY, angle, COLORS.ALLY_DETAIL);
    // 物理效果：后坐力
    this.recoil = 6;
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
    const hpBarHeight = 6;
    const offsetY = TANK_SIZE * 0.7;
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
      let hpColor = COLORS.SUCCESS;
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

  applyCombinedScale() {
    const finalScale = this.perspectiveScale * this.visualScale;
    this.turret.scale.set(finalScale);
    if (this.selectionRing) {
      this.selectionRing.scale.set(finalScale);
    }
  }

  refreshDepthVisual() {
    const perspective = getPerspectiveByY(this.turret.y);
    this.perspectiveScale = perspective.scale;
    this.applyCombinedScale();
    updateShadowTransform(this.shadow, this.turret.x, this.turret.y, perspective);
  }
}

