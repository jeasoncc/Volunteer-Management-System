import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { CheckInSummary } from "@/types";
import { Edit, Trash2, Search, Calendar, Clock } from "lucide-react";

interface CheckinRecordsTableProps {
	data: CheckInSummary[];
	isLoading?: boolean;
	onEdit?: (record: CheckInSummary) => void;
	onDelete?: (record: CheckInSummary) => void;
	onBatchDelete?: (records: CheckInSummary[]) => void;
}

export function CheckinRecordsTable({
	data,
	isLoading,
	onEdit,
	onDelete,
	onBatchDelete,
}: CheckinRecordsTableProps) {
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "date", desc: true },
	]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

	const columns: ColumnDef<CheckInSummary>[] = [
		{
			id: "select",
			header: ({ table }) => (
				<div className="flex items-center justify-center">
					<Checkbox
						checked={table.getIsAllPageRowsSelected()}
						indeterminate={
							!table.getIsAllPageRowsSelected() &&
							table.getIsSomePageRowsSelected()
						}
						onCheckedChange={(value) =>
							table.toggleAllPageRowsSelected(!!value)
						}
						aria-label="选择当前页所有记录"
					/>
				</div>
			),
			cell: ({ row }) => (
				<div className="flex items-center justify-center">
					<Checkbox
						checked={row.getIsSelected()}
						onCheckedChange={(value) => row.toggleSelected(!!value)}
						aria-label="选择记录"
					/>
				</div>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "date",
			header: "日期",
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<Calendar className="h-4 w-4 text-muted-foreground" />
					<span className="font-medium">{row.getValue("date")}</span>
				</div>
			),
		},
		{
			accessorKey: "name",
			header: "姓名",
			cell: ({ row }) => (
				<div className="font-medium">{row.getValue("name")}</div>
			),
		},
		{
			accessorKey: "lotusId",
			header: "莲花斋ID",
			cell: ({ row }) => (
				<div className="font-mono text-sm">{row.getValue("lotusId")}</div>
			),
		},
		{
			accessorKey: "firstCheckIn",
			header: "首次打卡",
			cell: ({ row }) => {
				const time = row.getValue("firstCheckIn") as string;
				return (
					<div className="flex items-center gap-2">
						<Clock className="h-4 w-4 text-muted-foreground" />
						<span className="font-mono text-sm">{time || "-"}</span>
					</div>
				);
			},
		},
		{
			accessorKey: "lastCheckIn",
			header: "最后打卡",
			cell: ({ row }) => {
				const time = row.getValue("lastCheckIn") as string;
				return (
					<div className="flex items-center gap-2">
						<Clock className="h-4 w-4 text-muted-foreground" />
						<span className="font-mono text-sm">{time || "-"}</span>
					</div>
				);
			},
		},
		{
			accessorKey: "totalDays",
			header: "打卡次数",
			cell: ({ row }) => {
				const days = row.getValue("totalDays") as number;
				return (
					<div className="text-center">
						<Badge variant="secondary" className="font-medium">
							{days} 次
						</Badge>
					</div>
				);
			},
		},
		{
			accessorKey: "totalHours",
			header: "工时(小时)",
			cell: ({ row }) => {
				const hours = row.getValue("totalHours") as number;
				return (
					<div className="text-center">
						<span className="font-semibold text-primary text-lg">
							{hours.toFixed(1)}
						</span>
						<span className="text-sm text-muted-foreground ml-1">小时</span>
					</div>
				);
			},
		},
		{
			id: "actions",
			header: "操作",
			cell: ({ row }) => {
				const record = row.original;
				return (
					<div className="flex gap-2">
						{onEdit && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onEdit(record)}
								className="h-8 w-8 p-0"
							>
								<Edit className="h-4 w-4" />
							</Button>
						)}
						{onDelete && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onDelete(record)}
								className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}
					</div>
				);
			},
		},
	];

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			globalFilter,
			rowSelection,
		},
		initialState: {
			pagination: {
				pageSize: 20,
			},
		},
		enableRowSelection: true,
	});

	if (isLoading) {
		return <div className="p-8 text-center text-gray-500">加载中...</div>;
	}

	if (data.length === 0) {
		return <div className="p-8 text-center text-gray-500">暂无数据</div>;
	}

	const selectedRecords = table
		.getSelectedRowModel()
		.flatRows.map((row) => row.original as CheckInSummary);

	return (
		<div className="space-y-4">
			{/* 搜索与批量操作 - 优化后的设计 */}
			<div className="flex items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="搜索姓名或ID..."
						value={globalFilter ?? ""}
						onChange={(e) => setGlobalFilter(e.target.value)}
						className="pl-10"
					/>
				</div>
				<div className="flex items-center gap-4">
					<div className="text-sm text-muted-foreground">
						共 <span className="font-semibold text-foreground">{table.getFilteredRowModel().rows.length}</span> 条记录
					</div>
					{onBatchDelete && (
						<Button
							variant="outline"
							size="sm"
							disabled={selectedRecords.length === 0}
							onClick={() => {
								if (selectedRecords.length === 0) return;
								onBatchDelete(selectedRecords);
							}}
							className={selectedRecords.length > 0 ? "border-destructive text-destructive hover:bg-destructive/10" : ""}
						>
							<Trash2 className="h-4 w-4 mr-2" />
							批量删除
							{selectedRecords.length > 0 && (
								<Badge variant="destructive" className="ml-2">
									{selectedRecords.length}
								</Badge>
							)}
						</Button>
					)}
				</div>
			</div>

			{/* 表格 - 使用 shadcn/ui Table 组件 */}
			<div className="rounded-lg border overflow-hidden">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="bg-muted/50">
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										className={
											header.column.getCanSort()
												? "cursor-pointer select-none hover:bg-muted/70 transition-colors"
												: ""
										}
										onClick={header.column.getToggleSortingHandler()}
									>
										{header.isPlaceholder ? null : (
											<div className="flex items-center gap-2">
												{flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
												{{
													asc: " ↑",
													desc: " ↓",
												}[header.column.getIsSorted() as string] ?? null}
											</div>
										)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center text-muted-foreground"
								>
									暂无数据
								</TableCell>
							</TableRow>
						) : (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									className="hover:bg-muted/30 transition-colors"
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* 分页 - 优化后的设计 */}
			{table.getPageCount() > 1 && (
				<div className="flex items-center justify-between border-t pt-4">
					<div className="text-sm text-muted-foreground">
						第 <span className="font-semibold text-foreground">{table.getState().pagination.pageIndex + 1}</span> /{" "}
						<span className="font-semibold text-foreground">{table.getPageCount()}</span> 页
					</div>
					<div className="flex gap-2">
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
						<div className="flex items-center gap-1 px-3 text-sm">
							<span>第</span>
							<Input
								type="number"
								min={1}
								max={table.getPageCount()}
								value={table.getState().pagination.pageIndex + 1}
								onChange={(e) => {
									const page = parseInt(e.target.value);
									if (page >= 1 && page <= table.getPageCount()) {
										table.setPageIndex(page - 1);
									}
								}}
								className="w-16 h-8 text-center"
							/>
							<span>页</span>
						</div>
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
			)}
		</div>
	);
}
