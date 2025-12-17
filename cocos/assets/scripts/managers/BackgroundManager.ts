/**
 * 背景管理器
 * 负责绘制游戏战场的网格背景
 */

import { _decorator, Component, Node, Graphics, UITransform, Color } from 'cc';
import { GameConfig } from '../config/GameConfig';

const { ccclass } = _decorator;

@ccclass('BackgroundManager')
export class BackgroundManager extends Component {
    private backgroundNode: Node | null = null;
    private graphics: Graphics | null = null;
    
    /**
     * 初始化背景管理器
     * @param backgroundNode - 背景节点
     */
    init(backgroundNode: Node | null): void {
        this.backgroundNode = backgroundNode;
        if (this.backgroundNode) {
            this.setupNode();
            // 获取或创建 Graphics 组件
            this.graphics = this.backgroundNode.getComponent(Graphics);
            if (!this.graphics) {
                // 静默添加 Graphics 组件（如果编辑器中未添加）
                this.graphics = this.backgroundNode.addComponent(Graphics);
            }
            this.renderBackground();
        }
    }
    
    /**
     * 设置节点属性（锚点、位置、大小）
     * 背景节点作为 worldNode 的子节点，位置从 (0, 0) 开始
     */
    private setupNode(): void {
        if (!this.backgroundNode) return;
        
        const uiTransform = this.backgroundNode.getComponent(UITransform);
        if (uiTransform) {
            uiTransform.setAnchorPoint(0, 0);
            // 背景节点在 worldNode 的本地坐标系中，位置从 (0, 0) 开始
            this.backgroundNode.setPosition(0, 0, 0);
            uiTransform.setContentSize(GameConfig.BATTLE_WIDTH, GameConfig.DESIGN_HEIGHT);
        }
    }
    
    /**
     * 绘制网格背景
     */
    private renderBackground(): void {
        if (!this.graphics) {
            console.warn('[BackgroundManager] renderBackground: Graphics component not found');
            return;
        }
        
        this.graphics.clear();
        
        // 绘制网格线
        this.graphics.lineWidth = 1;
        this.graphics.strokeColor = new Color(0, 255, 255, 77);  // 青色，30%透明度
        
        const cellSize = GameConfig.CELL_SIZE;
        const cols = Math.ceil(GameConfig.BATTLE_WIDTH / cellSize);
        const rows = Math.ceil(GameConfig.DESIGN_HEIGHT / cellSize);
        
        // 绘制垂直线
        for (let i = 0; i <= cols; i++) {
            const x = i * cellSize;
            this.graphics.moveTo(x, 0);
            this.graphics.lineTo(x, GameConfig.DESIGN_HEIGHT);
            this.graphics.stroke();
        }
        
        // 绘制水平线
        for (let j = 0; j <= rows; j++) {
            const y = j * cellSize;
            this.graphics.moveTo(0, y);
            this.graphics.lineTo(GameConfig.BATTLE_WIDTH, y);
            this.graphics.stroke();
        }
    }
}

