import { Container, Graphics } from 'pixi.js';
import {
  APP_WIDTH,
  APP_HEIGHT,
  TOP_UI_HEIGHT,
  BATTLE_HEIGHT,
  APP_BACKGROUND,
  TOP_UI_BG_COLOR,
  BOTTOM_UI_BG_COLOR,
} from '../constants';

export function createWorldLayers(app) {
  const layoutBackground = new Graphics();
  layoutBackground.zIndex = -500;

  const topHeight = TOP_UI_HEIGHT;
  const middleHeight = BATTLE_HEIGHT;
  const bottomHeight = APP_HEIGHT - topHeight - middleHeight;

  layoutBackground.rect(0, 0, APP_WIDTH, topHeight).fill({ color: TOP_UI_BG_COLOR });
  layoutBackground
    .rect(0, topHeight, APP_WIDTH, middleHeight)
    .fill({ color: APP_BACKGROUND });
  layoutBackground
    .rect(0, topHeight + middleHeight, APP_WIDTH, bottomHeight)
    .fill({ color: BOTTOM_UI_BG_COLOR });
  app.stage.addChild(layoutBackground);

  const worldContainer = new Container();
  worldContainer.x = 0;
  worldContainer.y = topHeight;
  worldContainer.sortableChildren = true;
  app.stage.addChildAt(worldContainer, 0);

  return {
    layoutBackground,
    worldContainer,
  };
}


