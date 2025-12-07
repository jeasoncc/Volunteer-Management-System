# 满勤功能

## 功能说明

为义工批量生成满勤考勤记录，每天12小时工时，时间随机化避免看起来是批量生成的。

## 使用方法

### 1. 生成满勤记录

1. 进入义工管理页面
2. 找到需要生成满勤的义工
3. 点击操作菜单（三个点）
4. 选择"生成满勤"
5. 在对话框中选择年月和每天工时
6. 点击"生成满勤记录"

### 2. 配置选项

- **年份**：选择要生成满勤的年份
- **月份**：选择要生成满勤的月份
- **每天工时**：默认12小时，可调整

### 3. 生成规则

- 自动生成该月每一天的考勤记录
- 签到时间：8:00 ± 30分钟（随机）
- 签退时间：签到时间 + 工作小时数 ± 30分钟（随机）
- 已有考勤记录的日期会自动跳过
- 记录会标记为"满勤记录"

## 数据库变更

### 新增字段

**表：** `volunteer_check_in`

**字段：** `is_perfect_attendance`
- 类型：BOOLEAN
- 默认值：FALSE
- 说明：标识该记录是否为满勤生成的

### 迁移SQL

```sql
ALTER TABLE volunteer_check_in 
ADD COLUMN is_perfect_attendance BOOLEAN DEFAULT FALSE COMMENT '是否为满勤记录';

CREATE INDEX idx_perfect_attendance ON volunteer_check_in(is_perfect_attendance);
```

## API接口

### 生成满勤记录

**请求：**
```
POST /api/volunteer/:lotusId/perfect-attendance
```

**参数：**
```json
{
  "year": 2024,
  "month": 12,
  "hoursPerDay": 12
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "lotusId": "LZ-V-1234567",
    "name": "张三",
    "year": 2024,
    "month": 12,
    "totalDays": 31,
    "createdCount": 28,
    "skippedCount": 3,
    "hoursPerDay": 12
  }
}
```

### 删除满勤记录

**请求：**
```
DELETE /api/volunteer/:lotusId/perfect-attendance?year=2024&month=12
```

**响应：**
```json
{
  "success": true,
  "message": "删除成功"
}
```

## 技术实现

### 后端服务

**文件：** `apps/api/src/modules/volunteer/perfect-attendance.service.ts`

**核心函数：**
- `generatePerfectAttendance()` - 生成满勤记录
- `deletePerfectAttendance()` - 删除满勤记录
- `generateRandomTime()` - 生成随机时间
- `getMonthDates()` - 获取月份所有日期

### 前端组件

**文件：** `apps/web/src/components/PerfectAttendanceDialog.tsx`

**功能：**
- 年月选择
- 工时配置
- 统计信息显示
- 注意事项提示

## 使用场景

1. **月度考勤补录**
   - 义工实际每天都来，但忘记打卡
   - 批量补录整月考勤

2. **驻堂义工**
   - 长期驻堂的义工
   - 每月固定工时

3. **特殊情况**
   - 考勤机故障期间的记录补录
   - 历史数据迁移

## 注意事项

1. **已有记录处理**
   - 已有考勤记录的日期会自动跳过
   - 不会覆盖现有记录

2. **时间随机化**
   - 签到时间在8:00前后30分钟内随机
   - 签退时间根据工时计算后再随机
   - 避免看起来是批量生成的

3. **记录标识**
   - 所有满勤记录都会标记 `is_perfect_attendance = true`
   - 可以通过此字段筛选或删除满勤记录

4. **权限控制**
   - 需要登录才能使用
   - 建议只给管理员开放此功能

## 示例

### 生成2024年12月满勤

```typescript
// 请求
POST /api/volunteer/LZ-V-1234567/perfect-attendance
{
  "year": 2024,
  "month": 12,
  "hoursPerDay": 12
}

// 结果
- 12月有31天
- 已有3天有考勤记录（跳过）
- 生成28天的满勤记录
- 每天12小时工时
- 总工时：28 × 12 = 336小时
```

### 生成的记录示例

```
日期: 2024-12-01
签到: 07:45:23 (8:00 - 15分钟)
签退: 19:52:17 (19:45 + 7分钟)
工时: 12小时
标记: is_perfect_attendance = true
备注: 满勤记录 - 2024年12月
```

## 未来改进

1. **批量生成**
   - 支持为多个义工同时生成满勤
   - 支持生成多个月份

2. **模板配置**
   - 保存常用的工时配置
   - 快速应用模板

3. **审批流程**
   - 满勤记录需要审批
   - 防止滥用

4. **统计报表**
   - 满勤记录统计
   - 与实际打卡记录对比

## 总结

满勤功能简化了批量考勤记录的生成，特别适合驻堂义工和月度考勤补录场景。通过时间随机化和记录标识，既保证了数据的真实性，又便于后续管理。
