import { COLORS } from './colors';

// 画布相关常量
export const APP_WIDTH = 1600; // PIXI 画布宽度（px）
export const APP_HEIGHT = 640; // PIXI 画布高度（px）
export const APP_BACKGROUND = 0x0a0014; // 全局默认背景色（深紫黑赛博朋克）
export const APP_ANTIALIAS = true; // 是否开启抗锯齿
export const TOP_UI_BG_COLOR = 0x0f0a1f; // 顶部 UI 区域背景色（深紫）
export const BOTTOM_UI_BG_COLOR = 0x0a0a1a; // 底部武器库背景色（深蓝紫）

// DOM 相关常量
export const BODY_MARGIN = '0'; // <body> 外边距（避免滚动条白边）

// 网格与线条相关常量
export const CELL_SIZE = 80; // 每个格子的边长
export const GRID_LINE_WIDTH = 1; // 网格线宽度
export const GRID_LINE_COLOR = 0x00ffff; // 网格线颜色（霓虹青色）
export const GRID_LINE_ALPHA = 0.3; // 网格线透明度

// 武器容器相关常量
export const WEAPON_CONTAINER_WIDTH = CELL_SIZE * 10; // 底部武器库宽度（扩展以容纳3个武器）
export const WEAPON_CONTAINER_HEIGHT = CELL_SIZE * 2.5; // 底部武器库高度
export const WEAPON_CONTAINER_MARGIN_BOTTOM = CELL_SIZE * 0.2; // 武器库距底部间距
export const WEAPON_CONTAINER_BG_COLOR = COLORS.UI_BG; // 武器库背景色
export const WEAPON_CONTAINER_BORDER_COLOR = COLORS.UI_BORDER; // 武器库边框颜色
export const WEAPON_CONTAINER_BORDER_WIDTH = 2; // 武器库边框线宽

// 战场垂直布局
export const TOP_UI_HEIGHT = CELL_SIZE; // 顶部金币/信息栏高度
const RAW_BATTLE_SPACE =
  APP_HEIGHT - TOP_UI_HEIGHT - (WEAPON_CONTAINER_HEIGHT + WEAPON_CONTAINER_MARGIN_BOTTOM * 2); // 战场原始可用高度
export const BATTLE_ROWS = Math.max(1, Math.floor(RAW_BATTLE_SPACE / CELL_SIZE)); // 战场可容纳的行数
export const BATTLE_HEIGHT = BATTLE_ROWS * CELL_SIZE; // 战场像素高度

// 世界（战场）横向总宽度：为画布宽度的 2 倍，便于横向拖拽
export const WORLD_COLS = Math.ceil((APP_WIDTH * 2) / CELL_SIZE); // 战场列数
export const WORLD_WIDTH = WORLD_COLS * CELL_SIZE; // 战场像素宽度

