import { Graphics, Text } from 'pixi.js';
import { 
  ACTION_BUTTON_WIDTH, 
  ACTION_BUTTON_HEIGHT, 
  ACTION_BUTTON_RADIUS, 
  ACTION_BUTTON_FONT_SIZE,
  ACTION_BUTTON_STROKE_WIDTH,
  COLORS,
} from '../../constants';

/**
 * 霓虹风格按钮组件
 */
export class NeonButton extends Graphics {
  constructor(text, color = COLORS.SUCCESS, options = {}) {
    super();

    const {
      width = ACTION_BUTTON_WIDTH,
      height = ACTION_BUTTON_HEIGHT,
      radius = ACTION_BUTTON_RADIUS,
      fontSize = ACTION_BUTTON_FONT_SIZE,
      strokeWidth = ACTION_BUTTON_STROKE_WIDTH,
    } = options;

    this.buttonColor = color;
    this.buttonWidth = width;
    this.buttonHeight = height;
    this.buttonRadius = radius;

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
      .stroke({ width: ACTION_BUTTON_STROKE_WIDTH, color: this.buttonColor, alpha: 1 });

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

  onClick(callback) {
    this.on('pointerdown', (event) => {
      if (event && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
      }
      callback(event);
    });
  }
}

