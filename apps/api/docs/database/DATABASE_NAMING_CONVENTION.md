# 数据库命名规范

## 📋 统一命名规范

### 规则
1. **数据库列名**：使用 `snake_case`（下划线命名）
2. **TypeScript 属性名**：使用 `camelCase`（小驼峰命名）
3. **Drizzle ORM 自动映射**：TypeScript 属性名 → 数据库列名

### 示例

```typescript
// schema.ts
export const volunteerCheckIn = mysqlTable('volunteer_checkin', {
  // TypeScript 属性名 → 数据库列名
  userId:          bigint('user_id', ...),           // userId → user_id
  lotusId:         varchar('lotus_id', ...),         // lotusId → lotus_id
  checkIn:         time('check_in'),                 // checkIn → check_in
  recordType:      varchar('record_type', ...),      // recordType → record_type
  originTime:      varchar('origin_time', ...),      // originTime → origin_time
  deviceSn:        varchar('device_sn', ...),        // deviceSn → device_sn
  bodyTemperature: varchar('body_temperature', ...), // bodyTemperature → body_temperature
  createdAt:       timestamp('created_at'),          // createdAt → created_at
})
```

---

## 🔧 已修复的问题

### 问题：volunteer_checkin 表列名不一致

**修复前：**
```
✅ 下划线命名：user_id, check_in, device_sn, body_temperature
❌ 驼峰命名：recordType, originTime, recordId
```

**修复后：**
```
✅ 全部下划线命名：
- user_id
- check_in
- record_type  ← 修复
- origin_time  ← 修复
- record_id    ← 修复
- device_sn
- body_temperature
- confidence
```

### 修复脚本
```bash
mysql < scripts/normalize-checkin-column-names.sql
```

---

## 📊 完整的 volunteer_checkin 表结构

### 数据库列名（snake_case）
```sql
CREATE TABLE volunteer_checkin (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id           BIGINT UNSIGNED NOT NULL,
  date              DATE NOT NULL,
  check_in          TIME,
  status            ENUM(...),
  location          VARCHAR(100),
  device_id         VARCHAR(50),
  notes             TEXT,
  created_at        TIMESTAMP,
  lotus_id          VARCHAR(50) NOT NULL,
  name              VARCHAR(50) NOT NULL,
  record_type       VARCHAR(50),      -- ✅ 已修复
  device_sn         VARCHAR(50),
  origin_time       VARCHAR(50),      -- ✅ 已修复
  record_id         VARCHAR(100),     -- ✅ 已修复
  body_temperature  VARCHAR(10),
  confidence        VARCHAR(10),
  
  FOREIGN KEY (user_id) REFERENCES volunteer(id)
);
```

### TypeScript 属性名（camelCase）
```typescript
interface VolunteerCheckIn {
  id: number
  userId: number
  date: Date
  checkIn: string
  status: string
  location: string
  deviceId: string
  notes: string
  createdAt: Date
  lotusId: string
  name: string
  recordType: string      // ✅ 映射到 record_type
  deviceSn: string
  originTime: string      // ✅ 映射到 origin_time
  recordId: string        // ✅ 映射到 record_id
  bodyTemperature: string
  confidence: string
}
```

---

## ✅ 验证

### 1. 数据库列名验证
```bash
mysql -e "SHOW COLUMNS FROM volunteer_checkin;"
```

**结果：**
```
✅ user_id
✅ check_in
✅ record_type     (之前是 recordType)
✅ origin_time     (之前是 originTime)
✅ record_id       (之前是 recordId)
✅ device_sn
✅ body_temperature
✅ confidence
```

### 2. 代码使用验证
```typescript
// ✅ 正确：使用 camelCase
await db.insert(volunteerCheckIn).values({
  userId: 55,
  lotusId: 'LZ-V-6020135',
  recordType: 'face',
  originTime: '2024-11-21 14:30:00',
  deviceSn: 'TEST001',
  bodyTemperature: '36.8',
})

// ✅ 正确：查询也使用 camelCase
await db.select()
  .from(volunteerCheckIn)
  .where(eq(volunteerCheckIn.recordType, 'face'))
```

