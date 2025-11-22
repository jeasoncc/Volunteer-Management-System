import { type ColumnDef } from "@tanstack/react-table";
import type { Volunteer } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { MoreHorizontal, Eye, Pencil, Trash2, CheckCircle, XCircle, Shield, User } from "lucide-react";
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

// 辅助函数：根据名字生成头像颜色
const getAvatarColor = (name: string) => {
	if (!name) return "bg-gray-500";
	const colors = [
		"bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500", 
		"bg-lime-500", "bg-green-500", "bg-emerald-500", "bg-teal-500",
		"bg-cyan-500", "bg-sky-500", "bg-blue-500", "bg-indigo-500", 
		"bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-pink-500", "bg-rose-500"
	];
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}
	const index = Math.abs(hash) % colors.length;
	return colors[index];
};

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
				<div className="flex items-center gap-3 py-1">
					<Avatar className="h-9 w-9 border border-background shadow-sm">
						<AvatarFallback className={`${getAvatarColor(row.original.name)} text-white text-xs font-medium`}>
							{row.original.name.slice(0, 1)}
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-col">
						<span className="font-medium text-sm text-foreground">{row.original.name}</span>
						<span className="text-[10px] text-muted-foreground font-mono">ID: {row.original.lotusId}</span>
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
					registered: { label: "已注册", variant: "outline", className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800" },
					trainee: { label: "培训中", variant: "outline", className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800" },
					applicant: { label: "申请中", variant: "outline", className: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 hover:text-orange-800" },
					inactive: { label: "未激活", variant: "secondary", className: "bg-gray-100 text-gray-600" },
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
						<div className="flex items-center gap-1.5 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full w-fit border border-purple-100">
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
			cell: ({ row }) => (
				<span className="text-sm text-muted-foreground font-mono tracking-tight">
					{row.original.phone || "-"}
				</span>
			),
		},
		{
			accessorKey: "createdAt",
			header: "加入时间",
			cell: ({ row }) => {
				const date = row.getValue("createdAt") as string;
				return (
					<div className="text-xs text-muted-foreground">
						{date ? new Date(date).toLocaleDateString("zh-CN") : "-"}
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
					<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
						<TooltipProvider>
							{onView && (
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-muted-foreground hover:text-primary"
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
											size="icon"
											className="h-8 w-8 text-muted-foreground hover:text-blue-600"
											onClick={() => onEdit(volunteer)}
										>
											<Pencil className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>编辑</TooltipContent>
								</Tooltip>
							)}
							{onDelete && (
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-muted-foreground hover:text-destructive"
											onClick={() => onDelete(volunteer)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>删除</TooltipContent>
								</Tooltip>
							)}
						</TooltipProvider>
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
