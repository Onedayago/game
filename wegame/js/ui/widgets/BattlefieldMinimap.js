/**
 * 战场小视图
 * 显示整个战场的缩略图，包括当前可见区域的指示器
 */

import { GameConfig } from '../../config/GameConfig';
import { UIConfig } from '../../config/UIConfig';
import { ColorUtils, GameColors } from '../../config/Colors';
import { GameContext } from '../../core/GameContext';
import { polyfillRoundRect } from '../../utils/CanvasUtils';
import { WeaponType, WeaponConfigs } from '../../config/WeaponConfig';

export class BattlefieldMinimap {
  // 离屏Canvas缓存（静态部分：背景、边框、网格）
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _cacheWidth = 0;
  static _cacheHeight = 0;
  static _initialized = false;
  
  // 动画时间
  static _animationTime = 0;
  
  constructor(ctx, weaponManager, enemyManager) {
    this.ctx = ctx;
    this.weaponManager = weaponManager;
    this.enemyManager = enemyManager;
    
    // 小视图尺寸
    this.width = 0;
    this.height = 0;
    this.x = 0;
    this.y = 0;
    
    // 点击处理
    this.onClickCallback = null;
    
    // 拖拽相关
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.worldStartX = 0;
    this.worldStartY = 0;
  }
  
  /**
   * 更新动画
   */
  static updateAnimation(deltaTime) {
    this._animationTime += deltaTime * 1000;
  }
  
  /**
   * 初始化
   */
  init() {
    // 计算小视图尺寸和位置
    const windowWidth = GameConfig.DESIGN_WIDTH;
    const windowHeight = GameConfig.DESIGN_HEIGHT;
    
    // 小视图宽度固定为 3 个格子的宽度
    this.width = GameConfig.CELL_SIZE * 3;
    // 小视图高度固定为 1.5 个格子的高度
    this.height = GameConfig.CELL_SIZE * 1.5;
    
    // 位置：左下角，留出边距
    const margin = UIConfig.MINIMAP_MARGIN;
    this.x = margin;
    this.y = windowHeight - this.height - UIConfig.MINIMAP_BOTTOM_OFFSET;
    
    // 初始化静态部分缓存
    this.initStaticCache();
  }
  
  /**
   * 初始化静态部分缓存（背景、边框、网格）
   */
  initStaticCache() {
    // 如果已经初始化且尺寸相同，直接返回
    if (BattlefieldMinimap._initialized && 
        BattlefieldMinimap._cacheWidth === this.width && 
        BattlefieldMinimap._cacheHeight === this.height) {
      return;
    }
    
    BattlefieldMinimap._cachedCanvas = wx.createCanvas();
    BattlefieldMinimap._cachedCanvas.width = this.width;
    BattlefieldMinimap._cachedCanvas.height = this.height;
    
    BattlefieldMinimap._cachedCtx = BattlefieldMinimap._cachedCanvas.getContext('2d');
    BattlefieldMinimap._cacheWidth = this.width;
    BattlefieldMinimap._cacheHeight = this.height;
    
    BattlefieldMinimap._cachedCtx.clearRect(0, 0, this.width, this.height);
    
    this.drawStaticToCache(BattlefieldMinimap._cachedCtx, this.width, this.height);
    
    BattlefieldMinimap._initialized = true;
  }
  
