import { Graphics } from 'pixi.js';
import { TANK_SIZE, COLORS, TANK_COLOR, TANK_BARREL_COLOR } from '../constants';

/**
 * 武器图标渲染器
 * 统一管理所有武器图标的绘制逻辑，避免代码重复
 */
export class WeaponIconRenderer {
  /**
   * 创建坦克图标
   * @param {boolean} isGhost - 是否为拖拽幽灵（透明度降低）
   */
  static createTankIcon(isGhost = false) {
    const hullRadius = TANK_SIZE * 0.24;
    const turretRadius = TANK_SIZE * 0.18;
    const barrelLength = TANK_SIZE * 0.75;
    const barrelHalfHeight = TANK_SIZE * 0.09;
    const trackHeight = TANK_SIZE * 0.22;

    const icon = new Graphics();
    const alpha = isGhost ? 0.9 : 1;

    // 阴影
    icon
      .roundRect(
        -TANK_SIZE / 2 + 4,
        -TANK_SIZE / 2 + 6,
        TANK_SIZE - 8,
        TANK_SIZE - 4,
        hullRadius
      )
      .fill({ color: 0x000000, alpha: 0.22 });

    // 上下履带
    icon
      .roundRect(-TANK_SIZE / 2, -TANK_SIZE / 2, TANK_SIZE, trackHeight, trackHeight / 2)
      .fill({ color: 0x111827 })
      .roundRect(
        -TANK_SIZE / 2,
        TANK_SIZE / 2 - trackHeight,
        TANK_SIZE,
        trackHeight,
        trackHeight / 2
      )
      .fill({ color: 0x111827 });

    // 轮子
    const wheelRadius = trackHeight * 0.32;
    const wheelCount = 4;
    for (let i = 0; i < wheelCount; i += 1) {
      const t = wheelCount === 1 ? 0.5 : i / (wheelCount - 1);
      const wx = -TANK_SIZE / 2 + TANK_SIZE * (0.18 + 0.64 * t);
      const wyTop = -TANK_SIZE / 2 + trackHeight / 2;
      const wyBottom = TANK_SIZE / 2 - trackHeight / 2;
      icon.circle(wx, wyTop, wheelRadius).fill({ color: 0x1f2937 });
      icon.circle(wx, wyBottom, wheelRadius).fill({ color: 0x1f2937 });
    }

    // 主车体
    icon
      .roundRect(
        -TANK_SIZE / 2 + 6,
        -TANK_SIZE / 2 + trackHeight * 0.6,
        TANK_SIZE - 12,
        TANK_SIZE - trackHeight * 1.2,
        hullRadius
      )
      .fill({ color: TANK_COLOR, alpha })
      .stroke({ width: 2, color: 0x15803d, alpha });

    // 装甲亮面与分割线
    icon
      .roundRect(
        -TANK_SIZE / 2 + 10,
        -TANK_SIZE / 2 + trackHeight * 0.8,
        TANK_SIZE - 20,
        TANK_SIZE - trackHeight * 1.6,
        hullRadius * 0.85
      )
      .fill({ color: COLORS.ALLY_BODY_DARK, alpha: 0.75 * alpha })
      .rect(-TANK_SIZE / 2 + 12, 0, TANK_SIZE - 24, 2)
      .fill({ color: COLORS.ALLY_BODY_DARK, alpha: 0.45 * alpha });

    // 前灯
    const lightY = TANK_SIZE / 2 - trackHeight * 0.55;
    const lightRadius = TANK_SIZE * 0.08;
    icon
      .circle(-TANK_SIZE * 0.2, lightY, lightRadius)
      .fill({ color: COLORS.ALLY_DETAIL, alpha: 0.9 * alpha })
      .circle(TANK_SIZE * 0.2, lightY, lightRadius)
      .fill({ color: COLORS.ALLY_DETAIL, alpha: 0.9 * alpha });

    // 侧边防护条
    icon
      .roundRect(
        -TANK_SIZE / 2 + 8,
        -TANK_SIZE / 2 + trackHeight * 0.55,
        6,
        TANK_SIZE - trackHeight * 1.1,
        3
      )
      .fill({ color: 0x0f172a, alpha: 0.4 })
      .roundRect(
        TANK_SIZE / 2 - 14,
        -TANK_SIZE / 2 + trackHeight * 0.55,
        6,
        TANK_SIZE - trackHeight * 1.1,
        3
      )
      .fill({ color: 0x0f172a, alpha: 0.4 });

    // 炮塔 + 炮管
    icon
      .circle(0, -TANK_SIZE * 0.06, turretRadius * 1.05)
      .fill({ color: COLORS.ALLY_BARREL, alpha })
      .stroke({ width: 2, color: 0x0f172a, alpha: 0.6 * alpha })
      .circle(0, -TANK_SIZE * 0.06, turretRadius)
      .fill({ color: TANK_BARREL_COLOR, alpha })
      .stroke({ width: 2, color: COLORS.ALLY_BODY_DARK, alpha })
      .roundRect(
        -TANK_SIZE * 0.08,
        -TANK_SIZE * 0.16,
        TANK_SIZE * 0.16,
        TANK_SIZE * 0.32,
        TANK_SIZE * 0.04
      )
      .fill({ color: COLORS.ALLY_DETAIL, alpha: 0.92 * alpha })
      .roundRect(0, -barrelHalfHeight, barrelLength, barrelHalfHeight * 2, barrelHalfHeight)
      .fill({ color: TANK_BARREL_COLOR, alpha })
      .stroke({ width: 2, color: 0x0f172a, alpha: 0.5 * alpha })
      .roundRect(
        barrelLength * 0.35,
        -barrelHalfHeight * 0.55,
        barrelLength * 0.45,
        barrelHalfHeight * 1.1,
        barrelHalfHeight * 0.45
      )
      .fill({ color: COLORS.ALLY_BODY, alpha: 0.85 * alpha })
      .circle(barrelLength - barrelHalfHeight * 0.2, 0, barrelHalfHeight * 0.55)
      .fill({ color: COLORS.ALLY_DETAIL, alpha: 0.95 * alpha });

    icon.scale.x = -1;
    if (isGhost) {
      icon.rotation = Math.PI;
    }

    return icon;
  }

