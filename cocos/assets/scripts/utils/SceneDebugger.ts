/**
 * 场景调试工具
 * 用于检查场景结构是否正确
 */

import { _decorator, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SceneDebugger')
export class SceneDebugger extends Component {
    
    onLoad() {
        console.log('====== 场景结构检查 ======');
        this.printNodeTree(this.node.parent, 0);
        console.log('========================');
    }
    
    /**
     * 递归打印节点树
     */
    private printNodeTree(node: Node | null, depth: number) {
        if (!node) return;
        
        const indent = '  '.repeat(depth);
        const components = node.components.map(c => c.constructor.name).join(', ');
        console.log(`${indent}├─ ${node.name} [${components || '无组件'}]`);
        
        // 打印子节点
        node.children.forEach(child => {
            this.printNodeTree(child, depth + 1);
        });
    }
}
