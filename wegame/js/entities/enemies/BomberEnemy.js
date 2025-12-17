/**
 * 自爆敌人（接近武器时自爆）
 */

import { Enemy } from './Enemy';
import { BomberEnemyRenderer } from '../../rendering/enemies/BomberEnemyRenderer';
import { BomberEnemyConfig } from '../../config/enemies/BomberEnemyConfig';
import { GameConfig } from '../../config/GameConfig';
import { GameContext } from '../../core/GameContext';
import { GameColors } from '../../config/Colors';
import { ParticleConfig } from '../../config/ParticleConfig';

export class BomberEnemy extends Enemy {
  constructor(ctx, x, y) {
    super(ctx, x, y);
    
    this.maxHp = BomberEnemyConfig.MAX_HP;
    this.hp = this.maxHp;
    this.moveSpeed = BomberEnemyConfig.MOVE_SPEED;
    this.attackRange = 0; // 不自爆敌人不攻击，只自爆
    this.fireInterval = 0;
    this.damage = 0;
    this.size = BomberEnemyConfig.SIZE;
    
    this.explosionRange = BomberEnemyConfig.EXPLOSION_RANGE;
    this.explosionDamage = BomberEnemyConfig.EXPLOSION_DAMAGE;
    this.hasExploded = false;
  }
  
  /**
   * 更新自爆敌人
   */
  update(deltaTime, deltaMS, weapons) {
    if (this.destroyed || this.finished) return;
    
    // 检查是否接近武器，如果接近则自爆
    if (!this.hasExploded && weapons && weapons.length > 0) {
      const explosionRangeSq = (this.explosionRange * GameConfig.CELL_SIZE) ** 2;
      
      for (const weapon of weapons) {
        if (!weapon || weapon.destroyed) continue;
        
        const dx = weapon.x - this.x;
        const dy = weapon.y - this.y;
        const distSq = dx * dx + dy * dy;
        
        if (distSq <= explosionRangeSq) {
          // 自爆：对范围内所有武器造成伤害
          this.explode(weapons);
          return;
        }
      }
    }
    
    // 正常移动（不自爆敌人不攻击，只移动）
    super.update(deltaTime, deltaMS, weapons);
  }
  
  /**
   * 自爆
   */
  explode(weapons) {
    if (this.hasExploded) return;
    this.hasExploded = true;
    this.destroyed = true;
    
    // 播放爆炸音效
    const gameContext = GameContext.getInstance();
    if (gameContext.audioManager) {
      gameContext.audioManager.playBoomSound();
    }
    
    const explosionRangeSq = (this.explosionRange * GameConfig.CELL_SIZE) ** 2;
    
    // 对范围内所有武器造成伤害
    if (weapons && weapons.length > 0) {
      for (const weapon of weapons) {
        if (!weapon || weapon.destroyed) continue;
        
        const dx = weapon.x - this.x;
        const dy = weapon.y - this.y;
        const distSq = dx * dx + dy * dy;
        
        if (distSq <= explosionRangeSq) {
          weapon.takeDamage(this.explosionDamage);
        }
      }
    }
    
    // 创建爆炸效果
    if (gameContext.particleManager) {
      gameContext.particleManager.createExplosion(
        this.x,
        this.y,
        GameColors.ENEMY_TANK,
        ParticleConfig.PARTICLE_EXPLOSION_COUNT * 2 // 自爆效果更强烈
      );
    }
  }
  
  /**
   * 渲染自爆敌人
   */
  render(viewLeft = -Infinity, viewRight = Infinity, viewTop = -Infinity, viewBottom = Infinity, offsetX = 0, offsetY = 0) {
    if (this.destroyed || this.finished) return;
    
    BomberEnemyRenderer.render(this.ctx, this.x + offsetX, this.y + offsetY, this.size, this.angle);
  }
}

