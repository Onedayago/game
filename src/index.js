import { Application, Container, Graphics } from 'pixi.js';
import {
  APP_WIDTH,
  APP_HEIGHT,
  APP_BACKGROUND,
  APP_ANTIALIAS,
  BODY_MARGIN,
  CELL_SIZE,
  WEAPON_CONTAINER_HEIGHT,
  WEAPON_CONTAINER_MARGIN_BOTTOM,
  WORLD_WIDTH,
  TOP_UI_HEIGHT,
  BATTLE_HEIGHT,
  TOP_UI_BG_COLOR,
  BOTTOM_UI_BG_COLOR,
} from './constants';
import { GridBackground } from './systems/background';
import { WeaponContainer } from './ui/weaponContainer';
import { EnemyManager } from './systems/enemyManager';
import { GoldManager } from './ui/goldManager';
import { GameUI } from './ui/gameUI';
import { soundManager } from './core/soundManager';
import { particleSystem } from './core/particleSystem';

async function main() {
  // 创建 PIXI 应用（画布）—— 使用新推荐的 init API，避免过时构造函数
  const app = new Application();
  await app.init({
    width: APP_WIDTH,
    height: APP_HEIGHT,
    background: APP_BACKGROUND, // 背景色（深蓝）
    antialias: APP_ANTIALIAS,
  });

  // 把 canvas 加到页面上
  document.body.style.margin = BODY_MARGIN;
  document.body.appendChild(app.canvas);

  // 初始化声音系统
  soundManager.init();

  // 背景分区：顶部金币区、中部战场、底部武器库
  const layoutBackground = new Graphics();
  layoutBackground.zIndex = -500;
  const topHeight = TOP_UI_HEIGHT;
  const middleHeight = BATTLE_HEIGHT;
  const bottomHeight = APP_HEIGHT - topHeight - middleHeight;
  layoutBackground
    .rect(0, 0, APP_WIDTH, topHeight)
    .fill({ color: TOP_UI_BG_COLOR });
  layoutBackground
    .rect(0, topHeight, APP_WIDTH, middleHeight)
    .fill({ color: APP_BACKGROUND });
  layoutBackground
    .rect(0, topHeight + middleHeight, APP_WIDTH, bottomHeight)
    .fill({ color: BOTTOM_UI_BG_COLOR });
  app.stage.addChild(layoutBackground);

  // 创建世界容器：中间战场区域的所有元素（背景、敌人、武器等）都放在这里
  // 通过平移 worldContainer 来实现视野左右拖拽，而顶部金币和底部武器容器保持固定
  const worldContainer = new Container();
  worldContainer.x = 0;
  worldContainer.y = topHeight;
  // 允许根据 zIndex 排序，便于将粒子层永远放在背景之上
  worldContainer.sortableChildren = true;
  // 挂到 app 上，方便其它模块访问
  // eslint-disable-next-line no-param-reassign
  app.world = worldContainer;
  // 放到最底层，后续的 UI（金币条、武器容器、开始界面等）会覆盖在上面
  app.stage.addChildAt(worldContainer, 0);
  // 不再使用裁剪遮罩，允许特效超出战场可视高度

  // 初始化粒子系统
  particleSystem.init(worldContainer);

  // 金币管理与展示（画布最上方一行）
  const goldManager = new GoldManager(app, worldContainer);

  let gameStarted = false;
  let weaponContainer = null;
  let enemyManager = null;
  let gridBackground = null;

  // 视野拖拽（只允许在中间战场区域左右拖动）
  let isPanning = false;
  let panStartX = 0;
  let worldStartX = 0;

  const playableTop = topHeight; // 战场起始于中间区域
  const playableBottom = topHeight + middleHeight;

  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;

  app.stage.on('pointerdown', (event) => {
    const { x, y } = event.global;
    // 只在中间战场区域内按下时，才认为是拖拽视野
    if (y >= playableTop && y <= playableBottom) {
      isPanning = true;
      panStartX = x;
      worldStartX = worldContainer.x;
    }
  });

  app.stage.on('pointermove', (event) => {
    if (!isPanning) return;
    const { x } = event.global;
    const dx = x - panStartX;
    let nextX = worldStartX + dx;
    // 限制世界容器的左右边界，使得不会拖出空白区域
    const minX = APP_WIDTH - WORLD_WIDTH;
    const maxX = 0;
    if (nextX < minX) nextX = minX;
    if (nextX > maxX) nextX = maxX;
    worldContainer.x = nextX;
  });

  app.stage.on('pointerup', () => {
    isPanning = false;
  });
  app.stage.on('pointerupoutside', () => {
    isPanning = false;
  });

  const startGame = () => {
    if (gameStarted) return;
    gameStarted = true;

    // 在玩家点击“开始游戏”时启动背景音乐（符合浏览器交互要求）
    soundManager.playBackground();

    // 创建网格背景（会自动加到 app.world 中）
    gridBackground = new GridBackground(app);

    // 创建武器容器（底部中间），从中拖拽坦克武器到网格格子
    weaponContainer = new WeaponContainer(app, goldManager);

    // 创建敌人管理器：从画布最左侧随机格子生成红色敌人坦克，沿格子路径向右移动并躲避武器坦克
    enemyManager = new EnemyManager(app, weaponContainer, goldManager);
  };

  // 使用独立的 UI 类处理开始界面和游戏说明界面
  const gameUI = new GameUI(app, {
    onStartGame: startGame,
  });

  // 先展示开始菜单，等待玩家点击
  gameUI.showStartScreen();

  // 游戏主循环：更新敌人和武器（仅在游戏开始后执行）
  app.ticker.add((delta) => {
    if (!gameStarted || !enemyManager || !weaponContainer) return;
    const deltaMS = app.ticker.deltaMS;
    enemyManager.update(delta, deltaMS);
    weaponContainer.update(delta, deltaMS, enemyManager.getEnemies());
    particleSystem.update(deltaMS);
    if (gridBackground) {
      gridBackground.update(deltaMS);
    }
    // 同步更新右上角缩略小地图
    goldManager.updateMiniMap(
      enemyManager.getEnemies(),
      weaponContainer.weapons,
      worldContainer,
    );
  });
}

main().catch((err) => {
  // 简单错误输出，防止初始化失败静默
  // eslint-disable-next-line no-console
  console.error(err);
});

