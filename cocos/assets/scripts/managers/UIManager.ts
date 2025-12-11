/**
 * UI管理器
 * 负责游戏UI的显示和交互
 */

import { _decorator, Component, Node, Label, Button, Graphics, UITransform, Color, Vec3 } from 'cc';
import { GameContext } from '../core/GameContext';
import { GameMain } from '../GameMain';
import { WeaponManager } from './WeaponManager';
import { EnemyManager } from './EnemyManager';
import { GoldManager } from './GoldManager';
import { StartScreen } from '../ui/StartScreen';
import { WeaponContainerUI } from '../ui/WeaponContainerUI';
import { GameConfig } from '../config/GameConfig';

const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    @property(Node)
    startScreen: Node | null = null;
    
    @property(Node)
    gameUI: Node | null = null;
    
    @property(Node)
    weaponContainer: Node | null = null;
    
    @property(Label)
    waveLabel: Label | null = null;
    
    private gameContext: GameContext;
    private gameMain: GameMain | null = null;
    private weaponManager: WeaponManager | null = null;
    private enemyManager: EnemyManager | null = null;
    private goldManager: GoldManager | null = null;
    private weaponContainerUI: WeaponContainerUI | null = null;
    
    onLoad() {
        this.gameContext = GameContext.getInstance();
    }
    
    init(gameMain: GameMain, weaponManager: WeaponManager | null, enemyManager: EnemyManager | null, goldManager: GoldManager | null = null) {
        this.gameMain = gameMain;
        this.weaponManager = weaponManager;
        this.enemyManager = enemyManager;
        this.goldManager = goldManager;
        
        // 设置武器容器
        this.setupWeaponContainer();
        
        this.initWeaponContainerUI();
        
    }
    
    /**
     * 初始化武器容器UI组件
     */
    private initWeaponContainerUI() {
        if (!this.weaponContainer || !this.goldManager || !this.weaponManager) {
            return;
        }
        
        this.weaponContainerUI = this.weaponContainer.getComponent(WeaponContainerUI);
        if (!this.weaponContainerUI) {
            this.weaponContainerUI = this.weaponContainer.addComponent(WeaponContainerUI);
        }
        this.weaponContainerUI.init(this.goldManager, this.weaponManager);
    }
    
    /**
     * 设置武器容器的位置和背景
     */
    private setupWeaponContainer() {
        if (!this.weaponContainer) return;
        
        this.weaponContainer.active = true;
        
        // 获取或添加 UITransform
        let uiTransform = this.weaponContainer.getComponent(UITransform);
        if (!uiTransform) {
            uiTransform = this.weaponContainer.addComponent(UITransform);
        }
        
        // 设置容器属性（锚点必须先设置）
        uiTransform.setAnchorPoint(0.5, 0);
        
        // 恢复原来的尺寸：宽度 800，高度 200
        const containerWidth = GameConfig.CELL_SIZE * 10;   // 800
        const containerHeight = GameConfig.CELL_SIZE * 2.5; // 200
        uiTransform.setContentSize(containerWidth, containerHeight);
        
        // 设置位置：底部居中
        const marginBottom = GameConfig.CELL_SIZE * 0.2;
        const posY = -GameConfig.DESIGN_HEIGHT / 2 + marginBottom;
        this.weaponContainer.setPosition(0, posY, 0);
        
        // 绘制背景
        this.drawWeaponContainerBackground(containerWidth, containerHeight);
    }
    
    /**
     * 绘制武器容器背景
     */
    private drawWeaponContainerBackground(width: number, height: number) {
        if (!this.weaponContainer) return;
        
        let graphics = this.weaponContainer.getComponent(Graphics);
        if (!graphics) {
            graphics = this.weaponContainer.addComponent(Graphics);
        }
        
        graphics.clear();
        
        // 锚点在 (0.5, 0) - 底部中心
        const x = -width * 0.5;  // 从左边界开始
        const y = 0;              // 从底部开始
        
        // 深色背景
        graphics.fillColor = new Color(30, 30, 50, 240);
        graphics.roundRect(x, y, width, height, 10);
        graphics.fill();
        
        // 青色边框
        graphics.lineWidth = 2;
        graphics.strokeColor = new Color(0, 255, 255, 200);
        graphics.roundRect(x, y, width, height, 10);
        graphics.stroke();
    }
    
    update(deltaTime: number) {
        // 更新波次显示
        this.updateWaveDisplay();
    }
    
    /**
     * 显示开始界面
     */
    showStartScreen() {
        if (this.startScreen) {
            this.startScreen.active = true;
            
            // 设置开始按钮和帮助按钮回调
            const startScreenComp = this.startScreen.getComponent(StartScreen);
            if (startScreenComp) {
                startScreenComp.setStartCallback(() => {
                    this.onStartButtonClick();
                });
                
                startScreenComp.setHelpCallback(() => {
                    this.onHelpButtonClick();
                });
            }
        }
        if (this.gameUI) {
            this.gameUI.active = false;
        }
    }
    
    /**
     * 隐藏开始界面，显示游戏UI
     */
    hideStartScreen() {
        if (this.startScreen) {
            this.startScreen.active = false;
        }
        if (this.gameUI) {
            this.gameUI.active = true;
        }
    }
    
    /**
     * 开始游戏按钮点击
     */
    onStartButtonClick() {
        this.hideStartScreen();
        if (this.gameMain) {
            this.gameMain.startGame();
        }
    }
    
    /**
     * 帮助按钮点击
     */
    onHelpButtonClick() {
        // TODO: 实现帮助界面显示
    }
    
    /**
     * 更新波次显示
     */
    private updateWaveDisplay() {
        if (this.waveLabel && this.enemyManager) {
            const wave = this.enemyManager.getWaveLevel();
            this.waveLabel.string = `第 ${wave} 波`;
        }
    }
}

