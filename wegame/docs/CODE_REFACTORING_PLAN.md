# 代码重构方案

## 当前问题分析

### 1. 文件过大问题
- `GameRenderer.js`: 1277行 - 职责过多
- `GameMain.js`: 493行 - 包含太多初始化逻辑
- `GameInputHandler.js`: 472行 - 输入处理逻辑复杂

### 2. 职责不清问题
- `GameRenderer` 同时负责：
  - 游戏场景渲染
  - UI渲染（暂停按钮、暂停界面、游戏结束界面、波次信息）
  - UI缓存管理
  - 渲染协调

### 3. 代码组织问题
- UI相关的渲染代码分散在多个地方
- 缓存管理代码混在渲染器中
- 缺少统一的UI渲染层

## 重构方案

### 1. 拆分 GameRenderer

#### 1.1 创建 UIRenderer（UI渲染器）
**文件**: `js/ui/UIRenderer.js`
**职责**:
- 所有UI元素的渲染
- UI缓存管理
- UI组件渲染协调

**包含的UI组件**:
- 暂停按钮 (PauseButton)
- 暂停界面 (PauseScreen)
- 游戏结束界面 (GameOverScreen)
- 波次信息 (WaveInfo)
- 波次提示 (WaveNotification)

#### 1.2 精简 GameRenderer
**保留职责**:
- 游戏场景渲染协调
- 调用各个渲染器
- 视锥剔除
- 渲染顺序管理

**移除职责**:
- UI渲染（移至UIRenderer）
- UI缓存管理（移至UIRenderer）

### 2. 创建UI组件类

#### 2.1 PauseButton
**文件**: `js/ui/components/PauseButton.js`
- 暂停按钮的渲染和缓存
- 按钮边界计算

#### 2.2 PauseScreen
**文件**: `js/ui/components/PauseScreen.js`
- 暂停界面的渲染和缓存
- 继续按钮边界计算

#### 2.3 GameOverScreen
**文件**: `js/ui/components/GameOverScreen.js`
- 游戏结束界面的渲染和缓存
- 重新开始按钮边界计算

#### 2.4 WaveInfo
**文件**: `js/ui/components/WaveInfo.js`
- 波次信息的渲染和缓存
- 动态文字渲染

#### 2.5 WaveNotification
**文件**: `js/ui/components/WaveNotification.js`
- 波次提示的渲染
- 动画效果

### 3. 优化 GameMain

#### 3.1 创建 GameInitializer
**文件**: `js/core/GameInitializer.js`
**职责**:
- 管理器创建
- UI初始化
- 缓存初始化
- 配置初始化

#### 3.2 精简 GameMain
**保留职责**:
- 游戏生命周期管理
- 游戏循环控制
- 事件分发

### 4. 优化输入处理

#### 4.1 创建 InputRouter
**文件**: `js/core/InputRouter.js`
**职责**:
- 输入事件路由
- 输入优先级管理

#### 4.2 精简 GameInputHandler
**保留职责**:
- 战场拖拽处理
- 武器交互处理

## 新的文件结构

```
js/
├── core/
│   ├── GameContext.js          # 游戏上下文（保持不变）
│   ├── GameLoop.js             # 游戏循环（保持不变）
│   ├── GameRenderer.js         # 游戏场景渲染器（精简）
│   ├── GameInitializer.js     # 游戏初始化器（新建）
│   ├── InputRouter.js          # 输入路由器（新建）
│   ├── GameInputHandler.js     # 输入处理器（精简）
│   └── ...
├── ui/
│   ├── UIRenderer.js           # UI渲染器（新建）
│   ├── components/             # UI组件（新建目录）
│   │   ├── PauseButton.js
│   │   ├── PauseScreen.js
│   │   ├── GameOverScreen.js
│   │   ├── WaveInfo.js
│   │   └── WaveNotification.js
│   ├── StartScreen.js          # 开始界面（保持不变）
│   ├── HelpScreen.js           # 帮助界面（保持不变）
│   └── ...
└── ...
```

## 重构步骤

1. 创建UI组件类（PauseButton, PauseScreen等）
2. 创建UIRenderer，整合所有UI组件
3. 从GameRenderer中移除UI相关代码
4. 创建GameInitializer，提取初始化逻辑
5. 优化GameMain，使用新的结构
6. 测试确保功能正常

## 设计原则

1. **单一职责原则**: 每个类只负责一个功能
2. **关注点分离**: UI渲染与游戏场景渲染分离
3. **可扩展性**: 新增UI组件更容易
4. **可维护性**: 代码结构清晰，易于维护
5. **性能优化**: 保持离屏缓存优化

