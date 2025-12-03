/**
 * 游戏UI管理器
 * 负责处理游戏的开始界面、帮助界面和结束界面
 * 
 * 主要功能：
 * - 显示开始游戏界面（带标题和开始按钮）
 * - 显示游戏说明界面（操作指南和返回按钮）
 * - 显示游戏结束界面（游戏失败提示）
 * - 管理UI层级和清理
 * - 支持响应式布局
 */

import {
  Container,
  Graphics,
  Text,
} from 'pixi.js';
import {
  COLORS,
  // 波次通知参数
  WAVE_NOTIFY_OVERLAY_ALPHA,
  WAVE_NOTIFY_PANEL_WIDTH,
  WAVE_NOTIFY_PANEL_HEIGHT,
  WAVE_NOTIFY_PANEL_RADIUS,
  WAVE_NOTIFY_PANEL_ALPHA,
  WAVE_NOTIFY_BORDER_WIDTH,
  WAVE_NOTIFY_BORDER_ALPHA,
  WAVE_NOTIFY_GLOW_PADDING,
  WAVE_NOTIFY_GLOW_RADIUS,
  WAVE_NOTIFY_GLOW_WIDTH,
  WAVE_NOTIFY_GLOW_ALPHA,
  WAVE_NOTIFY_TITLE_SIZE,
  WAVE_NOTIFY_TITLE_SHADOW_BLUR,
  WAVE_NOTIFY_TITLE_SHADOW_ALPHA,
  WAVE_NOTIFY_SUBTITLE_SIZE,
  WAVE_NOTIFY_SUBTITLE_SHADOW_BLUR,
  WAVE_NOTIFY_SUBTITLE_SHADOW_ALPHA,
  WAVE_NOTIFY_LINE_WIDTH,
  WAVE_NOTIFY_LINE_HEIGHT,
  WAVE_NOTIFY_LINE_ALPHA,
  WAVE_NOTIFY_TITLE_OFFSET_Y,
  WAVE_NOTIFY_SUBTITLE_OFFSET_Y,
  WAVE_NOTIFY_LINE_TOP_OFFSET_Y,
  WAVE_NOTIFY_LINE_BOTTOM_OFFSET_Y,
  WAVE_NOTIFY_DURATION,
  WAVE_NOTIFY_FADE_IN_RATIO,
  WAVE_NOTIFY_STAY_RATIO,
  WAVE_NOTIFY_INITIAL_SCALE,
  // 帮助界面参数
  HELP_TITLE_SIZE,
  HELP_TITLE_Y_RATIO,
  HELP_BODY_SIZE,
  HELP_BODY_WIDTH_RATIO,
  HELP_BODY_LINE_HEIGHT,
  HELP_BODY_Y_RATIO,
  HELP_BACK_BTN_WIDTH,
  HELP_BACK_BTN_HEIGHT,
  HELP_BACK_BTN_RADIUS,
  HELP_BACK_BTN_STROKE,
  HELP_BACK_BTN_SIZE,
  HELP_BACK_BTN_Y_RATIO,
  // 开始界面参数
  START_OVERLAY_ALPHA,
  START_TITLE_SIZE,
  START_TITLE_Y_RATIO,
  START_SUBTITLE_SIZE,
  START_SUBTITLE_Y_RATIO,
  START_BTN_WIDTH,
  START_BTN_HEIGHT,
  START_BTN_RADIUS,
  START_BTN_STROKE,
  START_BTN_SIZE,
  START_BTN_Y_RATIO,
  START_HELP_BTN_WIDTH,
  START_HELP_BTN_HEIGHT,
  START_HELP_BTN_RADIUS,
  START_HELP_BTN_SIZE,
  START_HELP_BTN_Y_RATIO,
} from '../constants';
import { responsiveLayout } from '../app/ResponsiveLayout';

// 屏幕状态枚举
const SCREEN_STATE = {
  NONE: 'none',
  START: 'start',
  HELP: 'help',
};

/**
 * 游戏UI类
 */
export class GameUI {
  constructor(app, options = {}) {
    this.app = app;
    this.onStartGame = options.onStartGame || null;
    this.currentScreen = SCREEN_STATE.NONE;

    this.layer = new Container();
    this.app.stage.addChild(this.layer);
  }

  /**
   * 获取当前布局尺寸
   */
  getSize() {
    return {
      width: responsiveLayout.APP_WIDTH,
      height: responsiveLayout.APP_HEIGHT,
      scale: responsiveLayout.scale,
    };
  }

