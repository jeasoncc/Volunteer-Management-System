import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { Dialog } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { VolunteerForm } from "../components/VolunteerForm";
import { VolunteerDataTable } from "../components/VolunteerDataTable";
import { useAuth } from "../hooks/useAuth";
import { volunteerService } from "../services/volunteer";
import { approvalService } from "../services/approval";
import type { Volunteer } from "../types";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

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
			alert("创建成功！");
		},
		onError: (error: any) => {
			alert(error.message || "创建失败");
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
			alert("更新成功！");
		},
		onError: (error: any) => {
			alert(error.message || "更新失败");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: volunteerService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			alert("删除成功！");
		},
		onError: (error: any) => {
			alert(error.message || "删除失败");
		},
	});

	const batchDeleteMutation = useMutation({
		mutationFn: volunteerService.batchDelete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			setSelectedVolunteers([]);
			alert("批量删除成功！");
		},
		onError: (error: any) => {
			alert(error.message || "批量删除失败");
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
		onSuccess: (result, variables) => {
			queryClient.invalidateQueries({ queryKey: ["approval", "pending"] });
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			queryClient.invalidateQueries({ queryKey: ["approval", "pending", "count"] });
			setApprovalDialog({ open: false });
			setApprovalNotes("");
			const actionText = variables.action === "approve" ? "通过" : "拒绝";
			alert(`审批${actionText}成功！`);
		},
		onError: (error: any) => {
			console.error("审批失败:", error);
			const message =
				error?.response?.data?.message || error?.message || "审批失败";
			alert(`审批失败: ${message}`);
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
		onSuccess: (result, variables) => {
			queryClient.invalidateQueries({ queryKey: ["approval", "pending"] });
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			queryClient.invalidateQueries({ queryKey: ["approval", "pending", "count"] });
			setSelectedVolunteers([]);
			setApprovalNotes("");
			const actionText = variables.action === "approve" ? "通过" : "拒绝";
			const count = variables.lotusIds.length;
			alert(`批量审批${actionText}成功！共处理 ${count} 个申请`);
		},
		onError: (error: any) => {
			console.error("批量审批失败:", error);
			const message =
				error?.response?.data?.message || error?.message || "批量审批失败";
			alert(`批量审批失败: ${message}`);
		},
	});

	if (authLoading) {
		return (
			<DashboardLayout breadcrumbs={[{ label: "首页", href: "/" }, { label: "义工管理" }]}>
				<div className="flex items-center justify-center h-64">
					<div className="text-muted-foreground">加载中...</div>
				</div>
			</DashboardLayout>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	const volunteers = Array.isArray(data?.data) ? data.data : [];
	const pendingVolunteers = Array.isArray(pendingData?.data)
		? pendingData.data
		: [];
	const pendingCount = pendingData?.data?.total || 0;

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

				{/* 标签页 */}
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList>
						<TabsTrigger value="all">
							全部义工
							<Badge variant="secondary" className="ml-2">
								{volunteers.length}
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
								共 {volunteers.length} 个义工
							</div>
							{selectedVolunteers.length > 0 && (
								<Button
									variant="destructive"
									size="sm"
									onClick={handleBatchDelete}
									disabled={batchDeleteMutation.isPending}
								>
									{batchDeleteMutation.isPending
										? "删除中..."
										: `批量删除 (${selectedVolunteers.length})`}
								</Button>
							)}
						</div>

						<div className="bg-card rounded-lg border p-6">
							<VolunteerDataTable
								data={volunteers}
								isLoading={isLoading}
								onView={handleView}
								onEdit={handleEdit}
								onDelete={handleDelete}
								enableSelection={true}
								onSelectionChange={handleSelectionChange}
							/>
						</div>
					</TabsContent>

					{/* 待审批标签页 */}
					<TabsContent value="pending" className="space-y-4">
						<div className="flex justify-between items-center">
							<div className="flex items-center gap-2">
								<AlertCircle className="h-5 w-5 text-orange-500" />
								<span className="text-sm text-muted-foreground">
									共 {pendingCount} 个待审批申请
								</span>
							</div>
							{selectedVolunteers.length > 0 && (
								<div className="flex gap-2">
									<Button
										variant="default"
										size="sm"
										onClick={handleBatchApprove}
										disabled={batchApproveMutation.isPending}
									>
										<CheckCircle className="h-4 w-4 mr-2" />
										批量通过 ({selectedVolunteers.length})
									</Button>
									<Button
										variant="destructive"
										size="sm"
										onClick={handleBatchReject}
										disabled={batchApproveMutation.isPending}
									>
										<XCircle className="h-4 w-4 mr-2" />
										批量拒绝 ({selectedVolunteers.length})
									</Button>
								</div>
							)}
						</div>

						<div className="bg-card rounded-lg border p-6">
							<VolunteerDataTable
								data={pendingVolunteers}
								isLoading={pendingLoading}
								onView={handleView}
								onApprove={handleApprove}
								onReject={handleReject}
								enableSelection={true}
								onSelectionChange={handleSelectionChange}
								showApprovalActions={true}
							/>
						</div>
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
