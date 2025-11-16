# 义工考勤系统完整解决方案

## 📋 业务场景分析

### 特殊情况
1. **老年义工忘记签退** - 只打一次卡的情况很常见
2. **跨夜班** - 晚上打卡，次日凌晨打卡
3. **特殊人员** - 某些人即使不来也给固定工时
4. **灵活性** - 规则可能随时调整

---

## 🎯 核心设计思路

### 方案：双表设计 + 实时计算

#### 表1：原始打卡记录表 `volunteer_check_in`
**作用：** 存储每一次打卡的原始数据，永不修改

```sql
CREATE TABLE volunteer_check_in (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,      -- 外键：volunteer.id
  lotus_id VARCHAR(50) NOT NULL,
  name VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  check_in TIME,                         -- 打卡时间
  origin_time VARCHAR(50),               -- 原始时间字符串
  record_type VARCHAR(50),               -- face, card, etc.
  device_sn VARCHAR(50),                 -- 设备序列号
  body_temperature VARCHAR(10),          -- 体温
  confidence VARCHAR(10),                -- 识别置信度
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES volunteer(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, date),
  INDEX idx_lotus_date (lotus_id, date)
);
```

**特点：**
- ✅ 只增不改，保证数据完整性
- ✅ 可以追溯所有打卡历史
- ✅ 支持一天多次打卡

#### 表2：考勤汇总表 `volunteer_checkin_summary`（可选）
**作用：** 存储每天计算后的工时数据，提高查询性能

```sql
CREATE TABLE volunteer_checkin_summary (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  lotus_id VARCHAR(50) NOT NULL,
  name VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  
  -- 打卡统计
  first_checkin_time TIME,               -- 第一次打卡时间
  last_checkin_time TIME,                -- 最后一次打卡时间
  checkin_count INT DEFAULT 0,           -- 打卡次数
  
  -- 工时计算
  work_hours DECIMAL(4,2) DEFAULT 0,     -- 工作时长（小时）
  calculation_rule VARCHAR(50),          -- 计算规则
  
  -- 状态
  status ENUM('present', 'late', 'early_leave', 'absent', 'on_leave', 'manual'),
  is_night_shift BOOLEAN DEFAULT FALSE,  -- 是否跨夜班
  
  -- 审批和调整
  is_manual BOOLEAN DEFAULT FALSE,       -- 是否手动调整
  adjusted_by VARCHAR(50),               -- 调整人
  adjusted_at TIMESTAMP,                 -- 调整时间
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_user_date (user_id, date),
  FOREIGN KEY (user_id) REFERENCES volunteer(id) ON DELETE CASCADE
);
```

**特点：**
- ✅ 每天一条记录，查询快速
- ✅ 记录计算规则，便于审计
- ✅ 支持手动调整
- ✅ 历史数据固定，不受规则变更影响

---

## 💡 工时计算规则

### 规则1：只打一次卡 → 默认 3 小时
```typescript
if (checkinCount === 1) {
  workHours = 3
  calculationRule = 'single_card_3h'
}
```

**适用场景：** 老年义工忘记签退

### 规则2：打两次及以上 → 计算实际时长
```typescript
if (checkinCount >= 2) {
  const firstTime = dayjs(`${date} ${firstRecord.checkIn}`)
  const lastTime = dayjs(`${date} ${lastRecord.checkIn}`)
  
  workHours = lastTime.diff(firstTime, 'hour', true)
  calculationRule = 'double_card_actual'
  
  // 限制最大工时为 12 小时
  if (workHours > 12) {
    workHours = 12
    calculationRule = 'double_card_actual_capped'
  }
}
```

**适用场景：** 正常签到签退

### 规则3：跨夜班 → 特殊处理
```typescript
// 检查是否跨夜：最后打卡时间 < 第一次打卡时间
if (lastTime.isBefore(firstTime)) {
  // 说明最后一次是第二天凌晨
  const nextDayLastTime = lastTime.add(1, 'day')
  workHours = nextDayLastTime.diff(firstTime, 'hour', true)
  isNightShift = true
  calculationRule = 'night_shift_actual'
}
```

**示例：**
- 23:00 打卡，01:00 打卡 → 工时 = 2 小时
- 20:00 打卡，次日 06:00 打卡 → 工时 = 10 小时

### 规则4：特殊人员固定工时（未来扩展）
```typescript
// 从配置表读取特殊人员列表
const specialUsers = await getSpecialUserConfig()

if (specialUsers.includes(userId)) {
  workHours = 8
  calculationRule = 'special_user_fixed_8h'
}
```

---

## 🔄 数据流程

### 流程1：设备上传打卡记录
```
考勤设备
  ↓
POST /api/v1/record/face
  ↓
插入 volunteer_check_in 表（原始记录）
  ↓
返回成功
```

**特点：** 
- 实时写入，不做任何计算
- 保证数据不丢失

### 流程2：查询用户考勤（实时计算）
```
用户请求
  ↓
GET /api/v1/summary/user?lotusId=xxx&startDate=xxx&endDate=xxx
  ↓
从 volunteer_check_in 读取原始记录
  ↓
实时计算每天的工时
  ↓
返回汇总数据
```

**特点：**
- 实时计算，规则变更立即生效
- 适合查询近期数据

### 流程3：生成月度报表（定时任务）
```
定时任务（每天凌晨 2:00）
  ↓
POST /api/v1/summary/daily?date=昨天
  ↓
计算昨天所有用户的工时
  ↓
写入 volunteer_checkin_summary 表
  ↓
完成
```

