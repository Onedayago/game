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
    return GameConfig.CELL_SIZE * 1.0;
  }
  /** 操作按钮高度 */
  static get ACTION_BUTTON_HEIGHT() {
    return GameConfig.CELL_SIZE * 0.4;
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
  
  // ==================== UI 间距和边距 ====================
  /** 通用边距（小） */
  static MARGIN_SMALL = 10;
  /** 通用边距（中） */
  static MARGIN_MEDIUM = 20;
  /** 通用边距（大） */
  static MARGIN_LARGE = 50;
  /** 武器容器底部偏移 */
  static WEAPON_CONTAINER_BOTTOM_OFFSET = 20;
  /** 武器容器水平偏移 */
  static WEAPON_CONTAINER_HORIZONTAL_OFFSET = 100;
  /** 箭头与容器间距 */
  static ARROW_PADDING = 10;
  /** 小地图边距 */
  static MINIMAP_MARGIN = 50;
  /** 小地图底部偏移 */
  static MINIMAP_BOTTOM_OFFSET = 20;
  /** 面板间距（金币、波次等） */
  static PANEL_SPACING = 10;
  
  // ==================== UI 面板尺寸 ====================
  /** 金币面板宽度 */
  static GOLD_PANEL_WIDTH = 140;
  /** 金币面板高度 */
  static GOLD_PANEL_HEIGHT = 40;
  /** 波次面板宽度 */
  static WAVE_PANEL_WIDTH = 120;
  /** 波次面板高度 */
  static WAVE_PANEL_HEIGHT = 40;
  /** 游戏结束面板宽度 */
  static GAME_OVER_PANEL_WIDTH = 350;
  /** 游戏结束面板高度 */
  static GAME_OVER_PANEL_HEIGHT = 250;
  /** 暂停面板宽度 */
  static PAUSE_PANEL_WIDTH = 300;
  /** 暂停面板高度 */
  static PAUSE_PANEL_HEIGHT = 200;
  /** 面板圆角（小） */
  static PANEL_RADIUS_SMALL = 8;
  /** 面板圆角（中） */
  static PANEL_RADIUS_MEDIUM = 10;
  /** 面板圆角（大） */
  static PANEL_RADIUS_LARGE = 12;
  
  // ==================== UI 按钮尺寸 ====================
  /** 暂停按钮尺寸 */
  static PAUSE_BUTTON_SIZE = 40;
  /** 暂停按钮圆角 */
  static PAUSE_BUTTON_RADIUS = 8;
  /** 暂停按钮X偏移（距离右边） */
  static PAUSE_BUTTON_X_OFFSET = 20;
  /** 暂停按钮Y偏移（距离顶部） */
  static PAUSE_BUTTON_Y_OFFSET = 70;
  /** 游戏结束按钮宽度 */
  static GAME_OVER_BUTTON_WIDTH = 140;
  /** 游戏结束按钮高度 */
  static GAME_OVER_BUTTON_HEIGHT = 45;
  /** 暂停面板按钮宽度 */
  static PAUSE_PANEL_BUTTON_WIDTH = 120;
  /** 暂停面板按钮高度 */
  static PAUSE_PANEL_BUTTON_HEIGHT = 45;
  /** 按钮圆角 */
  static BUTTON_RADIUS = 8;
  
  // ==================== UI 图标尺寸 ====================
  /** 暂停图标宽度 */
  static PAUSE_ICON_WIDTH = 6;
  /** 暂停图标高度 */
  static PAUSE_ICON_HEIGHT = 16;
  /** 暂停图标间距 */
  static PAUSE_ICON_SPACING = 4;
  /** 小地图武器图标大小 */
  static MINIMAP_WEAPON_SIZE = 3;
  /** 小地图敌人图标大小 */
  static MINIMAP_ENEMY_SIZE = 2.5;
  
  // ==================== UI 文字位置偏移 ====================
  /** 面板标题Y偏移 */
  static PANEL_TITLE_Y_OFFSET = 50;
  /** 面板副标题Y偏移 */
  static PANEL_SUBTITLE_Y_OFFSET = 100;
  /** 面板按钮Y偏移（从底部） */
  static PANEL_BUTTON_BOTTOM_OFFSET = 20;
  /** 暂停面板标题Y偏移 */
  static PAUSE_PANEL_TITLE_Y_OFFSET = 60;
  /** 暂停面板副标题Y偏移 */
  static PAUSE_PANEL_SUBTITLE_Y_OFFSET = 120;
  
  // ==================== UI 缓存扩展 ====================
  /** 缓存Canvas扩展尺寸（用于阴影等） */
  static CACHE_PADDING = 20;
  /** 缓存Canvas内部偏移 */
  static CACHE_OFFSET = 20;
}

