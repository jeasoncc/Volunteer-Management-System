# 同步进度显示修复

## 问题描述

之前的同步进度条显示逻辑有误：
- 进度条基于"已发送命令数"而不是"考勤机反馈数"
- 完成检查逻辑错误：`processed >= sent - skipped` 应该是 `processed >= sent`
- 用户看到的进度不能真实反映考勤机的处理状态

## 修复内容

### 1. 修正完成检查逻辑 (`apps/api/src/modules/ws/sync-progress-manager.ts`)

```typescript
// 修复前
if (processed >= this.progress.sent - this.progress.skipped) {
  this.progress.status = 'completed'
}

// 修复后
if (processed >= this.progress.sent) {
  this.progress.status = 'completed'
}
```

**原因**：
- `skipped` 是在发送前就跳过的，不应该参与完成计算
- 只有当所有已发送的命令都收到考勤机反馈（成功或失败）时才算完成

### 2. 优化前端进度显示 (`apps/web/src/routes/devices.tsx`)

```typescript
// 修改状态文本
{syncProgress.status === "syncing" ? "等待考勤机反馈..." : "同步完成"}

// 修改统计标签
<span className="text-green-600">已确认: {syncProgress.confirmed}</span>
<span className="text-red-600">已失败: {syncProgress.failed}</span>
<span className="text-amber-600">已跳过: {syncProgress.skipped}</span>
```

**改进**：
- 更清晰地表明进度是基于考勤机反馈
- 使用"已确认"、"已失败"等词汇强调这是考勤机的反馈结果
- 为"已跳过"添加琥珀色，与成功/失败区分

## 工作流程

### 正确的同步流程

1. **初始化**：`startSync(total)` - 设置总数，状态为 `syncing`
2. **发送命令**：每发送一个命令调用 `incrementSent()`
3. **跳过记录**：无头像等情况调用 `incrementSkipped()`
4. **等待反馈**：考勤机处理命令并返回结果
5. **处理反馈**：
   - 成功：调用 `incrementConfirmed()` → 更新数据库 `syncToAttendance = true`
   - 失败：调用 `incrementFailed()` → 记录错误日志
6. **检查完成**：当 `confirmed + failed >= sent` 时，状态变为 `completed`

### 进度计算公式

```typescript
// 进度百分比
progress = (confirmed + failed) / sent * 100

// 完成条件
completed = (confirmed + failed) >= sent
```

## 数据流

```
前端发起同步
    ↓
后端初始化进度 (total, sent=0, confirmed=0, failed=0, skipped=0)
    ↓
遍历义工列表
    ↓
    ├─ 无头像 → incrementSkipped()
    ├─ 发送成功 → incrementSent()
    └─ 发送失败 → 记录到 failedUsers
    ↓
等待考勤机反馈 (WebSocket)
    ↓
    ├─ code=0 → incrementConfirmed() + 更新数据库
    └─ code=1 → incrementFailed() + 记录日志
    ↓
检查完成 (confirmed + failed >= sent)
    ↓
前端显示最终结果 (3秒后隐藏进度条)
```

## 前端轮询机制

```typescript
// 当状态为 syncing 时，每 500ms 轮询一次进度
const { data: progressData } = useQuery({
  queryKey: ["sync", "progress"],
  queryFn: () => deviceService.getSyncProgress(),
  enabled: syncProgress?.status === "syncing",
  refetchInterval: 500,
});
```

## 测试验证

### 测试场景

1. **正常同步**：所有义工都有头像，考勤机全部返回成功
   - 预期：`confirmed = sent`, `failed = 0`, `skipped = 0`

2. **部分失败**：照片链接无法访问
   - 预期：`confirmed + failed = sent`, 进度条正常完成

3. **部分跳过**：部分义工无头像
   - 预期：`skipped > 0`, 进度条只计算 `sent` 的部分

4. **网络延迟**：考勤机反馈较慢
   - 预期：进度条停留在"等待考勤机反馈..."，直到收到所有反馈

## 相关文件

- `apps/api/src/modules/ws/sync-progress-manager.ts` - 进度管理器
- `apps/api/src/modules/ws/service.ts` - WebSocket 服务
- `apps/api/src/modules/ws/index.ts` - WebSocket 路由
- `apps/web/src/routes/devices.tsx` - 设备管理页面

## 修复时间

2025-11-27
