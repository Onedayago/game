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

// 世界（战场）横向总宽度：为画布宽度的 2 倍，便于横向拖拽
export const WORLD_COLS = Math.ceil((APP_WIDTH * 2) / CELL_SIZE); // 战场列数
export const WORLD_WIDTH = WORLD_COLS * CELL_SIZE; // 战场像素宽度

// 顶部 UI / 金币条参数
export const GOLD_TEXT_FONT_SIZE = 20; // 顶部金币字体大小
export const GOLD_TEXT_PADDING_X = 16; // 金币文本左侧内边距

// 小地图参数
export const MINIMAP_WIDTH = 220; // 小地图宽度
export const MINIMAP_HEIGHT_PADDING = 10; // 小地图相对顶部栏高度的扣减
export const MINIMAP_HORIZONTAL_MARGIN = 10; // 小地图距右侧间距
export const MINIMAP_VERTICAL_MARGIN = 5; // 小地图距顶部间距
export const MINIMAP_CORNER_RADIUS = 10; // 小地图圆角半径
export const MINIMAP_BORDER_WIDTH = 1; // 小地图描边宽度
export const MINIMAP_ENEMY_DOT_RADIUS = 2.5; // 敌人点半径
export const MINIMAP_WEAPON_DOT_RADIUS = 2.2; // 我方点半径
export const MINIMAP_VIEWPORT_STROKE_WIDTH = 2; // 视口描边宽度
export const MINIMAP_VIEWPORT_COLOR = 0xf9fafb; // 视口描边颜色
export const MINIMAP_VIEWPORT_ALPHA = 0.9; // 视口描边透明度
export const WAVE_TEXT_FONT_SIZE = 16; // 波次文字字号
export const WAVE_TEXT_OFFSET_Y = -6; // 波次文字 Y 偏移

// === 配色方案 (Cyberpunk/Neon Theme) ===
export const COLORS = {
  // 友方 (Neon Cyan/Electric Blue)
  ALLY_BODY: 0x00d9ff,      // 友军主体色（霓虹青色）
  ALLY_BODY_DARK: 0x0a1929, // 友军阴影色（深蓝黑）
  ALLY_BARREL: 0x006b7d,    // 炮管色（深青色）
  ALLY_DETAIL: 0x00ffff,    // 友军高光/灯效（纯青霓虹）
  ALLY_BULLET: 0x00ffff,    // 友军子弹能量色（青色脉冲）
  
  // 敌人 (Neon Magenta/Hot Pink)
  ENEMY_BODY: 0xff006e,     // 敌军主体色（霓虹洋红）
  ENEMY_BODY_DARK: 0x1a0a14,// 敌军阴影色（深紫黑）
  ENEMY_DETAIL: 0xff0080,   // 敌军细节/灯效（粉红霓虹）
  ENEMY_BULLET: 0xff00ff,   // 敌军子弹色（紫红脉冲）

  // 火箭塔 (Neon Purple/Violet)
  ROCKET_BODY: 0x9d00ff,    // 火箭塔主体色（霓虹紫）
  ROCKET_DETAIL: 0xd946ff,  // 火箭塔高光（亮紫霓虹）
  ROCKET_BULLET: 0xc026d3,  // 火箭弹体色（紫色脉冲）

  // 激光塔 (Neon Green/Lime)
  LASER_BODY: 0x00ff41,     // 激光塔主体色（霓虹绿）
  LASER_DETAIL: 0x39ff14,   // 激光塔高光（亮绿霓虹）
  LASER_BEAM: 0x00ff88,     // 激光束色（青绿脉冲）

  // UI & System (Cyberpunk Neon)
  GOLD: 0xffff00,           // 金币数值色（霓虹黄）
  UI_BG: 0x0a0a14,          // UI 背景色（深紫黑）
  UI_BORDER: 0x00ffff,      // UI 边框色（青色霓虹）
  TEXT_MAIN: 0xffffff,      // 主文本色（纯白）
  TEXT_SUB: 0x00d9ff,       // 次文本色（青色）
  SUCCESS: 0x00ff41,        // 成功提示色（霓虹绿）
  DANGER: 0xff0055,         // 危险/错误色（霓虹红）
};

// 坦克与武器相关常量
export const TANK_SIZE = CELL_SIZE * 0.8; // 坦克整体尺寸
export const TANK_COLOR = COLORS.ALLY_BODY; // 坦克涂装颜色
export const TANK_BARREL_COLOR = COLORS.ALLY_BARREL; // 炮管颜色
export const TANK_FIRE_INTERVAL = 500; // 坦克默认射速（ms）
export const TANK_ATTACK_RANGE_CELLS = 4; // 坦克攻击范围（格）

