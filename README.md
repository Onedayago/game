# 🎮 塔防游戏 - 赛博朋克风格

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Pixi.js](https://img.shields.io/badge/Pixi.js-v8-red)]()
[![Webpack](https://img.shields.io/badge/Webpack-5-blue)]()

一个使用 **Pixi.js v8** 开发的赛博朋克风格塔防游戏，具有霓虹灯效、粒子特效、多种武器类型、智能敌人AI、波次系统和完整的游戏经济系统。

<img width="1590" height="610" alt="image" src="https://github.com/user-attachments/assets/fdace8d3-6874-45f2-97ff-5dea1618bd91" />


## ✨ 特色功能

### 🎨 视觉风格
- **赛博朋克/霓虹主题** - 高饱和度的霓虹色彩，营造未来科技感
- **华丽粒子特效** - 爆炸、枪口火光、击中火花等多种特效
- **流畅动画** - 武器呼吸效果、升级闪光、受击反馈
- **小地图系统** - 实时显示战场全局，支持点击快速定位

### 🔫 武器系统
- **火箭塔** 🚀 - 发射追踪火箭，对集群敌人造成高伤害
- **激光塔** ⚡ - 持续激光束，高射速远距离攻击
- **武器升级** - 3 级升级系统，提升伤害、射速和特效
- **拖拽放置** - 直观的拖放操作，轻松部署防御

### 🎯 游戏机制
- **智能AI** - 敌人自动寻路，避开障碍物和其他单位
- **波次系统** - 每 15 秒一波，难度递增
- **双向战斗** - 敌人会反击，摧毁你的防御塔
- **经济系统** - 击杀获得金币，平衡收入和支出
- **横向滚动** - 拖动视野浏览超宽战场

### 🎵 音效系统
- **背景音乐** - 循环播放的战斗音乐
- **音效池** - 支持同时播放多个音效而不冲突
- **开火音效** - 每次攻击都有反馈
- **爆炸音效** - 敌人死亡时的爆炸声

## 🚀 快速开始

### 环境要求

- **Node.js**: v16.0+ 
- **npm**: v7.0+

### 安装

```bash
# 克隆项目
git clone https://github.com/Onedayago/game.git
cd TowerGame

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器（支持热更新）
npm run dev

# 自动打开浏览器：http://localhost:3000
```

### 构建

```bash
# 生产环境构建
npm run build

# 构建产物在 dist/ 目录
```

### 部署

```bash
# 构建后，将 dist/ 目录部署到任意静态服务器
# 支持 GitHub Pages、Vercel、Netlify 等平台
```

## 📁 项目结构

```
TowerGame/
├── src/
│   ├── app/              # 应用核心
│   │   ├── GameContext.js        # 游戏上下文管理
│   │   ├── createPixiApp.js      # PixiJS 初始化
│   │   ├── createWorldLayers.js  # 世界图层
│   │   ├── setupStagePanning.js  # 视野拖动
│   │   └── attachGameLoop.js     # 游戏主循环
│   ├── config/           # 配置文件
│   │   ├── colors.js             # 赛博朋克配色
│   │   ├── layout.js             # 布局配置
│   │   ├── ui.js                 # UI 配置
│   │   ├── gameplay.js           # 游戏数值
│   │   ├── enemies.js            # 敌人配置
│   │   └── weaponTypes.js        # 武器类型
│   ├── core/             # 核心系统
│   │   ├── particle.js           # 粒子类
│   │   ├── particleSystem.js     # 粒子系统
│   │   └── soundManager.js       # 音效管理
│   ├── entities/         # 游戏实体
│   │   ├── enemies/              
│   │   │   ├── enemyTank.js      # 敌人坦克
│   │   │   └── enemyBullet.js    # 敌人子弹
│   │   └── weapons/
│   │       ├── rocketTower.js    # 火箭塔
│   │       ├── laserTower.js     # 激光塔
│   │       ├── homingRocket.js   # 追踪火箭
│   │       └── WeaponFactory.js  # 武器工厂
│   ├── systems/          # 游戏系统
│   │   ├── background.js         # 背景系统
│   │   └── enemyManager.js       # 敌人管理器
│   ├── ui/               # 用户界面
│   │   ├── gameUI.js             # 游戏 UI
│   │   ├── goldManager.js        # 金币&小地图
│   │   ├── weaponContainer.js    # 武器容器
│   │   ├── WeaponDragManager.js  # 拖拽管理
│   │   ├── WeaponIconRenderer.js # 图标渲染
│   │   └── components/           # UI 组件
│   ├── audio/            # 音效资源
│   │   ├── bg.wav               # 背景音乐
│   │   ├── shoot.wav            # 开火音效
│   │   └── boom.wav             # 爆炸音效
│   ├── constants.js      # 常量导出
│   └── index.js          # 入口文件
├── dist/                 # 构建输出
├── docs/                 # 文档
├── webpack.config.js     # Webpack 配置
└── package.json          # 项目配置
```

> **注意**: 所有代码都包含详细的中文注释，便于理解和修改。

## 🎮 游戏玩法

### 基础操作

1. **开始游戏**
   - 点击"开始游戏"按钮进入战斗
   - 可先查看"游戏说明"了解规则

2. **部署武器**
   - 从底部武器栏拖拽武器图标
   - 放置到战场格子上（消耗金币）
   - 支持两种武器类型：火箭塔 🚀 和激光塔 ⚡

3. **管理武器**
   - 点击已放置的武器显示操作按钮
   - **升级** - 提升伤害、射速和视觉特效
   - **出售** - 返还部分金币

4. **视野控制**
   - 在战场区域拖动鼠标左右移动视野
   - 点击右上角小地图快速定位
   - 小地图实时显示敌人和武器位置

### 游戏机制

- **波次系统** - 每 15 秒进入下一波，敌人更强
- **金币经济** - 击杀敌人获得金币，平衡收支
- **双向战斗** - 敌人会攻击并摧毁你的防御塔
- **智能AI** - 敌人自动寻路，绕过障碍物

### 胜利条件

- 存活更多波次
- 合理布局防御
- 平衡经济发展

## 🛠️ 技术栈

- **渲染引擎**: Pixi.js v8
- **构建工具**: Webpack 5
- **转译器**: Babel 7
- **代码风格**: ESLint + Airbnb Config
- **版本控制**: Git

## 🎨 代码特点

- ✅ **详细中文注释** - 每个文件、类、方法都有完整注释
- ✅ **模块化设计** - 清晰的目录结构和职责划分
- ✅ **工厂模式** - 武器创建使用工厂模式
- ✅ **单例模式** - 粒子系统和音效管理器使用单例
- ✅ **对象池** - 音效池避免重复创建
- ✅ **代码整洁** - 无冗余文件，精简高效

## 🐛 常见问题

<details>
<summary><b>听不到声音？</b></summary>

- 确认浏览器标签没有静音
- 检查 `src/audio/` 目录下的音频文件是否存在
- 浏览器需要用户交互才能播放音频（点击"开始游戏"后自动播放）
</details>

<details>
<summary><b>构建失败？</b></summary>

```bash
# 清理依赖重新安装
rm -rf node_modules package-lock.json
npm install

# 清理构建缓存
rm -rf dist/
npm run build
```
</details>

<details>
<summary><b>如何修改游戏数值？</b></summary>

所有游戏配置都在 `src/config/` 目录：
- `gameplay.js` - 武器伤害、射速、价格等
- `enemies.js` - 敌人血量、速度、生成间隔
- `colors.js` - 颜色主题
- `layout.js` - 布局尺寸
</details>

## 🚀 后续优化方向

- [ ] 新增更多武器类型（减速塔、范围塔等）
- [ ] 更多敌人变体（快速单位、重装单位、BOSS）
- [ ] 关卡系统（不同地形和敌人配置）
- [ ] 成就系统（击杀数、波次记录等）
- [ ] 设置菜单（音量、画质、难度）
- [ ] 存档系统（LocalStorage）
- [ ] 移动端适配

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 👨‍💻 作者

- GitHub: [@Onedayago](https://github.com/Onedayago)

---

⭐ 如果这个项目对你有帮助，请给个 Star！


