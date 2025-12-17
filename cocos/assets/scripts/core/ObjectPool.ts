/**
 * 对象池基类
 * 用于管理频繁创建和销毁的对象，减少GC压力
 */

import { Node, Prefab, instantiate } from 'cc';
import { IObjectPool } from '../types/Interfaces';

export class ObjectPool<T> implements IObjectPool<T> {
    private pool: T[] = [];
    private activeObjects: Set<T> = new Set();
    private createFunc: () => T;
    private resetFunc?: (obj: T) => void;
    private maxSize: number;
    
    /**
     * 构造函数
     * @param createFunc 创建对象的函数
     * @param resetFunc 重置对象的函数（可选）
     * @param initialSize 初始大小
     * @param maxSize 最大大小
     */
    constructor(
        createFunc: () => T,
        resetFunc?: (obj: T) => void,
        initialSize: number = 10,
        maxSize: number = 100
    ) {
        this.createFunc = createFunc;
        this.resetFunc = resetFunc;
        this.maxSize = maxSize;
        
        // 预创建对象
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFunc());
        }
    }
    
    /**
     * 从池中获取对象
     */
    get(): T | null {
        let obj: T;
        
        if (this.pool.length > 0) {
            obj = this.pool.pop()!;
        } else if (this.activeObjects.size < this.maxSize) {
            obj = this.createFunc();
        } else {
            console.warn('[ObjectPool] Pool is full, cannot create more objects');
            return null;
        }
        
        this.activeObjects.add(obj);
        return obj;
    }
    
    /**
     * 归还对象到池
     */
    release(obj: T): void {
        if (!this.activeObjects.has(obj)) {
            console.warn('[ObjectPool] Trying to release object not from pool');
            return;
        }
        
        this.activeObjects.delete(obj);
        
        // 重置对象
        if (this.resetFunc) {
            this.resetFunc(obj);
        }
        
        // 放回池中
        if (this.pool.length < this.maxSize) {
            this.pool.push(obj);
        }
    }
    
    /**
     * 清空池
     */
    clear(): void {
        this.pool = [];
        this.activeObjects.clear();
    }
    
    /**
     * 获取池的大小
     */
    getSize(): number {
        return this.pool.length;
    }
    
    /**
     * 获取活跃对象数量
     */
    getActiveCount(): number {
        return this.activeObjects.size;
    }
    
    /**
     * 获取总容量
     */
    getTotalCapacity(): number {
        return this.pool.length + this.activeObjects.size;
    }
}

/**
 * Cocos Node 对象池
 */
export class NodePool implements IObjectPool<Node> {
    private pool: Node[] = [];
    private activeNodes: Set<Node> = new Set();
    private prefab: Prefab;
    private maxSize: number;
    
    constructor(prefab: Prefab, initialSize: number = 10, maxSize: number = 100) {
        this.prefab = prefab;
        this.maxSize = maxSize;
        
        // 预创建节点
        for (let i = 0; i < initialSize; i++) {
            const node = instantiate(this.prefab);
            node.active = false;
            this.pool.push(node);
        }
    }
    
    /**
     * 获取节点
     */
    get(): Node | null {
        let node: Node;
        
        if (this.pool.length > 0) {
            node = this.pool.pop()!;
        } else if (this.activeNodes.size < this.maxSize) {
            node = instantiate(this.prefab);
        } else {
            console.warn('[NodePool] Pool is full');
            return null;
        }
        
        node.active = true;
        this.activeNodes.add(node);
        return node;
    }
    
    /**
     * 归还节点
     */
    release(node: Node): void {
        if (!this.activeNodes.has(node)) {
            return;
        }
        
        this.activeNodes.delete(node);
        node.active = false;
        node.removeFromParent();
        
        if (this.pool.length < this.maxSize) {
            this.pool.push(node);
        } else {
            node.destroy();
        }
    }
    
    /**
     * 清空池
     */
    clear(): void {
        this.pool.forEach(node => node.destroy());
        this.activeNodes.forEach(node => node.destroy());
        this.pool = [];
        this.activeNodes.clear();
    }
    
    /**
     * 获取池的大小
     */
    getSize(): number {
        return this.pool.length;
    }
    
    /**
     * 获取活跃节点数量
     */
    getActiveCount(): number {
        return this.activeNodes.size;
    }
}

/**
 * 对象池管理器
 * 统一管理所有对象池
 */
export class PoolManager {
    private static instance: PoolManager;
    private pools: Map<string, IObjectPool<any>> = new Map();
    
    static getInstance(): PoolManager {
        if (!PoolManager.instance) {
            PoolManager.instance = new PoolManager();
        }
        return PoolManager.instance;
    }
    
    /**
     * 注册对象池
     */
    registerPool(name: string, pool: IObjectPool<any>): void {
        if (this.pools.has(name)) {
            console.warn(`[PoolManager] Pool ${name} already exists`);
            return;
        }
        
        this.pools.set(name, pool);
    }
    
    /**
     * 获取对象池
     */
    getPool<T>(name: string): IObjectPool<T> | null {
        return this.pools.get(name) || null;
    }
    
    /**
     * 从池中获取对象
     */
    get<T>(poolName: string): T | null {
        const pool = this.getPool<T>(poolName);
        return pool ? pool.get() : null;
    }
    
    /**
     * 归还对象到池
     */
    release<T>(poolName: string, obj: T): void {
        const pool = this.getPool<T>(poolName);
        if (pool) {
            pool.release(obj);
        }
    }
    
    /**
     * 清空所有池
     */
    clearAll(): void {
        this.pools.forEach(pool => pool.clear());
        this.pools.clear();
    }
    
    /**
     * 获取统计信息
     */
    getStats(): { [key: string]: { size: number, active: number } } {
        const stats: { [key: string]: { size: number, active: number } } = {};
        
        this.pools.forEach((pool, name) => {
            stats[name] = {
                size: pool.getSize(),
                active: pool.getActiveCount()
            };
        });
        
        return stats;
    }
    
    /**
     * 调试信息
     */
    debug(): void {
        console.log('[PoolManager] Stats:');
        const stats = this.getStats();
        
        Object.keys(stats).forEach(name => {
            const { size, active } = stats[name];
            console.log(`  ${name}: ${active} active, ${size} in pool`);
        });
    }
}

// 导出单例
export const poolManager = PoolManager.getInstance();

