import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { approvalService } from "@/services/approval";
import type { Volunteer } from "@/types";
import { CheckCircle, XCircle, Clock, User, Phone, Calendar } from "lucide-react";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/approval")({
	component: ApprovalPage,
} as any);

function ApprovalPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const queryClient = useQueryClient();
	const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]);
	const [approvalDialog, setApprovalDialog] = useState<{
		open: boolean;
		volunteer?: Volunteer;
		action?: "approve" | "reject";
		isBatch?: boolean;
	}>({ open: false });
	const [notes, setNotes] = useState("");

	// 获取待审批列表
	const { data, isLoading } = useQuery({
		queryKey: ["approval", "pending"],
		queryFn: () => approvalService.getPendingList({ page: 1, pageSize: 100 }),
		enabled: isAuthenticated,
	});

	// 单个审批
	const approveMutation = useMutation({
		mutationFn: ({ lotusId, action, notes }: { lotusId: string; action: "approve" | "reject"; notes?: string }) =>
			approvalService.approve(lotusId, { action, notes }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["approval"] });
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			setApprovalDialog({ open: false });
			setNotes("");
			toast.success("审批成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "审批失败");
		},
	});

	// 批量审批
	const batchApproveMutation = useMutation({
		mutationFn: ({ lotusIds, action, notes }: { lotusIds: string[]; action: "approve" | "reject"; notes?: string }) =>
			approvalService.batchApprove({ lotusIds, action, notes }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["approval"] });
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			setApprovalDialog({ open: false });
			setSelectedVolunteers([]);
			setNotes("");
			toast.success("批量审批成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "批量审批失败");
		},
	});

	if (authLoading) {
		return (
			<DashboardLayout breadcrumbs={[{ label: "首页", href: "/" }, { label: "义工审批" }]}>
				<div className="space-y-6">
					{/* Skeleton 加载状态 */}
					<div className="space-y-2">
						<div className="h-10 bg-muted rounded-md w-1/3 animate-pulse" />
						<div className="h-6 bg-muted rounded-md w-1/4 animate-pulse" />
					</div>
					<div className="grid gap-4 md:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
						))}
					</div>
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
						))}
					</div>
				</div>
			</DashboardLayout>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	const pendingVolunteers = data?.data || [];
	const total = data?.total || 0;

	const handleApprove = (volunteer: Volunteer) => {
		setApprovalDialog({
			open: true,
			volunteer,
			action: "approve",
			isBatch: false,
		});
	};

	const handleReject = (volunteer: Volunteer) => {
		setApprovalDialog({
			open: true,
			volunteer,
			action: "reject",
			isBatch: false,
		});
	};

	const handleBatchApprove = () => {
		if (selectedVolunteers.length === 0) {
			toast.warning("请选择要审批的义工");
			return;
		}
		setApprovalDialog({
			open: true,
			action: "approve",
			isBatch: true,
		});
	};

	const handleBatchReject = () => {
		if (selectedVolunteers.length === 0) {
			toast.warning("请选择要审批的义工");
			return;
		}
		setApprovalDialog({
			open: true,
			action: "reject",
			isBatch: true,
		});
	};

	const handleConfirmApproval = () => {
		if (approvalDialog.isBatch) {
			batchApproveMutation.mutate({
				lotusIds: selectedVolunteers,
				action: approvalDialog.action!,
				notes,
			});
		} else if (approvalDialog.volunteer) {
			approveMutation.mutate({
				lotusId: approvalDialog.volunteer.lotusId,
				action: approvalDialog.action!,
				notes,
			});
		}
	};

	const toggleSelection = (lotusId: string) => {
		setSelectedVolunteers(prev =>
			prev.includes(lotusId)
				? prev.filter(id => id !== lotusId)
				: [...prev, lotusId]
		);
	};

	const toggleSelectAll = () => {
		if (selectedVolunteers.length === pendingVolunteers.length) {
			setSelectedVolunteers([]);
		} else {
			setSelectedVolunteers(pendingVolunteers.map(v => v.lotusId));
		}
	};

	return (
		<DashboardLayout breadcrumbs={[{ label: "首页", href: "/" }, { label: "义工审批" }]}>
			<div className="space-y-6">
				{/* 头部 */}
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold">义工审批</h1>
						<p className="text-muted-foreground mt-2">
							待审批: {total} 人
						</p>
					</div>
					{selectedVolunteers.length > 0 && (
						<div className="flex gap-2">
							<Button
								variant="default"
								onClick={handleBatchApprove}
								disabled={batchApproveMutation.isPending}
							>
								<CheckCircle className="w-4 h-4 mr-2" />
								批量通过 ({selectedVolunteers.length})
							</Button>
							<Button
								variant="destructive"
								onClick={handleBatchReject}
								disabled={batchApproveMutation.isPending}
							>
								<XCircle className="w-4 h-4 mr-2" />
								批量拒绝 ({selectedVolunteers.length})
							</Button>
						</div>
					)}
				</div>

				{/* 统计卡片 */}
				<div className="grid gap-4 md:grid-cols-3">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">待审批</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{total}</div>
							<p className="text-xs text-muted-foreground mt-1">等待审批的申请</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">已选择</CardTitle>
							<User className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{selectedVolunteers.length}</div>
							<p className="text-xs text-muted-foreground mt-1">已选择的申请</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">今日审批</CardTitle>
							<CheckCircle className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">0</div>
							<p className="text-xs text-muted-foreground mt-1">今天已审批</p>
						</CardContent>
					</Card>
				</div>

				{/* 待审批列表 */}
				<Card>
					<CardHeader>
						<div className="flex justify-between items-center">
							<CardTitle>待审批列表</CardTitle>
							{pendingVolunteers.length > 0 && (
								<Button
									variant="outline"
									size="sm"
									onClick={toggleSelectAll}
								>
									{selectedVolunteers.length === pendingVolunteers.length ? "取消全选" : "全选"}
								</Button>
							)}
						</div>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="text-center py-8 text-muted-foreground">
								加载中...
							</div>
						) : pendingVolunteers.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								暂无待审批的义工申请
							</div>
						) : (
							<div className="space-y-4">
								{pendingVolunteers.map((volunteer) => (
									<div
										key={volunteer.lotusId}
										className={`p-4 border rounded-lg transition-colors ${
											selectedVolunteers.includes(volunteer.lotusId)
												? "border-primary bg-primary/5"
												: "hover:bg-muted/50"
										}`}
									>
										<div className="flex items-start justify-between">
											<div className="flex items-start gap-4 flex-1">
												<input
													type="checkbox"
													checked={selectedVolunteers.includes(volunteer.lotusId)}
													onChange={() => toggleSelection(volunteer.lotusId)}
													className="mt-1"
												/>
												<div className="flex-1">
													<div className="flex items-center gap-3 mb-2">
														<h3 className="text-lg font-semibold">{volunteer.name}</h3>
														<Badge variant="secondary">
															{volunteer.gender === "male" ? "男" : volunteer.gender === "female" ? "女" : "其他"}
														</Badge>
														<Badge variant="outline">
															<Clock className="w-3 h-3 mr-1" />
															待审批
														</Badge>
													</div>
													<div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground">
														<div className="flex items-center gap-2">
															<User className="w-4 h-4" />
															<span>{volunteer.lotusId}</span>
														</div>
														<div className="flex items-center gap-2">
															<Phone className="w-4 h-4" />
															<span>{volunteer.phone}</span>
														</div>
														<div className="flex items-center gap-2">
															<Calendar className="w-4 h-4" />
															<span>
																{volunteer.createdAt
																	? new Date(volunteer.createdAt).toLocaleDateString("zh-CN")
																	: "-"}
															</span>
														</div>
														{volunteer.dharmaName && (
															<div className="flex items-center gap-2">
																<span className="font-medium">法名:</span>
																<span>{volunteer.dharmaName}</span>
															</div>
														)}
													</div>
													{volunteer.joinReason && (
														<div className="mt-2 text-sm">
															<span className="font-medium">申请理由: </span>
															<span className="text-muted-foreground">{volunteer.joinReason}</span>
														</div>
													)}
												</div>
											</div>
											<div className="flex gap-2 ml-4">
												<Button
													size="sm"
													variant="default"
													onClick={() => handleApprove(volunteer)}
													disabled={approveMutation.isPending}
												>
													<CheckCircle className="w-4 h-4 mr-1" />
													通过
												</Button>
												<Button
													size="sm"
													variant="destructive"
													onClick={() => handleReject(volunteer)}
													disabled={approveMutation.isPending}
												>
													<XCircle className="w-4 h-4 mr-1" />
													拒绝
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* 审批确认对话框 */}
				<Dialog
					open={approvalDialog.open}
					onClose={() => {
						setApprovalDialog({ open: false });
						setNotes("");
					}}
					title={
						approvalDialog.isBatch
							? `批量${approvalDialog.action === "approve" ? "通过" : "拒绝"}`
							: `${approvalDialog.action === "approve" ? "通过" : "拒绝"}审批`
					}
				>
					<div className="space-y-4">
						<div>
							<p className="text-sm text-muted-foreground">
								{approvalDialog.isBatch
									? `确定要${approvalDialog.action === "approve" ? "通过" : "拒绝"} ${selectedVolunteers.length} 个义工申请吗？`
									: `确定要${approvalDialog.action === "approve" ? "通过" : "拒绝"}义工 ${approvalDialog.volunteer?.name} 的申请吗？`}
							</p>
						</div>
						<div>
							<Label htmlFor="notes">备注（可选）</Label>
							<Textarea
								id="notes"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="请输入审批备注..."
								rows={3}
								className="mt-2"
							/>
						</div>
						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								onClick={() => {
									setApprovalDialog({ open: false });
									setNotes("");
								}}
							>
								取消
							</Button>
							<Button
								variant={approvalDialog.action === "approve" ? "default" : "destructive"}
								onClick={handleConfirmApproval}
								disabled={approveMutation.isPending || batchApproveMutation.isPending}
							>
								{approveMutation.isPending || batchApproveMutation.isPending
									? "处理中..."
									: "确认"}
							</Button>
						</div>
					</div>
				</Dialog>
			</div>
		</DashboardLayout>
	);
}
