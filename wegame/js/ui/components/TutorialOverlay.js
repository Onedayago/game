/**
 * 引导覆盖层
 * 显示游戏操作引导
 */

import { GameConfig } from '../../config/GameConfig';
import { UIConfig } from '../../config/UIConfig';
import { ColorUtils, GameColors } from '../../config/Colors';
import { polyfillRoundRect } from '../../utils/CanvasUtils';
import { BaseButton } from './BaseButton';
import { TextRenderer } from '../utils/TextRenderer';
import { GameContext } from '../../core/GameContext';

export class TutorialOverlay {
  constructor(ctx) {
    this.ctx = ctx;
    this.visible = false;
    this.currentStep = 0;
    this.onCompleteCallback = null;
    
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    
    // 下一步按钮
    this.nextButton = new BaseButton(
      windowWidth / 2,
      windowHeight * 0.85,
      UIConfig.HELP_BTN_WIDTH,
      UIConfig.HELP_BTN_HEIGHT,
      '下一步',
      GameColors.ROCKET_TOWER,
      UIConfig.HELP_BTN_RADIUS,
      ctx
    );
    this.nextButton.setUseOffScreen(true);
    
    // 跳过按钮
    this.skipButton = new BaseButton(
      windowWidth * 0.85,
      windowHeight * 0.1,
      UIConfig.HELP_BTN_WIDTH * 0.6,
      UIConfig.HELP_BTN_HEIGHT * 0.6,
      '跳过',
      GameColors.ENEMY_TANK,
      UIConfig.HELP_BTN_RADIUS * 0.6,
      ctx
    );
    this.skipButton.setUseOffScreen(true);
    
    // 引导步骤
    this.steps = [
      {
        title: '欢迎来到塔防游戏！',
        message: '拖动底部武器卡片到战场放置武器',
        highlight: null
      },
      {
        title: '放置武器',
        message: '点击并拖动武器卡片到绿色区域放置',
        highlight: { type: 'weapon_container' }
      },
      {
        title: '武器会自动攻击',
        message: '武器会自动攻击范围内的敌人',
        highlight: null
      },
      {
        title: '金币系统',
        message: '这里是你的金币，用于购买和升级武器',
        highlight: { type: 'gold_panel' }
      },
      {
        title: '波次信息',
        message: '这里显示当前波次和敌人进度',
        highlight: { type: 'wave_panel' }
      },
      {
        title: '小地图',
        message: '点击小地图可以快速跳转到战场位置',
        highlight: { type: 'minimap' }
      },
      {
        title: '敌人生成位置',
        message: '敌人从左侧生成，向右移动',
        highlight: { type: 'enemy_spawn' }
      },
      {
        title: '暂停按钮',
        message: '点击这里可以暂停游戏',
        highlight: { type: 'pause_button' }
      }
    ];
    
    // 高亮动画时间
    this.highlightPulseTime = 0;
  }
  
  /**
   * 静态初始化方法（兼容性方法，不再需要）
   */
  static initStaticCache() {
    // 不再需要离屏缓存
  }
  
  /**
   * 实例初始化方法（兼容性方法，不再需要）
   */
  initStaticCache() {
    // 不再需要离屏缓存
  }
  
  /**
   * 显示引导
   */
  show(onCompleteCallback) {
    this.visible = true;
    this.currentStep = 0;
    this.onCompleteCallback = onCompleteCallback;
    
    this.nextButton.setOnClick(() => {
      this.nextStep();
    });
    
    this.skipButton.setOnClick(() => {
      this.complete();
    });
  }
  
  /**
   * 隐藏引导
   */
  hide() {
    this.visible = false;
  }
  
  /**
   * 下一步
   */
  nextStep() {
    this.currentStep++;
    if (this.currentStep >= this.steps.length) {
      this.complete();
    }
  }
  
  /**
   * 完成引导
   */
  complete() {
    this.visible = false;
    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
  }
  
  /**
   * 检查点击是否在引导区域内
   */
  isPointInBounds(x, y) {
    if (!this.visible) return false;
    
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    
    // 检查是否点击了按钮
    if (this.nextButton.isPointInBounds(x, y)) {
      return true;
    }
    if (this.skipButton.isPointInBounds(x, y)) {
      return true;
    }
    
    // 引导覆盖整个屏幕
    return true;
  }
  
