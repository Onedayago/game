/**
 * 音效管理器
 * 负责游戏音频的播放和管理
 */

import { AudioClip, AudioSource, _decorator } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SoundManager')
export class SoundManager {
    private static instance: SoundManager;
    
    @property(AudioClip)
    bgMusic: AudioClip | null = null;
    
    @property(AudioClip)
    shootSound: AudioClip | null = null;
    
    @property(AudioClip)
    boomSound: AudioClip | null = null;
    
    private bgAudioSource: AudioSource | null = null;
    private sfxAudioSources: AudioSource[] = [];
    private maxSfxSources = 10;  // 最大音效源数量
    
    static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }
    
    /**
     * 初始化音效系统
     */
    init(node: any) {
        // 创建背景音乐音源
        this.bgAudioSource = node.addComponent(AudioSource);
        if (this.bgMusic && this.bgAudioSource) {
            this.bgAudioSource.clip = this.bgMusic;
            this.bgAudioSource.loop = true;
            this.bgAudioSource.volume = 0.3;
        }
        
        // 创建音效源池
        for (let i = 0; i < this.maxSfxSources; i++) {
            const audioSource = node.addComponent(AudioSource);
            audioSource.loop = false;
            audioSource.playOnAwake = false;
            this.sfxAudioSources.push(audioSource);
        }
    }
    
    /**
     * 播放背景音乐
     */
    playBgMusic() {
        if (this.bgAudioSource && !this.bgAudioSource.playing) {
            this.bgAudioSource.play();
        }
    }
    
    /**
     * 停止背景音乐
     */
    stopBgMusic() {
        if (this.bgAudioSource) {
            this.bgAudioSource.stop();
        }
    }
    
    /**
     * 播放射击音效
     */
    playFire() {
        this.playSfx(this.shootSound);
    }
    
    /**
     * 播放爆炸音效
     */
    playBoom() {
        this.playSfx(this.boomSound);
    }
    
    /**
     * 播放音效
     */
    private playSfx(clip: AudioClip | null) {
        if (!clip) return;
        
        // 找到一个空闲的音效源
        const audioSource = this.sfxAudioSources.find(source => !source.playing);
        if (audioSource) {
            audioSource.clip = clip;
            audioSource.volume = 0.5;
            audioSource.play();
        }
    }
    
    /**
     * 设置音效音量
     */
    setSfxVolume(volume: number) {
        this.sfxAudioSources.forEach(source => {
            source.volume = volume;
        });
    }
    
    /**
     * 设置背景音乐音量
     */
    setBgMusicVolume(volume: number) {
        if (this.bgAudioSource) {
            this.bgAudioSource.volume = volume;
        }
    }
}

