/**
 * UI 设计配置
 */

import { GameConfig } from './GameConfig';

export class UIConfig {
  // ==================== UI 设计常量 ====================
  /** 武器容器高度 */
  static get WEAPON_CONTAINER_HEIGHT() {
    return GameConfig.CELL_SIZE * 1.5;
  }

  static get WEAPON_CONTAINER_WIDTH() {
    return GameConfig.CELL_SIZE * 3;
  }

  /** 武器卡片间距 */
  static get WEAPON_CARD_SPACING() {
    return GameConfig.CELL_SIZE * 0.375;
  }
  
  // ==================== UI 拖拽交互 ====================
  /** 拖拽时显示的幽灵图标放大倍数 */
  static DRAG_GHOST_SCALE = 1.2;
  /** 拖拽幽灵图标尺寸 */
  static get DRAG_GHOST_SIZE() {
    return GameConfig.CELL_SIZE * 0.75;
  }
  /** 地图上武器图标相对于格子的大小比例 */
  static WEAPON_MAP_SIZE_RATIO = 0.6;
  
  // ==================== UI 字体尺寸 ====================
  /** 主标题字号 */
  static get TITLE_FONT_SIZE() {
    return GameConfig.DESIGN_HEIGHT * 0.083;
  }
  /** 副标题字号 */
  static get SUBTITLE_FONT_SIZE() {
    return GameConfig.DESIGN_HEIGHT * 0.042;
  }
  /** 按钮字号 */
  static get BUTTON_FONT_SIZE() {
    return GameConfig.DESIGN_HEIGHT * 0.038;
  }
  /** 卡片成本字号 */
  static get CARD_COST_FONT_SIZE() {
    return GameConfig.DESIGN_HEIGHT * 0.038;
  }
  /** 操作按钮字号 */
  static get ACTION_BUTTON_FONT_SIZE() {
    return GameConfig.DESIGN_HEIGHT * 0.033;
  }
  
  // ==================== UI 按钮尺寸 ====================
  /** 开始按钮宽度 */
  static get START_BTN_WIDTH() {
    return GameConfig.DESIGN_WIDTH * 0.2;
  }
  /** 开始按钮高度 */
  static get START_BTN_HEIGHT() {
    return GameConfig.DESIGN_HEIGHT * 0.108;
  }
  /** 开始按钮圆角 */
  static get START_BTN_RADIUS() {
    return GameConfig.DESIGN_HEIGHT * 0.038;
  }
  /** 帮助按钮宽度 */
  static get HELP_BTN_WIDTH() {
    return GameConfig.DESIGN_WIDTH * 0.18;
  }
  /** 帮助按钮高度 */
  static get HELP_BTN_HEIGHT() {
    return GameConfig.DESIGN_HEIGHT * 0.092;
  }
  /** 帮助按钮圆角 */
  static get HELP_BTN_RADIUS() {
    return GameConfig.DESIGN_HEIGHT * 0.029;
  }
  /** 操作按钮宽度 */
  static get ACTION_BUTTON_WIDTH() {
    return GameConfig.CELL_SIZE * 1.25;
  }
  /** 操作按钮高度 */
  static get ACTION_BUTTON_HEIGHT() {
    return GameConfig.CELL_SIZE * 0.5;
  }
  /** 操作按钮圆角 */
  static get ACTION_BUTTON_RADIUS() {
    return GameConfig.CELL_SIZE * 0.075;
  }
  
  // ==================== UI 圆角和边框 ====================
  /** 容器圆角 */
  static CONTAINER_RADIUS = 10;
  /** 卡片圆角 */
  static get CARD_RADIUS() {
    return GameConfig.CELL_SIZE * 0.125;
  }
  /** 按钮边框宽度 */
  static get BORDER_WIDTH() {
    return GameConfig.DESIGN_HEIGHT * 0.004;
  }
  /** 卡片边框宽度 */
  static get CARD_BORDER_WIDTH() {
    return GameConfig.DESIGN_HEIGHT * 0.004;
  }
  
  // ==================== UI 血量条配置 ====================
  /** 血量条宽度相对于实体大小的比例 */
  static HP_BAR_WIDTH_RATIO = 0.9;
  /** 血量条高度（像素） */
  static HP_BAR_HEIGHT = 6;
  /** 血量条Y轴偏移相对于实体大小的比例 */
  static HP_BAR_OFFSET_Y_RATIO = 0.4;
  /** 血量条危险阈值 */
  static HP_BAR_CRITICAL_THRESHOLD = 0.3;
  /** 血量条警告阈值 */
  static HP_BAR_WARNING_THRESHOLD = 0.6;
}

