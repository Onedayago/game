/**
 * 游戏布局配置
 * 定义游戏画布、网格、战场等空间布局相关的常量
 * 
 * 布局结构：
 * ┌─────────────────────────────────────┐
 * │         顶部 UI 区域                 │ TOP_UI_HEIGHT
 * ├─────────────────────────────────────┤
 * │                                     │
 * │          战斗区域                    │ BATTLE_HEIGHT
 * │        (可拖动滚动)                  │
 * │                                     │
 * ├─────────────────────────────────────┤
 * │        底部武器选择区                 │ WEAPON_CONTAINER_HEIGHT
 * └─────────────────────────────────────┘
 * 
 * 注意：这些是设计基准值，实际运行时会根据画布大小动态调整
 * 组件应该使用 responsiveLayout 获取当前实际值
 */

import { COLORS } from './colors';

// === 设计基准尺寸（1600x640 设计稿） ===
export const DESIGN_WIDTH = 1600;
export const DESIGN_HEIGHT = 640;

// === 画布相关常量（设计基准值） ===
export const APP_WIDTH = 1600;              // PIXI 画布宽度（px）
export const APP_HEIGHT = 640;              // PIXI 画布高度（px）
export const APP_BACKGROUND = 0x0a0014;     // 全局默认背景色（深紫黑赛博朋克）
export const APP_ANTIALIAS = true;          // 是否开启抗锯齿
export const TOP_UI_BG_COLOR = 0x0f0a1f;    // 顶部 UI 区域背景色（深紫）
export const BOTTOM_UI_BG_COLOR = 0x0a0a1a; // 底部武器库背景色（深蓝紫）

// === DOM 相关常量 ===
export const BODY_MARGIN = '0'; // <body> 外边距（避免滚动条白边）

// === 网格与线条相关常量 ===
export const CELL_SIZE = 80;               // 每个格子的边长（px）
export const GRID_LINE_WIDTH = 1;          // 网格线宽度（px）
export const GRID_LINE_COLOR = 0x00ffff;   // 网格线颜色（霓虹青色）
export const GRID_LINE_ALPHA = 0.3;        // 网格线透明度（0-1）

// === 武器容器相关常量 ===
export const WEAPON_CONTAINER_WIDTH = CELL_SIZE * 10;           // 底部武器库宽度（扩展以容纳多个武器）
export const WEAPON_CONTAINER_HEIGHT = CELL_SIZE * 2.5;         // 底部武器库高度
export const WEAPON_CONTAINER_MARGIN_BOTTOM = CELL_SIZE * 0.2;  // 武器库距底部间距
export const WEAPON_CONTAINER_BG_COLOR = COLORS.UI_BG;          // 武器库背景色
export const WEAPON_CONTAINER_BORDER_COLOR = COLORS.UI_BORDER;  // 武器库边框颜色
export const WEAPON_CONTAINER_BORDER_WIDTH = 2;                 // 武器库边框线宽

// === 战场垂直布局 ===
export const TOP_UI_HEIGHT = CELL_SIZE; // 顶部金币/信息栏高度

// 计算战场可用高度：总高度 - 顶部UI - 底部武器区
const RAW_BATTLE_SPACE =
  APP_HEIGHT - TOP_UI_HEIGHT - (WEAPON_CONTAINER_HEIGHT + WEAPON_CONTAINER_MARGIN_BOTTOM * 2);

export const BATTLE_ROWS = Math.max(1, Math.floor(RAW_BATTLE_SPACE / CELL_SIZE)); // 战场可容纳的行数
export const BATTLE_HEIGHT = BATTLE_ROWS * CELL_SIZE;                              // 战场实际像素高度

// === 世界（战场）横向总宽度 ===
// 为画布宽度的 2 倍，便于横向拖拽查看更大的战场
export const WORLD_COLS = Math.ceil((APP_WIDTH * 2) / CELL_SIZE); // 战场列数
export const WORLD_WIDTH = WORLD_COLS * CELL_SIZE;                 // 战场像素宽度

/**
 * 根据当前布局参数计算动态值
 * 用于需要响应尺寸变化的组件
 * 
 * @param {Object} layout - 来自 responsiveLayout 的布局参数
 * @returns {Object} 计算后的布局值
 */
export function calculateDynamicLayout(layout) {
  const { APP_WIDTH: w, APP_HEIGHT: h, CELL_SIZE: cell } = layout;
  
  const weaponContainerWidth = cell * 10;
  const weaponContainerHeight = cell * 2.5;
  const weaponContainerMarginBottom = cell * 0.2;
  const topUiHeight = cell;
  
  const rawBattleSpace = h - topUiHeight - (weaponContainerHeight + weaponContainerMarginBottom * 2);
  const battleRows = Math.max(1, Math.floor(rawBattleSpace / cell));
  const battleHeight = battleRows * cell;
  
  const worldCols = Math.ceil((w * 2) / cell);
  const worldWidth = worldCols * cell;
  
  return {
    APP_WIDTH: w,
    APP_HEIGHT: h,
    CELL_SIZE: cell,
    WEAPON_CONTAINER_WIDTH: weaponContainerWidth,
    WEAPON_CONTAINER_HEIGHT: weaponContainerHeight,
    WEAPON_CONTAINER_MARGIN_BOTTOM: weaponContainerMarginBottom,
    TOP_UI_HEIGHT: topUiHeight,
    BATTLE_ROWS: battleRows,
    BATTLE_HEIGHT: battleHeight,
    WORLD_COLS: worldCols,
    WORLD_WIDTH: worldWidth,
  };
}
