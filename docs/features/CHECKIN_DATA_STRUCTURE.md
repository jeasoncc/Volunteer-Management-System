# 考勤数据结构说明

## 数据表概览

考勤系统使用了 **两张核心表**：

1. **`volunteer_checkin`** - 原始打卡记录表（详情数据）
2. **`volunteer_checkin_summary`** - 考勤汇总表（统计数据）

## 1. 原始打卡记录表 `volunteer_checkin`

### 用途
存储考勤设备上报的**原始打卡记录**，每次打卡都会生成一条记录。

### 表结构

```typescript
{
  id: number                    // 主键
  userId: number                // 义工ID（外键 -> volunteer.id）
  date: string                  // 打卡日期 (YYYY-MM-DD)
  checkIn: string               // 签到时间 (HH:mm:ss)
  status: enum                  // 状态：present/late/early_leave/absent/on_leave
  location: string              // 打卡地点（默认：深圳市龙岗区慈海医院福慧园七栋一楼）
  notes: string                 // 备注
  createdAt: timestamp          // 创建时间
  
  // 冗余字段（方便查询）
  lotusId: string               // 莲花斋ID
  name: string                  // 姓名
  
  // 设备相关字段
  recordType: string            // 记录类型：face/manual
  deviceSn: string              // 设备序列号
  originTime: string            // 原始时间
  recordId: string              // 记录ID
  bodyTemperature: string       // 体温
  confidence: string            // 识别置信度
}
```

### 特点
- ✅ **原始数据**：保留所有打卡记录，不做汇总
- ✅ **详细信息**：包含设备信息、体温、置信度等
- ✅ **冗余设计**：存储 lotusId 和 name，避免频繁 JOIN
- ✅ **只有签到**：目前只记录签到时间（checkIn），没有签退（checkOut）

### 数据来源
1. **考勤设备自动上报** - 人脸识别打卡（recordType = 'face'）
2. **手动创建** - 管理员手动添加（recordType = 'manual'）

### 查询示例

```sql
-- 查询某个用户的打卡记录
SELECT * FROM volunteer_checkin 
WHERE lotus_id = 'LHZ0001' 
  AND date BETWEEN '2024-11-01' AND '2024-11-30'
ORDER BY date DESC, check_in DESC;

-- 查询某天的所有打卡记录
SELECT * FROM volunteer_checkin 
WHERE date = '2024-11-27'
ORDER BY check_in;
```

## 2. 考勤汇总表 `volunteer_checkin_summary`

### 用途
存储**每日考勤汇总数据**，用于统计和报表。每个用户每天一条记录。

### 表结构

```typescript
{
  id: number                    // 主键
  userId: number                // 义工ID（外键 -> volunteer.id）
  lotusId: string               // 莲花斋ID
  name: string                  // 姓名
  date: string                  // 日期 (YYYY-MM-DD)
  
  // 汇总数据
  firstCheckinTime: string      // 首次签到时间
  lastCheckinTime: string       // 最后签到时间
  checkinCount: number          // 打卡次数
  workHours: number             // 工作时长（分钟）
  
  // 计算规则
  calculationRule: string       // 计算规则
  status: enum                  // 状态
  isNightShift: boolean         // 是否夜班
  
  // 设备信息
  deviceSn: string              // 设备序列号
  bodyTemperature: string       // 体温
  confidence: string            // 识别置信度
  
  // 备注和调整
  notes: string                 // 备注
  isManual: boolean             // 是否手动创建
  adjustedBy: string            // 调整人
  adjustedAt: timestamp         // 调整时间
  
  // 时间戳
  createdAt: timestamp          // 创建时间
  updatedAt: timestamp          // 更新时间
}
```

### 特点
- ✅ **汇总数据**：每人每天一条记录
- ✅ **计算工时**：自动计算工作时长
- ✅ **支持调整**：可以手动调整数据
- ✅ **统计友好**：适合生成报表和统计

### 数据来源
1. **自动生成** - 定时任务从 `volunteer_checkin` 汇总
2. **手动创建** - 管理员手动添加汇总记录
3. **手动调整** - 管理员修改汇总数据

### 查询示例

