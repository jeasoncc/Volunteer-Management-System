# CSV批量导入修复

## 问题描述

批量导入CSV文件时出现两个问题：
1. 前端显示 "Expected object" 错误
2. CSV解析后所有字段显示为空（"-"）

### 根本原因

#### 问题1：API请求格式错误
前端发送数据时包装在对象中 `{ volunteers: [...] }`，但后端期望直接接收数组 `[...]`

#### 问题2：CSV文件格式问题  
CSV文件的表头中包含换行符，导致XLSX库解析失败：
- 表头字段"学历"后面有隐藏的换行符
- 这导致后续字段无法正确识别
- 解析后所有数据都显示为空

#### 问题3：空字段处理
CSV文件中的空字段被解析为空字符串 `""`，但后端验证要求可选字段必须是有效值或 `undefined`/`null`

### 示例

CSV文件内容：
```csv
姓名,手机号,身份证号,性别,出生日期,深圳义工号,微信号
刘金艳,13128851618,430223199001018381,女,1990-01-01,,13128851618
```

解析后的错误数据：
```javascript
{
  name: "刘金艳",
  phone: "13128851618",
  volunteerId: "",  // ❌ 空字符串不符合验证规则
  wechat: "13128851618",
  email: "",        // ❌ 空字符串不是有效邮箱
  dharmaName: ""    // ❌ 空字符串
}
```

## 解决方案

### 修改文件
`apps/web/src/components/BatchImportDialog.tsx`

### 核心改进

1. **添加清理函数**
   ```typescript
   const cleanValue = (value: any): any => {
     if (value === "" || value === null || value === undefined) {
       return undefined;
     }
     return value;
   };
   ```

2. **优化字段映射逻辑**
   - 先处理所有字段值
   - 使用 `cleanValue` 清理空值
   - 只添加有值的可选字段到最终对象

3. **修正枚举值映射**
   - 皈依状态：`"皈依"` → `"took_refuge"`（之前错误地映射为 `"refuge"`）
   - 健康状况：`"一般"` → `"has_chronic_disease"`（更符合后端枚举）

### 修复后的数据

```javascript
{
  name: "刘金艳",
  phone: "13128851618",
  idNumber: "430223199001018381",
  gender: "female",
  birthDate: "1990-01-01",
  wechat: "13128851618",
  // volunteerId, email, dharmaName 等空字段不会出现在对象中
}
```

## 后端验证规则参考

### 必填字段
- `name`: 姓名（最少2个字符）
- `phone`: 手机号（11-20位）
- `idNumber`: 身份证号（18位）
- `gender`: 性别（male/female/other）

### 可选字段规则
- 如果不提供：字段不出现在对象中，或值为 `undefined`/`null`
- 如果提供：必须符合格式要求
  - `email`: 有效邮箱格式
  - `birthDate`: 日期格式 YYYY-MM-DD
  - `education`: 枚举值（elementary/middle_school/high_school等）
  - `religiousBackground`: 枚举值（upasaka/none等）
  - `refugeStatus`: 枚举值（none/took_refuge/five_precepts等）
  - `healthConditions`: 枚举值（healthy/has_chronic_disease等）

## 测试建议

1. **测试空字段处理**
   - 上传包含空字段的CSV文件
   - 验证不会出现 "Expected object" 错误

2. **测试枚举值映射**
   - 学历：小学、初中、高中、本科等
   - 宗教背景：佛教、无
   - 皈依状态：皈依、无
   - 健康状况：很好、一般、较差

3. **测试必填字段**
   - 缺少姓名、手机号或身份证号应该有明确错误提示

## 相关文件

- `apps/web/src/components/BatchImportDialog.tsx` - 批量导入对话框
- `apps/api/src/modules/volunteer/model.ts` - 后端验证模型
- `test_import_5_volunteers.csv` - 测试CSV文件

## 修复方案

### 修复1：CSV文件格式清理

**问题**: CSV表头中包含换行符，导致字段无法正确解析

**解决方法**: 使用Python脚本重新生成干净的CSV文件

```python
import csv

# 读取并清理CSV
rows = []
with open('test_import_5_volunteers.csv', 'r', encoding='utf-8') as f:
    content = f.read()
    lines = [line.strip() for line in content.split('\n') if line.strip()]

# 重新写入
with open('test_import_5_volunteers.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    for line in lines:
        row = line.split(',')
        writer.writerow(row)
```

### 修复2：API请求格式错误

**文件**: `apps/web/src/services/volunteer.ts`

**错误代码**:
```typescript
batchImport: async (volunteers: CreateVolunteerParams[]): Promise<ApiResponse> => {
  return api.post("/api/volunteer/batch/import", { volunteers });  // ❌ 错误：包装在对象中
}
```

**正确代码**:
```typescript
batchImport: async (volunteers: CreateVolunteerParams[]): Promise<ApiResponse> => {
  return api.post("/api/volunteer/batch/import", volunteers);  // ✅ 正确：直接发送数组
}
```

**原因**: 
- 后端期望接收的是数组 `VolunteerCreateDto[]`
- 前端却发送了 `{ volunteers: [...] }` 对象
- 导致后端验证失败，提示 "Expected object"

### 问题2：空字段处理

**文件**: `apps/web/src/components/BatchImportDialog.tsx`

添加了 `cleanValue` 函数来清理空字符串，确保可选字段要么有有效值，要么不出现在对象中。

## 修复时间

2024-11-26
