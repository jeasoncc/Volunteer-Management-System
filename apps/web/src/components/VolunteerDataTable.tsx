import { type ColumnDef } from "@tanstack/react-table";
import type { Volunteer } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil, Trash2, UserCircle, CheckCircle, XCircle } from "lucide-react";

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
				<div className="font-mono font-medium">{row.getValue("lotusId")}</div>
			),
		},
		{
			accessorKey: "name",
			header: "姓名",
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<UserCircle className="h-4 w-4 text-muted-foreground" />
					<span className="font-medium">{row.getValue("name")}</span>
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
			accessorKey: "phone",
			header: "手机号",
			cell: ({ row }) => (
				<div className="font-mono text-sm">{row.getValue("phone")}</div>
			),
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
					<div className="text-sm text-muted-foreground">
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
				
				// 如果显示审批操作，使用简化的按钮组
				if (showApprovalActions) {
					return (
						<div className="flex gap-2">
							{onApprove && (
								<Button
									variant="default"
									size="sm"
									onClick={() => onApprove(volunteer)}
								>
									<CheckCircle className="h-4 w-4 mr-1" />
									通过
								</Button>
							)}
							{onReject && (
								<Button
									variant="destructive"
									size="sm"
									onClick={() => onReject(volunteer)}
								>
									<XCircle className="h-4 w-4 mr-1" />
									拒绝
								</Button>
							)}
						</div>
					);
				}
				
				// 否则显示下拉菜单
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
									编辑
								</DropdownMenuItem>
							)}
							{onDelete && (
								<>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => onDelete(volunteer)}
										className="text-destructive focus:text-destructive"
									>
										<Trash2 className="mr-2 h-4 w-4" />
										删除
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

	return (
		<DataTable
			columns={columns}
			data={data}
			isLoading={isLoading}
			searchPlaceholder="搜索姓名、ID、手机号..."
			enableExport={true}
			exportFilename="volunteers"
		/>
	);
}
