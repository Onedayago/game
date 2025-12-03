import { Graphics, Text } from 'pixi.js';
import { COLORS } from '../../constants';
import { responsiveLayout } from '../../app/ResponsiveLayout';

/**
 * 霓虹风格按钮组件
 * 支持响应式布局
 */
export class NeonButton extends Graphics {
  constructor(text, color = COLORS.SUCCESS, options = {}) {
    super();

    // 获取当前布局的按钮尺寸
    const layout = responsiveLayout.getLayout();
    const {
      width = layout.ACTION_BUTTON_WIDTH,
      height = layout.ACTION_BUTTON_HEIGHT,
      radius = layout.ACTION_BUTTON_RADIUS,
      fontSize = layout.ACTION_BUTTON_FONT_SIZE,
      strokeWidth = layout.ACTION_BUTTON_STROKE_WIDTH,
    } = options;

    this.buttonColor = color;
    this.buttonWidth = width;
    this.buttonHeight = height;
    this.buttonRadius = radius;
    this.strokeWidth = strokeWidth;

    // 绘制按钮
    this.draw();

    // 创建文本
    this.label = new Text({
      text,
      style: {
        fill: COLORS.TEXT_MAIN,
        fontSize,
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowColor: this.buttonColor,
        dropShadowBlur: 4,
        dropShadowDistance: 0,
      },
    });
    this.label.anchor.set(0.5);
    this.addChild(this.label);

    // 设置交互
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.visible = false;

    // Hover效果
    this.on('pointerover', () => {
      this.alpha = 1.2;
    });
    this.on('pointerout', () => {
      this.alpha = 1;
    });
  }

  draw() {
    this.clear();

    // 外部光晕
    this.roundRect(
      -this.buttonWidth / 2 - 2,
      -this.buttonHeight / 2 - 2,
      this.buttonWidth + 4,
      this.buttonHeight + 4,
      this.buttonRadius + 2
    ).fill({ color: this.buttonColor, alpha: 0.2 });

    // 主体
    this.roundRect(
      -this.buttonWidth / 2,
      -this.buttonHeight / 2,
      this.buttonWidth,
      this.buttonHeight,
      this.buttonRadius
    )
      .fill({ color: this.buttonColor, alpha: 0.9 })
      .stroke({ width: this.strokeWidth, color: this.buttonColor, alpha: 1 });

    // 内部高光
    this.roundRect(
      -this.buttonWidth / 2 + 2,
      -this.buttonHeight / 2 + 2,
      this.buttonWidth - 4,
      this.buttonHeight - 4,
      this.buttonRadius - 2
    ).stroke({ width: 1, color: 0xffffff, alpha: 0.4 });
  }

  setText(text) {
    if (this.label) {
      this.label.text = text;
    }
  }

  setColor(color) {
    this.buttonColor = color;
    this.draw();
    if (this.label && this.label.style) {
      this.label.style.dropShadowColor = color;
    }
  }

  /**
   * 响应布局变化
   */
  onResize(layout) {
    this.buttonWidth = layout.ACTION_BUTTON_WIDTH;
    this.buttonHeight = layout.ACTION_BUTTON_HEIGHT;
    this.buttonRadius = layout.ACTION_BUTTON_RADIUS;
    this.strokeWidth = layout.ACTION_BUTTON_STROKE_WIDTH;
    
    this.draw();
    
    if (this.label) {
      this.label.style.fontSize = layout.ACTION_BUTTON_FONT_SIZE;
    }
  }

  onClick(callback) {
    this.on('pointerdown', (event) => {
      if (event && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
      }
      callback(event);
    });
  }
}
