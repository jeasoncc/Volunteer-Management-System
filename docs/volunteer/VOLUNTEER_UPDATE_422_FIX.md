# 义工更新422错误修复

## 🐛 问题描述

更新义工信息时出现 **422 Unprocessable Entity** 错误：
```
Error: Expected union value
```

### 错误日志

```
PUT http://localhost:3001/api/volunteer/LZ-V-1214816
[HTTP/1.1 422 Unprocessable Entity 2ms]

发送的数据:
{
  "availableTimes": "[]",  // ❌ 字符串
  "email": "",             // ❌ 空字符串
  ...
}
```

---

## 🔍 问题根源

### 1. availableTimes 类型不匹配

**前端发送**：字符串 `"[]"`
```tsx
availableTimes: volunteer?.availableTimes || ""
```

**后端期望**：数组或null
```typescript
availableTimes: t.Optional(
  t.Union([
    t.Array(t.String(), { minItems: 0 }), // 数组
    t.Null(),                              // null
  ]),
)
```

### 2. 空字符串处理

**前端发送**：空字符串 `""`
```tsx
email: volunteer?.email || ""
```

**后端期望**：null或有效值
```typescript
email: t.Optional(
  t.Union([
    t.String({ format: 'email' }), // 有效邮箱
    t.String({ minLength: 0 }),    // 空字符串（某些字段）
    t.Null(),                       // null
  ]),
)
```

---

## ✅ 解决方案

在 `volunteer.ts` 的 `create` 和 `update` 方法中添加数据转换逻辑。

### 实现代码

```typescript
/**
 * 创建义工
 */
create: async (
  data: CreateVolunteerParams,
): Promise<ApiResponse<Volunteer>> => {
  // 数据转换：处理特殊字段
  const transformedData: any = { ...data };
  
  // 转换 availableTimes：字符串 -> 数组
  if (typeof transformedData.availableTimes === 'string') {
    if (transformedData.availableTimes === '' || transformedData.availableTimes === '[]') {
      transformedData.availableTimes = [];
    } else {
      try {
        transformedData.availableTimes = JSON.parse(transformedData.availableTimes);
      } catch (e) {
        // 如果解析失败，设为空数组
        transformedData.availableTimes = [];
      }
    }
  }
  
  // 转换空字符串为 null（后端期望的格式）
  Object.keys(transformedData).forEach((key) => {
    if (transformedData[key] === '') {
      transformedData[key] = null;
    }
  });
  
  return api.post("/api/volunteer", transformedData);
},

/**
 * 更新义工信息
 */
update: async (
  lotusId: string,
  data: Partial<CreateVolunteerParams>,
): Promise<ApiResponse<Volunteer>> => {
  // 数据转换：处理特殊字段
  const transformedData: any = { ...data };
  
  // 转换 availableTimes：字符串 -> 数组
  if (typeof transformedData.availableTimes === 'string') {
    if (transformedData.availableTimes === '' || transformedData.availableTimes === '[]') {
      transformedData.availableTimes = [];
    } else {
      try {
        transformedData.availableTimes = JSON.parse(transformedData.availableTimes);
      } catch (e) {
        // 如果解析失败，设为空数组
        transformedData.availableTimes = [];
      }
    }
  }
  
  // 转换空字符串为 null（后端期望的格式）
  Object.keys(transformedData).forEach((key) => {
    if (transformedData[key] === '') {
      transformedData[key] = null;
    }
  });
  
  // 调试：打印发送的数据
  console.log('🔍 更新志愿者数据:', JSON.stringify(transformedData, null, 2));
  return api.put(`/api/volunteer/${lotusId}`, transformedData);
},
```

---

## 🔧 转换逻辑详解

### 1. availableTimes 转换

```typescript
if (typeof transformedData.availableTimes === 'string') {
  if (transformedData.availableTimes === '' || transformedData.availableTimes === '[]') {
    transformedData.availableTimes = [];  // 空字符串或"[]" -> []
  } else {
    try {
      transformedData.availableTimes = JSON.parse(transformedData.availableTimes);
    } catch (e) {
      transformedData.availableTimes = [];  // 解析失败 -> []
    }
  }
}
```

**转换示例**：
- `""` → `[]`
- `"[]"` → `[]`
- `"[\"周一\",\"周二\"]"` → `["周一", "周二"]`
- `"invalid"` → `[]` (解析失败)

### 2. 空字符串转换

