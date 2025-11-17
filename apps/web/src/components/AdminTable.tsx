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

interface AdminData {
	id: number;
	lotusId: string;
	name: string;
	phone: string;
	email?: string;
	role: "super" | "admin" | "operator";
	department: string;
}

interface AdminTableProps {
	data: AdminData[];
	isLoading?: boolean;
	onView?: (admin: AdminData) => void;
	onEdit?: (admin: AdminData) => void;
	onDelete?: (admin: AdminData) => void;
}

export function AdminTable({
	data,
	isLoading,
	onView,
	onEdit,
	onDelete,
}: AdminTableProps) {
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const [globalFilter, setGlobalFilter] = useState("");

	const columns: ColumnDef<AdminData>[] = [
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
			accessorKey: "role",
			header: "角色",
			cell: ({ row }) => {
				const role = row.getValue("role") as "super" | "admin" | "operator";
				const roleMap: Record<"super" | "admin" | "operator", string> = {
					super: "超级管理员",
					admin: "管理员",
					operator: "操作员",
				};
				return <div>{roleMap[role] || role}</div>;
			},
		},
		{
			accessorKey: "department",
			header: "部门",
			cell: ({ row }) => <div>{row.getValue("department")}</div>,
		},
		{
			accessorKey: "phone",
			header: "手机号",
			cell: ({ row }) => <div>{row.getValue("phone")}</div>,
		},
		{
			id: "actions",
			header: "操作",
			cell: ({ row }) => {
				const admin = row.original;
				return (
					<div className="flex gap-2">
						{onView && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onView(admin)}
							>
								查看
							</Button>
						)}
						{onEdit && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onEdit(admin)}
							>
								编辑
							</Button>
						)}
						{onDelete && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onDelete(admin)}
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
		onGlobalFilterChange: setGlobalFilter,
		state: {
			sorting,
			globalFilter,
		},
		initialState: {
			pagination: {
				pageSize: 10,
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
					placeholder="搜索管理员姓名或ID..."
					value={globalFilter ?? ""}
					onChange={(e) => setGlobalFilter(e.target.value)}
					className="max-w-sm"
				/>
				<div className="text-sm text-gray-500">
					共 {table.getFilteredRowModel().rows.length} 位管理员
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