export const BULLET_SPEED = 200; // 坦克子弹速度（px/s）
export const BULLET_RADIUS = CELL_SIZE * 0.11; // 子弹半径（稍小，视觉更轻巧）
export const BULLET_COLOR = COLORS.ALLY_BULLET; // 子弹能量色

// 敌人相关常量
export const ENEMY_SIZE = CELL_SIZE * 0.7; // 敌军尺寸
export const ENEMY_COLOR = COLORS.ENEMY_BODY; // 敌军颜色
export const ENEMY_MOVE_SPEED = 50; // 敌军前进速度（px/s）
export const ENEMY_SPAWN_INTERVAL = 2000; // 基础刷怪间隔（ms）

export const ENEMY_MAX_HP = 10; // 敌军初始生命
export const BULLET_DAMAGE = 1; // 玩家子弹伤害
export const WEAPON_MAX_HP = 5; // 武器耐久（被敌人击毁前的血量）
export const ENEMY_BULLET_DAMAGE = 1; // 敌军子弹伤害

// 经济系统相关
export const INITIAL_GOLD = 1000; // 开局金币
export const WEAPON_BASE_COST = 80; // 坦克基础造价
export const WEAPON_UPGRADE_BASE_COST = 50; // 坦克升级单级成本
export const WEAPON_SELL_BASE_GAIN = 40; // 出售武器返还金币
export const ENEMY_KILL_REWARD = 20; // 击杀敌人奖励

// 火箭塔相关
export const ROCKET_BASE_COST = 120; // 火箭塔造价
export const ROCKET_UPGRADE_BASE_COST = 70; // 火箭塔升级成本
export const ROCKET_SELL_BASE_GAIN = 60; // 火箭塔出售返还

// 激光塔相关
export const LASER_BASE_COST = 100; // 激光塔造价
export const LASER_UPGRADE_BASE_COST = 60; // 激光塔升级成本
export const LASER_SELL_BASE_GAIN = 50; // 激光塔出售返还
export const LASER_FIRE_INTERVAL = 300; // 激光塔射速（ms，比坦克快）
export const LASER_ATTACK_RANGE_CELLS = 5; // 激光塔攻击范围（格，比坦克远）
export const LASER_DAMAGE = 2; // 激光伤害（比子弹高）
export const LASER_BEAM_DURATION = 150; // 激光束持续时间（ms）

// 敌人攻击相关
export const ENEMY_ATTACK_RANGE_CELLS = 3; // 敌军攻击范围（格）
export const ENEMY_FIRE_INTERVAL = 1000; // 敌军射速（ms）
export const ENEMY_BULLET_SPEED = 160; // 敌军子弹速度（px/s）
export const ENEMY_BULLET_RADIUS = CELL_SIZE * 0.12; // 敌军子弹半径
export const ENEMY_BULLET_COLOR = COLORS.ENEMY_BULLET; // 敌军子弹颜色

// 武器容器相关常量
export const WEAPON_CONTAINER_WIDTH = CELL_SIZE * 10; // 底部武器库宽度（扩展以容纳3个武器）
export const WEAPON_CONTAINER_HEIGHT = CELL_SIZE * 2.5; // 底部武器库高度
export const WEAPON_CONTAINER_MARGIN_BOTTOM = CELL_SIZE * 0.2; // 武器库距底部间距
export const WEAPON_CONTAINER_BG_COLOR = COLORS.UI_BG; // 武器库背景色
export const WEAPON_CONTAINER_BORDER_COLOR = COLORS.UI_BORDER; // 武器库边框颜色
export const WEAPON_CONTAINER_BORDER_WIDTH = 2; // 武器库边框线宽
export const ACTION_BUTTON_WIDTH = 72; // 升级/卖掉按钮宽度
export const ACTION_BUTTON_HEIGHT = 26; // 升级/卖掉按钮高度
export const ACTION_BUTTON_RADIUS = 8; // 按钮圆角
export const ACTION_BUTTON_FONT_SIZE = 14; // 按钮文字大小
export const ACTION_BUTTON_STROKE_WIDTH = 2; // 按钮描边线宽

// 战场垂直布局
export const TOP_UI_HEIGHT = CELL_SIZE; // 顶部金币/信息栏高度
const RAW_BATTLE_SPACE =
  APP_HEIGHT - TOP_UI_HEIGHT - (WEAPON_CONTAINER_HEIGHT + WEAPON_CONTAINER_MARGIN_BOTTOM * 2); // 战场原始可用高度
export const BATTLE_ROWS = Math.max(1, Math.floor(RAW_BATTLE_SPACE / CELL_SIZE)); // 战场可容纳的行数
export const BATTLE_HEIGHT = BATTLE_ROWS * CELL_SIZE; // 战场像素高度
