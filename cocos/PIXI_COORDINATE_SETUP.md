# 🎯 通过 Canvas 容器实现 Pixi.js 坐标系

## 📋 方案概述

在 Canvas 下创建一个 **WorldContainer** 容器节点，设置其锚点为左上角，这样所有子节点都可以使用 Pixi.js 风格的坐标系。

---

## 🏗️ 节点结构

### 修改前：
```
Canvas
├── GameMain
├── Background
├── World
├── Particles
└── UI
```

### 修改后：⭐
```
Canvas
└── WorldContainer  ← 新增容器，锚点(0,1)，位置(-800,320)
    ├── GameMain
    ├── Background
    ├── World
    ├── Particles
    └── UI
```

---

## 🛠️ 详细操作步骤

### 步骤 1：创建 WorldContainer 节点

1. 在 Cocos Creator 编辑器中打开场景
2. 在**层级管理器**中，右键点击 **Canvas** 节点
3. 选择 **创建 → 创建空节点**
4. 将新节点命名为 `WorldContainer`

---

### 步骤 2：移动所有子节点到 WorldContainer

将以下节点拖拽到 WorldContainer 内：
- GameMain
- Background
- World
- Particles
- UI

**操作方法：**
1. 按住 `Shift` 键，多选所有子节点
2. 拖拽到 WorldContainer 节点上
3. 松开鼠标

---

### 步骤 3：设置 WorldContainer 的属性

选中 **WorldContainer** 节点，在右侧**属性检查器**中设置：

#### UITransform 组件

```
Content Size:
├─ Width:  1600  (与 Canvas 设计分辨率相同)
└─ Height: 640   (与 Canvas 设计分辨率相同)

Anchor Point:  ⭐ 关键！
├─ X: 0   ← 左边（从 0.5 改为 0）
└─ Y: 1   ← 顶部（从 0.5 改为 1）

Position:
├─ X: -800  ← 设计宽度的一半，取负值 (-1600/2)
├─ Y: 320   ← 设计高度的一半，取正值 (640/2)
└─ Z: 0
```

#### 具体数值（1600x640 画布）

| 属性 | 值 | 说明 |
|------|-----|------|
| Content Size.W | 1600 | Canvas 设计宽度 |
| Content Size.H | 640 | Canvas 设计高度 |
| Anchor.X | 0 | 左边锚点 |
| Anchor.Y | 1 | 顶部锚点 |
| Position.X | -800 | -DESIGN_WIDTH / 2 |
| Position.Y | 320 | DESIGN_HEIGHT / 2 |
| Position.Z | 0 | 保持默认 |

---

### 步骤 4：验证设置

#### 在场景编辑器中：
- WorldContainer 的左上角应该对齐到 Canvas 的左上角
- 所有子节点应该保持相对位置不变

#### 坐标对照：
| 位置 | WorldContainer 内的坐标 | 屏幕实际位置 |
|------|------------------------|-------------|
| (0, 0) | 左上角 | 左上角 ✅ |
| (1600, 0) | 右上角 | 右上角 ✅ |
| (0, 640) | 左下角 | 左下角 ✅ |
| (1600, 640) | 右下角 | 右下角 ✅ |
| (800, 320) | 中心 | 中心 ✅ |

---

## 📝 代码无需修改

使用这个方案后，**代码可以保持 Pixi.js 风格**，无需做坐标转换！

### 网格绘制代码（保持不变）

```typescript
private drawGrid() {
    if (!this.backgroundNode) return;
    
    const graphics = this.backgroundNode.getComponent(Graphics);
    if (!graphics) return;
    
    graphics.clear();
    graphics.lineWidth = 1;
    graphics.strokeColor = new Color(0, 255, 255, 77);
    
    const cellSize = GameConfig.CELL_SIZE;
    const cols = Math.ceil(GameConfig.DESIGN_WIDTH / cellSize);
    const rows = Math.ceil(GameConfig.DESIGN_HEIGHT / cellSize);
    
    // ✅ 直接使用 Pixi.js 风格的坐标
    // 从左上角 (0, 0) 开始绘制
    for (let i = 0; i <= cols; i++) {
        const x = i * cellSize;
        graphics.moveTo(x, 0);  // 从顶部开始
        graphics.lineTo(x, GameConfig.DESIGN_HEIGHT);  // 到底部
        graphics.stroke();
    }
    
    for (let j = 0; j <= rows; j++) {
        const y = j * cellSize;
        graphics.moveTo(0, y);  // 从左边开始
        graphics.lineTo(GameConfig.DESIGN_WIDTH, y);  // 到右边
        graphics.stroke();
    }
    
    console.log(`✅ 网格绘制完成: ${cols}x${rows}`);
}
```

### 游戏对象位置（保持 Pixi.js 风格）

```typescript
// 在左上角放置对象
tower.setPosition(100, 100);  // ✅ 与 Pixi.js 相同

// 在右下角放置对象
enemy.setPosition(1500, 540);  // ✅ 与 Pixi.js 相同

// 边界检测
if (x >= 0 && x <= 1600 && y >= 0 && y <= 640) {
    // ✅ 在屏幕内（与 Pixi.js 相同）
}
```

---

