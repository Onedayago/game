# 新手引导系统说明

## 功能概述

新手引导系统为首次进入游戏的玩家提供交互式操作引导，帮助玩家快速了解游戏玩法。

## 主要特性

### 1. **自动检测首次启动**
- 使用微信小游戏本地存储（`wx.getStorageSync`/`wx.setStorageSync`）
- 首次打开游戏自动显示引导
- 完成引导后不再显示

### 2. **6步引导流程**

#### 步骤1：欢迎
- 欢迎玩家进入游戏
- 点击屏幕继续

#### 步骤2：武器容器
- 高亮显示底部武器容器
- 引导玩家选择和拖拽防御塔
- 带有向下箭头动画

#### 步骤3：金币系统
- 高亮显示金币面板
- 说明金币获取和使用方式
- 带有向上箭头动画

#### 步骤4：升级系统
- 高亮显示战场区域
- 引导玩家升级和出售防御塔

#### 步骤5：波次进度
- 高亮显示波次面板
- 说明波次机制
- 带有向上箭头动画

#### 步骤6：开始游戏
- 提示玩家准备开始
- 点击屏幕进入游戏

### 3. **视觉效果**

#### 高亮区域
- 半透明黑色遮罩（75%透明度）
- 使用 `destination-out` 模式挖空高亮区域
- 脉冲式黄色边框（动态透明度）

#### 提示框
- 渐变背景
- 黄色边框
- 标题和消息文本
- 步骤进度指示器

#### 动画箭头
- 4个方向（上、下、左、右）
- 使用离屏缓存渲染
- 渐变填充（白→黄→橙）
- 浮动动画效果

### 4. **性能优化**

- ✅ **离屏缓存**：箭头使用离屏Canvas预渲染
- ✅ **事件拦截**：引导期间拦截所有触摸事件
- ✅ **最高优先级**：引导覆盖层在所有UI之上

## 技术实现

### 核心文件

```
js/
├── ui/components/
│   └── TutorialOverlay.js      # 新手引导覆盖层
└── utils/
    └── TutorialManager.js      # 引导状态管理器
```

### 数据流

```
GameMain.onStartButtonClick()
  ↓
TutorialManager.shouldShowTutorial()  // 检查是否首次启动
  ↓
TutorialOverlay.show()  // 显示引导
  ↓
用户点击屏幕
  ↓
TutorialOverlay.nextStep()  // 下一步
  ↓
引导完成
  ↓
TutorialManager.markCompleted()  // 标记完成
```

## 使用方法

### 1. 正常使用
玩家首次打开游戏时，引导会自动显示。

### 2. 开发测试
在游戏主实例上调用重置方法：

```javascript
// 在微信开发者工具控制台中
gameMain.resetTutorial();
```

然后重启游戏，引导将重新显示。

## 自定义引导步骤

编辑 `TutorialOverlay.js` 中的 `STEPS` 数组：

```javascript
static STEPS = [
  {
    id: 'step_id',                    // 步骤ID
    title: '标题',                     // 标题文本
    message: '说明\n支持换行',         // 消息文本
    highlightArea: 'weaponContainer',  // 高亮区域（可选）
    arrowDirection: 'down'             // 箭头方向（可选）
  }
];
```

### 可用的高亮区域
- `weaponContainer` - 武器容器
- `goldPanel` - 金币面板
- `wavePanel` - 波次面板
- `battlefield` - 战场区域
- `null` - 无高亮

### 可用的箭头方向
- `'up'` - 向上
- `'down'` - 向下
- `'left'` - 向左
- `'right'` - 向右
- `'center'` - 无箭头
- `null` - 无箭头

## 存储键

引导完成状态存储在：
```
键名：tower_defense_tutorial_completed
值：true/false
```

## API 参考

### TutorialManager

```javascript
// 检查是否已完成引导
TutorialManager.isCompleted()

// 标记引导已完成
TutorialManager.markCompleted()

// 重置引导状态（测试用）
TutorialManager.reset()

// 检查是否应该显示引导
TutorialManager.shouldShowTutorial()
```

### TutorialOverlay

```javascript
// 显示引导
tutorialOverlay.show()

// 隐藏引导
tutorialOverlay.hide()

// 下一步（返回是否完成）
const finished = tutorialOverlay.nextStep()

// 更新动画
tutorialOverlay.update(deltaTime)

// 渲染
tutorialOverlay.render()

// 处理触摸事件
tutorialOverlay.onTouchStart(e)
```

## 注意事项

1. **事件优先级**：引导期间会拦截所有触摸事件
2. **动画性能**：箭头浮动使用正弦函数，性能友好
3. **本地存储**：依赖微信小游戏的本地存储API
4. **跨设备**：存储是设备本地的，不同设备需要分别完成引导

## 未来扩展

- [ ] 支持跳过引导
- [ ] 添加"不再显示"选项
- [ ] 多语言支持
- [ ] 引导步骤统计分析
- [ ] 自定义引导皮肤
