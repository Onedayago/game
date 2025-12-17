/**
 * 音频管理器
 * 使用微信小游戏 createInnerAudioContext API 管理背景音乐和音效
 */

export class AudioManager {
  static AUDIO_PATHS = {
    BACKGROUND: 'js/audio/bg.mp3',
    SHOOT: 'js/audio/shoot.mp3',
    BOOM: 'js/audio/boom.mp3'
  };
  
  static SFX_POOL_INIT_SIZE = 4;
  static SFX_POOL_MAX_SIZE = 16;
  
  constructor() {
    this.bgMusic = null;
    
    // 音效池：可用实例列表
    this.availablePool = [];
    // 正在播放的实例列表
    this.playingInstances = [];
    
    this.musicVolume = 1.0;
    this.sfxVolume = 1.0;
    this.musicMuted = false;
    this.sfxMuted = false;
    
    this._initSfxPool();
  }
  
  /**
   * 初始化音效池
   * 创建初始数量的音频实例，放入可用池
   * @private
   */
  _initSfxPool() {
    for (let i = 0; i < AudioManager.SFX_POOL_INIT_SIZE; i++) {
      const audio = this._createAudioInstance();
      this.availablePool.push(audio);
    }
  }
  
  /**
   * 创建音频实例
   * @private
   */
  _createAudioInstance() {
    const audio = wx.createInnerAudioContext();
    audio.volume = this.sfxVolume;
    return audio;
  }
  
  /**
   * 从池中获取一个可用实例
   * 如果池中没有可用实例，创建新实例
   * @private
   */
  _getAvailableInstance() {
    if (this.availablePool.length > 0) {
      return this.availablePool.pop();
    }
    
    // 池中没有可用实例，创建新实例
    return this._createAudioInstance();
  }
  
  /**
   * 回收实例到池中
   * 如果池子太大，销毁实例；否则放回池中
   * @private
   */
  _recycleInstance(audio) {
    if (!audio) {
      return;
    }
    
    // 从正在播放列表中移除
    const index = this.playingInstances.indexOf(audio);
    if (index !== -1) {
      this.playingInstances.splice(index, 1);
    }
    
    // 检查是否已经在可用池中（防止重复回收）
    if (this.availablePool.indexOf(audio) !== -1) {
      return;
    }
    
    // 如果池子未达到最大大小，放回池中；否则销毁
    const totalInstances = this.availablePool.length + this.playingInstances.length;
    if (totalInstances < AudioManager.SFX_POOL_MAX_SIZE) {
      if (audio.stop) {
        audio.stop();
      }
      this.availablePool.push(audio);
    } else {
      if (audio.stop) {
        audio.stop();
      }
      if (audio.destroy) {
        audio.destroy();
      }
    }
  }
  
  /**
   * 初始化背景音乐
   */
  initBackgroundMusic() {
    if (this.bgMusic) {
      return;
    }
    
    this.bgMusic = wx.createInnerAudioContext();
    this.bgMusic.src = AudioManager.AUDIO_PATHS.BACKGROUND;
    this.bgMusic.loop = true;
    this.bgMusic.volume = this.musicVolume;
  }
  
  /**
   * 播放背景音乐
   */
  playBackgroundMusic() {
    if (!this.bgMusic) {
      this.initBackgroundMusic();
    }
    
    if (this.bgMusic && !this.musicMuted) {
      this.bgMusic.play();
    }
  }
  
  /**
   * 暂停背景音乐
   */
  pauseBackgroundMusic() {
    if (this.bgMusic) {
      this.bgMusic.pause();
    }
  }
  
  /**
   * 停止背景音乐
   */
  stopBackgroundMusic() {
    if (this.bgMusic) {
      this.bgMusic.stop();
    }
  }
  
  /**
   * 恢复背景音乐
   */
  resumeBackgroundMusic() {
    if (this.bgMusic && !this.musicMuted) {
      this.bgMusic.play();
    }
  }
  
