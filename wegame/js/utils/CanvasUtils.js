/**
 * Canvas 工具类
 * 提供 Canvas 2D API 的扩展方法
 */

/**
 * 为 Canvas 2D Context 添加 roundRect 方法（如果不存在）
 * 注意：微信小游戏的原生 roundRect 可能期望 radii 为数组格式
 */
export function polyfillRoundRect(ctx) {
  // 检查是否已经有原生 roundRect 方法
  const hasNativeRoundRect = ctx.roundRect && typeof ctx.roundRect === 'function';
  
  if (hasNativeRoundRect) {
    // 如果已经有原生方法，包装它以统一参数格式
    // 微信小游戏的原生 roundRect 可能期望 radii 为数组格式
    const originalRoundRect = ctx.roundRect.bind(ctx);
    ctx.roundRect = function(x, y, width, height, radius) {
      // 将数字转换为数组格式 [topLeft, topRight, bottomRight, bottomLeft]
      let radii;
      if (typeof radius === 'number') {
        // 如果是数字，转换为数组（所有角相同）
        radii = [radius, radius, radius, radius];
      } else if (Array.isArray(radius)) {
        // 如果已经是数组，直接使用
        radii = radius;
      } else if (radius && typeof radius === 'object') {
        // 如果是对象，转换为数组
        radii = [
          radius.tl || radius.topLeft || 0,
          radius.tr || radius.topRight || 0,
          radius.br || radius.bottomRight || 0,
          radius.bl || radius.bottomLeft || 0
        ];
      } else {
        // 默认使用 0
        radii = [0, 0, 0, 0];
      }
      
      // 调用原生方法
      try {
        originalRoundRect(x, y, width, height, radii);
      } catch (e) {
        // 如果数组格式失败，尝试数字格式
        if (typeof radius === 'number') {
          originalRoundRect(x, y, width, height, radius);
        } else {
          throw e;
        }
      }
    };
  } else {
    // 如果没有原生方法，使用 polyfill
    ctx.roundRect = function(x, y, width, height, radius) {
      // 确保 radius 是数字
      const r = typeof radius === 'number' ? radius : (radius?.tl || radius?.topLeft || 0);
      
      this.beginPath();
      this.moveTo(x + r, y);
      this.lineTo(x + width - r, y);
      this.quadraticCurveTo(x + width, y, x + width, y + r);
      this.lineTo(x + width, y + height - r);
      this.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
      this.lineTo(x + r, y + height);
      this.quadraticCurveTo(x, y + height, x, y + height - r);
      this.lineTo(x, y + r);
      this.quadraticCurveTo(x, y, x + r, y);
      this.closePath();
    };
  }
}

/**
 * 初始化 Canvas 工具
 */
export function initCanvasUtils(ctx) {
  polyfillRoundRect(ctx);
}

