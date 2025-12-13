/**
 * 事件管理器
 * 实现发布-订阅模式，解耦组件间通信
 */

import { IGameEvent, EventListener } from '../types/Interfaces';
import { GameEventType } from '../types/Enums';

export class EventManager {
    private static instance: EventManager;
    private listeners: Map<string, EventListener[]> = new Map();
    private eventQueue: IGameEvent[] = [];
    private isProcessing: boolean = false;
    
    /**
     * 获取单例
     */
    static getInstance(): EventManager {
        if (!EventManager.instance) {
            EventManager.instance = new EventManager();
        }
        return EventManager.instance;
    }
    
    /**
     * 订阅事件
     */
    on(eventType: string | GameEventType, listener: EventListener): void {
        const type = eventType.toString();
        
        if (!this.listeners.has(type)) {
            this.listeners.set(type, []);
        }
        
        const listeners = this.listeners.get(type)!;
        if (!listeners.includes(listener)) {
            listeners.push(listener);
        }
    }
    
    /**
     * 取消订阅
     */
    off(eventType: string | GameEventType, listener: EventListener): void {
        const type = eventType.toString();
        const listeners = this.listeners.get(type);
        
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
    
    /**
     * 一次性订阅
     */
    once(eventType: string | GameEventType, listener: EventListener): void {
        const type = eventType.toString();
        const wrappedListener: EventListener = (event: IGameEvent) => {
            listener(event);
            this.off(type, wrappedListener);
        };
        
        this.on(type, wrappedListener);
    }
    
    /**
     * 发送事件（立即执行）
     */
    emit(eventType: string | GameEventType, data?: any): void {
        const type = eventType.toString();
        const event: IGameEvent = { type, data };
        
        const listeners = this.listeners.get(type);
        if (listeners) {
            // 复制数组，避免在回调中修改监听器列表导致问题
            const listenersCopy = [...listeners];
            listenersCopy.forEach(listener => {
                try {
                    listener(event);
                } catch (error) {
                    console.error(`[EventManager] Error in listener for ${type}:`, error);
                }
            });
        }
    }
    
    /**
     * 延迟发送事件（加入队列）
     */
    enqueue(eventType: string | GameEventType, data?: any): void {
        const type = eventType.toString();
        this.eventQueue.push({ type, data });
    }
    
    /**
     * 处理事件队列
     */
    processQueue(): void {
        if (this.isProcessing || this.eventQueue.length === 0) {
            return;
        }
        
        this.isProcessing = true;
        
        while (this.eventQueue.length > 0) {
            const event = this.eventQueue.shift()!;
            this.emit(event.type, event.data);
        }
        
        this.isProcessing = false;
    }
    
    /**
     * 清空事件队列
     */
    clearQueue(): void {
        this.eventQueue = [];
    }
    
    /**
     * 清空所有监听器
     */
    clear(): void {
        this.listeners.clear();
        this.eventQueue = [];
    }
    
    /**
     * 获取事件监听器数量
     */
    getListenerCount(eventType: string | GameEventType): number {
        const type = eventType.toString();
        const listeners = this.listeners.get(type);
        return listeners ? listeners.length : 0;
    }
    
    /**
     * 检查是否有监听器
     */
    hasListeners(eventType: string | GameEventType): boolean {
        const type = eventType.toString();
        return this.getListenerCount(type) > 0;
    }
    
    /**
     * 获取所有事件类型
     */
    getEventTypes(): string[] {
        return Array.from(this.listeners.keys());
    }
    
    /**
     * 调试信息
     */
    debug(): void {
        console.log('[EventManager] Debug Info:');
        console.log(`  Total event types: ${this.listeners.size}`);
        console.log(`  Event queue length: ${this.eventQueue.length}`);
        
        this.listeners.forEach((listeners, type) => {
            console.log(`  ${type}: ${listeners.length} listeners`);
        });
    }
}

// 导出单例
export const eventManager = EventManager.getInstance();

