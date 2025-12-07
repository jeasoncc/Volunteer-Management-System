# 满勤导出功能修复

## 问题描述

用户反馈：选中了义工的"满勤"配置后，导出上个月的考勤数据时，该义工并不显示为满勤。

**期望行为**：标记为"满勤"的义工，在导出任何月份的考勤数据时，都应该自动填充满勤记录（每天12小时）。

## 解决方案

### 核心逻辑

修改考勤导出服务 `CheckInExportService`，在导出时：

1. **查询满勤义工**：从数据库中查询所有 `requireFullAttendance = true` 的义工
2. **生成满勤记录**：为这些义工在导出日期范围内的每一天生成满勤记录
   - 签到时间：08:00
   - 签退时间：20:00
   - 服务时长：12小时
3. **合并记录**：将生成的满勤记录与实际打卡记录合并
   - **优先级**：满勤记录优先于实际打卡记录
   - **规则**：如果某义工某天有满勤记录，则忽略该天的实际打卡记录

### 修改文件

**文件**: `apps/api/src/modules/checkin/export.service.ts`

#### 1. 查询满勤义工

```typescript
// 查询所有需要满勤的义工
const fullAttendanceConditions = [sql`${volunteer.requireFullAttendance} = true`]
if (lotusIds && lotusIds.length > 0) {
  fullAttendanceConditions.push(sql`${volunteer.lotusId} IN (...)`)
}

const fullAttendanceVolunteers = await db
  .select({
    lotusId: volunteer.lotusId,
    volunteerId: volunteer.volunteerId,
    name: volunteer.name,
  })
  .from(volunteer)
  .where(and(...fullAttendanceConditions))
```

#### 2. 生成满勤记录

新增方法 `generateFullAttendanceRecords()`：

```typescript
private static generateFullAttendanceRecords(
  volunteers: Array<{ lotusId: string; volunteerId: string | null; name: string }>,
  startDate: string,
  endDate: string
) {
  const records = []
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  
  for (const volunteer of volunteers) {
    let currentDate = start
    while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
      // 为每一天生成两条记录：签到（08:00）和签退（20:00）
      records.push({
        lotusId: volunteer.lotusId,
        volunteerId: volunteer.volunteerId,
        name: volunteer.name,
        date: currentDate.toDate(),
        checkIn: '08:00:00',
        isFullAttendanceRecord: true, // 标记为满勤记录
      })
      records.push({
        lotusId: volunteer.lotusId,
        volunteerId: volunteer.volunteerId,
        name: volunteer.name,
        date: currentDate.toDate(),
        checkIn: '20:00:00',
        isFullAttendanceRecord: true,
      })
      
      currentDate = currentDate.add(1, 'day')
    }
  }
  
  return records
}
```

#### 3. 合并记录

新增方法 `mergeRecords()`：

```typescript
private static mergeRecords(actualRecords: any[], fullAttendanceRecords: any[]) {
  // 创建满勤记录的索引：lotusId_date -> true
  const fullAttendanceIndex = new Set<string>()
  for (const record of fullAttendanceRecords) {
    const key = `${record.lotusId}_${dayjs(record.date).format('YYYY-MM-DD')}`
    fullAttendanceIndex.add(key)
  }
  
  // 过滤掉已有满勤记录的实际打卡记录
  const filteredActualRecords = actualRecords.filter(record => {
    const key = `${record.lotusId}_${dayjs(record.date).format('YYYY-MM-DD')}`
    return !fullAttendanceIndex.has(key)
  })
  
  // 合并
  return [...filteredActualRecords, ...fullAttendanceRecords]
}
```

#### 4. 修改工时计算逻辑

在 `groupAndCalculate()` 方法中，检查是否为满勤记录：

```typescript
// 检查是否为满勤记录
if (firstRecord.isFullAttendanceRecord) {
  // 满勤记录：固定为 08:00 签到，20:00 签退，12小时
  checkInTime = '08:00'
  checkOutTime = '20:00'
  serviceHours = 12
} else {
  // 实际打卡记录：按原逻辑计算
  // ...
}
```

## 使用场景示例

