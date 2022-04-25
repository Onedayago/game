

//敌人一
import {GRID_HEIGHT, GRID_WIDTH, TYPE} from "./index";

const ENEMY_ONE = {
    x: -GRID_WIDTH,  //坐标系的 x
    y: 5*GRID_HEIGHT, //坐标系的 y
    src: './assets/enemy/enemyOne.png', //敌人图片
    speed: 0.5, //敌人移动速度
    rect: [49, 28, 74, 74], //精灵图片绘制区域截图
    gridX: 0,  //在方格中的坐标
    gridY: 5,  //在方格中的坐标
    blood: 50, //血量
    type: TYPE.ENEMY,
    money: 10,
    srcRotate: 0,
    originRotate: 0,
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
    srcRotate: 0,
    originRotate: 0,
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
    srcRotate: 0,
    originRotate: 0,
}

const ENEMY_NUM = 100;

const ENEMY_PRODUCE = {

}
for(let i=0; i<ENEMY_NUM;i++){

    if(i < 30){
        let key = i*Math.floor(Math.random()*15);
        ENEMY_PRODUCE[key] = {
            enemy: ENEMY_ONE,
            isAdd: false
        }
    }else if(i < 60){
        let key = i*Math.floor(Math.random()*10);
        ENEMY_PRODUCE[key] = {
            enemy: ENEMY_TWO,
            isAdd: false
        }
    }else{
        let key = i*Math.floor(Math.random()*10);
        ENEMY_PRODUCE[key] = {
            enemy: ENEMY_THREE,
            isAdd: false
        }
    }

}



export {
    ENEMY_ONE,
    ENEMY_TWO,
    ENEMY_THREE,
    ENEMY_PRODUCE
}
