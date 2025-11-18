import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { Dialog } from "../components/ui/dialog";
import { AdminForm } from "../components/AdminForm";
import { AdminTable } from "../components/AdminTable";
import { useAuth } from "../hooks/useAuth";
import { adminService } from "../services/admin";
import type { User } from "../types";

interface AdminData {
	id: number;
	lotusId: string;
	name: string;
	phone: string;
	email?: string;
	role: "super" | "admin" | "operator";
	department: string;
}

export const Route = createFileRoute("/admin")({
	component: AdminPage,
} as any);

function AdminPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const queryClient = useQueryClient();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingAdmin, setEditingAdmin] = useState<AdminData | undefined>(undefined);

	const { data, isLoading } = useQuery({
		queryKey: ["admins"],
		queryFn: () => adminService.getList({ page: 1, pageSize: 100 }), // 后端限制最大 100
		enabled: isAuthenticated,
	});

	const createMutation = useMutation({
		mutationFn: adminService.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admins"] });
			setIsDialogOpen(false);
			alert("创建成功！");
		},
		onError: (error: any) => {
			alert(error.message || "创建失败");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: any }) => adminService.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admins"] });
			setIsDialogOpen(false);
			setEditingAdmin(undefined);
			alert("更新成功！");
		},
		onError: (error: any) => {
			alert(error.message || "更新失败");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: adminService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admins"] });
			alert("删除成功！");
		},
		onError: (error: any) => {
			alert(error.message || "删除失败");
		},
	});

	if (authLoading) {
		return (
			<DashboardLayout breadcrumbs={[{ label: "首页", href: "/" }, { label: "管理员管理" }]}>
				<div className="flex items-center justify-center h-64">
					<div className="text-muted-foreground">加载中...</div>
				</div>
			</DashboardLayout>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	// Transform User[] to AdminData[]
	const admins: AdminData[] = (data?.data || []).map((user: User) => ({
		id: user.id,
		lotusId: user.lotusId,
		name: user.name,
		phone: user.phone,
		email: user.email,
		role: (user as any).role || "admin",
		department: (user as any).department || "",
	}));

	const handleView = (admin: AdminData) => {
		alert(
			`查看管理员详情功能待实现

姓名: ${admin.name}
ID: ${admin.lotusId}
角色: ${admin.role}`,
		);
	};

	const handleEdit = (admin: AdminData) => {
		setEditingAdmin(admin);
		setIsDialogOpen(true);
	};

	const handleDelete = (admin: AdminData) => {
		if (confirm(`确定要删除管理员 ${admin.name} 含义吗？此操作不可恢复。`)) {
			deleteMutation.mutate(admin.id);
		}
	};

	const handleAdd = () => {
		setEditingAdmin(undefined);
		setIsDialogOpen(true);
	};

	const handleFormSubmit = async (data: any) => {
		if (editingAdmin) {
			await updateMutation.mutateAsync({
				id: editingAdmin.id,
				data,
			});
		} else {
			await createMutation.mutateAsync(data as any);
		}
	};

	const handleDialogClose = () => {
		setIsDialogOpen(false);
		setEditingAdmin(undefined);
	};

	return (
		<DashboardLayout breadcrumbs={[{ label: "首页", href: "/" }, { label: "管理员管理" }]}>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold">管理员管理</h1>
					<Button onClick={handleAdd}>添加管理员</Button>
				</div>

				{/* 管理员列表 */}
				<div className="bg-card rounded-lg border p-6">
					<AdminTable
						data={admins}
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
					title={editingAdmin ? "编辑管理员" : "添加管理员"}
					maxWidth="lg"
				>
					<AdminForm
						admin={editingAdmin}
						onSubmit={handleFormSubmit}
						onCancel={handleDialogClose}
					/>
				</Dialog>
			</div>
		</DashboardLayout>
	);
}