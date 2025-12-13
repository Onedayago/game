/**
 * 游戏主控制器
 * 挂载在根节点上，负责游戏初始化和主循环
 */

import { _decorator, Component, Node, Canvas, director, Size, EventTouch, input, Input } from 'cc';
import { GameContext } from './core/GameContext';
import { SoundManager } from './core/SoundManager';
import { GameConfig } from './config/GameConfig';
import { EnemyManager } from './managers/EnemyManager';
import { WeaponManager } from './managers/WeaponManager';
import { GoldManager } from './managers/GoldManager';
import { StartScreen } from './ui/StartScreen';
import { WeaponContainerUI } from './ui/WeaponContainerUI';
import { ParticleManager } from './core/ParticleManager';
import { BackgroundManager } from './managers/BackgroundManager';
import { GameNodeFactory } from './utils/GameNodeFactory';
import { MiniMap } from './ui/MiniMap';

const { ccclass, property } = _decorator;

@ccclass('GameMain')
export class GameMain extends Component {
    declare node: Node;
    
    /** 战场节点（通过编辑器创建） */
    @property(Node)
    worldNode: Node | null = null;
    
    /** 游戏节点 */
    private backgroundNode: Node | null = null;
    private startScreen: Node | null = null;
    private weaponContainer: Node | null = null;
    private miniMap: Node | null = null;
    
    /** 核心系统 */
    private gameContext: GameContext;
    private soundManager: SoundManager;
    
    /** 管理器 */
    private enemyManager: EnemyManager | null = null;
    private backgroundManager: BackgroundManager | null = null;
    private weaponManager: WeaponManager | null = null;
    private goldManager: GoldManager | null = null;
    
    /** UI组件 */
    private weaponContainerUI: WeaponContainerUI | null = null;
    private startScreenComp: StartScreen | null = null;
    
    /** 战场拖动状态 */
    private isPanning: boolean = false;
    private panStartX: number = 0;
    private worldStartX: number = 0;
    
    onLoad() {
        this.initGameContext();
        this.setupCanvas();
        this.createNodes();
        this.initSoundSystem();
        this.createManagers();
    }
    
    /**
     * 初始化游戏上下文
     */
    private initGameContext() {
        this.gameContext = GameContext.getInstance();
        this.soundManager = SoundManager.getInstance();
    }
    
    /**
     * 设置Canvas设计分辨率
     */
    private setupCanvas() {
        const canvas = this.node.getComponent(Canvas);
        if (canvas) {
            canvas.designResolution = new Size(
                GameConfig.DESIGN_WIDTH,
                GameConfig.DESIGN_HEIGHT
            );
            canvas.fitHeight = true;
            canvas.fitWidth = true;
        }
    }
    
    /**
     * 初始化音效系统
     */
    private initSoundSystem() {
        this.soundManager.init(this.node);
        this.gameContext.soundManager = this.soundManager;
    }
    
    /**
     * 创建所有游戏节点
     */
    private createNodes() {
        // 初始化战场节点（通过编辑器创建）
        GameNodeFactory.initWorldNode(this.worldNode);
        if (this.worldNode) {
            this.gameContext.worldNode = this.worldNode;
            
            // 创建 Background 节点（作为 worldNode 的子节点，跟随战场拖拽）
            this.backgroundNode = GameNodeFactory.createBackgroundNode(this.worldNode);
        }
        
        // 创建 WeaponContainer 节点
        this.weaponContainer = GameNodeFactory.createWeaponContainerNode(this.node);
        
        // 创建小地图节点
        this.miniMap = GameNodeFactory.createMiniMapNode(this.node);
        const miniMapComp = this.miniMap.addComponent(MiniMap);
        
        // 创建 StartScreen 节点
        this.startScreen = GameNodeFactory.createStartScreenNode(this.node);
        // StartScreen 组件会在 showStartScreen 时添加
    }
    
    start() {
        // 重要：Canvas 的适配逻辑会在 start() 前自动调整位置，需要强制设置为 (0, 0, 0)
        this.resetNodePositions();
        this.setupBattlefieldPanning();
        this.showStartScreen();
    }
    
    /**
     * 重置节点位置（解决Canvas适配问题）
     */
    private resetNodePositions() {
        this.node.setPosition(0, 0, 0);
        if (this.node.parent) {
            this.node.parent.setPosition(0, 0, 0);
        }
        if (this.startScreen) {
            this.startScreen.setPosition(0, 0, 0);
        }
    }
    