```typescript
Object.keys(transformedData).forEach((key) => {
  if (transformedData[key] === '') {
    transformedData[key] = null;
  }
});
```

**转换示例**：
- `email: ""` → `email: null`
- `wechat: ""` → `wechat: null`
- `address: ""` → `address: null`

---

## 📊 数据转换对比

### 转换前（前端发送）

```json
{
  "name": "林楚立",
  "phone": "17512087450",
  "email": "",                    // ❌ 空字符串
  "wechat": "lci5021314",
  "address": "广东省...",
  "availableTimes": "[]",         // ❌ 字符串
  "emergencyContact": "",         // ❌ 空字符串
  "volunteerStatus": "registered"
}
```

### 转换后（发送到后端）

```json
{
  "name": "林楚立",
  "phone": "17512087450",
  "email": null,                  // ✅ null
  "wechat": "lci5021314",
  "address": "广东省...",
  "availableTimes": [],           // ✅ 数组
  "emergencyContact": null,       // ✅ null
  "volunteerStatus": "registered"
}
```

---

## 🎯 修复效果

### 修复前
```
更新义工 → 发送数据 → 422 错误 ❌
- availableTimes: "[]" (字符串)
- email: "" (空字符串)
```

### 修复后
```
更新义工 → 数据转换 → 发送数据 → 200 成功 ✅
- availableTimes: [] (数组)
- email: null (null)
```

---

## 🧪 测试场景

### 1. 更新基本信息
```typescript
{
  name: "张三",
  phone: "13800138000",
  email: "",  // 转换为 null
}
```
✅ 应该成功

### 2. 更新可服务时间
```typescript
{
  availableTimes: "[]",  // 转换为 []
}
```
✅ 应该成功

### 3. 更新可服务时间（有值）
```typescript
{
  availableTimes: "[\"周一\",\"周二\"]",  // 转换为 ["周一", "周二"]
}
```
✅ 应该成功

### 4. 更新多个字段
```typescript
{
  name: "李四",
  email: "",              // 转换为 null
  wechat: "",             // 转换为 null
  availableTimes: "[]",   // 转换为 []
}
```
✅ 应该成功

---

## 📝 注意事项

### 1. 类型安全

使用 `any` 类型来避免 TypeScript 类型检查错误：
```typescript
const transformedData: any = { ...data };
```

这是必要的，因为我们需要动态修改字段类型。

### 2. 调试日志

保留了调试日志，方便排查问题：
```typescript
console.log('🔍 更新志愿者数据:', JSON.stringify(transformedData, null, 2));
```

### 3. 错误处理

JSON.parse 可能失败，需要 try-catch：
```typescript
try {
  transformedData.availableTimes = JSON.parse(transformedData.availableTimes);
} catch (e) {
  transformedData.availableTimes = [];
}
```

### 4. 其他数组字段

如果将来添加其他数组字段（如 `trainingRecords`），需要添加类似的转换逻辑。

---

## 🔄 后续优化建议

### 1. 统一数据格式

在 VolunteerForm 中直接使用正确的类型：
```tsx
// 当前
availableTimes: volunteer?.availableTimes || ""

// 建议
availableTimes: volunteer?.availableTimes || []
```

### 2. 创建通用转换函数

```typescript
function transformVolunteerData(data: any) {
  const transformed = { ...data };
  
  // 转换数组字段
  ['availableTimes', 'trainingRecords'].forEach(field => {
    if (typeof transformed[field] === 'string') {
      transformed[field] = transformed[field] === '' || transformed[field] === '[]' 
        ? [] 
        : JSON.parse(transformed[field]);
    }
  });
  
  // 转换空字符串
  Object.keys(transformed).forEach(key => {
    if (transformed[key] === '') {
      transformed[key] = null;
    }
  });
  
  return transformed;
}
```

### 3. 后端验证优化

考虑在后端也接受空字符串，自动转换为null：
```typescript
// 后端中间件
if (data[key] === '') {
  data[key] = null;
}
```

---

## ✅ 总结

问题已修复：

1. ✅ **availableTimes 转换**：字符串 → 数组
2. ✅ **空字符串转换**：空字符串 → null
3. ✅ **错误处理**：JSON.parse 失败时使用默认值
4. ✅ **调试日志**：方便排查问题
5. ✅ **同时修复 create 和 update**：保持一致性

现在更新义工信息应该可以正常工作了！
