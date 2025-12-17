# 微信小游戏 - 塔防游戏

## 项目结构

```
wegame/
├── game.js              # 游戏入口文件（必须）
├── game.json            # 游戏配置文件（必须）
├── app.js               # 应用入口（可选，小游戏不需要）
├── app.json             # 应用配置（可选，小游戏不需要）
├── project.config.json  # 项目配置
└── js/                  # 游戏逻辑代码
    ├── GameMain.js      # 游戏主控制器
    ├── config/          # 配置文件
    ├── core/            # 核心系统
    ├── managers/        # 管理器
    ├── entities/        # 游戏实体
    ├── projectiles/     # 抛射物
    ├── rendering/       # 渲染器
    ├── ui/              # UI组件
    └── utils/           # 工具类
```

## 重要说明

### 微信小游戏 vs 微信小程序

**微信小游戏**：
- 入口文件：`game.js`（必须）
- 配置文件：`game.json`（必须）
- Canvas：使用 `wx.createCanvas()` 创建
- 触摸事件：使用 `wx.onTouchStart()`、`wx.onTouchMove()`、`wx.onTouchEnd()`
- 生命周期：`wx.onShow()`、`wx.onHide()`、`wx.onError()`

**微信小程序**：
- 入口文件：`app.js`（必须）
- 配置文件：`app.json`（必须）
- 页面：使用 `Page()` 创建页面
- Canvas：通过 DOM 查询获取
- 触摸事件：在页面中绑定 `bindtouchstart` 等

### 本项目是微信小游戏

本项目使用 `game.js` 作为入口，使用 `wx.createCanvas()` 创建 Canvas，使用 `wx.onTouchStart()` 等处理触摸事件。

## 运行方式

1. 在微信开发者工具中打开 `wegame` 目录
2. 选择"小游戏"项目类型
3. 运行项目

## 注意事项

1. **Canvas 尺寸**：微信小游戏的 Canvas 尺寸由系统决定，需要通过 `wx.getSystemInfoSync()` 获取
2. **触摸坐标**：微信小游戏的触摸坐标是相对于 Canvas 左上角的，不是中心原点
3. **ES6 模块**：确保微信开发者工具支持 ES6 编译
4. **Canvas 2D**：需要微信基础库 2.9.0+ 支持

## 开发调试

- 使用微信开发者工具的调试功能
- 查看控制台日志
- 使用 `console.log()` 输出调试信息
