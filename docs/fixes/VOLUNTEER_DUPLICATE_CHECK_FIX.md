# 义工重复检查问题修复

## 问题描述

在添加义工时遇到两个问题：

1. **报错"义工编号已存在"（400错误）**
   - 在添加新义工时，系统提示"义工编号已存在"
   - 即使没有填写义工编号，也可能出现此错误

2. **搜索不到义工"史栓香"**
   - 前端搜索功能无法找到该义工
   - 需要确认该义工是否存在于数据库中

## 诊断结果

### 1. 义工"史栓香"不存在

通过数据库查询确认：
- ✅ 精确搜索：未找到
- ✅ 模糊搜索：未找到
- ✅ 字符搜索：只找到"刘洁香"（包含"香"字）

**结论：** 该义工不存在于数据库中，所以前端搜索不到是正常的。

### 2. 义工编号重复检查问题

**原因分析：**

原有的唯一性检查逻辑：
```typescript
if (value) {
  const existing = await tx.select()
    .from(volunteer)
    .where(eq(volunteer[field], value))
    .limit(1)
  
  if (existing.length > 0) {
    throw new ValidationError(message, field)
  }
}
```

**问题：**
- 只检查 `value` 是否为真值
- 空字符串 `""` 在 JavaScript 中是假值，但在数据库中是有效值
- 如果多个义工的 `volunteerId` 都是空字符串，会被认为是重复

## 解决方案

### 修改唯一性检查逻辑

**文件：** `apps/api/src/modules/volunteer/utils/checkUniqueFields.ts`

**修改：**
```typescript
// 只检查非空且非空字符串的值
if (value && value.trim() !== '') {
  const existing = await tx.select()
    .from(volunteer)
    .where(eq(volunteer[field], value))
    .limit(1)
  
  if (existing.length > 0) {
    throw new ValidationError(message, field)
  }
}
```

**改进点：**
1. 添加 `value.trim() !== ''` 检查
2. 确保只对有实际内容的值进行唯一性检查
3. 允许多个义工的可选字段为空或空字符串

### 影响的字段

以下字段会进行唯一性检查：
- `account` - 登录账号
- `idNumber` - 身份证号 ⭐ 必填
- `phone` - 手机号 ⭐ 必填
- `email` - 邮箱
- `lotusId` - 莲花斋ID（系统自动生成）
- `volunteerId` - 深圳义工号

**注意：**
- 必填字段（身份证号、手机号）必须唯一
- 可选字段（邮箱、义工号）可以为空，但如果填写则必须唯一

## 使用建议

### 添加义工时

1. **必填字段：**
   - 姓名
   - 手机号（必须唯一）
   - 身份证号（必须唯一）

2. **可选字段：**
   - 深圳义工号：如果没有，可以不填写
   - 邮箱：如果没有，可以不填写
   - 其他信息：根据实际情况填写

3. **避免错误：**
   - 确保手机号和身份证号没有重复
   - 如果有深圳义工号，确保没有重复
   - 不要填写空格或无效字符

### 搜索义工

前端搜索支持以下字段：
- 姓名（模糊搜索）
- 莲花斋ID（精确搜索）
- 手机号（精确搜索）
- 邮箱（精确搜索）

**搜索示例：**
```
输入 "张三" → 搜索姓名包含"张三"的义工
输入 "LZ-V-1234567" → 搜索莲花斋ID
输入 "13800138000" → 搜索手机号
```

## 测试验证

### 测试用例1：添加没有义工号的义工

**步骤：**
1. 填写姓名、手机号、身份证号
2. 不填写深圳义工号
3. 点击"创建义工"

**预期结果：** ✅ 创建成功

### 测试用例2：添加有义工号的义工

**步骤：**
1. 填写姓名、手机号、身份证号
2. 填写深圳义工号（如：0000123456）
3. 点击"创建义工"

**预期结果：** ✅ 创建成功

### 测试用例3：添加重复义工号

**步骤：**
1. 填写姓名、手机号、身份证号
2. 填写已存在的深圳义工号
3. 点击"创建义工"

**预期结果：** ❌ 提示"义工编号已存在"

### 测试用例4：添加重复手机号

**步骤：**
1. 填写姓名、已存在的手机号、身份证号
2. 点击"创建义工"

**预期结果：** ❌ 提示"手机号已存在"

## 数据库状态

### 当前义工统计

```sql
-- 总义工数
SELECT COUNT(*) FROM volunteer;

-- 有义工号的义工数
SELECT COUNT(*) FROM volunteer WHERE volunteer_id IS NOT NULL AND volunteer_id != '';

-- 没有义工号的义工数
SELECT COUNT(*) FROM volunteer WHERE volunteer_id IS NULL OR volunteer_id = '';
```

### 检查重复数据

```sql
-- 检查重复的义工号
SELECT volunteer_id, COUNT(*) as count 
FROM volunteer 
WHERE volunteer_id IS NOT NULL AND volunteer_id != ''
GROUP BY volunteer_id 
HAVING count > 1;

-- 检查重复的手机号
SELECT phone, COUNT(*) as count 
FROM volunteer 
GROUP BY phone 
HAVING count > 1;

-- 检查重复的身份证号
SELECT id_number, COUNT(*) as count 
FROM volunteer 
GROUP BY id_number 
HAVING count > 1;
```

## 诊断工具

创建了诊断脚本：`apps/api/diagnose-volunteer.ts`

**功能：**
1. 搜索指定姓名的义工
2. 检查重复的义工编号
3. 显示最近创建的义工
4. 检查数据库状态

**使用方法：**
```bash
cd apps/api
bun run diagnose-volunteer.ts
```

## 常见问题

### Q1: 为什么搜索不到某个义工？

**可能原因：**
1. 该义工不存在于数据库中
2. 姓名拼写错误
3. 搜索的字段不支持（如只搜索法名）

**解决方法：**
- 使用诊断工具检查数据库
- 尝试搜索手机号或莲花斋ID
- 检查是否在"待审批"标签页

### Q2: 为什么提示"义工编号已存在"？

**可能原因：**
1. 填写的义工号确实已存在
2. 填写了空格或特殊字符

**解决方法：**
- 检查填写的义工号是否正确
- 如果没有义工号，留空不填
- 使用搜索功能查询该义工号是否已存在

### Q3: 可以不填写深圳义工号吗？

**答案：** 可以！

深圳义工号是可选字段，如果义工还没有获得义工号，可以暂时不填写，等获得后再编辑更新。

### Q4: 如何批量导入义工？

**方法：**
1. 点击"批量导入"按钮
2. 下载Excel模板
3. 填写义工信息
4. 上传Excel文件

**注意：**
- 确保手机号和身份证号唯一
- 义工号可以为空
- 按照模板格式填写

## 总结

**修复内容：**
- ✅ 改进唯一性检查逻辑，正确处理空字符串
- ✅ 允许多个义工的可选字段为空
- ✅ 创建诊断工具，方便排查问题

**影响范围：**
- 义工创建功能
- 义工编辑功能
- 批量导入功能

**用户体验改进：**
- 可以不填写深圳义工号
- 错误提示更准确
- 减少不必要的重复检查
