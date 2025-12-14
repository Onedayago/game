/**
 * 游戏输入处理器
 * 处理触摸事件和战场拖拽
 */

import { GameConfig } from '../config/GameConfig';
import { UIRenderer } from '../ui/UIRenderer';

export class GameInputHandler {
  constructor(gameContext) {
    this.gameContext = gameContext;
    this.isPanning = false;
    this.panStartX = 0;
    this.panStartY = 0;
    this.worldStartX = 0;
    this.panThreshold = 5; // 拖拽阈值，小于此值认为是点击
    this.clickedWeapon = null; // 记录点击的武器
    this.clickedButton = null; // 记录点击的按钮类型：'upgrade' 或 'sell'
  }
  
  /**
   * 触摸开始
   */
  onTouchStart(e, weaponContainerUI, startScreen, helpScreen, battlefieldMinimap, weaponManager, gameRenderer) {
    console.log('GameInputHandler.onTouchStart', e);
    
    // 微信小游戏的触摸事件格式
    const touch = e.touches && e.touches[0] ? e.touches[0] : e;
    if (!touch) {
      console.log('GameInputHandler.onTouchStart: 没有触摸点');
      return false;
    }
    
    const x = touch.x || touch.clientX || 0;
    const y = touch.y || touch.clientY || 0;
    
    console.log('GameInputHandler.onTouchStart: 触摸坐标', { x, y, touch });
    
    // 导入UIRenderer用于获取按钮边界
    const { UIRenderer } = require('../ui/UIRenderer');
    
    // 如果游戏已结束，只处理重新开始按钮点击
    if (this.gameContext.gameOver && this.gameContext.gameStarted) {
      const restartBounds = UIRenderer.getRestartButtonBounds();
      if (x >= restartBounds.x && x <= restartBounds.x + restartBounds.width &&
          y >= restartBounds.y && y <= restartBounds.y + restartBounds.height) {
        console.log('GameInputHandler: 点击了重新开始按钮');
        return 'restart'; // 返回特殊值表示重新开始游戏
      }
      // 游戏结束状态下，其他点击都忽略
      return true;
    }
    
    // 如果游戏已暂停，只处理继续按钮点击
    if (this.gameContext.gamePaused && this.gameContext.gameStarted && !this.gameContext.gameOver) {
      const resumeBounds = UIRenderer.getResumeButtonBounds();
      if (x >= resumeBounds.x && x <= resumeBounds.x + resumeBounds.width &&
          y >= resumeBounds.y && y <= resumeBounds.y + resumeBounds.height) {
        console.log('GameInputHandler: 点击了继续按钮');
        return 'resume'; // 返回特殊值表示恢复游戏
      }
      // 暂停状态下，其他点击都忽略
      return true;
    }
    
    // 如果游戏已开始且未暂停，检查暂停按钮
    if (this.gameContext.gameStarted && !this.gameContext.gamePaused) {
      const pauseBounds = UIRenderer.getPauseButtonBounds();
      if (x >= pauseBounds.x && x <= pauseBounds.x + pauseBounds.width &&
          y >= pauseBounds.y && y <= pauseBounds.y + pauseBounds.height) {
        console.log('GameInputHandler: 点击了暂停按钮');
        return 'pause'; // 返回特殊值表示暂停游戏
      }
    }
    
    // 先检查战场小视图（如果游戏已开始）
    if (battlefieldMinimap && this.gameContext.gameStarted) {
      if (battlefieldMinimap.onTouchStart(e)) {
        console.log('GameInputHandler: 战场小视图处理了触摸事件');
        return true;
      }
    }
    
    // 先检查 UI 交互（武器容器、开始界面）
    let handledByUI = false;
    
    // 先检查帮助界面（优先级最高）
    if (helpScreen && helpScreen.visible) {
      helpScreen.onTouchStart(e);
      handledByUI = true;
      console.log('GameInputHandler: 帮助界面处理了触摸事件');
      return true;
    }
    
    // 再检查开始界面（如果游戏未开始）
    if (startScreen && !this.gameContext.gameStarted) {
      startScreen.onTouchStart(e);
      handledByUI = true;
      console.log('GameInputHandler: 开始界面处理了触摸事件');
    }
    
    // 再检查武器容器（如果游戏已开始）
    if (weaponContainerUI && this.gameContext.gameStarted) {
      weaponContainerUI.onTouchStart(e);
      if (weaponContainerUI.isDragging()) {
        handledByUI = true;
        console.log('GameInputHandler: UI 处理了触摸事件（武器拖拽）');
      }
    }
    
    // 如果 UI 已经处理了，不处理战场拖拽
    if (handledByUI) {
      console.log('GameInputHandler.onTouchStart: UI 已处理，跳过战场拖拽');
      return true;
    }
    
    // 如果游戏已开始，先检查是否点击了已选中武器的按钮（优先级最高）
    if (this.gameContext.gameStarted && weaponManager) {
      const selectedWeapon = weaponManager.getSelectedWeapon();
      
      if (selectedWeapon && selectedWeapon.buttonBounds) {
        // 考虑战场偏移：按钮位置是相对于武器Canvas坐标的偏移
        // 武器的世界坐标：selectedWeapon.x, selectedWeapon.y
        // 武器的Canvas坐标：selectedWeapon.x + offsetX, selectedWeapon.y + offsetY
        const offsetX = -this.gameContext.worldOffsetX;
        const offsetY = 0;
        const weaponCanvasX = selectedWeapon.x + offsetX;
        const weaponCanvasY = selectedWeapon.y + offsetY;
        
        // 检查升级按钮
        if (selectedWeapon.buttonBounds.upgradeButton && selectedWeapon.buttonBounds.upgradeButton.enabled) {
          const btn = selectedWeapon.buttonBounds.upgradeButton;
          // 按钮位置是相对于武器Canvas坐标的偏移，所以需要加上武器Canvas坐标
          const btnX = weaponCanvasX + btn.x;
          const btnY = weaponCanvasY + btn.y;
          const btnRight = btnX + btn.width;
          const btnBottom = btnY + btn.height;
          
          // 使用容差进行边界检测，处理浮点数精度问题
          const tolerance = 2;
          if (x >= btnX - tolerance && x <= btnRight + tolerance && 
              y >= btnY - tolerance && y <= btnBottom + tolerance) {
            this.panStartX = x;
            this.panStartY = y;
            this.isPanning = false;
            this.clickedWeapon = null;
            this.clickedButton = 'upgrade';
            return true;
          }
        }
        
        // 检查出售按钮
        if (selectedWeapon.buttonBounds.sellButton && selectedWeapon.buttonBounds.sellButton.enabled) {
          const btn = selectedWeapon.buttonBounds.sellButton;
          // 按钮位置是相对于武器Canvas坐标的偏移，所以需要加上武器Canvas坐标
          const btnX = weaponCanvasX + btn.x;
          const btnY = weaponCanvasY + btn.y;
          const btnRight = btnX + btn.width;
          const btnBottom = btnY + btn.height;
          
          // 使用容差进行边界检测，处理浮点数精度问题
          const tolerance = 2;
          if (x >= btnX - tolerance && x <= btnRight + tolerance && 
              y >= btnY - tolerance && y <= btnBottom + tolerance) {
            this.panStartX = x;
            this.panStartY = y;
            this.isPanning = false;
            this.clickedWeapon = null;
            this.clickedButton = 'sell';
            return true;
          }
        }
      }
      
      // 检查是否点击了武器
      // 触摸坐标是 Canvas 坐标，需要转换为世界坐标
      // 在 GameRenderer 中，使用 offsetX = -worldOffsetX 来平移画布
      // 所以当 worldOffsetX > 0 时，画布向左移动，世界坐标需要加上这个偏移
      const worldX = x + this.gameContext.worldOffsetX;
      const worldY = y;
      const weapon = weaponManager.findWeaponAt(worldX, worldY);
      
      if (weapon) {
        // 点击了武器，不准备拖拽，记录点击位置用于 onTouchEnd
        this.panStartX = x;
        this.panStartY = y;
        this.isPanning = false; // 明确标记不是拖拽
        this.clickedWeapon = weapon; // 记录点击的武器
        console.log('GameInputHandler.onTouchStart: 点击了武器，不准备拖拽', { weapon, worldX, worldY });
        return false; // 返回 false，让 onTouchEnd 处理
      }
    }
    
    // 清除之前点击的武器和按钮记录
    this.clickedWeapon = null;
    this.clickedButton = null;
    
    // 检查是否在战斗区域内，准备开始战场拖拽（但不立即设置 isPanning）
    if (this.isInBattleArea(x, y)) {
      this.panStartX = x;
      this.panStartY = y;
      this.worldStartX = this.gameContext.worldOffsetX;
      this.isPanning = false; // 初始不是拖拽，等 onTouchMove 确认
      console.log('GameInputHandler.onTouchStart: 准备战场拖拽', {
        x, y,
        isInBattleArea: true,
        worldOffsetX: this.gameContext.worldOffsetX,
        panStartX: this.panStartX,
        panStartY: this.panStartY,
        worldStartX: this.worldStartX
      });
    } else {
      this.isPanning = false;
      console.log('GameInputHandler.onTouchStart: 不在战斗区域内', {
        x, y,
        battleStartY: GameConfig.BATTLE_START_ROW * GameConfig.CELL_SIZE,
        battleEndY: (GameConfig.BATTLE_START_ROW + GameConfig.BATTLE_ROWS) * GameConfig.CELL_SIZE
      });
    }
    
    return false;
  }
  