## 🎯 为什么这个方案最好？

### ✅ 优点：

1. **代码无需修改** - 保持 Pixi.js 风格
2. **统一坐标系** - 所有子节点使用相同的坐标原点
3. **易于理解** - 与原版游戏逻辑一致
4. **便于迁移** - 从 Pixi.js 迁移代码更简单
5. **编辑器友好** - 只需修改一次容器节点

### ⚠️ 注意事项：

1. **Y 轴方向仍然不同**
   - Pixi.js: Y 轴向下 ↓
   - Cocos: Y 轴向上 ↑
   
   **解决方法**：在绘制时需要注意 Y 轴方向，或使用 `scale.y = -1` 翻转整个容器

2. **如果需要完全模拟 Pixi.js 的 Y 轴方向**：
   ```typescript
   // 在 onLoad 中设置
   worldContainer.scale = new Vec3(1, -1, 1);  // Y 轴翻转
   ```

---

## 🔄 完整的 Y 轴翻转方案（可选）

如果想让 Y 轴向下（完全模拟 Pixi.js）：

### 步骤 1：设置 WorldContainer

```
UITransform:
├─ Anchor: (0, 1)  ← 左上角
└─ Position: (-800, 320)

Transform:
└─ Scale: (1, -1, 1)  ⭐ Y 轴翻转
```

### 步骤 2：子节点的文字也需要翻转回来

所有 Label 节点需要再次翻转：
```typescript
// 对于 UI 文字节点
labelNode.scale = new Vec3(1, -1, 1);  // 翻转回来
```

### 结果：
- ✅ 原点在左上角
- ✅ X 轴向右
- ✅ Y 轴向下（完全模拟 Pixi.js）
- ⚠️ 需要额外处理文字翻转

---

## 📊 方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **WorldContainer + 锚点(0,1)** | 简单，统一坐标系 | Y轴仍向上 | ⭐⭐⭐⭐⭐ |
| **WorldContainer + Y轴翻转** | 完全模拟Pixi.js | 文字需要翻转 | ⭐⭐⭐ |
| **保持 Cocos 标准** | 符合 Cocos 规范 | 需要转换所有坐标 | ⭐⭐⭐⭐ |

---

## 🎬 动画演示（文字版）

### 设置前：
```
Canvas (0, 0)
    ↓
所有子节点以 Canvas 中心为原点
绘制 (0, 0) → 显示在屏幕中心 ❌
```

### 设置后：
```
Canvas (0, 0)
    ↓
WorldContainer (左上角对齐)
    ↓
所有子节点以左上角为原点
绘制 (0, 0) → 显示在屏幕左上角 ✅
```

---

## ✅ 验证清单

设置完成后，检查以下项：

- [ ] WorldContainer 已创建
- [ ] 所有节点都在 WorldContainer 内
- [ ] WorldContainer 的 Anchor 为 (0, 1)
- [ ] WorldContainer 的 Position 为 (-800, 320)
- [ ] WorldContainer 的 Content Size 为 (1600, 640)
- [ ] 运行游戏，网格显示正确
- [ ] 游戏对象位置正确

---

## 🚀 快速设置脚本（可选）

如果不想手动设置，可以在 GameMain.ts 的 onLoad 中添加：

```typescript
onLoad() {
    // 自动创建和设置 WorldContainer
    this.setupPixiStyleCoordinates();
    // ... 其他初始化代码
}

private setupPixiStyleCoordinates() {
    // 获取 Canvas 节点
    const canvas = this.node.getComponent(Canvas);
    if (!canvas) return;
    
    // 检查是否已有 WorldContainer
    let container = this.node.getChildByName('WorldContainer');
    
    if (!container) {
        // 创建 WorldContainer
        container = new Node('WorldContainer');
        this.node.addChild(container);
        
        // 移动所有子节点到 WorldContainer
        const children = [...this.node.children];
        children.forEach(child => {
            if (child.name !== 'WorldContainer') {
                child.setParent(container);
            }
        });
    }
    
    // 设置 WorldContainer 属性
    const transform = container.getComponent(UITransform);
    if (transform) {
        transform.setContentSize(
            GameConfig.DESIGN_WIDTH,
            GameConfig.DESIGN_HEIGHT
        );
        transform.setAnchorPoint(0, 1);  // 左上角
    }
    
    // 设置位置
    container.setPosition(
        -GameConfig.DESIGN_WIDTH / 2,
        GameConfig.DESIGN_HEIGHT / 2,
        0
    );
    
    console.log('✅ Pixi.js 风格坐标系已设置');
}
```

---

## 📝 总结

通过在 Canvas 下创建 WorldContainer 容器并设置其锚点为左上角，可以实现：

1. ✅ **统一坐标系** - 所有子节点使用相同的原点
2. ✅ **代码兼容** - 保持 Pixi.js 风格的坐标代码
3. ✅ **一次设置** - 只需在编辑器中修改一次
4. ✅ **易于维护** - 后续添加节点自动继承坐标系

**推荐使用这个方案！** 🎉

---

📅 **创建时间**: 2025-12-10  
🎮 **项目**: TowerGame - Cocos Creator  
📖 **参考**: GameMain.ts, SCENE_SETUP_GUIDE.md

