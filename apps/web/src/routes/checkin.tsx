import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useState } from "react";
import { CheckinTable } from "../components/CheckinTable";
import { CheckinRecordsTable } from "../components/CheckinRecordsTable";
import { DashboardLayout } from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Dialog } from "../components/ui/dialog";
import { useAuth } from "../hooks/useAuth";
import { checkinService } from "../services/checkin";
import { documentService } from "../services/document";
import type { CheckInSummary } from "../types";
import { Download, FileDown, List } from "lucide-react";

export const Route = createFileRoute("/checkin")({
	component: CheckinPage,
} as any);

function CheckinPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const queryClient = useQueryClient();
	const [year, setYear] = useState(new Date().getFullYear());
	const [month, setMonth] = useState(new Date().getMonth() + 1);
	const [viewMode, setViewMode] = useState<"summary" | "records">("summary");
	const [startDate, setStartDate] = useState(
		dayjs().startOf("month").format("YYYY-MM-DD"),
	);
	const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingRecord, setEditingRecord] = useState<CheckInSummary | null>(
		null,
	);

	const { data: reportData, isLoading } = useQuery({
		queryKey: ["checkin", "monthly-report", year, month],
		queryFn: () => checkinService.getMonthlyReport({ year, month }),
		enabled: isAuthenticated && viewMode === "summary",
	});

	const { data: recordsData, isLoading: recordsLoading } = useQuery({
		queryKey: ["checkin", "records", startDate, endDate],
		queryFn: () =>
			checkinService.getList({ startDate, endDate, page: 1, pageSize: 100 }), // 后端限制最大 100
		enabled: isAuthenticated && viewMode === "records",
	});

	const deleteMutation = useMutation({
		mutationFn: checkinService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["checkin", "records"] });
			alert("删除成功！");
		},
		onError: (error: any) => {
			alert(error.message || "删除失败");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: Partial<CheckInSummary> }) =>
			checkinService.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["checkin", "records"] });
			setIsEditDialogOpen(false);
			setEditingRecord(null);
			alert("更新成功！");
		},
		onError: (error: any) => {
			alert(error.message || "更新失败");
		},
	});

	if (authLoading) {
		return (
			<DashboardLayout breadcrumbs={[{ label: "首页", href: "/" }, { label: "考勤管理" }]}>
				<div className="flex items-center justify-center h-64">
					<div className="text-muted-foreground">加载中...</div>
				</div>
			</DashboardLayout>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	const handleExport = async () => {
		try {
			const startDate = dayjs(
				`${year}-${month.toString().padStart(2, "0")}-01`,
			).format("YYYY-MM-DD");
			const endDate = dayjs(startDate).endOf("month").format("YYYY-MM-DD");

			const blob = await checkinService.exportVolunteerService(
				startDate,
				endDate,
			);

			// 创建下载链接
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `志愿者服务时间统计表_${year}年${month}月.xlsx`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (error: any) {
			alert(error.message || "导出失败");
		}
	};

	const report = reportData?.data || {};
	const volunteers = report.volunteers || [];
	const records = (recordsData?.data || []) as any[];

	const handleEdit = (record: CheckInSummary) => {
		setEditingRecord(record);
		setIsEditDialogOpen(true);
	};

	const handleDelete = (record: CheckInSummary) => {
		if (
			confirm(`确定要删除 ${record.name} 在 ${record.date} 的考勤记录吗？`)
		) {
			deleteMutation.mutate(record.id);
		}
	};

	const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!editingRecord) return;

		const formData = new FormData(e.currentTarget);
		const workHours = Number(formData.get("workHours"));
		const notes = formData.get("notes") as string;

		updateMutation.mutate({
			id: editingRecord.id,
			data: {
				workHours,
				notes,
				isManual: true,
			},
		});
	};

	const handleViewDetails = (lotusId: string) => {
		// Navigate to volunteer detail page
		window.location.hash = `#/volunteers/${lotusId}`;
	};

	return (
		<DashboardLayout breadcrumbs={[{ label: "首页", href: "/" }, { label: "考勤管理" }]}>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold">考勤管理</h1>
					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => window.location.hash = '#/checkin/records'}
						>
							<List className="h-4 w-4 mr-2" />
							原始记录
						</Button>
						<Button
							variant={viewMode === "summary" ? "default" : "outline"}
							onClick={() => setViewMode("summary")}
						>
							月度报表
						</Button>
						<Button
							variant={viewMode === "records" ? "default" : "outline"}
							onClick={() => setViewMode("records")}
						>
							记录管理
						</Button>
					</div>
				</div>

				{viewMode === "summary" ? (
					<>
						{/* 月份选择 */}
						<Card>
							<CardHeader>
								<CardTitle>月度考勤报表</CardTitle>
								<CardDescription>选择年月查看考勤统计</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex gap-4 items-end">
									<div className="space-y-2">
										<label className="text-sm font-medium">年份</label>
										<Input
											type="number"
											value={year}
											onChange={(e) => setYear(Number(e.target.value))}
											className="w-32"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium">月份</label>
										<Input
											type="number"
											min="1"
											max="12"
											value={month}
											onChange={(e) => setMonth(Number(e.target.value))}
											className="w-32"
										/>
									</div>
									<Button onClick={handleExport}>导出 Excel</Button>
								</div>
							</CardContent>
						</Card>

				{/* 统计概览 */}
				{isLoading ? (
					<div className="text-center py-8 text-gray-500">加载中...</div>
				) : volunteers.length === 0 ? (
					<div className="text-center py-8 text-gray-500">暂无数据</div>
				) : (
					<>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">参与义工</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-3xl font-bold">{volunteers.length}</div>
									<p className="text-sm text-gray-500 mt-1">人</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="text-lg">总服务时长</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-3xl font-bold">
										{volunteers
											.reduce(
												(sum: number, v: any) => sum + (v.totalHours || 0),
												0,
											)
											.toFixed(1)}
									</div>
									<p className="text-sm text-gray-500 mt-1">小时</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="text-lg">总打卡次数</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-3xl font-bold">
										{volunteers.reduce(
											(sum: number, v: any) => sum + (v.totalDays || 0),
											0,
										)}
									</div>
									<p className="text-sm text-gray-500 mt-1">次</p>
								</CardContent>
							</Card>
						</div>

						{/* 义工考勤表格 */}
						<Card>
							<CardHeader>
								<CardTitle>义工考勤明细</CardTitle>
							</CardHeader>
							<CardContent>
								<CheckinTable
									data={volunteers}
									isLoading={isLoading}
									onViewDetails={handleViewDetails}
								/>
							</CardContent>
						</Card>
					</>
				)}
					</>
				) : (
					<>
						{/* 筛选 */}
						<Card>
							<CardHeader>
								<CardTitle>筛选条件</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex gap-4 items-end">
									<div className="space-y-2">
										<label className="text-sm font-medium">开始日期</label>
										<Input
											type="date"
											value={startDate}
											onChange={(e) => setStartDate(e.target.value)}
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium">结束日期</label>
										<Input
											type="date"
											value={endDate}
											onChange={(e) => setEndDate(e.target.value)}
										/>
									</div>
									<Button
										onClick={() => {
											queryClient.invalidateQueries({
												queryKey: ["checkin", "records"],
											});
										}}
									>
										查询
									</Button>
								</div>
							</CardContent>
						</Card>

						{/* 考勤记录表格 */}
						<Card>
							<CardHeader>
								<CardTitle>考勤记录</CardTitle>
							</CardHeader>
							<CardContent>
								<CheckinRecordsTable
									data={records}
									isLoading={recordsLoading}
									onEdit={handleEdit}
									onDelete={handleDelete}
								/>
							</CardContent>
						</Card>
					</>
				)}

				{/* 编辑对话框 */}
				<Dialog
					open={isEditDialogOpen}
					onClose={() => {
						setIsEditDialogOpen(false);
						setEditingRecord(null);
					}}
					title="编辑考勤记录"
				>
					{editingRecord && (
						<form onSubmit={handleSaveEdit} className="space-y-4">
							<div>
								<label className="text-sm font-medium">姓名</label>
								<Input value={editingRecord.name} disabled />
							</div>
							<div>
								<label className="text-sm font-medium">日期</label>
								<Input value={editingRecord.date} disabled />
							</div>
							<div>
								<label className="text-sm font-medium">工时(小时)</label>
								<Input
									type="number"
									name="workHours"
									defaultValue={editingRecord.workHours}
									min="0"
									max="24"
									step="0.5"
									required
								/>
							</div>
							<div>
								<label className="text-sm font-medium">备注</label>
								<Input
									name="notes"
									defaultValue={editingRecord.notes || ""}
									placeholder="输入备注信息"
								/>
							</div>
							<div className="flex gap-2 justify-end">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setIsEditDialogOpen(false);
										setEditingRecord(null);
									}}
								>
									取消
								</Button>
								<Button type="submit">保存</Button>
							</div>
						</form>
					)}
				</Dialog>
			</div>
		</DashboardLayout>
	);
}