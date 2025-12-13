# 🔄 Pixi.js → Cocos Creator 迁移指南

## 📋 迁移概述

本文档详细说明了如何将 TowerGame 从 Pixi.js 迁移到 Cocos Creator 3.8。

## ✅ 已完成的工作

### 1. 项目结构 ✅
- ✅ 创建 Cocos Creator 项目目录结构
- ✅ 配置 TypeScript 编译选项
- ✅ 设置项目配置文件

### 2. 配置系统 ✅
- ✅ 迁移颜色配置（`Colors.ts`）
  - 十六进制颜色常量
  - Cocos Color 对象缓存
  - 颜色转换工具
- ✅ 迁移游戏配置（`GameConfig.ts`）
  - 所有游戏常量（100+）
  - 武器类型定义
  - 配置查询工具类

### 3. 核心系统 ✅
- ✅ 音效管理器（`SoundManager.ts`）
  - 音效池管理
  - 背景音乐控制
  - 音量控制
- ✅ 游戏上下文（`GameContext.ts`）
  - 全局状态管理
  - 单例模式
  - 引用管理

### 4. 管理器系统 ✅
- ✅ 金币管理器（`GoldManager.ts`）
- ✅ 武器管理器（`WeaponManager.ts`）
- ✅ 敌人管理器（`EnemyManager.ts`）
- ✅ UI管理器（`UIManager.ts`）

### 5. 实体基类 ✅
- ✅ 武器基类（`WeaponBase.ts`）
  - 攻击逻辑框架
  - 升级系统
  - 选中效果
- ✅ 敌人基类（`EnemyBase.ts`）
  - 移动逻辑
  - 攻击逻辑
  - 生命周期管理

### 6. 游戏主控制器 ✅
- ✅ GameMain 组件
  - 游戏初始化
  - 主循环管理
  - 管理器协调

## 📝 待完成的工作

### 1. 场景创建 ⏳
**优先级：🔴 高**

需要在 Cocos Creator 编辑器中手动创建：

```
Canvas (Canvas 组件)
├── Background
│   └── Graphics (绘制网格)
├── World (游戏世界，Layer 0)
│   ├── Enemies (敌人容器)
│   └── Weapons (武器容器)
├── UI (Layer 100)
│   ├── TopBar
│   │   ├── GoldLabel (Label)
│   │   └── WaveLabel (Label)
│   ├── StartScreen
│   │   ├── Title (Label)
│   │   └── StartButton (Button)
│   ├── GameOverScreen
│   └── WeaponContainer
│       ├── RocketCard (Button)
│       └── LaserCard (Button)
└── GameMain (挂载 GameMain 组件)
```

### 2. 具体武器实现 ⏳
**优先级：🔴 高**

需要创建：
- `RocketTower.ts` - 火箭塔实现
  - 追踪火箭弹
  - 升级效果
  - 视觉表现
- `LaserTower.ts` - 激光塔实现
  - 激光束渲染
  - 持续伤害
  - 视觉效果

### 3. 具体敌人实现 ⏳
**优先级：🔴 高**

需要创建：
- `EnemyTank.ts` - 普通坦克
  - 移动和攻击
  - 子弹系统
  - 死亡效果
- `SonicTank.ts` - 声波坦克
  - 声波攻击
  - 范围伤害
  - 特殊效果

### 4. 粒子系统 ⏳
**优先级：🟡 中**

需要创建：
- `ParticleSystem.ts` - 粒子管理
  - 爆炸效果
  - 枪口闪光
  - 击中火花
- 使用 Cocos 的 `ParticleSystem2D` 组件

### 5. 子弹系统 ⏳
**优先级：🟡 中**

需要创建：
- `Bullet.ts` - 普通子弹
- `HomingRocket.ts` - 追踪火箭
- `EnemyBullet.ts` - 敌人子弹
- `SonicWave.ts` - 声波

### 6. UI 组件 ⏳
**优先级：🟡 中**

需要创建：
- 开始界面
- 游戏结束界面
- 武器选择卡片
- 升级/出售按钮
- 小地图

### 7. 输入系统 ⏳
**优先级：🟡 中**

需要实现：
- 武器拖拽放置
- 武器点击选中
- 触摸/鼠标事件处理

### 8. 资源导入 ⏳
**优先级：🟢 低**

需要复制：
- 音频文件（bg.wav, shoot.wav, boom.wav）
- 如需要，准备图片资源

## 🔧 关键技术对比

### 渲染系统

