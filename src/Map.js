import * as PIXI from "pixi.js";
import {
    MAP_HEIGHT,
    MAP_WIDTH,
    GRID_COLUMN_NUM,
    GRID_ROW_NUM,
    GRID_WIDTH,
    GRID_HEIGHT,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    TYPE, BG,
    ATTACK_RANGE_COLOR_WARN,
    ATTACK_RANGE_COLOR_NORMAL,
} from "./constant";
import ArmsContainer from './ArmsContainer';
import ArmsBox from "./ArmsBox";
import MapGrid from "./MapGrid";
import Money from "./Money";
import GameSound from "./GameSound";
import MinMap from "./MinMap";

export default class Map {

    //地图上武器数组
    static liveArms = [];

    //移动地图变量
    static moveMap = null;


    //地图标线颜色
    static LINE_COLOR = {
        normal: 0x3518F1,
        warn: 0xEE0637,
    }

    //地图标线种类
    static LINE_STATUS = {
        NORMAL: 'normal',
        WARN: 'warn',
        HIDE: 'hide',
    }


    //从地图上删除武器
    static deleteLiveArms = (container) => {
        const arr = this.liveArms.filter((item)=>item.container._boundsID !== container.getContainer()._boundsID);
        MapGrid.getGrid().setWalkableAt(container.obj.gridX, container.obj.gridY, true);
        this.liveArms  = arr;
        this.map.removeChild(container.getContainer());
    }

    //初始化地图
    static initMap = () => {
        this.map = new PIXI.Container();
        this.map.width = MAP_WIDTH;
        this.map.height = MAP_HEIGHT;
        this.map.position.set(0,0);
        this.map.interactive = true;
        this.map.hitArea = new PIXI.Rectangle(0, 0, MAP_WIDTH, MAP_HEIGHT);
        this.bg = PIXI.Sprite.from(BG.src);
        this.bg.width = BG.width;
        this.bg.height = BG.height;
        this.bg.x = BG.x;
        this.bg.y = BG.y;
        this.map.addChild(this.bg);
        this.drawWarnLine();
        this.drawNormalLine();
        return this.map;
    }

    //绘制正常标线
    static drawNormalLine = () => {
        this.noramLine = new PIXI.Container();
        for(let i = 0; i < GRID_ROW_NUM; i++){
            const realPath = new PIXI.Graphics();
            realPath.lineStyle(1, this.LINE_COLOR.normal, 1);
            realPath.moveTo(0, 0);
            realPath.lineTo(MAP_WIDTH, 0);
            realPath.position.x = 0;
            realPath.position.y = i*GRID_HEIGHT;
            this.noramLine.addChild(realPath);
        }

        for(let i = 0; i < GRID_COLUMN_NUM; i++){
            const realPath = new PIXI.Graphics();
            realPath.lineStyle(1, this.LINE_COLOR.normal, 1);
            realPath.moveTo(0, 0);
            realPath.lineTo(0, MAP_HEIGHT);
            realPath.position.x = i*GRID_WIDTH;
            realPath.position.y = 0;
            this.noramLine.addChild(realPath);
        }

        this.map.addChild(this.noramLine);
        this.noramLine.visible = false;
    }

    //绘制警告标线
    static drawWarnLine = () => {
        this.warnLine = new PIXI.Container();
        for(let i = 0; i < GRID_ROW_NUM; i++){
            const realPath = new PIXI.Graphics();
            realPath.lineStyle(1, this.LINE_COLOR.warn, 1);
            realPath.moveTo(0, 0);
            realPath.lineTo(MAP_WIDTH, 0);
            realPath.position.x = 0;
            realPath.position.y = i*GRID_HEIGHT;
            this.warnLine.addChild(realPath);
        }

        for(let i = 0; i < GRID_COLUMN_NUM; i++){
            const realPath = new PIXI.Graphics();
            realPath.lineStyle(1, this.LINE_COLOR.warn, 1);
            realPath.moveTo(0, 0);
            realPath.lineTo(0, MAP_HEIGHT);
            realPath.position.x = i*GRID_WIDTH;
            realPath.position.y = 0;
            this.warnLine.addChild(realPath);
        }
        this.map.addChild(this.warnLine);
        this.warnLine.visible = false;
    }