  clear() {
    this.layer.removeChildren();
  }

  /**
   * 响应尺寸变化
   * @param {Object} layout - 新的布局参数
   */
  onResize(layout) {
    // 如果当前有显示的屏幕，重新渲染
    switch (this.currentScreen) {
      case SCREEN_STATE.START:
        this.showStartScreen();
        break;
      case SCREEN_STATE.HELP:
        this.showHelpScreen();
        break;
      default:
        // 无需处理
        break;
    }
  }

  /**
   * 显示波次通知
   * @param {number} waveLevel - 波次等级
   */
  showWaveNotification(waveLevel) {
    const { width, height, scale } = this.getSize();
    
    // 创建通知容器
    const notification = new Container();
    
    // 半透明背景
    const bg = new Graphics()
      .rect(0, 0, width, height)
      .fill({ color: COLORS.OVERLAY_BG, alpha: WAVE_NOTIFY_OVERLAY_ALPHA });
    
    // 按比例缩放面板尺寸
    const panelWidth = WAVE_NOTIFY_PANEL_WIDTH * scale;
    const panelHeight = WAVE_NOTIFY_PANEL_HEIGHT * scale;
    const panelRadius = WAVE_NOTIFY_PANEL_RADIUS * scale;
    
    // 主标题背景（发光效果）
    const halfWidth = panelWidth / 2;
    const halfHeight = panelHeight / 2;
    const titleBg = new Graphics()
      .roundRect(-halfWidth, -halfHeight, panelWidth, panelHeight, panelRadius)
      .fill({ color: COLORS.UI_BG, alpha: WAVE_NOTIFY_PANEL_ALPHA })
      .stroke({ width: WAVE_NOTIFY_BORDER_WIDTH, color: COLORS.GOLD, alpha: WAVE_NOTIFY_BORDER_ALPHA });
    titleBg.position.set(width / 2, height / 2 + WAVE_NOTIFY_TITLE_OFFSET_Y * scale);
    
    // 外层光晕
    const glowPadding = WAVE_NOTIFY_GLOW_PADDING * scale;
    const glowHalfWidth = halfWidth + glowPadding;
    const glowHalfHeight = halfHeight + glowPadding;
    const glow = new Graphics()
      .roundRect(-glowHalfWidth, -glowHalfHeight, glowHalfWidth * 2, glowHalfHeight * 2, WAVE_NOTIFY_GLOW_RADIUS * scale)
      .stroke({ width: WAVE_NOTIFY_GLOW_WIDTH, color: COLORS.GOLD, alpha: WAVE_NOTIFY_GLOW_ALPHA });
    glow.position.set(width / 2, height / 2 + WAVE_NOTIFY_TITLE_OFFSET_Y * scale);
    
    // 波次文字
    const waveText = new Text({
      text: `第 ${waveLevel} 波`,
      style: {
        fill: COLORS.GOLD,
        fontSize: WAVE_NOTIFY_TITLE_SIZE * scale,
        fontWeight: 'bold',
        dropShadow: {
          color: COLORS.GOLD,
          blur: WAVE_NOTIFY_TITLE_SHADOW_BLUR * scale,
          alpha: WAVE_NOTIFY_TITLE_SHADOW_ALPHA,
          distance: 0,
        },
      },
    });
    waveText.anchor.set(0.5);
    waveText.position.set(width / 2, height / 2 + WAVE_NOTIFY_TITLE_OFFSET_Y * scale);
    
    // 副标题
    let subtitle = '准备迎战！';
    if (waveLevel === 1) {
      subtitle = '战斗开始！';
    } else if (waveLevel % 5 === 0) {
      subtitle = 'BOSS波来袭！';
    } else if (waveLevel >= 10) {
      subtitle = '敌人越来越强了！';
    }
    
    const subtitleText = new Text({
      text: subtitle,
      style: {
        fill: COLORS.TEXT_MAIN,
        fontSize: WAVE_NOTIFY_SUBTITLE_SIZE * scale,
        dropShadow: {
          color: COLORS.ALLY_BODY,
          blur: WAVE_NOTIFY_SUBTITLE_SHADOW_BLUR * scale,
          alpha: WAVE_NOTIFY_SUBTITLE_SHADOW_ALPHA,
          distance: 0,
        },
      },
    });
    subtitleText.anchor.set(0.5);
    subtitleText.position.set(width / 2, height / 2 + WAVE_NOTIFY_SUBTITLE_OFFSET_Y * scale);
    
    // 装饰线条
    const lineWidth = WAVE_NOTIFY_LINE_WIDTH * scale;
    const lineHalfWidth = lineWidth / 2;
    const decorLine1 = new Graphics()
      .rect(-lineHalfWidth, 0, lineWidth, WAVE_NOTIFY_LINE_HEIGHT)
      .fill({ color: COLORS.ALLY_BODY, alpha: WAVE_NOTIFY_LINE_ALPHA });
    decorLine1.position.set(width / 2, height / 2 + WAVE_NOTIFY_LINE_TOP_OFFSET_Y * scale);
    
    const decorLine2 = new Graphics()
      .rect(-lineHalfWidth, 0, lineWidth, WAVE_NOTIFY_LINE_HEIGHT)
      .fill({ color: COLORS.ALLY_BODY, alpha: WAVE_NOTIFY_LINE_ALPHA });
    decorLine2.position.set(width / 2, height / 2 + WAVE_NOTIFY_LINE_BOTTOM_OFFSET_Y * scale);
    
    // 组装
    notification.addChild(bg, glow, titleBg, decorLine1, waveText, subtitleText, decorLine2);
    this.layer.addChild(notification);
    
    // 动画效果
    notification.alpha = 0;
    waveText.scale.set(WAVE_NOTIFY_INITIAL_SCALE);
    subtitleText.alpha = 0;
    
    // 淡入和缩放动画
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / WAVE_NOTIFY_DURATION, 1);
      
