/**
 * UI 设计配置
 * 包含所有 UI 相关的设计常量
 */

import { GameConfig } from './GameConfig';

/**
 * UI 配置类
 */
export class UIConfig {
    // ==================== UI 设计常量 ====================
    /** 武器容器宽度（与画布宽度相同） */
    static readonly WEAPON_CONTAINER_WIDTH = GameConfig.CELL_SIZE*4;
    /** 武器容器高度（基于 CELL_SIZE） */
    static readonly WEAPON_CONTAINER_HEIGHT = GameConfig.CELL_SIZE * 1.8;
    /** 武器卡片间距（基于 CELL_SIZE） */
    static readonly WEAPON_CARD_SPACING = GameConfig.CELL_SIZE * 0.375;
    /** 小地图宽度（格子数） */
    static readonly MINI_MAP_CELLS = 4;
    /** 小地图宽度（基于 CELL_SIZE） */
    static readonly MINI_MAP_WIDTH = GameConfig.CELL_SIZE * this.MINI_MAP_CELLS;
    /** 小地图高度（与武器容器相同） */
    static readonly MINI_MAP_HEIGHT = this.WEAPON_CONTAINER_HEIGHT;
    
    // ==================== UI 拖拽交互 ====================
    /** 拖拽时显示的幽灵图标放大倍数 */
    static readonly DRAG_GHOST_SCALE = 1.2;
    /** 拖拽幽灵图标尺寸（基于 CELL_SIZE） */
    static readonly DRAG_GHOST_SIZE = GameConfig.CELL_SIZE * 0.75;
    /** 地图上武器图标相对于格子的大小比例（0-1，所有武器统一使用此比例以确保视觉协调） */
    static readonly WEAPON_MAP_SIZE_RATIO = 0.6;
    
    // ==================== UI 字体尺寸 ====================
    /** 主标题字号（基于设计高度） */
    static readonly TITLE_FONT_SIZE = GameConfig.DESIGN_HEIGHT * 0.083;
    /** 副标题字号（基于设计高度） */
    static readonly SUBTITLE_FONT_SIZE = GameConfig.DESIGN_HEIGHT * 0.042;
    /** 按钮字号（基于设计高度） */
    static readonly BUTTON_FONT_SIZE = GameConfig.DESIGN_HEIGHT * 0.038;
    /** 卡片成本字号（基于设计高度） */
    static readonly CARD_COST_FONT_SIZE = GameConfig.DESIGN_HEIGHT * 0.038;
    /** 操作按钮字号（基于设计高度） */
    static readonly ACTION_BUTTON_FONT_SIZE = GameConfig.DESIGN_HEIGHT * 0.033;
    
    // ==================== UI 按钮尺寸 ====================
    /** 开始按钮宽度（基于设计宽度） */
    static readonly START_BTN_WIDTH = GameConfig.DESIGN_WIDTH * 0.2;
    /** 开始按钮高度（基于设计高度） */
    static readonly START_BTN_HEIGHT = GameConfig.DESIGN_HEIGHT * 0.108;
    /** 开始按钮圆角（基于设计高度） */
    static readonly START_BTN_RADIUS = GameConfig.DESIGN_HEIGHT * 0.038;
    /** 帮助按钮宽度（基于设计宽度） */
    static readonly HELP_BTN_WIDTH = GameConfig.DESIGN_WIDTH * 0.18;
    /** 帮助按钮高度（基于设计高度） */
    static readonly HELP_BTN_HEIGHT = GameConfig.DESIGN_HEIGHT * 0.092;
    /** 帮助按钮圆角（基于设计高度） */
    static readonly HELP_BTN_RADIUS = GameConfig.DESIGN_HEIGHT * 0.029;
    /** 操作按钮宽度（基于 CELL_SIZE） */
    static readonly ACTION_BUTTON_WIDTH = GameConfig.CELL_SIZE * 1.25;
    /** 操作按钮高度（基于 CELL_SIZE） */
    static readonly ACTION_BUTTON_HEIGHT = GameConfig.CELL_SIZE * 0.5;
    /** 操作按钮圆角（基于 CELL_SIZE） */
    static readonly ACTION_BUTTON_RADIUS = GameConfig.CELL_SIZE * 0.075;
    
    // ==================== UI 圆角和边框 ====================
    /** 容器圆角（武器容器、小地图等使用） */
    static readonly CONTAINER_RADIUS = 10;
    /** 卡片圆角（基于 CELL_SIZE） */
    static readonly CARD_RADIUS = GameConfig.CELL_SIZE * 0.125;
    /** 卡片选中圆角（基于 CELL_SIZE） */
    static readonly CARD_SELECTED_RADIUS = GameConfig.CELL_SIZE * 0.175;
    /** 按钮边框宽度（基于设计高度） */
    static readonly BORDER_WIDTH = GameConfig.DESIGN_HEIGHT * 0.004;
    /** 卡片边框宽度（基于设计高度） */
    static readonly CARD_BORDER_WIDTH = GameConfig.DESIGN_HEIGHT * 0.004;
    
    // ==================== UI 图标和间距 ====================
    /** 武器卡片图标尺寸（基于 CELL_SIZE，缩小以避免与金币重叠） */
    static readonly CARD_ICON_SIZE = GameConfig.CELL_SIZE * 0.5;
    /** 拖拽光晕尺寸（基于 CELL_SIZE） */
    static readonly DRAG_GLOW_SIZE = GameConfig.CELL_SIZE * 1.25;
    /** 操作按钮X偏移（基于 CELL_SIZE） */
    static readonly ACTION_BUTTON_OFFSET_X = GameConfig.CELL_SIZE * 0.75;
    
    // ==================== UI 血量条配置 ====================
    /** 血量条宽度相对于实体大小的比例（0-1） */
    static readonly HP_BAR_WIDTH_RATIO = 0.9;
    /** 血量条高度（像素） */
    static readonly HP_BAR_HEIGHT = 6;
    /** 血量条Y轴偏移相对于实体大小的比例（0-1，正值表示在实体上方，缩小以确保血条不超出格子） */
    static readonly HP_BAR_OFFSET_Y_RATIO = 0.4;
    /** 血量条危险阈值（低于此比例显示红色，0-1） */
    static readonly HP_BAR_CRITICAL_THRESHOLD = 0.3;
    /** 血量条警告阈值（低于此比例显示黄色，0-1） */
    static readonly HP_BAR_WARNING_THRESHOLD = 0.6;
}

