import { GridBackground } from './systems/background';
import { WeaponContainer } from './ui/weaponContainer';
import { EnemyManager } from './systems/enemyManager';
import { GoldManager } from './ui/goldManager';
import { GameUI } from './ui/gameUI';
import { soundManager } from './core/soundManager';
import { particleSystem } from './core/particleSystem';
import { GameContext } from './app/GameContext';
import { createPixiApp } from './app/createPixiApp';
import { createWorldLayers } from './app/createWorldLayers';
import { setupStagePanning } from './app/setupStagePanning';
import { attachGameLoop } from './app/attachGameLoop';

async function main() {
  const context = new GameContext();
  const app = await createPixiApp();
  context.setApp(app);

  soundManager.init();

  const { worldContainer } = createWorldLayers(app);
  context.setWorld(worldContainer);

  particleSystem.init(worldContainer);

  const detachPanning = setupStagePanning(app, worldContainer);
  context.attachCleanup(detachPanning);

  const goldManager = context.registerManager('gold', new GoldManager(app, worldContainer));

  const detachTicker = attachGameLoop(context);
  context.attachCleanup(detachTicker);

  const buildBattleSystems = () => {
    const gridBackground = context.registerSystem('gridBackground', new GridBackground(app));
    const weaponContainer = context.registerManager(
      'weapons',
      new WeaponContainer(app, goldManager),
    );
    const enemyManager = context.registerManager(
      'enemies',
      new EnemyManager(app, weaponContainer, goldManager),
    );

    return { gridBackground, weaponContainer, enemyManager };
  };

  const startGame = () => {
    if (context.state.gameStarted) return;
    context.state.gameStarted = true;
    soundManager.playBackground();
    buildBattleSystems();
  };

  const gameUI = context.registerSystem(
    'gameUI',
    new GameUI(app, {
      onStartGame: startGame,
    }),
  );
  gameUI.showStartScreen();

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => context.dispose());
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
});

