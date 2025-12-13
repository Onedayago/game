/**
 * 性能监控器
 * 微信小游戏性能优化：监控 FPS 和性能指标，定位卡顿问题
 */

export class PerformanceMonitor {
  constructor() {
    this.fps = 60;
    this.frameCount = 0;
    this.lastTime = Date.now();
    this.fpsUpdateInterval = 1000; // 每秒更新一次 FPS
    this.fpsTimer = 0;
    
    // 性能指标
    this.updateTime = 0;
    this.renderTime = 0;
    this.maxUpdateTime = 0;
    this.maxRenderTime = 0;
    
    // 详细性能指标（用于定位卡顿）
    this.detailedMetrics = {
      weaponManagerUpdate: 0,
      weaponManagerRender: 0,
      enemyManagerUpdate: 0,
      enemyManagerRender: 0,
      particleManagerUpdate: 0,
      particleManagerRender: 0,
      backgroundRender: 0,
      uiRender: 0,
      batchTargetFind: 0
    };
    
    // 对象数量统计
    this.objectCounts = {
      weapons: 0,
      enemies: 0,
      rockets: 0,
      bullets: 0,
      particles: 0
    };
    
    // 性能日志开关
    this.enableLogging = true;
    this.logInterval = 5000; // 每5秒输出一次详细日志（减少日志频率）
    this.logTimer = 0;
    
    // 性能瓶颈检测
    this.bottleneckThreshold = 5; // 超过5ms的操作会被标记为瓶颈
  }
  
  /**
   * 更新性能监控
   */
  update(deltaMS) {
    this.frameCount++;
    this.fpsTimer += deltaMS;
    this.logTimer += deltaMS;
    
    if (this.fpsTimer >= this.fpsUpdateInterval) {
      this.fps = Math.round((this.frameCount * 1000) / this.fpsTimer);
      this.frameCount = 0;
      this.fpsTimer = 0;
      
      // 输出性能警告（只在严重时输出，避免日志过多）
      if (this.fps < 20) {
        const bottleneck = this.detectBottleneck();
        console.warn(`[性能严重警告] FPS = ${this.fps}, 更新耗时 = ${this.maxUpdateTime.toFixed(2)}ms, 渲染耗时 = ${this.maxRenderTime.toFixed(2)}ms`, {
          bottleneck: bottleneck.length > 0 ? bottleneck[0] : '未知',
          objects: this.objectCounts
        });
      } else if (this.fps < 30) {
        // 轻微警告，简化输出
        console.warn(`[性能警告] FPS = ${this.fps}, 渲染耗时 = ${this.maxRenderTime.toFixed(2)}ms`);
      }
      
      // 重置最大时间
      this.maxUpdateTime = 0;
      this.maxRenderTime = 0;
    }
    
    // 输出详细性能日志
    if (this.enableLogging && this.logTimer >= this.logInterval) {
      this.logDetailedMetrics();
      this.logTimer = 0;
    }
  }
  
  /**
   * 输出详细性能指标
   */
  logDetailedMetrics() {
    // 如果性能很差，减少日志输出，避免日志本身成为瓶颈
    if (this.fps < 15) {
      // 性能极差时，只输出关键信息
      console.warn('[性能严重警告]', {
        fps: this.fps,
        renderTime: this.maxRenderTime.toFixed(2) + 'ms',
        bottleneck: this.detectBottleneck()
      });
      return;
    }
    
    const report = this.getDetailedReport();
    const bottleneck = this.detectBottleneck();
    
    // 输出性能报告（使用更简洁的格式）
    console.log('[性能报告]', {
      fps: report.fps,
      frameTime: report.frameTime,
      bottleneck: bottleneck,
      objects: report.objects
    });
    
    // 如果性能较差，输出详细警告
    if (this.fps < 45 || this.maxUpdateTime > 16 || this.maxRenderTime > 16) {
      console.warn('[性能警告]', {
        fps: this.fps,
        updateTime: this.maxUpdateTime.toFixed(2) + 'ms',
        renderTime: this.maxRenderTime.toFixed(2) + 'ms',
        detailed: report.detailed,
        objects: this.objectCounts,
        bottleneck: bottleneck
      });
    }
  }
  
  /**
   * 检测性能瓶颈
   */
  detectBottleneck() {
    const bottlenecks = [];
    
    // 检查各个操作的耗时
    for (const [key, value] of Object.entries(this.detailedMetrics)) {
      if (value > this.bottleneckThreshold) {
        bottlenecks.push({
          operation: key,
          time: value.toFixed(2) + 'ms',
          percentage: ((value / this.maxRenderTime) * 100).toFixed(1) + '%'
        });
      }
    }
    
    // 按耗时排序
    bottlenecks.sort((a, b) => parseFloat(b.time) - parseFloat(a.time));
    
    return bottlenecks;
  }
  
  /**
   * 开始测量某个操作的耗时
   */
  startMeasure(key) {
    if (!this.detailedMetrics.hasOwnProperty(key)) {
      this.detailedMetrics[key] = 0;
    }
    this[`${key}StartTime`] = performance.now();
  }
  
