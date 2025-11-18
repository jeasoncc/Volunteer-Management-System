# 🐛 PageSize 参数超限问题修复

## 问题描述

前端请求时使用 `pageSize: 1000`，但后端限制最大值为 100，导致参数验证失败。

## 错误信息

```json
{
  "type": "validation",
  "on": "property",
  "property": "root",
  "message": "Expected number to be less or equal to 100",
  "summary": "Expected number to be less or equal to 100",
  "found": 1000
}
```

## 问题根因

后端 `VolunteerListQuerySchema` 定义：
```typescript
export const VolunteerListQuerySchema = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })), // 最大 100
  // ...
})
```

前端多处使用 `pageSize: 1000`：
- `apps/web/src/routes/volunteers.tsx`
- `apps/web/src/routes/admin.tsx`
- `apps/web/src/routes/checkin.tsx`
- `apps/web/src/routes/checkin.records.tsx`

## 修复方案

将所有前端的 `pageSize: 1000` 改为 `pageSize: 100`

### 修改的文件

1. **apps/web/src/routes/volunteers.tsx**
```typescript
// 修改前
queryFn: () => volunteerService.getList({ page: 1, pageSize: 1000 })

// 修改后
queryFn: () => volunteerService.getList({ page: 1, pageSize: 100 })
```

2. **apps/web/src/routes/admin.tsx**
```typescript
// 修改前
queryFn: () => adminService.getList({ page: 1, pageSize: 1000 })

// 修改后
queryFn: () => adminService.getList({ page: 1, pageSize: 100 })
```

3. **apps/web/src/routes/checkin.tsx**
```typescript
// 修改前
queryFn: () => checkinService.getList({ startDate, endDate, page: 1, pageSize: 1000 })

// 修改后
queryFn: () => checkinService.getList({ startDate, endDate, page: 1, pageSize: 100 })
```

4. **apps/web/src/routes/checkin.records.tsx**
```typescript
// 修改前
checkinService.getList({ page: 1, pageSize: 1000, startDate, endDate })

// 修改后
checkinService.getList({ page: 1, pageSize: 100, startDate, endDate })
```

## 测试验证

```bash
$ curl -b cookies.txt "http://localhost:3001/volunteer?page=1&limit=100"
✅ 成功: total=54, pageSize=100, data_count=54
```

## 后续优化建议

### 方案 1: 增加后端限制（推荐）
如果确实需要一次获取更多数据，可以调整后端限制：

```typescript
// apps/api/src/modules/volunteer/model.ts
export const VolunteerListQuerySchema = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 500 })), // 增加到 500
  // ...
})
```

### 方案 2: 实现真正的分页（推荐）
前端使用 TanStack Table 的分页功能，而不是一次性加载所有数据：

```typescript
const [pagination, setPagination] = useState({
  pageIndex: 0,
  pageSize: 20,
});

const { data, isLoading } = useQuery({
  queryKey: ["volunteers", pagination],
  queryFn: () => volunteerService.getList({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize
  }),
  enabled: isAuthenticated,
  keepPreviousData: true, // 保持上一页数据，避免闪烁
});
```

### 方案 3: 添加"获取全部"接口
后端提供专门的接口获取所有数据（不分页）：

```typescript
// 后端
.get('/all', async () => {
  return await VolunteerService.getAll();
})

// 前端
volunteerService.getAll()
```

## 影响范围

- ✅ 义工列表页面
- ✅ 管理员列表页面
- ✅ 考勤记录页面

## 注意事项

1. **性能考虑**: 如果数据量超过 100 条，用户将只能看到前 100 条
2. **用户体验**: 建议实现真正的分页功能，而不是限制显示数量
3. **数据完整性**: 导出功能应该使用专门的接口，不受分页限制

## 相关文档

- [API 文档](./docs/api/API_DOCUMENTATION.md)
- [义工数量问题修复](./VOLUNTEER_COUNT_FIX.md)
- [最终修复总结](./FINAL_FIX_SUMMARY.md)

---

**修复时间**: 2024-11-19
**修复人**: Kiro AI Assistant
**问题级别**: P1 (高优先级)
**影响范围**: 所有列表页面
**修复状态**: ✅ 已完成
