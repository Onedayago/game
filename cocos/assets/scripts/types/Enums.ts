/**
 * 游戏枚举定义
 * 统一所有枚举常量
 */

/**
 * 游戏状态
 */
export enum GameState {
    INIT = 'init',
    READY = 'ready',
    PLAYING = 'playing',
    PAUSED = 'paused',
    GAME_OVER = 'gameover',
    VICTORY = 'victory'
}

/**
 * 实体类型
 */
export enum EntityType {
    WEAPON = 'weapon',
    ENEMY = 'enemy',
    BULLET = 'bullet',
    PARTICLE = 'particle'
}

/**
 * 武器状态
 */
export enum WeaponState {
    IDLE = 'idle',
    FIRING = 'firing',
    RELOADING = 'reloading',
    UPGRADING = 'upgrading',
    DESTROYED = 'destroyed'
}

/**
 * 敌人状态
 */
export enum EnemyState {
    IDLE = 'idle',
    MOVING = 'moving',
    ATTACKING = 'attacking',
    DYING = 'dying',
    DEAD = 'dead'
}

/**
 * 移动方向
 */
export enum Direction {
    UP = 'up',
    DOWN = 'down',
    LEFT = 'left',
    RIGHT = 'right'
}


/**
 * 音效类型
 */
export enum SoundType {
    BGM = 'bgm',
    SHOOT = 'shoot',
    EXPLOSION = 'explosion',
    HIT = 'hit',
    UPGRADE = 'upgrade',
    CLICK = 'click',
    PURCHASE = 'purchase',
    SELL = 'sell'
}

/**
 * 粒子效果类型
 */
export enum ParticleType {
    EXPLOSION = 'explosion',
    MUZZLE_FLASH = 'muzzle_flash',
    HIT_SPARK = 'hit_spark',
    UPGRADE_GLOW = 'upgrade_glow',
    LASER_BEAM = 'laser_beam'
}

/**
 * UI事件类型
 */
export enum UIEventType {
    BUTTON_CLICK = 'button_click',
    WEAPON_SELECT = 'weapon_select',
    WEAPON_PLACE = 'weapon_place',
    WEAPON_UPGRADE = 'weapon_upgrade',
    WEAPON_SELL = 'weapon_sell'
}

/**
 * 游戏事件类型
 */
export enum GameEventType {
    // 游戏流程
    GAME_START = 'game_start',
    GAME_PAUSE = 'game_pause',
    GAME_RESUME = 'game_resume',
    GAME_OVER = 'game_over',
    GAME_WIN = 'game_win',
    
    // 波次
    WAVE_START = 'wave_start',
    WAVE_END = 'wave_end',
    WAVE_COMPLETE = 'wave_complete',
    
    // 敌人
    ENEMY_SPAWN = 'enemy_spawn',
    ENEMY_DEATH = 'enemy_death',
    ENEMY_REACH_END = 'enemy_reach_end',
    
    // 武器
    WEAPON_PLACE = 'weapon_place',
    WEAPON_UPGRADE = 'weapon_upgrade',
    WEAPON_UPGRADE_REQUEST = 'weapon_upgrade_request',
    WEAPON_SELL = 'weapon_sell',
    WEAPON_SELL_REQUEST = 'weapon_sell_request',
    WEAPON_DESTROY = 'weapon_destroy',
    WEAPON_SELECT = 'weapon_select',
    
    // 战斗
    DAMAGE_DEALT = 'damage_dealt',
    ENTITY_HIT = 'entity_hit',
    BULLET_FIRE = 'bullet_fire',
    
    // 金币
    GOLD_GAIN = 'gold_gain',
    GOLD_SPEND = 'gold_spend',
    GOLD_CHANGE = 'gold_change',
    
    // UI
    UI_SHOW = 'ui_show',
    UI_HIDE = 'ui_hide',
    UI_UPDATE = 'ui_update'
}

/**
 * 错误类型
 */
export enum ErrorType {
    NONE = 'none',
    INVALID_POSITION = 'invalid_position',
    INSUFFICIENT_FUNDS = 'insufficient_funds',
    MAX_LEVEL = 'max_level',
    GRID_OCCUPIED = 'grid_occupied',
    NO_TARGET = 'no_target',
    RESOURCE_NOT_FOUND = 'resource_not_found'
}

/**
 * 难度等级
 */
export enum Difficulty {
    EASY = 'easy',
    NORMAL = 'normal',
    HARD = 'hard',
    EXTREME = 'extreme'
}

/**
 * 动画状态
 */
export enum AnimationState {
    IDLE = 'idle',
    ATTACK = 'attack',
    HIT = 'hit',
    DEATH = 'death',
    UPGRADE = 'upgrade'
}

/**
 * 对象池类型
 */
export enum PoolType {
    BULLET = 'bullet',
    ENEMY = 'enemy',
    PARTICLE = 'particle',
    EFFECT = 'effect'
}

