/**
 * 小地图组件
 * 显示战场的全局视野，包括武器位置和当前可见区域
 */

import { _decorator, Component, Node, Graphics, UITransform, Color, Vec2 } from 'cc';
import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';
import { GameContext } from '../core/GameContext';
import { ColorCache, GameColors } from '../config/Colors';
import { WeaponGridData } from '../components/WeaponGridData';

const { ccclass, property } = _decorator;

@ccclass('MiniMap')
export class MiniMap extends Component {
    declare node: Node;
    
    private graphics: Graphics | null = null;
    private gameContext: GameContext;
    
    // 小地图尺寸
    private miniMapWidth: number;
    private miniMapHeight: number;
    
    // 缩放比例（战场到小地图）
    private scaleX: number;
    private scaleY: number;
    
    onLoad() {
        this.gameContext = GameContext.getInstance();
        
        // 小地图尺寸：使用配置常量
        this.miniMapWidth = UIConfig.MINI_MAP_WIDTH;
        this.miniMapHeight = UIConfig.MINI_MAP_HEIGHT;
        
        // 计算缩放比例
        this.scaleX = this.miniMapWidth / GameConfig.BATTLE_WIDTH;
        this.scaleY = this.miniMapHeight / GameConfig.DESIGN_HEIGHT;
        
        // 获取或创建 Graphics 组件
        this.graphics = this.node.getComponent(Graphics);
        if (!this.graphics) {
            this.graphics = this.node.addComponent(Graphics);
        }
        
        // 设置节点属性
        const transform = this.node.getComponent(UITransform);
        if (transform) {
            transform.setContentSize(this.miniMapWidth, this.miniMapHeight);
            transform.setAnchorPoint(1, 0); // 右下角锚点
        }
    }
    
    start() {
        // 设置位置：画布右下角
        // 使用小地图宽度来计算位置（锚点在右下角）

        const posX = GameConfig.DESIGN_WIDTH / 2;
        const posY = -GameConfig.DESIGN_HEIGHT / 2;
        this.node.setPosition(posX - this.miniMapWidth, posY, 0);
        
        this.render();
    }
    
    update() {
        // 每帧更新可见区域指示器
        this.render();
    }
    
    /**
     * 渲染小地图
     */
    private render() {
        if (!this.graphics) return;
        
        this.graphics.clear();
        
        // 1. 绘制背景边框
        this.drawBackground();
        
        // 2. 绘制战场网格
        this.drawGrid();
        
        // 3. 绘制武器位置
        this.drawWeapons();
        
        // 4. 绘制敌人位置（如果有）
        this.drawEnemies();
        
        // 5. 绘制当前可见区域指示器
        this.drawViewportIndicator();
    }
    
    /**
     * 绘制背景和边框
     * 样式与武器容器保持一致
     */
    private drawBackground() {
        if (!this.graphics) return;
        
        // 锚点在右下角 (1, 0)，所以从 (-width, 0) 开始绘制
        const x = 0;
        const y = 0;
        const radius = 10; // 与武器容器相同的圆角值
        
        // 深色背景（与武器容器一致）
        this.graphics.fillColor = new Color(30, 30, 50, 240);
        this.graphics.roundRect(x, y, this.miniMapWidth, this.miniMapHeight, radius);
        this.graphics.fill();
        
        // 青色边框（与武器容器一致）
        this.graphics.lineWidth = 2;
        this.graphics.strokeColor = new Color(0, 255, 255, 200);
        this.graphics.roundRect(x, y, this.miniMapWidth, this.miniMapHeight, radius);
        this.graphics.stroke();
    }
    
    /**
     * 绘制战场网格
     */
    private drawGrid() {
        if (!this.graphics) return;
        
        this.graphics.lineWidth = 0.5;
        this.graphics.strokeColor = new Color(0, 255, 255, 60); // 青色，低透明度
        
        const cellSizeX = GameConfig.CELL_SIZE * this.scaleX;
        const cellSizeY = GameConfig.CELL_SIZE * this.scaleY;
        
        const cols = GameConfig.BATTLE_COLS;
        const rows = GameConfig.TOTAL_ROWS;
        
        // 绘制垂直线
        for (let i = 0; i <= cols; i++) {
            const x = i * cellSizeX;
            this.graphics.moveTo(x, 0);
            this.graphics.lineTo(x, this.miniMapHeight);
            this.graphics.stroke();
        }
        
        // 绘制水平线
        for (let j = 0; j <= rows; j++) {
            const y = j * cellSizeY;
            this.graphics.moveTo(0, y);
            this.graphics.lineTo(this.miniMapWidth, y);
            this.graphics.stroke();
        }
    }
    
