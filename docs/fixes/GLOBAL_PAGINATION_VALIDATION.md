# 全局分页参数验证修复

## 问题描述

在之前的实现中，整个系统的分页功能存在严重的安全和健壮性问题：

1. **缺少统一验证**：每个模块各自处理分页参数，没有统一的验证逻辑
2. **类型转换不一致**：有些地方使用 `parseInt`，有些直接使用，容易出错
3. **缺少边界检查**：没有限制 pageSize 的最大值，可能导致性能问题
4. **错误处理不完善**：非法参数可能导致数据库查询异常

## 解决方案

### 1. 创建统一的验证工具

**文件**: `apps/api/src/lib/validation/pagination.ts`

```typescript
export interface PaginationParams {
  page?: number | string
  pageSize?: number | string
  limit?: number | string
}

export interface ValidatedPaginationParams {
  page: number
  pageSize: number
  offset: number
}

export function validatePaginationParams(
  params: PaginationParams,
  options: PaginationValidationOptions = {}
): ValidatedPaginationParams {
  const {
    maxPageSize = 1000,
    defaultPage = 1,
    defaultPageSize = 20,
  } = options

  // 处理并验证 page
  const pageRaw = params.page ?? defaultPage
  const page = typeof pageRaw === 'number' ? pageRaw : parseInt(pageRaw as string, 10)

  // 处理并验证 pageSize/limit
  const pageSizeRaw = params.pageSize ?? params.limit ?? defaultPageSize
  const pageSize = typeof pageSizeRaw === 'number' ? pageSizeRaw : parseInt(pageSizeRaw as string, 10)

  // 验证
  if (isNaN(page) || page < 1) {
    throw new Error('无效的页码参数：必须是大于 0 的整数')
  }

  if (isNaN(pageSize) || pageSize < 1) {
    throw new Error('无效的每页数量参数：必须是大于 0 的整数')
  }

  if (pageSize > maxPageSize) {
    throw new Error(`每页数量超过最大限制：最大 ${maxPageSize} 条`)
  }

  // 计算 offset
  const offset = (page - 1) * pageSize

  return { page, pageSize, offset }
}
```

### 2. 修复所有模块

#### 考勤模块 (Checkin)

**修复文件**:
- `apps/api/src/modules/checkin/record.service.ts`
- `apps/api/src/modules/checkin/service.ts`
- `apps/api/src/modules/checkin/summary.service.ts`
- `apps/api/src/modules/checkin/index.ts`

**示例**:
```typescript
// ❌ 修复前
const page = parseInt(params.page as any) || 1
const pageSize = parseInt(params.pageSize as any) || 20
const offset = (page - 1) * pageSize

// ✅ 修复后
const { page, pageSize, offset } = validatePaginationParams({
  page: params.page,
  pageSize: params.pageSize,
}, {
  defaultPageSize: 20,
  maxPageSize: 1000,
})
```

#### 志愿者模块 (Volunteer)

**修复文件**:
- `apps/api/src/modules/volunteer/service.ts` - getList 方法
- `apps/api/src/modules/volunteer/approval.ts` - pending 和 history 接口

**修复前**:
```typescript
const { page = 1, limit = 10, keyword, ...filters } = query
const offset = (page - 1) * limit
```

**修复后**:
```typescript
const { keyword, ...filters } = query

const { page, pageSize: limit, offset } = validatePaginationParams({
  page: query.page,
  pageSize: query.limit,
}, {
  defaultPageSize: 10,
  maxPageSize: 1000,
})
```

#### 往生者模块 (Deceased)

**修复文件**:
- `apps/api/src/modules/deceased/service.ts` - getList 方法

**修复前**:
```typescript
const { page = 1, limit = 20, keyword, ...filters } = query
const offset = (page - 1) * limit
```

**修复后**:
```typescript
const { keyword, ...filters } = query

const { page, pageSize: limit, offset } = validatePaginationParams({
  page: query.page,
  pageSize: query.limit,
}, {
  defaultPageSize: 20,
  maxPageSize: 1000,
})
```

#### 管理员模块 (Admin)

**修复文件**:
- `apps/api/src/modules/admin/service.ts` - getList 方法

**修复前**:
```typescript
const { page = 1, limit = 10, ...filters } = query
const offset = (page - 1) * limit
```

**修复后**:
```typescript
const { ...filters } = query

const { page, pageSize: limit, offset } = validatePaginationParams({
  page: query.page,
  pageSize: query.limit,
}, {
  defaultPageSize: 10,
  maxPageSize: 1000,
})
```

