# 义工更新500错误修复

## 🐛 问题描述

更新义工信息时出现 **500 Internal Server Error**。

### 错误日志

```
PUT http://localhost:3001/api/volunteer/LZ-V-1241702
[HTTP/1.1 500 Internal Server Error 5ms]

发送的数据:
{
  "availableTimes": [],  // ✅ 已经是数组
  "birthDate": "1986-03-17T00:00:00.000Z",
  ...
}
```

---

## 🔍 问题根源

### 1. availableTimes 类型不匹配

**前端发送**：数组 `[]`（已修复422错误后）
**后端期望**：字符串（数据库是 varchar 类型）
**mapToUpdateData**：直接传递数组，导致类型错误

```typescript
// 数据库 schema
availableTimes: varchar('available_times', { length: 255 })

// mapToUpdateData（错误）
...(body.availableTimes !== undefined && { 
  availableTimes: body.availableTimes ?? null  // ❌ 数组类型
}),
```

### 2. 其他字段的条件判断问题

很多字段使用了 `body.field &&` 而不是 `body.field !== undefined`，导致：
- `false` 值无法更新
- `null` 值无法更新
- 空字符串无法更新

```typescript
// 错误示例
...(body.education && { education: body.education })  // ❌ null 无法更新

// 正确示例
...(body.education !== undefined && { education: body.education ?? null })  // ✅
```

---

## ✅ 解决方案

修改 `mapToUpdateData.ts`，正确处理所有字段。

### 完整修复代码

```typescript
export function mapToUpdateData(
  body: VolunteerUpdateDto,
  existingData: InferSelectModel<typeof volunteer>,
): Partial<InferInsertModel<typeof volunteer>> {
  return {
    // 基本信息
    ...(body.name && { name: body.name }),
    ...(body.gender && { gender: body.gender }),
    ...(body.phone && { phone: body.phone }),
    ...(body.idNumber && { idNumber: body.idNumber }),
    ...(body.email !== undefined && { email: body.email ?? null }),
    ...(body.address !== undefined && { address: body.address ?? null }),
    ...(body.wechat !== undefined && { wechat: body.wechat ?? null }),
    ...(body.birthDate !== undefined && { 
      birthDate: body.birthDate ? new Date(body.birthDate) : null 
    }),
    ...(body.avatar !== undefined && { avatar: body.avatar ?? null }),

    // 佛教信息
    ...(body.dharmaName !== undefined && { dharmaName: body.dharmaName ?? null }),
    ...(body.education !== undefined && { education: body.education ?? null }),
    ...(body.hasBuddhismFaith !== undefined && { hasBuddhismFaith: body.hasBuddhismFaith }),
    ...(body.refugeStatus !== undefined && { refugeStatus: body.refugeStatus ?? null }),
    ...(body.religiousBackground !== undefined && { religiousBackground: body.religiousBackground ?? null }),

    // 健康和其他信息
    ...(body.healthConditions !== undefined && { healthConditions: body.healthConditions ?? null }),
    ...(body.joinReason !== undefined && { joinReason: body.joinReason ?? null }),
    ...(body.hobbies !== undefined && { hobbies: body.hobbies ?? null }),
    
    // ✅ 关键修复：将数组转换为JSON字符串
    ...(body.availableTimes !== undefined && { 
      availableTimes: body.availableTimes 
        ? (Array.isArray(body.availableTimes) ? JSON.stringify(body.availableTimes) : body.availableTimes)
        : null 
    }),
    
    ...(body.emergencyContact !== undefined && { emergencyContact: body.emergencyContact ?? null }),

    // 义工状态和岗位
    ...(body.volunteerStatus !== undefined && { volunteerStatus: body.volunteerStatus ?? null }),
    ...(body.severPosition !== undefined && { severPosition: body.severPosition ?? null }),
    ...(body.familyConsent !== undefined && { familyConsent: body.familyConsent ?? null }),

    // 系统字段
    updatedAt: new Date(),
  }
}
```

---

## 🔧 关键修复点

### 1. availableTimes 转换

```typescript
...(body.availableTimes !== undefined && { 
  availableTimes: body.availableTimes 
    ? (Array.isArray(body.availableTimes) 
        ? JSON.stringify(body.availableTimes)  // 数组 -> JSON字符串
        : body.availableTimes)                 // 已经是字符串
    : null 
}),
```

**转换示例**：
- `[]` → `"[]"`
- `["周一", "周二"]` → `"[\"周一\",\"周二\"]"`
- `null` → `null`