### 3. 功能测试
```bash
# 测试签到
curl -X POST http://localhost:3001/api/v1/record/face \
  -d '{"sn": "TEST001", "Count": 1, "logs": [{
    "user_id": "LZ-V-6020135",
    "recog_type": "face",
    "recog_time": "2024-11-21 14:30:00",
    "gender": 0
  }]}'

# 测试查询
curl "http://localhost:3001/api/v1/summary/user?lotusId=LZ-V-6020135&startDate=2024-11-21&endDate=2024-11-21"
```

**结果：**
```json
{
  "success": true,
  "data": {
    "recordType": "face",
    "originTime": "2024-11-21 14:30:00",
    "deviceSn": "TEST001",
    "bodyTemperature": "36.8"
  }
}
```

---

## 📝 其他表的命名规范

### volunteer 表（参考标准）
```typescript
export const volunteer = mysqlTable('volunteer', {
  lotusId:         varchar('lotus_id', ...),      // ✅ 标准
  volunteerId:     varchar('volunteer_id', ...),  // ✅ 标准
  idNumber:        varchar('id_number', ...),     // ✅ 标准
  birthDate:       date('birth_date'),            // ✅ 标准
  dharmaName:      varchar('dharma_name', ...),   // ✅ 标准
  hasBuddhismFaith: boolean('has_buddhism_faith'), // ✅ 标准
})
```

### admin 表
```typescript
export const admin = mysqlTable('admin', {
  lastLogin:  timestamp('last_login'),  // ✅ 标准
  loginIp:    varchar('login_ip', ...),  // ✅ 标准
  loginCount: int('login_count'),        // ✅ 标准
  isActive:   boolean('is_active'),      // ✅ 标准
})
```

---

## 🎯 最佳实践

### 1. 新建表时
```typescript
// ✅ 正确
export const newTable = mysqlTable('new_table', {
  userId:     bigint('user_id', ...),      // camelCase → snake_case
  createdAt:  timestamp('created_at'),     // camelCase → snake_case
  isActive:   boolean('is_active'),        // camelCase → snake_case
})

// ❌ 错误
export const newTable = mysqlTable('new_table', {
  userId:     bigint('userId', ...),       // 数据库列名应该是 user_id
  createdAt:  timestamp('createdAt'),      // 数据库列名应该是 created_at
})
```

### 2. 使用时
```typescript
// ✅ 正确：始终使用 camelCase
const user = await db.select()
  .from(volunteer)
  .where(eq(volunteer.lotusId, 'LZ-V-6020135'))

// ✅ 正确：插入数据也使用 camelCase
await db.insert(volunteerCheckIn).values({
  userId: 55,
  lotusId: 'LZ-V-6020135',
  recordType: 'face',
  originTime: '2024-11-21 14:30:00',
})
```

### 3. 原始 SQL 时
```typescript
// 如果必须使用原始 SQL，使用 snake_case
await db.execute(sql`
  SELECT user_id, lotus_id, record_type, origin_time
  FROM volunteer_checkin
  WHERE record_type = 'face'
`)
```

---

## 📋 检查清单

在添加新字段或新表时，请确保：

- [ ] 数据库列名使用 `snake_case`
- [ ] TypeScript 属性名使用 `camelCase`
- [ ] Drizzle schema 中正确映射（第二个参数是数据库列名）
- [ ] 代码中使用 TypeScript 属性名（camelCase）
- [ ] 测试插入和查询功能

---

## 🔍 快速检查命令

```bash
# 检查表结构
mysql -e "SHOW COLUMNS FROM volunteer_checkin;"

# 检查是否有驼峰命名的列
mysql -e "SHOW COLUMNS FROM volunteer_checkin;" | grep -E "[A-Z]"

# 如果有输出，说明还有驼峰命名的列需要修复
```

---

## ✅ 总结

现在整个项目的命名规范已经统一：

1. ✅ **数据库层**：所有列名使用 `snake_case`
2. ✅ **代码层**：所有属性名使用 `camelCase`
3. ✅ **ORM 映射**：Drizzle 自动处理转换
4. ✅ **一致性**：与 volunteer、admin 等其他表保持一致

这样的规范：
- 符合数据库命名惯例（snake_case）
- 符合 JavaScript/TypeScript 命名惯例（camelCase）
- 易于维护和理解
- 避免混淆和错误
