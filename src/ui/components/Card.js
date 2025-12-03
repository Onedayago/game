import { Graphics } from 'pixi.js';
import { responsiveLayout } from '../../app/ResponsiveLayout';

/**
 * 霓虹风格卡片组件
 * 支持响应式布局
 */
export class NeonCard extends Graphics {
  constructor(width, height, color, options = {}) {
    super();

    // 获取当前布局的缩放比例
    const layout = responsiveLayout.getLayout();
    const scale = layout.scale;

    const {
      borderRadius = 14 * scale,
      glowSize = 3 * scale,
      padding = 8 * scale,
    } = options;

    this.cardWidth = width;
    this.cardHeight = height;
    this.cardColor = color;
    this.borderRadius = borderRadius;
    this.glowSize = glowSize;
    this.padding = padding;

    this.draw();
    this.eventMode = 'none';
  }

  draw() {
    this.clear();

    // 外部光晕
    this.roundRect(
      -this.cardWidth / 2 - this.glowSize,
      -this.cardHeight / 2 - this.glowSize,
      this.cardWidth + this.glowSize * 2,
      this.cardHeight + this.glowSize * 2,
      this.borderRadius + 2
    ).fill({ color: this.cardColor, alpha: 0.12 });

    // 边框
    this.roundRect(
      -this.cardWidth / 2 - 2,
      -this.cardHeight / 2 - 2,
      this.cardWidth + 4,
      this.cardHeight + 4,
      this.borderRadius + 1
    ).stroke({ width: 2, color: this.cardColor, alpha: 0.4 });

    // 主背景
    this.roundRect(
      -this.cardWidth / 2,
      -this.cardHeight / 2,
      this.cardWidth,
      this.cardHeight,
      this.borderRadius
    )
      .fill({ color: 0x111827, alpha: 0.9 })
      .stroke({ width: 2, color: 0x0a1929, alpha: 0.6 });

    // 内部光晕
    this.roundRect(
      -this.cardWidth / 2 + 2,
      -this.cardHeight / 2 + 2,
      this.cardWidth - 4,
      this.cardHeight - 4,
      this.borderRadius - 2
    ).stroke({ width: 1, color: this.cardColor, alpha: 0.35 });

    // 顶部装饰条
    this.roundRect(
      -this.cardWidth / 2 + this.padding,
      -this.cardHeight / 2 + this.padding,
      this.cardWidth - this.padding * 2,
      this.cardHeight * 0.15,
      this.padding
    ).fill({ color: this.cardColor, alpha: 0.15 });
  }

  setColor(color) {
    this.cardColor = color;
    this.draw();
  }

  /**
   * 更新卡片尺寸
   */
  setSize(width, height) {
    this.cardWidth = width;
    this.cardHeight = height;
    this.draw();
  }

  /**
   * 响应布局变化
   */
  onResize(layout) {
    const scale = layout.scale;
    this.borderRadius = 14 * scale;
    this.glowSize = 3 * scale;
    this.padding = 8 * scale;
    this.draw();
  }
}