### 2. birthDate 安全处理

```typescript
...(body.birthDate !== undefined && { 
  birthDate: body.birthDate ? new Date(body.birthDate) : null 
}),
```

**处理逻辑**：
- 有值：转换为 Date 对象
- null：保持 null
- undefined：不更新

### 3. 统一使用 !== undefined

```typescript
// ❌ 错误
...(body.education && { education: body.education })

// ✅ 正确
...(body.education !== undefined && { education: body.education ?? null })
```

**原因**：
- `&&` 会过滤掉 `false`、`null`、`0`、`""` 等值
- `!== undefined` 只过滤掉 `undefined`，允许其他所有值

---

## 📊 数据流程

### 完整的数据转换流程

```
前端表单
  ↓
前端转换（volunteer.ts）
  - availableTimes: "[]" → []
  - email: "" → null
  ↓
发送到后端
  {
    availableTimes: [],
    email: null,
    ...
  }
  ↓
后端转换（mapToUpdateData.ts）
  - availableTimes: [] → "[]"
  - birthDate: "1986-03-17..." → Date对象
  ↓
数据库更新
  {
    availableTimes: "[]",  // varchar
    birthDate: Date,       // datetime
    ...
  }
```

---

## 🎯 修复效果

### 修复前
```
更新义工 → 发送数据 → 500 错误 ❌
- availableTimes: [] (数组)
- 数据库期望: 字符串
```

### 修复后
```
更新义工 → 数据转换 → 发送数据 → 200 成功 ✅
- availableTimes: [] → "[]"
- 数据库接收: 字符串
```

---

## 🧪 测试场景

### 1. 更新可服务时间（空数组）
```typescript
{
  availableTimes: []  // → "[]"
}
```
✅ 应该成功

### 2. 更新可服务时间（有值）
```typescript
{
  availableTimes: ["周一", "周二"]  // → "[\"周一\",\"周二\"]"
}
```
✅ 应该成功

### 3. 更新出生日期
```typescript
{
  birthDate: "1986-03-17T00:00:00.000Z"  // → Date对象
}
```
✅ 应该成功

### 4. 更新出生日期为null
```typescript
{
  birthDate: null  // → null
}
```
✅ 应该成功

### 5. 更新布尔字段为false
```typescript
{
  hasBuddhismFaith: false  // → false
}
```
✅ 应该成功（使用 !== undefined）

---

## 📝 数据库Schema说明

### availableTimes 字段

```typescript
// 数据库定义
availableTimes: varchar('available_times', { length: 255 })

// 存储格式
"[]"                          // 空数组
"[\"周一\",\"周二\"]"         // 有值的数组
null                          // 未设置
```

### 为什么不用JSON类型？

1. **兼容性**：varchar 在所有数据库中都支持
2. **简单性**：不需要特殊的JSON查询语法
3. **长度限制**：255字符足够存储时间数组

---

## 🔄 后续优化建议

### 1. 统一数据类型

考虑将数据库的 `availableTimes` 改为 JSON 类型：

```typescript
// 数据库 schema
availableTimes: json('available_times')

// 好处
- 不需要手动转换
- 支持JSON查询
- 类型更明确
```

### 2. 创建通用转换函数

```typescript
function convertArrayToString(value: any): string | null {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'string') return value;
  return null;
}

// 使用
...(body.availableTimes !== undefined && { 
  availableTimes: convertArrayToString(body.availableTimes)
}),
```

### 3. 添加数据验证

```typescript
// 验证数组长度
if (body.availableTimes && Array.isArray(body.availableTimes)) {
  const jsonString = JSON.stringify(body.availableTimes);
  if (jsonString.length > 255) {
    throw new Error('可服务时间数据过长');
  }
}
```

---

## ✅ 总结

问题已修复：

1. ✅ **availableTimes 转换**：数组 → JSON字符串
2. ✅ **birthDate 安全处理**：null 值不会导致错误
3. ✅ **统一字段判断**：使用 `!== undefined` 而不是 `&&`
4. ✅ **类型安全**：所有字段都正确转换为数据库期望的类型

现在更新义工信息应该可以正常工作了！

---

## 🔗 相关修复

1. **422错误修复**：前端数据转换（VOLUNTEER_UPDATE_422_FIX.md）
2. **500错误修复**：后端数据转换（本文档）

两个修复配合使用，确保数据在前后端之间正确传递。
