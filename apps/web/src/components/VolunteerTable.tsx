import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import type { Volunteer } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface VolunteerTableProps {
	data: Volunteer[];
	isLoading?: boolean;
	onEdit?: (volunteer: Volunteer) => void;
	onView?: (volunteer: Volunteer) => void;
	onDelete?: (volunteer: Volunteer) => void;
}

export function VolunteerTable({
	data,
	isLoading,
	onEdit,
	onView,
	onDelete,
}: VolunteerTableProps) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = useState("");

	const columns: ColumnDef<Volunteer>[] = [
		{
			accessorKey: "lotusId",
			header: "莲花斋ID",
			cell: ({ row }) => (
				<div className="font-medium">{row.getValue("lotusId")}</div>
			),
		},
		{
			accessorKey: "name",
			header: "姓名",
			cell: ({ row }) => <div>{row.getValue("name")}</div>,
		},
		{
			accessorKey: "gender",
			header: "性别",
			cell: ({ row }) => {
				const gender = row.getValue("gender") as string;
				return (
					<div>
						{gender === "male" ? "男" : gender === "female" ? "女" : "其他"}
					</div>
				);
			},
		},
		{
			accessorKey: "phone",
			header: "手机号",
			cell: ({ row }) => <div>{row.getValue("phone")}</div>,
		},
		{
			accessorKey: "volunteerStatus",
			header: "状态",
			cell: ({ row }) => {
				const status = row.getValue("volunteerStatus") as string;
				const statusMap: Record<string, { label: string; className: string }> =
					{
						registered: {
							label: "已注册",
							className: "bg-green-100 text-green-800",
						},
						trainee: {
							label: "培训中",
							className: "bg-blue-100 text-blue-800",
						},
						applicant: {
							label: "申请中",
							className: "bg-yellow-100 text-yellow-800",
						},
						inactive: {
							label: "未激活",
							className: "bg-gray-100 text-gray-800",
						},
						suspended: {
							label: "已暂停",
							className: "bg-red-100 text-red-800",
						},
					};
				const statusInfo = statusMap[status] || {
					label: status,
					className: "bg-gray-100 text-gray-800",
				};
				return (
					<span className={`px-2 py-1 rounded text-xs ${statusInfo.className}`}>
						{statusInfo.label}
					</span>
				);
			},
		},
		{
			accessorKey: "lotusRole",
			header: "角色",
			cell: ({ row }) => {
				const role = row.getValue("lotusRole") as string;
				return <div>{role === "admin" ? "管理员" : "义工"}</div>;
			},
		},
		{
			accessorKey: "createdAt",
			header: "创建时间",
			cell: ({ row }) => {
				const date = row.getValue("createdAt") as string;
				return <div>{date ? new Date(date).toLocaleDateString() : "-"}</div>;
			},
		},
		{
			id: "actions",
			header: "操作",
			cell: ({ row }) => {
				const volunteer = row.original;
				return (
					<div className="flex gap-2">
						{onView && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onView(volunteer)}
							>
								查看
							</Button>
						)}
						{onEdit && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onEdit(volunteer)}
							>
								编辑
							</Button>
						)}
						{onDelete && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onDelete(volunteer)}
							>
								删除
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
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		state: {
			sorting,
			columnFilters,
			globalFilter,
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
			{/* 搜索框 */}
			<div className="flex items-center gap-4">
				<Input
					placeholder="搜索所有列..."
					value={globalFilter ?? ""}
					onChange={(e) => setGlobalFilter(e.target.value)}
					className="max-w-sm"
				/>
				<div className="text-sm text-gray-500">
					共 {table.getFilteredRowModel().rows.length} 条记录
				</div>
			</div>

			{/* 表格 */}
			<div className="rounded-md border">
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

			{/* 分页控制 */}
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
