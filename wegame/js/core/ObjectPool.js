/**
 * 对象池管理器
 * 微信小游戏性能优化：复用对象，减少 GC 压力
 */

export class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn; // 创建对象的函数
    this.resetFn = resetFn; // 重置对象的函数
    this.pool = []; // 对象池
    this.active = []; // 活跃对象列表
    this.initialSize = initialSize;
    
    // 预创建初始对象
    this.preallocate(initialSize);
  }
  
  /**
   * 预分配对象
   */
  preallocate(count) {
    for (let i = 0; i < count; i++) {
      this.pool.push(this.createFn());
    }
  }
  
  /**
   * 获取对象
   */
  acquire(...args) {
    let obj;
    
    if (this.pool.length > 0) {
      // 从池中取出
      obj = this.pool.pop();
    } else {
      // 池为空，创建新对象
      obj = this.createFn();
    }
    
    // 重置对象状态
    if (this.resetFn) {
      this.resetFn(obj, ...args);
    }
    
    // 添加到活跃列表
    this.active.push(obj);
    
    return obj;
  }
  
  /**
   * 释放对象（回收到池中）
   * 优化：使用对象引用直接删除，避免 indexOf 查找
   */
  release(obj) {
    // 优化：直接从活跃列表中移除（如果对象有引用）
    if (obj._poolIndex !== undefined) {
      const index = obj._poolIndex;
      if (index >= 0 && index < this.active.length && this.active[index] === obj) {
        // 快速删除：将最后一个元素移到当前位置
        const last = this.active.length - 1;
        if (index !== last) {
          this.active[index] = this.active[last];
          this.active[index]._poolIndex = index;
        }
        this.active.pop();
      }
    } else {
      // 回退到 indexOf（首次使用）
      const index = this.active.indexOf(obj);
      if (index > -1) {
        const last = this.active.length - 1;
        if (index !== last) {
          this.active[index] = this.active[last];
          this.active[index]._poolIndex = index;
        }
        this.active.pop();
      }
    }
    
    // 清理对象状态
    if (obj.destroyed !== undefined) {
      obj.destroyed = false;
    }
    if (obj.reset) {
      obj.reset();
    }
    obj._poolIndex = undefined;
    
    // 回收到池中
    this.pool.push(obj);
  }
  
  /**
   * 获取对象（优化版本，设置索引）
   */
  acquire(...args) {
    let obj;
    
    if (this.pool.length > 0) {
      // 从池中取出
      obj = this.pool.pop();
    } else {
      // 池为空，创建新对象
      obj = this.createFn();
    }
    
    // 重置对象状态
    if (this.resetFn) {
      this.resetFn(obj, ...args);
    }
    
    // 添加到活跃列表并设置索引
    obj._poolIndex = this.active.length;
    this.active.push(obj);
    
    return obj;
  }
  
  /**
   * 释放所有活跃对象
   */
  releaseAll() {
    while (this.active.length > 0) {
      this.release(this.active[0]);
    }
  }
  
  /**
   * 清理池（释放多余对象）
   */
  clear() {
    // 保留初始大小的对象
    while (this.pool.length > this.initialSize) {
      this.pool.pop();
    }
  }
  
  /**
   * 获取活跃对象数量
   */
  getActiveCount() {
    return this.active.length;
  }
  
  /**
   * 获取池中对象数量
   */
  getPoolSize() {
    return this.pool.length;
  }
}

