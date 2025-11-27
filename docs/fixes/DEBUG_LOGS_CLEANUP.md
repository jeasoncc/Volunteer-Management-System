# 调试日志清理

## 问题

在开发过程中添加了大量调试日志，导致生产环境日志输出过多，影响性能和可读性。

特别是在考勤汇总功能中，每次计算工时都会输出：
```
DEBUG: 查询考勤记录: lotusId=LZ-V-6610604, date=2025-11-23
DEBUG: 找到 0 条记录
```

当生成月度汇总时，这些日志会重复数千次。

## 清理内容

### 1. 考勤汇总服务 (summary.service.ts)

**清理的日志**:
```typescript
// ❌ 删除
logger.debug(`查询考勤记录: lotusId=${lotusId}, date=${date}`)
logger.debug(`找到 ${records.length} 条记录`)
```

### 2. 打卡记录服务 (record.service.ts)

**清理的日志**:
```typescript
// ❌ 删除 - 原始参数调试
logger.info(`🔍 原始参数: ${JSON.stringify(params)}`)

// ❌ 删除 - 解析后参数调试
logger.info(`🔍 解析后: page=${page} (type: ${typeof page}), pageSize=${pageSize} (type: ${typeof pageSize}), offset=${offset}`)
logger.info(`📝 查询打卡记录: page=${page}, pageSize=${pageSize}, offset=${offset}, startDate=${startDate}, endDate=${endDate}, lotusId=${lotusId}`)

// ❌ 删除 - 准备查询日志
logger.info(`📝 准备查询: page=${page}, pageSize=${pageSize}, offset=${offset}`)

// ❌ 删除 - 总记录数日志
logger.info(`📊 总记录数: ${totalCount}, 总页数: ${totalPages}`)

// ❌ 删除 - 测试日志
logger.info(`🧪 测试：不使用LIMIT，返回 ${allIds.length} 条ID`)
logger.info(`🧪 测试：使用LIMIT ${pageSize} OFFSET ${offset}，返回 ${limitedIds.length} 条ID`)
logger.info(`🧪 测试：返回的ID: ${limitedIds.slice(0, 5).map(r => r.id).join(', ')}...`)

// ❌ 删除 - 最终查询结果日志
logger.info(`📝 最终查询结果: records=${records.length}, 期望=${pageSize}`)

// ❌ 删除 - LIMIT 诊断代码（已确认 LIMIT 工作正常）
if (records.length === allIds.length) {
  logger.error(`❌ 严重问题：LIMIT 完全无效！...`)
  // ... 应用层分页代码
}

// ❌ 删除 - 警告日志
if (records.length > pageSize) {
  logger.warn(`⚠️ 返回记录数(${records.length})超过pageSize(${pageSize})`)
}
```

**删除的测试代码**:
```typescript
// ❌ 删除 - 不再需要的测试查询
const allIds = await db.select({ id: volunteerCheckIn.id })...
const limitedIds = await db.select({ id: volunteerCheckIn.id })...
```

## 保留的日志

### 有用的业务日志（保留）

```typescript
// ✅ 保留 - 月度汇总开始
logger.info(`📊 开始生成 ${year}-${month} 的月度考勤汇总...`)

// ✅ 保留 - 处理进度（每100条）
if (successCount % 100 === 0) {
  logger.info(`✅ 已处理 ${successCount} 条记录...`)
}

// ✅ 保留 - 汇总完成统计
logger.info(`📊 月度汇总完成！`)
logger.info(`✅ 成功: ${successCount} 条`)
logger.info(`❌ 失败: ${errorCount} 条`)

// ✅ 保留 - 重复签到提示
logger.debug(`⏭️  重复签到: ${user.name}(${record.user_id}) - ${record.recog_time}`)

// ✅ 保留 - 头像同步跳过
logger.debug(`📸 用户 ${userId}(${existing.name}) 已有头像，跳过同步`)
```

## 清理原则

### 应该删除的日志
1. **开发调试日志**：用于开发阶段调试的临时日志
2. **高频输出日志**：在循环中每次都输出的日志
3. **冗余信息日志**：重复输出相同或类似信息的日志
4. **测试代码日志**：用于测试功能的临时日志

### 应该保留的日志
1. **关键业务日志**：记录重要业务操作的日志
2. **错误日志**：记录异常和错误的日志
3. **进度日志**：长时间操作的进度提示（如每100条）
4. **统计日志**：操作完成后的统计信息

## 影响

### 性能提升
- 减少日志 I/O 操作
- 降低日志文件大小
- 提高系统响应速度

### 可读性提升
- 日志更清晰，只包含关键信息
- 更容易定位问题
- 减少日志噪音

## 修改的文件

1. `apps/api/src/modules/checkin/summary.service.ts`
2. `apps/api/src/modules/checkin/record.service.ts`

## 测试建议

运行月度汇总功能，确认：
- ✅ 不再输出大量重复的调试日志
- ✅ 仍然输出关键的业务日志（开始、进度、完成）
- ✅ 功能正常工作
