import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { Dialog } from "../components/ui/dialog";
import { VolunteerForm } from "../components/VolunteerForm";
import { VolunteerTable } from "../components/VolunteerTable";
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

	const { data, isLoading } = useQuery({
		queryKey: ["volunteers"],
		queryFn: () => volunteerService.getList({ page: 1, pageSize: 1000 }), // 获取所有数据，由表格组件处理分页
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

	const volunteers = data?.data?.data || [];

	const handleView = (volunteer: Volunteer) => {
		alert(
			`查看义工详情功能待实现\n\n姓名: ${volunteer.name}\nID: ${volunteer.lotusId}\n手机: ${volunteer.phone}`,
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

	return (
		<DashboardLayout breadcrumbs={[{ label: "首页", href: "/" }, { label: "义工管理" }]}>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold">义工管理</h1>
					<Button onClick={handleAdd}>添加义工</Button>
				</div>

				{/* 义工列表 */}
				<div className="bg-card rounded-lg border p-6">
					<VolunteerTable
						data={volunteers}
						isLoading={isLoading}
						onView={handleView}
						onEdit={handleEdit}
						onDelete={handleDelete}
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
