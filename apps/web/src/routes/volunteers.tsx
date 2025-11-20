import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { VolunteerForm } from "@/components/VolunteerForm";
import { VolunteerDataTable } from "@/components/VolunteerDataTable";
import { AdvancedFilter, type ActiveFilter } from "@/components/AdvancedFilter";
import { BatchActionBar } from "@/components/BatchActionBar";
import { useAuth } from "@/hooks/useAuth";
import { volunteerService } from "@/services/volunteer";
import { approvalService } from "@/services/approval";
import type { Volunteer } from "@/types";
import { CheckCircle, XCircle, AlertCircle, Trash2, Download } from "lucide-react";
import { toast } from "@/lib/toast";
import { exportToExcel, formatDateTime, type ExportColumn } from "@/lib/export";

export const Route = createFileRoute("/volunteers")({
	component: VolunteersPage,
} as any);

function VolunteersPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("all");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingVolunteer, setEditingVolunteer] = useState<
		Volunteer | undefined
	>();
	const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]);
	const [approvalDialog, setApprovalDialog] = useState<{
		open: boolean;
		volunteer?: Volunteer;
		action?: "approve" | "reject";
	}>({ open: false });
	const [approvalNotes, setApprovalNotes] = useState("");
	const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

	// 获取所有义工
	const { data, isLoading } = useQuery({
		queryKey: ["volunteers"],
		queryFn: () => volunteerService.getList({ page: 1, pageSize: 100 }), // 后端限制最大 100
		enabled: isAuthenticated,
	});

	// 获取待审批义工
	const { data: pendingData, isLoading: pendingLoading } = useQuery({
		queryKey: ["approval", "pending"],
		queryFn: () => approvalService.getPendingList({ page: 1, pageSize: 100 }),
		enabled: isAuthenticated,
	});

	const createMutation = useMutation({
		mutationFn: volunteerService.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			setIsDialogOpen(false);
			toast.success("创建成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "创建失败");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({
			lotusId,
			data,
		}: {
			lotusId: string;
			data: Partial<Volunteer>;
		}) => volunteerService.update(lotusId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			setIsDialogOpen(false);
			setEditingVolunteer(undefined);
			toast.success("更新成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "更新失败");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: volunteerService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			toast.success("删除成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "删除失败");
		},
	});

	const batchDeleteMutation = useMutation({
		mutationFn: volunteerService.batchDelete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			setSelectedVolunteers([]);
			toast.success("批量删除成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "批量删除失败");
		},
	});

	// 审批 mutation
	const approveMutation = useMutation({
		mutationFn: ({
			lotusId,
			action,
			notes,
		}: {
			lotusId: string;
			action: "approve" | "reject";
			notes?: string;
		}) => approvalService.approve(lotusId, { action, notes }),
		onSuccess: (_result, variables) => {
			queryClient.invalidateQueries({ queryKey: ["approval", "pending"] });
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			queryClient.invalidateQueries({ queryKey: ["approval", "pending", "count"] });
			setApprovalDialog({ open: false });
			setApprovalNotes("");
			const actionText = variables.action === "approve" ? "通过" : "拒绝";
			toast.success(`审批${actionText}成功！`);
		},
		onError: (error: any) => {
			console.error("审批失败:", error);
			const message =
				error?.response?.data?.message || error?.message || "审批失败";
			toast.error(`审批失败: ${message}`);
		},
	});

	// 批量审批 mutation
	const batchApproveMutation = useMutation({
		mutationFn: ({
			lotusIds,
			action,
			notes,
		}: {
			lotusIds: string[];
			action: "approve" | "reject";
			notes?: string;
		}) => approvalService.batchApprove({ lotusIds, action, notes }),
		onSuccess: (_result, variables) => {
			queryClient.invalidateQueries({ queryKey: ["approval", "pending"] });
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			queryClient.invalidateQueries({ queryKey: ["approval", "pending", "count"] });
			setSelectedVolunteers([]);
			setApprovalNotes("");
			const actionText = variables.action === "approve" ? "通过" : "拒绝";
			const count = variables.lotusIds.length;
			toast.success(`批量审批${actionText}成功！共处理 ${count} 个申请`);
		},
		onError: (error: any) => {
			console.error("批量审批失败:", error);
			const message =
				error?.response?.data?.message || error?.message || "批量审批失败";
			toast.error(`批量审批失败: ${message}`);
		},
	});

	// 准备数据（在条件渲染之前）
	const volunteers = Array.isArray(data?.data) ? data.data : [];
	const pendingVolunteers = Array.isArray(pendingData?.data)
		? pendingData.data
		: [];
	const pendingCount = pendingData?.data?.total || 0;

	// 筛选配置
	const filterOptions = [
		{
			id: "volunteerStatus",
			label: "状态",
			options: [
				{ value: "registered", label: "已注册" },
				{ value: "trainee", label: "培训中" },
				{ value: "applicant", label: "申请中" },
				{ value: "inactive", label: "未激活" },
				{ value: "suspended", label: "已暂停" },
			],
		},
		{
			id: "lotusRole",
			label: "角色",
			options: [
				{ value: "admin", label: "管理员" },
				{ value: "volunteer", label: "义工" },
			],
		},
		{
			id: "gender",
			label: "性别",
			options: [
				{ value: "male", label: "男" },
				{ value: "female", label: "女" },
				{ value: "other", label: "其他" },
			],
		},
	];

	// 应用筛选（useMemo 必须在条件渲染之前）
	const filteredVolunteers = useMemo(() => {
		if (activeFilters.length === 0) return volunteers;

		return volunteers.filter((volunteer) => {
			return activeFilters.every((filter) => {
				if (filter.values.length === 0) return true;
				const value = volunteer[filter.id as keyof Volunteer];
				return filter.values.includes(String(value));
			});
		});
	}, [volunteers, activeFilters]);

	const filteredPendingVolunteers = useMemo(() => {
		if (activeFilters.length === 0) return pendingVolunteers;

		return pendingVolunteers.filter((volunteer) => {
			return activeFilters.every((filter) => {
				if (filter.values.length === 0) return true;
				const value = volunteer[filter.id as keyof Volunteer];
				return filter.values.includes(String(value));
			});
		});
	}, [pendingVolunteers, activeFilters]);

	// 条件渲染必须在所有 hooks 之后
	if (authLoading) {
		return (
			<DashboardLayout breadcrumbs={[{ label: "首页", href: "/" }, { label: "义工管理" }]}>
				<div className="space-y-6">
					{/* Skeleton 加载状态 */}
					<div className="flex justify-between items-center">
						<div className="h-10 bg-muted rounded-md w-1/3 animate-pulse" />
						<div className="h-10 bg-muted rounded-md w-24 animate-pulse" />
					</div>
					<div className="h-96 bg-muted rounded-lg animate-pulse" />
				</div>
			</DashboardLayout>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	const handleView = (volunteer: Volunteer) => {
		alert(
			`查看义工详情功能待实现

姓名: ${volunteer.name}
ID: ${volunteer.lotusId}
手机: ${volunteer.phone}`,
		);
		// TODO: 导航到详情页面
	};

	const handleEdit = (volunteer: Volunteer) => {
		setEditingVolunteer(volunteer);
		setIsDialogOpen(true);
	};

	const handleDelete = (volunteer: Volunteer) => {
		if (confirm(`确定要删除义工 ${volunteer.name} 吗？此操作不可恢复。`)) {
			deleteMutation.mutate(volunteer.lotusId);
		}
	};

	const handleAdd = () => {
		setEditingVolunteer(undefined);
		setIsDialogOpen(true);
	};

	const handleFormSubmit = async (data: Partial<Volunteer>) => {
		if (editingVolunteer) {
			await updateMutation.mutateAsync({
				lotusId: editingVolunteer.lotusId,
				data,
			});
		} else {
			await createMutation.mutateAsync(data as any);
		}
	};

	const handleDialogClose = () => {
		setIsDialogOpen(false);
		setEditingVolunteer(undefined);
	};

	const handleBatchDelete = () => {
		if (selectedVolunteers.length === 0) {
			alert("请选择要删除的义工");
			return;
		}

		if (confirm(`确定要删除选中的 ${selectedVolunteers.length} 个义工吗？此操作不可恢复。`)) {
			batchDeleteMutation.mutate(selectedVolunteers);
		}
	};

	const handleSelectionChange = (lotusIds: string[]) => {
		setSelectedVolunteers(lotusIds);
	};

	const handleFilterChange = (filterId: string, values: string[]) => {
		setActiveFilters((prev) => {
			const existing = prev.find((f) => f.id === filterId);
			if (values.length === 0) {
				return prev.filter((f) => f.id !== filterId);
			}

			const filter = filterOptions.find((f) => f.id === filterId);
			if (!filter) return prev;

			const valueLabels = values.map(
				(v) => filter.options.find((o) => o.value === v)?.label || v,
			);

			const newFilter: ActiveFilter = {
				id: filterId,
				label: filter.label,
				values,
				valueLabels,
			};

			if (existing) {
				return prev.map((f) => (f.id === filterId ? newFilter : f));
			}
			return [...prev, newFilter];
		});
	};

	const handleClearAllFilters = () => {
		setActiveFilters([]);
	};

	const handleSelectAll = () => {
		const currentData = activeTab === "all" ? filteredVolunteers : filteredPendingVolunteers;
		setSelectedVolunteers(currentData.map((v) => v.lotusId));
	};

	const handleClearSelection = () => {
		setSelectedVolunteers([]);
	};

	// 审批相关处理函数
	const handleApprove = (volunteer: Volunteer) => {
		setApprovalDialog({
			open: true,
			volunteer,
			action: "approve",
		});
	};

	const handleReject = (volunteer: Volunteer) => {
		setApprovalDialog({
			open: true,
			volunteer,
			action: "reject",
		});
	};

	const handleApprovalSubmit = () => {
		if (!approvalDialog.volunteer || !approvalDialog.action) return;

		approveMutation.mutate({
			lotusId: approvalDialog.volunteer.lotusId,
			action: approvalDialog.action,
			notes: approvalNotes,
		});
	};

	const handleBatchApprove = () => {
		if (selectedVolunteers.length === 0) {
			alert("请选择要审批的义工");
			return;
		}

		if (
			confirm(
				`确定要批量通过选中的 ${selectedVolunteers.length} 个义工申请吗？`,
			)
		) {
			batchApproveMutation.mutate({
				lotusIds: selectedVolunteers,
				action: "approve",
				notes: approvalNotes,
			});
		}
	};

	const handleBatchReject = () => {
		if (selectedVolunteers.length === 0) {
			alert("请选择要审批的义工");
			return;
		}

		if (
			confirm(
				`确定要批量拒绝选中的 ${selectedVolunteers.length} 个义工申请吗？`,
			)
		) {
			batchApproveMutation.mutate({
				lotusIds: selectedVolunteers,
				action: "reject",
				notes: approvalNotes,
			});
		}
	};

	return (
		<DashboardLayout
			breadcrumbs={[{ label: "首页", href: "/" }, { label: "义工管理" }]}
		>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold">义工管理</h1>
					<div className="flex gap-2">
						<Button onClick={handleAdd}>添加义工</Button>
					</div>
				</div>

				{/* 高级筛选 */}
				<AdvancedFilter
					filters={filterOptions}
					activeFilters={activeFilters}
					onFilterChange={handleFilterChange}
					onClearAll={handleClearAllFilters}
				/>

				{/* 标签页 */}
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList>
						<TabsTrigger value="all">
							全部义工
							<Badge variant="secondary" className="ml-2">
								{filteredVolunteers.length}
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="pending">
							<div className="flex items-center gap-2">
								待审批
								{pendingCount > 0 && (
									<Badge variant="destructive">{pendingCount}</Badge>
								)}
							</div>
						</TabsTrigger>
					</TabsList>

					{/* 全部义工标签页 */}
					<TabsContent value="all" className="space-y-4">
						<div className="flex justify-between items-center">
							<div className="text-sm text-muted-foreground">
								{activeFilters.length > 0 ? (
									<>
										筛选结果：{filteredVolunteers.length} / {volunteers.length} 个义工
									</>
								) : (
									<>共 {volunteers.length} 个义工</>
								)}
							</div>
						</div>

						<div className="bg-card rounded-lg border p-6">
							<VolunteerDataTable
								data={filteredVolunteers}
								isLoading={isLoading}
								onView={handleView}
								onEdit={handleEdit}
								onDelete={handleDelete}
								enableSelection={true}
								onSelectionChange={handleSelectionChange}
							/>
						</div>

						{/* 批量操作栏 */}
						<BatchActionBar
							selectedCount={selectedVolunteers.length}
							totalCount={filteredVolunteers.length}
							onClearSelection={handleClearSelection}
							onSelectAll={handleSelectAll}
							actions={[
								{
									label: "导出选中",
									icon: <Download className="h-4 w-4 mr-1" />,
									variant: "secondary",
									onClick: () => {
										const selectedData = filteredVolunteers.filter((v) =>
											selectedVolunteers.includes(v.lotusId),
										);
										const columns: ExportColumn[] = [
											{ key: "lotusId", label: "莲花斋ID" },
											{ key: "name", label: "姓名" },
											{
												key: "gender",
												label: "性别",
												format: (v) =>
													v === "male" ? "男" : v === "female" ? "女" : "其他",
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
										exportToExcel({
											filename: "选中义工",
											sheetName: "义工列表",
											columns,
											data: selectedData,
										});
										toast.success(`已导出 ${selectedData.length} 条记录`);
									},
								},
								{
									label: "批量删除",
									icon: <Trash2 className="h-4 w-4 mr-1" />,
									variant: "destructive",
									onClick: handleBatchDelete,
									disabled: batchDeleteMutation.isPending,
								},
							]}
						/>
					</TabsContent>

					{/* 待审批标签页 */}
					<TabsContent value="pending" className="space-y-4">
						<div className="flex justify-between items-center">
							<div className="flex items-center gap-2">
								<AlertCircle className="h-5 w-5 text-orange-500" />
								<span className="text-sm text-muted-foreground">
									{activeFilters.length > 0 ? (
										<>
											筛选结果：{filteredPendingVolunteers.length} / {pendingCount} 个待审批申请
										</>
									) : (
										<>共 {pendingCount} 个待审批申请</>
									)}
								</span>
							</div>
						</div>

						<div className="bg-card rounded-lg border p-6">
							<VolunteerDataTable
								data={filteredPendingVolunteers}
								isLoading={pendingLoading}
								onView={handleView}
								onApprove={handleApprove}
								onReject={handleReject}
								enableSelection={true}
								onSelectionChange={handleSelectionChange}
								showApprovalActions={true}
							/>
						</div>

						{/* 批量操作栏 */}
						<BatchActionBar
							selectedCount={selectedVolunteers.length}
							totalCount={filteredPendingVolunteers.length}
							onClearSelection={handleClearSelection}
							onSelectAll={handleSelectAll}
							actions={[
								{
									label: "批量通过",
									icon: <CheckCircle className="h-4 w-4 mr-1" />,
									variant: "default",
									onClick: handleBatchApprove,
									disabled: batchApproveMutation.isPending,
								},
								{
									label: "批量拒绝",
									icon: <XCircle className="h-4 w-4 mr-1" />,
									variant: "destructive",
									onClick: handleBatchReject,
									disabled: batchApproveMutation.isPending,
								},
								{
									label: "导出选中",
									icon: <Download className="h-4 w-4 mr-1" />,
									variant: "secondary",
									onClick: () => {
										const selectedData = filteredPendingVolunteers.filter((v) =>
											selectedVolunteers.includes(v.lotusId),
										);
										const columns: ExportColumn[] = [
											{ key: "lotusId", label: "莲花斋ID" },
											{ key: "name", label: "姓名" },
											{
												key: "gender",
												label: "性别",
												format: (v) =>
													v === "male" ? "男" : v === "female" ? "女" : "其他",
											},
											{ key: "phone", label: "手机号" },
											{ key: "email", label: "邮箱" },
											{ key: "createdAt", label: "申请时间", format: formatDateTime },
										];
										exportToExcel({
											filename: "待审批义工",
											sheetName: "待审批",
											columns,
											data: selectedData,
										});
										toast.success(`已导出 ${selectedData.length} 条记录`);
									},
								},
							]}
						/>
					</TabsContent>
				</Tabs>

				{/* 添加/编辑对话框 */}
				<Dialog
					open={isDialogOpen}
					onClose={handleDialogClose}
					title={editingVolunteer ? "编辑义工" : "添加义工"}
					maxWidth="lg"
				>
					<VolunteerForm
						volunteer={editingVolunteer}
						onSubmit={handleFormSubmit}
						onCancel={handleDialogClose}
					/>
				</Dialog>

				{/* 审批对话框 */}
				<Dialog
					open={approvalDialog.open}
					onClose={() => {
						setApprovalDialog({ open: false });
						setApprovalNotes("");
					}}
					title={
						approvalDialog.action === "approve" ? "审批通过" : "审批拒绝"
					}
					maxWidth="md"
				>
					<div className="space-y-4">
						<div className="space-y-2">
							<p className="text-sm text-muted-foreground">
								义工信息：
							</p>
							<div className="bg-muted p-4 rounded-lg space-y-1">
								<p>
									<span className="font-medium">姓名：</span>
									{approvalDialog.volunteer?.name}
								</p>
								<p>
									<span className="font-medium">ID：</span>
									{approvalDialog.volunteer?.lotusId}
								</p>
								<p>
									<span className="font-medium">手机：</span>
									{approvalDialog.volunteer?.phone}
								</p>
							</div>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">备注（可选）</label>
							<Textarea
								value={approvalNotes}
								onChange={(e) => setApprovalNotes(e.target.value)}
								placeholder="请输入审批备注..."
								rows={4}
							/>
						</div>

						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								onClick={() => {
									setApprovalDialog({ open: false });
									setApprovalNotes("");
								}}
							>
								取消
							</Button>
							<Button
								variant={
									approvalDialog.action === "approve" ? "default" : "destructive"
								}
								onClick={handleApprovalSubmit}
								disabled={approveMutation.isPending}
							>
								{approveMutation.isPending
									? "处理中..."
									: approvalDialog.action === "approve"
									? "确认通过"
									: "确认拒绝"}
							</Button>
						</div>
					</div>
				</Dialog>
			</div>
		</DashboardLayout>
	);
}
