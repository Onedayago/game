/**
 * UI 组件适配器
 * 将现有的 UI 组件适配到新的事件系统
 */

export class UIComponentAdapter {
  /**
   * 为现有 UI 组件创建适配器
   * @param {Object} component - 现有的 UI 组件
   * @param {Function} getBounds - 获取组件边界的函数，返回 {x, y, width, height}
   * @param {Function} onTouchStart - 触摸开始处理函数，参数 (x, y)，返回 boolean
   * @param {Function} onTouchMove - 触摸移动处理函数（可选），参数 (x, y)，返回 boolean
   * @param {Function} onTouchEnd - 触摸结束处理函数（可选），参数 (x, y)，返回 boolean
   * @returns {Object} 适配后的组件对象
   */
  static createAdapter(component, getBounds, onTouchStart, onTouchMove = null, onTouchEnd = null) {
    return {
      // 保持原组件的引用
      _originalComponent: component,
      
      // 实现 isPointInBounds 方法
      isPointInBounds(x, y) {
        if (component.visible === false) {
          return false;
        }
        const bounds = getBounds();
        return x >= bounds.x && 
               x <= bounds.x + bounds.width && 
               y >= bounds.y && 
               y <= bounds.y + bounds.height;
      },
      
      // 实现 onTouchStart 方法
      onTouchStart(x, y) {
        if (onTouchStart) {
          return onTouchStart(x, y);
        }
        return false;
      },
      
      // 实现 onTouchMove 方法
      onTouchMove(x, y) {
        if (onTouchMove) {
          return onTouchMove(x, y);
        }
        return false;
      },
      
      // 实现 onTouchEnd 方法
      onTouchEnd(x, y) {
        if (onTouchEnd) {
          return onTouchEnd(x, y);
        }
        return false;
      },
      
      // 保持 visible 属性
      get visible() {
        return component.visible !== false;
      }
    };
  }
}

