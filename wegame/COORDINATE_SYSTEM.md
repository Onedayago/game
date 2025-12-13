# 坐标系统说明

## 坐标系差异

### Cocos Creator 坐标系
- **Y 轴方向**：从下往上（底部是 0，顶部是正数）
- **原点位置**：左下角或中心
- **World 节点**：锚点在左下角，Y 从 0 开始（底部）

### 微信小游戏 Canvas 坐标系
- **Y 轴方向**：从上往下（顶部是 0，底部是正数）
- **原点位置**：左上角
- **触摸坐标**：相对于 Canvas 左上角

## 坐标转换

### 核心转换公式

```javascript
// Cocos Y -> Canvas Y
canvasY = canvasHeight - cocosY

// Canvas Y -> Cocos Y
cocosY = canvasHeight - canvasY
```

### 使用工具类

```javascript
import { CoordinateSystem } from './utils/CoordinateSystem';

// Cocos Y 转 Canvas Y
const canvasY = CoordinateSystem.cocosYToCanvasY(cocosY, canvasHeight);

// Canvas Y 转 Cocos Y
const cocosY = CoordinateSystem.canvasYToCocosY(canvasY, canvasHeight);
```

## 代码中的坐标使用

### 游戏逻辑（内部使用 Cocos 坐标系）
- 敌人和武器的位置：`x, y` 使用 Cocos 坐标系（Y 从下往上）
- 移动计算：使用 Cocos 坐标系
- 碰撞检测：使用 Cocos 坐标系

### 渲染（转换为 Canvas 坐标系）
- 所有渲染方法在绘制前需要将 Y 坐标转换为 Canvas 坐标系
- 使用 `CoordinateSystem.cocosYToCanvasY()` 转换

### 触摸事件（转换为 Cocos 坐标系）
- 触摸坐标是 Canvas 坐标系（Y 从上往下）
- 需要转换为 Cocos 坐标系进行处理
- 使用 `CoordinateSystem.canvasYToCocosY()` 转换

## 注意事项

1. **角度计算**：在 Cocos 坐标系中，`Math.atan2(dy, dx)` 正常使用
2. **网格系统**：行号从下往上（0 在底部），与 Cocos 坐标系一致
3. **战斗区域**：`BATTLE_START_ROW` 从底部开始计算
4. **血条位置**：在 Cocos 坐标系中，血条在实体上方（Y 更大），在 Canvas 坐标系中需要翻转

