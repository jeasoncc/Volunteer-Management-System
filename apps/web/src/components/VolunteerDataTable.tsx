import { type ColumnDef } from "@tanstack/react-table";
import type { Volunteer } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil, Trash2, CheckCircle, XCircle, Shield, User, Copy } from "lucide-react";
import { exportToExcel, exportToCSV, exportToTXT, exportToMarkdown, formatDateTime, type ExportColumn } from "@/lib/export";
import { toast } from "@/lib/toast";

interface VolunteerDataTableProps {
	data: Volunteer[];
	exportData?: Volunteer[]; // 用于导出的完整数据（可选，默认使用data）
	isLoading?: boolean;
	onEdit?: (volunteer: Volunteer) => void;
	onView?: (volunteer: Volunteer) => void;
	onDelete?: (volunteer: Volunteer) => void;
	onPromote?: (volunteer: Volunteer, newRole: "admin" | "volunteer") => void;
	onApprove?: (volunteer: Volunteer) => void;
	onReject?: (volunteer: Volunteer) => void;
	enableSelection?: boolean;
	onSelectionChange?: (lotusIds: string[]) => void;
	showApprovalActions?: boolean;
	showRoleManagement?: boolean; // 是否显示角色管理功能（仅超级管理员）
	emptyState?: React.ReactNode;
	noResultsState?: React.ReactNode;
	pagination?: {
		pageIndex: number;
		pageSize: number;
		pageSizeOptions?: number[];
		pageCount: number;
		total?: number;
		onPageChange: (page: number) => void;
		onPageSizeChange: (size: number) => void;
};
}

