import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { Dialog } from "../components/ui/dialog";
import { VolunteerForm } from "../components/VolunteerForm";
import { VolunteerDataTable } from "../components/VolunteerDataTable";
import { useAuth } from "../hooks/useAuth";
import { volunteerService } from "../services/volunteer";
import type { Volunteer } from "../types";

export const Route = createFileRoute("/volunteers")({
	component: VolunteersPage,
} as any);

function VolunteersPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const queryClient = useQueryClient();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingVolunteer, setEditingVolunteer] = useState<
		Volunteer | undefined
	>();
	const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]);

	const { data, isLoading } = useQuery({
		queryKey: ["volunteers"],
		queryFn: () => volunteerService.getList({ page: 1, pageSize: 100 }), // 后端限制最大 100
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

	return (
		<DashboardLayout breadcrumbs={[{ label: "首页", href: "/" }, { label: "义工管理" }]}>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold">义工管理</h1>
					<div className="flex gap-2">
						{selectedVolunteers.length > 0 && (
							<Button
								variant="destructive"
								onClick={handleBatchDelete}
								disabled={batchDeleteMutation.isPending}
							>
								{batchDeleteMutation.isPending ? "删除中..." : `批量删除 (${selectedVolunteers.length})`}
							</Button>
						)}
						<Button variant="outline" onClick={() => window.location.href = '/approval'}>
							义工审批
						</Button>
						<Button onClick={handleAdd}>添加义工</Button>
					</div>
				</div>

				{/* 义工列表 */}
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
			</div>
		</DashboardLayout>
	);
}
