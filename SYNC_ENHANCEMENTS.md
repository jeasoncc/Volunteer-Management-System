# 同步功能增强

## 新增功能

本次更新为设备同步功能添加了4个重要增强：

### 1. 实时日志流显示 📋

**功能描述**：
- 在同步过程中实时显示每个义工的处理状态
- 日志包含时间戳、状态类型（成功/失败/警告/信息）和详细消息
- 自动滚动到最新日志
- 支持清空日志

**UI 展示**：
```
同步日志                                [清空]
┌─────────────────────────────────────────┐
│ [13:45:23] 开始同步，共 50 个义工        │
│ [13:45:24] 📤 发送: 张三 (LZ-V-001)     │
│ [13:45:25] ✅ 成功: 张三 (LZ-V-001)     │
│ [13:45:26] ⏭️ 跳过: 李四 (LZ-V-002) - 无头像 │
│ [13:45:27] ❌ 失败: 王五 (LZ-V-003) - 照片下载错误 │
│ [13:45:28] 🎉 同步完成！成功 45，失败 2，跳过 3 │
└─────────────────────────────────────────┘
```

**技术实现**：
- 后端：`SyncProgressManager` 维护日志数组，限制最多100条
- 前端：每500ms轮询进度，实时更新日志显示
- 使用 `useRef` 和 `scrollIntoView` 实现自动滚动

### 2. 失败重试机制 🔄

**功能描述**：
- 自动收集同步失败的义工列表
- 一键重试所有失败项
- 显示失败原因（照片下载错误、设备未连接等）

**使用场景**：
- 网络临时中断导致部分失败
- 照片服务器临时不可用
- 考勤机临时离线

**UI 展示**：
```
┌─────────────────────────────────────────┐
│ [重试 5 个失败项]                        │
└─────────────────────────────────────────┘
```

**API 端点**：
```typescript
POST /send/retryFailed
Body: {
  failedUsers: [
    { lotusId: "LZ-V-001", name: "张三" },
    { lotusId: "LZ-V-002", name: "李四" }
  ]
}
```

### 3. 照片预检查 🔍

**功能描述**：
- 同步前先检查照片 URL 是否可访问
- 避免发送无效命令到考勤机
- 提前发现照片问题，节省时间

**配置选项**：
```
☑ 同步前检查照片可访问性（会稍慢）
```

**检查逻辑**：
```typescript
// 使用 HEAD 请求检查照片
const response = await fetch(photoUrl, { 
  method: 'HEAD', 
  signal: AbortSignal.timeout(3000) 
})

if (!response.ok) {
  // 跳过该义工，记录原因
  skip(user, 'photo_unreachable')
}
```

**性能影响**：
- 不开启：同步50人约需 5-10 秒
- 开启：同步50人约需 15-20 秒（取决于网络）
- 建议：首次全量同步时开启，日常增量同步可关闭

### 4. 同步策略选择 🎯

**功能描述**：
- 提供3种同步策略，满足不同场景需求
- 减少不必要的同步，提高效率

**策略说明**：

#### 全量同步（all）
- **适用场景**：设备刚清空、首次部署、数据大规模变更
- **同步范围**：所有状态为 Active 的义工
- **特点**：最全面，但耗时最长

#### 增量同步（unsynced）
- **适用场景**：日常新增义工、部分义工未同步
- **同步范围**：仅同步 `syncToAttendance = false` 的义工
- **特点**：快速，只处理未同步的

#### 更新同步（changed）
- **适用场景**：义工信息有修改（照片、姓名等）
- **同步范围**：最近24小时内修改的义工
- **特点**：精准，只更新变更的

**UI 展示**：
```
同步策略
┌─────────────────────────────────────────┐
│ ▼ 全量同步（所有激活义工）               │
│   增量同步（仅未同步的）                 │
│   更新同步（最近修改的）                 │
└─────────────────────────────────────────┘
```

## 数据结构变更

### SyncProgress 接口扩展

```typescript
interface SyncProgress {
  total: number
  sent: number
  confirmed: number
  failed: number
  skipped: number
  status: 'idle' | 'syncing' | 'completed'
  logs: SyncLog[]  // 新增：日志数组
  failedUsers: Array<{  // 新增：失败用户列表
    lotusId: string
    name: string
    reason: string
  }>
}

interface SyncLog {
  time: string  // 格式：HH:mm:ss
  type: 'info' | 'success' | 'error' | 'warning'
  message: string
  userId?: string
}
```

