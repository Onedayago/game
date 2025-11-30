/* 简单声音管理器：
 * - 背景音乐（循环播放）
 * - 武器开火音效
 * - 敌人死亡音效
 *
 * 实现基于浏览器原生 Audio。
 * 实际音频文件请放到 src/audio/ 目录中，webpack 构建时会自动复制到 dist/audio/：
 *   - src/audio/bg.wav       →  /audio/bg.wav          （背景音乐）
 *   - src/audio/shoot.wav    →  /audio/shoot.wav       （武器开火）
 *   - src/audio/boom.wav     →  /audio/boom.wav        （敌人死亡爆炸）
 *
 * 如果文件不存在或加载失败，代码会自动忽略，不会影响游戏运行。
 */

class SoundManager {
  constructor() {
    this.initialized = false;
    this.bgAudio = null;
    this.fireAudioPool = [];
    this.deathAudioPool = [];
    this.poolSize = 6;
  }

  init() {
    if (this.initialized) return;
    if (typeof Audio === 'undefined') {
      // 非浏览器环境（例如构建时），直接跳过
      return;
    }

    // 背景音乐（循环）
    try {
      this.bgAudio = new Audio('/audio/bg.wav');
      this.bgAudio.loop = true;
      this.bgAudio.volume = 0.35;
    } catch (e) {
      this.bgAudio = null;
    }

    // 武器开火音效池
    for (let i = 0; i < this.poolSize; i += 1) {
      try {
        const a = new Audio('/audio/shoot.wav');
        a.volume = 0.5;
        this.fireAudioPool.push(a);
      } catch (e) {
        break;
      }
    }

    // 敌人死亡音效池
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

  playBackground() {
    if (!this.bgAudio) return;
    try {
      // 为了兼容浏览器“用户交互后才能播放”的限制，应在点击“开始游戏”后调用
      this.bgAudio.currentTime = 0;
      const p = this.bgAudio.play();
      // 某些浏览器中 play() 返回的 Promise 会在资源缺失/不支持时 reject，这里统一吞掉
      if (p && typeof p.catch === 'function') {
        p.catch(() => {});
      }
    } catch (e) {
      // 忽略播放失败
    }
  }

  stopBackground() {
    if (!this.bgAudio) return;
    try {
      this.bgAudio.pause();
    } catch (e) {
      // ignore
    }
  }

  playFromPool(pool) {
    if (!pool || !pool.length) return;
    const audio = pool.find((a) => a.paused);
    const target = audio || pool[0];
    try {
      target.currentTime = 0;
      const p = target.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {});
      }
    } catch (e) {
      // ignore
    }
  }

  playFire() {
    this.playFromPool(this.fireAudioPool);
  }

  playEnemyDeath() {
    this.playFromPool(this.deathAudioPool);
  }
}

// 全局单例
export const soundManager = new SoundManager();


