import * as PIXI from 'pixi.js';
import {EventSystem} from "@pixi/events";
import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    GRID_WIDTH,
    GRID_HEIGHT,
    ATTACK_TIME,
    GAME_STATE,
} from "./constant/index";
import {BULLET_ONE, BULLET_TWO, BULLET_THREE} from "./constant/bullet";
import {ARMS_ONE, ARMS_TWO, ARMS_THREE} from "./constant/arms";
import {ENEMY_ONE, ENEMY_PRODUCE, ENEMY_THREE, ENEMY_TWO} from "./constant/enemy";
import EnemySprite from './EnemyContainer';
import ArmsSprite from './ArmsContainer';
import Map from "./Map";
import ArmsBox from "./ArmsBox";
import MapGrid from "./MapGrid";
import Money from "./Money";
import Game from "./Game";

delete PIXI.Renderer.__plugins.interaction;
//初始化画布
let app = new PIXI.Application({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    antialias: true,    // default: false 反锯齿
    transparent: true, // default: false 透明度
    resolution: 1       // default: 1 分辨率
});

global.app = app;

document.body.appendChild(app.view);
app.stage.interactive = true;
app.stage.hitArea = app.renderer.screen;
if (!('events' in app.renderer)) {
    app.renderer.addSystem(EventSystem, 'events');
}

MapGrid.initGrid();

//判断碰撞的循环
let attackTime = 0;

//敌人数组
let enemyArr = [];

//游戏当前时间
let gameTime = 0;

console.log()

app.loader
    .add(ENEMY_ONE.src)
    .add(ENEMY_TWO.src)
    .add(ENEMY_THREE.src)
    .add(ARMS_ONE.src)
    .add(ARMS_TWO.src)
    .add(ARMS_THREE.src)
    .add(BULLET_ONE.src)
    .add(BULLET_TWO.src)
    .add(BULLET_THREE.src)
    .load(()=>{

        //初始化地图
        const map = Map.initMap();
        //加载地图到画布
        app.stage.addChild(map);

        //初始化敌人
        let  enemySprite = new EnemySprite(ENEMY_ONE);
        enemySprite.initBlood();
        enemyArr.push(enemySprite);
        //加载敌人到地图中
        map.addChild(enemySprite.getContainer());

        //初始化武器容器
        const armsBox = ArmsBox.initArmsBox();
        //加载武器容器到画布
        app.stage.addChild(armsBox);

        //初始化武器一
        const armsOne = new ArmsSprite(ARMS_ONE);
        armsOne.setInteractive(true);
        //加载武器一到武器容器
        armsBox.addChild(armsOne.getContainer());

        //初始化武器二
        const armsTwo = new ArmsSprite(ARMS_TWO);
        armsTwo.setInteractive(true);
        //加载武器二到武器容器
        armsBox.addChild(armsTwo.getContainer());

        //初始化武器三
        const armsThree = new ArmsSprite(ARMS_THREE);
        armsThree.setInteractive(true);
        //加载武器三到武器容器
        armsBox.addChild(armsThree.getContainer());

        //初始化金币
        const money = Money.initMoneyBox();
        app.stage.addChild(money);

        const game = Game.initGameState();
        app.stage.addChild(game);

        //处理触控开始事件
        app.stage.addEventListener('touchstart', (e) => {
            if(Map.onTouchStart(e)){
                return;
            }
        }, false);

        //处理触控移动事件
        app.stage.addEventListener('touchmove', (e) => {
            if(Map.onTouchMove(e)){
                return;
            }
        }, false);

        //处理触控结束事件
        app.stage.addEventListener('touchend', (e) => {
            Map.onTouchEnd(e);
        }, false);

        function gameLoop(time){
            gameTime = (app.ticker.lastTime/1000).toFixed(0);
            enemyTouch();
            moveArmsBullet();
            addEnemy();
            moveEnemy();
        }

        global.gameLoop = gameLoop;


        //增加敌人
        function addEnemy(){
            //初始化敌人
            if(ENEMY_PRODUCE[gameTime] && !ENEMY_PRODUCE[gameTime]?.isAdd){
                ENEMY_PRODUCE[gameTime].isAdd = true;
                let  enemySprite = new EnemySprite(ENEMY_PRODUCE[gameTime]?.enemy);
                enemySprite.initBlood();
                enemyArr.push(enemySprite);
                //加载敌人到地图中
                map.addChild(enemySprite.getContainer());
            }
        }

        //移动敌人
        function moveEnemy(){
            for(let i = 0; i<enemyArr.length;i++){
                const enemy = enemyArr[i];
                enemy.move();
                if(enemy.isDie){
                    map.removeChild(enemy.getContainer());
                }
            }
            const arr = enemyArr.filter((item)=>!item.isDie);
            enemyArr = arr;
        }

        //敌人进入武器攻击范围
        function enemyTouch(){
            attackTime++;
            if(attackTime >= ATTACK_TIME){
                for (let i = 0; i < Map.liveArms.length; i++){
                    const liveArms = Map.liveArms[i];
                    liveArms.attackEnemy = null;
                }
                for(let j = 0; j < enemyArr.length; j++){
                    const enemySprite = enemyArr[j];
                    for (let i = 0; i < Map.liveArms.length; i++){
                        const liveArms = Map.liveArms[i];
                        let armsX = liveArms?.getContainer().x + GRID_WIDTH/2;
                        let armsY = liveArms?.getContainer().y + GRID_HEIGHT/2;
                        let enemyX = enemySprite.getContainer().x + GRID_WIDTH/2;
                        let enemyY = enemySprite.getContainer().y + GRID_HEIGHT/2;
                        let distance = liveArms?.getDistance(armsX, armsY, enemyX, enemyY);
                        let level = liveArms?.obj?.level[liveArms.obj.levelNum];
                        if(distance < level?.attackRange){
                            liveArms?.drawBullet(enemyX-(armsX-GRID_WIDTH/2), enemyY-(armsY-GRID_WIDTH/2), enemySprite);
                        }
                    }
                }
                attackTime = 0;
            }
        }

        //移动武器的子弹
        function moveArmsBullet () {
            for (let i = 0; i < Map.liveArms.length; i++){
                const liveArms = Map.liveArms[i];
                liveArms?.moveBullet();
            }
        }
    });


