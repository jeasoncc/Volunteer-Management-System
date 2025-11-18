# 📊 增强型数据表格功能

## 功能概述

将义工管理页面的简单表格升级为功能强大的数据表格，提供企业级的数据管理体验。

## 新增功能

### 1. 高级搜索 🔍

**全局搜索**：
- 搜索框支持实时搜索所有列
- 支持搜索姓名、ID、手机号等
- 清除按钮快速清空搜索

```tsx
<Input
  placeholder="搜索姓名、ID、手机号..."
  value={globalFilter}
  onChange={(e) => setGlobalFilter(e.target.value)}
/>
```

### 2. 列可见性控制 👁️

**显示/隐藏列**：
- 点击"列"按钮打开列选择菜单
- 勾选/取消勾选控制列的显示
- 保持选择框和操作列始终可见

```tsx
<DropdownMenu>
  <DropdownMenuTrigger>
    <Settings2 /> 列
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    {columns.map(column => (
      <DropdownMenuCheckboxItem
        checked={column.getIsVisible()}
        onCheckedChange={column.toggleVisibility}
      >
        {column.id}
      </DropdownMenuCheckboxItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

### 3. 列筛选 🎯

**独立列筛选**：
- 点击"筛选"按钮查看当前筛选条件
- 显示已应用的筛选数量徽章
- 快速清除单个或所有筛选条件

```tsx
<Button>
  <SlidersHorizontal /> 筛选
  {columnFilters.length > 0 && (
    <Badge>{columnFilters.length}</Badge>
  )}
</Button>
```

### 4. 表格密度切换 📏

**三种密度模式**：
- **紧凑**：`py-1` - 适合大量数据
- **标准**：`py-2` - 默认模式
- **舒适**：`py-3` - 适合阅读

```tsx
const densityClasses = {
  compact: "py-1",
  normal: "py-2",
  comfortable: "py-3",
};
```

### 5. 数据导出 📥

**导出为 CSV**：
- 导出当前筛选后的数据
- 自动添加 BOM 支持中文
- 文件名包含日期时间戳
- 仅导出可见列（排除选择框和操作列）

```tsx
const exportToCSV = () => {
  const headers = table.getAllColumns()
    .filter(col => col.getIsVisible() && col.id !== "select" && col.id !== "actions")
    .map(col => col.id);
  
  const rows = table.getFilteredRowModel().rows.map(row => {
    return headers.map(header => row.getValue(header));
  });
  
  const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  // 下载文件
};
```

### 6. 排序功能 ⬆️⬇️

**点击列头排序**：
- 点击一次：升序 🔼
- 点击两次：降序 🔽
- 点击三次：取消排序
- 支持多列排序

### 7. 分页控制 📄

**灵活的分页**：
- 可选择每页显示数量：10/20/30/40/50/100
- 首页、上一页、下一页、末页按钮
- 显示当前页码和总页数
- 显示总记录数和已选择数量

```tsx
<select
  value={table.getState().pagination.pageSize}
  onChange={(e) => table.setPageSize(Number(e.target.value))}
>
  {[10, 20, 30, 40, 50, 100].map(pageSize => (
    <option value={pageSize}>{pageSize}</option>
  ))}
</select>
```

### 8. 行选择 ✅

**多选功能**：
- 表头复选框全选/取消全选
- 行复选框单独选择
- 显示已选择数量
- 支持批量操作

### 9. 操作菜单 ⚙️

**下拉操作菜单**：
- 更简洁的操作按钮（三点图标）
- 查看详情
- 编辑
- 删除（红色高亮）

```tsx
<DropdownMenu>
  <DropdownMenuTrigger>
    <MoreHorizontal />
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={onView}>
      <Eye /> 查看详情
    </DropdownMenuItem>
    <DropdownMenuItem onClick={onEdit}>
      <Pencil /> 编辑
    </DropdownMenuItem>
    <DropdownMenuItem onClick={onDelete} className="text-destructive">
      <Trash2 /> 删除
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### 10. 美化的状态显示 🎨

**使用 Badge 组件**：
- 义工状态：已注册（绿色）、培训中（蓝色）、申请中（黄色）
- 角色：管理员（主色）、义工（次色）
- 性别：男/女/其他（边框样式）

```tsx
<Badge variant="default">已注册</Badge>
<Badge variant="secondary">培训中</Badge>
<Badge variant="outline">申请中</Badge>
<Badge variant="destructive">已暂停</Badge>
```

## 组件架构

### DataTable（通用数据表格）

**可复用的表格组件**：
```tsx
<DataTable
  columns={columns}
  data={data}
  isLoading={isLoading}
  searchPlaceholder="搜索..."
  enableExport={true}
  exportFilename="data"
/>
```

**特点**：
- 完全类型安全（TypeScript 泛型）
- 高度可配置
- 可用于任何数据类型
- 内置所有高级功能

### VolunteerDataTable（义工专用表格）

**针对义工数据优化**：
```tsx
<VolunteerDataTable
  data={volunteers}
  isLoading={isLoading}
  onView={handleView}
  onEdit={handleEdit}
  onDelete={handleDelete}
  enableSelection={true}
  onSelectionChange={handleSelectionChange}
/>
```

**特点**：
- 预定义义工列配置
- 自定义状态显示
- 集成操作菜单
- 支持选择和批量操作

## 使用示例

### 基本用法