  /**
   * 绘制静态部分到缓存Canvas（背景、边框、网格）
   */
  drawStaticToCache(ctx, width, height) {
    polyfillRoundRect(ctx);
    
    const radius = UIConfig.PANEL_RADIUS_SMALL;
    
    // 绘制阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;
    
    // 绘制背景（渐变）
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, ColorUtils.hexToCanvas(0x1a1a2e, 0.85));
    bgGradient.addColorStop(1, ColorUtils.hexToCanvas(0x0f0f1e, 0.9));
    ctx.fillStyle = bgGradient;
    ctx.roundRect(0, 0, width, height, radius);
    ctx.fill();
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // 绘制边框（发光效果）
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.9);
    ctx.lineWidth = 2.5;
    ctx.roundRect(0, 0, width, height, radius);
    ctx.stroke();
    
    // 绘制内边框（高光）
    ctx.strokeStyle = ColorUtils.hexToCanvas(0xffffff, 0.2);
    ctx.lineWidth = 1;
    ctx.roundRect(1, 1, width - 2, height - 2, radius - 1);
    ctx.stroke();
    
    // 计算缩放比例
    const scaleX = width / GameConfig.BATTLE_WIDTH;
    const scaleY = height / (GameConfig.BATTLE_ROWS * GameConfig.CELL_SIZE);
    
    // 绘制网格（优化：减少绘制操作，使用更粗的线条）
    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.GRID_LINE, 0.2);
    ctx.lineWidth = 0.5;
    
    // 优化：减少网格线数量，只绘制主要网格
    const cols = Math.min(GameConfig.BATTLE_COLS, 20); // 最多20条垂直线
    const stepCol = Math.max(1, Math.floor(GameConfig.BATTLE_COLS / cols));
    for (let col = 0; col <= cols; col += stepCol) {
      const x = col * GameConfig.CELL_SIZE * scaleX;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // 水平线数量较少，全部绘制
    const rows = GameConfig.BATTLE_ROWS;
    for (let row = 0; row <= rows; row++) {
      const y = row * GameConfig.CELL_SIZE * scaleY;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }
  
  /**
   * 从缓存渲染静态部分
   */
  renderStaticFromCache() {
    if (!BattlefieldMinimap._cachedCanvas || !BattlefieldMinimap._initialized) {
      return false;
    }
    
    this.ctx.drawImage(
      BattlefieldMinimap._cachedCanvas,
      this.x,
      this.y,
      this.width,
      this.height
    );
    
    return true;
  }
  
  /**
   * 设置点击回调
   */
  setOnClick(callback) {
    this.onClickCallback = callback;
  }
  
  /**
   * 判断点是否在组件边界内（适配新事件系统）
   * @param {number} x - 点的 X 坐标
   * @param {number} y - 点的 Y 坐标
   * @returns {boolean} 是否在边界内
   */
  isPointInBounds(x, y) {
    return this.isPointInMinimap(x, y);
  }
  
  /**
   * 检查点击是否在小视图内
   */
  isPointInMinimap(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
  }
  
  /**
   * 处理点击
   */
  handleClick(x, y) {
    return this.onTouchStart(x, y);
  }
  
  /**
   * 触摸开始（适配新事件系统：支持坐标参数或事件对象）
   * @param {Object|number} eOrX - 事件对象或 X 坐标
   * @param {number} [y] - Y 坐标（如果第一个参数是 X）
   * @returns {boolean} 是否处理了事件
   */
  onTouchStart(eOrX, y) {
    // 支持两种调用方式：坐标参数 (x, y) 或事件对象 e
    let x, touchY;
    if (typeof eOrX === 'number' && typeof y === 'number') {
      // 新事件系统：直接传入坐标
      x = eOrX;
      touchY = y;
    } else {
      // 旧事件系统：从事件对象提取坐标
      const e = eOrX;
      const touch = e.touches && e.touches[0] ? e.touches[0] : e;
      if (!touch) return false;
      x = touch.x || touch.clientX || e.x || 0;
      touchY = touch.y || touch.clientY || e.y || 0;
    }
    
    if (!this.isPointInMinimap(x, touchY)) {
      return false;
    }
    
    // 开始拖拽
    this.isDragging = true;
    this.dragStartX = x;
    this.dragStartY = touchY;
    const gameContext = GameContext.getInstance();
    this.worldStartX = gameContext ? gameContext.worldOffsetX : 0;
    this.worldStartY = gameContext ? gameContext.worldOffsetY : 0;
    
    return true;
  }
  
  /**
   * 触摸移动（适配新事件系统：支持坐标参数或事件对象）
   * @param {Object|number} eOrX - 事件对象或 X 坐标
   * @param {number} [y] - Y 坐标（如果第一个参数是 X）
   * @returns {boolean} 是否处理了事件
   */
  onTouchMove(eOrX, y) {
    if (!this.isDragging) return false;
    
    // 支持两种调用方式：坐标参数 (x, y) 或事件对象 e
    let x, touchY;
    if (typeof eOrX === 'number' && typeof y === 'number') {
      // 新事件系统：直接传入坐标
      x = eOrX;
      touchY = y;
    } else {
      // 旧事件系统：从事件对象提取坐标
      const e = eOrX;
      const touch = e.touches && e.touches[0] ? e.touches[0] : e;
      if (!touch) return false;
      x = touch.x || touch.clientX || e.x || 0;
      touchY = touch.y || touch.clientY || e.y || 0;
    }
    const dx = x - this.dragStartX;
    const dy = touchY - this.dragStartY;
    
    // 计算缩放比例
    const scaleX = this.width / GameConfig.BATTLE_WIDTH;
    const scaleY = this.height / GameConfig.BATTLE_HEIGHT;
    
    // 将拖拽距离转换为战场偏移
    // 在小地图上向右拖拽（dx > 0），应该显示更多右侧内容，所以 worldOffsetX 应该增加
    const deltaBattleX = dx / scaleX;
    const targetWorldOffsetX = this.worldStartX + deltaBattleX;
    
    // 在小地图上向下拖拽（dy > 0），应该显示更多下方内容，所以 worldOffsetY 应该增加
    const deltaBattleY = dy / scaleY;
    const targetWorldOffsetY = this.worldStartY + deltaBattleY;
    
    // 限制在有效范围内
    const { minX, maxX } = this.calculatePanBounds();
    const clampedOffsetX = Math.max(minX, Math.min(maxX, targetWorldOffsetX));
    
    const { minY, maxY } = this.calculatePanBoundsY();
    const clampedOffsetY = Math.max(minY, Math.min(maxY, targetWorldOffsetY));
    
    // 更新世界偏移
    const gameContext = GameContext.getInstance();
    if (gameContext) {
      gameContext.worldOffsetX = clampedOffsetX;
      gameContext.worldOffsetY = clampedOffsetY;
    }
    
    return true;
  }
  
  /**
   * 触摸结束（适配新事件系统：支持坐标参数或事件对象）
   * @param {Object|number} eOrX - 事件对象或 X 坐标
   * @param {number} [y] - Y 坐标（如果第一个参数是 X）
   * @returns {boolean} 是否处理了事件
   */
  onTouchEnd(eOrX, y) {
    if (this.isDragging) {
      this.isDragging = false;
      return true;
    }
    return false;
  }
  
  /**
   * 计算拖动边界（X方向，与 GameInputHandler 中的逻辑一致）
   */
  calculatePanBounds() {
    const minX = 0;
    const maxX = Math.max(0, GameConfig.BATTLE_WIDTH - GameConfig.DESIGN_WIDTH);
    return { minX, maxX };
  }
  
  /**
   * 计算拖动边界（Y方向，与 GameInputHandler 中的逻辑一致）
   */
  calculatePanBoundsY() {
    const minY = 0;
    const maxY = Math.max(0, GameConfig.BATTLE_HEIGHT - GameConfig.DESIGN_HEIGHT);
    return { minY, maxY };
  }
  
  /**
   * 渲染小视图（美化版：脉冲波、射程圆圈、拖尾轨迹、发光标记）
   */
  render() {
    
    const gameContext = GameContext.getInstance();
    if (!gameContext || !gameContext.gameStarted) {
      return;
    }
    
    this.ctx.save();
    
    // 使用缓存渲染静态部分（背景、边框、网格）
    this.renderStaticFromCache();
    
    // 计算缩放比例（用于动态部分）
    const scaleX = this.width / GameConfig.BATTLE_WIDTH;
    const scaleY = this.height / GameConfig.BATTLE_HEIGHT;
    
    // 绘制武器（简单方块）
    if (this.weaponManager) {
      const weapons = this.weaponManager.getWeapons();
      for (const weapon of weapons) {
        if (weapon && !weapon.destroyed) {
          const minimapX = this.x + weapon.x * scaleX;
          const minimapY = this.y + weapon.y * scaleY;
          const size = UIConfig.MINIMAP_WEAPON_SIZE;
          
          // 根据武器类型选择颜色
          let weaponColor = GameColors.LASER_TOWER;
          if (weapon.weaponType === WeaponType.ROCKET) {
            weaponColor = GameColors.ROCKET_TOWER;
          } else if (weapon.weaponType === WeaponType.CANNON) {
            weaponColor = GameColors.CANNON_TOWER;
          } else if (weapon.weaponType === WeaponType.SNIPER) {
            weaponColor = GameColors.SNIPER_TOWER;
          }
          
          // 绘制武器图标（小方块）
          this.ctx.fillStyle = ColorUtils.hexToCanvas(weaponColor, 0.9);
          this.ctx.fillRect(minimapX - size, minimapY - size, size * 2, size * 2);
        }
      }
    }
    
    // 绘制敌人（简单圆点）
    if (this.enemyManager) {
      const enemies = this.enemyManager.getEnemies();
      for (const enemy of enemies) {
        if (enemy && !enemy.destroyed && !enemy.finished) {
          const minimapX = this.x + enemy.x * scaleX;
          const minimapY = this.y + enemy.y * scaleY;
          const size = UIConfig.MINIMAP_ENEMY_SIZE;
          
          // 绘制敌人图标（小圆点）
          this.ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_TANK, 0.9);
          this.ctx.beginPath();
          this.ctx.arc(minimapX, minimapY, size, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }
    
    // 绘制当前可见区域的指示器（简单矩形框）
    const worldOffsetX = gameContext.worldOffsetX;
    const worldOffsetY = gameContext.worldOffsetY;
    
    // 计算可见区域在小视图中的位置
    const visibleStartX = this.x + worldOffsetX * scaleX;
    const visibleEndX = this.x + (worldOffsetX + GameConfig.DESIGN_WIDTH) * scaleX;
    const visibleStartY = this.y + worldOffsetY * scaleY;
    const visibleEndY = this.y + (worldOffsetY + GameConfig.DESIGN_HEIGHT) * scaleY;
    const visibleWidth = visibleEndX - visibleStartX;
    const visibleHeight = visibleEndY - visibleStartY;
    
    // 绘制边框
    this.ctx.strokeStyle = ColorUtils.hexToCanvas(0xffff00, 0.8);
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(visibleStartX, visibleStartY, visibleWidth, visibleHeight);
    
    this.ctx.restore();
  }
  
}


