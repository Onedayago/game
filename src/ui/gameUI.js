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
 * 负责处理游戏的开始界面和游戏说明界面
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


