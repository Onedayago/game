/**
 * 武器渲染器
 * 负责所有武器的视觉绘制
 */

import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';
import { WeaponType } from '../config/WeaponConfig';
import { ColorUtils, GameColors } from '../config/Colors';
import { polyfillRoundRect } from '../utils/CanvasUtils';
import { RocketTowerRenderer } from './RocketTowerRenderer';
import { LaserTowerRenderer } from './LaserTowerRenderer';

class WeaponRenderer {
  /**
   * 渲染火箭塔
   * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
   * @param {number} x - Canvas 坐标系 X
   * @param {number} y - Canvas 坐标系 Y（从上往下）
   * @param {number} size - 尺寸
   * @param {number} level - 等级
   */
  static renderRocketTower(ctx, x, y, size, level = 1) {
    RocketTowerRenderer.render(ctx, x, y, size, level);
  }
  
  /**
   * 渲染激光塔
   * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
   * @param {number} x - Canvas 坐标系 X
   * @param {number} y - Canvas 坐标系 Y（从上往下）
   * @param {number} size - 尺寸
   * @param {number} level - 等级
   */
  static renderLaserTower(ctx, x, y, size, level = 1) {
    LaserTowerRenderer.render(ctx, x, y, size, level);
  }
  
  /**
   * 渲染武器图标（用于 UI）
   */
  static renderWeaponIcon(ctx, x, y, weaponType, size) {
    if (weaponType === WeaponType.ROCKET) {
      this.renderRocketTower(ctx, x, y, size, 1);
    } else if (weaponType === WeaponType.LASER) {
      this.renderLaserTower(ctx, x, y, size, 1);
    }
  }
  
  /**
   * 渲染血条
   * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
   * @param {number} x - Canvas 坐标系 X
   * @param {number} y - Canvas 坐标系 Y（从上往下）
   * @param {number} hp - 当前血量
   * @param {number} maxHp - 最大血量
   * @param {number} entitySize - 实体尺寸
   */
  static renderHealthBar(ctx, x, y, hp, maxHp, entitySize) {
    polyfillRoundRect(ctx);
    const barWidth = entitySize * UIConfig.HP_BAR_WIDTH_RATIO;
    const barHeight = UIConfig.HP_BAR_HEIGHT;
    const offsetY = entitySize / 2 + entitySize * 0.2; // 实体顶部 + 间隔（Canvas 坐标系中向上，Y 值更小）
    
    const barX = x;
    // 在 Canvas 坐标系中，血条应该在实体上方（Y 值更小，所以减去 offsetY）
    const barY = y - offsetY;
    
    // 绘制背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(barX - barWidth / 2, barY - barHeight / 2, barWidth, barHeight, 3);
    ctx.fill();
    
    // 绘制血条
    const ratio = Math.max(hp / maxHp, 0);
    if (ratio > 0) {
      let hpColor;
      if (ratio <= UIConfig.HP_BAR_CRITICAL_THRESHOLD) {
        hpColor = GameColors.DANGER || 0xff0000;
      } else if (ratio <= UIConfig.HP_BAR_WARNING_THRESHOLD) {
        hpColor = 0xfbbf24; // 琥珀色
      } else {
        hpColor = GameColors.ENEMY_DETAIL;
      }
      
      ctx.fillStyle = ColorUtils.hexToCanvas(hpColor, 0.95);
      ctx.roundRect(barX - barWidth / 2, barY - barHeight / 2, barWidth * ratio, barHeight, 3);
      ctx.fill();
    }
  }
}

export { WeaponRenderer };
export default WeaponRenderer;

