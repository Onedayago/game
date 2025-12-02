/**
 * 游戏UI管理器
 * 负责处理游戏的开始界面、帮助界面和结束界面
 * 
 * 主要功能：
 * - 显示开始游戏界面（带标题和开始按钮）
 * - 显示游戏说明界面（操作指南和返回按钮）
 * - 显示游戏结束界面（游戏失败提示）
 * - 管理UI层级和清理
 */

import {
  Container,
  Graphics,
  Text,
} from 'pixi.js';
import {
  APP_WIDTH,
  APP_HEIGHT,
  COLORS,
} from '../constants';

/**
 * 游戏UI类
 */
export class GameUI {
  constructor(app, options = {}) {
    this.app = app;
    this.onStartGame = options.onStartGame || null;

    this.layer = new Container();
    this.app.stage.addChild(this.layer);
  }

  clear() {
    this.layer.removeChildren();
  }

  /**
   * 显示波次通知
   * @param {number} waveLevel - 波次等级
   */
  showWaveNotification(waveLevel) {
    // 创建通知容器
    const notification = new Container();
    
    // 半透明背景
    const bg = new Graphics()
      .rect(0, 0, APP_WIDTH, APP_HEIGHT)
      .fill({ color: 0x000000, alpha: 0.4 });
    
    // 主标题背景（发光效果）
    const titleBg = new Graphics()
      .roundRect(-250, -60, 500, 120, 20)
      .fill({ color: COLORS.UI_BG, alpha: 0.95 })
      .stroke({ width: 3, color: COLORS.GOLD, alpha: 0.8 });
    titleBg.position.set(APP_WIDTH / 2, APP_HEIGHT / 2 - 50);
    
    // 外层光晕
    const glow = new Graphics()
      .roundRect(-260, -70, 520, 140, 25)
      .stroke({ width: 2, color: COLORS.GOLD, alpha: 0.3 });
    glow.position.set(APP_WIDTH / 2, APP_HEIGHT / 2 - 50);
    
    // 波次文字
    const waveText = new Text({
      text: `第 ${waveLevel} 波`,
      style: {
        fill: COLORS.GOLD,
        fontSize: 56,
        fontWeight: 'bold',
        dropShadow: {
          color: COLORS.GOLD,
          blur: 10,
          alpha: 0.8,
          distance: 0,
        },
      },
    });
    waveText.anchor.set(0.5);
    waveText.position.set(APP_WIDTH / 2, APP_HEIGHT / 2 - 50);
    
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
        fontSize: 24,
        dropShadow: {
          color: COLORS.ALLY_BODY,
          blur: 6,
          alpha: 0.6,
          distance: 0,
        },
      },
    });
    subtitleText.anchor.set(0.5);
    subtitleText.position.set(APP_WIDTH / 2, APP_HEIGHT / 2 + 30);
    
    // 装饰线条
    const decorLine1 = new Graphics()
      .rect(-150, 0, 300, 2)
      .fill({ color: COLORS.ALLY_BODY, alpha: 0.6 });
    decorLine1.position.set(APP_WIDTH / 2, APP_HEIGHT / 2 - 100);
    
    const decorLine2 = new Graphics()
      .rect(-150, 0, 300, 2)
      .fill({ color: COLORS.ALLY_BODY, alpha: 0.6 });
    decorLine2.position.set(APP_WIDTH / 2, APP_HEIGHT / 2 + 60);
    
    // 组装
    notification.addChild(bg, glow, titleBg, decorLine1, waveText, subtitleText, decorLine2);
    this.layer.addChild(notification);
    
    // 动画效果
    notification.alpha = 0;
    waveText.scale.set(0.5);
    subtitleText.alpha = 0;
    
    // 淡入和缩放动画
    const duration = 2000; // 2秒
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress < 0.3) {
        // 前30%：淡入和放大
        const t = progress / 0.3;
        notification.alpha = t;
        waveText.scale.set(0.5 + 0.5 * t);
      } else if (progress < 0.7) {
        // 中间40%：保持
        notification.alpha = 1;
        waveText.scale.set(1);
        subtitleText.alpha = (progress - 0.3) / 0.4;
      } else {
        // 最后30%：淡出
        const t = (progress - 0.7) / 0.3;
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

    const overlay = new Graphics()
      .rect(0, 0, APP_WIDTH, APP_HEIGHT)
      .fill({ color: COLORS.UI_BG, alpha: 0.95 });

    const title = new Text({
      text: '游戏说明',
      style: {
        fill: COLORS.GOLD,
        fontSize: 32,
      },
    });
    title.anchor.set(0.5);
    title.position.set(APP_WIDTH / 2, APP_HEIGHT * 0.18);

    const body = new Text({
      text:
        '1. 拖拽底部绿色坦克放到网格中即可部署武器（消耗金币）。\n'
        + '2. 点击武器后可看到“升级 / 卖掉”按钮，升级会提升子弹大小、速度和颜色。\n'
        + '3. 敌人从左侧沿格子前进，会自动躲避武器并朝武器开火。\n'
        + '4. 敌人和武器都有血条；击毁敌人可获得金币，被击毁的武器需要重新部署。\n'
        + '5. 顶部显示当前金币数量，请合理规划布防和升级节奏。',
      style: {
        fill: COLORS.TEXT_MAIN,
        fontSize: 18,
        wordWrap: true,
        wordWrapWidth: APP_WIDTH * 0.78,
        lineHeight: 26,
      },
    });
    body.anchor.set(0.5, 0);
    body.position.set(APP_WIDTH / 2, APP_HEIGHT * 0.24);

    const backButton = new Graphics()
      .roundRect(-80, -20, 160, 40, 12)
      .fill({ color: COLORS.UI_BORDER })
      .stroke({ width: 2, color: COLORS.ALLY_BODY, alpha: 1 });

    const backLabel = new Text({
      text: '返回主菜单',
      style: {
        fill: COLORS.TEXT_MAIN,
        fontSize: 18,
      },
    });
    backLabel.anchor.set(0.5);
    backButton.addChild(backLabel);
    backButton.position.set(APP_WIDTH / 2, APP_HEIGHT * 0.78);
    backButton.eventMode = 'static';
    backButton.cursor = 'pointer';
    backButton.on('pointerdown', () => {
      this.showStartScreen();
    });

    this.layer.addChild(overlay, title, body, backButton);
  }

  showStartScreen() {
    this.clear();

    const overlay = new Graphics()
      .rect(0, 0, APP_WIDTH, APP_HEIGHT)
      .fill({ color: COLORS.UI_BG, alpha: 0.95 });

    const title = new Text({
      text: '坦克防御 · Tower Game',
      style: {
        fill: COLORS.GOLD,
        fontSize: 40,
      },
    });
    title.anchor.set(0.5);
    title.position.set(APP_WIDTH / 2, APP_HEIGHT * 0.3);

    const subtitle = new Text({
      text: '拖拽坦克布防，升级武器抵挡一波又一波敌人。',
      style: {
        fill: COLORS.TEXT_SUB,
        fontSize: 20,
      },
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(APP_WIDTH / 2, APP_HEIGHT * 0.38);

    const startButton = new Graphics()
      .roundRect(-100, -26, 200, 52, 18)
      .fill({ color: COLORS.SUCCESS })
      .stroke({ width: 2, color: 0x16a34a, alpha: 1 });

    const startLabel = new Text({
      text: '开始游戏',
      style: {
        fill: 0xf9fafb,
        fontSize: 22,
      },
    });
    startLabel.anchor.set(0.5);
    startButton.addChild(startLabel);
    startButton.position.set(APP_WIDTH / 2, APP_HEIGHT * 0.52);
    startButton.eventMode = 'static';
    startButton.cursor = 'pointer';
    startButton.on('pointerdown', () => {
      // 清理 UI 层并回调到外部，真正开始游戏
      this.clear();
      if (typeof this.onStartGame === 'function') {
        this.onStartGame();
      }
    });

    const helpButton = new Graphics()
      .roundRect(-90, -22, 180, 44, 14)
      .fill({ color: COLORS.UI_BORDER })
      .stroke({ width: 2, color: COLORS.ALLY_BODY, alpha: 1 });

    const helpLabel = new Text({
      text: '游戏说明',
      style: {
        fill: COLORS.TEXT_MAIN,
        fontSize: 18,
      },
    });
    helpLabel.anchor.set(0.5);
    helpButton.addChild(helpLabel);
    helpButton.position.set(APP_WIDTH / 2, APP_HEIGHT * 0.62);
    helpButton.eventMode = 'static';
    helpButton.cursor = 'pointer';
    helpButton.on('pointerdown', () => {
      this.showHelpScreen();
    });

    this.layer.addChild(overlay, title, subtitle, startButton, helpButton);
  }
}


