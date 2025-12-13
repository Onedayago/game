# 敌人系统设置指南

本指南说明如何在 Cocos Creator 中设置敌人系统。

## 📋 概述

敌人系统已完全复刻自原游戏（PixiJS），包括：
- ✅ 详细的坦克绘制（履带、车体、炮塔、炮管等）
- ✅ 波次系统（敌人越来越强）
- ✅ 自动生成和管理
- ✅ 攻击和移动逻辑

## 🎯 敌人配置常量

所有配置都在 `GameConfig.ts` 中：

```typescript
// 敌人基础属性
ENEMY_SIZE = 56 (80 * 0.7)        // 敌人尺寸
ENEMY_MOVE_SPEED = 50             // 移动速度（像素/秒）
ENEMY_SPAWN_INTERVAL = 2000       // 基础刷怪间隔（毫秒）
ENEMY_MIN_SPAWN_INTERVAL = 800    // 最小刷怪间隔
ENEMY_MAX_HP = 10                 // 初始生命值
ENEMY_BULLET_DAMAGE = 1           // 子弹伤害
ENEMY_ATTACK_RANGE = 3            // 攻击范围（格子数）
ENEMY_FIRE_INTERVAL = 1000        // 射速（毫秒）
ENEMY_KILL_REWARD = 10            // 击杀奖励金币

// 波次系统
WAVE_DURATION = 15000             // 每波持续时间（15秒）
HP_BONUS_PER_WAVE = 2             // 每波增加的血量
SPAWN_INTERVAL_REDUCTION = 0.92   // 每波生成间隔递减率

// 动画
ENEMY_IDLE_PULSE_AMPLITUDE = 0.015  // 待机脉冲幅度
ENEMY_HIT_FLASH_DURATION = 120      // 受击闪烁时长
```

## 🎨 敌人坦克视觉效果

`EnemyTank.ts` 中的 `createVisual()` 方法绘制了详细的坦克：

### 绘制层次（从下到上）：
1. **多层阴影** - 立体感
2. **履带系统** - 上下两条履带 + 装甲板纹理 + 滚轮
3. **主车体** - 带高光和装甲条纹
4. **前装甲条** - 带威胁标识（红色辉光）
5. **炮塔** - 多层结构 + 警示灯
6. **炮管** - 中段装甲 + 炮口光环

### 配色方案（赛博朋克风格）：
```typescript
ENEMY_BODY = 0xff006e          // 主体颜色（粉红）
ENEMY_BODY_DARK = 0x1a0a14     // 深色（履带等）
ENEMY_DETAIL = 0xff0080        // 细节颜色（灯光、炮管等）
```

## 🏗️ 在 Cocos Creator 中创建敌人预制体

### 步骤 1：创建敌人节点

1. 在 **层级管理器** 右键 → **创建空节点**
2. 命名为 `EnemyTank`
3. 添加组件：
   - `UITransform`：设置尺寸为 `(56, 56)`，锚点 `(0.5, 0.5)`
   - `EnemyTank` 脚本组件

### 步骤 2：设置组件属性

在 **属性检查器** 中：
- **EnemyTank 组件**：
  - `Bullet Prefab`：拖入 `EnemyBullet` 预制体（如果有）

### 步骤 3：保存为预制体

1. 将节点从层级管理器拖到 **资源管理器** 的 `prefabs/enemies/` 文件夹
2. 命名为 `EnemyTank.prefab`

### 步骤 4：配置 EnemyManager

在 **GameMain 场景** 中：
1. 选择 `World` 节点
2. 在 **EnemyManager 组件** 的属性中：
   - `Enemy Tank Prefab`：拖入刚创建的 `EnemyTank.prefab`

## 🎮 敌人系统工作流程

### 1. 初始化（GameMain.onLoad）
```typescript
// EnemyManager 自动创建并挂载到 World 节点
this.enemyManager = this.worldNode.addComponent(EnemyManager);
this.enemyManager.init(this.weaponManager, this.goldManager);
```

