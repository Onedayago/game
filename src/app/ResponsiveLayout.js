/**
 * 响应式布局管理器
 * 负责处理画布尺寸变化时的自适应布局计算
 * 
 * 设计理念：
 * - 保持设计比例，根据实际画布大小动态计算布局参数
 * - 使用事件机制通知各组件更新
 * - 单例模式，全局统一管理布局状态
 */

import { COLORS } from '../config/colors';

// === 设计基准尺寸（所有比例计算的基础） ===
export const DESIGN_WIDTH = 1600;
export const DESIGN_HEIGHT = 640;
export const DESIGN_CELL_SIZE = 80;

/**
 * 响应式布局管理器类
 */
class ResponsiveLayoutManager {
  constructor() {
    // 当前画布尺寸
    this.width = DESIGN_WIDTH;
    this.height = DESIGN_HEIGHT;
    
    // 缩放比例
    this.scale = 1;
    this.scaleX = 1;
    this.scaleY = 1;
    
    // 事件监听器
    this.listeners = new Set();
    
    // 计算初始布局
    this.recalculate();
  }

  /**
   * 更新画布尺寸并重新计算布局
   * @param {number} width - 新的画布宽度
   * @param {number} height - 新的画布高度
   */
  resize(width, height) {
    if (this.width === width && this.height === height) return;
    
    this.width = width;
    this.height = height;
    this.recalculate();
    this.notifyListeners();
  }

  /**
   * 重新计算所有布局参数
   */
  recalculate() {
    // 计算缩放比例
    this.scaleX = this.width / DESIGN_WIDTH;
    this.scaleY = this.height / DESIGN_HEIGHT;
    // 使用较小的缩放比例保持比例
    this.scale = Math.min(this.scaleX, this.scaleY);
    
    // === 画布相关 ===
    this.APP_WIDTH = this.width;
    this.APP_HEIGHT = this.height;
    this.APP_BACKGROUND = 0x0a0014;
    this.APP_ANTIALIAS = true;
    this.TOP_UI_BG_COLOR = 0x0f0a1f;
    this.BOTTOM_UI_BG_COLOR = 0x0a0a1a;
    
    // === 网格相关（按比例缩放） ===
    this.CELL_SIZE = Math.round(DESIGN_CELL_SIZE * this.scale);
    this.GRID_LINE_WIDTH = 1;
    this.GRID_LINE_COLOR = 0x00ffff;
    this.GRID_LINE_ALPHA = 0.3;
    
    // === 武器容器相关 ===
    this.WEAPON_CONTAINER_WIDTH = this.CELL_SIZE * 10;
    this.WEAPON_CONTAINER_HEIGHT = this.CELL_SIZE * 2.5;
    this.WEAPON_CONTAINER_MARGIN_BOTTOM = this.CELL_SIZE * 0.2;
    this.WEAPON_CONTAINER_BG_COLOR = COLORS.UI_BG;
    this.WEAPON_CONTAINER_BORDER_COLOR = COLORS.UI_BORDER;
    this.WEAPON_CONTAINER_BORDER_WIDTH = 2;
    
    // === 战场垂直布局 ===
    this.TOP_UI_HEIGHT = this.CELL_SIZE;
    
    // 计算战场可用高度
    const rawBattleSpace = this.APP_HEIGHT - this.TOP_UI_HEIGHT 
      - (this.WEAPON_CONTAINER_HEIGHT + this.WEAPON_CONTAINER_MARGIN_BOTTOM * 2);
    
    this.BATTLE_ROWS = Math.max(1, Math.floor(rawBattleSpace / this.CELL_SIZE));
    this.BATTLE_HEIGHT = this.BATTLE_ROWS * this.CELL_SIZE;
    
    // === 世界横向总宽度 ===
    this.WORLD_COLS = Math.ceil((this.APP_WIDTH * 2) / this.CELL_SIZE);
    this.WORLD_WIDTH = this.WORLD_COLS * this.CELL_SIZE;
    
    // === 坦克/武器相关（按比例缩放） ===
    this.TANK_SIZE = Math.round(this.CELL_SIZE * 0.8);
    
    // === 敌人相关（按比例缩放） ===
    this.ENEMY_SIZE = Math.round(this.CELL_SIZE * 0.7);
    this.SONIC_TANK_SIZE = Math.round(this.CELL_SIZE * 0.8);
    
    // === 子弹相关（按比例缩放） ===
    this.BULLET_RADIUS = Math.round(this.CELL_SIZE * 0.11);
    this.ENEMY_BULLET_RADIUS = Math.round(this.CELL_SIZE * 0.12);
    
    // === 声波相关（按比例缩放） ===
    this.SONIC_WAVE_INITIAL_RADIUS = this.CELL_SIZE * 0.5;
    this.SONIC_WAVE_MAX_RADIUS = this.CELL_SIZE * 5;
    
    // === 小地图参数（按比例缩放） ===
    this.MINIMAP_WIDTH = Math.round(220 * this.scale);
    this.MINIMAP_HEIGHT_PADDING = Math.round(10 * this.scale);
    this.MINIMAP_HORIZONTAL_MARGIN = Math.round(10 * this.scale);
    this.MINIMAP_VERTICAL_MARGIN = Math.round(5 * this.scale);
    this.MINIMAP_CORNER_RADIUS = Math.round(10 * this.scale);
    
    // === 操作按钮参数（按比例缩放） ===
    this.ACTION_BUTTON_WIDTH = Math.round(72 * this.scale);
    this.ACTION_BUTTON_HEIGHT = Math.round(26 * this.scale);
    this.ACTION_BUTTON_RADIUS = Math.round(8 * this.scale);
    this.ACTION_BUTTON_FONT_SIZE = Math.round(14 * this.scale);
    this.ACTION_BUTTON_STROKE_WIDTH = Math.round(2 * this.scale);
    
    // === 金币/波次文本参数（按比例缩放） ===
    this.GOLD_TEXT_FONT_SIZE = Math.round(20 * this.scale);
    this.GOLD_TEXT_PADDING_X = Math.round(16 * this.scale);
    this.WAVE_TEXT_FONT_SIZE = Math.round(16 * this.scale);
    
    // === 粒子系统参数（按比例缩放） ===
    this.PARTICLE_BASE_SIZE = Math.round(5 * this.scale);
    
    // === 波次通知参数（按比例缩放） ===
    this.WAVE_NOTIFY_PANEL_WIDTH = Math.round(500 * this.scale);
    this.WAVE_NOTIFY_PANEL_HEIGHT = Math.round(120 * this.scale);
    this.WAVE_NOTIFY_PANEL_RADIUS = Math.round(20 * this.scale);
    this.WAVE_NOTIFY_TITLE_SIZE = Math.round(56 * this.scale);
    this.WAVE_NOTIFY_SUBTITLE_SIZE = Math.round(24 * this.scale);
    this.WAVE_NOTIFY_LINE_WIDTH = Math.round(300 * this.scale);
    
    // === 帮助界面参数（按比例缩放） ===
    this.HELP_TITLE_SIZE = Math.round(32 * this.scale);
    this.HELP_BODY_SIZE = Math.round(18 * this.scale);
    this.HELP_BODY_LINE_HEIGHT = Math.round(26 * this.scale);
    this.HELP_BACK_BTN_WIDTH = Math.round(160 * this.scale);
    this.HELP_BACK_BTN_HEIGHT = Math.round(40 * this.scale);
    this.HELP_BACK_BTN_RADIUS = Math.round(12 * this.scale);
    this.HELP_BACK_BTN_SIZE = Math.round(18 * this.scale);
    
    // === 开始界面参数（按比例缩放） ===
    this.START_TITLE_SIZE = Math.round(40 * this.scale);
    this.START_SUBTITLE_SIZE = Math.round(20 * this.scale);
    this.START_BTN_WIDTH = Math.round(200 * this.scale);
    this.START_BTN_HEIGHT = Math.round(52 * this.scale);
    this.START_BTN_RADIUS = Math.round(18 * this.scale);
    this.START_BTN_SIZE = Math.round(22 * this.scale);
    this.START_HELP_BTN_WIDTH = Math.round(180 * this.scale);
    this.START_HELP_BTN_HEIGHT = Math.round(44 * this.scale);
    this.START_HELP_BTN_RADIUS = Math.round(14 * this.scale);
    this.START_HELP_BTN_SIZE = Math.round(18 * this.scale);
  }

