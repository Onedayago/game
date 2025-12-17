/**
 * 武器容器 UI 渲染器
 * 负责武器容器 UI 的渲染逻辑
 */

import { GameConfig } from '../../config/GameConfig';
import { UIConfig } from '../../config/UIConfig';
import { WeaponType } from '../../config/WeaponConfig';
import { ColorUtils, GameColors } from '../../config/Colors';
import { WeaponCardRenderer } from '../widgets/WeaponCardRenderer';
import { WeaponRenderer } from '../../rendering/weapons/WeaponRenderer';
import { WeaponConfigs } from '../../config/WeaponConfig';
import { WeaponContainerCache } from '../cache/WeaponContainerCache';

export class WeaponContainerRenderer {
  /**
   * 渲染背景（使用缓存）
   */
  static renderBackground(ctx, containerX, containerY, containerWidth, containerHeight) {
    if (!WeaponContainerCache.isInitialized()) {
      WeaponContainerCache.init();
    }

    const backgroundCache = WeaponContainerCache.getBackgroundCache();
    if (backgroundCache) {
      ctx.drawImage(
        backgroundCache,
        containerX,
        containerY,
        containerWidth,
        containerHeight
      );
    }
  }

  /**
   * 渲染武器卡片
   */
  static renderWeaponCards(ctx, containerX, containerY, containerWidth, containerHeight, scrollIndex, visibleCount, selectedWeaponType) {
    const cardSize = GameConfig.CELL_SIZE;
    const spacing = UIConfig.WEAPON_CARD_SPACING;
    const allWeaponTypes = [WeaponType.ROCKET, WeaponType.LASER, WeaponType.CANNON, WeaponType.SNIPER];

    // 获取当前可见的武器类型
    const visibleWeaponTypes = allWeaponTypes.slice(scrollIndex, scrollIndex + visibleCount);

    // 计算卡片总宽度和起始位置（在容器内居中）
    const totalCardsWidth = cardSize * visibleWeaponTypes.length + spacing * (visibleWeaponTypes.length - 1);
    const startX = containerX + (containerWidth - totalCardsWidth) / 2;
    const cardY = containerY + (containerHeight - cardSize) / 2;

    // 渲染每个可见的武器卡片
    visibleWeaponTypes.forEach((type, index) => {
      const cardX = startX + index * (cardSize + spacing);
      const isSelected = selectedWeaponType === type;
      WeaponCardRenderer.renderCard(ctx, cardX, cardY, cardSize, type, isSelected);
    });
  }

  /**
   * 渲染左右箭头
   */
  static renderArrows(ctx, containerX, containerY, containerWidth, containerHeight, scrollIndex, visibleCount) {
    const arrowSize = containerHeight * 0.4;
    const arrowPadding = UIConfig.ARROW_PADDING;
    const arrowBgRadius = arrowSize * 0.6;
    const allWeaponTypes = [WeaponType.ROCKET, WeaponType.LASER, WeaponType.CANNON, WeaponType.SNIPER];
    const maxScrollIndex = Math.max(0, allWeaponTypes.length - visibleCount);

    // 左箭头
    if (scrollIndex > 0) {
      const leftArrowX = containerX - arrowPadding - arrowBgRadius;
      const leftArrowY = containerY + containerHeight / 2;
      this._renderArrow(ctx, leftArrowX, leftArrowY, arrowSize, true);
    }

    // 右箭头
    if (scrollIndex < maxScrollIndex) {
      const rightArrowX = containerX + containerWidth + arrowPadding + arrowBgRadius;
      const rightArrowY = containerY + containerHeight / 2;
      this._renderArrow(ctx, rightArrowX, rightArrowY, arrowSize, false);
    }
  }

  /**
   * 渲染单个箭头（使用缓存）
   */
  static _renderArrow(ctx, x, y, size, left) {
    if (!WeaponContainerCache.isInitialized()) {
      WeaponContainerCache.init();
    }

    const arrowCache = WeaponContainerCache.getArrowCache(left);
    if (!arrowCache) {
      return;
    }

    const arrowCanvasSize = arrowCache.width;
    const halfSize = arrowCanvasSize / 2;

    ctx.drawImage(
      arrowCache,
      x - halfSize,
      y - halfSize,
      arrowCanvasSize,
      arrowCanvasSize
    );
  }

  /**
   * 渲染拖拽中的武器图标
   */
  static renderDragIcon(ctx, x, y, weaponType) {
    const config = WeaponConfigs.getConfig(weaponType);
    if (!config) {
      return;
    }

    ctx.save();

    const size = UIConfig.DRAG_GHOST_SIZE * UIConfig.DRAG_GHOST_SCALE;

    // 绘制半透明背景圆形
    const bgGradient = ctx.createRadialGradient(x, y, 0, x, y, size / 2);
    bgGradient.addColorStop(0, ColorUtils.hexToCanvas(config.colorHex, 0.6));
    bgGradient.addColorStop(1, ColorUtils.hexToCanvas(config.colorHex, 0.3));
    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // 绘制边框
    ctx.strokeStyle = ColorUtils.hexToCanvas(config.colorHex, 0.8);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.stroke();

    // 使用武器渲染器绘制武器图标
    ctx.globalAlpha = 0.9;
    WeaponRenderer.renderWeaponIcon(ctx, x, y, weaponType, size * 0.7);
    ctx.globalAlpha = 1.0;

    ctx.restore();
  }
}

