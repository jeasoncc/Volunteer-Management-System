# 考勤月度汇总策略

## 📋 业务需求分析

### 当前问题
1. ❌ 每天生成汇总效率低
2. ❌ 跨天打卡处理复杂
3. ❌ 实时性要求不高（次月处理上月数据即可）

### 优化方案
✅ **月度汇总策略**
- 每月初（1-3号）处理上个月的考勤数据
- 一次性生成整月的汇总数据
- 跨天打卡在月度汇总时统一处理
- 跨月打卡不考虑（按自然月划分）

---

## 🎯 月度汇总策略

### 执行时机
```
每月 1-3 号执行上月汇总
例如：
- 2024-12-01 处理 2024-11 的数据
- 2025-01-01 处理 2024-12 的数据
```

### 处理逻辑

#### 1. 按自然月划分
```typescript
// 只处理该月的数据，不考虑跨月
startDate = '2024-11-01'
endDate = '2024-11-30'
```

#### 2. 跨天打卡处理
```typescript
// 场景：11-15 23:00 打卡，11-16 01:00 打卡
// 处理方式：
if (lastCheckIn < firstCheckIn) {
  // 判断为跨天
  // 11-16 01:00 算作 11-15 的签退
  // 工时 = 01:00 + 24小时 - 23:00 = 2小时
  workHours = (lastCheckIn + 24h) - firstCheckIn
  
  // 记录在 11-15 的汇总中
  date = '2024-11-15'
  isNightShift = true
}
```

#### 3. 跨月打卡不处理
```typescript
// 场景：11-30 23:00 打卡，12-01 01:00 打卡
// 处理方式：
// 11-30 的打卡：算作 11-30 的单次打卡（默认1小时）
// 12-01 的打卡：算作 12-01 的单次打卡（默认1小时）
// 不合并计算
```

---

## 💻 实现方案

### 方案1：定时任务（推荐）

#### 使用 node-cron
```typescript
import cron from 'node-cron'

// 每月1号凌晨2点执行
cron.schedule('0 2 1 * *', async () => {
  const lastMonth = dayjs().subtract(1, 'month')
  const year = lastMonth.year()
  const month = lastMonth.month() + 1
  
  console.log(`开始生成 ${year}-${month} 的考勤汇总...`)
  
  await generateMonthlySummary(year, month)
})
```

#### 配置文件
```typescript
// src/config/cron.ts
export const cronJobs = {
  monthlySummary: {
    schedule: '0 2 1 * *',  // 每月1号凌晨2点
    enabled: true,
    description: '生成上月考勤汇总',
  }
}
```

### 方案2：手动执行

#### API 接口
```
POST /api/v1/summary/generate-monthly

请求体：
{
  "year": 2024,
  "month": 11
}

响应：
{
  "success": true,
  "message": "汇总完成",
  "data": {
    "year": 2024,
    "month": 11,
    "totalRecords": 583,
    "totalHours": 2710.07,
    "processedUsers": 50
  }
}
```

#### 命令行脚本
```bash
# 生成上月汇总
bun run scripts/generate-monthly-summary.ts

# 生成指定月份汇总
bun run scripts/generate-monthly-summary.ts --year 2024 --month 11
```

---

## 📊 月度汇总流程

### 流程图
```
每月1号凌晨2点
  ↓
触发定时任务
  ↓
计算上月日期范围
  ↓
查询上月所有打卡记录
  ↓
按用户和日期分组
  ↓
逐条计算工时
  ├─ 单次打卡 → 1小时
  ├─ 双次打卡（同一天）→ 实际时长
  ├─ 跨天打卡 → 特殊处理
  └─ 多次打卡 → 最后-最初
  ↓
插入汇总表
  ↓
生成月度报表
  ↓
发送通知（可选）
  ↓
完成
```

### 详细步骤

#### 步骤1：确定处理范围
```typescript
const lastMonth = dayjs().subtract(1, 'month')
const startDate = lastMonth.startOf('month').format('YYYY-MM-DD')
const endDate = lastMonth.endOf('month').format('YYYY-MM-DD')

console.log(`处理范围: ${startDate} 至 ${endDate}`)
```

