
//画布长宽
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT= 400;

//方格的长宽和数量
const GRID_WIDTH = 60;
const GRID_HEIGHT = 60;
const GRID_ROW_NUM = 10;
const GRID_COLUMN_NUM = 20;

//地图的长宽
const MAP_WIDTH = GRID_WIDTH*GRID_COLUMN_NUM;
const MAP_HEIGHT = GRID_HEIGHT*GRID_ROW_NUM;

//武器攻击范围颜色
const ATTACK_RANGE_COLOR_NORMAL = 0x9966FF;

//武器攻击范围不可放置
const ATTACK_RANGE_COLOR_WARN = 0xDC143C;

//碰撞检测的速度
const ATTACK_TIME = 30;

//地图上物体类型
const TYPE = {
    ENEMY: 'enemy',
    ARMS: 'arms',
    BASE: 'base'
}

//武器容器
const ARMS_BOX = {
    x: CANVAS_WIDTH/2 - GRID_WIDTH*4/2,
    y: CANVAS_HEIGHT-GRID_HEIGHT,
    width: GRID_WIDTH*4,
    height: GRID_HEIGHT
}

//金币容器
const MONEY_BOX = {
    x: CANVAS_WIDTH-200,
    y: CANVAS_HEIGHT - 30,
}

//方向
const DIRECTION = {
    LEFT: 'left',
    RIGHT: 'right',
    TOP: 'top',
    BOTTOM: 'bottom',
    STOP: 'stop'
}

//基地
const BASE = {
    x: 19*GRID_WIDTH,
    y: 5*GRID_WIDTH,
    src: './assets/myBase.png',
    rect: [0, 0, 64, 62], //精灵图片绘制区域截图
    type: TYPE.BASE,
    gridX: 19,
    gridY: 5,
    srcRotate: 0,
    originRotate: 0,
}

//背景
const BG = {
    x: 0,
    y: 0,
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    src: './assets/ground.jpg'
}

const GAME_STATE = {
    RUN: '运行',
    PAUSE: '暂停',
    FINISH: '结束'
}

//游戏状态容器
const GAME_BOX = {
    x: CANVAS_WIDTH-200,
    y: CANVAS_HEIGHT - 60,
}

const MIN_MAP = {
    x: CANVAS_WIDTH - MAP_WIDTH/5,
    y: 0,
    width: MAP_WIDTH/5,
    height: MAP_HEIGHT/5,
}

export {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    GRID_WIDTH,
    GRID_HEIGHT,
    DIRECTION,
    MAP_HEIGHT,
    MAP_WIDTH,
    GRID_ROW_NUM,
    GRID_COLUMN_NUM,
    ARMS_BOX,
    ATTACK_RANGE_COLOR_NORMAL,
    ATTACK_RANGE_COLOR_WARN,
    ATTACK_TIME,
    TYPE,
    BG,
    MONEY_BOX,
    GAME_STATE,
    GAME_BOX,
    BASE,
    MIN_MAP
}
