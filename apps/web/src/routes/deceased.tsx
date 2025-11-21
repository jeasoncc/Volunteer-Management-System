import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeceasedForm } from "@/components/DeceasedForm";
import { Pagination } from "@/components/Pagination";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { deceasedService } from "@/services/deceased";
import type { Deceased } from "@/types";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { toast } from "@/lib/toast";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/deceased")({
	component: DeceasedPage,
});

function DeceasedPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const queryClient = useQueryClient();
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingDeceased, setEditingDeceased] = useState<Deceased | undefined>();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingDeceased, setDeletingDeceased] = useState<Deceased | null>(null);

	const { data, isLoading } = useQuery({
		queryKey: ["deceased", page, pageSize],
		queryFn: () => deceasedService.getList({ page, pageSize }),
		enabled: isAuthenticated,
	});

	const createMutation = useMutation({
		mutationFn: deceasedService.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deceased"] });
			setIsDialogOpen(false);
			toast.success("创建成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "创建失败");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: Partial<Deceased> }) =>
			deceasedService.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deceased"] });
			setIsDialogOpen(false);
			setEditingDeceased(undefined);
			toast.success("更新成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "更新失败");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deceasedService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deceased"] });
			toast.success("删除成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "删除失败");
		},
	});

	if (authLoading) {
		return (
			<DashboardLayout
				breadcrumbs={[{ label: "首页", href: "/" }, { label: "往生者管理" }]}
			>
				<div className="space-y-6">
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

	const deceasedList = Array.isArray(data?.data) ? data.data : [];
	const total = data?.data?.total || 0;

	const handleAdd = () => {
		setEditingDeceased(undefined);
		setIsDialogOpen(true);
	};

	const handleEdit = (deceased: Deceased) => {
		setEditingDeceased(deceased);
		setIsDialogOpen(true);
	};

	const handleDelete = (deceased: Deceased) => {
		setDeletingDeceased(deceased);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (deletingDeceased) {
			deleteMutation.mutate(deletingDeceased.id);
			setDeleteDialogOpen(false);
			setDeletingDeceased(null);
		}
	};

	const handleFormSubmit = async (data: Partial<Deceased>) => {
		if (editingDeceased) {
			await updateMutation.mutateAsync({ id: editingDeceased.id, data });
		} else {
			await createMutation.mutateAsync(data as any);
		}
	};

	const handleDialogClose = () => {
		setIsDialogOpen(false);
		setEditingDeceased(undefined);
	};

	const genderMap = {
		male: "男",
		female: "女",
		other: "其他",
	};

	const positionMap = {
		"room-one": "一号房",
		"room-two": "二号房",
		"room-three": "三号房",
		"room-four": "四号房",
		unknow: "未知",
	};

	return (
		<DashboardLayout
			breadcrumbs={[{ label: "首页", href: "/" }, { label: "往生者管理" }]}
		>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold">往生者管理</h1>
						<p className="text-muted-foreground mt-1">
							管理往生者信息，安排助念事宜
						</p>
					</div>
					<Button onClick={handleAdd}>
						<Plus className="h-4 w-4 mr-2" />
						添加往生者
					</Button>
				</div>

				{/* 统计卡片 */}
				<div className="grid gap-4 md:grid-cols-3">
					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">往生者总数</p>
								<p className="text-2xl font-bold mt-1">{total}</p>
							</div>
							<Users className="h-8 w-8 text-muted-foreground" />
						</div>
					</Card>
				</div>

				{/* 往生者列表 */}
				<Card>
					<div className="p-6">
						{isLoading ? (
							<div className="text-center py-12 text-muted-foreground">
								加载中...
							</div>
						) : deceasedList.length === 0 ? (
							<EmptyState
								type="no-data"
								onAction={handleAdd}
								actionLabel="添加第一个往生者"
							/>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>姓名</TableHead>
										<TableHead>称谓</TableHead>
										<TableHead>性别</TableHead>
										<TableHead>年龄</TableHead>
										<TableHead>往生日期</TableHead>
										<TableHead>助念位置</TableHead>
										<TableHead>家属联系人</TableHead>
										<TableHead>联系电话</TableHead>
										<TableHead className="text-right">操作</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{deceasedList.map((deceased) => (
										<TableRow key={deceased.id}>
											<TableCell className="font-medium">
												{deceased.name}
											</TableCell>
											<TableCell>{deceased.title}</TableCell>
											<TableCell>{genderMap[deceased.gender as keyof typeof genderMap]}</TableCell>
											<TableCell>{deceased.age || "-"}</TableCell>
											<TableCell>{deceased.deathDate}</TableCell>
											<TableCell>
												<Badge variant="outline">
													{positionMap[(deceased.chantPosition || "unknow") as keyof typeof positionMap]}
												</Badge>
											</TableCell>
											<TableCell>{deceased.familyContact || "-"}</TableCell>
											<TableCell>{deceased.familyPhone}</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleEdit(deceased)}
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDelete(deceased)}
													>
														<Trash2 className="h-4 w-4 text-destructive" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</div>

					{deceasedList.length > 0 && (
						<Pagination
							currentPage={page}
							totalPages={Math.ceil(total / pageSize)}
							pageSize={pageSize}
							totalItems={total}
							onPageChange={(newPage) => setPage(newPage)}
							onPageSizeChange={(newPageSize) => {
								setPageSize(newPageSize);
								setPage(1);
							}}
						/>
					)}
				</Card>

				{/* 添加/编辑对话框 */}
				<Dialog
					open={isDialogOpen}
					onClose={handleDialogClose}
					title={editingDeceased ? "编辑往生者" : "添加往生者"}
					maxWidth="xl"
				>
					<DeceasedForm
						deceased={editingDeceased}
						onSubmit={handleFormSubmit}
						onCancel={handleDialogClose}
						isLoading={createMutation.isPending || updateMutation.isPending}
					/>
				</Dialog>

				{/* 删除确认对话框 */}
				<ConfirmDialog
					open={deleteDialogOpen}
					onClose={() => {
						setDeleteDialogOpen(false);
						setDeletingDeceased(null);
					}}
					onConfirm={confirmDelete}
					title="删除往生者"
					description={
						deletingDeceased
							? `确定要删除往生者"${deletingDeceased.name}"吗？此操作不可恢复。`
							: ""
					}
					variant="destructive"
					items={deletingDeceased ? [deletingDeceased.name] : []}
					isLoading={deleteMutation.isPending}
				/>
			</div>
		</DashboardLayout>
	);
}
