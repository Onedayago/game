import { Application, Container } from 'pixi.js';
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
} from './constants';
import { GridBackground } from './background';
import { WeaponContainer } from './weaponContainer';
import { EnemyManager } from './enemyManager';
import { GoldManager } from './goldManager';
import { GameUI } from './gameUI';
import { soundManager } from './soundManager';

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

  // 创建世界容器：中间战场区域的所有元素（背景、敌人、武器等）都放在这里
  // 通过平移 worldContainer 来实现视野左右拖拽，而顶部金币和底部武器容器保持固定
  const worldContainer = new Container();
  worldContainer.x = 0;
  worldContainer.y = 0;
  // 挂到 app 上，方便其它模块访问
  // eslint-disable-next-line no-param-reassign
  app.world = worldContainer;
  // 放到最底层，后续的 UI（金币条、武器容器、开始界面等）会覆盖在上面
  app.stage.addChildAt(worldContainer, 0);

  // 金币管理与展示（画布最上方一行）
  const goldManager = new GoldManager(app);

  let gameStarted = false;
  let weaponContainer = null;
  let enemyManager = null;

  // 视野拖拽（只允许在中间战场区域左右拖动）
  let isPanning = false;
  let panStartX = 0;
  let worldStartX = 0;

  const playableTop = CELL_SIZE; // 顶部一行用于金币展示
  const playableBottom =
    APP_HEIGHT - WEAPON_CONTAINER_HEIGHT - WEAPON_CONTAINER_MARGIN_BOTTOM * 2;

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
    new GridBackground(app);

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

