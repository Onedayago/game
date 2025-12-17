/**
 * 资源加载器
 * 负责游戏资源的异步加载和进度管理
 */

export class ResourceLoader {
  constructor(loadingScreen) {
    this.loadingScreen = loadingScreen;
  }

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 加载游戏资源
   */
  async loadResources() {
    const totalSteps = 5;
    let currentStep = 0;

    const updateProgress = (step, text) => {
      currentStep = step;
      const progress = currentStep / totalSteps;
      if (this.loadingScreen) {
        this.loadingScreen.setProgress(progress, text);
      }
    };

    try {
      // 步骤 1: 初始化配置
      updateProgress(1, '初始化配置...');
      await this.delay(100);

      // 步骤 2: 初始化渲染缓存
      updateProgress(2, '初始化渲染缓存...');
      await this.delay(200);

      // 步骤 3: 初始化UI缓存
      updateProgress(3, '初始化UI界面...');
      await this.delay(200);

      // 步骤 4: 初始化游戏资源
      updateProgress(4, '加载游戏资源...');
      await this.delay(200);

      // 步骤 5: 完成
      updateProgress(5, '加载完成！');
      await this.delay(300);

      return true;
    } catch (error) {
      if (this.loadingScreen) {
        this.loadingScreen.setProgress(1, '加载失败，请重试');
      }
      throw error;
    }
  }
}