**特点：**
- 历史数据固定，查询快速
- 适合生成报表和统计

---

## 🎨 API 接口设计

### 1. 查询用户考勤汇总（实时计算）
```
GET /api/v1/summary/user
参数：
  - lotusId: 用户ID
  - startDate: 开始日期（YYYY-MM-DD）
  - endDate: 结束日期（YYYY-MM-DD）

响应：
{
  "success": true,
  "lotusId": "LZ-V-6020135",
  "startDate": "2024-11-01",
  "endDate": "2024-11-30",
  "summary": {
    "totalHours": 72.5,      // 总工时
    "presentDays": 20,       // 出勤天数
    "absentDays": 10,        // 缺勤天数
    "totalDays": 30          // 总天数
  },
  "details": [
    {
      "date": "2024-11-01",
      "workHours": 3,
      "calculationRule": "single_card_3h",
      "checkinCount": 1,
      "firstCheckIn": "09:00:00",
      "lastCheckIn": "09:00:00",
      "status": "present"
    },
    {
      "date": "2024-11-02",
      "workHours": 9,
      "calculationRule": "double_card_actual",
      "checkinCount": 2,
      "firstCheckIn": "09:00:00",
      "lastCheckIn": "18:00:00",
      "status": "present"
    }
  ]
}
```

### 2. 生成某天的考勤汇总
```
POST /api/v1/summary/daily
参数：
  - date: 日期（YYYY-MM-DD）

响应：
{
  "success": true,
  "date": "2024-11-15",
  "count": 50,
  "summaries": [
    {
      "userId": 123,
      "lotusId": "LZ-V-6020135",
      "name": "陈璋",
      "workHours": 3,
      "calculationRule": "single_card_3h",
      "checkinCount": 1
    }
  ]
}
```

### 3. 获取月度考勤报表
```
GET /api/v1/report/monthly
参数：
  - year: 年份
  - month: 月份

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
      "absentDays": 10,
      "totalDays": 30
    }
  ]
}
```

---

## 🔧 实施步骤

### 第1步：修复数据库结构
```bash
# 1. 添加 user_id 外键
mysql -h 127.0.0.1 -P 3307 -u root -padmin123 lotus < scripts/fix-checkin-foreign-key.sql

# 2. 创建汇总表（可选）
mysql -h 127.0.0.1 -P 3307 -u root -padmin123 lotus < scripts/create-checkin-summary-table.sql
```

### 第2步：更新代码
- ✅ 已创建 `CheckInSummaryService`
- ✅ 已添加汇总接口
- ✅ 已更新 schema

### 第3步：测试
```bash
chmod +x test-checkin-summary.sh
bash test-checkin-summary.sh
```

---

## 📊 方案对比

### 方案A：只存原始记录，实时计算
```
优点：
✅ 规则变更灵活
✅ 数据库简洁
✅ 无需维护汇总表

缺点：
❌ 查询慢（需要实时计算）
❌ 历史规则变更会影响历史数据
```

### 方案B：存储汇总结果（推荐）
```
优点：
✅ 查询快速
✅ 历史数据固定
✅ 便于生成报表

缺点：
❌ 需要定时任务
❌ 占用更多存储空间
```

### 方案C：混合方案（最佳）
```
✅ 原始记录表：存储所有打卡数据
✅ 汇总表：定时生成历史数据
✅ 实时计算：查询近期数据时实时计算
✅ 灵活性：可以随时重新计算历史数据
```

---

## 🎯 推荐方案

**采用混合方案：**

1. **原始记录表** - 存储所有打卡数据（永不修改）
2. **实时计算** - 查询时实时计算工时（灵活）
3. **汇总表（可选）** - 定时任务生成历史汇总（性能）

**优势：**
- ✅ 数据完整性：原始数据永不丢失
- ✅ 灵活性：规则变更立即生效
- ✅ 性能：历史数据查询快速
- ✅ 可追溯：可以重新计算历史数据

---

## 🚀 下一步

1. **立即实施：** 修复外键关系，添加必要字段
2. **测试验证：** 运行测试脚本，验证各种场景
3. **可选扩展：** 如果查询性能不够，再添加汇总表
4. **未来优化：** 添加规则配置表，支持动态规则

---

## 💡 关于你的问题

### Q1: 工时数据存不存？
**答：推荐实时计算，可选存储汇总**

- 近期数据（最近30天）→ 实时计算
- 历史数据（30天前）→ 可选存储汇总表

### Q2: 跨夜班怎么处理？
**答：通过时间比较判断**

```typescript
// 如果最后打卡 < 第一次打卡，说明跨夜了
if (lastTime.isBefore(firstTime)) {
  // 最后打卡时间加一天
  const nextDayLastTime = lastTime.add(1, 'day')
  workHours = nextDayLastTime.diff(firstTime, 'hour', true)
}
```

### Q3: 签退字段怎么设计？
**答：不需要单独的签退字段**

- 每次打卡都是一条新记录
- 通过查询同一天的所有记录来判断签到/签退
- 第一条 = 签到，最后一条 = 签退

### Q4: 外键关系
**答：使用 user_id 作为外键**

```sql
user_id BIGINT UNSIGNED NOT NULL
FOREIGN KEY (user_id) REFERENCES volunteer(id)
```

这样更规范，性能更好。

