import { Container, Graphics } from 'pixi.js';
import { WEAPON_MAX_HP, COLORS, TANK_SIZE, CELL_SIZE } from '../../constants';
import { createSoftShadow, updateShadowTransform, getPerspectiveByY } from '../../core/depthUtils';

/**
 * 武器基类：提供所有武器通用的血量、等级、选中、阴影和基础渲染接口
 */
export class BaseWeapon {
  constructor(app, gridCol, gridRow, x, y) {
    this.app = app;
    this.gridCol = gridCol;
    this.gridRow = gridRow;
    
    // 基础属性
    this.level = 1;
    this.maxLevel = 3;
    this.maxHp = WEAPON_MAX_HP;
    this.hp = this.maxHp;
    
    // 状态标记
    this.upgradeFlashTimer = 0;
    this.hitFlashTimer = 0;
    this.isDead = false;
    
    // 渲染容器
    this.container = new Container();
    this.container.x = x;
    this.container.y = y;
    
    // 阴影 (通常在底层)
    const world = this.app.world || this.app.stage;
    this.shadow = createSoftShadow(TANK_SIZE * 0.45);
    this.shadow.zIndex = 0;
    this.shadow.eventMode = 'none';
    // 注意：BaseWeapon 不自动 addChild 到 world，由子类或 Factory 处理，或者在此处统一处理
    // 但由于需要控制层级（阴影在下，本体在上），通常分开 add
    world.addChild(this.shadow);
    
    // 选中高亮圈
    this.selectionRing = this.createSelectionRing();
    this.selectionRing.visible = false;
    this.selectionRing.eventMode = 'none';
    // 选中圈通常在武器底部，阴影之上
    world.addChild(this.selectionRing);
    
    // 武器本体 (子类应该在 this.container 中绘制内容)
    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';
    world.addChild(this.container);

    // 血条
    this.hpBarBg = new Graphics();
    this.hpBarFill = new Graphics();
    this.hpBarBg.eventMode = 'none';
    this.hpBarFill.eventMode = 'none';
    world.addChild(this.hpBarBg);
    world.addChild(this.hpBarFill);
    
    // 视觉缩放
    this.visualScale = 1;
    this.perspectiveScale = 1;
    
    this.updateHpBar();
    this.refreshDepthVisual();
  }

  createSelectionRing() {
    const g = new Graphics()
      .circle(0, 0, TANK_SIZE * 0.85)
      .stroke({ width: 2, color: COLORS.GOLD, alpha: 0.3 })
      .circle(0, 0, TANK_SIZE * 0.75)
      .stroke({ width: 3, color: COLORS.GOLD, alpha: 0.6 })
      .circle(0, 0, TANK_SIZE * 0.7)
      .stroke({ width: 4, color: COLORS.GOLD, alpha: 1 });
    g.x = this.container.x;
    g.y = this.container.y;
    return g;
  }

  /**
   * 子类需实现此方法来更新武器逻辑
   */
  update(delta, deltaMS, enemies) {
    // 基础动画效果
    this.updateVisuals(deltaMS);
  }

  updateVisuals(deltaMS) {
    // 升级闪光
    if (this.upgradeFlashTimer > 0) {
      this.upgradeFlashTimer -= deltaMS;
      const t = Math.max(0, 1 - this.upgradeFlashTimer / 260);
      this.visualScale = 1 + 0.18 * Math.sin(t * Math.PI);
    } else {
      this.visualScale = 1;
    }

    // 受击闪烁
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= deltaMS;
      this.container.alpha = 0.6 + 0.4 * Math.sin(this.hitFlashTimer * 0.1);
    } else {
      this.container.alpha = 1;
    }

    this.applyCombinedScale();
    
    // 更新血条位置
    if (this.hp < this.maxHp) {
      this.updateHpBar();
    }
  }

  refreshDepthVisual() {
    this.perspectiveScale = getPerspectiveByY(this.container.y);
    this.applyCombinedScale();
    updateShadowTransform(this.shadow, this.container.x, this.container.y, this.perspectiveScale);
    if (this.selectionRing) {
        this.selectionRing.scale.set(this.perspectiveScale);
    }
  }

  applyCombinedScale() {
    const s = this.visualScale * this.perspectiveScale;
    this.container.scale.set(s);
  }

  updateHpBar() {
    const percent = Math.max(0, this.hp / this.maxHp);
    const barWidth = CELL_SIZE * 0.8;
    const barHeight = 4;
    const yOffset = -CELL_SIZE * 0.6;
    
    const px = this.container.x - barWidth / 2;
    const py = this.container.y + yOffset;

    this.hpBarBg.clear();
    this.hpBarFill.clear();

    if (this.hp >= this.maxHp) return;

    this.hpBarBg
      .rect(px, py, barWidth, barHeight)
      .fill({ color: 0x000000, alpha: 0.6 });
    
    const color = percent > 0.5 ? COLORS.SUCCESS : percent > 0.25 ? COLORS.GOLD : COLORS.DANGER;
    this.hpBarFill
      .rect(px, py, barWidth * percent, barHeight)
      .fill({ color });
  }

  takeDamage(amount) {
    if (this.isDead) return;
    this.hp -= amount;
    this.hitFlashTimer = 200;
    this.updateHpBar();
    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
    }
  }

  upgrade() {
    if (this.level >= this.maxLevel) return;
    this.level += 1;
    this.upgradeFlashTimer = 260;
    this.onUpgrade(); // 钩子
  }

  onUpgrade() {
    // 子类实现
  }

  setSelected(selected) {
    if (this.selectionRing) {
      this.selectionRing.visible = !!selected;
    }
  }

  destroy() {
    const world = this.app.world || this.app.stage;
    if (this.shadow) world.removeChild(this.shadow);
    if (this.selectionRing) world.removeChild(this.selectionRing);
    if (this.hpBarBg) world.removeChild(this.hpBarBg);
    if (this.hpBarFill) world.removeChild(this.hpBarFill);
    if (this.container) world.removeChild(this.container);
  }
}

