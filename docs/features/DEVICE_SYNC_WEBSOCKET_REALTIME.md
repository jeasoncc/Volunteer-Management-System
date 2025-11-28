# 设备同步 WebSocket 实时通信方案

## 概述

将设备同步功能从轮询机制改为 WebSocket 实时通信，实现考勤机 ↔ 服务端 ↔ Web端的三方实时通信。

## 当前问题

1. **轮询机制效率低**：前端每秒向服务器发送请求获取进度
2. **反馈不及时**：考勤机的反馈信息无法实时显示在前端
3. **用户体验差**：没有实时的进度更新和 Toast 提示
4. **通知中心未集成**：考勤机反馈信息没有显示在通知中心

## 目标架构

```
考勤机 WebSocket ←→ 服务端 ←→ Web端 WebSocket
                      ↓
                  通知中心
```

### 通信流程

1. **下发人员信息**
   - Web端：点击"开始同步" → 发送 HTTP 请求
   - 服务端：开始批量下发 → 通过 WebSocket 实时推送进度到 Web端
   - Web端：显示 Toast "正在下发人员信息，请等待考勤机反馈"
   - Web端：显示进度面板（已发送数量、预计时间）

2. **考勤机反馈**
   - 考勤机：通过 WebSocket 返回每个用户的处理结果
   - 服务端：接收反馈 → 更新进度 → 推送到 Web端
   - Web端：
     - 显示 Toast 提示（成功/失败）
     - 更新进度条
     - 添加到通知中心
     - 实时日志滚动

3. **完成通知**
   - 服务端：检测到所有用户处理完成 → 推送完成消息
   - Web端：显示完成 Toast 和通知中心消息

## 实现方案

### 1. 服务端 WebSocket 消息类型

```typescript
// 进度更新消息
interface ProgressMessage {
  type: 'progress'
  data: {
    batchId: string
    total: number
    sent: number
    confirmed: number
    failed: number
    skipped: number
    status: 'syncing' | 'completed'
    estimatedTimeRemaining: number
  }
}

// 用户反馈消息
interface UserFeedbackMessage {
  type: 'user_feedback'
  data: {
    batchId: string
    lotusId: string
    name: string
    status: 'success' | 'failed'
    code: number
    message: string
    timestamp: string
  }
}

// 批次开始消息
interface BatchStartMessage {
  type: 'batch_start'
  data: {
    batchId: string
    total: number
    strategy: string
    photoFormat: string
  }
}

// 批次完成消息
interface BatchCompleteMessage {
  type: 'batch_complete'
  data: {
    batchId: string
    total: number
    confirmed: number
    failed: number
    skipped: number
    duration: number
  }
}
```

### 2. 前端 WebSocket Hook 增强

```typescript
// apps/web/src/hooks/useSyncWebSocket.ts
interface UseSyncWebSocketOptions {
  onProgressUpdate?: (progress: SyncProgress) => void
  onUserFeedback?: (feedback: UserFeedback) => void
  onBatchStart?: (batch: BatchInfo) => void
  onBatchComplete?: (result: BatchResult) => void
  enabled?: boolean
}
```

### 3. 通知中心集成

在 `apps/web/src/types/notification.ts` 中添加新的通知类型：

```typescript
export type NotificationType = 
  | "system" 
  | "approval" 
  | "checkin" 
  | "report" 
  | "warning"
  | "device_sync"  // 新增：设备同步通知
```

### 4. Toast 提示策略

- **批次开始**：Toast.info("正在下发 X 个人员信息，请等待考勤机反馈...")
- **用户成功**：不显示 Toast（避免刷屏），仅更新进度条和日志
- **用户失败**：Toast.error("XXX 同步失败：原因")，并添加到通知中心
- **批次完成**：
  - 全部成功：Toast.success("同步完成：成功 X 个")
  - 有失败：Toast.warning("同步完成：成功 X 个，失败 Y 个")

## 实现步骤

### Phase 1: 服务端 WebSocket 增强 ✅

- [x] 已有 `/ws/sync-progress` WebSocket 端点
- [x] 已有进度管理器订阅机制
- [ ] 增加用户反馈消息类型
- [ ] 增加批次开始/完成消息

### Phase 2: 前端 WebSocket Hook 增强

- [x] 已有基础 WebSocket 连接
- [ ] 修复 TypeScript 错误
- [ ] 添加消息类型处理
- [ ] 添加回调函数支持

### Phase 3: 前端 UI 集成

- [ ] 移除轮询机制
- [ ] 集成 WebSocket Hook
- [ ] 实现实时 Toast 提示
- [ ] 集成通知中心

### Phase 4: 测试与优化

- [ ] 测试大批量同步（100+ 用户）
- [ ] 测试网络断线重连
- [ ] 测试并发同步
- [ ] 性能优化

## 代码修改清单

### 1. 服务端修改

#### `apps/api/src/modules/ws/model.ts`
- 添加 WebSocket 消息类型定义

#### `apps/api/src/modules/ws/sync-progress-manager.ts`
- 添加用户反馈事件
- 添加批次开始/完成事件

#### `apps/api/src/modules/ws/index.ts`
- 增强 WebSocket 消息处理
- 广播用户反馈消息

### 2. 前端修改

#### `apps/web/src/hooks/useSyncWebSocket.ts`
- 修复 TypeScript 错误
- 添加消息类型处理
- 添加回调函数

#### `apps/web/src/routes/devices.tsx`
- 移除轮询逻辑
- 集成 WebSocket Hook
- 实现实时 Toast
- 集成通知中心

#### `apps/web/src/types/notification.ts`
- 添加设备同步通知类型

## 预期效果

1. **实时性**：考勤机反馈立即显示在前端（< 100ms）
2. **用户体验**：清晰的进度提示和反馈信息
3. **性能**：减少 HTTP 请求，降低服务器负载
4. **可靠性**：WebSocket 断线自动重连
5. **可追溯**：所有反馈信息记录在通知中心

## 注意事项

1. **向后兼容**：保留 HTTP 轮询接口作为降级方案
2. **错误处理**：WebSocket 断线时显示警告并尝试重连
3. **消息去重**：避免重复的 Toast 提示
4. **性能优化**：大批量同步时合并进度更新（如每 100ms 更新一次）
