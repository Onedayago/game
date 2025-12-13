/**
 * 游戏节点工厂
 * 负责创建游戏中的各种节点
 */

import { Node, UITransform, Layers, Label, Graphics, Color } from 'cc';
import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';

/**
 * 游戏节点工厂类
 */
export class GameNodeFactory {
    /**
     * 创建背景节点（作为 worldNode 的子节点，跟随战场拖拽）
     * 背景节点会被添加为第一个子节点，确保它在最底层渲染
     */
    static createBackgroundNode(worldNode: Node): Node {
        const backgroundNode = new Node('Background');
        backgroundNode.layer = worldNode.layer;
        const bgTransform = backgroundNode.addComponent(UITransform);
        bgTransform.setAnchorPoint(0, 0);
        // 背景节点在 worldNode 的本地坐标系中，位置从 (0, 0) 开始
        backgroundNode.setPosition(0, 0, 0);
        bgTransform.setContentSize(GameConfig.BATTLE_WIDTH, GameConfig.DESIGN_HEIGHT);
        
        // 作为第一个子节点添加，确保在最底层渲染
        if (worldNode.children.length > 0) {
            worldNode.insertChild(backgroundNode, 0);
        } else {
            backgroundNode.setParent(worldNode);
        }
        
        return backgroundNode;
    }

    /**
     * 初始化战场节点（通过编辑器创建）
     */
    static initWorldNode(worldNode: Node | null): void {
        if (!worldNode) return;
        
        worldNode.layer = Layers.Enum.UI_2D;
        const worldTransform = worldNode.getComponent(UITransform);
        if (worldTransform) {
            worldTransform.setAnchorPoint(0, 0);
            worldNode.setPosition(
                -GameConfig.DESIGN_WIDTH / 2,
                -GameConfig.DESIGN_HEIGHT / 2,
                0
            );
            worldTransform.setContentSize(GameConfig.BATTLE_WIDTH, GameConfig.DESIGN_HEIGHT);
        }
    }

    /**
     * 创建武器容器节点
     */
    static createWeaponContainerNode(parent: Node): Node {
        const weaponContainer = new Node('WeaponContainer');
        weaponContainer.setParent(parent);
        const weaponContainerTransform = weaponContainer.addComponent(UITransform);
        weaponContainerTransform.setContentSize(UIConfig.WEAPON_CONTAINER_WIDTH, UIConfig.WEAPON_CONTAINER_HEIGHT);
        weaponContainer.setPosition(0, 0, 0);
        weaponContainer.layer = parent.layer;
        return weaponContainer;
    }

    /**
     * 创建开始界面节点
     */
    static createStartScreenNode(parent: Node): Node {
        const startScreen = new Node('StartScreen');
        startScreen.setParent(parent);
        const startScreenTransform = startScreen.addComponent(UITransform);
        startScreenTransform.setContentSize(GameConfig.DESIGN_WIDTH, GameConfig.DESIGN_HEIGHT);
        startScreen.setPosition(0, 0, 0);
        startScreen.layer = parent.layer;
        return startScreen;
    }
    
    /**
     * 创建小地图节点
     */
    static createMiniMapNode(parent: Node): Node {
        const miniMapNode = new Node('MiniMap');
        miniMapNode.setParent(parent);
        miniMapNode.layer = parent.layer;
        return miniMapNode;
    }
}

