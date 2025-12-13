# 🎬 Cocos Creator 场景创建指南

本指南详细说明如何在 Cocos Creator 中创建游戏场景。

---

## 📋 准备工作

### 1. 打开项目
1. 启动 **Cocos Creator 3.8+**
2. 点击 **打开项目**
3. 选择 `cocos` 文件夹
4. 等待项目加载完成

### 2. 确认项目结构
在**资源管理器**中应该看到：
```
assets/
├── scripts/     ✅ (21个TS文件)
├── audio/       ✅ (3个音频文件)
├── scenes/      ⏳ (待创建场景)
└── resources/   ✅
```

---

## 🎬 创建游戏场景

### 步骤 1：创建场景文件

1. 在**资源管理器**中右键 `assets/scenes/` 文件夹
2. 选择 **创建 → Scene**
3. 命名为 `Game`
4. 双击打开场景

### 步骤 2：创建Canvas根节点

场景会自动创建 Canvas 节点，确认其设置：

**Canvas 组件配置：**
- Design Resolution: 1600 x 640
- Fit Width: ✅
- Fit Height: ✅

---

## 🏗️ 搭建节点结构

### 完整节点树

```
Canvas
├── GameMain (挂载 GameMain.ts)
├── Background
│   └── Grid (Graphics组件)
├── World (游戏世界容器)
│   ├── Enemies
│   └── Weapons
├── Particles (挂载 ParticleManager.ts)
└── UI
    ├── TopBar
    │   ├── GoldLabel (Label)
    │   └── WaveLabel (Label)
    ├── StartScreen (挂载 StartScreen.ts)
    │   ├── Panel
    │   │   ├── Title (Label)
    │   │   ├── Subtitle (Label)
    │   │   ├── StartButton (Button + Label)
    │   │   └── HelpButton (Button + Label)
    └── WeaponContainer
        ├── RocketCard (挂载 WeaponCard.ts)
        └── LaserCard (挂载 WeaponCard.ts)
```

---

## 📦 详细创建步骤

### 1. 创建 GameMain 节点

**步骤：**
1. 在 Canvas 下创建空节点，命名为 `GameMain`
2. 在**属性检查器**中点击 **添加组件**
3. 选择 **自定义脚本 → GameMain**

**设置引用：**
- worldNode: 拖拽 World 节点
- uiNode: 拖拽 UI 节点
- backgroundNode: 拖拽 Background 节点

---

### 2. 创建 Background（背景+网格）

**步骤：**
1. 在 Canvas 下创建节点 `Background`
2. 设置位置：(0, 0, 0)
3. 在 Background 下创建子节点 `Grid`
4. 给 Grid 添加 **Graphics** 组件

**Graphics 设置：**
- LineWidth: 1
- LineColor: #00FFFF (青色)
- Alpha: 77 (30%)

> **注意**：网格绘制代码在 GameMain.ts 中的 `drawGrid()` 方法

---

### 3. 创建 World（游戏世界）

**步骤：**
1. 在 Canvas 下创建节点 `World`
2. 设置 Layer: **DEFAULT**
3. 在 World 下创建两个子节点：
   - `Enemies` (敌人容器)
   - `Weapons` (武器容器)

**World 节点设置：**
- Position: (0, 0, 0)
- Anchor: (0.5, 0.5)

---

### 4. 创建 Particles（粒子管理）

**步骤：**
1. 在 Canvas 下创建节点 `Particles`
2. 添加组件 **ParticleManager**
3. 设置 Layer: **UI_2D**

---

### 5. 创建 UI 层

#### 5.1 创建 UI 根节点

**步骤：**
1. 在 Canvas 下创建节点 `UI`
2. 设置 Layer: **UI_2D**
3. 设置 Position: (0, 0, 0)

#### 5.2 创建 TopBar（顶部栏）

**步骤：**
1. 在 UI 下创建节点 `TopBar`
2. 添加 **Widget** 组件：
   - Top: 0
   - Left: 0
   - Right: 0
   - Height: 80