#### 步骤2：查询打卡记录
```typescript
const records = await db
  .select()
  .from(volunteerCheckIn)
  .where(
    and(
      gte(volunteerCheckIn.date, new Date(startDate)),
      lte(volunteerCheckIn.date, new Date(endDate))
    )
  )
  .orderBy(volunteerCheckIn.date, volunteerCheckIn.checkIn)
```

#### 步骤3：按用户和日期分组
```typescript
const grouped = records.reduce((acc, record) => {
  const key = `${record.userId}_${record.date}`
  if (!acc[key]) acc[key] = []
  acc[key].push(record)
  return acc
}, {})
```

#### 步骤4：计算每天的工时
```typescript
for (const [key, dayRecords] of Object.entries(grouped)) {
  const workHours = calculateWorkHours(dayRecords)
  await insertSummary(workHours)
}
```

#### 步骤5：处理跨天打卡
```typescript
function calculateWorkHours(records) {
  if (records.length === 1) {
    return { hours: 1, rule: 'single_card_1h' }
  }
  
  const first = dayjs(`${records[0].date} ${records[0].checkIn}`)
  const last = dayjs(`${records[records.length - 1].date} ${records[records.length - 1].checkIn}`)
  
  // 检查是否跨天
  if (last.isBefore(first)) {
    // 跨天：最后打卡时间加24小时
    const adjustedLast = last.add(1, 'day')
    const hours = adjustedLast.diff(first, 'hour', true)
    return { 
      hours: Math.min(hours, 12), 
      rule: 'night_shift_actual',
      isNightShift: true 
    }
  }
  
  // 正常情况
  const hours = last.diff(first, 'hour', true)
  return { 
    hours: Math.min(hours, 12), 
    rule: 'double_card_actual' 
  }
}
```

---

## 🔄 跨天打卡详细处理

### 场景1：正常跨天（同一天内）
```
11-15 23:00 打卡
11-15 23:30 打卡
→ 工时 = 0.5小时
→ 记录在 11-15
```

### 场景2：跨天打卡（跨到次日）
```
11-15 23:00 打卡
11-16 01:00 打卡（数据库记录为 11-16）

处理逻辑：
1. 查询 11-15 的所有打卡
2. 查询 11-16 的所有打卡
3. 判断：如果 11-16 的第一次打卡 < 11-15 的最后一次打卡
4. 则认为是跨天，合并计算
5. 工时 = (01:00 + 24小时) - 23:00 = 2小时
6. 记录在 11-15 的汇总中
7. 11-16 的这条记录标记为已处理
```

### 场景3：跨月打卡（不处理）
```
11-30 23:00 打卡
12-01 01:00 打卡

处理逻辑：
1. 11月汇总时：11-30 只有一次打卡 → 1小时
2. 12月汇总时：12-01 只有一次打卡 → 1小时
3. 不合并计算
```

---

## 📝 数据库设计优化

### 汇总表增加字段
```sql
ALTER TABLE volunteer_checkin_summary
ADD COLUMN month_year VARCHAR(7) COMMENT '月份（YYYY-MM）',
ADD COLUMN is_cross_day BOOLEAN DEFAULT FALSE COMMENT '是否跨天打卡',
ADD COLUMN cross_day_date DATE COMMENT '跨天的次日日期',
ADD INDEX idx_month_year (month_year);
```

### 示例数据
```sql
INSERT INTO volunteer_checkin_summary VALUES (
  ...,
  month_year = '2024-11',
  is_cross_day = TRUE,
  cross_day_date = '2024-11-16',
  ...
);
```

---

## 🎯 API 接口设计

### 1. 生成月度汇总
```
POST /api/v1/summary/generate-monthly

请求体：
{
  "year": 2024,
  "month": 11,
  "force": false  // 是否强制重新生成（删除已有数据）
}

响应：
{
  "success": true,
  "message": "汇总完成",
  "data": {
    "year": 2024,
    "month": 11,
    "startDate": "2024-11-01",
    "endDate": "2024-11-30",
    "totalRecords": 583,
    "totalHours": 2710.07,
    "processedUsers": 50,
    "crossDayRecords": 12,
    "duration": "2.5s"
  }
}
```

