import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChantingScheduleForm } from "@/components/ChantingScheduleForm";
import { Pagination } from "@/components/Pagination";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { ChantingScheduleCalendar } from "@/components/ChantingScheduleCalendar";
import { useAuth } from "@/hooks/useAuth";
import { chantingService } from "@/services/chanting";
import type { ChantingSchedule } from "@/types";
import { Plus, Edit, Trash2, Calendar, MapPin, Users, Clock } from "lucide-react";
import { toast } from "@/lib/toast";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/chanting")({
	component: ChantingPage,
});

function ChantingPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const queryClient = useQueryClient();
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingSchedule, setEditingSchedule] = useState<ChantingSchedule | undefined>();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingSchedule, setDeletingSchedule] = useState<ChantingSchedule | null>(null);
	const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
	const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
	const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);

	const { data, isLoading } = useQuery({
		queryKey: ["chanting", "list", page, pageSize],
		queryFn: () => chantingService.getList({ page, pageSize }),
		enabled: isAuthenticated && viewMode === "list",
	});

	const {
		data: calendarData,
		isLoading: calendarLoading,
	} = useQuery({
		queryKey: ["chanting", "calendar", calendarYear, calendarMonth],
		queryFn: () => chantingService.getCalendar(calendarYear, calendarMonth),
		enabled: isAuthenticated && viewMode === "calendar",
	});

	const createMutation = useMutation({
		mutationFn: chantingService.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["chanting"] });
			setIsDialogOpen(false);
			toast.success("创建成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "创建失败");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: Partial<ChantingSchedule> }) =>
			chantingService.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["chanting"] });
			setIsDialogOpen(false);
			setEditingSchedule(undefined);
			toast.success("更新成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "更新失败");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: chantingService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["chanting"] });
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

	const scheduleList = Array.isArray(data?.data) ? data.data : [];
	const total = data?.data?.total || 0;

	const handleAdd = () => {
		setEditingSchedule(undefined);
		setIsDialogOpen(true);
	};

	const handleEdit = (schedule: ChantingSchedule) => {
		setEditingSchedule(schedule);
		setIsDialogOpen(true);
	};

	const handleDelete = (schedule: ChantingSchedule) => {
		setDeletingSchedule(schedule);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (deletingSchedule) {
			deleteMutation.mutate(deletingSchedule.id);
			setDeleteDialogOpen(false);
			setDeletingSchedule(null);
		}
	};

	const handleFormSubmit = async (data: Partial<ChantingSchedule>) => {
		if (editingSchedule) {
			await updateMutation.mutateAsync({ id: editingSchedule.id, data });
		} else {
			await createMutation.mutateAsync(data as any);
		}
	};

	const handleDialogClose = () => {
		setIsDialogOpen(false);
		setEditingSchedule(undefined);
	};

	const locationMap = {
		fuhuiyuan: "福慧园",
		waiqin: "外勤",
	};

	const statusMap = {
		pending: { label: "待确认", variant: "secondary" as const },
		confirmed: { label: "已确认", variant: "default" as const },
		in_progress: { label: "进行中", variant: "default" as const },
		completed: { label: "已完成", variant: "outline" as const },
		cancelled: { label: "已取消", variant: "destructive" as const },
	};

	// 统计数据
	const todaySchedules = scheduleList.filter(
		(s) => s.date === new Date().toISOString().split("T")[0],
	).length;
	const pendingSchedules = scheduleList.filter((s) => s.status === "pending").length;
	const completedSchedules = scheduleList.filter((s) => s.status === "completed").length;

	return (
		
			<div className="space-y-6">
				<div className="flex justify-between items-center gap-4">
					<div>
						<h1 className="text-3xl font-bold">助念排班</h1>
						<p className="text-muted-foreground mt-1">
							管理助念排班，分配义工任务
						</p>
					</div>
					<div className="flex items-center gap-2">
						<div className="inline-flex rounded-md border bg-background p-1 text-xs">
							<button
								type="button"
								className={`px-2 py-1 rounded-sm ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
								onClick={() => setViewMode("list")}
							>
								列表视图
							</button>
							<button
								type="button"
								className={`px-2 py-1 rounded-sm ${viewMode === "calendar" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
								onClick={() => setViewMode("calendar")}
							>
								日历视图
							</button>
						</div>
						<Button onClick={handleAdd}>
							<Plus className="h-4 w-4 mr-2" />
							创建排班
						</Button>
					</div>
				</div>

				{/* 统计卡片 */}
				<div className="grid gap-4 md:grid-cols-4">
					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">排班总数</p>
								<p className="text-2xl font-bold mt-1">{total}</p>
							</div>
							<Calendar className="h-8 w-8 text-muted-foreground" />
						</div>
					</Card>
					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">今日排班</p>
								<p className="text-2xl font-bold mt-1">{todaySchedules}</p>
							</div>
							<Clock className="h-8 w-8 text-blue-500" />
						</div>
					</Card>
					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">待确认</p>
								<p className="text-2xl font-bold mt-1 text-orange-500">
									{pendingSchedules}
								</p>
							</div>
							<Users className="h-8 w-8 text-orange-500" />
						</div>
					</Card>
					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">已完成</p>
								<p className="text-2xl font-bold mt-1 text-green-500">
									{completedSchedules}
								</p>
							</div>
							<svg
								className="h-8 w-8 text-green-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
					</Card>
				</div>

				{/* 排班列表 / 日历 */}
				{viewMode === "list" ? (
					<Card>
						<div className="p-6">
							{isLoading ? (
								<div className="text-center py-12 text-muted-foreground">
									加载中...
								</div>
							) : scheduleList.length === 0 ? (
								<EmptyState
									type="no-data"
									onAction={handleAdd}
									actionLabel="创建第一个排班"
								/>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>日期</TableHead>
											<TableHead>时间段</TableHead>
											<TableHead>地点</TableHead>
											<TableHead>往生者</TableHead>
											<TableHead>敲钟义工</TableHead>
											<TableHead>领诵义工</TableHead>
											<TableHead>备用义工</TableHead>
											<TableHead>状态</TableHead>
											<TableHead className="text-right">操作</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{scheduleList.map((schedule) => (
											<TableRow key={schedule.id}>
												<TableCell className="font-medium">
													{schedule.date}
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-1">
														<Clock className="h-4 w-4 text-muted-foreground" />
														{schedule.timeSlot}
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-1">
														<MapPin className="h-4 w-4 text-muted-foreground" />
														{locationMap[schedule.location as keyof typeof locationMap]}
													</div>
												</TableCell>
												<TableCell>{schedule.deceasedName || "-"}</TableCell>
												<TableCell>{schedule.bellVolunteerName || "-"}</TableCell>
												<TableCell>
													{schedule.teachingVolunteerName || "-"}
												</TableCell>
												<TableCell>{schedule.backupVolunteerName || "-"}</TableCell>
												<TableCell>
													<Badge
														variant={
															statusMap[schedule.status as keyof typeof statusMap]
																?.variant
														}
													>
														{
															statusMap[schedule.status as keyof typeof statusMap]
																?.label
														}
													</Badge>
												</TableCell>
												<TableCell className="text-right">
													<div className="flex justify-end gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleEdit(schedule)}
														>
															<Edit className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleDelete(schedule)}
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

						{scheduleList.length > 0 && (
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
				) : (
					<ChantingScheduleCalendar
						data={Array.isArray(calendarData?.data) ? calendarData!.data : []}
						isLoading={calendarLoading}
						year={calendarYear}
						month={calendarMonth}
						onMonthChange={(y: number, m: number) => {
							setCalendarYear(y);
							setCalendarMonth(m);
						}}
					/>
				)}

				{/* 添加/编辑对话框 */}
				<Dialog
					open={isDialogOpen}
					onClose={handleDialogClose}
					title={editingSchedule ? "编辑排班" : "创建排班"}
					maxWidth="xl"
				>
					<ChantingScheduleForm
						schedule={editingSchedule}
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
						setDeletingSchedule(null);
					}}
					onConfirm={confirmDelete}
					title="删除排班"
					description={
						deletingSchedule
							? `确定要删除 ${deletingSchedule.date} ${deletingSchedule.timeSlot} 的排班吗？此操作不可恢复。`
							: ""
					}
					variant="destructive"
					items={
						deletingSchedule
							? [`${deletingSchedule.date} ${deletingSchedule.timeSlot}`]
							: []
					}
					isLoading={deleteMutation.isPending}
				/>
			</div>
		
	);
}
