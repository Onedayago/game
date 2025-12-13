# 代码迁移指南

## 概述

本指南将帮助你逐步将现有代码迁移到新的架构系统。

---

## ✅ 已完成的迁移

### 1. GameContext.ts
- ✅ 实现 `IGameContext` 接口
- ✅ 替换 `any` 类型为接口类型
- ✅ 添加类型安全的方法
- ✅ 添加游戏状态管理

**改动内容**：
```typescript
// Before
weaponManager: any = null;
enemies: any[] = [];

// After
weaponManager: IWeaponManager | null = null;
enemies: IEnemy[] = [];
```

---

## 🔄 迁移步骤

### 阶段 1：核心系统（已完成）
- ✅ GameContext - 类型安全化
- ✅ EventManager - 事件系统
- ✅ ObjectPool - 对象池系统

### 阶段 2：管理器层（进行中）

#### WeaponManager 迁移
```typescript
// 1. 导入接口
import { IWeaponManager, IWeapon } from '../types/Interfaces';

// 2. 实现接口
export class WeaponManager extends Component implements IWeaponManager {
    // 3. 类型安全
    private weapons: IWeapon[] = [];
    private selectedWeapon: IWeapon | null = null;
    
    // 4. 实现接口方法
    getWeapons(): IWeapon[] {
        return this.weapons;
    }
    
    getSelectedWeapon(): IWeapon | null {
        return this.selectedWeapon;
    }
}
```

#### EnemyManager 迁移
```typescript
// 1. 导入接口
import { IEnemyManager, IEnemy } from '../types/Interfaces';

// 2. 实现接口
export class EnemyManager extends Component implements IEnemyManager {
    // 3. 类型安全
    private enemies: IEnemy[] = [];
    
    // 4. 使用对象池
    private enemyPool: NodePool;
    
    onLoad() {
        // 初始化对象池
        this.enemyPool = new NodePool(this.enemyPrefab, 10, 50);
        poolManager.registerPool('enemy', this.enemyPool);
    }
    
    spawnEnemy(): void {
        // 从对象池获取
        const enemyNode = poolManager.get<Node>('enemy');
        if (enemyNode) {
            // 配置敌人
            this.worldNode.addChild(enemyNode);
        }
    }
    
    removeEnemy(enemy: IEnemy): void {
        // 归还到对象池
        poolManager.release('enemy', enemy.node);
    }
}
```

#### GoldManager 迁移
```typescript
import { IGoldManager } from '../types/Interfaces';
import { eventManager } from '../core/EventManager';
import { GameEventType } from '../types/Enums';

export class GoldManager extends Component implements IGoldManager {
    private gold: number = 1000;
    
    addGold(amount: number): void {
        this.gold += amount;
        
        // 发送事件
        eventManager.emit(GameEventType.GOLD_CHANGE, {
            amount: this.gold,
            delta: amount
        });
    }
    
    spendGold(amount: number): boolean {
        if (this.gold >= amount) {
            this.gold -= amount;
            
            // 发送事件
            eventManager.emit(GameEventType.GOLD_SPEND, {
                amount: this.gold,
                spent: amount
            });
            
            return true;
        }
        return false;
    }
    
    canAfford(amount: number): boolean {
        return this.gold >= amount;
    }
    
    getGold(): number {
        return this.gold;
    }
}
```

---

## 🎯 迁移检查清单

### 对于每个文件

#### 1. 类型安全 ✅
- [ ] 移除所有 `any` 类型
- [ ] 使用接口类型
- [ ] 添加返回类型
- [ ] 添加参数类型

#### 2. 实现接口 ✅
- [ ] 导入相应接口
- [ ] 类声明实现接口
- [ ] 实现所有必需方法
- [ ] 确保类型匹配

#### 3. 使用事件系统 ✅
- [ ] 识别需要解耦的调用
- [ ] 替换为事件发送
- [ ] 添加事件监听
- [ ] 清理旧的直接调用

#### 4. 使用对象池 ✅
- [ ] 识别频繁创建的对象
- [ ] 创建对象池
- [ ] 替换 instantiate
- [ ] 替换 destroy

---

## 📝 具体示例

### 示例 1：敌人死亡处理

#### Before（强耦合）
```typescript
// 在 Enemy 类中
die() {
    // 直接调用多个系统
    goldManager.addGold(100);
    particleSystem.playExplosion(this.x, this.y);
    soundManager.play('explosion');
    uiManager.updateKillCount();
    
    // 销毁
    this.node.destroy();
}
```