**创建 GoldLabel：**
1. 在 TopBar 下创建节点 `GoldLabel`
2. 添加 **Label** 组件：
   - String: "💰 1000"
   - Font Size: 20
   - Color: #FFFF00
3. 设置位置：左上角（-750, 30）

**创建 WaveLabel：**
1. 在 TopBar 下创建节点 `WaveLabel`
2. 添加 **Label** 组件：
   - String: "第 1 波"
   - Font Size: 16
   - Color: #00FFFF
3. 设置位置：(0, 30)

---

### 6. 创建 StartScreen（开始界面）

#### 6.1 创建根节点

**步骤：**
1. 在 UI 下创建节点 `StartScreen`
2. 添加 **Widget** 组件（全屏）：
   - Top: 0, Bottom: 0
   - Left: 0, Right: 0
3. 添加 **Sprite** 组件（半透明背景）：
   - Color: #000000
   - Opacity: 240
4. 添加组件 **StartScreen.ts**

#### 6.2 创建 Panel

**步骤：**
1. 在 StartScreen 下创建节点 `Panel`
2. 添加 **Sprite** 组件：
   - Color: #0A0A14
   - Opacity: 240
3. 设置尺寸：(600, 400)

#### 6.3 创建标题

**Title：**
1. 在 Panel 下创建节点 `Title`
2. 添加 **Label** 组件：
   - String: "🎮 TowerGame"
   - Font Size: 40
   - Color: #00FFFF
3. 位置：(0, 100)

**Subtitle：**
1. 在 Panel 下创建节点 `Subtitle`
2. 添加 **Label** 组件：
   - String: "赛博朋克塔防"
   - Font Size: 20
   - Color: #FFFFFF
3. 位置：(0, 50)

#### 6.4 创建按钮

**StartButton：**
1. 在 Panel 下创建节点 `StartButton`
2. 添加 **Sprite** 组件（按钮背景）
3. 添加 **Button** 组件
4. 尺寸：(200, 52)
5. 位置：(0, -20)
6. 在 StartButton 下创建 Label：
   - String: "开始游戏"
   - Font Size: 22

**HelpButton：**
1. 在 Panel 下创建节点 `HelpButton`
2. 添加 **Sprite** + **Button**
3. 尺寸：(180, 44)
4. 位置：(0, -90)
5. Label: "游戏说明"

**关联引用：**
在 StartScreen 组件中：
- startButton: 拖拽 StartButton
- helpButton: 拖拽 HelpButton
- titleLabel: 拖拽 Title
- subtitleLabel: 拖拽 Subtitle

---

### 7. 创建 WeaponContainer（武器选择栏）

#### 7.1 创建容器

**步骤：**
1. 在 UI 下创建节点 `WeaponContainer`
2. 添加 **Widget** 组件：
   - Bottom: 20
   - Align: Horizontal Center
3. 添加 **Layout** 组件：
   - Type: Horizontal
   - Spacing: 20
4. 设置尺寸：(500, 160)

#### 7.2 创建武器卡片

**RocketCard：**
1. 在 WeaponContainer 下创建节点 `RocketCard`
2. 添加 **Sprite** 组件（卡片背景）
3. 添加 **WeaponCard.ts** 组件
4. 尺寸：(200, 140)
5. 创建子节点：
   - IconLabel (Label): "🚀", 位置(0, 40)
   - NameLabel (Label): "火箭塔", 位置(0, 0)
   - CostLabel (Label): "💰 120", 位置(0, -20)
   - DescLabel (Label): "追踪火箭", 位置(0, -40)
   - Button (Button组件), 尺寸(200, 140)

**LaserCard：**
重复上述步骤，图标改为 "⚡"，名称 "激光塔"，价格 "💰 100"

---

## 🎨 创建预制体

### 1. 创建 RocketTower 预制体

**步骤：**
1. 在 World 下创建临时节点 `RocketTower`
2. 添加组件 **RocketTower.ts**
3. 拖拽节点到 `assets/resources/` 创建预制体
4. 删除场景中的临时节点

### 2. 创建 LaserTower 预制体

重复上述步骤，组件改为 **LaserTower.ts**

