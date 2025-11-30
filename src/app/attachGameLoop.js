import { particleSystem } from '../core/particleSystem';

export function attachGameLoop(context) {
  const { app } = context;
  if (!app) {
    throw new Error('[attachGameLoop] context.app 未初始化');
  }

  const tickerFn = (delta) => {
    if (!context.state.gameStarted) return;

    const enemyManager = context.getManager('enemies');
    const weaponContainer = context.getManager('weapons');
    if (!enemyManager || !weaponContainer) return;

    const deltaMS = app.ticker.deltaMS;
    enemyManager.update(delta, deltaMS);
    weaponContainer.update(delta, deltaMS, enemyManager.getEnemies());
    particleSystem.update(deltaMS);

    const gridBackground = context.getSystem('gridBackground');
    if (gridBackground && typeof gridBackground.update === 'function') {
      gridBackground.update(deltaMS);
    }

    const goldManager = context.getManager('gold');
    if (goldManager && typeof goldManager.updateMiniMap === 'function') {
      goldManager.updateMiniMap(
        enemyManager.getEnemies(),
        weaponContainer.weapons,
        context.world,
      );
    }
  };

  app.ticker.add(tickerFn);

  return () => {
    app.ticker.remove(tickerFn);
  };
}


