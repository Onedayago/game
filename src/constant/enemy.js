

//敌人一
import {GRID_HEIGHT, GRID_WIDTH, TYPE} from "./index";
import {getSrc} from "../util";

const ENEMY_ONE = {
    x: -GRID_WIDTH,  //坐标系的 x
    y: 5*GRID_HEIGHT, //坐标系的 y
    src: './assets/enemy/enemyOne.png', //敌人图片
    speed: 0.5, //敌人移动速度
    rect: [49, 28, 74, 74], //精灵图片绘制区域截图
    gridX: 0,  //在方格中的坐标
    gridY: 5,  //在方格中的坐标
    blood: 5, //血量
    type: TYPE.ENEMY,
    money: 10,
}

const ENEMY_TWO = {
    x: -GRID_WIDTH,  //坐标系的 x
    y: 5*GRID_HEIGHT, //坐标系的 y
    src: './assets/enemy/enemyTwo.png', //敌人图片
    speed: 0.8, //敌人移动速度
    rect: [49, 28, 74, 74], //精灵图片绘制区域截图
    gridX: 0,  //在方格中的坐标
    gridY: 5,  //在方格中的坐标
    blood: 50, //血量
    type: TYPE.ENEMY,
    money: 20,
}

const ENEMY_THREE = {
    x: -GRID_WIDTH,  //坐标系的 x
    y: 5*GRID_HEIGHT, //坐标系的 y
    src: './assets/enemy/enemyThree.png', //敌人图片
    speed: 0.8, //敌人移动速度
    rect: [49, 28, 74, 74], //精灵图片绘制区域截图
    gridX: 0,  //在方格中的坐标
    gridY: 5,  //在方格中的坐标
    blood: 50, //血量
    type: TYPE.ENEMY,
    money: 30,
}

const ENEMY_PRODUCE = {
    5: {
        enemy: ENEMY_ONE,
        isAdd: false,
    },
    10: {
        enemy: ENEMY_ONE,
        isAdd: false,
    },
    18: {
        enemy: ENEMY_ONE,
        isAdd: false,
    },
    24: {
        enemy: ENEMY_ONE,
        isAdd: false,
    },
    30: {
        enemy: ENEMY_ONE,
        isAdd: false,
    },
    40: {
        enemy: ENEMY_ONE,
        isAdd: false,
    },
    50: {
        enemy: ENEMY_ONE,
        isAdd: false,
    },
    60: {
        enemy: ENEMY_ONE,
        isAdd: false,
    },
    70: {
        enemy: ENEMY_ONE,
        isAdd: false,
    },
    80: {
        enemy: ENEMY_THREE,
        isAdd: false,
    },
    90: {
        enemy: ENEMY_ONE,
        isAdd: false,
    },
    100: {
        enemy: ENEMY_THREE,
        isAdd: false,
    },
    110: {
        enemy: ENEMY_THREE,
        isAdd: false,
    },
    140: {
        enemy: ENEMY_ONE,
        isAdd: false,
    },
    160: {
        enemy: ENEMY_THREE,
        isAdd: false,
    },
    180: {
        enemy: ENEMY_ONE,
        isAdd: false,
    },
    200: {
        enemy: ENEMY_THREE,
        isAdd: false,
    },
    210: {
        enemy: ENEMY_ONE,
        isAdd: false,
    },
}

export {
    ENEMY_ONE,
    ENEMY_TWO,
    ENEMY_THREE,
    ENEMY_PRODUCE
}
