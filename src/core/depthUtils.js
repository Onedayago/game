import { Graphics, BlurFilter } from 'pixi.js';
import { CELL_SIZE, BATTLE_HEIGHT } from '../constants';

const PLAYABLE_HEIGHT = BATTLE_HEIGHT;

const BASE_SCALE = 0.9;
const SCALE_RANGE = 0.22;

/**
 * 根据当前 Y 坐标计算透视缩放和阴影参数
 */
export function getPerspectiveByY(y = 0) {
  const normalized = Math.min(Math.max(y / PLAYABLE_HEIGHT, 0), 1);
  const scale = BASE_SCALE + normalized * SCALE_RANGE;
  const shadowOffsetY = 6 + normalized * 10;
  const shadowOffsetX = -8 + normalized * 6;
  const shadowScaleX = 1 + normalized * 0.35;
  const shadowScaleY = 0.55 + normalized * 0.12;
  const shadowAlpha = 0.35 + normalized * 0.35;
  return {
    scale,
    shadowOffsetX,
    shadowOffsetY,
    shadowScaleX,
    shadowScaleY,
    shadowAlpha,
  };
}

/**
 * 创建一个柔和的椭圆阴影，用于放在坦克 / 敌人底部
 */
export function createSoftShadow(radius = CELL_SIZE * 0.45) {
  const shadow = new Graphics()
    .ellipse(0, 0, radius, radius * 0.55)
    .fill({ color: 0x000000, alpha: 0.8 });
  const blur = new BlurFilter();
  blur.blur = 4;
  shadow.filters = [blur];
  shadow.alpha = 0.5;
  return shadow;
}

export function updateShadowTransform(shadow, x, y, perspective) {
  if (!shadow || !perspective) return;
  shadow.x = x + perspective.shadowOffsetX;
  shadow.y = y + perspective.shadowOffsetY;
  shadow.alpha = perspective.shadowAlpha;
  shadow.scale.set(perspective.shadowScaleX, perspective.shadowScaleY);
}

