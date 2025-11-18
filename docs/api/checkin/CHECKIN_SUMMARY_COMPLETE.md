# 考勤汇总系统完整文档

## ✅ 已完成的三个任务

### 任务1：检查 schema.ts 字段命名 ✅

**检查结果：所有表的字段都符合下划线命名规范**

| 表名 | 数据库列名 | TypeScript 属性名 | 状态 |
|------|-----------|------------------|------|
| volunteer | lotus_id, birth_date, has_buddhism_faith | lotusId, birthDate, hasBuddhismFaith | ✅ |
| admin | last_login, login_ip, is_active | lastLogin, loginIp, isActive | ✅ |
| volunteer_checkin | user_id, check_in, record_type, origin_time | userId, checkIn, recordType, originTime | ✅ |
| volunteer_checkin_summary | first_checkin_time, work_hours, is_night_shift | firstCheckinTime, workHours, isNightShift | ✅ |
| deceased | death_date, is_ordained, family_contact | deathDate, isOrdained, familyContact | ✅ |
| chanting_schedule | time_slot, actual_start_time, created_by | timeSlot, actualStartTime, createdBy | ✅ |

**命名规范：**
- 数据库：`snake_case`（下划线）
- 代码：`camelCase`（驼峰）
- ORM 自动映射

---

### 任务2：生成考勤汇总数据 ✅

**执行脚本：**
```bash
bun run scripts/generate-checkin-summary.ts
```

**生成结果：**
```
📊 开始生成考勤汇总数据...
📅 找到 75 个不同的日期
✅ 已处理 100 条记录...
✅ 已处理 200 条记录...
✅ 已处理 300 条记录...
✅ 已处理 400 条记录...
✅ 已处理 500 条记录...

📊 汇总完成！
✅ 成功: 583 条
⏭️  跳过: 1 条（已存在）
❌ 失败: 0 条
```

**数据统计：**
- 原始签到记录：2005 条
- 生成汇总记录：583 条
- 总工时：2710.07 小时

**示例数据：**
```sql
lotus_id      | name  | date       | work_hours | calculation_rule
LZ-V-6020135  | 陈璋  | 2025-11-16 | 2.00       | double_card_actual
LZ-V-1241702  | 房石安 | 2025-11-16 | 1.00       | single_card_1h
LZ-V-6604060  | 游锦秀 | 2025-11-15 | 1.00       | single_card_1h
```

---

### 任务3：完成 CRUD 接口 ✅

#### 查询接口

**1. 查询列表（分页）**
```
GET /api/v1/summary/list

参数：
  - lotusId: 用户ID（可选）
  - startDate: 开始日期（可选）
  - endDate: 结束日期（可选）
  - page: 页码（默认1）
  - limit: 每页数量（默认20）

响应：
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 583,
    "page": 1,
    "limit": 20,
    "totalPages": 30
  }
}
```

**2. 查询单条记录**
```
GET /api/v1/summary/:id

响应：
{
  "success": true,
  "data": {
    "id": 582,
    "userId": 55,
    "lotusId": "LZ-V-6020135",
    "name": "陈璋",
    "date": "2025-11-16",
    "workHours": 2,
    "calculationRule": "double_card_actual",
    ...
  }
}
```

**3. 查询用户考勤汇总**
```
GET /api/v1/summary/user

参数：
  - lotusId: 用户ID（必填）
  - startDate: 开始日期（必填）
  - endDate: 结束日期（必填）

响应：
{
  "success": true,
  "summary": {
    "totalHours": 72.5,
    "presentDays": 20,
    "absentDays": 10,
    "totalDays": 30
  },
  "details": [...]
}
```

**4. 获取月度报表**
```
GET /api/v1/report/monthly

参数：
  - year: 年份（必填）
  - month: 月份（必填）

响应：
{
  "success": true,
  "year": 2024,
  "month": 11,
  "totalUsers": 50,
  "reports": [
    {
      "lotusId": "LZ-V-6020135",
      "name": "陈璋",
      "totalHours": 72.5,
      "presentDays": 20,
      "absentDays": 10
    }
  ]
}
```

