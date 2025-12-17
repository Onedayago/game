/**
 * 游戏输入处理器
 * 只处理游戏逻辑相关的输入（战场拖拽、武器选择等）
 * UI 事件由 UIEventManager 统一处理
 */

import { GameConfig } from '../config/GameConfig';

export class GameInputHandler {
  constructor(gameContext) {
    this.gameContext = gameContext;
    this.isPanning = false;
    this.panStartX = 0;
    this.panStartY = 0;
    this.worldStartX = 0;
    this.worldStartY = 0;
    this.panThreshold = 5; // 拖拽阈值，小于此值认为是点击
    this.clickedWeapon = null; // 记录点击的武器
    this.clickedButton = null; // 记录点击的按钮类型：'upgrade' 或 'sell'
  }
  
  /**
   * 处理触摸开始事件（游戏逻辑部分）
   * @param {Object} e - 触摸事件对象
   * @param {Object} weaponManager - 武器管理器
   * @returns {boolean} 是否处理了事件（返回 true 表示已处理，不应继续处理 UI 事件）
   */
  onTouchStart(e, weaponManager) {
    // 如果游戏未开始、已暂停或已结束，不处理游戏逻辑输入
    if (!this.gameContext.gameStarted || 
        this.gameContext.gamePaused || 
        this.gameContext.gameOver) {
      return false;
    }
    
    // 微信小游戏的触摸事件格式
    const touch = e.touches && e.touches[0] ? e.touches[0] : e;
    if (!touch) {
      return false;
    }
    
    const x = touch.x || touch.clientX || 0;
    const y = touch.y || touch.clientY || 0;
    
    // 如果游戏已开始，先检查是否点击了已选中武器的按钮（优先级最高）
    if (weaponManager) {
      const selectedWeapon = weaponManager.getSelectedWeapon();
      
      if (selectedWeapon && selectedWeapon.buttonBounds) {
        // 考虑战场偏移：按钮位置是相对于武器Canvas坐标的偏移
        const offsetX = -this.gameContext.worldOffsetX;
        const offsetY = -this.gameContext.worldOffsetY;
        const weaponCanvasX = selectedWeapon.x + offsetX;
        const weaponCanvasY = selectedWeapon.y + offsetY;
        
        // 检查升级按钮
        if (selectedWeapon.buttonBounds.upgradeButton && selectedWeapon.buttonBounds.upgradeButton.enabled) {
          const btn = selectedWeapon.buttonBounds.upgradeButton;
          const btnX = weaponCanvasX + btn.x;
          const btnY = weaponCanvasY + btn.y;
          const btnRight = btnX + btn.width;
          const btnBottom = btnY + btn.height;
          
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
          const btnX = weaponCanvasX + btn.x;
          const btnY = weaponCanvasY + btn.y;
          const btnRight = btnX + btn.width;
          const btnBottom = btnY + btn.height;
          
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
      const worldX = x + this.gameContext.worldOffsetX;
      const worldY = y + this.gameContext.worldOffsetY;
      const weapon = weaponManager.findWeaponAt(worldX, worldY);
      
      if (weapon) {
        // 点击了武器，不准备拖拽，记录点击位置用于 onTouchEnd
        this.panStartX = x;
        this.panStartY = y;
        this.isPanning = false;
        this.clickedWeapon = weapon;
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
      this.worldStartY = this.gameContext.worldOffsetY;
      this.isPanning = false; // 初始不是拖拽，等 onTouchMove 确认
    } else {
      this.isPanning = false;
    }
    
    return false;
  }
  
  /**
   * 处理触摸移动事件（游戏逻辑部分）
   * @param {Object} e - 触摸事件对象
   * @returns {boolean} 是否处理了事件
   */
  onTouchMove(e) {
    // 如果点击了按钮，不处理拖拽
    if (this.clickedButton) {
      return false;
    }
    
    // 如果游戏未开始、已暂停或已结束，不处理
    if (!this.gameContext.gameStarted || 
        this.gameContext.gamePaused || 
        this.gameContext.gameOver) {
      return false;
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
        const { minX, maxX } = this.calculatePanBounds();
        let nextX = this.worldStartX - (x - this.panStartX); // 反转 dx
        nextX = Math.max(minX, Math.min(maxX, nextX));
        
        // 计算Y方向拖动
        const { minY, maxY } = this.calculatePanBoundsY();
        let nextY = this.worldStartY - (y - this.panStartY); // 反转 dy
        nextY = Math.max(minY, Math.min(maxY, nextY));
        
        this.gameContext.worldOffsetX = nextX;
        this.gameContext.worldOffsetY = nextY;
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * 处理触摸结束事件（游戏逻辑部分）
   * @param {Object} e - 触摸事件对象
   * @param {Object} weaponManager - 武器管理器
   * @returns {string|null} 返回特殊值（'restart'/'resume'/'pause'）或 null
   */
  onTouchEnd(e, weaponManager) {
    // 如果确认是拖拽，不处理其他逻辑
    if (this.isPanning) {
      this.isPanning = false;
      return null;
    }
    
    // 如果游戏未开始、已暂停或已结束，不处理
    if (!this.gameContext.gameStarted || 
        this.gameContext.gamePaused || 
        this.gameContext.gameOver) {
      this.isPanning = false;
      return null;
    }
    
    // 检查是否点击了武器（如果游戏已开始且有武器管理器）
    const touch = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : e;
    if (touch && weaponManager) {
      const x = touch.x || touch.clientX || 0;
      const y = touch.y || touch.clientY || 0;
      
      // 计算拖拽距离
      const dx = Math.abs(x - this.panStartX);
      const dy = Math.abs(y - this.panStartY);
      const dragDistance = Math.sqrt(dx * dx + dy * dy);
      
      // 如果拖拽距离小于阈值，认为是点击
      if (dragDistance < this.panThreshold) {
        // 先检查是否点击了按钮（使用 onTouchStart 中记录的 clickedButton）
        if (this.clickedButton) {
          const selectedWeapon = weaponManager.getSelectedWeapon();
          if (selectedWeapon) {
            if (this.clickedButton === 'upgrade') {
              weaponManager.upgradeWeapon(selectedWeapon);
            } else if (this.clickedButton === 'sell') {
              weaponManager.sellWeapon(selectedWeapon);
            }
            this.clickedWeapon = null;
            this.clickedButton = null;
            return null;
          }
        }
        
        // 优先使用 onTouchStart 中记录的武器（如果存在）
        let weapon = this.clickedWeapon;
        
        // 如果没有记录，重新查找
        if (!weapon) {
          const worldX = x + this.gameContext.worldOffsetX;
          const worldY = y + this.gameContext.worldOffsetY;
          weapon = weaponManager.findWeaponAt(worldX, worldY);
        }
        
        if (weapon) {
          // 选中或取消选中武器
          if (weaponManager.getSelectedWeapon() === weapon) {
            weaponManager.setSelectedWeapon(null);
          } else {
            weaponManager.setSelectedWeapon(weapon);
          }
          
          this.clickedWeapon = null;
          return null;
        } else {
          // 点击空白处，清除选中
          weaponManager.setSelectedWeapon(null);
          this.clickedWeapon = null;
        }
      }
    }
    
    this.isPanning = false;
    return null;
  }
  
  /**
   * 检查触摸点是否在战斗区域内
   */
  isInBattleArea(x, y) {
    const battleStartY = GameConfig.BATTLE_START_ROW * GameConfig.CELL_SIZE;
    const battleEndY = GameConfig.BATTLE_END_ROW * GameConfig.CELL_SIZE;
    return y >= battleStartY && y < battleEndY;
  }
  
  /**
   * 计算拖动边界（X方向）
   */
  calculatePanBounds() {
    const minX = 0;
    const maxX = Math.max(0, GameConfig.BATTLE_WIDTH - GameConfig.DESIGN_WIDTH);
    return { minX, maxX };
  }
  
  /**
   * 计算拖动边界（Y方向）
   */
  calculatePanBoundsY() {
    const minY = 0;
    const maxY = Math.max(0, GameConfig.BATTLE_HEIGHT - GameConfig.DESIGN_HEIGHT);
    return { minY, maxY };
  }
}
