import { Graphics } from 'pixi.js';
import {
  TANK_SIZE,
  LASER_FIRE_INTERVAL,
  LASER_ATTACK_RANGE_CELLS,
  CELL_SIZE,
  LASER_DAMAGE,
  LASER_BEAM_DURATION,
  ENEMY_SIZE,
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

/**
 * 激光塔武器：发射持续性激光束，快速攻击，中等伤害
 * 特点：绿色霓虹主题，持续激光束，高射速
 */
export class LaserTower {
  constructor(app, gridCol, gridRow, x, y) {
    this.app = app;
    this.gridCol = gridCol;
    this.gridRow = gridRow;
    this.laserBeams = []; // 存储当前激光束对象
    this.timeSinceLastFire = 0;
    this.level = 1;
    this.maxLevel = 3;
    this.upgradeFlashTimer = 0;

    // 武器血量
    this.maxHp = WEAPON_MAX_HP;
    this.hp = this.maxHp;
    this.hitFlashTimer = 0;

    // 射速与伤害属性（会随升级变化）
    this.fireInterval = LASER_FIRE_INTERVAL;
    this.damage = LASER_DAMAGE;
    this.beamDuration = LASER_BEAM_DURATION;
    this.perspectiveScale = 1;
    this.visualScale = 1;

    // 创建激光塔炮塔
    const towerRadius = TANK_SIZE * 0.20;
    const coreRadius = TANK_SIZE * 0.12;

    this.turret = new Graphics();
    
    this.recoil = 0;
    this.idleAnimTime = 0;

    // 底部阴影
    this.turret
      .roundRect(
        -TANK_SIZE / 2 + 4,
        -TANK_SIZE / 2 + 6,
        TANK_SIZE - 8,
        TANK_SIZE - 4,
        towerRadius,
      )
      .fill({ color: 0x000000, alpha: 0.35 });

    // 基座（六边形）
    const baseSize = TANK_SIZE * 0.4;
    const hexPoints = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      hexPoints.push(Math.cos(angle) * baseSize);
      hexPoints.push(Math.sin(angle) * baseSize);
    }
    this.turret
      .poly(hexPoints)
      .fill({ color: COLORS.LASER_BODY, alpha: 0.9 })
      .stroke({ width: 2, color: COLORS.LASER_DETAIL, alpha: 0.7 });

    // 内层六边形装饰
    const innerHexPoints = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + Math.PI / 6;
      innerHexPoints.push(Math.cos(angle) * baseSize * 0.6);
      innerHexPoints.push(Math.sin(angle) * baseSize * 0.6);
    }
    this.turret
      .poly(innerHexPoints)
      .fill({ color: 0x0a1a0f, alpha: 0.8 })
      .stroke({ width: 1, color: COLORS.LASER_DETAIL, alpha: 0.5 });

    // 中央能量核心（圆形发光）
    this.turret
      .circle(0, 0, coreRadius * 1.6)
      .fill({ color: COLORS.LASER_DETAIL, alpha: 0.3 })
      .circle(0, 0, coreRadius * 1.2)
      .fill({ color: COLORS.LASER_DETAIL, alpha: 0.5 })
      .circle(0, 0, coreRadius)
      .fill({ color: COLORS.LASER_BEAM, alpha: 0.95 });

    // 顶部霓虹细节点（6个小光点）
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const dotX = Math.cos(angle) * baseSize * 0.75;
      const dotY = Math.sin(angle) * baseSize * 0.75;
      this.turret
        .circle(dotX, dotY, 3)
        .fill({ color: COLORS.LASER_DETAIL, alpha: 0.8 });
    }

    // 激光发射器（4个小圆柱）
    const emitterDist = baseSize * 0.85;
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i;
      const emitX = Math.cos(angle) * emitterDist;
      const emitY = Math.sin(angle) * emitterDist;
      this.turret
        .roundRect(emitX - 2, emitY - 4, 4, 8, 2)
        .fill({ color: COLORS.LASER_BEAM, alpha: 0.7 });
    }

    // 底盘装饰线
    this.turret
      .circle(0, 0, TANK_SIZE * 0.48)
      .stroke({ width: 1, color: COLORS.LASER_BODY, alpha: 0.4 })
      .circle(0, 0, TANK_SIZE * 0.42)
      .stroke({ width: 1, color: COLORS.LASER_DETAIL, alpha: 0.3 });

    this.turret.x = x;
    this.turret.y = y;
    this.turret.eventMode = 'dynamic';
    this.turret.cursor = 'pointer';

    const world = this.app.world || this.app.stage;

    // 深度阴影
    this.shadow = createSoftShadow(TANK_SIZE * 0.5);
    this.shadow.eventMode = 'none';
    world.addChild(this.shadow);
    
    // 选中高亮圈 - 霓虹绿色多层效果（先添加，在turret下面）
    this.selectionRing = new Graphics()
      // 外层光晕
      .circle(0, 0, TANK_SIZE * 0.85)
      .stroke({ width: 2, color: COLORS.LASER_DETAIL, alpha: 0.3 })
      // 中层光晕
      .circle(0, 0, TANK_SIZE * 0.75)
      .stroke({ width: 3, color: COLORS.LASER_DETAIL, alpha: 0.6 })
      // 内层主光环
      .circle(0, 0, TANK_SIZE * 0.7)
      .stroke({ width: 4, color: COLORS.LASER_BODY, alpha: 1 })
      // 内圈细节
      .circle(0, 0, TANK_SIZE * 0.65)
      .stroke({ width: 1, color: COLORS.LASER_BEAM, alpha: 0.8 });
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

    this.updatePerspectiveScale(y);
    this.updateHpBar();
  }

  updatePerspectiveScale(y) {
    const perspective = getPerspectiveByY(y);
    this.perspectiveScale = perspective.scale;
    this.applyCombinedScale();
    updateShadowTransform(this.shadow, this.turret.x, this.turret.y, perspective);
  }

  applyCombinedScale() {
    const finalScale = this.perspectiveScale * this.visualScale;
    this.turret.scale.set(finalScale, finalScale);
    if (this.selectionRing) {
      this.selectionRing.scale.set(finalScale, finalScale);
    }
  }

  applyLevelUpgrades() {
    if (this.level === 2) {
      this.fireInterval = LASER_FIRE_INTERVAL * 0.8;
      this.damage = LASER_DAMAGE * 1.5;
      this.beamDuration = LASER_BEAM_DURATION * 1.2;
    } else if (this.level === 3) {
      this.fireInterval = LASER_FIRE_INTERVAL * 0.65;
      this.damage = LASER_DAMAGE * 2;
      this.beamDuration = LASER_BEAM_DURATION * 1.4;
    }
  }

  setSelected(selected) {
    if (!this.selectionRing) return;
    this.selectionRing.visible = !!selected;
  }

  upgrade() {
    if (this.level >= this.maxLevel) return;
    this.level += 1;
    this.applyLevelUpgrades();
    this.upgradeFlashTimer = 260;
  }

  takeDamage(dmg = 1) {
    this.hp -= dmg;
    this.hitFlashTimer = 120;
    this.updateHpBar();
    if (this.hp <= 0) {
      return true;
    }
    return false;
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

  destroy() {
    const world = this.app.world;
    if (this.shadow) world.removeChild(this.shadow);
    if (this.selectionRing) world.removeChild(this.selectionRing);
    if (this.hpBarBg) world.removeChild(this.hpBarBg);
    if (this.hpBarFill) world.removeChild(this.hpBarFill);
    
    // 清理所有激光束
    this.laserBeams.forEach(beam => {
      if (beam.graphics && world.children.includes(beam.graphics)) {
        world.removeChild(beam.graphics);
      }
    });
    this.laserBeams = [];
    
    world.removeChild(this.turret);
  }

  update(delta, deltaMS, enemies = []) {
    // 待机动画：轻微呼吸效果
    this.idleAnimTime += deltaMS;
    const idlePulse = 1 + 0.02 * Math.sin(this.idleAnimTime * 0.001);
    
    // 升级动画
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
    } else {
      this.visualScale = idlePulse;
      this.applyCombinedScale();
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

    // 更新激光束
    const world = this.app.world;
    this.laserBeams = this.laserBeams.filter(beam => {
      beam.timeLeft -= deltaMS;
      if (beam.timeLeft <= 0) {
        if (beam.graphics && world.children.includes(beam.graphics)) {
          world.removeChild(beam.graphics);
        }
        return false;
      }
      // 渐隐效果
      const alphaRatio = beam.timeLeft / this.beamDuration;
      beam.graphics.alpha = alphaRatio * 0.9;
      return true;
    });

    // 寻找目标并射击
    if (!enemies.length) {
      this.updateHpBar();
      return;
    }

    const maxRange = LASER_ATTACK_RANGE_CELLS;
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

    // 旋转炮塔指向目标
    if (target && target.sprite) {
      const dx = target.sprite.x - this.turret.x;
      const dy = target.sprite.y - this.turret.y;
      this.turret.rotation = Math.atan2(dy, dx);
    }

    // 发射激光
    this.timeSinceLastFire += deltaMS;
    if (target && this.timeSinceLastFire >= this.fireInterval) {
      this.timeSinceLastFire = 0;
      this.fireAt(target);
    }

    this.updateHpBar();
  }

  fireAt(target) {
    if (!target || !target.sprite) return;

    const dx = target.sprite.x - this.turret.x;
    const dy = target.sprite.y - this.turret.y;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    // 创建激光束图形
    const beamGraphics = new Graphics();
    
    // 外层光晕
    beamGraphics
      .moveTo(0, 0)
      .lineTo(dist, 0)
      .stroke({ width: 8, color: COLORS.LASER_DETAIL, alpha: 0.3 });
    
    // 中层光束
    beamGraphics
      .moveTo(0, 0)
      .lineTo(dist, 0)
      .stroke({ width: 5, color: COLORS.LASER_BEAM, alpha: 0.6 });
    
    // 核心激光
    beamGraphics
      .moveTo(0, 0)
      .lineTo(dist, 0)
      .stroke({ width: 2, color: 0xffffff, alpha: 0.95 });

    beamGraphics.x = this.turret.x;
    beamGraphics.y = this.turret.y;
    beamGraphics.rotation = angle;

    const world = this.app.world;
    world.addChild(beamGraphics);

    // 记录激光束对象
    this.laserBeams.push({
      graphics: beamGraphics,
      timeLeft: this.beamDuration,
    });

    // 对目标造成伤害
    if (target.registerHit) {
      target.registerHit(this.damage);
      // 如果敌人死亡，registerHit内部会处理爆炸效果
      if (target.hp > 0) {
        // 未死亡，显示击中火花
        particleSystem.createHitSpark(
          target.sprite.x,
          target.sprite.y,
          COLORS.LASER_BEAM
        );
      }
    }

    // 发射特效
    particleSystem.createMuzzleFlash(
      this.turret.x,
      this.turret.y,
      angle,
      COLORS.LASER_BEAM
    );

    soundManager.playFire();
  }

  updateHpBar() {
    if (!this.hpBarBg || !this.hpBarFill) return;
    
    const ratio = Math.max(0, this.hp / this.maxHp);
    const barWidth = TANK_SIZE * 0.9;
    const barHeight = 6;
    const offsetY = TANK_SIZE * 0.7;
    const borderRadius = 3;

    // 背景条（带边框和圆角）
    this.hpBarBg.clear()
      .roundRect(-barWidth / 2 - 1, -barHeight / 2 - 1, barWidth + 2, barHeight + 2, borderRadius + 1)
      .fill({ color: 0x000000, alpha: 0.6 })
      .roundRect(-barWidth / 2, -barHeight / 2, barWidth, barHeight, borderRadius)
      .fill({ color: COLORS.UI_BG, alpha: 0.8 })
      .stroke({ width: 1, color: COLORS.UI_BORDER, alpha: 0.5 });
    this.hpBarBg.position.set(this.turret.x, this.turret.y - offsetY);

    // 前景条（根据血量变色）
    this.hpBarFill.clear();
    if (ratio > 0) {
      let hpColor = COLORS.LASER_BODY;
      if (ratio <= 0.3) {
        hpColor = COLORS.DANGER;
      } else if (ratio <= 0.6) {
        hpColor = 0xfbbf24; // Amber
      }
      
      this.hpBarFill
        .roundRect(-barWidth / 2, -barHeight / 2, barWidth * ratio, barHeight, borderRadius)
        .fill({ color: hpColor, alpha: 0.95 })
        // 高光效果
        .roundRect(-barWidth / 2, -barHeight / 2, barWidth * ratio, barHeight * 0.4, borderRadius)
        .fill({ color: 0xffffff, alpha: 0.2 });
      this.hpBarFill.position.set(this.turret.x, this.turret.y - offsetY);
    }
  }
}

