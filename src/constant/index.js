
//画布长宽
const CANVAS_WIDTH = window.screen.height;
const CANVAS_HEIGHT= window.screen.width;

//方格的长宽和数量
const GRID_WIDTH = 60;
const GRID_HEIGHT = 60;
const GRID_ROW_NUM = 10;
const GRID_COLUMN_NUM = 20;

//地图的长宽
const MAP_WIDTH = GRID_WIDTH*GRID_COLUMN_NUM;
const MAP_HEIGHT = GRID_HEIGHT*GRID_ROW_NUM;

//武器攻击范围颜色
const ATTACK_RANGE_COLOR = 0x9966FF;

//碰撞检测的速度
const ATTACK_TIME = 30;

//地图上物体类型
const TYPE = {
    ENEMY: 'enemy',
    ARMS: 'arms'
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
    x: CANVAS_WIDTH-150,
    y: 50,
}

//方向
const DIRECTION = {
    LEFT: 'left',
    RIGHT: 'right',
    TOP: 'top',
    BOTTOM: 'bottom',
    STOP: 'stop'
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
    x: CANVAS_WIDTH-150,
    y: 10,
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
    ATTACK_RANGE_COLOR,
    ATTACK_TIME,
    TYPE,
    BG,
    MONEY_BOX,
    GAME_STATE,
    GAME_BOX,
}