import {Howl, Howler} from 'howler';
import {BG_SOUND, BOOM_SOUND, SHOOT_SOUND, ADD_ARMS_SOUND} from "./constant/sound";

export default class GameSound{

    static initSound = () => {
        this.bgSound = new Howl({
            src: [BG_SOUND.src],
            autoplay: false,
            loop: true,
        });

        this.shootSound = new Howl({
            src: [SHOOT_SOUND.src],
            autoplay: false,
            loop: false,
            rate: 4,
            onend: ()=>{

            }
        })

        this.boomSound = new Howl({
            src: [BOOM_SOUND.src],
            autoplay: false,
            loop: false,
            onend: ()=>{

            }
        })

        this.addArmsSound = new Howl({
            src: [ADD_ARMS_SOUND.src],
            autoplay: false,
            loop: false,
        })

        Howler.volume(0.3);
    }

    static playBg = () => {
        this.bgSound.play();
    }

    static stopBg = () => {
        this.bgSound.stop();
    }

    static playAddArms = () => {
        this.addArmsSound.play();
    }

    static playBoom = () => {
        // this.boomSound.play();
    }

    static playShoot = () => {
        // this.shootSound.play();
    }
}
