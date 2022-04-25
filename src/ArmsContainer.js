
import BaseContainer from "./BaseContainer";
import * as PIXI from "pixi.js";
import {ATTACK_RANGE_COLOR, GRID_HEIGHT, GRID_WIDTH} from "./constant";
import Map from "./Map";
import Money from "./Money";
import GameSound from "./GameSound";

export default class ArmsContainer extends BaseContainer{
    constructor(obj, map, grid) {
        super(obj, map, grid);
        this.bulletArr = [] //子弹数组
        this.showClose = false;
        this.showUpgrade = false;
        this.drawClose();
        this.drawUpgrade();
        this.drawMoney();
        this.attackEnemy = null;
    }

    //设置武器当前在方格中的坐标
    setGridXY = (x, y) => {
        this.obj.gridX = x;
        this.obj.gridY = y;
    }

    setCloseShow = () => {
        if(this.circle.parent){
            return;
        }
        const {levelObj} = this.getLevelObj(this.obj.levelNum);
        let money = levelObj.sailMoney+'';
        this.close.position.set(GRID_WIDTH+10, (GRID_HEIGHT-20)/2);
        this.close.text = '卖掉$'+ money;
        this.showClose = !this.showClose;
        this.close.visible = this.showClose;
    }

    setUpgradeShow = () => {
        if(this.circle.parent){
            return;
        }
        if(this.obj.levelNum >= this.obj.level.length -1){
            return;
        }
        const {levelObj} = this.getLevelObj(this.obj.levelNum+1);
        let money = levelObj.upgradeMoney+'';
        this.upgrade.position.set(-(20*(Math.ceil(money.length/2))+60), (GRID_HEIGHT-20)/2);
        this.upgrade.text = '升级$'+ money;
        this.showUpgrade = !this.showUpgrade;
        this.upgrade.visible = this.showUpgrade;
    }

    //绘制关闭文案
    drawClose = () => {
        let style = new PIXI.TextStyle({
            fontSize: 20,
            fill: "black",
        });
        this.close = new PIXI.Text("卖掉", style);
        this.close.position.set(GRID_WIDTH, (GRID_HEIGHT-20)/2);
        this.container.addChild(this.close);
        this.close.visible = false;
        this.close.interactive = true;
        this.close.on('touchstart', (event) => {
            event.stopPropagation();
            Map.deleteLiveArms(this);
            let level = this.obj.level[this.obj.levelNum];
            let money = level.sailMoney;
            Money.setTotalMoney(Money.getTotalMoney() + money);
        });
    }

    //绘制升级
    drawUpgrade = () => {
        let style = new PIXI.TextStyle({
            fontSize: 20,
            fill: "black",
        });
        this.upgrade = new PIXI.Text("升级", style);
        this.upgrade.position.set(-40, (GRID_HEIGHT-20)/2);
        this.container.addChild(this.upgrade);
        this.upgrade.visible = false;
        this.upgrade.interactive = true;
        this.upgrade.on('touchstart', (event) => {
            event.stopPropagation();
            let level = this.obj.level[this.obj.levelNum+1];
            let money = level.upgradeMoney;
            if(money <= Money.getTotalMoney()){
                this.setUpgradeShow();
                this.setCloseShow();
                this.drawCircle();
                Money.setTotalMoney(Money.getTotalMoney() - money);
                setTimeout(()=>{
                    this.removeCircle();
                    if(this.obj.levelNum < this.obj.level.length-1){
                        this.obj.levelNum++;
                    }
                }, 1000)
            }

        });
    }

    //绘制价格
    drawMoney = () =>{
        let style = new PIXI.TextStyle({
            fontSize: 20,
            fill: "black",
        });
        this.money = new PIXI.Text("$"+this.obj.money, style);
        this.money.position.set(10, -25);
        this.container.addChild(this.money);
    }

    //移除价格显示
    removeMoney = () => {
        this.container.removeChild(this.money);
    }

    //绘制攻击范围
    drawCircle = () => {
        let level = this.obj.level[this.obj.levelNum];
        this.circle = new PIXI.Graphics();
        this.circle.beginFill(ATTACK_RANGE_COLOR);
        this.circle.drawCircle(0, 0, level.attackRange);
        this.circle.endFill();
        this.circle.x = 30;
        this.circle.y = 30;
        this.circle.alpha = 0.5;
        this.container.addChildAt(this.circle, 0);
    }

    //移除攻击范围显示
    removeCircle = () => {
        this.container.removeChild(this.circle);
    }

