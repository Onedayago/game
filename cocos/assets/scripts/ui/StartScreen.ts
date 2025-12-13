/**
 * 开始界面
 * 游戏启动时显示的界面，参照原游戏实现
 */

import { _decorator, Component, Node, Label, Graphics, UITransform, Color, EventTouch } from 'cc';
import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';
import { ColorCache, GameColors } from '../config/Colors';

const { ccclass, property } = _decorator;

// 开始界面配置常量（基于设计分辨率）
const START_OVERLAY_ALPHA = 0.95;      // 遮罩透明度
const START_TITLE_Y_RATIO = 0.3;        // 主标题 Y 位置比例
const START_SUBTITLE_Y_RATIO = 0.38;    // 副标题 Y 位置比例
const START_BTN_Y_RATIO = 0.52;         // 开始按钮 Y 位置比例
const START_HELP_BTN_Y_RATIO = 0.65;    // 说明按钮 Y 位置比例

@ccclass('StartScreen')
export class StartScreen extends Component {
    // 显式声明 node 属性
    declare node: Node;
    
    private overlay: Node | null = null;
    private titleNode: Node | null = null;
    private subtitleNode: Node | null = null;
    private startButtonNode: Node | null = null;
    private helpButtonNode: Node | null = null;
    
    private onStartCallback: (() => void) | null = null;
    private onHelpCallback: (() => void) | null = null;
    
    onLoad() {
        // 创建完整的开始界面 UI
        this.createUI();
    }
    
    /**
     * 创建完整的开始界面 UI
     */
    private createUI() {
        const designWidth = GameConfig.DESIGN_WIDTH;
        const designHeight = GameConfig.DESIGN_HEIGHT;
        
        // 1. 创建半透明遮罩层
        this.overlay = this.createOverlay(designWidth, designHeight);
        this.node.addChild(this.overlay);
        
        // 2. 创建主标题
        this.titleNode = this.createTitle(designWidth, designHeight);
        this.node.addChild(this.titleNode);
        
        // 3. 创建副标题
        this.subtitleNode = this.createSubtitle(designWidth, designHeight);
        this.node.addChild(this.subtitleNode);
        
        // 4. 创建开始按钮
        this.startButtonNode = this.createStartButton(designWidth, designHeight);
        this.node.addChild(this.startButtonNode);
        
        // 5. 创建帮助按钮
        this.helpButtonNode = this.createHelpButton(designWidth, designHeight);
        this.node.addChild(this.helpButtonNode);
    }
    
    /**
     * 创建遮罩层
     */
    private createOverlay(width: number, height: number): Node {
        const overlay = new Node('Overlay');
        const graphics = overlay.addComponent(Graphics);
        const transform = overlay.addComponent(UITransform);
        
        transform.setContentSize(width, height);
        transform.setAnchorPoint(0.5, 0.5);
        overlay.setPosition(0, 0, 0);
        
        const bgColor = ColorCache.get(GameColors.UI_BG);
        graphics.fillColor = new Color(bgColor.r, bgColor.g, bgColor.b, Math.floor(START_OVERLAY_ALPHA * 255));
        graphics.rect(-width / 2, -height / 2, width, height);
        graphics.fill();
        overlay.layer = this.node.layer;
        
        return overlay;
    }
    
    /**
     * 创建主标题
     */
    private createTitle(width: number, height: number): Node {
        const titleNode = new Node('Title');
        titleNode.layer = this.node.layer;
        const label = titleNode.addComponent(Label);
        
        label.string = '坦克防御 · Tower Game';
        label.fontSize = UIConfig.TITLE_FONT_SIZE;
        label.color = ColorCache.get(GameColors.GOLD);
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        
        // 位置：屏幕上方 30%（Cocos Y 轴向上，原游戏比例基于顶部）
        titleNode.setPosition(0, height * (0.5 - START_TITLE_Y_RATIO), 0);
        
        return titleNode;
    }
    
    /**
     * 创建副标题
     */
    private createSubtitle(width: number, height: number): Node {
        const subtitleNode = new Node('Subtitle');
        subtitleNode.layer = this.node.layer;
        const label = subtitleNode.addComponent(Label);
        
        label.string = '拖拽坦克布防，升级武器抵挡一波又一波敌人。';
        label.fontSize = UIConfig.SUBTITLE_FONT_SIZE;
        label.color = ColorCache.get(GameColors.TEXT_SUB);
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        
        // 位置：屏幕上方 38%（Cocos Y 轴向上）
        subtitleNode.setPosition(0, height * (0.5 - START_SUBTITLE_Y_RATIO), 0);
        
        return subtitleNode;
    }
    
