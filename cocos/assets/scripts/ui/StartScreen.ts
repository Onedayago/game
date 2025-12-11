/**
 * 开始界面
 * 游戏启动时显示的界面
 */

import { _decorator, Component, Node, Button, Label } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('StartScreen')
export class StartScreen extends Component {
    @property(Button)
    startButton: Button | null = null;
    
    // @property(Button)
    // helpButton: Button | null = null;
    
    // @property(Label)
    // titleLabel: Label | null = null;
    
    // @property(Label)
    // subtitleLabel: Label | null = null;
    
    private onStartCallback: (() => void) | null = null;
    private onHelpCallback: (() => void) | null = null;
    
    onLoad() {
        // 设置按钮事件
        if (this.startButton) {
            this.startButton.node.on(Button.EventType.CLICK, this.onStartClick, this);
        }
        
        // if (this.helpButton) {
        //     this.helpButton.node.on(Button.EventType.CLICK, this.onHelpClick, this);
        // }
        
        // // 设置文本
        // if (this.titleLabel) {
        //     this.titleLabel.string = '🎮 TowerGame';
        // }
        
        // if (this.subtitleLabel) {
        //     this.subtitleLabel.string = '赛博朋克塔防';
        // }
    }
    
    /**
     * 设置开始按钮回调
     */
    setStartCallback(callback: () => void) {
        this.onStartCallback = callback;
    }
    
    /**
     * 设置帮助按钮回调
     */
    setHelpCallback(callback: () => void) {
        this.onHelpCallback = callback;
    }
    
    /**
     * 开始按钮点击
     */
    private onStartClick() {
        if (this.onStartCallback) {
            this.onStartCallback();
        }
        this.hide();
    }
    
    /**
     * 帮助按钮点击
     */
    private onHelpClick() {
        if (this.onHelpCallback) {
            this.onHelpCallback();
        }
    }
    
    /**
     * 显示界面
     */
    show() {
        this.node.active = true;
    }
    
    /**
     * 隐藏界面
     */
    hide() {
        this.node.active = false;
    }
}

