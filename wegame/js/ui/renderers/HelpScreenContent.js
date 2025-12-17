/**
 * 帮助界面内容渲染器
 * 负责渲染帮助界面的动态内容（文本、预览图片等）
 */

import { GameConfig } from '../../config/GameConfig';
import { UIConfig } from '../../config/UIConfig';
import { ColorUtils, GameColors } from '../../config/Colors';
import { WeaponType } from '../../config/WeaponConfig';
import { RocketTowerConfig } from '../../config/weapons/RocketTowerConfig';
import { LaserTowerConfig } from '../../config/weapons/LaserTowerConfig';
import { CannonTowerConfig } from '../../config/weapons/CannonTowerConfig';
import { SniperTowerConfig } from '../../config/weapons/SniperTowerConfig';
import { EnemyTankConfig } from '../../config/enemies/EnemyTankConfig';
import { FastEnemyConfig } from '../../config/enemies/FastEnemyConfig';
import { HeavyEnemyConfig } from '../../config/enemies/HeavyEnemyConfig';
import { FlyingEnemyConfig } from '../../config/enemies/FlyingEnemyConfig';
import { BomberEnemyConfig } from '../../config/enemies/BomberEnemyConfig';
import { WeaponRenderer } from '../../rendering/weapons/WeaponRenderer';
import { EnemyRenderer } from '../../rendering/EnemyRenderer';
import { TextRenderer } from '../utils/TextRenderer';
import { polyfillRoundRect } from '../../utils/CanvasUtils';

export class HelpScreenContent {
  // 离屏 Canvas 缓存
  static _cachedCanvas = null;
  static _cachedCtx = null;
  static _cachedContentWidth = 0;
  static _cachedContentHeight = 0;
  static _initialized = false;

  /**
   * 初始化离屏 Canvas 缓存
   */
  static initCache(ctx, contentWidth) {
    const contentHeight = this.calculateHeight(ctx, contentWidth);
    
    // 如果缓存已存在且尺寸相同，不需要重新初始化
    if (this._initialized && 
        this._cachedContentWidth === contentWidth && 
        this._cachedContentHeight === contentHeight) {
      return;
    }

    // 创建离屏 Canvas
    this._cachedCanvas = wx.createCanvas();
    this._cachedCanvas.width = contentWidth;
    this._cachedCanvas.height = contentHeight;
    this._cachedCtx = this._cachedCanvas.getContext('2d');
    
    this._cachedContentWidth = contentWidth;
    this._cachedContentHeight = contentHeight;
    
    // 清空画布
    this._cachedCtx.clearRect(0, 0, contentWidth, contentHeight);
    
    // 绘制内容到离屏 Canvas（从 y=0 开始，不应用滚动）
    this._renderToCache(this._cachedCtx, 0, 0, contentWidth);
    
    this._initialized = true;
  }