    //更加标线状态绘制不同标线
    static drawLineByStatus(status) {
        switch (status){
            case this.LINE_STATUS.NORMAL:
                this.noramLine.visible = true;
                this.warnLine.visible = false;
                break;
            case this.LINE_STATUS.WARN:
                this.noramLine.visible = false;
                this.warnLine.visible = true;
                break;
            case this.LINE_STATUS.HIDE:
                this.noramLine.visible = false;
                this.warnLine.visible = false;
                break;
        }
    }

    //判断点击的是否是地图上的武器
    static findMapArms = (target) => {
        const item = this.map.children.find((item)=>item === target);
        if(item?.parent === this.map && item?.obj?.type === TYPE.ARMS){
            return this.liveArms.find((element)=>element.container._boundsID === item._boundsID);
        }
        return null;
    }

    static onTouchStart = (e) => {

        //判断是否是武器容器中的武器
        let initArmsObj = ArmsBox.findArmsBoxItem(e.target);

        //判断是否是地图上已存在的武器
        let liveArms = this.findMapArms(e.target);

        //地图拖动
        if(e.target === this.map){
            const {x, y } = e.data.global;
            this.moveMap = {
                originX: this.map.x,
                originY: this.map.y,
                touchX: x,
                touchY: y,
            }
            return true;
        }else if(initArmsObj){ //武器拖动开始
            const {x, y } = e.data.global;
            initArmsObj.x = x - this.map.x - GRID_WIDTH/2;
            initArmsObj.y = y -this.map.y - GRID_HEIGHT/2;
            const armsSprite = new ArmsContainer(initArmsObj);
            armsSprite.drawCircle(ATTACK_RANGE_COLOR_NORMAL);
            armsSprite.removeMoney();
            armsSprite.setInteractive(true);
            this.moveArms = armsSprite;
            this.map.addChild(this.moveArms.getContainer());
        }else if(liveArms){
            liveArms.setCloseShow();
            liveArms.setUpgradeShow();
        }
        return false;
    }

    static moveMapTransform = (x, y) => {
        if(x > 0){
            x = 0;
        }
        if(x < CANVAS_WIDTH - MAP_WIDTH){
            x = CANVAS_WIDTH - MAP_WIDTH
        }
        if(y > 0){
            y = 0;
        }
        if(y < CANVAS_HEIGHT - MAP_HEIGHT){
            y = CANVAS_HEIGHT - MAP_HEIGHT
        }
        return {x, y};
    }

    static getMoveArmsPosition = (x, y) => {
        let container = this.moveArms.getContainer();
        let sprite = this.moveArms.getSprite();
        if(Boolean(x) && Boolean(y)){
            this.moveArms.setPosition(x - this.map.x - sprite.width/2 , y - this.map.y - sprite.height/2);
        }

        let desX = Math.round(container.x/GRID_WIDTH);
        let desY = Math.round(container.y/GRID_HEIGHT);
        return {desX, desY};
    }

    static onTouchMove = (e) => {
        //地图拖动
        if(this.moveMap){
            const {x:MoveX, y:MoveY } = e.data.global;
            const {originX, originY, touchX, touchY} = this.moveMap;
            const {x, y} = this.moveMapTransform(originX+MoveX-touchX, originY+MoveY-touchY);
            this.setPosition(x, y);
            return true;
        }else if(this.moveArms){
            const {x, y } = e.data.global;
            const {desX, desY} = this.getMoveArmsPosition(x, y);
            const node = MapGrid.getGrid().getNodeAt(desX, desY);
            if(node.walkable){
                this.moveArms.drawCircle(ATTACK_RANGE_COLOR_NORMAL);
            }else{
                this.moveArms.drawCircle(ATTACK_RANGE_COLOR_WARN);
            }
            return true;
        }
        return false;
    }

    static onTouchEnd = (e) => {
        this.moveMap = null;
        if(this.moveArms){
            const {desX, desY} = this.getMoveArmsPosition();
            const node = MapGrid.getGrid().getNodeAt(desX, desY);
            if(node.walkable){
                MapGrid.getGrid().setWalkableAt(desX, desY, false);
                this.moveArms.removeCircle();
                this.moveArms.setGridXY(desX, desY);
                this.moveArms.setPosition(desX*GRID_WIDTH, desY*GRID_HEIGHT);
                Money.setTotalMoney(Money.getTotalMoney() - this.moveArms.obj.money);
                this.liveArms.push(this.moveArms);
                GameSound.playAddArms();
            }else{
                this.map.removeChild(this.moveArms.getContainer());
            }
            this.moveArms = null;
        }
    }

    static setPosition = (x, y) => {
        this.map.position.set(x, y);
    }
}