    update(deltaTime: number) {
        // 如果游戏未开始或暂停，不更新
        if (!this.gameContext.gameStarted || this.gameContext.gamePaused) {
            return;
        }
        
        const deltaMS = deltaTime * 1000; // 转换为毫秒
        
        // 注意：EnemyManager 会被 Cocos 自动调用 update，这里不需要手动调用
        // EnemyManager.update 会自己检查 gameStarted 状态
        
        this.updateManagers(deltaTime, deltaMS);
        this.updateUI(deltaTime);
        this.updateParticleManager(deltaTime);
    }
    
    /**
     * 更新所有管理器
     */
    private updateManagers(deltaTime: number, deltaMS: number) {
        if (this.weaponManager) {
            this.weaponManager.updateWeapons(deltaTime, deltaMS);
        }
        
        if (this.goldManager) {
            this.goldManager.update();
        }
    }
    
    /**
     * 更新粒子管理器
     */
    private updateParticleManager(deltaTime: number) {
        if (this.gameContext.particleManager) {
            this.gameContext.particleManager.update(deltaTime);
        }
    }
    
    /**
     * 创建各个管理器
     */
    private createManagers() {
        this.createGoldManager();
        this.createWeaponManager();
        this.createParticleManager();
        this.initUI();
        this.createBackgroundManager();
        this.createEnemyManager();
    }
    
    /**
     * 获取或创建组件（辅助方法）
     */
    private getOrAddComponent<T extends Component>(
        node: Node,
        componentClass: typeof Component
    ): T | null {
        if (!node) return null;
        let component = node.getComponent(componentClass) as T;
        if (!component) {
            component = node.addComponent(componentClass) as T;
        }
        return component;
    }
    
    /**
     * 创建金币管理器
     */
    private createGoldManager() {
        this.goldManager = this.getOrAddComponent<GoldManager>(this.node, GoldManager);
    }
    
    /**
     * 创建武器管理器
     */
    private createWeaponManager() {
        this.weaponManager = this.getOrAddComponent<WeaponManager>(this.worldNode, WeaponManager);
    }
    
    /**
     * 创建粒子管理器
     */
    private createParticleManager() {
        if (!this.worldNode || !this.gameContext) return;
        
        const particleManager = this.getOrAddComponent<ParticleManager>(
            this.worldNode,
            ParticleManager
        );
        if (particleManager) {
            this.gameContext.particleManager = particleManager;
        }
    }
    
    /**
     * 创建背景管理器
     */
    private createBackgroundManager() {
        if (!this.worldNode || !this.backgroundNode) return;
        
        this.backgroundManager = this.getOrAddComponent<BackgroundManager>(
            this.worldNode,
            BackgroundManager
        );
        if (this.backgroundManager) {
            this.backgroundManager.init(this.backgroundNode);
        }
    }
    
    /**
     * 创建敌人管理器
     */
    private createEnemyManager() {
        if (!this.worldNode || !this.weaponManager || !this.goldManager) return;
        
        this.enemyManager = this.getOrAddComponent<EnemyManager>(this.worldNode, EnemyManager);
        if (this.enemyManager) {
            this.enemyManager.init(this.weaponManager, this.goldManager);
        }
    }
    
    /**
     * 初始化UI
     */
    private initUI() {
        this.initWeaponContainerUI();
    }
    
    /**
     * 初始化武器容器UI组件
     */
    private initWeaponContainerUI() {
        if (!this.weaponContainer || !this.goldManager || !this.weaponManager) {
            console.error('[GameMain] 武器容器UI组件初始化失败：缺少必要的依赖');
            return;
        }
        
        this.weaponContainerUI = this.getOrAddComponent<WeaponContainerUI>(
            this.weaponContainer,
            WeaponContainerUI
        );
        
        if (this.weaponContainerUI) {
            this.weaponContainerUI.init(this.goldManager, this.weaponManager);
            
            // 将引用保存到 GameContext
            this.gameContext.weaponContainerUI = this.weaponContainerUI;
            this.gameContext.weaponManager = this.weaponManager;
        }
    }
    
    /**
     * 更新UI
     */
    private updateUI(deltaTime: number) {
        // 更新武器操作按钮位置
        if (this.weaponContainerUI && this.weaponManager && this.gameContext && this.gameContext.gameStarted) {
            const selectedWeapon = this.weaponManager.getSelectedWeapon();
            if (selectedWeapon) {
                this.weaponContainerUI.updateActionButtons();
            }
        }
    }
    
    /**
     * 显示开始界面
     */
    private showStartScreen() {
        if (!this.startScreen) return;
        
        this.startScreen.active = true;
        
        // 获取或创建 StartScreen 组件
        this.startScreenComp = this.startScreen.getComponent(StartScreen);
        if (!this.startScreenComp) {
            this.startScreenComp = this.startScreen.addComponent(StartScreen);
        }
        
        // 设置回调
        this.startScreenComp.setStartCallback(() => {
            this.onStartButtonClick();
        });
        
        this.startScreenComp.setHelpCallback(() => {
            this.onHelpButtonClick();
        });
        
        this.startScreenComp.show();
    }
    