  /**
   * 渲染内容到缓存 Canvas
   */
  static _renderToCache(ctx, startX, startY, contentWidth) {
    const lineHeight = UIConfig.SUBTITLE_FONT_SIZE * 1.5;
    const previewSize = 50;
    const previewSpacing = 10;

    // 内容从 startY 开始
    let currentY = startY;

    // 绘制游戏目标
    currentY = this._drawTextSection(ctx, startX, currentY, contentWidth, lineHeight, '【游戏目标】', '阻止敌人到达战场右端，保护基地！');
    currentY += lineHeight * 1.5;

    // 绘制操作说明
    currentY = this._drawTextSection(ctx, startX, currentY, contentWidth, lineHeight, '【操作说明】',
      '1. 拖拽武器卡片到战场放置防御塔\n2. 防御塔会自动攻击范围内的敌人\n3. 击败敌人获得金币，购买更多武器');
    currentY += lineHeight * 1.5;

    // 绘制武器类型
    currentY = this._drawTextSection(ctx, startX, currentY, contentWidth, lineHeight, '【武器类型】', '');
    currentY += lineHeight * 0.5;

    const weapons = [
      { type: WeaponType.ROCKET, name: '火箭塔', desc: `追踪火箭，高爆溅射伤害\n射程：${RocketTowerConfig.ATTACK_RANGE}格 | 伤害：高 | 成本：${RocketTowerConfig.BASE_COST}金币` },
      { type: WeaponType.LASER, name: '激光塔', desc: `持续射线，高射速攻击\n射程：${LaserTowerConfig.ATTACK_RANGE}格 | 伤害：中 | 成本：${LaserTowerConfig.BASE_COST}金币` },
      { type: WeaponType.CANNON, name: '加农炮', desc: `直线炮弹，高爆伤害\n射程：${CannonTowerConfig.ATTACK_RANGE}格 | 伤害：很高 | 成本：${CannonTowerConfig.BASE_COST}金币` },
      { type: WeaponType.SNIPER, name: '狙击塔', desc: `快速子弹，超远射程\n射程：${SniperTowerConfig.ATTACK_RANGE}格 | 伤害：极高 | 成本：${SniperTowerConfig.BASE_COST}金币` }
    ];

    for (const weapon of weapons) {
      const previewX = startX + previewSize / 2;
      const previewY = currentY + previewSize / 2;
      this._drawWeaponPreview(ctx, previewX, previewY, weapon.type, previewSize);

      const textX = startX + previewSize + previewSpacing;
      currentY = this._drawTextSection(ctx, textX, currentY, contentWidth - previewSize - previewSpacing, lineHeight, weapon.name, weapon.desc);
      currentY += lineHeight * 1.2;
    }

    currentY += lineHeight * 0.5;

    // 绘制敌人类型
    currentY = this._drawTextSection(ctx, startX, currentY, contentWidth, lineHeight, '【敌人类型】', '');
    currentY += lineHeight * 0.5;

    const enemies = [
      { name: '普通坦克', desc: `基础敌人\n生命：${EnemyTankConfig.MAX_HP} | 速度：中等 | 奖励：${EnemyTankConfig.KILL_REWARD}金币`, size: EnemyTankConfig.SIZE, type: 'tank' },
      { name: '快速敌人', desc: `移动速度快\n生命：${FastEnemyConfig.MAX_HP} | 速度：快 | 奖励：${FastEnemyConfig.KILL_REWARD}金币`, size: FastEnemyConfig.SIZE, type: 'fast' },
      { name: '重型敌人', desc: `生命值高，移动慢\n生命：${HeavyEnemyConfig.MAX_HP} | 速度：慢 | 奖励：${HeavyEnemyConfig.KILL_REWARD}金币`, size: HeavyEnemyConfig.SIZE, type: 'heavy' },
      { name: '飞行敌人', desc: `可飞越障碍物\n生命：${FlyingEnemyConfig.MAX_HP} | 速度：中快 | 奖励：${FlyingEnemyConfig.KILL_REWARD}金币`, size: FlyingEnemyConfig.SIZE, type: 'flying' },
      { name: '自爆敌人', desc: `死亡时爆炸造成范围伤害\n生命：${BomberEnemyConfig.MAX_HP} | 速度：中 | 奖励：${BomberEnemyConfig.KILL_REWARD}金币`, size: BomberEnemyConfig.SIZE, type: 'bomber' }
    ];

    for (const enemy of enemies) {
      const previewX = startX + previewSize / 2;
      const previewY = currentY + previewSize / 2;
      this._drawEnemyPreview(ctx, previewX, previewY, enemy.size, previewSize, enemy.type);

      const textX = startX + previewSize + previewSpacing;
      currentY = this._drawTextSection(ctx, textX, currentY, contentWidth - previewSize - previewSpacing, lineHeight, enemy.name, enemy.desc);
      currentY += lineHeight * 1.2;
    }

    currentY += lineHeight * 0.5;

    // 绘制提示
    this._drawTextSection(ctx, startX, currentY, contentWidth, lineHeight, '【提示】',
      '• 合理布局武器位置\n• 优先升级高价值武器\n• 注意敌人的移动路径');
  }

  /**
   * 检查缓存是否已初始化
   */
  static isCacheInitialized() {
    return this._initialized;
  }