      if (progress < WAVE_NOTIFY_FADE_IN_RATIO) {
        // 前30%：淡入和放大
        const t = progress / WAVE_NOTIFY_FADE_IN_RATIO;
        notification.alpha = t;
        waveText.scale.set(WAVE_NOTIFY_INITIAL_SCALE + (1 - WAVE_NOTIFY_INITIAL_SCALE) * t);
      } else if (progress < WAVE_NOTIFY_STAY_RATIO) {
        // 中间40%：保持
        notification.alpha = 1;
        waveText.scale.set(1);
        subtitleText.alpha = (progress - WAVE_NOTIFY_FADE_IN_RATIO) / (WAVE_NOTIFY_STAY_RATIO - WAVE_NOTIFY_FADE_IN_RATIO);
      } else {
        // 最后30%：淡出
        const t = (progress - WAVE_NOTIFY_STAY_RATIO) / (1 - WAVE_NOTIFY_STAY_RATIO);
        notification.alpha = 1 - t;
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // 动画结束，移除通知
        this.layer.removeChild(notification);
      }
    };
    
    animate();
  }

  showHelpScreen() {
    this.clear();
    this.currentScreen = SCREEN_STATE.HELP;
    
    const { width, height, scale } = this.getSize();

    const overlay = new Graphics()
      .rect(0, 0, width, height)
      .fill({ color: COLORS.UI_BG, alpha: START_OVERLAY_ALPHA });

    const title = new Text({
      text: '游戏说明',
      style: {
        fill: COLORS.GOLD,
        fontSize: HELP_TITLE_SIZE * scale,
      },
    });
    title.anchor.set(0.5);
    title.position.set(width / 2, height * HELP_TITLE_Y_RATIO);

    const body = new Text({
      text:
        '1. 拖拽底部绿色坦克放到网格中即可部署武器（消耗金币）。\n'
        + '2. 点击武器后可看到"升级 / 卖掉"按钮，升级会提升子弹大小、速度和颜色。\n'
        + '3. 敌人从左侧沿格子前进，会自动躲避武器并朝武器开火。\n'
        + '4. 敌人和武器都有血条；击毁敌人可获得金币，被击毁的武器需要重新部署。\n'
        + '5. 顶部显示当前金币数量，请合理规划布防和升级节奏。',
      style: {
        fill: COLORS.TEXT_MAIN,
        fontSize: HELP_BODY_SIZE * scale,
        wordWrap: true,
        wordWrapWidth: width * HELP_BODY_WIDTH_RATIO,
        lineHeight: HELP_BODY_LINE_HEIGHT * scale,
      },
    });
    body.anchor.set(0.5, 0);
    body.position.set(width / 2, height * HELP_BODY_Y_RATIO);

    const btnWidth = HELP_BACK_BTN_WIDTH * scale;
    const btnHeight = HELP_BACK_BTN_HEIGHT * scale;
    const btnRadius = HELP_BACK_BTN_RADIUS * scale;
    
    const backButton = new Graphics()
      .roundRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, btnRadius)
      .fill({ color: COLORS.UI_BORDER })
      .stroke({ width: HELP_BACK_BTN_STROKE, color: COLORS.ALLY_BODY, alpha: 1 });

    const backLabel = new Text({
      text: '返回主菜单',
      style: {
        fill: COLORS.TEXT_MAIN,
        fontSize: HELP_BACK_BTN_SIZE * scale,
      },
    });
    backLabel.anchor.set(0.5);
    backButton.addChild(backLabel);
    backButton.position.set(width / 2, height * HELP_BACK_BTN_Y_RATIO);
    backButton.eventMode = 'static';
    backButton.cursor = 'pointer';
    backButton.on('pointerdown', () => {
      this.showStartScreen();
    });

    this.layer.addChild(overlay, title, body, backButton);
  }

  showStartScreen() {
    this.clear();
    this.currentScreen = SCREEN_STATE.START;
    
    const { width, height, scale } = this.getSize();

    const overlay = new Graphics()
      .rect(0, 0, width, height)
      .fill({ color: COLORS.UI_BG, alpha: START_OVERLAY_ALPHA });

    const title = new Text({
      text: '坦克防御 · Tower Game',
      style: {
        fill: COLORS.GOLD,
        fontSize: START_TITLE_SIZE * scale,
      },
    });
    title.anchor.set(0.5);
    title.position.set(width / 2, height * START_TITLE_Y_RATIO);

    const subtitle = new Text({
      text: '拖拽坦克布防，升级武器抵挡一波又一波敌人。',
      style: {
        fill: COLORS.TEXT_SUB,
        fontSize: START_SUBTITLE_SIZE * scale,
      },
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(width / 2, height * START_SUBTITLE_Y_RATIO);

    const startBtnWidth = START_BTN_WIDTH * scale;
    const startBtnHeight = START_BTN_HEIGHT * scale;
    const startBtnRadius = START_BTN_RADIUS * scale;
    
    const startButton = new Graphics()
      .roundRect(-startBtnWidth / 2, -startBtnHeight / 2, startBtnWidth, startBtnHeight, startBtnRadius)
      .fill({ color: COLORS.SUCCESS })
      .stroke({ width: START_BTN_STROKE, color: COLORS.SUCCESS_DARK, alpha: 1 });

    const startLabel = new Text({
      text: '开始游戏',
      style: {
        fill: COLORS.TEXT_LIGHT,
        fontSize: START_BTN_SIZE * scale,
      },
    });
    startLabel.anchor.set(0.5);
    startButton.addChild(startLabel);
    startButton.position.set(width / 2, height * START_BTN_Y_RATIO);
    startButton.eventMode = 'static';
    startButton.cursor = 'pointer';
    startButton.on('pointerdown', () => {
      // 清理 UI 层并回调到外部，真正开始游戏
      this.clear();
      this.currentScreen = SCREEN_STATE.NONE;
      if (typeof this.onStartGame === 'function') {
        this.onStartGame();
      }
    });

    const helpBtnWidth = START_HELP_BTN_WIDTH * scale;
    const helpBtnHeight = START_HELP_BTN_HEIGHT * scale;
    const helpBtnRadius = START_HELP_BTN_RADIUS * scale;
    
    const helpButton = new Graphics()
      .roundRect(-helpBtnWidth / 2, -helpBtnHeight / 2, helpBtnWidth, helpBtnHeight, helpBtnRadius)
      .fill({ color: COLORS.UI_BORDER })
      .stroke({ width: START_BTN_STROKE, color: COLORS.ALLY_BODY, alpha: 1 });

    const helpLabel = new Text({
      text: '游戏说明',
      style: {
        fill: COLORS.TEXT_MAIN,
        fontSize: START_HELP_BTN_SIZE * scale,
      },
    });
    helpLabel.anchor.set(0.5);
    helpButton.addChild(helpLabel);
    helpButton.position.set(width / 2, height * START_HELP_BTN_Y_RATIO);
    helpButton.eventMode = 'static';
    helpButton.cursor = 'pointer';
    helpButton.on('pointerdown', () => {
      this.showHelpScreen();
    });

    this.layer.addChild(overlay, title, subtitle, startButton, helpButton);
  }
}
