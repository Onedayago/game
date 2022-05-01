import * as PIXI from "pixi.js";
import {GAME_BOX, GAME_STATE} from "./constant";
import GameSound from "./GameSound";


export default class Game {

    static gameTime = 0;
    static interval = null;

    static initGameState = () => {


        let style = new PIXI.TextStyle({
            fontSize: 25,
            fill: "black",
        });
        this.gameState = GAME_STATE.RUN;
        this.game = new PIXI.Text(this.gameState, style);
        this.game.interactive = true;
        this.game.position.set(GAME_BOX.x, GAME_BOX.y);

        GameSound.playBg();

        this.interval = setInterval(()=>{
            if(this.gameState === GAME_STATE.RUN){
                this.gameTime++;
            }
        }, 1000);

        this.game.on('mousedown', (event) => {
            if(this.gameState === GAME_STATE.RUN){
                this.gameState = GAME_STATE.PAUSE;
                this.game.text = this.gameState;
                global.app.ticker.remove(global.gameLoop);
                GameSound.stopBg();
            }else if(this.gameState === GAME_STATE.PAUSE ){
                global.app.ticker.add(global.gameLoop);
                this.gameState = GAME_STATE.RUN;
                this.game.text = this.gameState;
                GameSound.playBg();
            }
        })
        return this.game;
    }

    static pauseGame = () => {

    }

    static runGame = () => {

    }

    static finishGame = () => {
        this.gameState = GAME_STATE.FINISH;
        this.game.text = this.gameState;
        global.app.ticker.remove(global.gameLoop);
    }
}
