# 敌人性能瓶颈分析

## 问题分析

### 1. 敌人渲染复杂度
- **每个敌人**：155个Canvas绘制操作（beginPath, fill, stroke, arc等）
- **13个绘制方法**：drawShadow, drawTracks, drawTrackPlates, drawTrackWheels, drawHull, drawHullHighlight, drawFrontArmor, drawArmorStripes, drawThreatIndicator, drawTurret, drawTurretTop, drawTurretLight, drawBarrel
- **每个敌人**：1次 save/restore
- **每个敌人**：1次血条渲染
- **30个敌人** = 4650个绘制操作 + 30次save/restore

### 2. 子弹渲染复杂度
- **每个子弹**：5个绘制操作（5个arc调用）
- **每个子弹**：1次 save/restore
- **每个敌人最多30个子弹**
- **30个敌人 × 30个子弹 = 900个子弹**
- **900个子弹** = 4500个绘制操作 + 900次save/restore

### 3. 总计算量
- **30个敌人**：4650 + 4500 = **9150个绘制操作**
- **save/restore**：30 + 900 = **930次上下文切换**
- **每帧**：如果60fps，每秒 = 549,000个绘制操作

### 4. 性能瓶颈
1. **Canvas绘制操作过多**：每个绘制操作都有开销
2. **上下文切换频繁**：save/restore 开销大
3. **子弹数量累积**：线性增长导致性能下降
4. **敌人渲染过于复杂**：细节太多，不适合大量敌人

## 优化方案

### 1. LOD（细节层次）系统
- 当敌人数量 > 15时，使用简化渲染
- 当敌人数量 > 25时，使用极简渲染

### 2. 批量绘制子弹
- 将相同颜色的子弹合并绘制
- 减少 save/restore 调用

### 3. 简化敌人渲染
- 减少绘制细节
- 合并绘制操作

### 4. 更激进的限制
- 敌人数量：30 → 20
- 子弹数量：30 → 15

### 5. 渲染优化
- 减少不必要的绘制
- 使用缓存减少重复计算