  /**
   * 触摸移动
   */
  onTouchMove(e, weaponContainerUI, helpScreen, battlefieldMinimap) {
    // 如果点击了按钮，不处理拖拽
    if (this.clickedButton) {
      return;
    }
    
    // 先检查小地图拖拽（如果游戏已开始）
    if (battlefieldMinimap && this.gameContext.gameStarted && battlefieldMinimap.isDragging) {
      if (battlefieldMinimap.onTouchMove(e)) {
        return;
      }
    }
    
    // 先检查帮助界面滚动
    if (helpScreen && helpScreen.visible && helpScreen.isScrolling) {
      helpScreen.onTouchMove(e);
      return;
    }
    
    // 先检查武器拖拽，如果正在拖拽武器，不处理战场拖拽
    if (weaponContainerUI && weaponContainerUI.isDragging()) {
      weaponContainerUI.onTouchMove(e);
      return;
    }
    
    // 如果触摸点在战斗区域内，检查是否开始拖拽
    const touch = e.touches && e.touches[0] ? e.touches[0] : e;
    if (touch && this.isInBattleArea(this.panStartX, this.panStartY)) {
      const x = touch.x || touch.clientX || 0;
      const y = touch.y || touch.clientY || 0;
      const dx = Math.abs(x - this.panStartX);
      const dy = Math.abs(y - this.panStartY);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 如果移动距离超过阈值，确认是拖拽
      if (distance > this.panThreshold) {
        this.isPanning = true;
      }
      
      if (this.isPanning) {
        // 计算新位置并限制拖动范围
        // 用户向右拖动（dx > 0），应该显示更多右侧内容，所以 worldOffsetX 应该增加
        // 但为了符合直觉（向右拖动显示右侧），需要反转 dx
        const { minX, maxX } = this.calculatePanBounds();
        let nextX = this.worldStartX - (x - this.panStartX); // 反转 dx
        nextX = Math.max(minX, Math.min(maxX, nextX));
        
        this.gameContext.worldOffsetX = nextX;
        console.log('GameInputHandler.onTouchMove: 战场拖拽', {
          x, dx, distance, nextX, minX, maxX,
          worldOffsetX: this.gameContext.worldOffsetX,
          isPanning: this.isPanning
        });
      }
    }
    
    // 传递给 UI 处理
    if (weaponContainerUI) {
      weaponContainerUI.onTouchMove(e);
    }
  }
  