  /**
   * 结束测量某个操作的耗时
   */
  endMeasure(key) {
    if (this[`${key}StartTime`] !== undefined) {
      const duration = performance.now() - this[`${key}StartTime`];
      // 使用平均值而不是最大值，更准确反映性能
      const current = this.detailedMetrics[key] || 0;
      // 使用加权平均：新值占30%，旧值占70%，平滑波动
      this.detailedMetrics[key] = current * 0.7 + duration * 0.3;
      delete this[`${key}StartTime`];
    }
  }
  
  /**
   * 更新对象数量统计
   */
  updateObjectCounts(counts) {
    Object.assign(this.objectCounts, counts);
  }
  
  /**
   * 开始测量更新时间
   */
  startUpdate() {
    this.updateStartTime = performance.now();
  }
  
  /**
   * 结束测量更新时间
   */
  endUpdate() {
    if (this.updateStartTime !== undefined) {
      this.updateTime = performance.now() - this.updateStartTime;
      this.maxUpdateTime = Math.max(this.maxUpdateTime, this.updateTime);
    }
  }
  
  /**
   * 开始测量渲染时间
   */
  startRender() {
    this.renderStartTime = performance.now();
  }
  
  /**
   * 结束测量渲染时间
   */
  endRender() {
    if (this.renderStartTime !== undefined) {
      this.renderTime = performance.now() - this.renderStartTime;
      this.maxRenderTime = Math.max(this.maxRenderTime, this.renderTime);
    }
  }
  
  /**
   * 获取当前 FPS
   */
  getFPS() {
    return this.fps;
  }
  
  /**
   * 获取性能报告
   */
  getReport() {
    return {
      fps: this.fps,
      updateTime: this.updateTime.toFixed(2),
      renderTime: this.renderTime.toFixed(2),
      maxUpdateTime: this.maxUpdateTime.toFixed(2),
      maxRenderTime: this.maxRenderTime.toFixed(2)
    };
  }
  
  /**
   * 获取详细性能报告
   */
  getDetailedReport() {
    const totalRenderTime = this.maxRenderTime || 1; // 避免除零
    
    // 计算各部分的耗时占比
    const getPercentage = (time) => {
      return totalRenderTime > 0 ? ((time / totalRenderTime) * 100).toFixed(1) + '%' : '0%';
    };
    
    return {
      fps: this.fps,
      frameTime: {
        update: this.maxUpdateTime.toFixed(2) + 'ms',
        render: this.maxRenderTime.toFixed(2) + 'ms',
        total: (this.maxUpdateTime + this.maxRenderTime).toFixed(2) + 'ms'
      },
      detailed: {
        weaponManager: {
          update: this.detailedMetrics.weaponManagerUpdate.toFixed(2) + 'ms',
          render: this.detailedMetrics.weaponManagerRender.toFixed(2) + 'ms',
          renderPercent: getPercentage(this.detailedMetrics.weaponManagerRender)
        },
        enemyManager: {
          update: this.detailedMetrics.enemyManagerUpdate.toFixed(2) + 'ms',
          render: this.detailedMetrics.enemyManagerRender.toFixed(2) + 'ms',
          renderPercent: getPercentage(this.detailedMetrics.enemyManagerRender)
        },
        particleManager: {
          update: this.detailedMetrics.particleManagerUpdate.toFixed(2) + 'ms',
          render: this.detailedMetrics.particleManagerRender.toFixed(2) + 'ms',
          renderPercent: getPercentage(this.detailedMetrics.particleManagerRender)
        },
        backgroundRender: this.detailedMetrics.backgroundRender.toFixed(2) + 'ms',
        backgroundRenderPercent: getPercentage(this.detailedMetrics.backgroundRender),
        uiRender: this.detailedMetrics.uiRender.toFixed(2) + 'ms',
        uiRenderPercent: getPercentage(this.detailedMetrics.uiRender),
        batchTargetFind: this.detailedMetrics.batchTargetFind.toFixed(2) + 'ms'
      },
      objects: { ...this.objectCounts }
    };
  }
  
  /**
   * 重置所有指标
   */
  reset() {
    this.maxUpdateTime = 0;
    this.maxRenderTime = 0;
    for (const key in this.detailedMetrics) {
      this.detailedMetrics[key] = 0;
    }
  }
  
  /**
   * 获取当前性能瓶颈（实时）
   */
  getCurrentBottleneck() {
    return this.detectBottleneck();
  }
  
  /**
   * 获取性能摘要（用于快速诊断）
   */
  getPerformanceSummary() {
    const bottleneck = this.detectBottleneck();
    const topBottleneck = bottleneck.length > 0 ? bottleneck[0] : null;
    
    return {
      fps: this.fps,
      renderTime: this.maxRenderTime.toFixed(2) + 'ms',
      updateTime: this.maxUpdateTime.toFixed(2) + 'ms',
      topBottleneck: topBottleneck,
      objects: this.objectCounts
    };
  }
  
  /**
   * 启用/禁用日志
   */
  setLoggingEnabled(enabled) {
    this.enableLogging = enabled;
  }
}

