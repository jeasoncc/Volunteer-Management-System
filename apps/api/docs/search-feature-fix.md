# 搜索功能修复说明

## 问题描述
用户反馈在义工管理页面搜索"刘银萍"时搜索不到该账户。

## 问题原因
之前的搜索功能是**客户端搜索**（前端过滤），只能搜索当前已加载到前端的数据。由于使用了服务端分页，每次只加载一页的数据（默认10条），如果目标用户不在当前页，就无法搜索到。

### 原有实现
- 前端: `DataTable` 组件使用 `globalFilter` 进行客户端过滤
- 后端: 只有独立的 `/search` 接口，但前端没有使用
- 结果: 只能搜索当前页的10条数据

## 解决方案
实现**服务端搜索**，将搜索关键词传递给后端，在数据库层面进行全局搜索。

## 实现细节

### 1. 后端修改

#### a. 更新数据模型 (`model.ts`)
```typescript
export const VolunteerListQuerySchema = t.Object({
  page:    t.Optional(t.Numeric({ minimum: 1 })),
  limit:   t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  keyword: t.Optional(t.String()), // 新增：搜索关键词
  // ... 其他字段
})
```

#### b. 更新服务层 (`service.ts`)
```typescript
static async getList(query: VolunteerListQuery) {
  const { page = 1, limit = 10, keyword, ...filters } = query
  
  // ... 构建筛选条件
  
  // 如果有关键词搜索，添加 OR 条件
  if (keyword && keyword.trim()) {
    const keywordCondition = or(
      like(volunteer.name, `%${keyword}%`),
      like(volunteer.phone, `%${keyword}%`),
      like(volunteer.account, `%${keyword}%`),
      like(volunteer.email, `%${keyword}%`),
      like(volunteer.lotusId, `%${keyword}%`),
    )
    whereConditions.push(keywordCondition as any)
  }
  
  // ... 执行查询
}
```

### 2. 前端修改

#### a. 添加搜索状态 (`volunteers.tsx`)
```typescript
const [searchKeyword, setSearchKeyword] = useState("");

const filterParams = useMemo(() => {
  const params: any = {};
  // ... 其他筛选条件
  if (searchKeyword.trim()) params.keyword = searchKeyword.trim();
  return params;
}, [activeFilters, dateRange, searchKeyword]);
```

#### b. 添加搜索输入框
```tsx
<div className="relative flex-1 min-w-[200px] max-w-md">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input
    placeholder="搜索姓名、手机号、账号、邮箱、ID..."
    value={searchKeyword}
    onChange={(e) => {
      setSearchKeyword(e.target.value);
      setPage(1); // 重置到第一页
    }}
    className="pl-9 pr-9"
  />
  {searchKeyword && (
    <button onClick={() => { setSearchKeyword(""); setPage(1); }}>
      <X className="h-4 w-4" />
    </button>
  )}
</div>
```

## 搜索范围
现在可以搜索以下字段：
- ✅ 姓名 (`name`)
- ✅ 手机号 (`phone`)
- ✅ 账号 (`account`)
- ✅ 邮箱 (`email`)
- ✅ 莲花ID (`lotusId`)

## 使用方式

### 1. 全局搜索
在义工管理页面顶部的搜索框中输入关键词，系统会在所有义工数据中搜索，不受当前页限制。

### 2. 搜索示例
- 搜索 "刘银萍" → 找到姓名为"刘银萍"的义工
- 搜索 "13902949898" → 找到手机号为"13902949898"的义工
- 搜索 "LZ-V-" → 找到所有莲花ID以"LZ-V-"开头的义工

### 3. 组合使用
搜索可以与筛选条件组合使用：
- 搜索 "刘" + 筛选"管理员" → 找到所有姓刘的管理员
- 搜索 "139" + 筛选"已注册" → 找到所有手机号包含139且已注册的义工

## 性能优化
- 使用数据库的 `LIKE` 查询，支持模糊匹配
- 搜索条件与其他筛选条件使用 `AND` 组合，确保结果准确
- 保持分页功能，避免一次性加载大量数据

## 测试验证

### 测试场景 1: 搜索管理员
```
输入: "刘银萍"
预期结果: 找到刘银萍的账号（13902949898）
```

### 测试场景 2: 搜索超级管理员
```
输入: "陈璋"
预期结果: 找到陈璋的账号（13129546291）
```

### 测试场景 3: 搜索手机号
```
输入: "13902949898"
预期结果: 找到刘银萍的账号
```

### 测试场景 4: 部分匹配
```
输入: "139"
预期结果: 找到所有手机号包含"139"的义工
```

## 注意事项
1. 搜索是实时的，输入关键词后会自动触发搜索
2. 搜索会重置到第一页
3. 清空搜索框会恢复显示所有数据（受筛选条件限制）
4. 搜索不区分大小写（数据库层面处理）

## 后续优化建议
1. 添加搜索防抖（debounce），避免频繁请求
2. 添加搜索历史记录
3. 支持高级搜索语法（如 `name:刘 AND role:admin`）
4. 添加搜索结果高亮显示


