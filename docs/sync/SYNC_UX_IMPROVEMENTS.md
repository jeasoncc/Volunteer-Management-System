# 同步用户体验改进

## 问题描述

用户在使用同步功能时遇到两个体验问题：

1. **页面自动滚动**：每次考勤机返回数据时，整个页面会滚动到最下面
2. **进度丢失**：切换到其他页面后再返回，同步进度就看不见了

## 解决方案

### 1. 修复自动滚动问题

**问题原因**：
使用 `scrollIntoView()` 会滚动整个页面，而不仅仅是日志容器。

**修复方案**：
```typescript
// 之前（会滚动整个页面）
logsEndRef.current?.scrollIntoView({ behavior: "smooth" });

// 现在（只滚动容器）
const container = logsEndRef.current.parentElement;
if (container) {
  container.scrollTop = container.scrollHeight;
}
```

**效果**：
- ✅ 日志自动滚动到最新
- ✅ 页面位置保持不变
- ✅ 用户可以继续查看其他内容

### 2. 进度持久化

**问题原因**：
同步进度只保存在组件状态中，切换页面后状态丢失。

**修复方案**：
使用 `sessionStorage` 保存和恢复进度。

```typescript
// 保存进度
useEffect(() => {
  if (syncProgress) {
    sessionStorage.setItem('syncProgress', JSON.stringify(syncProgress));
  }
}, [syncProgress]);

// 恢复进度
useEffect(() => {
  const saved = sessionStorage.getItem('syncProgress');
  if (saved) {
    const progress = JSON.parse(saved);
    if (progress.status === 'syncing') {
      setSyncProgress(progress);
    }
  }
}, []);
```

**效果**：
- ✅ 切换页面后进度保留
- ✅ 刷新页面后进度保留（同一标签页）
- ✅ 关闭标签页后自动清除
- ✅ 只恢复进行中的同步

### 3. 状态指示优化

添加清晰的状态标识：

```typescript
同步日志 [进行中]  // 同步中
同步日志 [已完成]  // 同步完成
```

### 4. 用户提示

添加友好提示，告知用户可以切换页面：

```
💡 同步在后台进行，可以切换到其他页面
```

## 技术细节

### sessionStorage vs localStorage

| 特性 | sessionStorage | localStorage |
|------|---------------|--------------|
| 生命周期 | 标签页关闭时清除 | 永久保存 |
| 作用域 | 当前标签页 | 所有标签页 |
| 适用场景 | 临时状态 | 持久化数据 |

**选择 sessionStorage 的原因**：
- 同步是临时操作，不需要永久保存
- 避免多个标签页之间的状态冲突
- 关闭标签页后自动清理

### 滚动容器设置

```css
.log-container {
  max-height: 15rem;  /* max-h-60 = 240px */
  overflow-y: auto;   /* 垂直滚动 */
}
```

关键点：
- 容器必须有固定高度（`max-height`）
- 容器必须有 `overflow-y: auto`
- 使用 `scrollTop` 而不是 `scrollIntoView`

## 使用体验

### 场景1：长时间同步

1. 用户点击"开始同步"
2. 看到实时日志滚动
3. 切换到"义工管理"页面处理其他事务
4. 5分钟后返回"设备与同步"页面
5. ✅ 进度和日志都还在，可以继续查看

### 场景2：查看历史日志

1. 同步完成后，日志保留在页面上
2. 用户向上滚动查看之前的日志
3. 新日志到达时，容器自动滚动到底部
4. ✅ 但页面位置不变，用户不会被打断

### 场景3：多次同步

1. 第一次同步完成
2. 用户点击"清空"按钮
3. ✅ 日志清空，sessionStorage 也清除
4. 开始第二次同步
5. ✅ 新的进度正常显示

## 清空逻辑

```typescript
onClick={() => {
  setSyncProgress(null);              // 清空组件状态
  sessionStorage.removeItem('syncProgress');  // 清空存储
}}
```

**触发时机**：
- 用户手动点击"清空"按钮
- 用户关闭标签页（自动）

**不会清空的情况**：
- 切换页面
- 刷新页面（会恢复）

## 边界情况处理

### 1. 页面刷新

```typescript
// 刷新后恢复进度
useEffect(() => {
  const saved = sessionStorage.getItem('syncProgress');
  if (saved) {
    const progress = JSON.parse(saved);
    // 只恢复进行中的同步
    if (progress.status === 'syncing') {
      setSyncProgress(progress);
    }
  }
}, []);
```

### 2. 同步完成后切换页面

```typescript
// 完成的同步也会保存，返回时可以看到结果
if (progress.status === 'completed') {
  setSyncProgress(progress);
  // 5秒后自动清空
  setTimeout(() => {
    if (progress.logs && progress.logs.length > 0) {
      setSyncProgress(prev => prev ? { ...prev, status: 'idle' } : null);
    }
  }, 5000);
}
```

### 3. 多标签页

- 每个标签页有独立的 sessionStorage
- 不会互相干扰
- 适合同时查看不同页面

## 性能优化

### 1. 滚动节流

```typescript
// 使用 scrollTop 直接设置，无需动画
container.scrollTop = container.scrollHeight;
```

### 2. 存储优化

```typescript
// 只在进度变化时保存
useEffect(() => {
  if (syncProgress) {
    sessionStorage.setItem('syncProgress', JSON.stringify(syncProgress));
  }
}, [syncProgress]);
```

### 3. 日志限制

后端已限制最多100条日志，避免：
- sessionStorage 存储过大
- 渲染性能问题
- 滚动卡顿

## 相关文件

- `apps/web/src/routes/devices.tsx` - 设备管理页面

## 修复时间

2025-11-27

## 用户反馈

预期改进：
- ✅ 不再被自动滚动打断
- ✅ 可以放心切换页面
- ✅ 长时间同步体验更好
- ✅ 状态更清晰
