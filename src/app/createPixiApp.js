import { Application } from 'pixi.js';
import {
  APP_WIDTH,
  APP_HEIGHT,
  APP_BACKGROUND,
  APP_ANTIALIAS,
  BODY_MARGIN,
} from '../constants';

export async function createPixiApp() {
  const app = new Application();
  await app.init({
    width: APP_WIDTH,
    height: APP_HEIGHT,
    background: APP_BACKGROUND,
    antialias: APP_ANTIALIAS,
  });

  if (typeof document !== 'undefined' && document.body) {
    document.body.style.margin = BODY_MARGIN;
    document.body.appendChild(app.canvas);
  }

  return app;
}