  /**
   * 播放音效
   * 每次播放使用新实例，不停止正在播放的音效
   * @param {string} soundType - 音效类型 ('shoot' | 'boom')
   */
  playSound(soundType) {
    if (this.sfxMuted) {
      return;
    }
    
    const audioPath = AudioManager.AUDIO_PATHS[soundType.toUpperCase()];
    if (!audioPath) {
      return;
    }
    
    // 从可用池中获取一个实例（或创建新实例）
    const audio = this._getAvailableInstance();
    
    // 设置音频源和音量
    audio.src = audioPath;
    audio.volume = this.sfxVolume;
    
    // 标记是否已回收，防止重复回收
    let recycled = false;
    const recycleOnce = () => {
      if (!recycled) {
        recycled = true;
        this._recycleInstance(audio);
      }
    };
    
    // 监听播放结束事件，回收实例
    audio.onEnded(recycleOnce);
    
    // 监听播放错误，也要回收实例
    audio.onError(recycleOnce);
    
    // 添加到正在播放列表
    this.playingInstances.push(audio);
    
    // 开始播放
    audio.play();
  }
  
  /**
   * 播放射击音效
   */
  playShootSound() {
    // this.playSound('shoot');
  }
  
  /**
   * 播放爆炸音效
   */
  playBoomSound() {
    this.playSound('boom');
  }
  
  /**
   * 设置背景音乐音量
   * @param {number} volume - 音量值 (0.0 - 1.0)
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.bgMusic) {
      this.bgMusic.volume = this.musicVolume;
    }
  }
  
  /**
   * 设置音效音量
   * @param {number} volume - 音量值 (0.0 - 1.0)
   */
  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    // 更新所有可用池和正在播放的实例音量
    this.availablePool.forEach(audio => {
      audio.volume = this.sfxVolume;
    });
    this.playingInstances.forEach(audio => {
      audio.volume = this.sfxVolume;
    });
  }
  
  /**
   * 静音/取消静音背景音乐
   * @param {boolean} muted - 是否静音
   */
  setMusicMuted(muted) {
    this.musicMuted = muted;
    if (muted) {
      this.pauseBackgroundMusic();
    } else {
      this.resumeBackgroundMusic();
    }
  }
  
  /**
   * 静音/取消静音音效
   * @param {boolean} muted - 是否静音
   */
  setSfxMuted(muted) {
    this.sfxMuted = muted;
    if (muted) {
      // 停止所有正在播放的音效（先复制数组，避免遍历时修改数组）
      const playing = [...this.playingInstances];
      playing.forEach(audio => {
        if (audio && audio.stop) {
          audio.stop();
        }
        this._recycleInstance(audio);
      });
    }
  }
  
  /**
   * 获取背景音乐音量
   * @returns {number}
   */
  getMusicVolume() {
    return this.musicVolume;
  }
  
  /**
   * 获取音效音量
   * @returns {number}
   */
  getSfxVolume() {
    return this.sfxVolume;
  }
  
  /**
   * 检查背景音乐是否静音
   * @returns {boolean}
   */
  isMusicMuted() {
    return this.musicMuted;
  }
  
  /**
   * 检查音效是否静音
   * @returns {boolean}
   */
  isSfxMuted() {
    return this.sfxMuted;
  }
  
  /**
   * 销毁音频管理器，释放资源
   */
  destroy() {
    if (this.bgMusic) {
      this.bgMusic.stop();
      this.bgMusic.destroy();
      this.bgMusic = null;
    }
    
    // 销毁所有可用池中的实例
    this.availablePool.forEach(audio => {
      audio.stop();
      audio.destroy();
    });
    this.availablePool = [];
    
    // 销毁所有正在播放的实例
    this.playingInstances.forEach(audio => {
      audio.stop();
      audio.destroy();
    });
    this.playingInstances = [];
  }
}