  /**
   * 处理触摸开始事件（UIEventManager 接口）
   */
  onTouchStart(eOrX, y) {
    if (!this.visible) return false;
    
    // 支持两种调用方式：坐标参数 (x, y) 或事件对象 e
    let x, touchY;
    if (typeof eOrX === 'number' && typeof y === 'number') {
      x = eOrX;
      touchY = y;
    } else {
      const touch = eOrX.touches && eOrX.touches[0] ? eOrX.touches[0] : eOrX;
      x = touch.x || touch.clientX || 0;
      touchY = touch.y || touch.clientY || 0;
    }
    
    // 检查是否点击了按钮
    if (this.nextButton.isPointInBounds(x, touchY)) {
      this.nextButton.pressed = true;
      this.nextButton.invalidate(); // 标记缓存为脏，需要重新渲染
      return true;
    }
    
    if (this.skipButton.isPointInBounds(x, touchY)) {
      this.skipButton.pressed = true;
      this.skipButton.invalidate(); // 标记缓存为脏，需要重新渲染
      return true;
    }
    
    // 点击其他地方也认为已处理（阻止穿透）
    return true;
  }
  
  /**
   * 处理触摸移动事件（UIEventManager 接口）
   */
  onTouchMove(eOrX, y) {
    if (!this.visible) return false;
    
    // 支持两种调用方式：坐标参数 (x, y) 或事件对象 e
    let x, touchY;
    if (typeof eOrX === 'number' && typeof y === 'number') {
      x = eOrX;
      touchY = y;
    } else {
      const touch = eOrX.touches && eOrX.touches[0] ? eOrX.touches[0] : eOrX;
      x = touch.x || touch.clientX || 0;
      touchY = touch.y || touch.clientY || 0;
    }
    
    // 更新按钮悬停状态
    const nextButtonHovered = this.nextButton.isPointInBounds(x, touchY);
    const skipButtonHovered = this.skipButton.isPointInBounds(x, touchY);
    
    // 如果悬停状态变化，更新缓存
    if (this.nextButton.hovered !== nextButtonHovered) {
      this.nextButton.hovered = nextButtonHovered;
      this.nextButton.invalidate();
    }
    if (this.skipButton.hovered !== skipButtonHovered) {
      this.skipButton.hovered = skipButtonHovered;
      this.skipButton.invalidate();
    }
    
    return true;
  }
  
  /**
   * 处理触摸结束事件（UIEventManager 接口）
   */
  onTouchEnd(eOrX, y) {
    if (!this.visible) return false;
    
    // 支持两种调用方式：坐标参数 (x, y) 或事件对象 e
    let x, touchY;
    if (typeof eOrX === 'number' && typeof y === 'number') {
      x = eOrX;
      touchY = y;
    } else {
      const touch = eOrX.changedTouches && eOrX.changedTouches[0] ? eOrX.changedTouches[0] : eOrX;
      x = touch.x || touch.clientX || 0;
      touchY = touch.y || touch.clientY || 0;
    }
    
    // 检查是否点击了按钮
    if (this.nextButton.isPointInBounds(x, touchY) && this.nextButton.pressed) {
      this.nextButton.pressed = false;
      if (this.nextButton.onClickCallback) {
        this.nextButton.onClickCallback(this.nextButton, x, touchY);
      }
      return true;
    }
    
    if (this.skipButton.isPointInBounds(x, touchY) && this.skipButton.pressed) {
      this.skipButton.pressed = false;
      if (this.skipButton.onClickCallback) {
        this.skipButton.onClickCallback(this.skipButton, x, touchY);
      }
      return true;
    }
    
    // 重置按钮状态
    if (this.nextButton.pressed) {
      this.nextButton.pressed = false;
      this.nextButton.invalidate(); // 标记缓存为脏，需要重新渲染
    }
    if (this.skipButton.pressed) {
      this.skipButton.pressed = false;
      this.skipButton.invalidate(); // 标记缓存为脏，需要重新渲染
    }
    
    // 点击其他地方也进入下一步（简化操作）
    this.nextStep();
    return true;
  }
  
