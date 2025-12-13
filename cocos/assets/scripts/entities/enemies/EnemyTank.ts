/**
 * 敌方坦克
 * 从左向右移动，攻击我方武器
 */

import { _decorator, Vec3, Graphics, instantiate, Prefab } from 'cc';
import { EnemyBase } from '../base/EnemyBase';
import { GameConfig } from '../../config/GameConfig';
import { GameColors } from '../../config/Colors';
import { EnemyRenderer } from '../../rendering/EnemyRenderer';

const { ccclass, property } = _decorator;

@ccclass('EnemyTank')
export class EnemyTank extends EnemyBase {
    @property(Prefab)
    bulletPrefab: Prefab | null = null;
    
    private bullets: any[] = [];
    
    onLoad() {
        super.onLoad();
        
        // 设置敌人属性
        this.maxHp = GameConfig.ENEMY_MAX_HP;
        this.hp = this.maxHp;
        this.moveSpeed = GameConfig.ENEMY_MOVE_SPEED;
        this.attackRange = GameConfig.ENEMY_ATTACK_RANGE;
        this.fireInterval = GameConfig.ENEMY_FIRE_INTERVAL;
        this.damage = GameConfig.ENEMY_BULLET_DAMAGE;
        
        this.createVisual();
    }
    
    /**
     * 创建敌人坦克视觉
     */
    private createVisual() {
        const graphics = this.node.getComponent(Graphics) || this.node.addComponent(Graphics);
        const size = GameConfig.ENEMY_SIZE;
        EnemyRenderer.renderEnemyTank(graphics, size);
    }
    
    /**
     * 更新敌人坦克（由 EnemyManager 调用）
     */
    updateEnemy(deltaTime: number, deltaMS: number, weapons: any[] = []) {
        super.updateEnemy(deltaTime, deltaMS, weapons);
        
        // 更新子弹（子弹的 update 由 Cocos 自动调用，这里只需要检查是否需要销毁）
        if (this.bullets && this.bullets.length > 0) {
            this.bullets = this.bullets.filter(bullet => {
                if (!bullet || !bullet.isValid) return false;
                
                const bulletComp = bullet.getComponent('EnemyBullet');
                if (bulletComp && bulletComp.shouldDestroy()) {
                    bullet.destroy();
                    return false;
                }
                
                return true;
            });
        }
    }
    
    /**
     * 开火
     */
    protected fire(target: any) {
        if (!this.bulletPrefab) {
            console.error('[EnemyTank] fire: bulletPrefab is null');
            return;
        }
        
        if (!target) {
            console.error('[EnemyTank] fire: target is null');
            return;
        }
        
        // 确保 target 有 node 属性
        const targetNode = target.node || target;
        if (!targetNode || !targetNode.isValid) {
            console.error('[EnemyTank] fire: targetNode is invalid');
            return;
        }
        
        // 创建子弹
        const bulletNode = instantiate(this.bulletPrefab);
        if (!bulletNode) {
            console.error('[EnemyTank] fire: failed to instantiate bullet');
            return;
        }
        
        // 计算发射位置和方向（从敌人中心发射）
        // 注意：Cocos Creator Y轴向上，需要对 dy 取反以匹配原游戏的角度计算
        const dx = targetNode.position.x - this.node.position.x;
        const dy = targetNode.position.y - this.node.position.y;
        // 对 dy 取反，适配 Y 轴向上（与原游戏 PixiJS Y轴向下保持一致）
        const angleRad = Math.atan2(-dy, dx);
        
        // 从敌人中心发射
        const muzzleX = this.node.position.x;
        const muzzleY = this.node.position.y;
        
        bulletNode.setPosition(new Vec3(muzzleX, muzzleY, 0));
        
        // 先添加到场景，再初始化（确保节点在场景中）
        const world = this.node.parent;
        if (!world) {
            console.error('[EnemyTank] fire: world is null');
            bulletNode.destroy();
            return;
        }
        
        // 先设置 layer 和 active，再添加到父节点
        bulletNode.layer = world.layer;
        bulletNode.active = true;  // 确保节点激活
        
        world.addChild(bulletNode);
        
        // 初始化子弹（在添加到场景后）
        // 注意：使用类型名称而不是字符串
        const bulletComp = bulletNode.getComponent('EnemyBullet') as any;
        if (!bulletComp) {
            console.error('[EnemyTank] fire: EnemyBullet component not found');
            bulletNode.destroy();
            return;
        }
        
        bulletComp.init(angleRad, {
            speed: GameConfig.ENEMY_BULLET_SPEED,
            damage: this.damage,
            color: GameColors.ENEMY_BULLET
        });
        
        this.bullets.push(bulletNode);
        
        // 播放音效
        const soundManager = (this as any).gameContext?.soundManager;
        if (soundManager && soundManager.playFire) {
            soundManager.playFire();
        }
    }
    
    onDestroy() {
        // 清理所有子弹
        this.bullets.forEach(bullet => {
            if (bullet && bullet.isValid) {
                bullet.destroy();
            }
        });
        this.bullets = [];
    }
}

