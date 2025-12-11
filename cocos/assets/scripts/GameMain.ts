/**
 * 游戏主控制器
 * 挂载在根节点上，负责游戏初始化和主循环
 */

import { _decorator, Component, Node, Canvas, UITransform, director } from 'cc';
import { GameContext } from './core/GameContext';
import { SoundManager } from './core/SoundManager';
import { GameConfig } from './config/GameConfig';
import { EnemyManager } from './managers/EnemyManager';
import { WeaponManager } from './managers/WeaponManager';
import { GoldManager } from './managers/GoldManager';
import { UIManager } from './managers/UIManager';

const { ccclass, property } = _decorator;

@ccclass('GameMain')
export class GameMain extends Component {
    @property(Node)
    worldNode: Node | null = null;
    
    @property(Node)
    uiNode: Node | null = null;
    
    @property(Node)
    backgroundNode: Node | null = null;

    
    private gameContext: GameContext;
    private soundManager: SoundManager;
    private enemyManager: EnemyManager | null = null;
    private weaponManager: WeaponManager | null = null;
    private goldManager: GoldManager | null = null;
    private uiManager: UIManager | null = null;
    
    private deltaTime: number = 0;
    
    onLoad() {
        // 获取游戏上下文
        this.gameContext = GameContext.getInstance();
        this.soundManager = SoundManager.getInstance();
        
        // 获取 Canvas 的 UITransform
        const rootTransform = this.node.getComponent(UITransform);
        
        // 设置设计分辨率
        const canvas = this.node.getComponent(Canvas);
        if (canvas) {
            canvas.designResolution = cc.size(
                GameConfig.DESIGN_WIDTH,
                GameConfig.DESIGN_HEIGHT
            );
            canvas.fitHeight = true;
            canvas.fitWidth = true;
        }
        
        // 确保 Canvas 节点的 UITransform 设置正确
        if (rootTransform) {
            rootTransform.setAnchorPoint(0.5, 0.5);
            rootTransform.setContentSize(GameConfig.DESIGN_WIDTH, GameConfig.DESIGN_HEIGHT);
        }
        
        // 重要：强制设置 Canvas 节点位置为 (0, 0, 0)
        this.node.setPosition(0, 0, 0);
        
        // 如果 Canvas 有父节点，也要确保父节点位置正确
        if (this.node.parent) {
            this.node.parent.setPosition(0, 0, 0);
        }
        
        // 初始化节点引用并适配中心原点坐标系
        if (this.worldNode) {
            this.gameContext.worldNode = this.worldNode;
            // 调整 World 节点：锚点左下角，位置偏移到画布左下角
            const worldTransform = this.worldNode.getComponent(UITransform);
            if (worldTransform) {
                worldTransform.setAnchorPoint(0, 0);
                this.worldNode.setPosition(
                    -GameConfig.DESIGN_WIDTH / 2,
                    -GameConfig.DESIGN_HEIGHT / 2,
                    0
                );
                worldTransform.setContentSize(GameConfig.DESIGN_WIDTH, GameConfig.DESIGN_HEIGHT);
            }
        }
        if (this.uiNode) {
            this.gameContext.uiNode = this.uiNode;
        }
        
        // 初始化音效系统
        this.soundManager.init(this.node);
        this.gameContext.soundManager = this.soundManager;
        
        // 创建管理器
        this.createManagers();
        
        // 绘制网格背景
        this.drawGrid();
    }
    
   
    
    start() {
        // 重要：Canvas 的适配逻辑会在 start() 前自动调整位置，需要强制设置为 (0, 0, 0)
        this.node.setPosition(0, 0, 0);
        if (this.node.parent) {
            this.node.parent.setPosition(0, 0, 0);
        }
        
        // 显示开始界面
        if (this.uiManager) {
            this.uiManager.showStartScreen();
        }
    }
    
