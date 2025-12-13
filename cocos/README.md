# 🎮 TowerGame - Cocos Creator 版本

基于 Cocos Creator 3.8.3 开发的赛博朋克塔防游戏，从 Pixi.js 版本迁移而来。

## 📋 项目概述

本项目是原 Pixi.js 版本塔防游戏的 Cocos Creator 移植版本，保留了所有核心玩法和视觉风格，使用 TypeScript 和 Cocos Creator 的组件系统重新实现。

## 🚀 快速开始

### 环境要求

- **Cocos Creator**: 3.8.3 或更高版本
- **Node.js**: 14.x 或更高版本
- **操作系统**: Windows / macOS / Linux

### 打开项目

1. 启动 Cocos Creator
2. 点击「打开」按钮
3. 选择 `cocos` 文件夹
4. 等待项目加载完成

### 运行项目

1. 在 Cocos Creator 中打开项目
2. 选择「浏览器」平台
3. 点击「运行」按钮（快捷键：Ctrl/Cmd + P）
4. 游戏将在浏览器中打开

## 📁 项目结构

```
cocos/
├── assets/                          # 资源文件夹
│   ├── scripts/                     # TypeScript 脚本
│   │   ├── config/                  # 配置文件
│   │   │   ├── Colors.ts           # 颜色配置
│   │   │   └── GameConfig.ts       # 游戏配置常量
│   │   ├── core/                    # 核心系统
│   │   │   ├── GameContext.ts      # 游戏上下文
│   │   │   └── SoundManager.ts     # 音效管理器
│   │   ├── entities/                # 游戏实体
│   │   │   ├── weapons/            # 武器实体
│   │   │   ├── enemies/            # 敌人实体
│   │   │   ├── WeaponBase.ts       # 武器基类
│   │   │   └── EnemyBase.ts        # 敌人基类
│   │   ├── managers/                # 管理器
│   │   │   ├── GoldManager.ts      # 金币管理器
│   │   │   ├── WeaponManager.ts    # 武器管理器
│   │   │   ├── EnemyManager.ts     # 敌人管理器
│   │   │   └── UIManager.ts        # UI管理器
│   │   ├── systems/                 # 游戏系统
│   │   ├── ui/                      # UI组件
│   │   └── GameMain.ts              # 游戏主控制器
│   ├── scenes/                      # 场景文件
│   │   └── Game.scene              # 主游戏场景（需创建）
│   ├── resources/                   # 资源文件
│   └── audio/                       # 音频文件
├── settings/                        # 项目设置
│   └── project.json                # 项目配置
├── tsconfig.json                    # TypeScript 配置
├── project.json                     # Cocos Creator 项目配置
├── package.json                     # npm 配置
└── README.md                        # 项目文档

```

## 🎯 核心系统

### 1. 配置系统

所有游戏配置集中在 `config/` 文件夹：

**Colors.ts** - 颜色配置
- `GameColors` - 十六进制颜色常量
- `ColorCache` - Cocos Color 对象缓存
- `hexToColor()` - 颜色转换工具

**GameConfig.ts** - 游戏配置
- 设计分辨率、网格系统
- 武器配置（火箭塔、激光塔）
- 敌人配置（普通坦克、声波坦克）
- 经济系统、波次系统

### 2. 游戏主控制器

**GameMain.ts** - 挂载在根节点
- 初始化所有管理器
- 管理游戏主循环
- 绘制网格背景
- 控制游戏开始/暂停/重启

### 3. 管理器系统

**GoldManager** - 金币管理
- 金币的增减和显示
- 购买/升级/出售武器的金币交易

**WeaponManager** - 武器管理
- 武器的放置、更新、选中
- 武器升级和出售

**EnemyManager** - 敌人管理
- 敌人生成和波次系统
- 敌人更新和销毁
- 难度递增机制

**UIManager** - UI管理
- 开始界面、游戏UI
- 波次显示、金币显示
- 按钮交互

### 4. 实体基类

**WeaponBase** - 武器基类
- 网格定位、攻击逻辑
- 升级系统、血量系统
- 选中效果、闪烁动画

**EnemyBase** - 敌人基类
- 移动逻辑、攻击逻辑
- 血量系统、寻路系统
- 死亡和完成判定

## 🎨 核心特性

### 已实现
✅ TypeScript 项目结构  
✅ 配置系统（颜色、常量）  
✅ 游戏主控制器  
✅ 管理器系统（金币、武器、敌人、UI）  
✅ 实体基类（武器、敌人）  
✅ 音效管理器  
✅ 游戏上下文  

### 待实现
⏳ 场景文件创建  
⏳ 具体武器实现（火箭塔、激光塔）  
⏳ 具体敌人实现（坦克、声波坦克）  
⏳ 粒子系统  
⏳ UI预制体  
⏳ 武器拖拽系统  
⏳ 小地图系统  

