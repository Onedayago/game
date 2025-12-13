# 架构优化使用示例

## 快速上手指南

### 示例 1：使用类型接口

```typescript
// ❌ 改进前
export class MyWeaponManager extends Component {
    private weapons: any[] = [];
    
    addWeapon(weapon: any) {
        this.weapons.push(weapon);
    }
}

// ✅ 改进后
import { IWeapon, IWeaponManager } from '../types/Interfaces';

export class MyWeaponManager extends Component implements IWeaponManager {
    private weapons: IWeapon[] = [];
    
    addWeapon(weapon: IWeapon) {
        this.weapons.push(weapon);
        
        // 类型安全，IDE 有智能提示
        weapon.setSelected(false);
        console.log(`Added weapon level ${weapon.level}`);
    }
    
    // 实现接口要求的方法
    getWeapons(): IWeapon[] {
        return this.weapons;
    }
}
```

---

### 示例 2：使用事件系统

```typescript
import { eventManager } from '../core/EventManager';
import { GameEventType } from '../types/Enums';

// ❌ 改进前 - 强耦合
export class Enemy {
    die() {
        // 直接调用其他模块
        goldManager.addGold(100);
        particleSystem.playExplosion(this.x, this.y);
        soundManager.play('explosion');
        uiManager.updateScore();
    }
}

// ✅ 改进后 - 事件驱动
export class Enemy {
    die() {
        // 只发送一个事件
        eventManager.emit(GameEventType.ENEMY_DEATH, {
            enemy: this,
            position: { x: this.x, y: this.y },
            reward: 100
        });
    }
}

// 各个模块独立监听
export class GoldManager {
    onLoad() {
        eventManager.on(GameEventType.ENEMY_DEATH, (event) => {
            this.addGold(event.data.reward);
        });
    }
}

export class ParticleManager {
    onLoad() {
        eventManager.on(GameEventType.ENEMY_DEATH, (event) => {
            this.playExplosion(event.data.position);
        });
    }
}
```

---

### 示例 3：使用对象池

```typescript
import { poolManager, NodePool } from '../core/ObjectPool';

export class BulletManager extends Component {
    @property(Prefab)
    bulletPrefab: Prefab | null = null;
    
    private activeBullets: Node[] = [];
    
    // ❌ 改进前
    fireBulletOld() {
        const bullet = instantiate(this.bulletPrefab!);
        bullet.setPosition(this.position);
        this.node.addChild(bullet);
        this.activeBullets.push(bullet);
        
        // 使用后销毁，频繁GC
        setTimeout(() => {
            bullet.destroy();
        }, 2000);
    }
    
    // ✅ 改进后
    onLoad() {
        // 初始化对象池
        const bulletPool = new NodePool(this.bulletPrefab!, 20, 100);
        poolManager.registerPool('bullet', bulletPool);
    }
    
    fireBullet() {
        // 从池中获取
        const bullet = poolManager.get<Node>('bullet');
        if (bullet) {
            bullet.setPosition(this.position);
            this.node.addChild(bullet);
            this.activeBullets.push(bullet);
        }
    }
    
    destroyBullet(bullet: Node) {
        // 归还到池
        const index = this.activeBullets.indexOf(bullet);
        if (index > -1) {
            this.activeBullets.splice(index, 1);
        }
        poolManager.release('bullet', bullet);
    }
}
```

---

### 示例 4：组合使用

```typescript
import { eventManager } from '../core/EventManager';
import { poolManager } from '../core/ObjectPool';
import { GameEventType } from '../types/Enums';
import { IWeapon, IEnemy } from '../types/Interfaces';

export class Weapon implements IWeapon {
    // ... 实现 IWeapon 接口
    
    fire(target: IEnemy) {
        // 1. 从对象池获取子弹
        const bullet = poolManager.get<Node>('bullet');
        if (!bullet) return;
        
        // 2. 配置子弹
        bullet.setPosition(this.node.position);
        this.worldNode.addChild(bullet);
        
        // 3. 发送事件
        eventManager.emit(GameEventType.BULLET_FIRE, {
            weapon: this,
            bullet,
            target
        });
    }
    
    onHit(damage: number): boolean {
        const destroyed = super.takeDamage(damage);
        
        if (destroyed) {
            // 发送摧毁事件
            eventManager.emit(GameEventType.WEAPON_DESTROY, {
                weapon: this,
                refund: this.getSellGain()
            });
        }
        
        return destroyed;
    }
}
```

---

### 示例 5：GameMain 集成