#### 助念排班模块 (Chanting)

**修复文件**:
- `apps/api/src/modules/chanting/service.ts` - getList 方法

**修复前**:
```typescript
const { page = 1, limit = 20, ...filters } = query
const offset = (page - 1) * limit
```

**修复后**:
```typescript
const { ...filters } = query

const { page, pageSize: limit, offset } = validatePaginationParams({
  page: query.page,
  pageSize: query.limit,
}, {
  defaultPageSize: 20,
  maxPageSize: 1000,
})
```

## 验证规则

### 统一的验证标准

| 参数 | 类型 | 最小值 | 最大值 | 默认值 |
|------|------|--------|--------|--------|
| page | number | 1 | 无限制 | 1 |
| pageSize/limit | number | 1 | 1000 | 20 |

### 错误消息

- `无效的页码参数：必须是大于 0 的整数`
- `无效的每页数量参数：必须是大于 0 的整数`
- `每页数量超过最大限制：最大 1000 条`

## 修复的模块列表

### ✅ 已修复的模块

1. **考勤模块 (Checkin)**
   - ✅ record.service.ts - getList
   - ✅ service.ts - getStrangerList
   - ✅ summary.service.ts - list
   - ✅ index.ts - /stranger-records
   - ✅ index.ts - /checkin/records

2. **志愿者模块 (Volunteer)**
   - ✅ service.ts - getList
   - ✅ approval.ts - /pending
   - ✅ approval.ts - /history

3. **往生者模块 (Deceased)**
   - ✅ service.ts - getList

4. **管理员模块 (Admin)**
   - ✅ service.ts - getList

5. **助念排班模块 (Chanting)**
   - ✅ service.ts - getList

### 📝 不需要修复的地方

以下使用 `.limit(1)` 的地方是查询单条记录，不需要验证：
- 各种 `getById` 方法
- 唯一性检查（checkUniqueFields）
- 关联查询单条记录

## 安全性提升

### 1. 防止资源滥用
- 限制 pageSize 最大值为 1000，防止一次查询过多数据
- 避免恶意用户通过大 pageSize 导致数据库性能问题

### 2. 类型安全
- 统一的类型转换逻辑
- 明确的错误提示
- 避免 NaN 或 undefined 传递到数据库查询

### 3. 一致性
- 所有模块使用相同的验证逻辑
- 统一的错误处理
- 便于维护和调试

## 测试建议

### 正常场景
```bash
# 默认分页
GET /api/volunteer?page=1&limit=10

# 自定义分页
GET /api/volunteer?page=2&limit=50

# 最大分页
GET /api/volunteer?page=1&limit=1000
```

### 异常场景
```bash
# 无效页码
GET /api/volunteer?page=0&limit=10
# 预期: 400 错误，"无效的页码参数"

# 无效每页数量
GET /api/volunteer?page=1&limit=0
# 预期: 400 错误，"无效的每页数量参数"

# 超过最大限制
GET /api/volunteer?page=1&limit=2000
# 预期: 400 错误，"每页数量超过最大限制"

# 非数字参数
GET /api/volunteer?page=abc&limit=xyz
# 预期: 400 错误，"无效的页码参数"
```

## 影响范围

### 修改的文件 (11个)
1. `apps/api/src/lib/validation/pagination.ts` (新建)
2. `apps/api/src/modules/checkin/record.service.ts`
3. `apps/api/src/modules/checkin/service.ts`
4. `apps/api/src/modules/checkin/summary.service.ts`
5. `apps/api/src/modules/checkin/index.ts`
6. `apps/api/src/modules/volunteer/service.ts`
7. `apps/api/src/modules/volunteer/approval.ts`
8. `apps/api/src/modules/deceased/service.ts`
9. `apps/api/src/modules/admin/service.ts`
10. `apps/api/src/modules/chanting/service.ts`
11. `apps/web/src/components/checkin/RecordsTab.tsx`
12. `apps/web/src/components/checkin/StrangersTab.tsx`

### 影响的功能
- 所有列表查询接口
- 所有分页功能
- 所有使用 `.limit()` 和 `.offset()` 的数据库查询

## 总结

通过创建统一的分页验证工具并在所有模块中应用，我们实现了：

1. **统一性**：所有模块使用相同的验证逻辑
2. **安全性**：防止非法参数和资源滥用
3. **健壮性**：完善的错误处理和边界检查
4. **可维护性**：集中管理验证逻辑，便于后续修改

这是一个系统性的修复，确保了整个应用的分页功能都是安全、可靠和一致的。