    //获取两点之间的角度
    getAngle = (x1, y1, x2, y2) => {
        if(x1 === x2 && y2 > y1){
            return {rotate: Math.PI, angle:Math.PI };
        }else if(x1 === x2 && y2 < y1){
            return {rotate: 0, angle: 0 }
        }else if( y1 === y2 && x2 > x1){
            return {rotate: Math.PI*0.5, angle:Math.PI*0.5 }
        }else if(y1 === y2 && x2 < x1){
            return {rotate: Math.PI*1.5, angle:Math.PI*1.5 }
        }

        const a = Math.abs(y1-y2);
        const b = Math.abs(x1-x2);
        if(x2 > x1 && y2 > y1){
            const tan = a/b;
            const radina = Math.atan(tan);
            return {rotate: radina + Math.PI*0.5, angle:radina }
        }else if( x2 > x1 && y2 < y1){
            const tan = b/a;
            const radina = Math.atan(tan);
            return {rotate: radina, angle:radina }
        }else if( x2 < x1 && y2 > y1){
            const tan = b/a;
            const radina = Math.atan(tan);
            return {rotate: radina + Math.PI, angle:radina }
        }else if(x2 < x1 && y2 < y1){
            const tan = a/b;
            const radina = Math.atan(tan);
            return {rotate: radina + Math.PI*1.5, angle:radina }
        }
    }

    //获取两点之间的距离
    getDistance = (x1, y1, x2, y2) => {
        const x = Math.abs(x1 - x2);
        const y = Math.abs(y1-y2);
        const z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        return z;
    }

    //获取当前级别数据
    getLevelObj = (num) => {
        const levelObj = this.obj.level[num];
        const levelBulletObj = levelObj.bullet;
        return {levelObj, levelBulletObj}
    }

    //生产子弹
    drawBullet = (endX, endY, enemySprite) => {
        if(this.attackEnemy !== null && enemySprite !== this.attackEnemy){
            return;
        }
        this.attackEnemy = enemySprite;
        const {levelObj, levelBulletObj} = this.getLevelObj(this.obj.levelNum);
        if(this.bulletArr.length >= levelBulletObj.maxBullet){
            return;
        }
        const startX = GRID_WIDTH/2;
        const startY = GRID_HEIGHT/2;
        const {angle, rotate} = this.getAngle(startX, startY, endX, endY);
        const distance = this.getDistance(startX, startY, endX, endY);
        let texture = PIXI.utils.TextureCache[levelBulletObj.src];
        let bullet = new PIXI.Sprite(texture);
        bullet.anchor.set(0.5, 0.5);
        bullet.position.set(startX, startY);
        bullet.rotation = rotate;
        bullet.width = levelBulletObj.width;
        bullet.height = levelBulletObj.height;
        this.container.addChild(bullet);
        this.sprite.rotation = rotate-this.obj.originRotate;
        let bulletObj = {
            startX,
            startY,
            endX,
            endY,
            nowX: startX,
            nowY: startY,
            angle,
            rotate,
            speed: levelBulletObj.speed,
            distance,
            bulletSprite: bullet,
            isDie: false,
            enemySprite
        }
        this.bulletArr.push(bulletObj);
        GameSound.playShoot();
    }

    //移动子弹
    moveBullet = () => {
        let level = this.obj.level[this.obj.levelNum];
        this.bulletArr.map((item, index)=>{
            const bullet = item;
            const {nowX, nowY, startX, startY, speed, angle, rotate, bulletSprite, distance} = bullet;
            let dis = this.getDistance(nowX, nowY, startX, startY);
            dis = dis + speed;
            let a = Math.sin(angle)*dis;
            let b = Math.cos(angle)*dis;
            let x;
            let y;
            if(rotate <= Math.PI*0.5){
                x = startX + a;
                y = startY - b;
            }else if(rotate <= Math.PI){
                x = startX + b;
                y = startY + a;
            }else if(rotate <= Math.PI*1.5){
                x = startX - a;
                y = startY + b;
            }else{
                x = startX - b;
                y = startY - a;
            }
            bulletSprite.position.set(x, y);
            bullet.nowX = x;
            bullet.nowY = y;
            if(dis > distance){
                bullet.isDie = true;
                this.container.removeChild(bulletSprite);
                bullet.enemySprite.reduceBlood(level.attackBlood);
            }
            return bullet;
        })

        const arr = this.bulletArr.filter((item)=>!item.isDie);
        this.bulletArr = arr;
    }

}