## API 变更

### 1. 批量同步接口增强

```typescript
// 之前
POST /send/addAllUser
Body: {}

// 现在
POST /send/addAllUser
Body: {
  strategy?: 'all' | 'unsynced' | 'changed',  // 同步策略
  validatePhotos?: boolean  // 是否预检查照片
}
```

### 2. 新增重试接口

```typescript
POST /send/retryFailed
Body: {
  failedUsers: Array<{
    lotusId: string
    name: string
  }>
}

Response: {
  success: true,
  message: "重试完成",
  data: {
    total: 5,
    successCount: 4,
    failCount: 1
  }
}
```

### 3. 进度查询接口增强

```typescript
GET /sync/progress

// 之前返回
{
  total: 50,
  sent: 50,
  confirmed: 45,
  failed: 2,
  skipped: 3,
  status: 'completed'
}

// 现在返回
{
  total: 50,
  sent: 50,
  confirmed: 45,
  failed: 2,
  skipped: 3,
  status: 'completed',
  logs: [
    { time: "13:45:23", type: "info", message: "开始同步，共 50 个义工" },
    { time: "13:45:24", type: "success", message: "✅ 成功: 张三 (LZ-V-001)", userId: "LZ-V-001" },
    // ...
  ],
  failedUsers: [
    { lotusId: "LZ-V-003", name: "王五", reason: "照片下载错误" }
  ]
}
```

## 使用示例

### 场景1：首次全量同步

```typescript
// 1. 选择"全量同步"策略
// 2. 勾选"照片预检查"
// 3. 点击"开始同步"
// 4. 观察实时日志
// 5. 如有失败，点击"重试失败项"
```

### 场景2：日常新增义工

```typescript
// 1. 选择"增量同步"策略
// 2. 不勾选照片预检查（节省时间）
// 3. 点击"开始同步"
```

### 场景3：修改义工信息后

```typescript
// 1. 选择"更新同步"策略
// 2. 点击"开始同步"
// 3. 只会同步最近24小时修改的义工
```

## 性能优化

### 日志限制
- 最多保留100条日志，超出自动删除最旧的
- 避免内存占用过大

### 轮询优化
- 只在 `status === 'syncing'` 时轮询
- 完成后自动停止轮询
- 轮询间隔：500ms（平衡实时性和性能）

### 照片预检查优化
- 使用 HEAD 请求而非 GET，节省带宽
- 设置3秒超时，避免长时间等待
- 并发检查（未来可优化）

## 错误处理

### 失败原因分类

| 原因代码 | 显示文本 | 说明 |
|---------|---------|------|
| `no_avatar` | 无头像 | 义工没有上传头像 |
| `photo_unreachable` | 照片无法访问 | HTTP 请求失败 |
| `photo_network_error` | 照片网络错误 | 网络超时或连接失败 |
| `device_not_connected` | 设备未连接 | 考勤机离线 |
| `device_error` | 考勤机返回错误 | 考勤机处理失败（如存储满） |

### 重试策略

1. **自动重试**：暂不支持，避免无限循环
2. **手动重试**：用户点击"重试失败项"按钮
3. **单个重试**：使用"下发单个义工"功能

## 相关文件

### 后端
- `apps/api/src/modules/ws/sync-progress-manager.ts` - 进度管理器
- `apps/api/src/modules/ws/service.ts` - WebSocket 服务
- `apps/api/src/modules/ws/index.ts` - WebSocket 路由

### 前端
- `apps/web/src/routes/devices.tsx` - 设备管理页面
- `apps/web/src/services/device.ts` - 设备服务
- `apps/web/src/components/ui/select.tsx` - 下拉选择组件
- `apps/web/src/components/ui/checkbox.tsx` - 复选框组件

## 未来优化方向

1. **批量并发**：同时发送多个命令，提高速度
2. **智能重试**：自动识别可重试的错误，自动重试
3. **同步历史**：保存每次同步的历史记录到数据库
4. **通知推送**：同步完成后发送浏览器通知
5. **导出报告**：导出同步结果为 Excel 或 PDF

## 修复时间

2025-11-27