### 2. 更新循环（每帧）
```typescript
// GameMain.update()
this.enemyManager.update(deltaTime, deltaMS);
  ↓
// EnemyManager 负责：
- 更新波次系统（15秒一波）
- 定时生成敌人
- 更新所有敌人（移动、攻击）
- 清理死亡/到达终点的敌人
```

### 3. 敌人生成（EnemyManager.spawnEnemy）
```typescript
// 每 2 秒（初始）生成一个敌人
- 随机选择一行（0-3）
- 检查是否有占用
- 实例化敌人预制体
- 设置血量加成（根据波次）
- 添加到 worldNode
```

### 4. 敌人行为（EnemyBase.update）
```typescript
- 向右移动（50 像素/秒）
- 寻找范围内最近的武器
- 瞄准并开火（每 1 秒）
- 检查是否到达终点
```

## 📊 波次系统

### 波次增强效果：
- **波次 1**：基础敌人（10 HP，2秒刷一个）
- **波次 2**：12 HP，1.84秒刷一个
- **波次 3**：14 HP，1.69秒刷一个
- **波次 4**：16 HP，1.56秒刷一个
- ...
- **最大难度**：每波最多 +10 HP，最快 0.8秒刷一个

### 波次通知：
```typescript
console.log(`🌊 第 ${waveLevel} 波开始！敌人血量 +${hpBonus}`);
```

## 🐛 调试技巧

### 查看敌人生成：
```typescript
// 在 EnemyManager.spawnEnemy() 中
console.log(`生成敌人: 行=${row}, 波次=${this.waveLevel}, 血量加成=${this.hpBonus}`);
```

### 检查敌人位置：
```typescript
// 在 EnemyBase.update() 中
console.log(`敌人位置: ${this.node.position}, 网格: (${this.gridX}, ${this.gridY})`);
```

### 查看攻击逻辑：
```typescript
// 在 EnemyTank.fire() 中
console.log('敌人开火！目标:', target.name);
```

## 🎨 自定义敌人外观

要修改敌人外观，编辑 `EnemyTank.ts` 中的 `createVisual()` 方法：

```typescript
// 修改尺寸
const size = GameConfig.ENEMY_SIZE * 1.2;  // 放大 20%

// 修改颜色
graphics.fillColor = this.hexToColor(0x00ff00, 255);  // 绿色

// 添加新元素
graphics.circle(0, 0, 10);  // 在中心画一个圆
graphics.fill();
```

## ✅ 完成检查清单

- [ ] `EnemyTank.prefab` 已创建
- [ ] 预制体已添加 `EnemyTank` 组件
- [ ] 预制体已赋值给 `EnemyManager.enemyTankPrefab`
- [ ] 运行游戏，点击"开始游戏"
- [ ] 观察敌人从左侧生成
- [ ] 敌人向右移动
- [ ] 敌人在范围内攻击武器

## 🔧 常见问题

### Q: 敌人不显示？
**A:** 检查：
1. 预制体的 Layer 设置（应与 World 节点一致）
2. `EnemyManager.enemyTankPrefab` 是否已赋值
3. 控制台是否有 "生成敌人" 的日志

### Q: 敌人位置不对？
**A:** 确保 `worldNode` 的锚点为 `(0, 0)`，位置为 `(-800, -320)`

### Q: 敌人不攻击？
**A:** 检查：
1. `weaponManager.getWeapons()` 是否返回武器
2. 敌人的 `attackRange` 设置
3. `EnemyBullet` 预制体是否存在

### Q: 波次不增加？
**A:** 确保游戏已开始（`gameContext.gameStarted = true`）

## 🎯 下一步

- [ ] 创建 **声波坦克**（SonicTank）变体
- [ ] 添加 **生成传送门** 特效
- [ ] 实现 **敌人血条** 显示
- [ ] 添加 **死亡爆炸** 粒子效果
- [ ] 实现 **敌人子弹** 系统

---

**提示**：敌人系统已完全复刻原游戏逻辑，只需在编辑器中创建预制体即可运行！🚀