```sql
-- 查询某个用户的月度汇总
SELECT * FROM volunteer_checkin_summary 
WHERE lotus_id = 'LHZ0001' 
  AND date BETWEEN '2024-11-01' AND '2024-11-30'
ORDER BY date;

-- 统计某月的总工时
SELECT 
  lotus_id,
  name,
  SUM(work_hours) / 60 as total_hours,
  COUNT(*) as work_days
FROM volunteer_checkin_summary 
WHERE date BETWEEN '2024-11-01' AND '2024-11-30'
GROUP BY lotus_id, name
ORDER BY total_hours DESC;
```

## 3. 陌生人记录表 `stranger_checkin`

### 用途
存储**未识别人员**的打卡记录（不在系统中的人）。

### 表结构

```typescript
{
  id: number                    // 主键
  deviceSn: string              // 设备序列号
  date: string                  // 日期
  time: string                  // 时间
  userId: string                // 设备返回的用户ID
  userName: string              // 设备返回的用户名
  gender: number                // 性别
  bodyTemperature: string       // 体温
  confidence: string            // 识别置信度
  photo: string                 // 照片（Base64）
  location: json                // 位置信息
  originTime: string            // 原始时间
  recordType: string            // 记录类型
  createdAt: timestamp          // 创建时间
}
```

## 数据流程图

```
考勤设备
    ↓
[人脸识别]
    ↓
    ├─→ 识别成功 → volunteer_checkin（原始记录）
    │                      ↓
    │              [定时任务/手动触发]
    │                      ↓
    │          volunteer_checkin_summary（汇总记录）
    │                      ↓
    │                  [报表导出]
    │
    └─→ 识别失败 → stranger_checkin（陌生人记录）
```

## 前端页面与数据表的对应关系

| 页面 | 数据表 | 说明 |
|------|--------|------|
| `/checkin` 主页面 | `volunteer_checkin_summary` | 显示月度汇总报表 |
| `/checkin/details` 详情页面 | `volunteer_checkin` | 显示原始打卡记录 ✨ |
| `/checkin/records` 记录页面 | `volunteer_checkin_summary` | 显示汇总记录列表 |
| `/checkin/strangers` 陌生人页面 | `stranger_checkin` | 显示陌生人记录 |

## API 与数据表的对应关系

### 原始打卡记录 API（`volunteer_checkin`）

```typescript
// 查询原始打卡记录列表
GET /api/v1/checkin/records
→ SELECT * FROM volunteer_checkin

// 查询单条打卡记录
GET /api/v1/checkin/records/:id
→ SELECT * FROM volunteer_checkin WHERE id = :id

// 查询用户打卡记录（带统计）
GET /api/v1/checkin/records/user/:lotusId
→ SELECT * FROM volunteer_checkin WHERE lotus_id = :lotusId

// 创建打卡记录
POST /api/v1/checkin/records
→ INSERT INTO volunteer_checkin

// 更新打卡记录
PUT /api/v1/checkin/records/:id
→ UPDATE volunteer_checkin WHERE id = :id

// 删除打卡记录
DELETE /api/v1/checkin/records/:id
→ DELETE FROM volunteer_checkin WHERE id = :id
```

### 考勤汇总 API（`volunteer_checkin_summary`）

```typescript
// 查询汇总记录列表
GET /api/v1/summary/list
→ SELECT * FROM volunteer_checkin_summary

// 查询单条汇总记录
GET /api/v1/summary/:id
→ SELECT * FROM volunteer_checkin_summary WHERE id = :id

// 查询用户考勤汇总
GET /api/v1/summary/user
→ SELECT * FROM volunteer_checkin_summary WHERE lotus_id = :lotusId

// 生成月度考勤汇总
POST /api/v1/summary/generate-monthly
→ 从 volunteer_checkin 汇总数据到 volunteer_checkin_summary

// 获取月度考勤报表
GET /api/v1/report/monthly
→ SELECT * FROM volunteer_checkin_summary WHERE date BETWEEN ...
```

## 重要说明

### 1. 考勤详情页面的数据来源 ✨

**问题**: 考勤详情页面从哪张表查数据？

**答案**: **`volunteer_checkin`** 表（原始打卡记录表）