  /**
   * 创建火箭塔图标
   */
  static createRocketIcon(isGhost = false) {
    const rocketRadius = TANK_SIZE * 0.18;
    const rocketTrackHeight = TANK_SIZE * 0.24;
    const rocketBaseWidth = TANK_SIZE * 0.7;
    const rocketBaseHeight = TANK_SIZE * 0.24;
    const rocketTowerWidth = TANK_SIZE * 0.32;
    const rocketTowerHeight = TANK_SIZE * 0.78;

    const icon = new Graphics();
    const alpha = isGhost ? 0.9 : 1;

    // 底座
    icon
      .roundRect(
        -rocketBaseWidth / 2,
        TANK_SIZE * 0.18,
        rocketBaseWidth,
        rocketBaseHeight,
        TANK_SIZE * 0.12
      )
      .fill({ color: 0x1f2937, alpha })
      .stroke({ width: 2, color: 0x0f172a, alpha })
      .roundRect(
        -rocketBaseWidth / 2 + 6,
        TANK_SIZE * 0.18 + rocketBaseHeight * 0.2,
        rocketBaseWidth - 12,
        rocketBaseHeight * 0.45,
        rocketBaseHeight * 0.25
      )
      .fill({ color: 0x475569, alpha: 0.9 * alpha });

    // 条纹装饰
    const stripeWidth = rocketBaseWidth / 5;
    for (let i = 0; i < 4; i += 1) {
      const sx = -rocketBaseWidth / 2 + 6 + i * stripeWidth;
      const color = i % 2 === 0 ? COLORS.ROCKET_DETAIL : 0x111827;
      icon
        .roundRect(
          sx,
          TANK_SIZE * 0.18 + rocketBaseHeight * 0.35,
          stripeWidth * 0.5,
          rocketBaseHeight * 0.4,
          stripeWidth * 0.2
        )
        .fill({ color, alpha: 0.85 * alpha });
    }

    // 塔身
    icon
      .roundRect(
        -rocketTowerWidth / 2,
        -rocketTowerHeight / 2,
        rocketTowerWidth,
        rocketTowerHeight,
        TANK_SIZE * 0.12
      )
      .fill({ color: 0x334155, alpha })
      .stroke({ width: 2, color: 0x0ea5e9, alpha });

    // 窗口
    const windowWidth = rocketTowerWidth * 0.28;
    const windowHeight = rocketTowerHeight * 0.16;
    for (let i = 0; i < 3; i += 1) {
      const wy = -rocketTowerHeight * 0.3 + i * windowHeight * 1.2;
      icon
        .roundRect(-windowWidth / 2, wy, windowWidth, windowHeight, windowHeight * 0.4)
        .fill({ color: COLORS.ALLY_DETAIL, alpha: 0.85 * alpha });
    }

    // 侧翼
    const finWidth = rocketTowerWidth * 0.24;
    const finHeight = rocketTowerHeight * 0.42;
    const finOffsetX = rocketTowerWidth * 0.72;
    icon
      .roundRect(-finOffsetX - finWidth / 2, -finHeight / 2, finWidth, finHeight, finWidth * 0.5)
      .fill({ color: COLORS.ROCKET_BODY, alpha: 0.9 * alpha })
      .roundRect(finOffsetX - finWidth / 2, -finHeight / 2, finWidth, finHeight, finWidth * 0.5)
      .fill({ color: COLORS.ROCKET_BODY, alpha: 0.9 * alpha });

    // 导轨与火箭头
    icon
      .roundRect(
        -TANK_SIZE * 0.26,
        -TANK_SIZE * 0.1,
        TANK_SIZE * 0.52,
        rocketTrackHeight,
        rocketTrackHeight * 0.4
      )
      .fill({ color: 0x0f172a })
      .circle(TANK_SIZE * 0.16, -TANK_SIZE * 0.02, rocketRadius)
      .fill({ color: COLORS.ROCKET_BULLET, alpha })
      .circle(0, -rocketTowerHeight * 0.5, rocketTowerWidth * 0.2)
      .fill({ color: 0xfef3c7, alpha: 0.95 * alpha });

    icon.scale.x = -1;
    if (isGhost) {
      icon.rotation = Math.PI;
    }

    return icon;
  }

