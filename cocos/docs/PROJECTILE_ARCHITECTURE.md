# 抛射物架构说明

## 🎯 问题
之前 `HomingRocket`（追踪火箭）直接继承 `Component`，没有统一的基类，导致：
- 代码结构不清晰
- 无法复用通用逻辑
- 难以扩展新的抛射物类型

## ✅ 解决方案
创建了 `ProjectileBase` 抛射物基类，统一管理所有抛射物（子弹、火箭、激光等）。

## 📐 类层次结构

### 之前
```
Component
├── WeaponBase (武器基类)
│   ├── LaserTower (激光塔)
│   └── RocketTower (火箭塔)
├── EnemyBase (敌人基类)
│   ├── EnemyTank
│   └── SonicTank
└── HomingRocket (追踪火箭) ❌ 没有基类
```

### 现在
```
Component
├── WeaponBase (武器基类)
│   ├── LaserTower (激光塔)
│   └── RocketTower (火箭塔)
├── EnemyBase (敌人基类)
│   ├── EnemyTank
│   └── SonicTank
└── ProjectileBase (抛射物基类) ✅ 新增
    └── HomingRocket (追踪火箭) ✅ 继承基类
```

## 🏗️ ProjectileBase 基类设计

### 核心功能
```typescript
export class ProjectileBase extends Component {
    // 通用属性
    protected projectileType: ProjectileType;
    protected target: Node | null;
    protected velocity: Vec3;
    protected speed: number;
    protected damage: number;
    protected lifetime: number;
    protected shouldDestroyed: boolean;
    
    // 通用方法
    init(target, damage, speed): void
    updateProjectile(deltaTime, deltaMS, enemies): void
    move(deltaTime, deltaMS): void              // 可重写
    checkCollision(enemies): void               // 可重写
    checkBounds(): void
    shouldDestroy(): boolean
    getDamage(): number
    getTarget(): Node | null
    setTarget(target): void
    markForDestroy(): void
}
```

### 抛射物类型
```typescript
export enum ProjectileType {
    ROCKET = 'rocket',          // 追踪火箭
    BULLET = 'bullet',          // 普通子弹
    LASER = 'laser',            // 激光束
    SONIC_WAVE = 'sonic_wave'   // 音波
}
```

## 🚀 HomingRocket 重构

### 重构前
```typescript
export class HomingRocket extends Component {
    private target: Node | null = null;
    private velocity: Vec3 = new Vec3();
    private speed: number = 200;
    private damage: number = 2;
    private shouldDestroyed: boolean = false;
    // ... 重复的通用逻辑
}
```

### 重构后
```typescript
export class HomingRocket extends ProjectileBase {
    // 只保留追踪火箭特有的属性
    private turnRate: number;
    private color: number;
    private radius: number;
    
    // 重写基类方法实现追踪逻辑
    protected move(deltaTime, deltaMS): void {
        // 追踪目标的移动逻辑
    }
    
    protected checkCollision(enemies): void {
        // 碰撞检测逻辑
    }
}
```

## 📊 改进效果

### 代码复用
| 功能 | 之前 | 现在 |
|------|------|------|
| 通用属性 | 每个抛射物重复定义 | 基类统一提供 |
| 移动逻辑 | 每个抛射物实现 | 基类提供默认实现 |
| 边界检查 | 每个抛射物实现 | 基类统一实现 |
| 生命周期 | 各自管理 | 基类统一管理 |

### 优势

#### 1. **代码复用**
- 通用属性和方法在基类中定义一次
- 子类只需关注特有逻辑

#### 2. **易于扩展**
添加新的抛射物类型只需：
```typescript
export class NewProjectile extends ProjectileBase {
    // 只实现特有逻辑
}
```

#### 3. **统一管理**
所有抛射物遵循相同的接口：
- `init()` - 初始化
- `updateProjectile()` - 更新
- `shouldDestroy()` - 检查销毁
- `getDamage()` - 获取伤害

#### 4. **类型安全**
```typescript
// 可以统一处理所有抛射物
const projectiles: ProjectileBase[] = [...];
projectiles.forEach(p => p.updateProjectile(...));
```

## 🔄 使用示例

### 创建追踪火箭
```typescript
// 在 RocketTower 中
const rocket = rocketNode.addComponent(HomingRocket);
rocket.init(targetNode, {
    speed: 200,
    damage: 10,
    turnRate: Math.PI * 1.1,
    color: 0xc026d3
});
```

### 更新抛射物
```typescript
// 统一的更新接口
rocket.updateRocket(deltaTime, deltaMS, enemies);
// 或者直接调用基类方法
rocket.updateProjectile(deltaTime, deltaMS, enemies);
```

### 检查销毁
```typescript
if (rocket.shouldDestroy()) {
    rocket.node.destroy();
}
```

## 📦 文件结构

```
cocos/assets/scripts/entities/
├── ProjectileBase.ts         ✅ 新增：抛射物基类
├── WeaponBase.ts              武器基类
├── EnemyBase.ts               敌人基类
└── weapons/
    └── HomingRocket.ts        ✅ 重构：继承 ProjectileBase
```

## 🎯 未来扩展

### 可以轻松添加的抛射物类型

#### 1. 普通子弹
```typescript
export class Bullet extends ProjectileBase {
    // 直线飞行，不需要重写 move()
}
```

#### 2. 抛物线炮弹
```typescript
export class Cannonball extends ProjectileBase {
    protected move(deltaTime, deltaMS): void {
        // 实现抛物线运动
        this.velocity.y -= this.gravity * deltaTime;
        super.move(deltaTime, deltaMS);
    }
}
```

#### 3. 范围爆炸
```typescript
export class ExplosiveRocket extends HomingRocket {
    protected checkCollision(enemies): void {
        super.checkCollision(enemies);
        if (this.shouldDestroyed) {
            this.explodeInArea(enemies);
        }
    }
}
```

## ✅ 架构优势总结

1. **清晰的职责划分**
   - `WeaponBase` - 武器（防御塔）
   - `ProjectileBase` - 抛射物（子弹、火箭）
   - `EnemyBase` - 敌人

2. **代码复用性高**
   - 通用逻辑在基类中实现
   - 子类只关注特有行为

3. **扩展性强**
   - 添加新抛射物简单快速
   - 统一的接口便于管理

4. **类型安全**
   - TypeScript 类型检查
   - 减少运行时错误

5. **易于维护**
   - 代码结构清晰
   - 修改影响范围小

这次重构使得抛射物系统更加规范和易于扩展！🎉

