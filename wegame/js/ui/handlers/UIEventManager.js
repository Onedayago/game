/**
 * UI 事件管理器
 * 统一管理所有 UI 组件的事件处理，支持优先级和事件分发
 */

export class UIEventManager {
  /**
   * 构造函数
   */
  constructor() {
    // UI 组件列表（按优先级排序，优先级高的在前）
    // 每个组件需要实现：
    // - isPointInBounds(x, y): 判断点是否在组件内
    // - onTouchStart(x, y): 处理触摸开始（返回 true 表示已处理）
    // - onTouchMove(x, y): 处理触摸移动（可选）
    // - onTouchEnd(x, y): 处理触摸结束（可选）
    this.uiComponents = [];
    
    // 当前触摸状态
    this.touchState = {
      isActive: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      handledComponent: null // 处理了触摸事件的组件
    };
  }
  
  /**
   * 注册 UI 组件
   * @param {Object} component - UI 组件对象
   * @param {number} priority - 优先级（数字越大优先级越高，默认 0）
   */
  registerComponent(component, priority = 0) {
    // 移除已存在的相同组件
    this.unregisterComponent(component);
    
    // 添加组件并设置优先级
    component._uiEventPriority = priority;
    this.uiComponents.push(component);
    
    // 按优先级排序（优先级高的在前）
    this.uiComponents.sort((a, b) => {
      return (b._uiEventPriority || 0) - (a._uiEventPriority || 0);
    });
  }
  
  /**
   * 取消注册 UI 组件
   * @param {Object} component - UI 组件对象
   */
  unregisterComponent(component) {
    const index = this.uiComponents.indexOf(component);
    if (index !== -1) {
      this.uiComponents.splice(index, 1);
    }
  }
  
  /**
   * 清除所有注册的组件
   */
  clear() {
    this.uiComponents = [];
    this.touchState = {
      isActive: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      handledComponent: null
    };
  }
  
  /**
   * 处理触摸开始事件
   * @param {Object} e - 触摸事件对象
   * @returns {boolean} 是否处理了事件
   */
  onTouchStart(e) {
    // 提取触摸坐标
    const touch = e.touches && e.touches[0] ? e.touches[0] : e;
    if (!touch) {
      return false;
    }
    
    const x = touch.x || touch.clientX || 0;
    const y = touch.y || touch.clientY || 0;
    
    // 重置触摸状态
    this.touchState.isActive = true;
    this.touchState.startX = x;
    this.touchState.startY = y;
    this.touchState.currentX = x;
    this.touchState.currentY = y;
    this.touchState.handledComponent = null;
    
    // 按优先级遍历组件，找到第一个处理事件的组件
    for (const component of this.uiComponents) {
      // 检查组件是否可见且包含触摸点
      if (component.visible !== false && component.isPointInBounds && component.isPointInBounds(x, y)) {
        // 尝试让组件处理事件
        if (component.onTouchStart) {
          const handled = component.onTouchStart(x, y);
          if (handled) {
            this.touchState.handledComponent = component;
            return true;
          }
        } else if (component.isPointInBounds(x, y)) {
          // 如果组件包含触摸点但没有 onTouchStart 方法，也认为已处理（阻止穿透）
          this.touchState.handledComponent = component;
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * 处理触摸移动事件
   * @param {Object} e - 触摸事件对象
   * @returns {boolean} 是否处理了事件
   */
  onTouchMove(e) {
    if (!this.touchState.isActive) {
      return false;
    }
    
    // 提取触摸坐标
    const touch = e.touches && e.touches[0] ? e.touches[0] : e;
    if (!touch) {
      return false;
    }
    
    const x = touch.x || touch.clientX || 0;
    const y = touch.y || touch.clientY || 0;
    
    this.touchState.currentX = x;
    this.touchState.currentY = y;
    
    // 如果已经有组件处理了触摸开始事件，继续让它处理移动事件
    if (this.touchState.handledComponent && this.touchState.handledComponent.onTouchMove) {
      return this.touchState.handledComponent.onTouchMove(x, y);
    }
    
    // 否则，按优先级查找处理移动事件的组件
    for (const component of this.uiComponents) {
      if (component.visible !== false && component.isPointInBounds && component.isPointInBounds(x, y)) {
        if (component.onTouchMove) {
          const handled = component.onTouchMove(x, y);
          if (handled) {
            return true;
          }
        }
      }
    }
    
    return false;
  }
  
  /**
   * 处理触摸结束事件
   * @param {Object} e - 触摸事件对象
   * @returns {boolean} 是否处理了事件
   */
  onTouchEnd(e) {
    if (!this.touchState.isActive) {
      return false;
    }
    
    // 提取触摸坐标
    const touch = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : e;
    if (!touch) {
      return false;
    }
    
    const x = touch.x || touch.clientX || 0;
    const y = touch.y || touch.clientY || 0;
    
    this.touchState.currentX = x;
    this.touchState.currentY = y;
    
    // 如果已经有组件处理了触摸开始事件，继续让它处理结束事件
    if (this.touchState.handledComponent && this.touchState.handledComponent.onTouchEnd) {
      const handled = this.touchState.handledComponent.onTouchEnd(x, y);
      this.touchState.isActive = false;
      this.touchState.handledComponent = null;
      return handled;
    }
    
    // 否则，按优先级查找处理结束事件的组件
    for (const component of this.uiComponents) {
      if (component.visible !== false && component.isPointInBounds && component.isPointInBounds(x, y)) {
        if (component.onTouchEnd) {
          const handled = component.onTouchEnd(x, y);
          if (handled) {
            this.touchState.isActive = false;
            return true;
          }
        }
      }
    }
    
    this.touchState.isActive = false;
    this.touchState.handledComponent = null;
    return false;
  }
  
  /**
   * 获取当前触摸状态
   * @returns {Object} 触摸状态对象
   */
  getTouchState() {
    return { ...this.touchState };
  }
}