  /**
   * 创建激光塔图标
   */
  static createLaserIcon(isGhost = false) {
    const coreRadius = TANK_SIZE * 0.12;
    const baseSize = TANK_SIZE * 0.4;

    const icon = new Graphics();
    const alpha = isGhost ? 0.9 : 1;

    // 基座（六边形）
    const hexPoints = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      hexPoints.push(Math.cos(angle) * baseSize);
      hexPoints.push(Math.sin(angle) * baseSize);
    }
    icon
      .poly(hexPoints)
      .fill({ color: COLORS.LASER_BODY, alpha: 0.9 * alpha })
      .stroke({ width: 2, color: COLORS.LASER_DETAIL, alpha: 0.7 * alpha });

    // 内层六边形装饰
    const innerHexPoints = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + Math.PI / 6;
      innerHexPoints.push(Math.cos(angle) * baseSize * 0.6);
      innerHexPoints.push(Math.sin(angle) * baseSize * 0.6);
    }
    icon
      .poly(innerHexPoints)
      .fill({ color: 0x0a1a0f, alpha: 0.8 * alpha })
      .stroke({ width: 1, color: COLORS.LASER_DETAIL, alpha: 0.5 * alpha });

    // 中央能量核心
    icon
      .circle(0, 0, coreRadius * 1.6)
      .fill({ color: COLORS.LASER_DETAIL, alpha: 0.3 * alpha })
      .circle(0, 0, coreRadius * 1.2)
      .fill({ color: COLORS.LASER_DETAIL, alpha: 0.5 * alpha })
      .circle(0, 0, coreRadius)
      .fill({ color: COLORS.LASER_BEAM, alpha: 0.95 * alpha });

    // 霓虹细节点
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const dotX = Math.cos(angle) * baseSize * 0.75;
      const dotY = Math.sin(angle) * baseSize * 0.75;
      icon.circle(dotX, dotY, 3).fill({ color: COLORS.LASER_DETAIL, alpha: 0.8 * alpha });
    }

    // 激光发射器
    const emitterDist = baseSize * 0.85;
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i;
      const emitX = Math.cos(angle) * emitterDist;
      const emitY = Math.sin(angle) * emitterDist;
      icon
        .roundRect(emitX - 2, emitY - 4, 4, 8, 2)
        .fill({ color: COLORS.LASER_BEAM, alpha: 0.7 * alpha });
    }

    return icon;
  }

  /**
   * 创建图标光晕背景
   */
  static createIconGlow(color) {
    return new Graphics()
      .circle(0, 0, TANK_SIZE * 0.65)
      .fill({ color, alpha: 0.15 })
      .circle(0, 0, TANK_SIZE * 0.55)
      .fill({ color, alpha: 0.1 })
      .circle(0, 0, TANK_SIZE * 0.5)
      .stroke({ width: 2, color: color, alpha: 0.4 })
      .circle(0, 0, TANK_SIZE * 0.45)
      .stroke({ width: 1, color: color, alpha: 0.3 });
  }

  /**
   * 创建拖拽光晕
   */
  static createDragGlow(color) {
    return new Graphics()
      .circle(0, 0, TANK_SIZE * 0.8)
      .fill({ color, alpha: 0.2 })
      .circle(0, 0, TANK_SIZE * 0.65)
      .fill({ color, alpha: 0.15 })
      .circle(0, 0, TANK_SIZE * 0.55)
      .stroke({ width: 3, color, alpha: 0.5 })
      .circle(0, 0, TANK_SIZE * 0.5)
      .stroke({ width: 2, color, alpha: 0.3 });
  }

  /**
   * 根据类型创建图标
   */
  static createIcon(weaponType, isGhost = false) {
    switch (weaponType) {
      case 'laser':
        return this.createLaserIcon(isGhost);
      case 'rocket':
      default:
        return this.createRocketIcon(isGhost);
    }
  }
}