    /**
     * 隐藏开始界面
     */
    private hideStartScreen() {
        if (this.startScreen) {
            this.startScreen.active = false;
        }
    }
    
    /**
     * 开始游戏按钮点击
     */
    private onStartButtonClick() {
        this.hideStartScreen();
        this.startGame();
    }
    
    /**
     * 帮助按钮点击
     */
    private onHelpButtonClick() {
        // TODO: 实现帮助界面显示
    }
    
    /**
     * 开始游戏
     */
    startGame() {
        this.gameContext.reset();
        this.gameContext.gameStarted = true;
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
    
    /**
     * 设置战场左右拖动功能
     */
    private setupBattlefieldPanning() {
        if (!this.worldNode) return;
        
        this.registerTouchHandlers();
    }
    
    /**
     * 注册触摸事件处理器
     */
    private registerTouchHandlers() {
        const { minX, maxX } = this.calculatePanBounds();
        
        input.on(Input.EventType.TOUCH_START, this.onTouchStart.bind(this), this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove.bind(this, minX, maxX), this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd.bind(this), this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd.bind(this), this);
    }
    
    /**
     * 计算拖动边界
     * World 节点的初始位置是 -DESIGN_WIDTH/2
     * 战场宽度是 BATTLE_WIDTH，所以可以拖动的范围是：
     * 最左：-DESIGN_WIDTH/2 (初始位置，World 节点左边界对齐画布左边界)
     * 最右：DESIGN_WIDTH/2 - BATTLE_WIDTH (World 节点右边界对齐画布右边界)
     */
    private calculatePanBounds() {
        const minX = GameConfig.DESIGN_WIDTH / 2 - GameConfig.BATTLE_WIDTH; // 最右边界
        const maxX = -GameConfig.DESIGN_WIDTH / 2; // 最左边界（初始位置）
        return { minX, maxX };
    }
    
    /**
     * 触摸开始处理
     */
    private onTouchStart(event: EventTouch) {
        const touch = event.touch;
        if (!touch || !this.worldNode) return;
        
        // 检查是否正在拖拽武器
        if (this.isDraggingWeapon()) return;
        
        const uiLocation = touch.getUILocation();
        
        // 检查是否在战斗区域内
        if (this.isInBattleArea(uiLocation.y)) {
            this.isPanning = true;
            this.panStartX = uiLocation.x;
            this.worldStartX = this.worldNode.position.x;
        }
    }
    
    /**
     * 检查是否正在拖拽武器
     */
    private isDraggingWeapon(): boolean {
        if (!this.weaponContainerUI) return false;
        
        const dragManager = (this.weaponContainerUI as any)['dragManager'];
        if (!dragManager) return false;
        
        return dragManager.isDragging && dragManager.isDragging();
    }
    
    /**
     * 检查触摸点是否在战斗区域内
     */
    private isInBattleArea(touchY: number): boolean {
        // 将 UI 坐标转换为世界坐标（中心原点）
        const centerY = touchY - GameConfig.DESIGN_HEIGHT / 2;
        
        // 检查是否在战斗区域内（Y坐标在战斗区域范围内）
        // 战斗区域从 BATTLE_START_ROW 开始，高度为 BATTLE_ROWS * CELL_SIZE
        const battleStartY = GameConfig.BATTLE_START_ROW * GameConfig.CELL_SIZE;
        const battleEndY = (GameConfig.BATTLE_START_ROW + GameConfig.BATTLE_ROWS) * GameConfig.CELL_SIZE;
        
        // 转换为 World 节点的本地坐标（World 节点锚点在左下角）
        const worldLocalY = centerY + GameConfig.DESIGN_HEIGHT / 2;
        
        return worldLocalY >= battleStartY && worldLocalY <= battleEndY;
    }
    
    /**
     * 触摸移动处理
     */
    private onTouchMove(minX: number, maxX: number, event: EventTouch) {
        if (!this.isPanning || !this.worldNode) return;
        
        const touch = event.touch;
        if (!touch) return;
        
        const uiLocation = touch.getUILocation();
        const dx = uiLocation.x - this.panStartX;
        
        // 计算新位置并限制拖动范围
        let nextX = this.worldStartX + dx;
        nextX = Math.max(minX, Math.min(maxX, nextX));
        
        // 更新World节点位置
        const currentPos = this.worldNode.position;
        this.worldNode.setPosition(nextX, currentPos.y, currentPos.z);
    }
    
    /**
     * 触摸结束处理
     */
    private onTouchEnd() {
        this.isPanning = false;
    }
}

