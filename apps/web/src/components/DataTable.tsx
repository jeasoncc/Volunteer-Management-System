import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
} from "@tanstack/react-table";
import { useState, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  ChevronDown,
  Settings2,
  Download,
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileType,
  FileCode,
  Loader2,
} from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  enableExport?: boolean;
  onExport?: (format: "excel" | "csv" | "txt" | "markdown") => void;
  columnLabels?: Record<string, string>;
  onSelectionChange?: (selectedRows: TData[]) => void;
  emptyState?: React.ReactNode;
  noResultsState?: React.ReactNode;
  // 外部搜索控制
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  isSearching?: boolean; // 搜索加载状态
  // 服务端分页配置
  pagination?: {
    pageIndex: number; // 0-based
    pageSize: number;
    pageCount: number;
    total?: number;
    onPageChange: (pageIndex: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  searchPlaceholder = "搜索...",
  enableExport = true,
  onExport,
  columnLabels = {},
  onSelectionChange,
  emptyState,
  noResultsState,
  searchValue,
  onSearchChange,
  isSearching = false,
  pagination,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true } // 默认按加入时间降序排序
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [internalGlobalFilter, setInternalGlobalFilter] = useState("");
  const [debouncedGlobalFilter, setDebouncedGlobalFilter] = useState("");
  const [density, setDensity] = useState<"compact" | "normal" | "comfortable">(
    "normal",
  );

  // 使用外部搜索值或内部搜索值
  const globalFilter = searchValue !== undefined ? searchValue : internalGlobalFilter;

  // 内部状态（仅当没有提供外部 pagination 时使用）
  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    {
      pageIndex: 0,
      pageSize: 10,
    },
  );

  // 搜索防抖（仅在使用内部搜索时）
  useEffect(() => {
    if (searchValue === undefined) {
      const timer = setTimeout(() => {
        setDebouncedGlobalFilter(internalGlobalFilter);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [internalGlobalFilter, searchValue]);

  // 构建 Table 实例
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: searchValue !== undefined ? undefined : getFilteredRowModel(), // 外部搜索时禁用内部过滤
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: searchValue !== undefined ? undefined : setDebouncedGlobalFilter,
    // 分页配置
    manualPagination: !!pagination, // 如果提供了 pagination prop，则启用服务端分页模式
    manualSorting: false, // 始终使用客户端排序
    pageCount: pagination?.pageCount, // 服务端总页数
    onPaginationChange: (updaterOrValue) => {
      if (pagination) {
        // 处理服务端分页更新
        if (typeof updaterOrValue === "function") {
          const currentState = {
            pageIndex: pagination.pageIndex,
            pageSize: pagination.pageSize,
          };
          const newState = updaterOrValue(currentState);

          // 只在值变化时调用回调
          if (newState.pageIndex !== currentState.pageIndex) {
            pagination.onPageChange(newState.pageIndex);
          }
          if (newState.pageSize !== currentState.pageSize) {
            pagination.onPageSizeChange(newState.pageSize);
          }
        } else {
          // 只在值变化时调用回调
          if (updaterOrValue.pageIndex !== pagination.pageIndex) {
            pagination.onPageChange(updaterOrValue.pageIndex);
          }
          if (updaterOrValue.pageSize !== pagination.pageSize) {
            pagination.onPageSizeChange(updaterOrValue.pageSize);
          }
        }
      } else {
        // 内部客户端分页
        setInternalPagination(updaterOrValue);
      }
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: searchValue !== undefined ? undefined : debouncedGlobalFilter, // 外部搜索时不使用内部globalFilter
      pagination: pagination
        ? {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
        }
        : internalPagination,
    },
  });

  // 选择变化回调
  useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original);
      onSelectionChange(selectedRows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection]);

  // 导出处理
  const handleExport = (format: "excel" | "csv" | "txt" | "markdown") => {
    if (onExport) {
      onExport(format);
    }
  };

  const densityClasses = {
    compact: "py-1",
    normal: "py-2",
    comfortable: "py-3",
  };

  // 骨架屏加载状态
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* 工具栏骨架 */}
        <div className="flex items-center justify-between gap-4">
          <div className="h-10 bg-muted rounded-md w-64 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 bg-muted rounded-md w-20 animate-pulse" />
            <div className="h-10 bg-muted rounded-md w-20 animate-pulse" />
            <div className="h-10 bg-muted rounded-md w-20 animate-pulse" />
          </div>
        </div>
        {/* 表格骨架 */}
        <div className="rounded-md border">
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-muted rounded animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between gap-4">
        {/* 搜索框 */}
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                if (onSearchChange) {
                  onSearchChange(value);
                } else {
                  setInternalGlobalFilter(value);
                }
              }}
              className="pl-8 pr-8"
            />
            {isSearching && (
              <Loader2 className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
            )}
            {globalFilter && !isSearching && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
                onClick={() => {
                  if (onSearchChange) {
                    onSearchChange("");
                  } else {
                    setInternalGlobalFilter("");
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* 右侧工具按钮 */}
        <div className="flex items-center gap-2">
          {/* 列筛选 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                筛选
                {columnFilters.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary text-primary-foreground px-1.5 py-0.5 text-xs">
                    {columnFilters.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>列筛选</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columnFilters.length > 0 ? (
                <>
                  {columnFilters.map((filter) => (
                    <div
                      key={filter.id}
                      className="px-2 py-1.5 text-sm flex items-center justify-between"
                    >
                      <span className="truncate">{filter.id}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          table.getColumn(filter.id)?.setFilterValue(undefined);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <DropdownMenuSeparator />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => table.resetColumnFilters()}
                  >
                    清除所有筛选
                  </Button>
                </>
              ) : (
                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                  暂无筛选条件
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 列可见性 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="h-4 w-4 mr-2" />
                列
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>显示列</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {columnLabels[column.id] || column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 密度切换 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="h-4 w-4 mr-2" />
                密度
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>表格密度</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={density === "compact"}
                onCheckedChange={() => setDensity("compact")}
              >
                紧凑
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={density === "normal"}
                onCheckedChange={() => setDensity("normal")}
              >
                标准
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={density === "comfortable"}
                onCheckedChange={() => setDensity("comfortable")}
              >
                舒适
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 导出 */}
          {enableExport && onExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  导出
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>导出格式</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  onSelect={() => handleExport("excel")}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel (.xlsx)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem onSelect={() => handleExport("csv")}>
                  <FileText className="h-4 w-4 mr-2" />
                  CSV (.csv)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem onSelect={() => handleExport("txt")}>
                  <FileType className="h-4 w-4 mr-2" />
                  文本 (.txt)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem onSelect={() => handleExport("markdown")}>
                  <FileCode className="h-4 w-4 mr-2" />
                  Markdown (.md)
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* 统计信息 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          {pagination?.total !== undefined ? (
            <span>共 {pagination.total} 条记录</span>
          ) : (
            <span>共 {table.getFilteredRowModel().rows.length} 条记录</span>
          )}

          {Object.keys(rowSelection).length > 0 && (
            <span className="ml-2 text-primary font-medium">
              （已选择 {Object.keys(rowSelection).length} 条）
            </span>
          )}
        </div>
        {columnFilters.length > 0 && (
          <div>已应用 {columnFilters.length} 个筛选条件</div>
        )}
      </div>

      {/* 表格 */}
      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-serif font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center gap-1.5 hover:text-foreground transition-colors"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() && (
                          <span className="ml-auto">
                            {header.column.getIsSorted() === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ArrowDown className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/50 transition-colors border-b last:border-0"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={densityClasses[density]}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {/* 填充空行以保持表格高度一致 */}
                {table.getRowModel().rows.length > 0 &&
                  table.getRowModel().rows.length <
                  table.getState().pagination.pageSize &&
                  Array.from({
                    length:
                      table.getState().pagination.pageSize -
                      table.getRowModel().rows.length,
                  }).map((_, index) => (
                    <TableRow
                      key={`empty-${index}`}
                      className="border-0 hover:bg-transparent"
                    >
                      <TableCell
                        colSpan={columns.length}
                        className={densityClasses[density]}
                      >
                        <div className="h-10 opacity-0 select-none">&nbsp;</div>
                      </TableCell>
                    </TableRow>
                  ))}
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center p-0"
                >
                  {/* 显示自定义空状态或默认文本 */}
                  {data.length === 0 && emptyState ? (
                    emptyState
                  ) : data.length > 0 &&
                    table.getRowModel().rows.length === 0 &&
                    noResultsState ? (
                    noResultsState
                  ) : (
                    <div className="py-8 flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <Search className="h-8 w-8 opacity-20" />
                      <p>暂无数据</p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页控制 */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <p>每页</p>
          <select
            className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
          <p>条</p>
        </div>

        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground font-medium">
            第 {table.getState().pagination.pageIndex + 1} /{" "}
            {table.getPageCount()} 页
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              title="首页"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              title="上一页"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              title="下一页"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              title="末页"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
