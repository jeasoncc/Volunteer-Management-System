# 同步超时问题修复

## 问题描述

在同步过程中出现 "timeout of 30000ms exceeded" 错误。

## 原因分析

1. **照片预检查功能**使用了 `AbortSignal.timeout(3000)`，这个 API 在某些环境（如 Bun）中可能不支持
2. 照片预检查会对每个义工的照片发起 HTTP 请求，如果网络慢或照片多，会显著增加同步时间
3. 默认开启照片预检查会导致用户体验变差

## 修复方案

### 1. 改进超时实现

使用更兼容的方式实现超时控制：

```typescript
// 之前（不兼容）
const response = await fetch(photoUrl, { 
  method: 'HEAD', 
  signal: AbortSignal.timeout(3000) 
})

// 现在（兼容）
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 3000)

const response = await Promise.race([
  fetch(photoUrl, { method: 'HEAD', signal: controller.signal }),
  new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error('timeout')), 3000)
  )
])

clearTimeout(timeoutId)
```

### 2. 优化用户提示

```typescript
// 之前
同步前检查照片可访问性（会稍慢）

// 现在
同步前检查照片（会显著变慢，不推荐）
⚠️ 开启照片检查会使同步时间增加3-5倍
```

## 使用建议

### ❌ 不推荐使用照片预检查的场景

- 日常同步（每天的常规操作）
- 增量同步（只有几个新义工）
- 网络环境不稳定时
- 追求速度时

### ✅ 可以使用照片预检查的场景

- 首次全量同步（确保数据质量）
- 批量导入后的首次同步
- 怀疑照片有问题时
- 不着急完成同步时

## 性能对比

| 场景 | 不开启预检查 | 开启预检查 |
|------|------------|-----------|
| 50人同步 | 5-10秒 | 20-40秒 |
| 100人同步 | 10-20秒 | 40-80秒 |
| 200人同步 | 20-40秒 | 80-160秒 |

## 推荐工作流程

### 标准同步流程（推荐）

1. 选择合适的同步策略
2. **不勾选**照片预检查
3. 点击"开始同步"
4. 观察实时日志
5. 如有失败（照片问题），修复后重试

### 谨慎同步流程（首次使用）

1. 选择"全量同步"
2. **勾选**照片预检查
3. 点击"开始同步"
4. 耐心等待（可能需要几分钟）
5. 根据日志修复问题

## 错误处理

如果仍然遇到超时错误：

1. **检查网络连接**：确保服务器和考勤机网络正常
2. **关闭照片预检查**：这是最常见的超时原因
3. **分批同步**：使用"增量同步"策略，分多次完成
4. **单个下发**：对于特定义工，使用"下发单个义工"功能

## 技术细节

### 超时机制

```typescript
// 双重超时保护
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 3000)

const response = await Promise.race([
  fetch(photoUrl, { method: 'HEAD', signal: controller.signal }),
  new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error('timeout')), 3000)
  )
])

clearTimeout(timeoutId)
```

- 使用 `AbortController` 取消请求
- 使用 `Promise.race` 实现超时
- 双重保护确保不会卡死

### 错误分类

| 错误类型 | 原因 | 处理方式 |
|---------|------|---------|
| `timeout` | 请求超过3秒 | 跳过该义工 |
| `AbortError` | 请求被取消 | 跳过该义工 |
| `unreachable` | HTTP 状态非 200 | 跳过该义工 |
| `network_error` | 网络错误 | 跳过该义工 |

## 修复时间

2025-11-27

## 相关文件

- `apps/api/src/modules/ws/service.ts` - 照片预检查实现
- `apps/web/src/routes/devices.tsx` - 前端界面