  /**
   * 计算内容高度
   */
  static calculateHeight(ctx, contentWidth) {
    const lineHeight = UIConfig.SUBTITLE_FONT_SIZE * 1.5;
    const previewSize = 50;
    const previewSpacing = 10;
    const font = `${UIConfig.SUBTITLE_FONT_SIZE * 0.9}px Arial`;

    const getTextHeight = (text) => {
      if (!text || text.length === 0) {
        return lineHeight;
      }
      const lines = TextRenderer.wrapText(ctx, text, contentWidth, font);
      return lines.length * lineHeight;
    };

    let currentY = 0;

    // 游戏目标
    currentY += getTextHeight('【游戏目标】');
    currentY += getTextHeight('阻止敌人到达战场右端，保护基地！');
    currentY += lineHeight * 1.5;

    // 操作说明
    currentY += getTextHeight('【操作说明】');
    currentY += getTextHeight('1. 拖拽武器卡片到战场放置防御塔');
    currentY += getTextHeight('2. 防御塔会自动攻击范围内的敌人');
    currentY += getTextHeight('3. 击败敌人获得金币，购买更多武器');
    currentY += lineHeight * 1.5;

    // 武器类型
    currentY += getTextHeight('【武器类型】');
    currentY += lineHeight * 0.5;

    const weapons = [
      { type: WeaponType.ROCKET, name: '火箭塔', desc: `追踪火箭，高爆溅射伤害\n射程：${RocketTowerConfig.ATTACK_RANGE}格 | 伤害：高 | 成本：${RocketTowerConfig.BASE_COST}金币` },
      { type: WeaponType.LASER, name: '激光塔', desc: `持续射线，高射速攻击\n射程：${LaserTowerConfig.ATTACK_RANGE}格 | 伤害：中 | 成本：${LaserTowerConfig.BASE_COST}金币` },
      { type: WeaponType.CANNON, name: '加农炮', desc: `直线炮弹，高爆伤害\n射程：${CannonTowerConfig.ATTACK_RANGE}格 | 伤害：很高 | 成本：${CannonTowerConfig.BASE_COST}金币` },
      { type: WeaponType.SNIPER, name: '狙击塔', desc: `快速子弹，超远射程\n射程：${SniperTowerConfig.ATTACK_RANGE}格 | 伤害：极高 | 成本：${SniperTowerConfig.BASE_COST}金币` }
    ];

    for (const weapon of weapons) {
      currentY += previewSize + previewSpacing;
      currentY += getTextHeight(weapon.name);
      currentY += getTextHeight(weapon.desc);
      currentY += lineHeight * 1.2;
    }

    currentY += lineHeight * 0.5;

    // 敌人类型
    currentY += getTextHeight('【敌人类型】');
    currentY += lineHeight * 0.5;

    const enemies = [
      { name: '普通坦克', desc: `基础敌人\n生命：${EnemyTankConfig.MAX_HP} | 速度：中等 | 奖励：${EnemyTankConfig.KILL_REWARD}金币`, size: EnemyTankConfig.SIZE, type: 'tank' },
      { name: '快速敌人', desc: `移动速度快\n生命：${FastEnemyConfig.MAX_HP} | 速度：快 | 奖励：${FastEnemyConfig.KILL_REWARD}金币`, size: FastEnemyConfig.SIZE, type: 'fast' },
      { name: '重型敌人', desc: `生命值高，移动慢\n生命：${HeavyEnemyConfig.MAX_HP} | 速度：慢 | 奖励：${HeavyEnemyConfig.KILL_REWARD}金币`, size: HeavyEnemyConfig.SIZE, type: 'heavy' },
      { name: '飞行敌人', desc: `可飞越障碍物\n生命：${FlyingEnemyConfig.MAX_HP} | 速度：中快 | 奖励：${FlyingEnemyConfig.KILL_REWARD}金币`, size: FlyingEnemyConfig.SIZE, type: 'flying' },
      { name: '自爆敌人', desc: `死亡时爆炸造成范围伤害\n生命：${BomberEnemyConfig.MAX_HP} | 速度：中 | 奖励：${BomberEnemyConfig.KILL_REWARD}金币`, size: BomberEnemyConfig.SIZE, type: 'bomber' }
    ];

    for (const enemy of enemies) {
      currentY += previewSize + previewSpacing;
      currentY += getTextHeight(enemy.name);
      currentY += getTextHeight(enemy.desc);
      currentY += lineHeight * 1.2;
    }

    currentY += lineHeight * 0.5;

    // 提示
    currentY += getTextHeight('【提示】');
    currentY += getTextHeight('• 合理布局武器位置');
    currentY += getTextHeight('• 优先升级高价值武器');
    currentY += getTextHeight('• 注意敌人的移动路径');

    return currentY;
  }