  /**
   * 处理点击事件（兼容旧接口）
   */
  handleClick(x, y) {
    return this.onTouchEnd(x, y);
  }
  
  /**
   * 获取高亮区域的位置和尺寸
   */
  _getHighlightBounds(highlight) {
    if (!highlight || !highlight.type) {
      return null;
    }
    
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    const gameContext = GameContext.getInstance();
    
    switch (highlight.type) {
      case 'weapon_container': {
        const containerHeight = UIConfig.WEAPON_CONTAINER_HEIGHT;
        const containerY = windowHeight - containerHeight - UIConfig.WEAPON_CONTAINER_BOTTOM_OFFSET;
        const containerWidth = UIConfig.WEAPON_CONTAINER_WIDTH;
        const containerX = (windowWidth - containerWidth) / 2 + UIConfig.WEAPON_CONTAINER_HORIZONTAL_OFFSET;
        return {
          x: containerX,
          y: containerY,
          width: containerWidth,
          height: containerHeight,
          padding: 10
        };
      }
      case 'gold_panel': {
        const panelWidth = UIConfig.GOLD_PANEL_WIDTH;
        const panelHeight = UIConfig.GOLD_PANEL_HEIGHT;
        const panelX = windowWidth / 2 - panelWidth - UIConfig.PANEL_SPACING;
        const panelY = UIConfig.MARGIN_MEDIUM;
        return {
          x: panelX,
          y: panelY,
          width: panelWidth,
          height: panelHeight,
          padding: 10
        };
      }
      case 'wave_panel': {
        const panelWidth = UIConfig.WAVE_PANEL_WIDTH;
        const panelHeight = UIConfig.WAVE_PANEL_HEIGHT;
        const panelX = windowWidth / 2 + UIConfig.PANEL_SPACING;
        const panelY = UIConfig.MARGIN_MEDIUM;
        return {
          x: panelX,
          y: panelY,
          width: panelWidth,
          height: panelHeight,
          padding: 10
        };
      }
      case 'minimap': {
        const minimapWidth = GameConfig.CELL_SIZE * 3;
        const minimapHeight = GameConfig.CELL_SIZE * 1.5;
        const minimapX = UIConfig.MINIMAP_MARGIN;
        const minimapY = windowHeight - minimapHeight - UIConfig.MINIMAP_BOTTOM_OFFSET;
        return {
          x: minimapX,
          y: minimapY,
          width: minimapWidth,
          height: minimapHeight,
          padding: 10
        };
      }
      case 'enemy_spawn': {
        // 敌人生成位置在左侧，高亮左侧边界区域
        const spawnAreaWidth = GameConfig.CELL_SIZE * 2;
        const spawnAreaHeight = GameConfig.BATTLE_HEIGHT;
        const spawnAreaX = 0; // 从左侧开始
        const spawnAreaY = GameConfig.BATTLE_START_ROW * GameConfig.CELL_SIZE;
        return {
          x: spawnAreaX,
          y: spawnAreaY,
          width: spawnAreaWidth,
          height: spawnAreaHeight,
          padding: 10
        };
      }
      case 'pause_button': {
        const buttonSize = UIConfig.PAUSE_BUTTON_SIZE;
        const buttonX = windowWidth - UIConfig.PAUSE_BUTTON_X_OFFSET - buttonSize;
        const buttonY = UIConfig.PAUSE_BUTTON_Y_OFFSET;
        return {
          x: buttonX,
          y: buttonY,
          width: buttonSize,
          height: buttonSize,
          padding: 10
        };
      }
      default:
        return null;
    }
  }
  
