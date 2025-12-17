# BaseButton 基础按钮组件使用文档

## 概述

`BaseButton` 是一个通用的按钮组件类，提供了统一的按钮实现，支持离屏渲染、点击检测、状态管理等功能。

## 功能特性

1. **离屏渲染**：支持使用离屏 Canvas 缓存按钮渲染结果，提高性能
2. **点击检测**：提供 `isPointInBounds` 和 `isClicked` 方法判断点击
3. **状态管理**：支持可见性、启用/禁用、悬停、按下等状态
4. **样式自定义**：支持自定义颜色、文本、尺寸、圆角等
5. **事件回调**：支持点击回调函数

## 基本使用

### 创建按钮

```javascript
import { BaseButton } from './ui/components/BaseButton';
import { GameColors } from './config/Colors';

// 创建按钮（中心点坐标）
const button = new BaseButton(
  400,           // x 坐标（中心点）
  300,           // y 坐标（中心点）
  200,           // 宽度
  60,            // 高度
  '开始游戏',     // 文本
  GameColors.ROCKET_TOWER,  // 颜色（十六进制）
  10,            // 圆角半径
  ctx            // 渲染上下文（可选）
);
```

### 设置点击回调

```javascript
button.setOnClick((button, x, y) => {
  console.log('按钮被点击了', { x, y });
  // 执行点击后的操作
});
```

### 渲染按钮

```javascript
// 在渲染循环中
button.render(ctx);
```

### 处理点击事件

```javascript
// 在触摸事件处理中
onTouchStart(eOrX, y) {
  let x, touchY;
  if (typeof eOrX === 'number') {
    x = eOrX;
    touchY = y;
  } else {
    const touch = eOrX.touches && eOrX.touches[0] ? eOrX.touches[0] : eOrX;
    x = touch.x || touch.clientX || 0;
    touchY = touch.y || touch.clientY || 0;
  }
  
  // 检测是否点击了按钮
  if (button.isClicked(x, touchY)) {
    return true; // 事件已处理
  }
  
  return false;
}
```

## 高级功能

### 使用离屏渲染

```javascript
// 启用离屏渲染（适合静态按钮，提高性能）
button.setUseOffScreen(true);
```

### 动态修改按钮属性

```javascript
// 修改位置
button.setPosition(500, 400);

// 修改尺寸
button.setSize(250, 70);

// 修改文本
button.setText('重新开始');

// 修改颜色
button.setColor(GameColors.LASER_TOWER);
```

### 状态管理

```javascript
// 显示/隐藏
button.show();
button.hide();

// 启用/禁用
button.enable();
button.disable();

// 获取边界框（用于事件检测）
const bounds = button.getBounds();
// { x: 300, y: 270, width: 200, height: 60 }
```

### 获取按钮边界（用于事件系统）

```javascript
// 判断点是否在按钮内
if (button.isPointInBounds(x, y)) {
  // 点在按钮内
}

// 判断并触发点击回调
if (button.isClicked(x, y)) {
  // 按钮被点击，回调已触发
  return true;
}
```

## 集成到事件系统

### 方式一：直接使用 isClicked

```javascript
// 在 UI 组件的 onTouchStart 中
onTouchStart(x, y) {
  if (this.startButton.isClicked(x, y)) {
    return true;
  }
  return false;
}
```

### 方式二：使用 isPointInBounds + 回调

```javascript
// 在 UI 组件的 onTouchStart 中
onTouchStart(x, y) {
  if (this.startButton.isPointInBounds(x, y)) {
    // 手动触发回调
    if (this.startButton.onClickCallback) {
      this.startButton.onClickCallback(this.startButton, x, y);
    }
    return true;
  }
  return false;
}
```

### 方式三：注册到 UIEventManager

```javascript
// 创建适配器
const buttonAdapter = UIComponentAdapter.createAdapter(
  button,
  () => button.getBounds(),
  (x, y) => button.isClicked(x, y)
);

// 注册到事件管理器
uiEventManager.registerComponent(buttonAdapter, priority);
```

