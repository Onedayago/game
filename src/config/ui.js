/**
 * UI 配置
 * 定义游戏用户界面相关的视觉参数
 * 包括金币显示、小地图、按钮等UI元素的样式配置
 */

import { COLORS } from './colors';
import { CELL_SIZE } from './layout';

// === 顶部 UI / 金币条参数 ===
export const GOLD_TEXT_FONT_SIZE = 20;     // 顶部金币字体大小（px）
export const GOLD_TEXT_PADDING_X = 16;     // 金币文本左侧内边距（px）

// === 小地图参数 ===
export const MINIMAP_WIDTH = 220;                      // 小地图宽度（px）
export const MINIMAP_HEIGHT_PADDING = 10;              // 小地图相对顶部栏高度的扣减（px）
export const MINIMAP_HORIZONTAL_MARGIN = 10;           // 小地图距右侧间距（px）
export const MINIMAP_VERTICAL_MARGIN = 5;              // 小地图距顶部间距（px）
export const MINIMAP_CORNER_RADIUS = 10;               // 小地图圆角半径（px）
export const MINIMAP_BORDER_WIDTH = 1;                 // 小地图描边宽度（px）
export const MINIMAP_ENEMY_DOT_RADIUS = 2.5;           // 敌人标记点半径（px）
export const MINIMAP_WEAPON_DOT_RADIUS = 2.2;          // 我方武器标记点半径（px）
export const MINIMAP_VIEWPORT_STROKE_WIDTH = 2;        // 视口矩形描边宽度（px）
export const MINIMAP_VIEWPORT_COLOR = 0xf9fafb;        // 视口矩形描边颜色
export const MINIMAP_VIEWPORT_ALPHA = 0.9;             // 视口矩形描边透明度（0-1）

// === 波次显示参数 ===
export const WAVE_TEXT_FONT_SIZE = 16;     // 波次文字字号（px）
export const WAVE_TEXT_OFFSET_Y = -6;      // 波次文字 Y 轴偏移（px）

// === 操作按钮参数 ===
export const ACTION_BUTTON_WIDTH = 72;             // 升级/卖掉按钮宽度（px）
export const ACTION_BUTTON_HEIGHT = 26;            // 升级/卖掉按钮高度（px）
export const ACTION_BUTTON_RADIUS = 8;             // 按钮圆角半径（px）
export const ACTION_BUTTON_FONT_SIZE = 14;         // 按钮文字大小（px）
export const ACTION_BUTTON_STROKE_WIDTH = 2;       // 按钮描边线宽（px）

