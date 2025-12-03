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

// === 波次通知参数 ===
export const WAVE_NOTIFY_OVERLAY_ALPHA = 0.4;       // 遮罩透明度
export const WAVE_NOTIFY_PANEL_WIDTH = 500;         // 标题面板宽度（px）
export const WAVE_NOTIFY_PANEL_HEIGHT = 120;        // 标题面板高度（px）
export const WAVE_NOTIFY_PANEL_RADIUS = 20;         // 标题面板圆角（px）
export const WAVE_NOTIFY_PANEL_ALPHA = 0.95;        // 标题面板透明度
export const WAVE_NOTIFY_BORDER_WIDTH = 3;          // 面板边框宽度（px）
export const WAVE_NOTIFY_BORDER_ALPHA = 0.8;        // 面板边框透明度
export const WAVE_NOTIFY_GLOW_PADDING = 10;         // 外层光晕扩展（px）
export const WAVE_NOTIFY_GLOW_RADIUS = 25;          // 外层光晕圆角（px）
export const WAVE_NOTIFY_GLOW_WIDTH = 2;            // 光晕描边宽度（px）
export const WAVE_NOTIFY_GLOW_ALPHA = 0.3;          // 光晕透明度
export const WAVE_NOTIFY_TITLE_SIZE = 56;           // 波次标题字号（px）
export const WAVE_NOTIFY_TITLE_SHADOW_BLUR = 10;    // 标题阴影模糊度
export const WAVE_NOTIFY_TITLE_SHADOW_ALPHA = 0.8;  // 标题阴影透明度
export const WAVE_NOTIFY_SUBTITLE_SIZE = 24;        // 副标题字号（px）
export const WAVE_NOTIFY_SUBTITLE_SHADOW_BLUR = 6;  // 副标题阴影模糊度
export const WAVE_NOTIFY_SUBTITLE_SHADOW_ALPHA = 0.6;// 副标题阴影透明度
export const WAVE_NOTIFY_LINE_WIDTH = 300;          // 装饰线宽度（px）
export const WAVE_NOTIFY_LINE_HEIGHT = 2;           // 装饰线高度（px）
export const WAVE_NOTIFY_LINE_ALPHA = 0.6;          // 装饰线透明度
export const WAVE_NOTIFY_TITLE_OFFSET_Y = -50;      // 标题 Y 偏移（px）
export const WAVE_NOTIFY_SUBTITLE_OFFSET_Y = 30;    // 副标题 Y 偏移（px）
export const WAVE_NOTIFY_LINE_TOP_OFFSET_Y = -100;  // 顶部装饰线 Y 偏移（px）
export const WAVE_NOTIFY_LINE_BOTTOM_OFFSET_Y = 60; // 底部装饰线 Y 偏移（px）
export const WAVE_NOTIFY_DURATION = 2000;           // 动画持续时间（ms）
export const WAVE_NOTIFY_FADE_IN_RATIO = 0.3;       // 淡入阶段比例
export const WAVE_NOTIFY_STAY_RATIO = 0.7;          // 保持阶段结束比例
export const WAVE_NOTIFY_INITIAL_SCALE = 0.5;       // 初始缩放比例

// === 帮助界面参数 ===
export const HELP_TITLE_SIZE = 32;                  // 帮助标题字号（px）
export const HELP_TITLE_Y_RATIO = 0.18;             // 帮助标题 Y 位置比例
export const HELP_BODY_SIZE = 18;                   // 帮助正文字号（px）
export const HELP_BODY_WIDTH_RATIO = 0.78;          // 正文换行宽度比例
export const HELP_BODY_LINE_HEIGHT = 26;            // 正文行高（px）
export const HELP_BODY_Y_RATIO = 0.24;              // 正文 Y 位置比例
export const HELP_BACK_BTN_WIDTH = 160;             // 返回按钮宽度（px）
export const HELP_BACK_BTN_HEIGHT = 40;             // 返回按钮高度（px）
export const HELP_BACK_BTN_RADIUS = 12;             // 返回按钮圆角（px）
export const HELP_BACK_BTN_STROKE = 2;              // 返回按钮描边宽度（px）
export const HELP_BACK_BTN_SIZE = 18;               // 返回按钮字号（px）
export const HELP_BACK_BTN_Y_RATIO = 0.78;          // 返回按钮 Y 位置比例

// === 开始界面参数 ===
export const START_OVERLAY_ALPHA = 0.95;            // 开始界面遮罩透明度
export const START_TITLE_SIZE = 40;                 // 主标题字号（px）
export const START_TITLE_Y_RATIO = 0.3;             // 主标题 Y 位置比例
export const START_SUBTITLE_SIZE = 20;              // 副标题字号（px）
export const START_SUBTITLE_Y_RATIO = 0.38;         // 副标题 Y 位置比例
export const START_BTN_WIDTH = 200;                 // 开始按钮宽度（px）
export const START_BTN_HEIGHT = 52;                 // 开始按钮高度（px）
export const START_BTN_RADIUS = 18;                 // 开始按钮圆角（px）
export const START_BTN_STROKE = 2;                  // 开始按钮描边宽度（px）
export const START_BTN_SIZE = 22;                   // 开始按钮字号（px）
export const START_BTN_Y_RATIO = 0.52;              // 开始按钮 Y 位置比例
export const START_HELP_BTN_WIDTH = 180;            // 说明按钮宽度（px）
export const START_HELP_BTN_HEIGHT = 44;            // 说明按钮高度（px）
export const START_HELP_BTN_RADIUS = 14;            // 说明按钮圆角（px）
export const START_HELP_BTN_SIZE = 18;              // 说明按钮字号（px）
export const START_HELP_BTN_Y_RATIO = 0.62;         // 说明按钮 Y 位置比例
