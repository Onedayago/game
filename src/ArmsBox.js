import * as PIXI from "pixi.js";
import {ARMS_BOX} from "./constant";
import Money from "./Money";


export default class ArmsBox {

    //初始化武器容器
    static initArmsBox = () => {
        this.armsBox = new PIXI.Container();
        this.armsBox.position.set(ARMS_BOX.x, ARMS_BOX.y);
        this.armsBox.interactive = true;
        return this.armsBox;
    }

    //判断点击是否为武器容器中的武器
    static findArmsBoxItem = (target) => {
        const item = this.armsBox.children.find((item)=>item === target);
        if(item?.parent === this.armsBox){
            if(item?.obj.money <= Money.getTotalMoney()){
                return item?.obj;
            }else{
                return null;
            }
        }
        return null;
    }
}