    /**
     * 创建开始按钮
     */
    private createStartButton(width: number, height: number): Node {
        const buttonNode = new Node('StartButton');
        buttonNode.layer = this.node.layer;
        const graphics = buttonNode.addComponent(Graphics);
        const transform = buttonNode.addComponent(UITransform);
        
        const btnWidth = UIConfig.START_BTN_WIDTH;
        const btnHeight = UIConfig.START_BTN_HEIGHT;
        const btnRadius = UIConfig.START_BTN_RADIUS;
        const borderWidth = UIConfig.BORDER_WIDTH;
        
        transform.setContentSize(btnWidth, btnHeight);
        transform.setAnchorPoint(0.5, 0.5);
        
        // 绘制按钮背景（绿色）
        const successColor = ColorCache.get(GameColors.SUCCESS);
        const successDark = ColorCache.get(GameColors.SUCCESS_DARK);
        
        graphics.fillColor = new Color(successColor.r, successColor.g, successColor.b);
        graphics.roundRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, btnRadius);
        graphics.fill();
        
        // 绘制按钮边框
        graphics.lineWidth = borderWidth;
        graphics.strokeColor = new Color(successDark.r, successDark.g, successDark.b);
        graphics.roundRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, btnRadius);
        graphics.stroke();
        
        // 添加文字
        const labelNode = new Node('Label');
        labelNode.layer = this.node.layer;
        const label = labelNode.addComponent(Label);
        label.string = '开始游戏';
        label.fontSize = UIConfig.BUTTON_FONT_SIZE;
        label.color = ColorCache.get(GameColors.TEXT_LIGHT);
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        labelNode.setPosition(0, 0, 0);
        buttonNode.addChild(labelNode);
        
        // 位置：屏幕上方 52%（Cocos Y 轴向上）
        buttonNode.setPosition(0, height * (0.5 - START_BTN_Y_RATIO), 0);
        
        // 添加点击事件
        buttonNode.on(Node.EventType.TOUCH_END, this.onStartClick, this);
        
        return buttonNode;
    }
    
    /**
     * 创建帮助按钮
     */
    private createHelpButton(width: number, height: number): Node {
        const buttonNode = new Node('HelpButton');
        buttonNode.layer = this.node.layer;
        const graphics = buttonNode.addComponent(Graphics);
        const transform = buttonNode.addComponent(UITransform);
        
        const btnWidth = UIConfig.HELP_BTN_WIDTH;
        const btnHeight = UIConfig.HELP_BTN_HEIGHT;
        const btnRadius = UIConfig.HELP_BTN_RADIUS;
        const borderWidth = UIConfig.BORDER_WIDTH;
        
        transform.setContentSize(btnWidth, btnHeight);
        transform.setAnchorPoint(0.5, 0.5);
        
        // 绘制按钮背景（灰色）
        const borderColor = ColorCache.get(GameColors.UI_BORDER);
        const allyColor = ColorCache.get(GameColors.ALLY_BODY);
        
        graphics.fillColor = new Color(borderColor.r, borderColor.g, borderColor.b);
        graphics.roundRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, btnRadius);
        graphics.fill();
        
        // 绘制按钮边框
        graphics.lineWidth = borderWidth;
        graphics.strokeColor = new Color(allyColor.r, allyColor.g, allyColor.b);
        graphics.roundRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, btnRadius);
        graphics.stroke();
        
        // 添加文字
        const labelNode = new Node('Label');
        labelNode.layer = this.node.layer;
        const label = labelNode.addComponent(Label);
        label.string = '游戏说明';
        label.fontSize = UIConfig.BUTTON_FONT_SIZE;
        label.color = ColorCache.get(GameColors.TEXT_MAIN);
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        labelNode.setPosition(0, 0, 0);
        buttonNode.addChild(labelNode);
        
        // 位置：屏幕上方 62%（Cocos Y 轴向上）
        buttonNode.setPosition(0, height * (0.5 - START_HELP_BTN_Y_RATIO), 0);
        
        // 添加点击事件
        buttonNode.on(Node.EventType.TOUCH_END, this.onHelpClick, this);
        
        return buttonNode;
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
    
    /**
     * 清理资源
     */
    onDestroy() {
        if (this.startButtonNode) {
            this.startButtonNode.off(Node.EventType.TOUCH_END);
        }
        if (this.helpButtonNode) {
            this.helpButtonNode.off(Node.EventType.TOUCH_END);
        }
    }
}