export function VolunteerDataTable({
	data,
	exportData,
	isLoading,
	onEdit,
	onView,
	onDelete,
	onPromote,
	onApprove,
	onReject,
	enableSelection = false,
	onSelectionChange,
	showApprovalActions = false,
	showRoleManagement = false,
	emptyState,
	noResultsState,
	pagination,
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
								className="translate-y-[2px]"
							/>
						),
						cell: ({ row }: any) => (
							<Checkbox
								checked={row.getIsSelected()}
								onCheckedChange={(value) => row.toggleSelected(!!value)}
								aria-label="选择行"
								className="translate-y-[2px]"
							/>
						),
						enableSorting: false,
						enableHiding: false,
					} as ColumnDef<Volunteer>,
			  ]
			: []),
		{
			accessorKey: "name",
			header: "义工信息",
			cell: ({ row }) => (
				<div className="flex items-center gap-3 py-1 group">
					<Avatar className="h-9 w-9 border border-primary/20 shadow-sm transition-transform group-hover:scale-105">
						<AvatarImage src={row.original.avatar} />
						<AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
							{row.original.name.slice(0, 1)}
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-col gap-0.5">
						<span className="font-serif font-medium text-sm text-foreground tracking-wide">{row.original.name}</span>
						<div 
							className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono cursor-pointer hover:text-primary transition-colors"
							onClick={(e) => {
								e.stopPropagation();
								navigator.clipboard.writeText(row.original.lotusId);
								toast.success("ID已复制");
							}}
							title="点击复制ID"
						>
							<span>{row.original.lotusId}</span>
							<Copy className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
						</div>
					</div>
				</div>
			),
		},
		{
			accessorKey: "volunteerStatus",
			header: "状态",
			cell: ({ row }) => {
				const status = row.getValue("volunteerStatus") as string;
				const statusConfig: Record<
					string,
					{ label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
				> = {
					registered: { label: "已注册", variant: "outline", className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900" },
					trainee: { label: "培训中", variant: "outline", className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900" },
					applicant: { label: "申请中", variant: "outline", className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900" },
					inactive: { label: "未激活", variant: "secondary", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
					suspended: { label: "已暂停", variant: "destructive", className: "" },
				};
				const config = statusConfig[status] || {
					label: status,
					variant: "outline" as const,
				};
				return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
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
				if (role === "admin") {
					return (
						<div className="flex items-center gap-1.5 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full w-fit border border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900">
							<Shield className="h-3 w-3" />
							管理员
						</div>
					);
				}
				return (
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-0.5">
						<User className="h-3 w-3" />
						义工
					</div>
				);
			},
		},
		{
			accessorKey: "gender",
			header: "性别",
			cell: ({ row }) => {
				const gender = row.getValue("gender") as string;
				return (
					<span className="text-sm text-muted-foreground">
						{gender === "male" ? "男" : gender === "female" ? "女" : "其他"}
					</span>
				);
			},
		},
		{
			accessorKey: "phone",
			header: "手机号",
			cell: ({ row }) => {
				const phone = row.original.phone;
				if (!phone) return <span className="text-muted-foreground">-</span>;
				// 格式化手机号: 138 1234 5678
				const formatted = phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1 $2 $3");
				return (
				<span className="text-sm text-muted-foreground font-mono tracking-tight">
						{formatted}
				</span>
				);
			},
		},
		{
			accessorKey: "createdAt",
			header: "加入时间",
			cell: ({ row }) => {
				const dateStr = row.getValue("createdAt") as string;
				if (!dateStr) return <span className="text-muted-foreground">-</span>;
				
				const date = new Date(dateStr);
				// 格式化为 YYYY-MM-DD
				const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
				
				return (
					<div className="text-xs text-muted-foreground font-mono">
						{formatted}
					</div>
				);
			},
		},
		{
			id: "actions",
			header: "操作",
			cell: ({ row }) => {
				const volunteer = row.original;
				
				if (showApprovalActions) {
					return (
						<div className="flex gap-2">
							<Button
								variant="default"
								size="sm"
								className="h-7 px-2 bg-green-600 hover:bg-green-700"
								onClick={() => onApprove?.(volunteer)}
							>
								<CheckCircle className="h-3.5 w-3.5 mr-1" />
								通过
							</Button>
							<Button
								variant="destructive"
								size="sm"
								className="h-7 px-2"
								onClick={() => onReject?.(volunteer)}
							>
								<XCircle className="h-3.5 w-3.5 mr-1" />
								拒绝
							</Button>
						</div>
					);
				}
				
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">打开菜单</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>操作</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={() => {
									navigator.clipboard.writeText(volunteer.lotusId);
									toast.success("ID已复制");
								}}
							>
								<Copy className="mr-2 h-4 w-4" />
								复制ID
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							{onView && (
								<DropdownMenuItem onClick={() => onView(volunteer)}>
									<Eye className="mr-2 h-4 w-4" />
									查看详情
								</DropdownMenuItem>
							)}
							{onEdit && (
								<DropdownMenuItem onClick={() => onEdit(volunteer)}>
									<Pencil className="mr-2 h-4 w-4" />
									编辑信息
								</DropdownMenuItem>
							)}
							{onDelete && (
								<DropdownMenuItem onClick={() => onDelete(volunteer)} className="text-destructive focus:text-destructive">
									<Trash2 className="mr-2 h-4 w-4" />
									删除义工
								</DropdownMenuItem>
							)}
							{showRoleManagement && onPromote && volunteer.lotusRole !== "admin" && (
								<>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => onPromote(volunteer, "admin")}>
										<Shield className="mr-2 h-4 w-4" />
										升为管理员
									</DropdownMenuItem>
								</>
							)}
							{showRoleManagement && onPromote && volunteer.lotusRole === "admin" && (
								<>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => onPromote(volunteer, "volunteer")} className="text-orange-600 focus:text-orange-600">
										<User className="mr-2 h-4 w-4" />
										降为义工
									</DropdownMenuItem>
								</>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
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
	const handleExport = (format: "excel" | "csv" | "txt" | "markdown") => {
		// 使用 exportData（全部数据）或 data（当前页数据）
		const dataToExport = exportData || data;
		
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

		switch (format) {
			case "excel":
				exportToExcel({
					filename,
					sheetName: filename,
					columns: exportColumns,
					data: dataToExport,
				});
				break;
			case "csv":
				exportToCSV({
					filename,
					columns: exportColumns,
					data: dataToExport,
				});
				break;
			case "txt":
				exportToTXT({
					filename,
					columns: exportColumns,
					data: dataToExport,
				});
				break;
			case "markdown":
				exportToMarkdown({
					filename,
					columns: exportColumns,
					data: dataToExport,
				});
				break;
		}

		toast.success(`已导出 ${dataToExport.length} 条记录`);
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
			pagination={pagination}
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
