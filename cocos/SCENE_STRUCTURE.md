# 场景结构说明

## 推荐的场景节点层级结构

```
Canvas (根节点)
├── GameMain (挂载 GameMain.ts 组件)
│   └── [属性引用]
│       ├── worldNode → World 节点
│       ├── uiNode → UI 节点
│       └── backgroundNode → Background 节点
│
├── Background (背景层)
│   ├── [组件] Graphics (用于绘制网格)
│   └── [组件] UITransform
│
├── World (游戏对象层)
│   ├── [组件] WeaponManager
│   └── [组件] EnemyManager
│   └── [子节点] 动态创建的武器、敌人等
│
└── UI (界面层)
    ├── [组件] UIManager
    ├── [组件] GoldManager
    │
    ├── StartScreen (开始界面)
    │   ├── [组件] StartScreen.ts
    │   ├── Title (标题)
    │   ├── Subtitle (副标题)
    │   ├── StartButton (开始按钮)
    │   └── HelpButton (帮助按钮)
    │
    └── GameUI (游戏中界面)
        ├── WaveLabel (波次显示)
        ├── GoldLabel (金币显示)
        └── WeaponContainer (武器选择容器)
```

## 节点命名规范

### 重要节点（必须严格命名）
这些节点会被自动查找，名称必须完全匹配：

- `Background` - 背景节点
- `World` - 游戏世界节点
- `UI` - UI根节点
- `StartScreen` - 开始界面节点
- `GameUI` - 游戏界面节点
- `WeaponContainer` - 武器容器节点
- `WaveLabel` - 波次标签节点

### 可选节点
这些节点名称可以根据需要调整：

- `Title` - 标题
- `Subtitle` - 副标题
- `StartButton` - 开始按钮
- `HelpButton` - 帮助按钮
- `GoldLabel` - 金币标签

## 组件挂载说明

### GameMain 组件（挂载在 Canvas 或其子节点上）
```typescript
worldNode: World 节点引用
uiNode: UI 节点引用
backgroundNode: Background 节点引用
```

### UIManager 组件（挂载在 UI 节点上）
```typescript
startScreen: StartScreen 节点引用 (自动查找)
gameUI: GameUI 节点引用 (自动查找)
weaponContainer: WeaponContainer 节点引用 (自动查找)
waveLabel: WaveLabel 的 Label 组件引用 (自动查找)
```

### StartScreen 组件（挂载在 StartScreen 节点上）
```typescript
startButton: 开始按钮的 Button 组件引用
helpButton: 帮助按钮的 Button 组件引用
titleLabel: 标题的 Label 组件引用
subtitleLabel: 副标题的 Label 组件引用
```

## 设置步骤

### 方式 1：手动设置（推荐，更可靠）

1. **创建节点层级结构**
   - 按照上面的结构在编辑器中创建节点

2. **添加组件**
   - Background 节点添加 Graphics 组件
   - World 节点添加 WeaponManager、EnemyManager 组件
   - UI 节点添加 UIManager、GoldManager 组件
   - StartScreen 节点添加 StartScreen 组件

3. **设置组件属性**
   - 在 GameMain 组件中拖拽设置各个节点引用
   - 在 StartScreen 组件中拖拽设置按钮和标签引用

### 方式 2：使用自动查找（方便，但依赖命名）

1. **创建正确命名的节点**
   - 确保节点名称与上面列出的完全一致

2. **正确的父子关系**
   - StartScreen 必须是 UI 的子节点
   - GameUI 必须是 UI 的子节点
   - WeaponContainer 必须是 GameUI 的子节点

3. **运行游戏**
   - 自动查找功能会在 `onLoad()` 时执行
   - 查看控制台确认节点是否找到
   - 看到 "✅ 自动找到 XXX 节点" 表示成功
   - 看到 "⚠️ 未找到 XXX 节点" 表示需要检查节点名称或层级

## 常见问题

### Q: UIManager 的 startScreen 显示为 null？
**A:** 检查以下几点：
1. UI 节点下是否有名为 `StartScreen` 的子节点？
2. 节点名称是否完全匹配（区分大小写）？
3. 如果使用手动设置，是否在编辑器中拖拽了节点引用？

### Q: 开始按钮点击没反应？
**A:** 检查以下几点：
1. StartScreen 节点上是否挂载了 StartScreen 组件？
2. StartScreen 组件中的 startButton 是否设置了引用？
3. 按钮节点上是否有 Button 组件？
4. 查看控制台是否有错误信息

### Q: 网格没有显示？
**A:** 检查以下几点：
1. Background 节点上是否有 Graphics 组件？
2. Background 节点的 Layer 是否正确？
3. 摄像机是否渲染了该 Layer？
4. GameMain 的 backgroundNode 引用是否设置？

## 调试技巧

1. **查看控制台日志**
   - 运行游戏时会输出各个节点的查找结果
   - 关注 "✅" 和 "⚠️" 标记

2. **使用编辑器的场景检查器**
   - 确认节点层级结构是否正确
   - 检查组件是否正确挂载

3. **逐步测试**
   - 先确保场景结构正确
   - 再检查组件属性设置
   - 最后测试功能是否正常