  /**
   * 添加布局变化监听器
   * @param {Function} callback - 回调函数，接收布局管理器实例
   */
  addListener(callback) {
    this.listeners.add(callback);
  }

  /**
   * 移除布局变化监听器
   * @param {Function} callback - 要移除的回调函数
   */
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  /**
   * 通知所有监听器布局已更新
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this);
      } catch (e) {
        console.error('[ResponsiveLayout] Listener error:', e);
      }
    });
  }

  /**
   * 获取当前布局参数的快照
   * @returns {Object} 布局参数对象
   */
  getLayout() {
    return {
      width: this.width,
      height: this.height,
      scale: this.scale,
      scaleX: this.scaleX,
      scaleY: this.scaleY,
      APP_WIDTH: this.APP_WIDTH,
      APP_HEIGHT: this.APP_HEIGHT,
      CELL_SIZE: this.CELL_SIZE,
      TOP_UI_HEIGHT: this.TOP_UI_HEIGHT,
      BATTLE_HEIGHT: this.BATTLE_HEIGHT,
      BATTLE_ROWS: this.BATTLE_ROWS,
      WORLD_WIDTH: this.WORLD_WIDTH,
      WORLD_COLS: this.WORLD_COLS,
      WEAPON_CONTAINER_WIDTH: this.WEAPON_CONTAINER_WIDTH,
      WEAPON_CONTAINER_HEIGHT: this.WEAPON_CONTAINER_HEIGHT,
      WEAPON_CONTAINER_MARGIN_BOTTOM: this.WEAPON_CONTAINER_MARGIN_BOTTOM,
      TANK_SIZE: this.TANK_SIZE,
      ENEMY_SIZE: this.ENEMY_SIZE,
      SONIC_TANK_SIZE: this.SONIC_TANK_SIZE,
      BULLET_RADIUS: this.BULLET_RADIUS,
      ENEMY_BULLET_RADIUS: this.ENEMY_BULLET_RADIUS,
      SONIC_WAVE_INITIAL_RADIUS: this.SONIC_WAVE_INITIAL_RADIUS,
      SONIC_WAVE_MAX_RADIUS: this.SONIC_WAVE_MAX_RADIUS,
      MINIMAP_WIDTH: this.MINIMAP_WIDTH,
      ACTION_BUTTON_WIDTH: this.ACTION_BUTTON_WIDTH,
      ACTION_BUTTON_HEIGHT: this.ACTION_BUTTON_HEIGHT,
      ACTION_BUTTON_RADIUS: this.ACTION_BUTTON_RADIUS,
      ACTION_BUTTON_FONT_SIZE: this.ACTION_BUTTON_FONT_SIZE,
      ACTION_BUTTON_STROKE_WIDTH: this.ACTION_BUTTON_STROKE_WIDTH,
      GOLD_TEXT_FONT_SIZE: this.GOLD_TEXT_FONT_SIZE,
      GOLD_TEXT_PADDING_X: this.GOLD_TEXT_PADDING_X,
      WAVE_TEXT_FONT_SIZE: this.WAVE_TEXT_FONT_SIZE,
      PARTICLE_BASE_SIZE: this.PARTICLE_BASE_SIZE,
      WAVE_NOTIFY_PANEL_WIDTH: this.WAVE_NOTIFY_PANEL_WIDTH,
      WAVE_NOTIFY_PANEL_HEIGHT: this.WAVE_NOTIFY_PANEL_HEIGHT,
      WAVE_NOTIFY_PANEL_RADIUS: this.WAVE_NOTIFY_PANEL_RADIUS,
      WAVE_NOTIFY_TITLE_SIZE: this.WAVE_NOTIFY_TITLE_SIZE,
      WAVE_NOTIFY_SUBTITLE_SIZE: this.WAVE_NOTIFY_SUBTITLE_SIZE,
      WAVE_NOTIFY_LINE_WIDTH: this.WAVE_NOTIFY_LINE_WIDTH,
      HELP_TITLE_SIZE: this.HELP_TITLE_SIZE,
      HELP_BODY_SIZE: this.HELP_BODY_SIZE,
      HELP_BODY_LINE_HEIGHT: this.HELP_BODY_LINE_HEIGHT,
      HELP_BACK_BTN_WIDTH: this.HELP_BACK_BTN_WIDTH,
      HELP_BACK_BTN_HEIGHT: this.HELP_BACK_BTN_HEIGHT,
      HELP_BACK_BTN_RADIUS: this.HELP_BACK_BTN_RADIUS,
      HELP_BACK_BTN_SIZE: this.HELP_BACK_BTN_SIZE,
      START_TITLE_SIZE: this.START_TITLE_SIZE,
      START_SUBTITLE_SIZE: this.START_SUBTITLE_SIZE,
      START_BTN_WIDTH: this.START_BTN_WIDTH,
      START_BTN_HEIGHT: this.START_BTN_HEIGHT,
      START_BTN_RADIUS: this.START_BTN_RADIUS,
      START_BTN_SIZE: this.START_BTN_SIZE,
      START_HELP_BTN_WIDTH: this.START_HELP_BTN_WIDTH,
      START_HELP_BTN_HEIGHT: this.START_HELP_BTN_HEIGHT,
      START_HELP_BTN_RADIUS: this.START_HELP_BTN_RADIUS,
      START_HELP_BTN_SIZE: this.START_HELP_BTN_SIZE,
    };
  }

  /**
   * 将设计坐标转换为当前坐标
   * @param {number} x - 设计坐标X
   * @param {number} y - 设计坐标Y
   * @returns {Object} 转换后的坐标
   */
  designToActual(x, y) {
    return {
      x: x * this.scaleX,
      y: y * this.scaleY,
    };
  }

  /**
   * 将当前坐标转换为设计坐标
   * @param {number} x - 当前坐标X
   * @param {number} y - 当前坐标Y
   * @returns {Object} 转换后的坐标
   */
  actualToDesign(x, y) {
    return {
      x: x / this.scaleX,
      y: y / this.scaleY,
    };
  }
}

// 导出单例实例
export const responsiveLayout = new ResponsiveLayoutManager();

// 导出便捷访问方法
export const getLayout = () => responsiveLayout.getLayout();
export const onLayoutChange = (callback) => responsiveLayout.addListener(callback);
export const offLayoutChange = (callback) => responsiveLayout.removeListener(callback);
