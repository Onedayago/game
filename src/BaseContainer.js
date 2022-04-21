import * as PIXI from "pixi.js";
import {GRID_HEIGHT, GRID_WIDTH} from "./constant";


export default class BaseContainer{
    constructor(obj) {
        this.obj = JSON.parse(JSON.stringify(obj));
        this.initContainer();
    }

    //绘制整个容器
    initContainer = () => {
        this.container = new PIXI.Container();
        this.container.width = GRID_WIDTH;
        this.container.height = GRID_HEIGHT;
        this.container.position.set(this.obj.x, this.obj.y);
        this.container.obj = this.obj;
        this.initSprite();
    }

    //获取容器
    getContainer = () => {
        return this.container;
    }

    //设置容器是否可点击
    setInteractive = (flag) => {
        this.container.interactive = flag;
    }

    //获取精灵
    getSprite = () => {
        return this.sprite;
    }

    //初始化精灵
    initSprite = () => {
        let texture = PIXI.utils.TextureCache[this.obj.src];
        //截取图片让精灵沾满整个方格
        let rectangle = new PIXI.Rectangle(this.obj.rect[0], this.obj.rect[1], this.obj.rect[2], this.obj.rect[3]);
        texture.frame = rectangle;
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.width = GRID_WIDTH;
        this.sprite.height = GRID_HEIGHT;
        this.sprite.position.set(GRID_WIDTH/2, GRID_WIDTH/2);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.rotation = this.obj.srcRotate;
        this.container.addChild(this.sprite);
    }

    setPosition = (x, y) => {
        this.container.position.set(x, y);
    }
}
