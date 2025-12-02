/**
 * 音效管理器
 * 负责管理游戏中的所有音频播放
 * 
 * 功能：
 * - 背景音乐（循环播放）
 * - 武器开火音效（音效池）
 * - 敌人死亡音效（音效池）
 * 
 * 实现基于浏览器原生 Audio API
 * 音频文件路径（webpack 构建时会自动复制）：
 *   - src/audio/bg.wav    → /audio/bg.wav    （背景音乐）
 *   - src/audio/shoot.wav → /audio/shoot.wav （武器开火）
 *   - src/audio/boom.wav  → /audio/boom.wav  （敌人死亡爆炸）
 * 
 * 特点：
 * - 使用音效池避免同一音效同时播放时的冲突
 * - 自动容错，音频加载失败不会影响游戏运行
 * - 兼容浏览器自动播放策略
 */

class SoundManager {
  /**
   * 构造函数
   */
  constructor() {
    this.initialized = false;    // 是否已初始化
    this.bgAudio = null;          // 背景音乐Audio对象
    this.fireAudioPool = [];      // 开火音效池
    this.deathAudioPool = [];     // 死亡音效池
    this.poolSize = 6;            // 音效池大小
  }

  /**
   * 初始化音频系统
   * 加载所有音频文件并创建音效池
   */
  init() {
    // 防止重复初始化
    if (this.initialized) return;
    
    // 非浏览器环境检查（例如服务端渲染或构建时）
    if (typeof Audio === 'undefined') {
      return;
    }

    // === 初始化背景音乐 ===
    try {
      this.bgAudio = new Audio('/audio/bg.wav');
      this.bgAudio.loop = true;      // 循环播放
      this.bgAudio.volume = 0.35;    // 音量设置为35%
    } catch (e) {
      // 加载失败则置空，后续播放时会自动跳过
      this.bgAudio = null;
    }

    // === 创建武器开火音效池 ===
    // 使用音效池可以同时播放多个开火音效而不互相干扰
    for (let i = 0; i < this.poolSize; i += 1) {
      try {
        const a = new Audio('/audio/shoot.wav');
        a.volume = 0.5;
        this.fireAudioPool.push(a);
      } catch (e) {
        break; // 加载失败则停止创建
      }
    }

    // === 创建敌人死亡音效池 ===
    for (let i = 0; i < this.poolSize; i += 1) {
      try {
        const a = new Audio('/audio/boom.wav');
        a.volume = 0.6;
        this.deathAudioPool.push(a);
      } catch (e) {
        break;
      }
    }

    this.initialized = true;
  }

  /**
   * 播放背景音乐
   * 应在用户交互后调用（如点击"开始游戏"按钮）
   * 以符合浏览器的自动播放策略
   */
  playBackground() {
    if (!this.bgAudio) return;
    try {
      // 重置播放位置到开始
      this.bgAudio.currentTime = 0;
      
      // 播放音乐
      const p = this.bgAudio.play();
      
      // play() 返回 Promise，捕获可能的错误
      // 某些浏览器在资源缺失或不支持时会 reject
      if (p && typeof p.catch === 'function') {
        p.catch(() => {}); // 忽略错误
      }
    } catch (e) {
      // 忽略播放失败
    }
  }

  /**
   * 停止背景音乐
   */
  stopBackground() {
    if (!this.bgAudio) return;
    try {
      this.bgAudio.pause();
    } catch (e) {
      // 忽略错误
    }
  }

  /**
   * 从音效池中播放音效
   * 优先使用空闲的 Audio 对象，如果都在播放则使用第一个
   * 
   * @param {Array<Audio>} pool - 音效池
   */
  playFromPool(pool) {
    if (!pool || !pool.length) return;
    
    // 查找空闲的 Audio 对象（已暂停的）
    const audio = pool.find((a) => a.paused);
    
    // 如果都在播放，使用第一个（会中断当前播放）
    const target = audio || pool[0];
    
    try {
      target.currentTime = 0; // 重置到开始
      const p = target.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {}); // 忽略错误
      }
    } catch (e) {
      // 忽略播放失败
    }
  }

  /**
   * 播放武器开火音效
   */
  playFire() {
    this.playFromPool(this.fireAudioPool);
  }

  /**
   * 播放敌人死亡音效
   */
  playEnemyDeath() {
    this.playFromPool(this.deathAudioPool);
  }
}

// 导出全局单例
export const soundManager = new SoundManager();


