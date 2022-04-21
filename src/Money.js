import * as PIXI from "pixi.js";
import {MONEY_BOX} from "./constant";


export default class Money{

    static initMoneyBox = () => {
        let style = new PIXI.TextStyle({
            fontSize: 25,
            fill: "black",
        });
        this.totalMoney = 100;
        this.money = new PIXI.Text("金币$"+this.totalMoney, style);
        this.money.position.set(MONEY_BOX.x, MONEY_BOX.y);
        return this.money;
    }

    static getTotalMoney = () => {
        return this.totalMoney;
    }

    static setTotalMoney = (money) => {
        this.totalMoney = money;
        this.updateMoney();
    }

    static updateMoney = () => {
        this.money.text = "金币$"+this.totalMoney;
    }

}
