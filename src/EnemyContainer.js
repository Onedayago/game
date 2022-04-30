import BaseContainer from "./BaseContainer";
import * as PIXI from "pixi.js";
import {BASE, DIRECTION, GRID_WIDTH} from "./constant";
import {AStarFinder} from "pathfinding";
import MapGrid from "./MapGrid";
import Money from "./Money";
import Game from "./Game";
import GameSound from "./GameSound";

export default class EnemyContainer extends BaseContainer{
    constructor(obj) {
        super(obj);
        this.nextGridX = obj.gridX+1; //默认先往右移动一个小格
        this.nextGridY = obj.gridY;
        this.direction = DIRECTION.RIGHT;
        this.isDie = false;
    }

    //初始化精灵的血量显示
    initBlood = () => {
        let bloodBg = new PIXI.Graphics();
        bloodBg.beginFill(0xD8BFD8);
        bloodBg.drawRect(0, -10, GRID_WIDTH, 5);
        bloodBg.endFill();
        bloodBg.alpha = 1;
        this.container.addChild(bloodBg);
        this.bloodBox = new PIXI.Graphics();
        this.bloodBox.beginFill(0xDC143C);
        this.bloodBox.drawRect(0, -10, GRID_WIDTH, 5);
        this.bloodBox.endFill();
        this.bloodBox.alpha = 1;
        this.container.addChild(this.bloodBox);
    }

    //血量减少
    reduceBlood = (blood = 1) => {
        if(this.isDie){
            return;
        }
        let reduceBlood = (this.container.width/this.obj.blood)*blood;
        this.bloodBox.width = this.bloodBox.width - reduceBlood;
        if(this.bloodBox.width <= 0){
            this.isDie = true;
            GameSound.playBoom();
            Money.setTotalMoney(Money.getTotalMoney() + this.obj.money)
        }
    }

    //移动方向控制
    move = () => {
        if(this.obj.gridX === BASE.gridX && this.obj.gridY === BASE.gridY){
            Game.finishGame();
            return;
        }
        switch (this.direction){
            case DIRECTION.RIGHT:
                this.moveRight();
                this.setRotation(0);
                break;
            case DIRECTION.LEFT:
                this.moveLeft();
                this.setRotation(Math.PI);
                break;
            case DIRECTION.TOP:
                this.moveTop();
                this.setRotation(1.5*Math.PI);
                break;
            case DIRECTION.BOTTOM:
                this.moveBottom();
                this.setRotation(0.5*Math.PI);
                break;
            case DIRECTION.STOP:
                break;
        }
    }

    //计算下一次的路径
    getPath = () => {
        const finder = new AStarFinder({
            allowDiagonal: false
        });
        let path = finder.findPath(this.obj.gridX, this.obj.gridY, BASE.gridX, BASE.gridY, MapGrid.getGrid().clone());

        if(path.length <=1 ){
            return;
        }
        this.nextGridX = path[1][0];
        this.nextGridY = path[1][1];

        if(this.obj.gridX !== this.nextGridX){
            if(this.obj.gridX < this.nextGridX){
                this.setDirection(DIRECTION.RIGHT);
            }else{
                this.setDirection(DIRECTION.LEFT);
            }
        }else if(this.obj.gridY !== this.nextGridY){
            if(this.obj.gridY < this.nextGridY){
                this.setDirection(DIRECTION.BOTTOM);
            }else{
                this.setDirection(DIRECTION.TOP);
            }
        }
    }

    moveRight = () => {
        this.container.x += this.obj.speed;
        let temp = (this.container.x/GRID_WIDTH).toFixed(1);
        let gridX = temp.split(".")[0];
        if(gridX >= this.nextGridX){
            this.setDirection(DIRECTION.STOP);
            this.obj.gridX = this.nextGridX;
            this.getPath();
        }
    }

    moveLeft = () => {
        this.container.x -= this.obj.speed;
        let temp = (this.container.x/GRID_WIDTH).toFixed(1);
        let gridX = parseInt(temp.split(".")[0]);
        if(gridX <= this.nextGridX-1){
            this.setDirection(DIRECTION.STOP);
            this.obj.gridX = this.nextGridX;
            this.getPath();
        }
    }

    moveTop = () =>{
        this.container.y -= this.obj.speed;
        let temp = (this.container.y/GRID_WIDTH).toFixed(1);
        let gridY = parseInt(temp.split(".")[0]);
        if(gridY  <= this.nextGridY-1){
            this.setDirection(DIRECTION.STOP);
            this.obj.gridY = this.nextGridY;
            this.getPath();
        }
    }

    moveBottom = () =>{
        this.container.y += this.obj.speed;
        let temp = (this.container.y/GRID_WIDTH).toFixed(1);
        let gridY = parseInt(temp.split(".")[0]);
        if(gridY >= this.nextGridY){
            this.setDirection(DIRECTION.STOP);
            this.obj.gridY = this.nextGridY;
            this.getPath();
        }
    }

    setRotation = (rotation) => {
        this.sprite.rotation = rotation;
    }

    setDirection = (direction) => {
        this.direction = direction;
    }

}
