/**
 * 特效管理器
 * 管理所有游戏特效（敌人生成、武器升级等）
 */

import { EnemySpawnEffect } from './EnemySpawnEffect';
import { WeaponUpgradeEffect } from './WeaponUpgradeEffect';

export class EffectManager {
  constructor(ctx) {
    this.ctx = ctx;
    this.effects = [];
  }
  
  /**
   * 创建敌人生成特效
   */
  createEnemySpawnEffect(x, y, enemyType) {
    const effect = new EnemySpawnEffect(this.ctx, x, y, enemyType);
    this.effects.push(effect);
    return effect;
  }
  
  /**
   * 创建武器升级特效
   */
  createWeaponUpgradeEffect(x, y, weaponType, level) {
    const effect = new WeaponUpgradeEffect(this.ctx, x, y, weaponType, level);
    this.effects.push(effect);
    return effect;
  }
  
  /**
   * 更新所有特效
   */
  update(deltaTime, deltaMS) {
    let writeIndex = 0;
    for (let readIndex = 0; readIndex < this.effects.length; readIndex++) {
      const effect = this.effects[readIndex];
      if (effect && !effect.isFinished()) {
        effect.update(deltaTime, deltaMS);
        if (writeIndex !== readIndex) {
          this.effects[writeIndex] = effect;
        }
        writeIndex++;
      }
    }
    this.effects.length = writeIndex;
  }
  
  /**
   * 渲染所有特效
   */
  render(offsetX = 0, offsetY = 0) {
    for (const effect of this.effects) {
      if (effect && !effect.isFinished()) {
        effect.render(offsetX, offsetY);
      }
    }
  }
  
  /**
   * 清除所有特效
   */
  clear() {
    this.effects = [];
  }
}