    update(deltaTime: number) {
        this.deltaTime = deltaTime;
        const deltaMS = deltaTime * 1000;  // 转换为毫秒
        
        // 如果游戏未开始或暂停，不更新
        if (!this.gameContext.gameStarted || this.gameContext.gamePaused) {
            return;
        }
        
        // 注意：EnemyManager 会被 Cocos 自动调用 update，这里不需要手动调用
        // EnemyManager.update 会自己检查 gameStarted 状态
        
        if (this.weaponManager) {
            this.weaponManager.updateWeapons(deltaTime, deltaMS);
        }
        
        if (this.goldManager) {
            this.goldManager.update();
        }
        
        if (this.uiManager) {
            this.uiManager.update(deltaTime);
        }
    }
    
    /**
     * 创建各个管理器
     */
    private createManagers() {
        // 获取或创建金币管理器
        if (this.uiNode) {
            this.goldManager = this.uiNode.getComponent(GoldManager);
            if (!this.goldManager) {
                this.goldManager = this.uiNode.addComponent(GoldManager);
            }
        }
        
        // 获取或创建武器管理器
        if (this.worldNode) {
            this.weaponManager = this.worldNode.getComponent(WeaponManager);
            if (!this.weaponManager) {
                this.weaponManager = this.worldNode.addComponent(WeaponManager);
            }
        }
        
        // 获取或创建敌人管理器
        if (this.worldNode && this.weaponManager && this.goldManager) {
            this.enemyManager = this.worldNode.getComponent(EnemyManager);
            if (!this.enemyManager) {
                this.enemyManager = this.worldNode.addComponent(EnemyManager);
            }
            this.enemyManager.init(this.weaponManager, this.goldManager);
        }
        
        // 获取或创建UI管理器
        if (this.uiNode && this.enemyManager && this.goldManager) {
            this.uiManager = this.uiNode.getComponent(UIManager);

            
            if (!this.uiManager) {
                this.uiManager = this.uiNode.addComponent(UIManager);
            }
            this.uiManager.init(this, this.weaponManager, this.enemyManager, this.goldManager);
        }
    }
    
    /**
     * 绘制网格背景
     */
    private drawGrid() {
        if (!this.backgroundNode) return;
        
        // 调整 Background 节点的锚点和位置
        const uiTransform = this.backgroundNode.getComponent(UITransform);
        if (uiTransform) {
            uiTransform.setAnchorPoint(0, 0);
            this.backgroundNode.setPosition(
                -GameConfig.DESIGN_WIDTH / 2,
                -GameConfig.DESIGN_HEIGHT / 2,
                0
            );
            uiTransform.setContentSize(GameConfig.DESIGN_WIDTH, GameConfig.DESIGN_HEIGHT);
        }
        
        const graphics = this.backgroundNode.getComponent(cc.Graphics);
        if (!graphics) return;
        
        graphics.clear();
        
        // 绘制网格线
        graphics.lineWidth = 1;
        graphics.strokeColor = cc.color(0, 255, 255, 77);  // 青色，30%透明度
        
        const cellSize = GameConfig.CELL_SIZE;
        const cols = Math.ceil(GameConfig.DESIGN_WIDTH / cellSize);
        const rows = Math.ceil(GameConfig.DESIGN_HEIGHT / cellSize);
        
        // 绘制垂直线
        for (let i = 0; i <= cols; i++) {
            const x = i * cellSize;
            graphics.moveTo(x, 0);
            graphics.lineTo(x, GameConfig.DESIGN_HEIGHT);
            graphics.stroke();
        }
        
        // 绘制水平线
        for (let j = 0; j <= rows; j++) {
            const y = j * cellSize;
            graphics.moveTo(0, y);
            graphics.lineTo(GameConfig.DESIGN_WIDTH, y);
            graphics.stroke();
        }
    }
    
    /**
     * 开始游戏
     */
    startGame() {
        this.gameContext.reset();
        this.gameContext.gameStarted = true;
        
        // 播放背景音乐
        this.soundManager.playBgMusic();
    }
    
    /**
     * 暂停游戏
     */
    pauseGame() {
        this.gameContext.gamePaused = true;
    }
    
    /**
     * 继续游戏
     */
    resumeGame() {
        this.gameContext.gamePaused = false;
    }
    
    /**
     * 重新开始游戏
     */
    restartGame() {
        director.loadScene(director.getScene().name);
    }
}

