# TowerGame 架构概览

> 目标：把核心系统拆成可单独演进的模块，降低 `index.js` 以及 UI 容器的耦合度，方便未来扩展更多武器、敌人和关卡逻辑。

## 高层分层

| 层级 | 目录 | 说明 |
| --- | --- | --- |
| App Bootstrap | `src/app` | 负责 Pixi 初始化、场景层级、交互输入、游戏循环等通用能力。 |
| Systems | `src/systems` | 横向系统，例如背景、敌人管理、输入控制。 |
| UI | `src/ui` | 纯 UI 组件；`weaponContainer`、`goldManager`、`gameUI` 等。 |
| Entities | `src/entities` | 武器、敌人、子弹等可实例化对象。 |
| Core | `src/core` | 粒子、声音、深度等跨系统服务。 |

## GameContext

`GameContext` 作为轻量 DI 容器，统一记录：

- `app` / `world`：全局 Pixi 引用。
- `state.gameStarted`：顶层游戏状态。
- `managers` / `systems`：通过 `registerManager`、`registerSystem` 标记，后续可以在任意模块读取。
- `attachCleanup(fn)`：注册退出时的清理逻辑，避免 ticker、事件遗留。

在 `index.js` 中，所有实例化对象都会登记到 context，`attachGameLoop` 仅通过 context 查询依赖，完全解耦了主循环与具体模块实现。

## Bootstrap 流程

1. `createPixiApp()`：创建 `Application`、挂载 canvas。
2. `createWorldLayers()`：绘制 UI 背景、构建 `worldContainer`。
3. `setupStagePanning()`：集中管理拖拽视野事件，必要时可替换为键鼠/触屏方案。
4. `attachGameLoop()`：唯一的 ticker 入口，从 context 读取敌人、武器、网格、金币等。
5. 点击 UI `onStartGame` 时调用 `buildBattleSystems()`，按需实例化背景、武器、敌人管理器。

## 扩展指引

- **新增系统**：在 `buildBattleSystems` 或其它初始化流程中实例化后，调用 `context.registerSystem('xxx', instance)`；在 `attachGameLoop` 中按需读取。
- **状态共享**：不要跨模块直接 import 其它 manager，用 `context.getManager('xxx')` 能更方便地做懒加载 & 单元测试。
- **生命周期**：需要解绑事件 / ticker 的模块提供 `destroy()` 或 `dispose()` 方法，并在 `context.attachCleanup` 中注册回调，确保热重载或页面关闭时不会泄漏。

## 后续演进路线

1. **WeaponContainer 拆分**  
   - `WeaponPanelView`（纯 UI）  
   - `WeaponGrid`（落点校验 + 占位检测）  
   - `WeaponInventory`（实例列表、升级、出售）  
   通过 context 注入 `particleSystem`、`soundManager`，减少文件体积。

2. **敌人/武器数据驱动**  
   - 建立 `data/weapons.js`、`data/enemies.js` 描述属性。  
   - `WeaponFactory` 依据数据创建对应类，实现易扩展。

3. **系统能力抽象**  
   - 输入控制器（鼠标/触屏统一）  
   - 关卡 / 波次配置表  
   - 存档（localStorage）  

4. **测试与调试**  
   - 在 `GameContext` 中注入 `debugBus`，用于统计帧率、波次等信息。  
   - 给核心 manager 增加最小化的单元测试（使用 jsdom + PIXI mock）。

通过以上步骤，可把项目演进为“数据驱动 + 系统解耦”的结构，方便多人协作和持续扩展玩法。


