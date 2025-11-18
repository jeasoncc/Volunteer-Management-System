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
} from "@tanstack/react-table";
import { useState } from "react";
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
} from "lucide-react";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	isLoading?: boolean;
	searchPlaceholder?: string;
	enableExport?: boolean;
	exportFilename?: string;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	isLoading = false,
	searchPlaceholder = "搜索...",
	enableExport = true,
	exportFilename = "data",
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});
	const [globalFilter, setGlobalFilter] = useState("");
	const [density, setDensity] = useState<"compact" | "normal" | "comfortable">(
		"normal",
	);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		onGlobalFilterChange: setGlobalFilter,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			globalFilter,
		},
	});

	// 导出为 CSV
	const exportToCSV = () => {
		const headers = table
			.getAllColumns()
			.filter((col) => col.getIsVisible() && col.id !== "select" && col.id !== "actions")
			.map((col) => col.id);

		const rows = table.getFilteredRowModel().rows.map((row) => {
			return headers.map((header) => {
				const cell = row.getValue(header);
				return typeof cell === "string" || typeof cell === "number"
					? cell
					: JSON.stringify(cell);
			});
		});

		const csvContent = [
			headers.join(","),
			...rows.map((row) => row.join(",")),
		].join("\n");

		const blob = new Blob(["\ufeff" + csvContent], {
			type: "text/csv;charset=utf-8;",
		});
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = `${exportFilename}_${new Date().toISOString().split("T")[0]}.csv`;
		link.click();
	};

	const densityClasses = {
		compact: "py-1",
		normal: "py-2",
		comfortable: "py-3",
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-muted-foreground">加载中...</div>
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
							onChange={(e) => setGlobalFilter(e.target.value)}
							className="pl-8"
						/>
						{globalFilter && (
							<Button
								variant="ghost"
								size="sm"
								className="absolute right-1 top-1 h-7 w-7 p-0"
								onClick={() => setGlobalFilter("")}
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
											{column.id}
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
					{enableExport && (
						<Button variant="outline" size="sm" onClick={exportToCSV}>
							<Download className="h-4 w-4 mr-2" />
							导出
						</Button>
					)}
				</div>
			</div>

			{/* 统计信息 */}
			<div className="flex items-center justify-between text-sm text-muted-foreground">
				<div>
					共 {table.getFilteredRowModel().rows.length} 条记录
					{Object.keys(rowSelection).length > 0 && (
						<span className="ml-2">
							（已选择 {Object.keys(rowSelection).length} 条）
						</span>
					)}
				</div>
				{columnFilters.length > 0 && (
					<div>已应用 {columnFilters.length} 个筛选条件</div>
				)}
			</div>

			{/* 表格 */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder ? null : (
											<div
												className={
													header.column.getCanSort()
														? "cursor-pointer select-none flex items-center gap-2"
														: ""
												}
												onClick={header.column.getToggleSortingHandler()}
											>
												{flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
												{{
													asc: " 🔼",
													desc: " 🔽",
												}[header.column.getIsSorted() as string] ?? null}
											</div>
										)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id} className={densityClasses[density]}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									暂无数据
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* 分页控制 */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<p className="text-sm text-muted-foreground">
						每页显示
					</p>
					<select
						className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm"
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
					<p className="text-sm text-muted-foreground">条</p>
				</div>

				<div className="flex items-center gap-2">
					<p className="text-sm text-muted-foreground">
						第 {table.getState().pagination.pageIndex + 1} /{" "}
						{table.getPageCount()} 页
					</p>
					<div className="flex gap-1">
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
						>
							首页
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							上一页
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							下一页
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
						>
							末页
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