## 完整示例

```javascript
import { BaseButton } from './ui/components/BaseButton';
import { GameColors } from './config/Colors';
import { UIConfig } from './config/UIConfig';

class MyScreen {
  constructor(ctx) {
    this.ctx = ctx;
    
    // 创建开始按钮
    this.startButton = new BaseButton(
      GameConfig.DESIGN_WIDTH / 2,
      GameConfig.DESIGN_HEIGHT * 0.55,
      UIConfig.START_BTN_WIDTH,
      UIConfig.START_BTN_HEIGHT,
      '开始游戏',
      GameColors.ROCKET_TOWER,
      UIConfig.BUTTON_RADIUS,
      ctx
    );
    
    // 设置点击回调
    this.startButton.setOnClick((button, x, y) => {
      console.log('开始游戏按钮被点击');
      this.onStartGame();
    });
    
    // 创建帮助按钮
    this.helpButton = new BaseButton(
      GameConfig.DESIGN_WIDTH / 2,
      GameConfig.DESIGN_HEIGHT * 0.7,
      UIConfig.HELP_BTN_WIDTH,
      UIConfig.HELP_BTN_HEIGHT,
      '帮助',
      GameColors.LASER_TOWER,
      UIConfig.BUTTON_RADIUS,
      ctx
    );
    
    this.helpButton.setOnClick((button, x, y) => {
      console.log('帮助按钮被点击');
      this.onShowHelp();
    });
  }
  
  render() {
    // 渲染按钮
    this.startButton.render(this.ctx);
    this.helpButton.render(this.ctx);
  }
  
  onTouchStart(x, y) {
    // 检测按钮点击
    if (this.startButton.isClicked(x, y)) {
      return true;
    }
    if (this.helpButton.isClicked(x, y)) {
      return true;
    }
    return false;
  }
  
  onStartGame() {
    // 开始游戏逻辑
  }
  
  onShowHelp() {
    // 显示帮助逻辑
  }
}
```

## API 参考

### 构造函数

```javascript
new BaseButton(x, y, width, height, text, color, radius, ctx)
```

- `x` (number): 按钮 X 坐标（中心点）
- `y` (number): 按钮 Y 坐标（中心点）
- `width` (number): 按钮宽度
- `height` (number): 按钮高度
- `text` (string): 按钮文本
- `color` (number): 按钮颜色（十六进制，默认 `GameColors.UI_BACKGROUND`）
- `radius` (number): 圆角半径（默认 `UIConfig.BUTTON_RADIUS`）
- `ctx` (CanvasRenderingContext2D): 渲染上下文（可选）

### 主要方法

- `isPointInBounds(x, y)`: 判断点是否在按钮边界内
- `isClicked(x, y)`: 判断是否点击了按钮（会触发回调）
- `setOnClick(callback)`: 设置点击回调
- `render(ctx)`: 渲染按钮
- `setPosition(x, y)`: 设置按钮位置
- `setSize(width, height)`: 设置按钮尺寸
- `setText(text)`: 设置按钮文本
- `setColor(color)`: 设置按钮颜色
- `enable()`: 启用按钮
- `disable()`: 禁用按钮
- `show()`: 显示按钮
- `hide()`: 隐藏按钮
- `getBounds()`: 获取按钮边界框
- `setUseOffScreen(use)`: 设置是否使用离屏渲染
- `invalidate()`: 标记缓存为脏（需要重新渲染）
- `destroy()`: 销毁按钮

## 注意事项

1. **坐标系统**：按钮使用中心点坐标，但 `getBounds()` 返回的是左上角坐标
2. **离屏渲染**：适合静态按钮，动态按钮（如悬停效果）不建议使用
3. **性能优化**：如果按钮样式不变，建议使用离屏渲染
4. **事件处理**：按钮的 `isClicked` 方法会自动触发回调，无需手动调用

