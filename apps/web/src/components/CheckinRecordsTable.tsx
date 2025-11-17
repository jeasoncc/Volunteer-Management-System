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
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import type { CheckInSummary } from "../types";
import { Edit, Trash2 } from "lucide-react";

interface CheckinRecordsTableProps {
	data: CheckInSummary[];
	isLoading?: boolean;
	onEdit?: (record: CheckInSummary) => void;
	onDelete?: (record: CheckInSummary) => void;
}

export function CheckinRecordsTable({
	data,
	isLoading,
	onEdit,
	onDelete,
}: CheckinRecordsTableProps) {
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "date", desc: true },
	]);
	const [globalFilter, setGlobalFilter] = useState("");

	const columns: ColumnDef<CheckInSummary>[] = [
		{
			accessorKey: "date",
			header: "日期",
			cell: ({ row }) => (
				<div className="font-medium">{row.getValue("date")}</div>
			),
		},
		{
			accessorKey: "lotusId",
			header: "莲花斋ID",
			cell: ({ row }) => <div>{row.getValue("lotusId")}</div>,
		},
		{
			accessorKey: "name",
			header: "姓名",
			cell: ({ row }) => <div>{row.getValue("name")}</div>,
		},
		{
			accessorKey: "firstCheckIn",
			header: "首次打卡",
			cell: ({ row }) => (
				<div className="text-sm">{row.getValue("firstCheckIn") || "-"}</div>
			),
		},
		{
			accessorKey: "lastCheckIn",
			header: "最后打卡",
			cell: ({ row }) => (
				<div className="text-sm">{row.getValue("lastCheckIn") || "-"}</div>
			),
		},
		{
			accessorKey: "totalDays",
			header: "打卡次数",
			cell: ({ row }) => (
				<div className="text-center">
					<span className="font-medium">{row.getValue("totalDays")}</span>
				</div>
			),
		},
		{
			accessorKey: "totalHours",
			header: "工时(小时)",
			cell: ({ row }) => (
				<div className="text-center">
					<span className="font-medium text-blue-600">
						{row.getValue("totalHours")}
					</span>
				</div>
			),
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
		state: {
			sorting,
			globalFilter,
		},
		initialState: {
			pagination: {
				pageSize: 20,
			},
		},
	});

	if (isLoading) {
		return <div className="p-8 text-center text-gray-500">加载中...</div>;
	}

	if (data.length === 0) {
		return <div className="p-8 text-center text-gray-500">暂无数据</div>;
	}

	return (
		<div className="space-y-4">
			{/* 搜索 */}
			<div className="flex items-center justify-between">
				<Input
					placeholder="搜索姓名或ID..."
					value={globalFilter ?? ""}
					onChange={(e) => setGlobalFilter(e.target.value)}
					className="max-w-sm"
				/>
				<div className="text-sm text-gray-500">
					共 {table.getFilteredRowModel().rows.length} 条记录
				</div>
			</div>

			{/* 表格 */}
			<div className="rounded-md border bg-white">
				<table className="w-full">
					<thead className="bg-gray-50">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className="px-4 py-3 text-left text-sm font-medium text-gray-700"
									>
										{header.isPlaceholder ? null : (
											<div
												className={
													header.column.getCanSort()
														? "cursor-pointer select-none"
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
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.map((row) => (
							<tr key={row.id} className="border-t hover:bg-gray-50">
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id} className="px-4 py-3 text-sm">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* 分页 */}
			<div className="flex items-center justify-between">
				<div className="text-sm text-gray-700">
					第 {table.getState().pagination.pageIndex + 1} /{" "}
					{table.getPageCount()} 页
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
	);
}
