/**
 * 游戏配色方案配置
 * 主题：赛博朋克 / 霓虹风格 (Cyberpunk/Neon Theme)
 * 
 * 设计理念：
 * - 使用高饱和度的霓虹色彩，营造赛博朋克氛围
 * - 友方使用冷色调（青色系），敌方使用暖色调（洋红系）
 * - 不同类型武器使用不同霓虹色进行区分
 */

// === 配色方案 (Cyberpunk/Neon Theme) ===
export const COLORS = {
  // === 友方单位配色 (Neon Cyan/Electric Blue) ===
  ALLY_BODY: 0x00d9ff,      // 友军主体色（霓虹青色）
  ALLY_BODY_DARK: 0x0a1929, // 友军阴影色（深蓝黑）
  ALLY_BARREL: 0x006b7d,    // 炮管色（深青色）
  ALLY_DETAIL: 0x00ffff,    // 友军高光/灯效（纯青霓虹）
  ALLY_BULLET: 0x00ffff,    // 友军子弹能量色（青色脉冲）
  
  // === 敌方单位配色 (Neon Magenta/Hot Pink) ===
  ENEMY_BODY: 0xff006e,     // 敌军主体色（霓虹洋红）
  ENEMY_BODY_DARK: 0x1a0a14,// 敌军阴影色（深紫黑）
  ENEMY_DETAIL: 0xff0080,   // 敌军细节/灯效（粉红霓虹）
  ENEMY_BULLET: 0xff00ff,   // 敌军子弹色（紫红脉冲）

  // === 火箭塔配色 (Neon Purple/Violet) ===
  ROCKET_BODY: 0x9d00ff,    // 火箭塔主体色（霓虹紫）
  ROCKET_DETAIL: 0xd946ff,  // 火箭塔高光（亮紫霓虹）
  ROCKET_BULLET: 0xc026d3,  // 火箭弹体色（紫色脉冲）

  // === 激光塔配色 (Neon Green/Lime) ===
  LASER_BODY: 0x00ff41,     // 激光塔主体色（霓虹绿）
  LASER_DETAIL: 0x39ff14,   // 激光塔高光（亮绿霓虹）
  LASER_BEAM: 0x00ff88,     // 激光束色（青绿脉冲）

  // === UI 和系统配色 (Cyberpunk Neon) ===
  GOLD: 0xffff00,           // 金币数值色（霓虹黄）
  UI_BG: 0x0a0a14,          // UI 背景色（深紫黑）
  UI_BORDER: 0x00ffff,      // UI 边框色（青色霓虹）
  TEXT_MAIN: 0xffffff,      // 主文本色（纯白）
  TEXT_SUB: 0x00d9ff,       // 次文本色（青色）
  SUCCESS: 0x00ff41,        // 成功提示色（霓虹绿）
  DANGER: 0xff0055,         // 危险/错误色（霓虹红）
};