    /**
     * 绘制武器位置
     */
    private drawWeapons() {
        if (!this.graphics || !this.gameContext.weapons) return;
        
        const weapons = this.gameContext.weapons;
        const weaponSize = Math.max(2, GameConfig.CELL_SIZE * this.scaleX * 0.3);
        
        for (const weapon of weapons) {
            if (!weapon || !weapon.isValid) continue;
            
            // 获取武器的网格位置
            const gridData = weapon.getComponent(WeaponGridData);
            if (!gridData) continue;
            
            const col = gridData.gridX;
            const row = gridData.gridY;
            
            if (col === undefined || row === undefined) continue;
            
            // 转换为小地图坐标
            const x = col * GameConfig.CELL_SIZE * this.scaleX + (GameConfig.CELL_SIZE * this.scaleX) / 2;
            const y = row * GameConfig.CELL_SIZE * this.scaleY + (GameConfig.CELL_SIZE * this.scaleY) / 2;
            
            // 绘制武器点（绿色）
            this.graphics.fillColor = new Color(0, 255, 0, 200);
            this.graphics.circle(x, y, weaponSize);
            this.graphics.fill();
        }
    }
    
    /**
     * 绘制敌人位置
     */
    private drawEnemies() {
        if (!this.graphics || !this.gameContext.enemies) return;
        
        const enemies = this.gameContext.enemies;
        const enemySize = Math.max(1.5, GameConfig.CELL_SIZE * this.scaleX * 0.25);
        
        for (const enemy of enemies) {
            if (!enemy || !enemy.isValid) continue;
            
            // 敌人节点的 position 已经是相对于 worldNode 的本地坐标
            // 因为敌人是 worldNode 的子节点
            const localPos = enemy.position;
            
            // 转换为小地图坐标
            const x = localPos.x * this.scaleX;
            const y = localPos.y * this.scaleY;
            
            // 检查是否在小地图范围内
            if (x < 0 || x > this.miniMapWidth || y < 0 || y > this.miniMapHeight) continue;
            
            // 绘制敌人点（红色）
            this.graphics.fillColor = new Color(255, 0, 0, 200);
            this.graphics.circle(x, y, enemySize);
            this.graphics.fill();
        }
    }
    
    /**
     * 绘制当前可见区域指示器
     */
    private drawViewportIndicator() {
        if (!this.graphics || !this.gameContext.worldNode) return;
        
        const worldNode = this.gameContext.worldNode;
        const worldNodePos = worldNode.position;
        
        // worldNode 的位置是相对于 Canvas 中心的（中心原点坐标系）
        // worldNode 的初始位置是 (-DESIGN_WIDTH/2, -DESIGN_HEIGHT/2)
        // 当 worldNode 被拖动时，position.x 会变化
        // 可见区域在 worldNode 的本地坐标系中：从 worldNode 的左边界开始，宽度为 DESIGN_WIDTH
        
        // 计算可见区域的本地 X 坐标
        // worldNode 的 position 是相对于 Canvas 中心的，所以：
        // 可见区域的本地 X = -worldNode.position.x - DESIGN_WIDTH/2 + DESIGN_WIDTH/2 = -worldNode.position.x
        // 但 worldNode 的本地坐标系从 (0, 0) 开始，所以需要调整
        const worldNodeLocalX = -worldNodePos.x - GameConfig.DESIGN_WIDTH / 2;
        const viewportLocalX = Math.max(0, Math.min(GameConfig.BATTLE_WIDTH - GameConfig.DESIGN_WIDTH, worldNodeLocalX));
        const viewportLocalY = 0; // 从底部开始
        
        // 转换为小地图坐标
        const viewportX = viewportLocalX * this.scaleX;
        const viewportY = viewportLocalY * this.scaleY;
        const viewportWidth = GameConfig.DESIGN_WIDTH * this.scaleX;
        const viewportHeight = this.miniMapHeight;
        
        // 绘制可见区域边框（黄色半透明）
        this.graphics.lineWidth = 2;
        this.graphics.strokeColor = new Color(255, 255, 0, 180);
        this.graphics.rect(viewportX, viewportY, viewportWidth, viewportHeight);
        this.graphics.stroke();
        
        // 绘制半透明填充
        this.graphics.fillColor = new Color(255, 255, 0, 30);
        this.graphics.rect(viewportX, viewportY, viewportWidth, viewportHeight);
        this.graphics.fill();
    }
}

