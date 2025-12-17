# 文件结构优化方案

## 📋 当前问题

1. **抛射物分类不清晰**
   - `HomingRocket` 在 `entities/weapons/` 下，但它是抛射物不是武器
   - `EnemyBullet`, `SonicWave` 在 `entities/enemies/` 下，但它们是抛射物

2. **渲染器位置孤立**
   - `rendering/WeaponRenderer.ts` 只有一个文件，可以考虑放入更合适的位置

3. **缺少明确的模块划分**
   - 需要更清晰的功能模块划分

## 🎯 优化方案

### 建议的新结构

```
cocos/assets/scripts/
├── core/                           # 核心系统
│   ├── GameContext.ts
│   ├── EventManager.ts
│   ├── ObjectPool.ts
│   ├── ParticleManager.ts
│   └── SoundManager.ts
│
├── config/                         # 配置
│   ├── GameConfig.ts
│   └── Colors.ts
│
├── types/                          # 类型定义
│   ├── Interfaces.ts
│   └── Enums.ts
│
├── entities/                       # 游戏实体
│   ├── base/                       # 基类
│   │   ├── WeaponBase.ts
│   │   ├── EnemyBase.ts
│   │   └── ProjectileBase.ts
│   │
│   ├── weapons/                    # 武器（防御塔）
│   │   ├── LaserTower.ts
│   │   └── RocketTower.ts
│   │
│   ├── enemies/                    # 敌人
│   │   ├── EnemyTank.ts
│   │   └── SonicTank.ts
│   │
│   └── projectiles/                # 抛射物（新增文件夹）
│       ├── HomingRocket.ts         # 从 weapons/ 移动
│       ├── EnemyBullet.ts          # 从 enemies/ 移动
│       └── SonicWave.ts            # 从 enemies/ 移动
│
├── managers/                       # 管理器
│   ├── WeaponManager.ts
│   ├── EnemyManager.ts
│   ├── GoldManager.ts
│   └── UIManager.ts
│
├── systems/                        # 系统
│   └── PathfindingSystem.ts
│
├── rendering/                      # 渲染
│   └── WeaponRenderer.ts
│
├── ui/                            # UI 组件
│   ├── StartScreen.ts
│   ├── WeaponCard.ts
│   ├── WeaponContainerUI.ts
│   └── WeaponDragManager.ts
│
├── components/                     # 通用组件
│   └── WeaponGridData.ts
│
├── utils/                         # 工具类
│   └── SceneDebugger.ts
│
└── GameMain.ts                    # 游戏主入口
```

## 🔄 需要移动的文件

### 1. 创建新文件夹
- `entities/base/` - 存放所有基类
- `entities/projectiles/` - 存放所有抛射物

### 2. 文件移动计划

| 文件 | 当前位置 | 目标位置 | 原因 |
|------|---------|---------|------|
| `WeaponBase.ts` | `entities/` | `entities/base/` | 基类统一管理 |
| `EnemyBase.ts` | `entities/` | `entities/base/` | 基类统一管理 |
| `ProjectileBase.ts` | `entities/` | `entities/base/` | 基类统一管理 |
| `HomingRocket.ts` | `entities/weapons/` | `entities/projectiles/` | 它是抛射物不是武器 |
| `EnemyBullet.ts` | `entities/enemies/` | `entities/projectiles/` | 它是抛射物不是敌人 |
| `SonicWave.ts` | `entities/enemies/` | `entities/projectiles/` | 它是抛射物不是敌人 |

## 📊 优化后的结构对比

### 当前结构
```
entities/
├── WeaponBase.ts          ❌ 基类和实体混在一起
├── EnemyBase.ts           ❌ 基类和实体混在一起
├── ProjectileBase.ts      ❌ 基类和实体混在一起
├── weapons/
│   ├── LaserTower.ts      ✅ 武器
│   ├── RocketTower.ts     ✅ 武器
│   └── HomingRocket.ts    ❌ 这是抛射物，不是武器
└── enemies/
    ├── EnemyTank.ts       ✅ 敌人
    ├── SonicTank.ts       ✅ 敌人
    ├── EnemyBullet.ts     ❌ 这是抛射物，不是敌人
    └── SonicWave.ts       ❌ 这是抛射物，不是敌人
```