```typescript
import { eventManager } from '../core/EventManager';
import { poolManager, NodePool } from '../core/ObjectPool';
import { GameEventType } from '../types/Enums';
import { IWeaponManager, IEnemyManager } from '../types/Interfaces';

@ccclass('GameMain')
export class GameMain extends Component {
    @property(Node)
    worldNode: Node | null = null;
    
    @property(Prefab)
    bulletPrefab: Prefab | null = null;
    
    @property(Prefab)
    enemyPrefab: Prefab | null = null;
    
    private weaponManager: IWeaponManager | null = null;
    private enemyManager: IEnemyManager | null = null;
    
    onLoad() {
        this.initObjectPools();
        this.initEventListeners();
        this.initManagers();
    }
    
    // 初始化对象池
    private initObjectPools() {
        // 子弹池
        const bulletPool = new NodePool(this.bulletPrefab!, 30, 150);
        poolManager.registerPool('bullet', bulletPool);
        
        // 敌人池
        const enemyPool = new NodePool(this.enemyPrefab!, 20, 100);
        poolManager.registerPool('enemy', enemyPool);
        
        console.log('[GameMain] Object pools initialized');
        poolManager.debug();
    }
    
    // 初始化事件监听
    private initEventListeners() {
        // 监听敌人死亡
        eventManager.on(GameEventType.ENEMY_DEATH, (event) => {
            const { enemy, reward } = event.data;
            
            // 归还到对象池
            poolManager.release('enemy', enemy.node);
            
            // 添加金币
            this.goldManager?.addGold(reward);
        });
        
        // 监听武器摧毁
        eventManager.on(GameEventType.WEAPON_DESTROY, (event) => {
            const { weapon, refund } = event.data;
            this.goldManager?.addGold(refund);
        });
        
        // 监听游戏开始
        eventManager.once(GameEventType.GAME_START, () => {
            console.log('[GameMain] Game started!');
        });
        
        console.log('[GameMain] Event listeners registered');
    }
    
    // 初始化管理器
    private initManagers() {
        this.weaponManager = this.getComponent('WeaponManager') as IWeaponManager;
        this.enemyManager = this.getComponent('EnemyManager') as IEnemyManager;
    }
    
    update(deltaTime: number) {
        // 处理事件队列
        eventManager.processQueue();
        
        // 更新其他系统
        // ...
    }
    
    onDestroy() {
        // 清理资源
        eventManager.clear();
        poolManager.clearAll();
    }
}
```

---

### 示例 6：调试和监控

```typescript
import { eventManager } from '../core/EventManager';
import { poolManager } from '../core/ObjectPool';

export class DebugManager extends Component {
    onLoad() {
        // 监听所有事件（调试用）
        this.logAllEvents();
        
        // 定期打印对象池状态
        this.schedule(() => {
            this.logPoolStats();
        }, 5);
    }
    
    // 记录所有事件
    private logAllEvents() {
        const eventTypes = [
            GameEventType.ENEMY_SPAWN,
            GameEventType.ENEMY_DEATH,
            GameEventType.WEAPON_PLACE,
            GameEventType.WEAPON_UPGRADE,
            GameEventType.GOLD_CHANGE
        ];
        
        eventTypes.forEach(eventType => {
            eventManager.on(eventType, (event) => {
                console.log(`[Event] ${event.type}:`, event.data);
            });
        });
    }
    
    // 记录对象池状态
    private logPoolStats() {
        console.log('[DebugManager] Pool Stats:');
        poolManager.debug();
        
        console.log('[DebugManager] Event Listeners:');
        eventManager.debug();
    }
}
```

---

## 最佳实践

### 1. 类型定义
- ✅ 始终使用接口而不是 any
- ✅ 为复杂数据结构定义接口
- ✅ 使用枚举替代魔法字符串

### 2. 事件系统
- ✅ 事件名使用枚举常量
- ✅ 事件数据使用接口定义
- ✅ 及时取消不需要的监听器
- ✅ 使用 once() 处理一次性事件

### 3. 对象池
- ✅ 为频繁创建的对象使用池
- ✅ 合理设置池的大小
- ✅ 记得归还对象到池
- ✅ 定期监控池的使用情况

### 4. 代码组织
- ✅ 单一职责原则
- ✅ 依赖注入而非硬编码
- ✅ 事件驱动而非直接调用
- ✅ 配置驱动而非写死代码

---

## 常见问题

### Q: 如何选择用事件还是直接调用？

**使用事件的场景：**
- 一对多通知（一个事件，多个监听器）
- 跨模块通信（解耦）
- 异步处理（队列）

**使用直接调用的场景：**
- 同步获取返回值
- 私有方法调用
- 性能关键路径

### Q: 对象池应该用在哪里？

**适合使用对象池：**
- ✅ 子弹、特效等频繁创建的对象
- ✅ 敌人（如果数量多）
- ✅ UI元素（如果频繁显示隐藏）

**不适合使用对象池：**
- ❌ 单例对象
- ❌ 创建成本低的简单对象
- ❌ 生命周期长的对象

### Q: 如何保证类型安全？

1. 使用接口定义契约
2. 避免使用 any 类型
3. 使用泛型提高复用性
4. 开启 TypeScript 严格模式

---

**开始使用新架构，享受优雅的代码！** 🎉

