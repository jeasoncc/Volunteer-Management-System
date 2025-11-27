# 义工考勤字段添加完成

## 修改时间
2024-11-27

## 新增字段

已在 `volunteer` 表中添加两个考勤相关字段：

### 1. sync_to_attendance (是否同步到考勤机)
- **字段名**: `sync_to_attendance`
- **类型**: `BOOLEAN`
- **默认值**: `FALSE`
- **说明**: 标记该义工是否需要同步到考勤机设备
- **用途**: 
  - 控制哪些义工的信息需要推送到考勤机
  - 只有设置为 `TRUE` 的义工才会被同步到考勤设备

### 2. require_full_attendance (是否需要考勤全勤配置)
- **字段名**: `require_full_attendance`
- **类型**: `BOOLEAN`
- **默认值**: `FALSE`
- **说明**: 标记该义工是否需要全勤考勤配置
- **用途**:
  - 区分需要全勤考勤的义工（如驻堂义工）
  - 用于考勤统计和工时计算的特殊规则

## 修改文件

### 1. 数据库Schema
**文件**: `apps/api/src/db/schema.ts`

```typescript
export const volunteer = mysqlTable('volunteer', {
  // ... 其他字段
  memberStatus:         mysqlEnum('member_status', ['volunteer', 'resident']).default('volunteer'),
  roomId:               int('room_id').default(0),
  syncToAttendance:     boolean('sync_to_attendance').default(false), // 新增
  requireFullAttendance: boolean('require_full_attendance').default(false), // 新增
  createdAt:            timestamp('created_at').defaultNow(),
  updatedAt:            timestamp('updated_at').defaultNow().onUpdateNow(),
})
```

### 2. 数据库迁移
**文件**: `apps/api/migrations/add_attendance_fields.sql`

```sql
-- 添加「是否同步到考勤机」字段
ALTER TABLE `volunteer` 
ADD COLUMN `sync_to_attendance` BOOLEAN DEFAULT FALSE COMMENT '是否同步到考勤机' 
AFTER `room_id`;

-- 添加「是否需要考勤全勤配置」字段
ALTER TABLE `volunteer` 
ADD COLUMN `require_full_attendance` BOOLEAN DEFAULT FALSE COMMENT '是否需要考勤全勤配置' 
AFTER `sync_to_attendance`;
```

### 3. 迁移脚本
**文件**: `apps/api/scripts/migrate-attendance-fields.ts`

自动检查字段是否存在，如果不存在则添加。

## 执行状态

✅ 字段已成功添加到数据库
✅ Schema文件已更新
✅ 迁移脚本已创建

## 使用示例

### 查询需要同步到考勤机的义工
```typescript
import { db } from './db'
import { volunteer } from './db/schema'
import { eq } from 'drizzle-orm'

// 查询所有需要同步的义工
const syncVolunteers = await db
  .select()
  .from(volunteer)
  .where(eq(volunteer.syncToAttendance, true))
```

### 更新义工的考勤配置
```typescript
// 设置义工需要同步到考勤机
await db
  .update(volunteer)
  .set({ 
    syncToAttendance: true,
    requireFullAttendance: true 
  })
  .where(eq(volunteer.lotusId, 'LZ-V-1234567'))
```

### 批量设置驻堂义工
```typescript
// 将所有驻堂义工设置为需要全勤考勤
await db
  .update(volunteer)
  .set({ 
    requireFullAttendance: true,
    syncToAttendance: true 
  })
  .where(eq(volunteer.memberStatus, 'resident'))
```

## 后续工作

1. **前端界面更新**
   - 在义工编辑表单中添加这两个字段的开关
   - 在义工列表中显示考勤配置状态

2. **API接口更新**
   - 更新义工创建/更新接口，支持这两个字段
   - 添加批量设置考勤配置的接口

3. **考勤机同步功能**
   - 实现根据 `syncToAttendance` 字段同步义工到考勤机
   - 实现考勤数据的双向同步

4. **考勤统计优化**
   - 根据 `requireFullAttendance` 字段应用不同的考勤规则
   - 优化工时计算逻辑

## 注意事项

- 所有现有义工的这两个字段默认为 `FALSE`
- 需要手动或通过批量操作设置需要考勤的义工
- 建议先设置驻堂义工（`memberStatus = 'resident'`）的考勤配置