  /**
   * 触摸结束
   */
  onTouchEnd(e, weaponContainerUI, startScreen, helpScreen, battlefieldMinimap, weaponManager) {
    // 处理小地图拖拽结束（如果游戏已开始）
    if (battlefieldMinimap && this.gameContext.gameStarted) {
      if (battlefieldMinimap.onTouchEnd(e)) {
        return;
      }
    }
    
    // 处理帮助界面滚动结束
    if (helpScreen && helpScreen.visible) {
      helpScreen.onTouchEnd(e);
    }
    
    // 如果正在拖拽武器，不处理武器点击
    if (weaponContainerUI && weaponContainerUI.isDragging()) {
      weaponContainerUI.onTouchEnd(e);
      this.isPanning = false;
      return;
    }
    
    // 检查是否点击了武器（如果游戏已开始且有武器管理器）
    // 即使 isPanning 为 true，如果拖拽距离很小，也认为是点击
    const touch = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : e;
    if (touch && this.gameContext.gameStarted && weaponManager) {
      const x = touch.x || touch.clientX || 0;
      const y = touch.y || touch.clientY || 0;
      
      // 计算拖拽距离
      const dx = Math.abs(x - this.panStartX);
      const dy = Math.abs(y - this.panStartY);
      const dragDistance = Math.sqrt(dx * dx + dy * dy);
      
      // 如果拖拽距离小于阈值，认为是点击，检查武器
      if (!this.isPanning || dragDistance < this.panThreshold) {
        // 优先使用 onTouchStart 中记录的武器（如果存在）
        let weapon = this.clickedWeapon;
        
        // 如果没有记录，重新查找
        if (!weapon) {
          // 考虑战场偏移：触摸坐标是 Canvas 坐标，需要转换为世界坐标
          // 在 GameRenderer 中，使用 offsetX = -worldOffsetX 来平移画布
          // 所以当 worldOffsetX > 0 时，画布向左移动，世界坐标需要加上这个偏移
          const worldX = x + this.gameContext.worldOffsetX;
          const worldY = y;
          weapon = weaponManager.findWeaponAt(worldX, worldY);
        }
        
        // 先检查是否点击了按钮（使用 onTouchStart 中记录的 clickedButton）
        if (this.clickedButton) {
          const selectedWeapon = weaponManager.getSelectedWeapon();
          if (selectedWeapon) {
            if (this.clickedButton === 'upgrade') {
              weaponManager.upgradeWeapon(selectedWeapon);
            } else if (this.clickedButton === 'sell') {
              weaponManager.sellWeapon(selectedWeapon);
            }
            this.isPanning = false;
            this.clickedWeapon = null;
            this.clickedButton = null;
            return;
          }
        }
        
        // 如果没有记录按钮点击，检查是否点击了按钮区域（备用检测）
        const selectedWeapon = weaponManager.getSelectedWeapon();
        if (selectedWeapon && selectedWeapon.buttonBounds) {
          // 考虑战场偏移：按钮位置是相对于武器Canvas坐标的偏移
          // 武器的世界坐标：selectedWeapon.x, selectedWeapon.y
          // 武器的Canvas坐标：selectedWeapon.x + offsetX, selectedWeapon.y + offsetY
          const offsetX = -this.gameContext.worldOffsetX;
          const offsetY = 0;
          const weaponCanvasX = selectedWeapon.x + offsetX;
          const weaponCanvasY = selectedWeapon.y + offsetY;
          
          // 检查升级按钮
          if (selectedWeapon.buttonBounds.upgradeButton && selectedWeapon.buttonBounds.upgradeButton.enabled) {
            const btn = selectedWeapon.buttonBounds.upgradeButton;
            // 按钮位置是相对于武器Canvas坐标的偏移，所以需要加上武器Canvas坐标
            const btnX = weaponCanvasX + btn.x;
            const btnY = weaponCanvasY + btn.y;
            
            if (x >= btnX && x <= btnX + btn.width && 
                y >= btnY && y <= btnY + btn.height) {
              console.log('GameInputHandler.onTouchEnd: 点击升级按钮');
              weaponManager.upgradeWeapon(selectedWeapon);
              this.isPanning = false;
              this.clickedWeapon = null;
              return;
            }
          }
          
          // 检查出售按钮
          if (selectedWeapon.buttonBounds.sellButton && selectedWeapon.buttonBounds.sellButton.enabled) {
            const btn = selectedWeapon.buttonBounds.sellButton;
            // 按钮位置是相对于武器Canvas坐标的偏移，所以需要加上武器Canvas坐标
            const btnX = weaponCanvasX + btn.x;
            const btnY = weaponCanvasY + btn.y;
            
            if (x >= btnX && x <= btnX + btn.width && 
                y >= btnY && y <= btnY + btn.height) {
              console.log('GameInputHandler.onTouchEnd: 点击出售按钮');
              weaponManager.sellWeapon(selectedWeapon);
              this.isPanning = false;
              this.clickedWeapon = null;
              return;
            }
          }
        }
        
        if (weapon) {
          console.log('GameInputHandler.onTouchEnd: 处理武器点击', { 
            weapon, 
            isSelected: weaponManager.getSelectedWeapon() === weapon,
            level: weapon.level,
            maxLevel: weapon.maxLevel
          });
          
          // 选中或取消选中武器
          if (weaponManager.getSelectedWeapon() === weapon) {
            // 如果点击的是已选中的武器，取消选中
            weaponManager.setSelectedWeapon(null);
            console.log('GameInputHandler.onTouchEnd: 取消选中武器');
          } else {
            // 选中武器
            weaponManager.setSelectedWeapon(weapon);
            console.log('GameInputHandler.onTouchEnd: 选中武器', { 
              weapon, 
              level: weapon.level,
              maxLevel: weapon.maxLevel,
              upgradeCost: weapon.getUpgradeCost(),
              sellGain: weapon.getSellGain(),
              selectedWeapon: weaponManager.getSelectedWeapon()
            });
          }
          
          // 清除点击记录
          this.clickedWeapon = null;
          
          // 阻止其他处理
          this.isPanning = false;
          return;
        } else {
          // 点击空白处，清除选中
          weaponManager.setSelectedWeapon(null);
          this.clickedWeapon = null;
        }
      }
    }
    
    // 如果确认是拖拽，不处理其他逻辑
    if (this.isPanning) {
      this.isPanning = false;
      return;
    }
    
    this.isPanning = false;
    
    // 传递给 UI 处理
    if (weaponContainerUI) {
      weaponContainerUI.onTouchEnd(e);
    }
    
    if (startScreen && !this.gameContext.gameStarted) {
      startScreen.onTouchEnd(e);
    }
  }
  
  /**
   * 检查触摸点是否在战斗区域内
   */
  isInBattleArea(x, y) {
    // 微信小游戏的触摸坐标是相对于 Canvas 左上角的（Y 轴从上往下）
    // 直接使用 Canvas 坐标系检查
    const battleStartY = GameConfig.BATTLE_START_ROW * GameConfig.CELL_SIZE;
    const battleEndY = (GameConfig.BATTLE_START_ROW + GameConfig.BATTLE_ROWS) * GameConfig.CELL_SIZE;
    
    return y >= battleStartY && y <= battleEndY;
  }
  
  /**
   * 计算拖动边界
   */
  calculatePanBounds() {
    // 战场宽度是 BATTLE_WIDTH，设计宽度是 DESIGN_WIDTH
    // worldOffsetX 的范围：0 到 (BATTLE_WIDTH - DESIGN_WIDTH)
    // 0: 初始位置，战场左边界对齐画布左边界
    // BATTLE_WIDTH - DESIGN_WIDTH: 战场右边界对齐画布右边界
    const minX = 0; // 初始位置，不偏移
    const maxX = Math.max(0, GameConfig.BATTLE_WIDTH - GameConfig.DESIGN_WIDTH); // 最大偏移
    
    return { minX, maxX };
  }
}