#### 管理接口

**5. 手动创建记录**
```
POST /api/v1/summary

请求体：
{
  "userId": 55,
  "lotusId": "LZ-V-6020135",
  "name": "陈璋",
  "date": "2024-12-01",
  "firstCheckinTime": "09:00:00",
  "lastCheckinTime": "18:00:00",
  "checkinCount": 2,
  "workHours": 9,
  "calculationRule": "manual_entry",
  "status": "present",
  "notes": "手动补录",
  "adjustedBy": "管理员"
}

响应：
{
  "success": true,
  "message": "创建成功",
  "data": {
    "id": 584
  }
}
```

**6. 更新记录**
```
PUT /api/v1/summary/:id

请求体：
{
  "workHours": 8,
  "notes": "手动调整工时",
  "adjustedBy": "管理员"
}

响应：
{
  "success": true,
  "message": "更新成功"
}
```

**7. 删除记录**
```
DELETE /api/v1/summary/:id

响应：
{
  "success": true,
  "message": "删除成功"
}
```

**8. 批量删除**
```
POST /api/v1/summary/batch-delete

请求体：
{
  "ids": [1, 2, 3]
}

响应：
{
  "success": true,
  "message": "删除完成：成功 2 条，失败 1 条",
  "data": {
    "success": 2,
    "failed": 1,
    "errors": ["ID 3: 记录不存在"]
  }
}
```

**9. 重新计算汇总**
```
POST /api/v1/summary/recalculate

请求体：
{
  "userId": 55,
  "date": "2024-11-21"
}

响应：
{
  "success": true,
  "message": "重新计算成功",
  "data": {
    "workHours": 1,
    "calculationRule": "single_card_1h",
    ...
  }
}
```

---

## 📊 数据库表结构

### volunteer_checkin_summary（考勤汇总表）

```sql
CREATE TABLE volunteer_checkin_summary (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             BIGINT UNSIGNED NOT NULL,
  lotus_id            VARCHAR(50) NOT NULL,
  name                VARCHAR(50) NOT NULL,
  date                DATE NOT NULL,
  first_checkin_time  TIME,
  last_checkin_time   TIME,
  checkin_count       INT DEFAULT 0,
  work_hours          DECIMAL(4,2) DEFAULT 0,
  calculation_rule    VARCHAR(50),
  status              ENUM('present', 'late', 'early_leave', 'absent', 'on_leave', 'manual'),
  is_night_shift      BOOLEAN DEFAULT FALSE,
  device_sn           VARCHAR(50),
  body_temperature    VARCHAR(10),
  confidence          VARCHAR(10),
  notes               TEXT,
  is_manual           BOOLEAN DEFAULT FALSE,
  adjusted_by         VARCHAR(50),
  adjusted_at         TIMESTAMP,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_user_date (user_id, date),
  FOREIGN KEY (user_id) REFERENCES volunteer(id) ON DELETE CASCADE
);
```

**字段说明：**
- `work_hours`: 工作时长（小时）
- `calculation_rule`: 计算规则
  - `single_card_1h`: 只打一次卡，默认1小时
  - `double_card_actual`: 打两次卡，计算实际时长
  - `night_shift_actual`: 跨夜班
  - `double_card_actual_capped`: 超过12小时，限制为12小时
  - `manual_entry`: 手动录入
- `is_manual`: 是否手动调整
- `adjusted_by`: 调整人
- `adjusted_at`: 调整时间

---

## 🔄 工作流程

### 1. 日常签到流程
```
考勤设备
  ↓
POST /api/v1/record/face
  ↓
插入 volunteer_checkin（原始记录）
  ↓
返回成功
```