### 3. 创建 EnemyTank 预制体

**步骤：**
1. 在 Enemies 下创建临时节点 `EnemyTank`
2. 添加组件 **EnemyTank.ts**
3. 创建预制体
4. 删除临时节点

### 4. 创建 SonicTank 预制体

重复上述步骤，组件改为 **SonicTank.ts**

### 5. 创建 HomingRocket 预制体

**步骤：**
1. 创建节点 `HomingRocket`
2. 添加组件 **HomingRocket.ts**
3. 创建预制体

### 6. 创建 EnemyBullet 预制体

**步骤：**
1. 创建节点 `EnemyBullet`
2. 添加组件 **EnemyBullet.ts**
3. 创建预制体

---

## 🔗 关联引用

### GameMain 引用

在 GameMain 组件中设置：
- worldNode: World 节点
- uiNode: UI 节点
- backgroundNode: Background 节点

### WeaponManager 引用

在 WeaponManager 组件中设置：
- rocketTowerPrefab: RocketTower 预制体
- laserTowerPrefab: LaserTower 预制体

### EnemyManager 引用

在 EnemyManager 组件中设置：
- enemyTankPrefab: EnemyTank 预制体
- sonicTankPrefab: SonicTank 预制体

### GoldManager 引用

在 GoldManager 组件中设置：
- goldLabel: TopBar/GoldLabel

### UIManager 引用

在 UIManager 组件中设置：
- startScreen: StartScreen 节点
- gameUI: UI 节点
- waveLabel: TopBar/WaveLabel

---

## 🎵 关联音频资源

### SoundManager 引用

在 SoundManager 组件中设置：
- bgMusic: assets/audio/bg.wav
- shootSound: assets/audio/shoot.wav
- boomSound: assets/audio/boom.wav

---

## ✅ 验证清单

完成后检查：

- [ ] 场景文件 Game.scene 已创建
- [ ] Canvas 设置正确（1600x640）
- [ ] GameMain 节点及组件已挂载
- [ ] Background 和 Grid 已创建
- [ ] World 容器及子容器已创建
- [ ] Particles 节点已创建
- [ ] UI 层级结构完整
- [ ] TopBar 及标签已创建
- [ ] StartScreen 界面完整
- [ ] WeaponContainer 及卡片已创建
- [ ] 6个预制体已创建（武器x2，敌人x2，子弹x2）
- [ ] GameMain 引用已关联
- [ ] 各管理器引用已关联
- [ ] 音频资源已关联

---

## 🚀 测试运行

### 步骤：

1. 保存场景（Ctrl/Cmd + S）
2. 点击**播放**按钮（顶部工具栏）
3. 观察控制台输出
4. 测试功能：
   - 是否显示开始界面？
   - 点击开始按钮是否隐藏界面？
   - 金币是否显示？
   - 波次是否显示？

---

## 🐛 常见问题

### Q: Graphics 不显示？
**A**: 检查 Layer 设置和相机配置。

### Q: 按钮点击无反应？
**A**: 确保 Button 组件的 Transition 设置正确，且节点有 UITransform。

### Q: 预制体无法拖拽？
**A**: 确保预制体已正确保存到 resources 文件夹。

### Q: 引用为 null？
**A**: 在 Inspector 中重新拖拽关联。

---

## 📝 注意事项

1. ⚠️ **坐标系**：Cocos 使用中心原点，Y轴向上
2. ⚠️ **Layer**：UI 使用 UI_2D，游戏对象使用 DEFAULT
3. ⚠️ **Widget**：用于自适应布局
4. ⚠️ **预制体**：必须放在 resources 文件夹才能动态加载
5. ⚠️ **引用**：所有组件引用必须在 Inspector 中设置

---

## 🎉 完成

完成以上步骤后，游戏场景就搭建完成了！

**下一步：**
- 运行游戏测试
- 调整UI布局
- 优化视觉效果
- 添加更多特效

---

📅 **创建时间**: 2025-12-10  
🎮 **项目**: TowerGame - Cocos Creator  
📖 **参考**: README.md, PROJECT_STATUS.md