## 🔧 开发指南

### 创建场景

1. 在 `assets/scenes` 文件夹右键 → 「创建」 → 「Scene」
2. 命名为 `Game`
3. 在场景中创建节点结构：
   ```
   Canvas
   ├── Background (添加 Graphics 组件)
   ├── World (游戏世界容器)
   ├── UI (UI容器)
   │   ├── TopBar (顶部栏)
   │   │   └── GoldLabel (金币显示)
   │   ├── StartScreen (开始界面)
   │   └── WeaponContainer (武器选择栏)
   └── GameMain (挂载 GameMain.ts)
   ```

### 创建武器预制体

1. 继承 `WeaponBase` 创建具体武器类：
   ```typescript
   @ccclass('RocketTower')
   export class RocketTower extends WeaponBase {
       onLoad() {
           super.onLoad();
           this.weaponType = WeaponType.ROCKET;
           this.fireInterval = GameConfig.ROCKET_FIRE_INTERVAL;
       }
       
       protected fire(target: any) {
           // 发射追踪火箭
       }
   }
   ```

2. 创建预制体：节点右键 → 「创建预制体」
3. 添加视觉组件（Sprite / Graphics）
4. 在 WeaponManager 中引用预制体

### 创建敌人预制体

1. 继承 `EnemyBase` 创建具体敌人类：
   ```typescript
   @ccclass('EnemyTank')
   export class EnemyTank extends EnemyBase {
       onLoad() {
           super.onLoad();
           this.maxHp = GameConfig.ENEMY_MAX_HP;
       }
       
       protected fire(target: any) {
           // 发射子弹
       }
   }
   ```

2. 创建预制体并添加视觉组件
3. 在 EnemyManager 中引用预制体

## 🎮 与原版差异

### Pixi.js → Cocos Creator 映射

| Pixi.js | Cocos Creator |
|---------|---------------|
| `Application` | `Canvas` 组件 |
| `Container` | `Node` |
| `Graphics` | `Graphics` 组件 |
| `Text` | `Label` 组件 |
| `Sprite` | `Sprite` 组件 |
| `update(delta)` | `update(deltaTime)` |

### 主要变化

1. **组件系统**：使用 Cocos 的 `Component` 和 `@ccclass` 装饰器
2. **节点管理**：使用 `Node` 树状结构替代 Pixi 的 `Container`
3. **渲染**：使用 Cocos 的 `Graphics` / `Sprite` 组件
4. **事件系统**：使用 Cocos 的事件系统
5. **坐标系**：Cocos 使用中心原点，Pixi 使用左上原点

## 📦 构建发布

### Web 平台

1. 菜单栏：「项目」 → 「构建发布」
2. 选择「Web Mobile」或「Web Desktop」平台
3. 配置发布路径
4. 点击「构建」
5. 构建完成后点击「运行」测试

### 微信小游戏

1. 选择「微信小游戏」平台
2. 填入 AppID
3. 构建并在微信开发者工具中测试

### 原生平台

支持构建到 Android、iOS、Windows、macOS 等平台。

## 🐛 调试技巧

### 控制台日志

```typescript
console.log('调试信息');
console.warn('警告信息');
console.error('错误信息');
```

### 节点调试

在 Cocos Creator 编辑器中：
- 「层级管理器」：查看节点树
- 「属性检查器」：查看组件属性
- 「场景编辑器」：可视化调整

### 性能分析

菜单栏 → 「开发者」 → 「性能分析器」

## 📚 学习资源

- [Cocos Creator 官方文档](https://docs.cocos.com/creator/manual/zh/)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [Cocos Creator 论坛](https://forum.cocos.org/)

## 🤝 贡献指南

1. 完善场景文件
2. 实现具体武器类（RocketTower, LaserTower）
3. 实现具体敌人类（EnemyTank, SonicTank）
4. 添加粒子效果
5. 完善UI系统
6. 添加音效和背景音乐

## 📝 注意事项

1. **坐标系转换**：Cocos 使用屏幕中心为原点，需要适配
2. **资源管理**：所有资源需要放在 `resources` 文件夹才能动态加载
3. **类型安全**：使用 TypeScript 的类型系统提高代码质量
4. **性能优化**：注意对象池、批处理等优化技巧

## ⭐ 下一步

1. **创建游戏场景** - 在 Cocos Creator 中搭建节点结构
2. **导入资源** - 音频文件复制到 `assets/audio/`
3. **实现具体武器** - 完善火箭塔和激光塔的逻辑
4. **实现具体敌人** - 完善坦克和声波坦克的逻辑
5. **测试运行** - 在编辑器中测试游戏

---

🎮 **从 Pixi.js 到 Cocos Creator** - 保留原汁原味的游戏体验！