```tsx
import { VolunteerDataTable } from "../components/VolunteerDataTable";

function VolunteersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["volunteers"],
    queryFn: volunteerService.getList,
  });

  return (
    <VolunteerDataTable
      data={data?.data || []}
      isLoading={isLoading}
      onView={(volunteer) => console.log("查看", volunteer)}
      onEdit={(volunteer) => console.log("编辑", volunteer)}
      onDelete={(volunteer) => console.log("删除", volunteer)}
    />
  );
}
```

### 启用选择和批量操作

```tsx
const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]);

<VolunteerDataTable
  data={volunteers}
  enableSelection={true}
  onSelectionChange={setSelectedVolunteers}
/>

{selectedVolunteers.length > 0 && (
  <Button onClick={handleBatchDelete}>
    批量删除 ({selectedVolunteers.length})
  </Button>
)}
```

## 界面预览

### 工具栏布局

```
┌─────────────────────────────────────────────────────────────┐
│ [🔍 搜索姓名、ID、手机号...] [X]  [筛选 2] [列 ▼] [密度] [导出] │
└─────────────────────────────────────────────────────────────┘
```

### 表格布局

```
┌──────────────────────────────────────────────────────────────┐
│ 共 54 条记录（已选择 3 条）          已应用 2 个筛选条件      │
├──────────────────────────────────────────────────────────────┤
│ □ │ 莲花斋ID    │ 姓名  │ 性别 │ 手机号      │ 状态  │ 操作 │
├──────────────────────────────────────────────────────────────┤
│ ☑ │ LZ-V-001   │ 张三  │ 男   │ 13800138000 │ 已注册 │ ⋮   │
│ □ │ LZ-V-002   │ 李四  │ 女   │ 13900139000 │ 培训中 │ ⋮   │
│ ☑ │ LZ-V-003   │ 王五  │ 男   │ 13700137000 │ 已注册 │ ⋮   │
└──────────────────────────────────────────────────────────────┘
│ 每页显示 [20▼] 条        第 1 / 3 页  [首页][上一页][下一页][末页] │
└──────────────────────────────────────────────────────────────┘
```

### 操作菜单

```
┌─────────────┐
│ 操作        │
├─────────────┤
│ 👁 查看详情  │
│ ✏️ 编辑      │
├─────────────┤
│ 🗑️ 删除      │ ← 红色
└─────────────┘
```

## 技术栈

### 核心库

- **TanStack Table v8**：强大的表格状态管理
- **shadcn/ui**：美观的 UI 组件
- **Lucide React**：现代化图标库
- **TypeScript**：类型安全

### 功能实现

```tsx
// 表格状态管理
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  state: {
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
    globalFilter,
  },
});
```

## 性能优化

### 1. 虚拟化（未来）

对于大量数据，可以集成 `@tanstack/react-virtual`：

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

const rowVirtualizer = useVirtualizer({
  count: table.getRowModel().rows.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50,
});
```

### 2. 懒加载

支持服务端分页和筛选：

```tsx
const { data, isLoading } = useQuery({
  queryKey: ["volunteers", pagination, filters],
  queryFn: () => volunteerService.getList({
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
    filters: filters,
  }),
});
```

### 3. 记忆化

使用 `useMemo` 优化列定义：

```tsx
const columns = useMemo<ColumnDef<Volunteer>[]>(
  () => [
    // 列定义
  ],
  [onEdit, onDelete, onView]
);
```

## 对比旧表格

### 旧表格（VolunteerTable）

- ❌ 简单的搜索
- ❌ 固定的列显示
- ❌ 基础的分页
- ❌ 简单的样式
- ❌ 无导出功能
- ❌ 无密度控制

### 新表格（VolunteerDataTable）

- ✅ 全局搜索 + 列筛选
- ✅ 列可见性控制
- ✅ 灵活的分页（可选每页数量）
- ✅ 现代化 UI（shadcn/ui）
- ✅ CSV 导出
- ✅ 三种密度模式
- ✅ 下拉操作菜单
- ✅ Badge 状态显示
- ✅ 完整的 TypeScript 支持

## 后续优化建议

### 1. 列宽调整

添加可拖拽调整列宽的功能：

```tsx
import { useResizeColumns } from "@tanstack/react-table";

const table = useReactTable({
  // ...
  columnResizeMode: "onChange",
});
```

### 2. 列固定

支持固定左侧或右侧列：

```tsx
{
  accessorKey: "lotusId",
  header: "莲花斋ID",
  meta: {
    sticky: "left",
  },
}
```

### 3. 行展开

支持展开行显示详细信息：

```tsx
{
  id: "expander",
  cell: ({ row }) => (
    <Button onClick={() => row.toggleExpanded()}>
      {row.getIsExpanded() ? "▼" : "▶"}
    </Button>
  ),
}
```

### 4. 拖拽排序

支持拖拽行进行排序：

```tsx
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
```

### 5. 批量编辑

支持选中多行后批量编辑：

```tsx
<Button onClick={handleBatchEdit}>
  批量编辑 ({selectedRows.length})
</Button>
```

### 6. 保存视图

保存用户的列配置、筛选条件等：

```tsx
const saveView = () => {
  localStorage.setItem("volunteer-table-view", JSON.stringify({
    columnVisibility,
    columnFilters,
    sorting,
  }));
};
```

## 相关文档

- [TanStack Table 文档](https://tanstack.com/table/latest)
- [shadcn/ui 文档](https://ui.shadcn.com/)
- [React Query 文档](https://tanstack.com/query/latest)

---

**实现时间**: 2024-11-19
**实现人**: Kiro AI Assistant
**功能状态**: ✅ 已完成

**现在义工管理页面拥有企业级的数据表格功能！** 🎉
