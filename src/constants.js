// 画布相关常量
export const APP_WIDTH = 1600;
export const APP_HEIGHT = 640;
export const APP_BACKGROUND = 0x1e293b;
export const APP_ANTIALIAS = true;

// DOM 相关常量
export const BODY_MARGIN = '0';

// 网格与线条相关常量
export const CELL_SIZE = 80; // 每个格子的边长
export const GRID_LINE_WIDTH = 1;
export const GRID_LINE_COLOR = 0xffffff;
export const GRID_LINE_ALPHA = 1;

// 世界（战场）横向总宽度：比视窗宽，可以左右拖拽浏览
// 例如：视窗大约 20 列，这里放大为 3 倍，整个战场约 60 列
export const WORLD_COLS = Math.floor(APP_WIDTH / CELL_SIZE) * 3;
export const WORLD_WIDTH = WORLD_COLS * CELL_SIZE;

// 坦克与武器相关常量
export const TANK_SIZE = CELL_SIZE * 0.8; // 坦克略小于格子，留出边缘空隙
export const TANK_COLOR = 0x22c55e;
export const TANK_BARREL_COLOR = 0x16a34a;
export const TANK_FIRE_INTERVAL = 500; // 毫秒，自动开火间隔
export const TANK_ATTACK_RANGE_CELLS = 4; // 攻击范围：4 个格子

export const BULLET_SPEED = 200; // 子弹移动速度（像素/秒，大约 2.5 格/秒，比较容易观察）
export const BULLET_RADIUS = CELL_SIZE * 0.14; // 基础子弹变小一点，升级后再变大
export const BULLET_COLOR = 0x3b82f6; // 友方子弹：蓝色

// 敌人相关常量（简单示例）
export const ENEMY_SIZE = CELL_SIZE * 0.7; // 敌人略小于格子，看起来更精致
export const ENEMY_COLOR = 0xef4444;
export const ENEMY_MOVE_SPEED = 50; // 敌人坦克移动速度（像素/秒，再慢一点，方便观察路径）
export const ENEMY_SPAWN_INTERVAL = 2000; // 毫秒，敌人生成间隔

// 敌人血量与伤害
export const ENEMY_MAX_HP = 10;
export const BULLET_DAMAGE = 1;
export const WEAPON_MAX_HP = 5; // 每门武器的血量
export const ENEMY_BULLET_DAMAGE = 1; // 敌人子弹对武器的伤害

// 经济系统相关
export const INITIAL_GOLD = 200; // 初始金币
export const WEAPON_BASE_COST = 80; // 放置一门武器的基础金币消耗
export const WEAPON_UPGRADE_BASE_COST = 50; // 每级升级所需的基础金币
export const WEAPON_SELL_BASE_GAIN = 40; // 每级卖掉返还的基础金币
export const ENEMY_KILL_REWARD = 20; // 击杀一个敌人获得的金币

// 敌人攻击相关
export const ENEMY_ATTACK_RANGE_CELLS = 3; // 敌人攻击范围（格子）
export const ENEMY_FIRE_INTERVAL = 1000; // 敌人开火间隔（毫秒）
export const ENEMY_BULLET_SPEED = 160; // 敌人子弹速度（像素/秒）
export const ENEMY_BULLET_RADIUS = CELL_SIZE * 0.12;
export const ENEMY_BULLET_COLOR = 0xf97316;

// 武器容器相关常量
export const WEAPON_CONTAINER_WIDTH = CELL_SIZE * 3;
export const WEAPON_CONTAINER_HEIGHT = CELL_SIZE * 1.4;
export const WEAPON_CONTAINER_MARGIN_BOTTOM = CELL_SIZE * 0.2;
export const WEAPON_CONTAINER_BG_COLOR = 0x020617;
export const WEAPON_CONTAINER_BORDER_COLOR = 0x4b5563;
export const WEAPON_CONTAINER_BORDER_WIDTH = 2;


