import {
  APP_WIDTH,
  WORLD_WIDTH,
  TOP_UI_HEIGHT,
  BATTLE_HEIGHT,
} from '../constants';

export function setupStagePanning(app, worldContainer) {
  let isPanning = false;
  let panStartX = 0;
  let worldStartX = 0;

  const playableTop = TOP_UI_HEIGHT;
  const playableBottom = TOP_UI_HEIGHT + BATTLE_HEIGHT;

  const onPointerDown = (event) => {
    const { x, y } = event.global;
    if (y >= playableTop && y <= playableBottom) {
      isPanning = true;
      panStartX = x;
      worldStartX = worldContainer.x;
    }
  };

  const onPointerMove = (event) => {
    if (!isPanning) return;
    const dx = event.global.x - panStartX;
    let nextX = worldStartX + dx;
    const minX = APP_WIDTH - WORLD_WIDTH;
    const maxX = 0;
    if (nextX < minX) nextX = minX;
    if (nextX > maxX) nextX = maxX;
    worldContainer.x = nextX;
  };

  const stopPanning = () => {
    isPanning = false;
  };

  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;

  app.stage.on('pointerdown', onPointerDown);
  app.stage.on('pointermove', onPointerMove);
  app.stage.on('pointerup', stopPanning);
  app.stage.on('pointerupoutside', stopPanning);

  return () => {
    app.stage.off('pointerdown', onPointerDown);
    app.stage.off('pointermove', onPointerMove);
    app.stage.off('pointerup', stopPanning);
    app.stage.off('pointerupoutside', stopPanning);
  };
}