### 2. 查询月度汇总状态
```
GET /api/v1/summary/monthly-status?year=2024&month=11

响应：
{
  "success": true,
  "data": {
    "year": 2024,
    "month": 11,
    "isGenerated": true,
    "generatedAt": "2024-12-01T02:00:00Z",
    "totalRecords": 583,
    "totalHours": 2710.07
  }
}
```

### 3. 重新生成月度汇总
```
POST /api/v1/summary/regenerate-monthly

请求体：
{
  "year": 2024,
  "month": 11
}

说明：删除该月的所有汇总数据，重新生成
```

---

## 🧪 测试场景

### 测试1：正常月份
```bash
# 生成 2024-11 的汇总
curl -X POST http://localhost:3001/api/v1/summary/generate-monthly \
  -d '{"year": 2024, "month": 11}'
```

### 测试2：跨天打卡
```bash
# 插入测试数据
# 11-15 23:00
# 11-16 01:00

# 生成汇总，验证是否正确识别跨天
```

### 测试3：跨月打卡
```bash
# 插入测试数据
# 11-30 23:00
# 12-01 01:00

# 分别生成11月和12月汇总
# 验证是否分开计算
```

---

## ⚙️ 配置建议

### 定时任务配置
```typescript
// src/config/cron.ts
export const cronConfig = {
  monthlySummary: {
    // 每月1号凌晨2点
    schedule: '0 2 1 * *',
    enabled: true,
    timezone: 'Asia/Shanghai',
  }
}
```

### 通知配置
```typescript
// 汇总完成后发送通知
export const notificationConfig = {
  enabled: true,
  recipients: ['admin@example.com'],
  template: '月度考勤汇总已完成',
}
```

---

## 📊 性能优化

### 批量插入
```typescript
// 不要逐条插入
for (const summary of summaries) {
  await db.insert(volunteerCheckInSummary).values(summary)  // ❌ 慢
}

// 使用批量插入
await db.insert(volunteerCheckInSummary).values(summaries)  // ✅ 快
```

### 分批处理
```typescript
// 如果数据量大，分批处理
const batchSize = 100
for (let i = 0; i < summaries.length; i += batchSize) {
  const batch = summaries.slice(i, i + batchSize)
  await db.insert(volunteerCheckInSummary).values(batch)
  console.log(`已处理 ${i + batch.length}/${summaries.length}`)
}
```

---

## ✅ 优势总结

### 月度汇总 vs 每日汇总

| 对比项 | 每日汇总 | 月度汇总 |
|--------|---------|---------|
| 执行频率 | 每天 | 每月 |
| 性能 | 低（30次/月） | 高（1次/月） |
| 跨天处理 | 复杂 | 简单（统一处理） |
| 数据一致性 | 可能不一致 | 一致性好 |
| 维护成本 | 高 | 低 |
| 适用场景 | 实时性要求高 | 次月处理即可 ✅ |

### 月度汇总的优势
1. ✅ 性能更好（减少30倍执行次数）
2. ✅ 跨天处理更简单（统一在月末处理）
3. ✅ 数据一致性更好（一次性生成）
4. ✅ 维护成本更低
5. ✅ 符合业务需求（次月处理上月数据）

---

## 🚀 实施计划

### 第1步：修改汇总逻辑
- 移除每日汇总接口
- 实现月度汇总接口
- 优化跨天处理逻辑

### 第2步：配置定时任务
- 安装 node-cron
- 配置每月1号执行
- 添加错误处理和通知

### 第3步：测试验证
- 测试正常月份
- 测试跨天打卡
- 测试跨月打卡
- 性能测试

### 第4步：上线部署
- 部署新版本
- 监控执行情况
- 收集反馈

---

## 📋 下一步行动

1. ✅ 创建月度汇总接口
2. ✅ 优化跨天处理逻辑
3. ⏳ 配置定时任务
4. ⏳ 添加通知功能
5. ⏳ 编写测试用例

---

**结论：采用月度汇总策略，每月初处理上月数据，性能更好，逻辑更简单！**
