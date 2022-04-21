

//武器一
import {GRID_WIDTH, TYPE} from "./index";

import {
    BULLET_ONE_LEVEL_1,
    BULLET_ONE_LEVEL_2,
    BULLET_ONE_LEVEL_3,
    BULLET_TWO_LEVEL_1,
    BULLET_TWO_LEVEL_2,
    BULLET_TWO_LEVEL_3,
    BULLET_THREE_LEVEL_1,
    BULLET_THREE_LEVEL_2,
    BULLET_THREE_LEVEL_3
} from "./bullet";

const ARMS_ONE = {
    x: 10,
    y: 0,
    src: './assets/arms/armsOne.png',
    rect: [0, 0, 128, 128], //精灵图片绘制区域截图
    type: TYPE.ARMS,
    gridX: 0,
    gridY: 0,
    srcRotate: 0.25*Math.PI,
    originRotate: 0.25*Math.PI,
    levelNum: 0,
    money: 10,
    level: [
        {
            bullet: BULLET_ONE_LEVEL_1,
            attackRange: 120, //攻击范围
            upgradeMoney: 20,
            sailMoney: 10,
        },
        {
            bullet: BULLET_ONE_LEVEL_2,
            attackRange: 130, //攻击范围
            upgradeMoney: 30,
            sailMoney: 15,
        },
        {
            bullet: BULLET_ONE_LEVEL_3,
            attackRange: 140, //攻击范围
            upgradeMoney: 40,
            sailMoney: 20,
        }
    ]
}

//武器二
const ARMS_TWO = {
    x: GRID_WIDTH+20,
    y: 0,
    src: './assets/arms/armsTwo.png',
    rect: [11, 10, 108, 108], //精灵图片绘制区域截图
    attackRange: 160, //攻击范围
    maxBullet: 4, //子弹发射速度
    attackBlood: 2, //子弹攻击的威力
    type: TYPE.ARMS,
    gridX: 0,
    gridY: 0,
    srcRotate: 0,
    originRotate: 0,
    levelNum: 0,
    money: 20,
    level: [
        {
            bullet: BULLET_TWO_LEVEL_1,
            attackRange: 160, //攻击范围
            upgradeMoney: 20,
            sailMoney: 10,
        },
        {
            bullet: BULLET_TWO_LEVEL_2,
            attackRange: 180, //攻击范围
            upgradeMoney: 30,
            sailMoney: 15,
        },
        {
            bullet: BULLET_TWO_LEVEL_3,
            attackRange: 200, //攻击范围
            upgradeMoney: 40,
            sailMoney: 20,
        }
    ]
}

//武器三
const ARMS_THREE = {
    x: GRID_WIDTH*2+30,
    y: 0,
    src: './assets/arms/armsThree.png',
    rect: [23, 19, 100, 100], //精灵图片绘制区域截图
    attackRange: 120, //攻击范围
    maxBullet: 3, //子弹发射速度
    attackBlood: 1, //子弹攻击的威力
    type: TYPE.ARMS,
    gridX: 0,
    gridY: 0,
    srcRotate: Math.PI,
    originRotate: Math.PI*0.5,
    levelNum: 0,
    money: 30,
    level: [
        {
            bullet: BULLET_THREE_LEVEL_1,
            attackRange: 160, //攻击范围
            upgradeMoney: 20,
            sailMoney: 10,
        },
        {
            bullet: BULLET_THREE_LEVEL_2,
            attackRange: 180, //攻击范围
            upgradeMoney: 30,
            sailMoney: 15,
        },
        {
            bullet: BULLET_THREE_LEVEL_3,
            attackRange: 200, //攻击范围
            upgradeMoney: 40,
            sailMoney: 20,
        }
    ]
}

export {
    ARMS_ONE,
    ARMS_TWO,
    ARMS_THREE
}
