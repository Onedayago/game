/**
 * 武器网格数据组件
 * 用于存储武器在网格中的位置信息
 */

import { _decorator, Component } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('WeaponGridData')
export class WeaponGridData extends Component {
    // 网格位置
    gridX: number = 0;
    gridY: number = 0;
    
    /**
     * 设置网格位置
     */
    setGridPosition(x: number, y: number) {
        this.gridX = x;
        this.gridY = y;
    }
}