**代码位置**:
- 后端：`apps/api/src/modules/checkin/record.service.ts`
- 前端：`apps/web/src/routes/checkin.details.tsx`
- API：`GET /api/v1/checkin/records`

**查询逻辑**:
```typescript
// 后端查询（record.service.ts）
db.select({
  id: volunteerCheckIn.id,
  userId: volunteerCheckIn.userId,
  date: volunteerCheckIn.date,
  checkIn: volunteerCheckIn.checkIn,
  checkOut: volunteerCheckIn.checkOut,
  status: volunteerCheckIn.status,
  location: volunteerCheckIn.location,
  notes: volunteerCheckIn.notes,
  // ... 其他字段
  lotusId: volunteer.lotusId,  // JOIN volunteer 表获取
  name: volunteer.name,        // JOIN volunteer 表获取
})
.from(volunteerCheckIn)
.leftJoin(volunteer, eq(volunteerCheckIn.userId, volunteer.id))
```

### 2. 两张表的区别

| 特性 | volunteer_checkin | volunteer_checkin_summary |
|------|-------------------|---------------------------|
| **数据粒度** | 每次打卡一条记录 | 每人每天一条记录 |
| **数据量** | 大（原始数据） | 小（汇总数据） |
| **用途** | 详细查询、审计 | 统计报表、导出 |
| **更新频率** | 实时（设备上报） | 定时（汇总任务） |
| **是否可编辑** | 一般不编辑 | 可以手动调整 |
| **工时计算** | 无 | 有（自动计算） |

### 3. 数据一致性

- ✅ `volunteer_checkin` 是**源数据**
- ✅ `volunteer_checkin_summary` 是**派生数据**
- ✅ 汇总数据从原始数据计算得出
- ✅ 如果原始数据变化，需要重新生成汇总

### 4. 当前缺失的字段

**`volunteer_checkin` 表缺少**:
- ❌ `checkOut` 字段（签退时间）- 表结构中定义了但未使用
- ❌ `updatedAt` 字段（更新时间）- 表结构中未定义

**建议**:
- 如果需要记录签退时间，需要修改设备上报逻辑
- 添加 `updatedAt` 字段便于追踪记录修改

## 优化建议

### 1. 添加缺失字段

```sql
-- 添加 updatedAt 字段
ALTER TABLE volunteer_checkin 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 添加 checkOut 字段（如果需要）
ALTER TABLE volunteer_checkin 
ADD COLUMN check_out TIME;
```

### 2. 添加索引优化查询

```sql
-- 优化日期范围查询
CREATE INDEX idx_checkin_date ON volunteer_checkin(date);

-- 优化用户查询
CREATE INDEX idx_checkin_lotus_id ON volunteer_checkin(lotus_id);

-- 优化联合查询
CREATE INDEX idx_checkin_lotus_date ON volunteer_checkin(lotus_id, date);

-- 汇总表索引
CREATE INDEX idx_summary_date ON volunteer_checkin_summary(date);
CREATE INDEX idx_summary_lotus_id ON volunteer_checkin_summary(lotus_id);
```

### 3. 数据清理策略

```typescript
// 定期清理旧的原始记录（保留 1 年）
DELETE FROM volunteer_checkin 
WHERE date < DATE_SUB(CURDATE(), INTERVAL 1 YEAR);

// 保留汇总数据（永久保存）
// volunteer_checkin_summary 不清理
```

## 相关文档

- [考勤功能审查报告](CHECKIN_FEATURE_AUDIT.md)
- [考勤功能总结](CHECKIN_FEATURE_SUMMARY.md)
- [数据库设计文档](../api/database/)

## 总结

✅ **考勤详情页面** 查询的是 **`volunteer_checkin`** 表（原始打卡记录）

✅ **主考勤页面** 查询的是 **`volunteer_checkin_summary`** 表（汇总数据）

✅ **两张表各司其职**：
- `volunteer_checkin` - 详细记录，用于审计和详情查询
- `volunteer_checkin_summary` - 汇总统计，用于报表和导出

✅ **数据流程清晰**：设备上报 → 原始记录 → 汇总记录 → 报表导出

---

**文档创建时间**: 2024-11-27  
**数据表版本**: v1.0  
**维护者**: AI 辅助开发
