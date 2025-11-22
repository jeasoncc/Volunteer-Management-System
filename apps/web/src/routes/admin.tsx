import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { AdminForm } from "@/components/AdminForm";
import { AdminTable } from "@/components/AdminTable";
import { useAuth } from "@/hooks/useAuth";
import { adminService } from "@/services/admin";
import type { User } from "@/types";
import { toast } from "@/lib/toast";

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
	const [viewingAdmin, setViewingAdmin] = useState<AdminData | undefined>(undefined);

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
			toast.success("创建成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "创建失败");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: any }) => adminService.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admins"] });
			setIsDialogOpen(false);
			setEditingAdmin(undefined);
			toast.success("更新成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "更新失败");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: adminService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admins"] });
			toast.success("删除成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "删除失败");
		},
	});

	if (authLoading) {
		return (
			
				<div className="space-y-6">
					<div className="flex justify-between items-center">
						<div className="h-10 bg-muted rounded-md w-1/3 animate-pulse" />
						<div className="h-10 bg-muted rounded-md w-24 animate-pulse" />
					</div>
					<div className="h-96 bg-muted rounded-lg animate-pulse" />
				</div>
			
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	// Transform paginated User list to AdminData[]
	const adminUsers: User[] = Array.isArray((data as any)?.data?.data)
		? ((data as any).data.data as User[])
		: [];
	const admins: AdminData[] = adminUsers.map((user) => ({
		id: user.id,
		lotusId: user.lotusId,
		name: user.name,
		phone: user.phone,
		email: user.email,
		role: (user as any).role || "admin",
		department: (user as any).department || "",
	}));

	const handleView = (admin: AdminData) => {
		setViewingAdmin(admin);
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

				{/* 详情对话框 */}
				<Dialog
					open={!!viewingAdmin}
					onClose={() => setViewingAdmin(undefined)}
					title={viewingAdmin ? `管理员详情 - ${viewingAdmin.name}` : "管理员详情"}
					maxWidth="lg"
				>
					{viewingAdmin && (
						<div className="space-y-4 text-sm">
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-1 text-muted-foreground">
									<p>
										<span className="font-medium text-foreground">姓名：</span>
										{viewingAdmin.name}
									</p>
									<p>
										<span className="font-medium text-foreground">莲花斋ID：</span>
										{viewingAdmin.lotusId}
									</p>
									<p>
										<span className="font-medium text-foreground">手机号：</span>
										{viewingAdmin.phone}
									</p>
									<p>
										<span className="font-medium text-foreground">邮箱：</span>
										{viewingAdmin.email || "-"}
									</p>
								</div>
								<div className="space-y-1 text-muted-foreground">
									<p>
										<span className="font-medium text-foreground">角色：</span>
										{viewingAdmin.role === "super"
											? "超级管理员"
											: viewingAdmin.role === "admin"
												? "管理员"
												: "操作员"}
									</p>
									<p>
										<span className="font-medium text-foreground">部门：</span>
										{viewingAdmin.department || "-"}
									</p>
									<p className="text-xs">
										角色与部门信息后续可扩展为权限管理界面（角色-权限矩阵）。
									</p>
								</div>
							</div>
						</div>
					)}
				</Dialog>
			</div>
		
	);
}