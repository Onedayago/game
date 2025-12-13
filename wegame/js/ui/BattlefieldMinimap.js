/**
 * 战场小视图
 * 显示整个战场的缩略图，包括当前可见区域的指示器
 */

import { GameConfig } from '../config/GameConfig';
import { UIConfig } from '../config/UIConfig';
import { ColorUtils, GameColors } from '../config/Colors';
import { GameContext } from '../core/GameContext';
import { polyfillRoundRect } from '../utils/CanvasUtils';
import { WeaponType } from '../config/WeaponConfig';

export class BattlefieldMinimap {
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
    this.worldStartX = 0;
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
    
    // 位置：右下角，留出边距
    const margin = 10;
    this.x = windowWidth - this.width - margin;
    this.y = windowHeight - this.height - margin;
  }
  
  /**
   * 设置点击回调
   */
  setOnClick(callback) {
    this.onClickCallback = callback;
  }
  
  /**
   * 检查点击是否在小视图内
   */
  isPointInMinimap(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
  }
  
  /**
   * 处理点击（兼容旧接口）
   */
  handleClick(x, y) {
    return this.onTouchStart({ x, y });
  }
  
  /**
   * 触摸开始
   */
  onTouchStart(e) {
    const touch = e.touches && e.touches[0] ? e.touches[0] : e;
    if (!touch) return false;
    
    const x = touch.x || touch.clientX || e.x || 0;
    const y = touch.y || touch.clientY || e.y || 0;
    
    if (!this.isPointInMinimap(x, y)) {
      return false;
    }
    
    // 开始拖拽
    this.isDragging = true;
    this.dragStartX = x;
    const gameContext = GameContext.getInstance();
    this.worldStartX = gameContext ? gameContext.worldOffsetX : 0;
    
    return true;
  }
  
  /**
   * 触摸移动
   */
  onTouchMove(e) {
    if (!this.isDragging) return false;
    
    const touch = e.touches && e.touches[0] ? e.touches[0] : e;
    if (!touch) return false;
    
    const x = touch.x || touch.clientX || e.x || 0;
    const dx = x - this.dragStartX;
    
    // 计算缩放比例
    const scaleX = this.width / GameConfig.BATTLE_WIDTH;
    
    // 将拖拽距离转换为战场偏移
    // 在小地图上向右拖拽（dx > 0），应该显示更多右侧内容，所以 worldOffsetX 应该增加
    const deltaBattleX = dx / scaleX;
    const targetWorldOffsetX = this.worldStartX + deltaBattleX;
    
    // 限制在有效范围内
    const { minX, maxX } = this.calculatePanBounds();
    const clampedOffsetX = Math.max(minX, Math.min(maxX, targetWorldOffsetX));
    
    // 更新世界偏移
    const gameContext = GameContext.getInstance();
    if (gameContext) {
      gameContext.worldOffsetX = clampedOffsetX;
    }
    
    return true;
  }
  
  /**
   * 触摸结束
   */
  onTouchEnd(e) {
    if (this.isDragging) {
      this.isDragging = false;
      return true;
    }
    return false;
  }
  
  /**
   * 计算拖动边界（与 GameInputHandler 中的逻辑一致）
   */
  calculatePanBounds() {
    const minX = 0;
    const maxX = Math.max(0, GameConfig.BATTLE_WIDTH - GameConfig.DESIGN_WIDTH);
    return { minX, maxX };
  }
  
  /**
   * 渲染小视图（美化版，优化：减少不必要的重绘）
   */
  render() {
    const gameContext = GameContext.getInstance();
    if (!gameContext || !gameContext.gameStarted) {
      return;
    }
    
    // 优化：缓存一些计算结果，避免重复计算
    this.ctx.save();
    polyfillRoundRect(this.ctx);
    
    const radius = 8; // 圆角半径
    
    // 绘制阴影
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 15;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 5;
    
    // 绘制背景（渐变）
    const bgGradient = this.ctx.createLinearGradient(
      this.x, this.y,
      this.x, this.y + this.height
    );
    bgGradient.addColorStop(0, ColorUtils.hexToCanvas(0x1a1a2e, 0.85));
    bgGradient.addColorStop(1, ColorUtils.hexToCanvas(0x0f0f1e, 0.9));
    this.ctx.fillStyle = bgGradient;
    this.ctx.roundRect(this.x, this.y, this.width, this.height, radius);
    this.ctx.fill();
    
    // 重置阴影
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    // 绘制边框（发光效果）
    this.ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.9);
    this.ctx.lineWidth = 2.5;
    this.ctx.roundRect(this.x, this.y, this.width, this.height, radius);
    this.ctx.stroke();
    
    // 绘制内边框（高光）
    this.ctx.strokeStyle = ColorUtils.hexToCanvas(0xffffff, 0.2);
    this.ctx.lineWidth = 1;
    this.ctx.roundRect(this.x + 1, this.y + 1, this.width - 2, this.height - 2, radius - 1);
    this.ctx.stroke();
    
    // 计算缩放比例
    const scaleX = this.width / GameConfig.BATTLE_WIDTH;
    const scaleY = this.height / (GameConfig.BATTLE_ROWS * GameConfig.CELL_SIZE);
    
    // 绘制网格（优化：减少绘制操作，使用更粗的线条）
    this.ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.GRID_LINE, 0.2);
    this.ctx.lineWidth = 0.5;
    
    // 优化：减少网格线数量，只绘制主要网格
    const cols = Math.min(GameConfig.BATTLE_COLS, 20); // 最多20条垂直线
    const stepCol = Math.max(1, Math.floor(GameConfig.BATTLE_COLS / cols));
    for (let col = 0; col <= cols; col += stepCol) {
      const x = this.x + col * GameConfig.CELL_SIZE * scaleX;
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.y);
      this.ctx.lineTo(x, this.y + this.height);
      this.ctx.stroke();
    }
    
    // 水平线数量较少，全部绘制
    const rows = GameConfig.BATTLE_ROWS;
    for (let row = 0; row <= rows; row++) {
      const y = this.y + row * GameConfig.CELL_SIZE * scaleY;
      this.ctx.beginPath();
      this.ctx.moveTo(this.x, y);
      this.ctx.lineTo(this.x + this.width, y);
      this.ctx.stroke();
    }
    
    // 绘制武器（美化显示）
    if (this.weaponManager) {
      const weapons = this.weaponManager.getWeapons();
      for (const weapon of weapons) {
        if (weapon && !weapon.destroyed) {
          const minimapX = this.x + weapon.x * scaleX;
          const minimapY = this.y + weapon.y * scaleY;
          const size = 3;
          
          // 优化：移除阴影效果，减少渲染开销
          // 根据武器类型选择颜色
          const weaponColor = weapon.weaponType === WeaponType.ROCKET 
            ? GameColors.ROCKET_TOWER 
            : GameColors.LASER_TOWER;
          
          // 绘制武器图标（小方块，带边框）
          this.ctx.fillStyle = ColorUtils.hexToCanvas(weaponColor, 0.9);
          this.ctx.fillRect(minimapX - size, minimapY - size, size * 2, size * 2);
          
          // 绘制边框
          this.ctx.strokeStyle = ColorUtils.hexToCanvas(0xffffff, 0.5);
          this.ctx.lineWidth = 0.5;
          this.ctx.strokeRect(minimapX - size, minimapY - size, size * 2, size * 2);
        }
      }
    }
    
    // 绘制敌人（美化显示）
    if (this.enemyManager) {
      const enemies = this.enemyManager.getEnemies();
      for (const enemy of enemies) {
        if (enemy && !enemy.destroyed && !enemy.finished) {
          const minimapX = this.x + enemy.x * scaleX;
          const minimapY = this.y + enemy.y * scaleY;
          const size = 2.5;
          
          // 优化：移除阴影效果，减少渲染开销
          // 绘制敌人图标（小圆点）
          this.ctx.fillStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_TANK, 0.95);
          this.ctx.beginPath();
          this.ctx.arc(minimapX, minimapY, size, 0, Math.PI * 2);
          this.ctx.fill();
          
          // 绘制外圈（高光）
          this.ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.7);
          this.ctx.lineWidth = 0.5;
          this.ctx.beginPath();
          this.ctx.arc(minimapX, minimapY, size + 0.5, 0, Math.PI * 2);
          this.ctx.stroke();
        }
      }
    }
    
    // 绘制当前可见区域的指示器（美化版）
    const worldOffsetX = gameContext.worldOffsetX;
    
    // 计算可见区域在小视图中的位置
    const visibleStartX = this.x + worldOffsetX * scaleX;
    const visibleEndX = this.x + (worldOffsetX + GameConfig.DESIGN_WIDTH) * scaleX;
    const visibleStartY = this.y;
    const visibleEndY = this.y + this.height;
    const visibleWidth = visibleEndX - visibleStartX;
    const visibleHeight = visibleEndY - visibleStartY;
    
    // 绘制可见区域半透明背景（渐变）
    const visibleGradient = this.ctx.createLinearGradient(
      visibleStartX, visibleStartY,
      visibleStartX, visibleEndY
    );
    visibleGradient.addColorStop(0, ColorUtils.hexToCanvas(0xffff00, 0.15));
    visibleGradient.addColorStop(1, ColorUtils.hexToCanvas(0xffaa00, 0.1));
    this.ctx.fillStyle = visibleGradient;
    this.ctx.fillRect(visibleStartX, visibleStartY, visibleWidth, visibleHeight);
    
    // 绘制可见区域边框（发光效果）
    this.ctx.shadowColor = ColorUtils.hexToCanvas(0xffff00, 0.8);
    this.ctx.shadowBlur = 6;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    this.ctx.strokeStyle = ColorUtils.hexToCanvas(0xffff00, 0.9);
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(visibleStartX, visibleStartY, visibleWidth, visibleHeight);
    
    // 绘制内边框（高光）
    this.ctx.strokeStyle = ColorUtils.hexToCanvas(0xffffff, 0.4);
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(visibleStartX + 1, visibleStartY + 1, visibleWidth - 2, visibleHeight - 2);
    
    // 重置阴影
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    
    this.ctx.restore();
  }
  
  /**
   * 绘制圆角矩形
   */
  roundRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }
}


