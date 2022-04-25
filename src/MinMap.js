import {BG, CANVAS_WIDTH, GRID_WIDTH, MIN_MAP, TYPE} from "./constant/index";
import * as PIXI from 'pixi.js';
import Map from "./Map";
import BaseContainer from "./BaseContainer";

export default class MinMap {
    static drawMinMap = () => {
        this.minMap = new PIXI.Container();
        this.bg = PIXI.Sprite.from(BG.src);
        this.bg.width = MIN_MAP.width;
        this.bg.height = MIN_MAP.height;
        this.bg.x = BG.x;
        this.bg.y = BG.y;
        this.minMap.width = MIN_MAP.width;
        this.minMap.height = MIN_MAP.height;
        this.minMap.position.set(MIN_MAP.x, MIN_MAP.y);
        this.minMap.addChild(this.bg);
        return this.minMap;
    }

    static getMinMap = () => {
        return this.minMap;
    }

    static updateMinMap = () => {

        this.minMap.removeChildren(1, Map.map.children.length-1);
        for(let i = 0; i < Map.map.children.length; i++){
            let element = Map.map.children[i];
            if(element?.obj){
                let obj = element.obj;

                if(obj.type === TYPE.BASE || obj.type === TYPE.ARMS || obj.type === TYPE.ENEMY){
                    let container = new BaseContainer(obj);
                    if(element.x < 0){
                        return;
                    }
                    container.setPosition(element.x/5, element.y/5);
                    container.getContainer().width = GRID_WIDTH/5;
                    container.getContainer().height = GRID_WIDTH/5;
                    this.minMap.addChild(container.getContainer());
                }

            }
        }
    }
}