### 优化后结构
```
entities/
├── base/                  ✅ 基类统一管理
│   ├── WeaponBase.ts
│   ├── EnemyBase.ts
│   └── ProjectileBase.ts
├── weapons/               ✅ 只有武器
│   ├── LaserTower.ts
│   └── RocketTower.ts
├── enemies/               ✅ 只有敌人
│   ├── EnemyTank.ts
│   └── SonicTank.ts
└── projectiles/           ✅ 抛射物独立分类
    ├── HomingRocket.ts
    ├── EnemyBullet.ts
    └── SonicWave.ts
```

## ✨ 优化优势

### 1. **概念清晰**
- **武器** = 防御塔（固定位置，发射抛射物）
- **敌人** = 移动单位（沿路径移动）
- **抛射物** = 飞行物体（子弹、火箭、音波等）
- **基类** = 抽象类（统一管理）

### 2. **易于查找**
```typescript
// 想找武器？ -> entities/weapons/
// 想找敌人？ -> entities/enemies/
// 想找抛射物？ -> entities/projectiles/
// 想找基类？ -> entities/base/
```

### 3. **便于扩展**
```typescript
// 新增抛射物 -> entities/projectiles/NewProjectile.ts
// 新增武器 -> entities/weapons/NewWeapon.ts
// 新增敌人 -> entities/enemies/NewEnemy.ts
```

### 4. **职责分离**
- 每个文件夹只包含一种类型的实体
- 避免概念混淆

## 🚀 执行步骤

1. **创建新文件夹**
   ```bash
   mkdir -p entities/base
   mkdir -p entities/projectiles
   ```

2. **移动基类文件**
   ```bash
   mv entities/WeaponBase.ts entities/base/
   mv entities/EnemyBase.ts entities/base/
   mv entities/ProjectileBase.ts entities/base/
   ```

3. **移动抛射物文件**
   ```bash
   mv entities/weapons/HomingRocket.ts entities/projectiles/
   mv entities/enemies/EnemyBullet.ts entities/projectiles/
   mv entities/enemies/SonicWave.ts entities/projectiles/
   ```

4. **更新所有导入路径**
   - 需要更新所有引用这些文件的 import 语句

## 📝 需要更新的导入路径

### WeaponBase.ts
```typescript
// 之前
import { WeaponBase } from '../entities/WeaponBase';

// 之后
import { WeaponBase } from '../entities/base/WeaponBase';
```

### EnemyBase.ts
```typescript
// 之前
import { EnemyBase } from '../entities/EnemyBase';

// 之后
import { EnemyBase } from '../entities/base/EnemyBase';
```

### ProjectileBase.ts
```typescript
// 之前
import { ProjectileBase } from '../entities/ProjectileBase';

// 之后
import { ProjectileBase } from '../entities/base/ProjectileBase';
```

### HomingRocket.ts
```typescript
// 之前
import { HomingRocket } from '../entities/weapons/HomingRocket';

// 之后
import { HomingRocket } from '../entities/projectiles/HomingRocket';
```

## ✅ 执行清单

- [ ] 创建 `entities/base/` 文件夹
- [ ] 创建 `entities/projectiles/` 文件夹
- [ ] 移动 3 个基类文件到 `base/`
- [ ] 移动 3 个抛射物文件到 `projectiles/`
- [ ] 更新所有导入路径
- [ ] 更新 .meta 文件
- [ ] 测试游戏运行正常

## 🎯 最终效果

清晰的文件结构：
```
📁 entities/
  📁 base/          → 3 个基类
  📁 weapons/       → 2 个武器（防御塔）
  📁 enemies/       → 2 个敌人
  📁 projectiles/   → 3 个抛射物
```

职责明确，易于维护和扩展！