  /**
   * 渲染内容（使用离屏 Canvas 缓存优化）
   */
  static render(ctx, contentX, contentStartY, contentWidth, scrollY) {
    // 初始化缓存（如果未初始化或内容宽度变化）
    if (!this._initialized || this._cachedContentWidth !== contentWidth) {
      this.initCache(ctx, contentWidth);
    }

    // 从离屏 Canvas 复制可见区域
    if (this._cachedCanvas) {
      // 计算可见区域
      const sourceY = Math.max(0, scrollY);
      const visibleHeight = Math.min(
        this._cachedContentHeight - sourceY,
        ctx.canvas.height - contentStartY // 限制为内容区域高度
      );
      
      // 目标 Y 坐标（内容区域的起始位置）
      const destY = contentStartY;

      // 只绘制可见部分
      if (visibleHeight > 0 && sourceY < this._cachedContentHeight) {
        ctx.drawImage(
          this._cachedCanvas,
          0, sourceY, contentWidth, visibleHeight,  // 源区域（从离屏 Canvas）
          contentX, destY, contentWidth, visibleHeight  // 目标区域（到主 Canvas）
        );
      }
    }
  }

  /**
   * 绘制文本段落（标题+内容）
   */
  static _drawTextSection(ctx, x, y, width, lineHeight, title, content) {
    const font = `${UIConfig.SUBTITLE_FONT_SIZE * 0.9}px Arial`;

    // 绘制标题
    if (title) {
      const titleLines = TextRenderer.wrapText(ctx, title, width, `bold ${font}`);
      y = TextRenderer.drawMultilineText(ctx, titleLines, x, y, lineHeight, {
        font: `bold ${font}`,
        color: GameColors.ROCKET_TOWER,
        alpha: 0.9,
        align: 'left',
        baseline: 'top'
      });
      y += lineHeight * 0.3;
    }

    // 绘制内容
    if (content) {
      const contentLines = content.split('\n');
      let currentY = y;
      for (const line of contentLines) {
        const color = line.startsWith('•') ? GameColors.ROCKET_TOWER : GameColors.TEXT_MAIN;
        const alpha = line.startsWith('•') ? 0.8 : 0.85;

        const wrappedLines = TextRenderer.wrapText(ctx, line, width, font);
        currentY = TextRenderer.drawMultilineText(ctx, wrappedLines, x, currentY, lineHeight, {
          font,
          color,
          alpha,
          align: 'left',
          baseline: 'top'
        });
      }
      y = currentY;
    }

    return y;
  }

  /**
   * 绘制武器预览图片
   */
  static _drawWeaponPreview(ctx, x, y, weaponType, size) {
    polyfillRoundRect(ctx);
    ctx.save();

    // 绘制背景框
    ctx.fillStyle = ColorUtils.hexToCanvas(0x1a1a2e, 0.8);
    ctx.beginPath();
    ctx.roundRect(x - size / 2 - 2, y - size / 2 - 2, size + 4, size + 4, 4);
    ctx.fill();

    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.UI_BORDER, 0.5);
    ctx.lineWidth = 1;
    ctx.stroke();

    // 绘制武器图标
    ctx.translate(x, y);
    WeaponRenderer.renderWeaponIcon(ctx, 0, 0, weaponType, size * 0.8);

    ctx.restore();
  }

  /**
   * 绘制敌人预览图片
   */
  static _drawEnemyPreview(ctx, x, y, enemySize, previewSize, enemyType = 'tank') {
    polyfillRoundRect(ctx);
    ctx.save();

    // 绘制背景框
    ctx.fillStyle = ColorUtils.hexToCanvas(0x1a1a2e, 0.8);
    ctx.beginPath();
    ctx.roundRect(x - previewSize / 2 - 2, y - previewSize / 2 - 2, previewSize + 4, previewSize + 4, 4);
    ctx.fill();

    ctx.strokeStyle = ColorUtils.hexToCanvas(GameColors.ENEMY_DETAIL, 0.5);
    ctx.lineWidth = 1;
    ctx.stroke();

    // 绘制敌人图标
    const scale = previewSize / enemySize;
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    switch (enemyType) {
      case 'tank':
        EnemyRenderer.renderEnemyTank(ctx, 0, 0, enemySize, 0);
        break;
      case 'fast':
        EnemyRenderer.renderFastEnemy(ctx, 0, 0, enemySize, 0);
        break;
      case 'heavy':
        EnemyRenderer.renderHeavyEnemy(ctx, 0, 0, enemySize, 0);
        break;
      case 'flying':
        EnemyRenderer.renderFlyingEnemy(ctx, 0, 0, enemySize, 0);
        break;
      case 'bomber':
        EnemyRenderer.renderBomberEnemy(ctx, 0, 0, enemySize, 0);
        break;
      default:
        EnemyRenderer.renderEnemyTank(ctx, 0, 0, enemySize, 0);
    }

    ctx.restore();
  }
}