### 场景 1：义工有实际打卡记录

**情况**：陈璋在 2025年1月 有实际打卡记录，但在 2024年12月 没有打卡记录

**操作**：
1. 在义工编辑表单中，勾选陈璋的"满勤配置"
2. 导出 2024年12月 的考勤数据

**结果**：
- 陈璋在 2024年12月 的每一天都显示满勤（08:00-20:00，12小时）
- 即使他在该月没有任何实际打卡记录

### 场景 2：义工既有满勤配置又有实际打卡

**情况**：陈璋标记为满勤，但在某天也有实际打卡记录

**操作**：导出该月的考勤数据

**结果**：
- 满勤记录优先
- 该天显示为满勤（08:00-20:00，12小时）
- 实际打卡记录被忽略

### 场景 3：部分义工满勤，部分义工正常

**情况**：
- 陈璋：标记为满勤
- 张三：未标记满勤，有实际打卡记录
- 李四：未标记满勤，无打卡记录

**操作**：导出某月的考勤数据

**结果**：
- 陈璋：每天12小时满勤
- 张三：按实际打卡记录计算工时
- 李四：无记录

## 数据流程

```
导出请求
  ↓
查询实际打卡记录
  ↓
查询满勤义工列表
  ↓
为满勤义工生成每天的满勤记录
  ↓
合并记录（满勤记录优先）
  ↓
按用户和日期分组
  ↓
计算工时（满勤记录固定12小时）
  ↓
生成 Excel 文件
```

## 技术细节

### 满勤记录的特征

- `isFullAttendanceRecord: true` - 标记为满勤记录
- 每天生成2条记录：
  - 签到：08:00:00
  - 签退：20:00:00
- 服务时长：固定12小时

### 优先级规则

满勤记录 > 实际打卡记录

这意味着：
- 如果义工标记为满勤，即使他某天有实际打卡，也会显示为满勤
- 这样可以确保满勤义工的记录一致性

### 日期范围处理

- 满勤记录覆盖导出日期范围内的每一天
- 包括起始日期和结束日期
- 使用 dayjs 进行日期计算，确保准确性

## 测试建议

### 测试步骤

1. **准备测试数据**
   - 创建一个测试义工（如：陈璋）
   - 勾选"满勤配置"
   - 保存

2. **测试无打卡记录的月份**
   - 导出该义工没有任何打卡记录的月份
   - 验证：每天都显示12小时满勤

3. **测试有打卡记录的月份**
   - 导出该义工有部分打卡记录的月份
   - 验证：所有天数都显示12小时满勤（实际打卡被覆盖）

4. **测试混合场景**
   - 同时导出满勤义工和普通义工
   - 验证：满勤义工显示满勤，普通义工显示实际工时

5. **测试日期范围**
   - 导出跨月的日期范围
   - 验证：满勤记录覆盖整个日期范围

### 预期结果

导出的 Excel 文件中：
- 满勤义工的每一天都有记录
- 签到时间：08:00
- 签退时间：20:00
- 服务时长：12小时

## 相关文件

- `apps/api/src/modules/checkin/export.service.ts` - 导出服务（已修改）
- `apps/api/src/db/schema.ts` - 数据库 schema（已有 requireFullAttendance 字段）
- `apps/web/src/components/VolunteerForm.tsx` - 义工表单（已有满勤开关）

## 注意事项

1. **数据一致性**：满勤配置是实时生效的，修改后立即影响导出结果
2. **历史数据**：满勤配置会影响所有月份的导出，包括过去的月份
3. **优先级**：满勤记录始终优先于实际打卡记录
4. **性能**：为满勤义工生成记录是在内存中进行的，不会写入数据库

## 完成状态

✅ 满勤义工查询逻辑
✅ 满勤记录生成逻辑
✅ 记录合并逻辑
✅ 工时计算逻辑
✅ 类型检查通过

## 下一步

建议进行以下测试：
1. 重启 API 服务器
2. 标记一个义工为满勤
3. 导出该义工没有打卡记录的月份
4. 验证导出的 Excel 文件中该义工每天都是12小时
