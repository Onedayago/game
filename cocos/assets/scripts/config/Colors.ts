/**
 * 游戏配色方案配置
 * 主题：赛博朋克 / 霓虹风格
 * 
 * Cocos Creator 使用 Color 对象，这里提供十六进制转换工具
 */

import { Color } from 'cc';

/**
 * 将十六进制颜色转换为 Cocos Color 对象
 */
export function hexToColor(hex: number, alpha: number = 255): Color {
    const r = (hex >> 16) & 0xFF;
    const g = (hex >> 8) & 0xFF;
    const b = hex & 0xFF;
    return new Color(r, g, b, alpha);
}

// 颜色常量（十六进制）
export class GameColors {
    // === 友方单位配色 ===
    static readonly ALLY_BODY = 0x00d9ff;
    static readonly ALLY_BODY_DARK = 0x0a1929;
    static readonly ALLY_BARREL = 0x006b7d;
    static readonly ALLY_DETAIL = 0x00ffff;
    static readonly ALLY_BULLET = 0x00ffff;
    
    // === 敌方单位配色 ===
    static readonly ENEMY_BODY = 0xff006e;
    static readonly ENEMY_BODY_DARK = 0x1a0a14;
    static readonly ENEMY_DETAIL = 0xff0080;
    static readonly ENEMY_BULLET = 0xff00ff;
    
    // === 火箭塔配色 ===
    static readonly ROCKET_BODY = 0x9d00ff;
    static readonly ROCKET_DETAIL = 0xd946ff;
    static readonly ROCKET_BULLET = 0xc026d3;
    
    // === 激光塔配色 ===
    static readonly LASER_BODY = 0x00ff41;
    static readonly LASER_DETAIL = 0x39ff14;
    static readonly LASER_BEAM = 0x00ff88;
    
    // === UI 和系统配色 ===
    static readonly GOLD = 0xffff00;
    static readonly UI_BG = 0x0a0a14;
    static readonly UI_BORDER = 0x00ffff;
    static readonly TEXT_MAIN = 0xffffff;
    static readonly TEXT_SUB = 0x00d9ff;
    static readonly TEXT_LIGHT = 0xf9fafb;
    static readonly SUCCESS = 0x00ff41;
    static readonly SUCCESS_DARK = 0x16a34a;
    static readonly DANGER = 0xff0055;
    static readonly OVERLAY_BG = 0x000000;
}

// Cocos Color 对象缓存
export class ColorCache {
    private static cache: Map<string, Color> = new Map();
    
    static get(hex: number, alpha: number = 255): Color {
        const key = `${hex}_${alpha}`;
        if (!this.cache.has(key)) {
            this.cache.set(key, hexToColor(hex, alpha));
        }
        return this.cache.get(key)!;
    }
    
    /**
     * 获取颜色的十六进制值
     */
    static getHex(colorClass: string): number {
        const value = (GameColors as any)[colorClass];
        return typeof value === 'number' ? value : 0xffffff;
    }
    
    // 预定义的 Cocos Color 对象
    static readonly ALLY_BODY = ColorCache.get(GameColors.ALLY_BODY);
    static readonly ENEMY_BODY = ColorCache.get(GameColors.ENEMY_BODY);
    static readonly ENEMY_BODY_DARK = ColorCache.get(GameColors.ENEMY_BODY_DARK);
    static readonly ENEMY_DETAIL = ColorCache.get(GameColors.ENEMY_DETAIL);
    static readonly ROCKET_BODY = ColorCache.get(GameColors.ROCKET_BODY);
    static readonly LASER_BODY = ColorCache.get(GameColors.LASER_BODY);
    static readonly UI_BORDER = ColorCache.get(GameColors.UI_BORDER);
    static readonly TEXT_MAIN = ColorCache.get(GameColors.TEXT_MAIN);
    static readonly GOLD = ColorCache.get(GameColors.GOLD);
}