  /**
   * 绘制高亮框（选中框）- 背景透明，只绘制边框
   */
  _renderHighlight(ctx, bounds) {
    if (!bounds) return;
    
    const pulse = Math.sin(this.highlightPulseTime * 3) * 0.3 + 0.7; // 0.4 到 1.0 之间脉冲
    const padding = bounds.padding || 10;
    
    // 绘制高亮框（带脉冲效果）
    const highlightX = bounds.x - padding;
    const highlightY = bounds.y - padding;
    const highlightWidth = bounds.width + padding * 2;
    const highlightHeight = bounds.height + padding * 2;
    
    polyfillRoundRect(ctx);
    
    // 绘制外发光效果
    ctx.shadowColor = ColorUtils.hexToCanvas(GameColors.ROCKET_TOWER, pulse * 0.8);
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // 绘制高亮边框（带脉冲）- 只绘制边框，不填充背景
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ROCKET_TOWER, pulse);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(highlightX, highlightY, highlightWidth, highlightHeight, 8);
    ctx.stroke();
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // 绘制内边框（更细的边框）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xffffff, pulse * 0.5);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(highlightX, highlightY, highlightWidth, highlightHeight, 8);
    ctx.stroke();
  }
  
  /**
   * 渲染引导
   */
  render() {
    if (!this.visible) return;
    
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    const ctx = this.ctx;
    
    // 获取当前步骤
    const step = this.steps[this.currentStep];
    if (!step) return;
    
    // 获取高亮区域
    const highlightBounds = this._getHighlightBounds(step.highlight);
    
    // 绘制半透明遮罩层（使用四个矩形的方式，中间留空）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    
    if (highlightBounds) {
      const padding = highlightBounds.padding || 10;
      const highlightX = highlightBounds.x - padding;
      const highlightY = highlightBounds.y - padding;
      const highlightWidth = highlightBounds.width + padding * 2;
      const highlightHeight = highlightBounds.height + padding * 2;
      
      // 绘制四个矩形形成遮罩，中间留空
      // 上矩形
      ctx.fillRect(0, 0, windowWidth, highlightY);
      // 下矩形
      ctx.fillRect(0, highlightY + highlightHeight, windowWidth, windowHeight - (highlightY + highlightHeight));
      // 左矩形
      ctx.fillRect(0, highlightY, highlightX, highlightHeight);
      // 右矩形
      ctx.fillRect(highlightX + highlightWidth, highlightY, windowWidth - (highlightX + highlightWidth), highlightHeight);
      
      // 绘制高亮框（背景透明，只有边框）
      this._renderHighlight(ctx, highlightBounds);
    } else {
      // 没有高亮区域，绘制完整遮罩
      ctx.fillRect(0, 0, windowWidth, windowHeight);
    }
    
    // 绘制标题（动态内容，完全居中，无背景框，带阴影和渐变效果）
    const titleY = windowHeight * 0.4;
    TextRenderer.drawText(
      ctx,
      step.title,
      windowWidth / 2,
      titleY,
      {
        font: 'bold 32px Arial',
        color: GameColors.ROCKET_TOWER,
        align: 'center',
        baseline: 'middle',
        shadow: {
          color: 'rgba(0, 0, 0, 0.9)',
          blur: 12,
          offsetX: 0,
          offsetY: 3
        },
        gradient: {
          x0: windowWidth / 2 - 150,
          y0: titleY - 20,
          x1: windowWidth / 2 + 150,
          y1: titleY + 20,
          stops: [
            { offset: 0, color: GameColors.ROCKET_TOWER, alpha: 1.0 },
            { offset: 0.5, color: 0xffaa44, alpha: 1.0 },
            { offset: 1, color: GameColors.ROCKET_TOWER, alpha: 1.0 }
          ]
        }
      }
    );
    
    // 绘制消息（动态内容，完全居中，无背景框，带阴影）
    const messageY = windowHeight * 0.5;
    TextRenderer.drawText(
      ctx,
      step.message,
      windowWidth / 2,
      messageY,
      {
        font: '22px Arial',
        color: 0xffffff,
        align: 'center',
        baseline: 'middle',
        shadow: {
          color: 'rgba(0, 0, 0, 0.9)',
          blur: 10,
          offsetX: 0,
          offsetY: 3
        }
      }
    );
    
    // 渲染按钮（按钮本身已有离线缓存）
    this.nextButton.render();
    this.skipButton.render();
  }
  
  /**
   * 更新（用于动画等）
   */
  update(deltaTime) {
    if (!this.visible) return;
    
    // 更新高亮脉冲动画
    this.highlightPulseTime += deltaTime;
    
    // 按钮状态变化时标记缓存为脏（如果按钮有状态变化）
    // BaseButton 使用离线缓存，状态变化时通过 invalidate() 处理
    // 这里不需要调用 update，因为按钮没有动画需求
  }
}