### 2. 生成汇总流程
```
定时任务（每天凌晨）
  ↓
POST /api/v1/summary/daily?date=昨天
  ↓
从 volunteer_checkin 读取原始记录
  ↓
计算工时
  ↓
插入 volunteer_checkin_summary
```

### 3. 查询报表流程
```
用户/管理员
  ↓
GET /api/v1/report/monthly?year=2024&month=11
  ↓
从 volunteer_checkin_summary 读取汇总数据
  ↓
返回统计报表
```

### 4. 手动调整流程
```
管理员
  ↓
PUT /api/v1/summary/:id
  ↓
更新 volunteer_checkin_summary
  ↓
标记 is_manual=true
  ↓
记录 adjusted_by 和 adjusted_at
```

---

## 🧪 测试

### 运行测试脚本
```bash
# 测试 CRUD 功能
bash test-summary-crud.sh

# 测试考勤汇总计算
bash test-checkin-summary.sh
```

### 测试覆盖
- ✅ 查询列表（分页、筛选）
- ✅ 查询单条记录
- ✅ 创建记录
- ✅ 更新记录
- ✅ 删除记录
- ✅ 批量删除
- ✅ 重新计算
- ✅ 用户汇总
- ✅ 月度报表

---

## 📝 使用示例

### 示例1：查询某用户11月的考勤
```bash
curl "http://localhost:3001/api/v1/summary/list?lotusId=LZ-V-6020135&startDate=2024-11-01&endDate=2024-11-30"
```

### 示例2：手动补录考勤
```bash
curl -X POST http://localhost:3001/api/v1/summary \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 55,
    "lotusId": "LZ-V-6020135",
    "name": "陈璋",
    "date": "2024-11-25",
    "firstCheckinTime": "09:00:00",
    "lastCheckinTime": "18:00:00",
    "checkinCount": 2,
    "workHours": 9,
    "calculationRule": "manual_entry",
    "notes": "忘记打卡，手动补录",
    "adjustedBy": "管理员"
  }'
```

### 示例3：调整工时
```bash
curl -X PUT http://localhost:3001/api/v1/summary/582 \
  -H "Content-Type: application/json" \
  -d '{
    "workHours": 8,
    "notes": "实际工作8小时",
    "adjustedBy": "管理员"
  }'
```

### 示例4：生成月度报表
```bash
curl "http://localhost:3001/api/v1/report/monthly?year=2024&month=11"
```

---

## 🎯 功能特点

### 1. 自动计算
- ✅ 单次打卡：默认1小时
- ✅ 双次打卡：计算实际时长
- ✅ 跨夜班：自动识别和计算
- ✅ 限制最大工时：12小时

### 2. 灵活管理
- ✅ 手动创建记录
- ✅ 手动调整工时
- ✅ 重新计算功能
- ✅ 批量操作

### 3. 完整审计
- ✅ 记录调整人
- ✅ 记录调整时间
- ✅ 标记手动调整
- ✅ 保留原始数据

### 4. 强大查询
- ✅ 分页查询
- ✅ 条件筛选
- ✅ 日期范围
- ✅ 用户筛选

---

## 📈 数据统计

**当前数据：**
- 原始签到记录：2005 条
- 汇总记录：583 条
- 总工时：2710.07 小时
- 覆盖日期：75 天

**工时分布：**
- 1小时（单次打卡）：约 40%
- 实际计算工时：约 55%
- 限制12小时：约 5%

---

## ✅ 总结

所有三个任务已完成：

1. ✅ **字段命名检查**：所有表都符合下划线命名规范
2. ✅ **生成汇总数据**：583 条汇总记录已生成
3. ✅ **CRUD 接口**：9个完整的 API 接口已实现并测试通过

系统现在具备：
- 完整的考勤记录管理
- 自动工时计算
- 灵活的手动调整
- 强大的查询和报表功能
- 完善的审计追踪

🎉 考勤汇总系统已完全就绪！
