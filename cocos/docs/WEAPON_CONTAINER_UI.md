# 武器容器UI组件说明

## 概述

`WeaponContainerUI` 组件负责管理游戏底部的武器选择界面，包括显示可选武器卡片、处理用户点击等。

## 文件位置

```
cocos/assets/scripts/ui/WeaponContainerUI.ts
```

## 主要功能

### 1. 容器标题和说明
- 标题：⚔️ 武器库 ⚔️
- 副标题：点击图标拖拽部署武器 | 点击武器进行升级/出售
- 清晰的操作提示

### 2. 武器卡片显示
- 显示可选择的武器类型（火箭塔、激光塔）
- 每个卡片包含：
  - 武器图标（精美的图形绘制）
  - 武器名称
  - **武器描述**（追踪火箭/持续射线等）
  - 购买成本
  - 特色霓虹风格边框和背景

### 3. 拖拽放置功能
- 点击并拖拽武器图标
- 实时显示拖拽幽灵
- 格子占用检测
- 金币自动扣除

### 4. 武器管理功能
- 点击已放置的武器进行选中
- 显示升级和出售按钮
- 升级按钮显示升级成本
- 出售按钮显示回收金币
- 键盘快捷键：
  - **U键** - 升级选中的武器
  - **S键** - 出售选中的武器

### 5. 卡片布局
```
┌─────────────────────────────────────┐
│        ⚔️ 武器库 ⚔️                  │
│   点击图标拖拽部署 | 点击武器操作     │
│                                     │
│  ┌─────────┐    ┌─────────┐         │
│  │  🚀     │    │  ⚡     │         │
│  │ 火箭塔  │    │ 激光塔  │         │
│  │追踪火箭 │    │持续射线 │         │
│  │高爆溅射 │    │高射速   │         │
│  │ 💰 120  │    │ 💰 100  │         │
│  └─────────┘    └─────────┘         │
└─────────────────────────────────────┘
```

## 使用方法

### 在场景中设置

1. **创建节点结构**
   ```
   UI
   └── WeaponContainer
       └── [挂载 WeaponContainerUI 组件]
   ```

2. **在 UIManager 中自动初始化**
   - UIManager 会自动在 `weaponContainer` 节点上添加 `WeaponContainerUI` 组件
   - 自动传入 `GoldManager` 和 `WeaponManager` 引用

### 代码集成

```typescript
// UIManager 中的初始化
if (this.weaponContainer && this.goldManager && this.weaponManager) {
    this.weaponContainerUI = this.weaponContainer.getComponent(WeaponContainerUI);
    if (!this.weaponContainerUI) {
        this.weaponContainerUI = this.weaponContainer.addComponent(WeaponContainerUI);
    }
    this.weaponContainerUI.init(this.goldManager, this.weaponManager);
}
```

## API 接口

### 初始化方法

```typescript
init(goldManager: GoldManager, weaponManager: WeaponManager): void
```
- 初始化组件，传入金币管理器和武器管理器
- 自动创建拖拽管理器
- 设置键盘事件监听

### 更新操作按钮

```typescript
updateActionButtons(): void
```
- 更新升级和出售按钮的显示状态
- 更新按钮文本（显示成本/收益）
- 更新按钮位置（跟随选中武器）
- 由 UIManager 在每帧调用

### 获取选中武器

```typescript
getSelectedWeaponType(): WeaponType | null
```
- 返回当前选中的武器类型
- 如果没有选中返回 null

### 清除选中

```typescript
clearSelection(): void
```
- 清除当前的武器选择状态

## 武器卡片配置

### 火箭塔卡片
- **图标**: 🚀
- **颜色**: 紫色 (0x9d00ff)
- **成本**: 120 金币
- **位置**: 左侧

### 激光塔卡片
- **图标**: ⚡
- **颜色**: 绿色 (0x00ff41)
- **成本**: 100 金币
- **位置**: 右侧

## 卡片样式

### 背景和边框
```typescript
// 外发光（选中时更亮）
alpha: 选中 ? 80 : 30

// 主背景
color: rgba(20, 20, 40, 230)

// 边框颜色
使用武器配置中的颜色（colorHex）
```

### 布局参数
```typescript
cardWidth: 180px
cardHeight: 140px
cardSpacing: 20px
startX: -containerWidth / 2 + 50
cardY: containerHeight / 2 - 70
```

## 事件流程

### 点击武器卡片
1. 检查金币是否足够
2. 如果不够，显示提示
3. 如果够，设置为选中状态
4. 更新所有卡片的视觉状态

### 选中状态变化
```typescript
onWeaponCardClick(weaponType) 
  → 检查金币
  → 设置 selectedWeaponType
  → updateCardSelection()
    → 遍历所有卡片
    → 重绘选中卡片（添加外发光）
    → 重绘未选中卡片（正常状态）
```

## 与其他系统的交互

### GoldManager
- 检查玩家金币数量
- 判断是否能够购买武器

### WeaponManager
- 将来会用于实际放置武器
- 传递选中的武器类型

### UIManager
- 管理 WeaponContainerUI 的生命周期
- 设置容器的位置和尺寸

## 已完成功能 ✅

### 1. 拖拽放置
- ✅ 支持拖拽卡片到战场放置武器
- ✅ 显示拖拽幽灵预览
- ✅ 格子占用检测
- ✅ 金币自动扣除

### 2. 武器管理
- ✅ 点击武器选中
- ✅ 显示选中光环
- ✅ 升级和出售按钮
- ✅ 键盘快捷键（U升级，S出售）

### 3. UI完善
- ✅ 标题和副标题
- ✅ 武器描述文本
- ✅ 霓虹风格视觉效果
- ✅ 按钮跟随武器位置

## 扩展功能（待实现）

### 1. 武器信息提示
- [ ] 悬停显示详细信息面板
- [ ] 显示攻击范围、伤害、射速等属性

### 2. 动画效果
- [ ] 卡片出现动画
- [ ] 选中时的脉冲效果
- [ ] 金币不足时的抖动效果
- [ ] 升级时的特效

### 3. 音效
- [ ] 拖拽音效
- [ ] 放置音效
- [ ] 升级音效
- [ ] 出售音效

## 调试

### 控制台日志
```typescript
// 选中武器时
console.log(`选中武器: ${config.name}`);

// 金币不足时
console.log('金币不足！');
```

## 注意事项

1. **组件依赖**
   - 必须先初始化 GoldManager 和 WeaponManager
   - UIManager 负责管理初始化顺序

2. **坐标系统**
   - 使用相对于 weaponContainer 的本地坐标
   - 锚点设置为 (0, 1) - 左上角

3. **性能优化**
   - 只在选中状态变化时重绘卡片
   - 使用 Graphics 组件绘制，避免使用图片资源

## 相关文件

- `GameConfig.ts` - 武器配置数据
- `WeaponManager.ts` - 武器管理器
- `GoldManager.ts` - 金币管理器
- `UIManager.ts` - UI管理器
