import { type ColumnDef } from "@tanstack/react-table";
import type { Volunteer } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { exportToExcel, exportToCSV, formatDateTime, type ExportColumn } from "@/lib/export";
import { toast } from "@/lib/toast";

interface VolunteerDataTableProps {
	data: Volunteer[];
	isLoading?: boolean;
	onEdit?: (volunteer: Volunteer) => void;
	onView?: (volunteer: Volunteer) => void;
	onDelete?: (volunteer: Volunteer) => void;
	onApprove?: (volunteer: Volunteer) => void;
	onReject?: (volunteer: Volunteer) => void;
	enableSelection?: boolean;
	onSelectionChange?: (lotusIds: string[]) => void;
	showApprovalActions?: boolean;
	emptyState?: React.ReactNode;
	noResultsState?: React.ReactNode;
}

export function VolunteerDataTable({
	data,
	isLoading,
	onEdit,
	onView,
	onDelete,
	onApprove,
	onReject,
	enableSelection = false,
	onSelectionChange,
	showApprovalActions = false,
	emptyState,
	noResultsState,
}: VolunteerDataTableProps) {
	const columns: ColumnDef<Volunteer>[] = [
		// 选择框列
		...(enableSelection
			? [
					{
						id: "select",
						header: ({ table }: any) => (
							<Checkbox
								checked={table.getIsAllPageRowsSelected()}
								onCheckedChange={(value) =>
									table.toggleAllPageRowsSelected(!!value)
								}
								aria-label="选择全部"
							/>
						),
						cell: ({ row }: any) => (
							<Checkbox
								checked={row.getIsSelected()}
								onCheckedChange={(value) => row.toggleSelected(!!value)}
								aria-label="选择行"
							/>
						),
						enableSorting: false,
						enableHiding: false,
					} as ColumnDef<Volunteer>,
			  ]
			: []),
		{
			accessorKey: "lotusId",
			header: "莲花斋ID",
			cell: ({ row }) => (
				<div className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-mono font-medium text-muted-foreground">
					{row.getValue("lotusId")}
				</div>
			),
		},
		{
			accessorKey: "name",
			header: "姓名",
			cell: ({ row }) => (
				<div className="flex flex-col leading-tight">
					<span className="font-medium text-sm">{row.getValue("name")}</span>
					<span className="text-[11px] text-muted-foreground">
						{row.original.account || row.original.email || ""}
					</span>
				</div>
			),
		},
		{
			accessorKey: "gender",
			header: "性别",
			cell: ({ row }) => {
				const gender = row.getValue("gender") as string;
				return (
					<Badge variant="outline">
						{gender === "male" ? "男" : gender === "female" ? "女" : "其他"}
					</Badge>
				);
			},
		},
		{
			accessorKey: "volunteerId",
			header: "义工号",
			cell: ({ row }) => {
				const volunteerId = row.getValue("volunteerId") as string | undefined;
				return volunteerId ? (
					<div className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-mono font-medium text-primary">
						{volunteerId}
					</div>
				) : (
					<span className="text-xs text-muted-foreground">-</span>
				);
			},
		},
		{
			accessorKey: "volunteerStatus",
			header: "状态",
			cell: ({ row }) => {
				const status = row.getValue("volunteerStatus") as string;
				const statusConfig: Record<
					string,
					{ label: string; variant: "default" | "secondary" | "destructive" | "outline" }
				> = {
					registered: { label: "已注册", variant: "default" },
					trainee: { label: "培训中", variant: "secondary" },
					applicant: { label: "申请中", variant: "outline" },
					inactive: { label: "未激活", variant: "secondary" },
					suspended: { label: "已暂停", variant: "destructive" },
				};
				const config = statusConfig[status] || {
					label: status,
					variant: "outline" as const,
				};
				return <Badge variant={config.variant}>{config.label}</Badge>;
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		},
		{
			accessorKey: "lotusRole",
			header: "角色",
			cell: ({ row }) => {
				const role = row.getValue("lotusRole") as string;
				return (
					<Badge variant={role === "admin" ? "default" : "secondary"}>
						{role === "admin" ? "管理员" : "义工"}
					</Badge>
				);
			},
		},
		{
			accessorKey: "createdAt",
			header: "创建时间",
			cell: ({ row }) => {
				const date = row.getValue("createdAt") as string;
				return (
					<div className="flex flex-col text-xs text-muted-foreground">
						<span>
							{date ? new Date(date).toLocaleDateString("zh-CN") : "-"}
						</span>
						{date && (
							<span className="text-[11px] opacity-80">
								{new Date(date).toLocaleTimeString("zh-CN", {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</span>
						)}
					</div>
				);
			},
		},
		{
			id: "actions",
			header: "操作",
			cell: ({ row }) => {
				const volunteer = row.original;
				
				// 如果显示审批操作，使用简化的按钮组
				if (showApprovalActions) {
					return (
						<div className="flex gap-2">
							{onApprove && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="default"
												size="sm"
												onClick={() => onApprove(volunteer)}
											>
												<CheckCircle className="h-4 w-4 mr-1" />
												通过
											</Button>
										</TooltipTrigger>
										<TooltipContent>批准此义工申请</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)}
							{onReject && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="destructive"
												size="sm"
												onClick={() => onReject(volunteer)}
											>
												<XCircle className="h-4 w-4 mr-1" />
												拒绝
											</Button>
										</TooltipTrigger>
										<TooltipContent>拒绝此义工申请</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)}
						</div>
					);
				}
				
				// 常规操作：直接显示常用按钮
				return (
					<div className="flex items-center gap-1">
						<TooltipProvider>
							{onView && (
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											className="h-8 w-8 p-0"
											onClick={() => onView(volunteer)}
										>
											<Eye className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>查看详情</TooltipContent>
								</Tooltip>
							)}
							{onEdit && (
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											className="h-8 w-8 p-0"
											onClick={() => onEdit(volunteer)}
										>
											<Pencil className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>编辑</TooltipContent>
								</Tooltip>
							)}
						</TooltipProvider>
						
						{/* 更多操作菜单 */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="h-8 w-8 p-0">
									<span className="sr-only">更多操作</span>
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>更多操作</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{onDelete && (
									<DropdownMenuItem
										onClick={() => onDelete(volunteer)}
										className="text-destructive focus:text-destructive"
									>
										<Trash2 className="mr-2 h-4 w-4" />
										删除
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				);
			},
			enableSorting: false,
			enableHiding: false,
		},
	];

	// 列名映射
	const columnLabels: Record<string, string> = {
		lotusId: "莲花斋ID",
		name: "姓名",
		gender: "性别",
		volunteerId: "义工号",
		volunteerStatus: "状态",
		lotusRole: "角色",
		createdAt: "创建时间",
	};

	// 导出处理
	const handleExport = (format: "excel" | "csv") => {
		const exportColumns: ExportColumn[] = [
			{ key: "lotusId", label: "莲花斋ID" },
			{ key: "name", label: "姓名" },
			{
				key: "gender",
				label: "性别",
				format: (v) => (v === "male" ? "男" : v === "female" ? "女" : "其他"),
			},
			{ key: "phone", label: "手机号" },
			{ key: "email", label: "邮箱" },
			{
				key: "volunteerStatus",
				label: "状态",
				format: (v) => {
					const map: Record<string, string> = {
						registered: "已注册",
						trainee: "培训中",
						applicant: "申请中",
						inactive: "未激活",
						suspended: "已暂停",
					};
					return map[v] || v;
				},
			},
			{
				key: "lotusRole",
				label: "角色",
				format: (v) => (v === "admin" ? "管理员" : "义工"),
			},
			{ key: "createdAt", label: "创建时间", format: formatDateTime },
		];

		const filename = showApprovalActions ? "待审批义工" : "义工列表";

		if (format === "excel") {
			exportToExcel({
				filename,
				sheetName: filename,
				columns: exportColumns,
				data,
			});
		} else {
			exportToCSV({
				filename,
				columns: exportColumns,
				data,
			});
		}

		toast.success(`已导出 ${data.length} 条记录`);
	};

	return (
		<DataTable
			columns={columns}
			data={data}
			isLoading={isLoading}
			searchPlaceholder="搜索姓名、ID、手机号..."
			enableExport={true}
			columnLabels={columnLabels}
			onExport={handleExport}
			onSelectionChange={(rows) => {
				if (onSelectionChange) {
					onSelectionChange(rows.map((r) => r.lotusId));
				}
			}}
			emptyState={emptyState}
			noResultsState={noResultsState}
		/>
	);
}
