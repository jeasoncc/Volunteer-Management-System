# 考勤分页参数验证修复

## 问题描述

之前的实现中，分页参数（page 和 pageSize）从前端传递到后端时缺少严格的类型转换和验证：

1. **前端问题**：虽然 TypeScript 类型定义为 number，但实际传递时可能是字符串
2. **后端问题**：缺少参数验证，直接使用 parseInt 但没有检查转换结果
3. **安全隐患**：恶意用户可能传递非法参数导致数据库查询异常

## 修复方案

### 1. 前端修复

**文件**: `apps/web/src/components/checkin/RecordsTab.tsx`

```typescript
// ✅ 修复前
queryFn: () =>
  checkinService.getRawRecords({
    page,
    pageSize,
    startDate,
    endDate,
    lotusId: lotusId || undefined,
  }),

// ✅ 修复后 - 显式转换为数字
queryFn: () =>
  checkinService.getRawRecords({
    page: Number(page),
    pageSize: Number(pageSize),
    startDate,
    endDate,
    lotusId: lotusId || undefined,
  }),
```

**文件**: `apps/web/src/components/checkin/StrangersTab.tsx`

```typescript
// ✅ 修复前
queryFn: () =>
  checkinService.getStrangerRecords({
    page,
    pageSize,
    startDate,
    endDate,
  }),

// ✅ 修复后 - 显式转换为数字
queryFn: () =>
  checkinService.getStrangerRecords({
    page: Number(page),
    pageSize: Number(pageSize),
    startDate,
    endDate,
  }),
```

### 2. 后端 API 层验证

**文件**: `apps/api/src/modules/checkin/index.ts`

#### 陌生人记录接口

```typescript
// ✅ 添加严格验证
.get('/stranger-records', async ({ query }) => {
  const { startDate, endDate, deviceSn, page = 1, pageSize = 50 } = query as any

  // 🔒 验证分页参数
  const pageNum = parseInt(page as any, 10)
  const pageSizeNum = parseInt(pageSize as any, 10)
  
  if (isNaN(pageNum) || pageNum < 1) {
    return {
      success: false,
      message: '无效的页码参数',
    }
  }
  
  if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 1000) {
    return {
      success: false,
      message: '无效的每页数量参数（范围: 1-1000）',
    }
  }

  const filters: any = {
    page: pageNum,
    pageSize: pageSizeNum,
  }
  // ...
})
```

#### 打卡记录接口

```typescript
// ✅ 添加严格验证
.get('/checkin/records', async ({ query }) => {
  const { page = 1, pageSize = 50 } = query as any
  
  // 🔒 验证分页参数
  const pageNum = parseInt(page as any, 10)
  const pageSizeNum = parseInt(pageSize as any, 10)
  
  if (isNaN(pageNum) || pageNum < 1) {
    return {
      success: false,
      message: '无效的页码参数',
    }
  }
  
  if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 1000) {
    return {
      success: false,
      message: '无效的每页数量参数（范围: 1-1000）',
    }
  }
  
  const validatedQuery = {
    ...query,
    page: pageNum,
    pageSize: pageSizeNum,
  }
  
  const result = await CheckInRecordService.getList(validatedQuery as any)
  return result
})
```

### 3. Service 层验证

**文件**: `apps/api/src/modules/checkin/record.service.ts`

```typescript
static async getList(params: {
  page?: number
  pageSize?: number
  // ...
}) {
  // ✅ 修复：将字符串参数转换为数字并验证
  const page = parseInt(params.page as any) || 1
  const pageSize = parseInt(params.pageSize as any) || 20
  
  // 🔒 验证：确保参数有效
  if (isNaN(page) || page < 1) {
    throw new Error('无效的页码参数')
  }
  
  if (isNaN(pageSize) || pageSize < 1 || pageSize > 1000) {
    throw new Error('无效的每页数量参数（范围: 1-1000）')
  }
  
  // ...
}
```

**文件**: `apps/api/src/modules/checkin/service.ts`

```typescript
static async getStrangerList(params: {
  page?: number
  pageSize?: number
  // ...
}) {
  const { startDate, endDate, deviceSn, page = 1, pageSize = 50 } = params

  // 🔒 验证分页参数
  const pageNum = typeof page === 'number' ? page : parseInt(page as any, 10)
  const pageSizeNum = typeof pageSize === 'number' ? pageSize : parseInt(pageSize as any, 10)
  
  if (isNaN(pageNum) || pageNum < 1) {
    throw new Error('无效的页码参数')
  }
  
  if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 1000) {
    throw new Error('无效的每页数量参数（范围: 1-1000）')
  }

  const limit = pageSizeNum
  const offset = (pageNum - 1) * pageSizeNum
  // ...
}
```

## 验证规则

### 页码 (page)
- 必须是数字
- 最小值：1
- 无最大值限制（由总页数决定）

### 每页数量 (pageSize)
- 必须是数字
- 最小值：1
- 最大值：1000（防止一次查询过多数据）

## 安全性提升

1. **类型安全**：前端显式转换确保传递正确类型
2. **参数验证**：后端多层验证防止非法输入
3. **错误提示**：清晰的错误消息帮助调试
4. **防护上限**：限制 pageSize 最大值防止资源滥用

## 测试建议

### 正常场景
- ✅ page=1, pageSize=10
- ✅ page=5, pageSize=50
- ✅ page=100, pageSize=100

### 异常场景
- ❌ page=0 → 返回错误
- ❌ page=-1 → 返回错误
- ❌ page="abc" → 返回错误
- ❌ pageSize=0 → 返回错误
- ❌ pageSize=2000 → 返回错误（超过上限）
- ❌ pageSize="xyz" → 返回错误

## 影响范围

### 修改的文件
1. `apps/web/src/components/checkin/RecordsTab.tsx`
2. `apps/web/src/components/checkin/StrangersTab.tsx`
3. `apps/api/src/modules/checkin/index.ts`
4. `apps/api/src/modules/checkin/record.service.ts`
5. `apps/api/src/modules/checkin/service.ts`

### 影响的功能
- 打卡记录列表查询
- 陌生人记录列表查询
- 所有使用分页的考勤相关接口

## 总结

通过在前端、API 层和 Service 层三个层次添加参数验证，确保了分页功能的健壮性和安全性。这是一个关键的修复，防止了潜在的数据库查询异常和安全漏洞。