| 功能 | Pixi.js | Cocos Creator |
|------|---------|---------------|
| 容器 | `Container` | `Node` |
| 图形 | `Graphics` | `Graphics` 组件 |
| 文本 | `Text` | `Label` 组件 |
| 精灵 | `Sprite` | `Sprite` 组件 |
| 颜色 | `0xRRGGBB` | `Color(r,g,b,a)` |

### 坐标系统

**Pixi.js**:
- 原点在左上角 (0, 0)
- Y轴向下为正

**Cocos Creator**:
- 原点在屏幕中心
- Y轴向上为正
- 需要转换坐标

### 事件系统

**Pixi.js**:
```javascript
sprite.on('pointerdown', (event) => { });
```

**Cocos Creator**:
```typescript
node.on(Node.EventType.TOUCH_START, (event) => { });
```

### 更新循环

**Pixi.js**:
```javascript
app.ticker.add((delta) => {
    // delta是帧数
});
```

**Cocos Creator**:
```typescript
update(deltaTime: number) {
    // deltaTime是秒数
}
```

## 🎯 迁移步骤

### 步骤 1：打开项目
1. 启动 Cocos Creator 3.8
2. 打开 `cocos` 文件夹
3. 等待项目加载

### 步骤 2：创建场景
1. 创建 `Game.scene`
2. 按照上述节点结构搭建
3. 挂载组件

### 步骤 3：实现武器
1. 创建 `RocketTower.ts`
2. 继承 `WeaponBase`
3. 实现 `fire()` 方法
4. 创建预制体

### 步骤 4：实现敌人
1. 创建 `EnemyTank.ts`
2. 继承 `EnemyBase`
3. 实现移动和攻击逻辑
4. 创建预制体

### 步骤 5：添加资源
1. 复制音频文件到 `assets/audio/`
2. 在 Inspector 中关联资源引用

### 步骤 6：测试运行
1. 点击「播放」按钮
2. 测试基本功能
3. 修复bug

### 步骤 7：完善细节
1. 添加粒子效果
2. 完善UI交互
3. 优化性能

## 💡 最佳实践

### 1. 使用对象池
```typescript
// 子弹对象池
private bulletPool: NodePool;

onLoad() {
    this.bulletPool = new NodePool();
}

getBullet(): Node {
    return this.bulletPool.size() > 0 ?
        this.bulletPool.get() :
        instantiate(this.bulletPrefab);
}

recycleBullet(bullet: Node) {
    this.bulletPool.put(bullet);
}
```

### 2. 合理使用Layer
```typescript
// 设置渲染层级
world.layer = Layers.Enum.UI_2D;
enemy.layer = Layers.Enum.DEFAULT;
```

### 3. 事件解耦
```typescript
// 使用事件总线
EventBus.getInstance().emit('enemy-killed', enemy);
EventBus.getInstance().on('enemy-killed', this.onEnemyKilled, this);
```

### 4. 资源管理
```typescript
// 动态加载资源
resources.load('audio/shoot', AudioClip, (err, clip) => {
    this.soundManager.shootSound = clip;
});
```

## 🐛 常见问题

### Q1: Graphics 不显示？
**A**: 检查节点的 Layer 设置和相机配置。

### Q2: 坐标不对？
**A**: Cocos 使用中心原点，需要调整计算方式。

### Q3: 事件不触发？
**A**: 确保节点的 `UITransform` 组件存在且尺寸正确。

### Q4: 性能问题？
**A**: 使用对象池、减少节点数量、合理使用批处理。

## 📊 工作量评估

| 任务 | 工作量 | 状态 |
|------|--------|------|
| 项目结构搭建 | 2h | ✅ 完成 |
| 配置迁移 | 2h | ✅ 完成 |
| 核心系统 | 3h | ✅ 完成 |
| 管理器系统 | 4h | ✅ 完成 |
| 场景创建 | 2h | ⏳ 待做 |
| 武器实现 | 4h | ⏳ 待做 |
| 敌人实现 | 4h | ⏳ 待做 |
| 粒子系统 | 2h | ⏳ 待做 |
| UI完善 | 3h | ⏳ 待做 |
| 测试调优 | 4h | ⏳ 待做 |
| **总计** | **30h** | **50% 完成** |

## 🎉 迁移完成标准

- [ ] 游戏可正常启动
- [ ] 可以放置武器
- [ ] 敌人可以生成和移动
- [ ] 战斗逻辑正常
- [ ] 金币系统正常
- [ ] 音效正常播放
- [ ] UI交互完整
- [ ] 性能稳定（60 FPS）

---

📅 **开始时间**: 2025-12-10  
🎯 **预计完成**: 待定  
👤 **负责人**: 开发团队