#### After（事件驱动 + 对象池）
```typescript
// 在 Enemy 类中
die() {
    // 只发送一个事件
    eventManager.emit(GameEventType.ENEMY_DEATH, {
        enemy: this,
        position: { x: this.x, y: this.y },
        reward: 100
    });
}

// 在 EnemyManager 中监听
onLoad() {
    eventManager.on(GameEventType.ENEMY_DEATH, (event) => {
        const { enemy, reward } = event.data;
        
        // 归还到对象池
        poolManager.release('enemy', enemy.node);
        
        // 移除引用
        this.removeEnemy(enemy);
    });
}

// 在 GoldManager 中监听
onLoad() {
    eventManager.on(GameEventType.ENEMY_DEATH, (event) => {
        this.addGold(event.data.reward);
    });
}

// 在 ParticleManager 中监听
onLoad() {
    eventManager.on(GameEventType.ENEMY_DEATH, (event) => {
        this.playExplosion(event.data.position);
    });
}
```

### 示例 2：武器升级

#### Before
```typescript
// 在 UI 中直接调用
onUpgradeClick() {
    const weapon = weaponManager.getSelectedWeapon();
    if (weapon) {
        const cost = weapon.getUpgradeCost();
        if (goldManager.spendGold(cost)) {
            weapon.upgrade();
            // 更新UI
            this.updateUI();
        }
    }
}
```

#### After（事件驱动）
```typescript
// 在 UI 中
onUpgradeClick() {
    const weapon = weaponManager.getSelectedWeapon();
    if (weapon && goldManager.canAfford(weapon.getUpgradeCost())) {
        // 发送升级请求事件
        eventManager.emit(GameEventType.WEAPON_UPGRADE_REQUEST, { weapon });
    }
}

// 在 WeaponManager 中处理
onLoad() {
    eventManager.on(GameEventType.WEAPON_UPGRADE_REQUEST, (event) => {
        const weapon = event.data.weapon;
        const cost = weapon.getUpgradeCost();
        
        if (this.goldManager.spendGold(cost)) {
            weapon.upgrade();
            
            // 发送升级成功事件
            eventManager.emit(GameEventType.WEAPON_UPGRADE, { weapon });
        }
    });
}

// UI 监听升级成功事件
onLoad() {
    eventManager.on(GameEventType.WEAPON_UPGRADE, () => {
        this.updateActionButtons();
    });
}
```

---

## 🚀 快速迁移模板

### 模板 1：管理器类
```typescript
import { IYourManager } from '../types/Interfaces';
import { eventManager } from '../core/EventManager';
import { GameEventType } from '../types/Enums';

@ccclass('YourManager')
export class YourManager extends Component implements IYourManager {
    // 1. 类型安全的属性
    private items: IYourType[] = [];
    
    // 2. 初始化
    onLoad() {
        this.initEventListeners();
        this.initObjectPools();
    }
    
    // 3. 事件监听
    private initEventListeners() {
        eventManager.on(GameEventType.YOUR_EVENT, this.onYourEvent.bind(this));
    }
    
    // 4. 对象池（如果需要）
    private initObjectPools() {
        const pool = new NodePool(this.prefab, 10, 50);
        poolManager.registerPool('your_object', pool);
    }
    
    // 5. 实现接口方法
    init(...args: any[]): void {
        // 初始化逻辑
    }
    
    // 6. 清理
    onDestroy() {
        eventManager.off(GameEventType.YOUR_EVENT, this.onYourEvent);
        poolManager.clearAll();
    }
}
```

---

## ⚠️ 常见问题

### Q: 迁移会破坏现有功能吗？
**A**: 不会。迁移是逐步进行的，每个步骤都会测试。旧代码会继续工作直到完全迁移。

### Q: 性能会受影响吗？
**A**: 不会。事件系统和对象池反而会提升性能。事件系统开销极小，对象池显著减少GC。

### Q: 需要改多少代码？
**A**: 主要是添加类型和替换部分调用。大部分逻辑不变，只是组织方式更好。

### Q: 如何测试迁移后的代码？
**A**: 
1. 每次迁移一个文件
2. 运行游戏测试功能
3. 使用 `eventManager.debug()` 和 `poolManager.debug()` 监控
4. 检查 linter 错误

---

## 📊 迁移进度追踪

### 核心系统
- [x] GameContext
- [x] EventManager
- [x] ObjectPool
- [ ] SoundManager（待迁移）
- [ ] ParticleManager（待迁移）

### 管理器
- [ ] WeaponManager（待迁移）
- [ ] EnemyManager（待迁移）
- [ ] GoldManager（待迁移）
- [ ] UIManager（待迁移）

### 实体
- [ ] WeaponBase（待迁移）
- [ ] EnemyBase（待迁移）
- [ ] RocketTower（待迁移）
- [ ] LaserTower（待迁移）
- [ ] EnemyTank（待迁移）

### UI
- [ ] WeaponContainerUI（待迁移）
- [ ] WeaponDragManager（待迁移）
- [ ] StartScreen（待迁移）

---

## 🎯 下一步

1. **WeaponManager** - 实现接口，使用事件
2. **EnemyManager** - 添加对象池支持
3. **GoldManager** - 事件驱动金币变化
4. **实体类** - 类型安全，事件通知

---

**迁移是渐进的，每一步都会让代码更好！** 🚀

