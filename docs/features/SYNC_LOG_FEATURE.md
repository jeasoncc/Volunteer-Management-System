# 同步记录功能

## 功能概述

记录每次同步到考勤机的详细信息，包括：
- 同步批次信息
- 每个用户的同步状态
- 预估完成时间

## 数据库表

### 1. attendance_sync_batch（同步批次表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(50) | 批次ID，格式：SYNC-YYYYMMDD-HHMMSS-xxxx |
| total_count | INT | 总数量 |
| success_count | INT | 成功数量 |
| failed_count | INT | 失败数量 |
| skipped_count | INT | 跳过数量 |
| status | ENUM | syncing/completed/cancelled |
| sync_strategy | ENUM | all/unsynced/changed/retry |
| started_at | TIMESTAMP | 开始时间 |
| completed_at | TIMESTAMP | 完成时间 |
| duration | INT | 耗时（秒） |
| operator_id | BIGINT | 操作人ID |
| operator_name | VARCHAR | 操作人姓名 |

### 2. attendance_sync_log（同步记录表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 自增ID |
| lotus_id | VARCHAR(50) | 用户莲花斋ID |
| name | VARCHAR(50) | 用户姓名 |
| device_sn | VARCHAR(50) | 设备序列号 |
| photo_url | TEXT | 照片URL |
| status | ENUM | pending/success/failed/skipped |
| error_code | INT | 错误码 |
| error_message | TEXT | 错误信息 |
| sync_batch_id | VARCHAR(50) | 批次ID |
| sync_type | ENUM | single/batch/retry |
| synced_at | TIMESTAMP | 同步时间 |
| confirmed_at | TIMESTAMP | 确认时间 |

## API 接口

### 获取同步批次列表
```
GET /sync/batches?page=1&pageSize=20&startDate=2025-11-01&endDate=2025-11-30
```

### 获取批次详情
```
GET /sync/batches/:batchId
```

### 获取用户同步历史
```
GET /sync/user/:lotusId?limit=10
```

### 获取最近失败记录
```
GET /sync/failures?limit=50
```

### 获取同步统计
```
GET /sync/stats?days=7
```

## 进度显示增强

### 新增字段

```typescript
interface SyncProgress {
  // ... 原有字段
  startTime: number | null           // 开始时间戳
  estimatedTimeRemaining: number | null  // 预估剩余时间（秒）
  averageTimePerUser: number | null      // 平均每用户耗时（秒）
  batchId: string | null                 // 批次ID
}
```

### 预估时间计算

```typescript
// 基于已处理用户的平均耗时计算
const processed = confirmed + failed
const remaining = sent - processed
const avgTimePerUser = elapsed / processed
const estimatedTimeRemaining = remaining * avgTimePerUser
```

## 前端功能

### 1. 预估完成时间显示

在同步进度条下方显示：
- 预估剩余时间（分:秒格式）
- 平均每用户耗时

### 2. 同步历史查看

在设备管理页面添加"查看历史"按钮，可以：
- 查看历史同步批次列表
- 查看每个批次的详细信息
- 查看失败记录的详细错误信息

## 使用方法

### 1. 运行数据库迁移

```bash
# 在 MySQL 中执行
mysql -u root -p lianhuazhai < apps/api/src/db/migrations/add_sync_log_tables.sql
```

### 2. 前端显示预估时间

```typescript
// 获取同步进度
const { data } = await fetch('/sync/progress')

// 显示预估时间
if (data.estimatedTimeRemaining) {
  const minutes = Math.floor(data.estimatedTimeRemaining / 60)
  const seconds = data.estimatedTimeRemaining % 60
  console.log(`预估剩余时间: ${minutes}分${seconds}秒`)
}
```

### 3. 查看同步历史

```typescript
// 获取批次列表
const batches = await fetch('/sync/batches?page=1&pageSize=20')

// 获取批次详情
const detail = await fetch(`/sync/batches/${batchId}`)

// 获取失败记录
const failures = await fetch('/sync/failures?limit=50')
```

## 文件变更

### 新增文件
- `apps/api/src/modules/ws/sync-log.service.ts` - 同步记录服务
- `apps/api/src/db/migrations/add_sync_log_tables.sql` - 数据库迁移

### 修改文件
- `apps/api/src/db/schema.ts` - 添加新表定义
- `apps/api/src/modules/ws/sync-progress-manager.ts` - 添加预估时间
- `apps/api/src/modules/ws/service.ts` - 集成同步记录
- `apps/api/src/modules/ws/index.ts` - 添加查询接口

## 注意事项

1. 需要先执行数据库迁移创建表
2. 同步记录会占用一定存储空间，建议定期清理历史数据
3. 预估时间基于已处理用户的平均耗时，初期可能不准确
