import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { checkinService } from "@/services/checkin";
import { ArrowLeft, Edit, Trash2, Clock, MapPin } from "lucide-react";
import { toast } from "@/lib/toast";
import dayjs from "dayjs";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export const Route = createFileRoute("/checkin/details")({
	component: CheckinDetailsPage,
} as any);

function CheckinDetailsPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const queryClient = useQueryClient();
	const [startDate, setStartDate] = useState(
		dayjs().subtract(7, "day").format("YYYY-MM-DD"),
	);
	const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
	const [lotusId, setLotusId] = useState("");
	const [page, setPage] = useState(1);
	const pageSize = 20;

	const { data, isLoading, refetch } = useQuery({
		queryKey: ["checkin-raw-records", startDate, endDate, lotusId, page],
		queryFn: () =>
			checkinService.getRawRecords({
				page,
				pageSize,
				startDate,
				endDate,
				lotusId: lotusId || undefined,
			}),
		enabled: isAuthenticated,
	});

	const deleteMutation = useMutation({
		mutationFn: checkinService.deleteRawRecord,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["checkin-raw-records"] });
			toast.success("删除成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "删除失败");
		},
	});

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingRecord, setDeletingRecord] = useState<any>(null);

	if (authLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-muted-foreground">加载中...</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	const records = data?.data?.records || [];
	const total = data?.data?.total || 0;
	const totalPages = data?.data?.totalPages || 1;

	const handleDelete = (record: any) => {
		setDeletingRecord(record);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (deletingRecord) {
			deleteMutation.mutate(deletingRecord.id);
			setDeleteDialogOpen(false);
			setDeletingRecord(null);
		}
	};

	const getStatusBadge = (status: string) => {
		const statusMap: Record<string, { label: string; variant: any }> = {
			present: { label: "正常", variant: "default" },
			late: { label: "迟到", variant: "secondary" },
			early_leave: { label: "早退", variant: "secondary" },
			absent: { label: "缺勤", variant: "destructive" },
			on_leave: { label: "请假", variant: "outline" },
		};
		const config = statusMap[status] || { label: status, variant: "outline" };
		return <Badge variant={config.variant}>{config.label}</Badge>;
	};

	const getRecordTypeBadge = (type: string) => {
		const typeMap: Record<string, { label: string; variant: any }> = {
			face: { label: "人脸", variant: "default" },
			manual: { label: "手动", variant: "outline" },
		};
		const config = typeMap[type] || { label: type, variant: "outline" };
		return <Badge variant={config.variant}>{config.label}</Badge>;
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Link to="/checkin">
						<Button variant="ghost" size="sm">
							<ArrowLeft className="h-4 w-4 mr-2" />
							返回
						</Button>
					</Link>
					<div>
						<h1 className="text-3xl font-bold">考勤详情</h1>
						<p className="text-muted-foreground mt-1">
							原始打卡记录，共 {total} 条
						</p>
					</div>
				</div>
			</div>

			{/* 筛选区域 */}
			<Card>
				<CardHeader>
					<CardTitle>筛选条件</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
						<div className="space-y-2">
							<label className="text-sm font-medium">莲花斋ID</label>
							<Input
								placeholder="输入莲花斋ID筛选"
								value={lotusId}
								onChange={(e) => setLotusId(e.target.value)}
							/>
						</div>
						<div className="flex items-end">
							<Button
								onClick={() => {
									setPage(1);
									refetch();
								}}
								className="w-full"
							>
								查询
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 打卡记录表格 */}
			<Card>
				<CardHeader>
					<CardTitle>打卡记录</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="text-center py-8 text-muted-foreground">
							加载中...
						</div>
					) : records.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							暂无数据
						</div>
					) : (
						<>
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>日期</TableHead>
											<TableHead>姓名</TableHead>
											<TableHead>莲花斋ID</TableHead>
											<TableHead>签到时间</TableHead>
											<TableHead>签退时间</TableHead>
											<TableHead>状态</TableHead>
											<TableHead>类型</TableHead>
											<TableHead>地点</TableHead>
											<TableHead>备注</TableHead>
											<TableHead className="text-right">操作</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{records.map((record: any) => (
											<TableRow key={record.id}>
												<TableCell className="font-medium">
													{record.date}
												</TableCell>
												<TableCell>{record.name || "-"}</TableCell>
												<TableCell>
													<Link
														to={`/volunteers/${record.lotusId}`}
														className="text-blue-600 hover:underline"
													>
														{record.lotusId || "-"}
													</Link>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-1">
														<Clock className="h-3 w-3 text-muted-foreground" />
														<span className="text-sm">
															{record.checkIn || "-"}
														</span>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-1">
														<Clock className="h-3 w-3 text-muted-foreground" />
														<span className="text-sm">
															{record.checkOut || "-"}
														</span>
													</div>
												</TableCell>
												<TableCell>
													{getStatusBadge(record.status)}
												</TableCell>
												<TableCell>
													{getRecordTypeBadge(record.recordType)}
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-1 max-w-[200px]">
														<MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
														<span className="text-xs truncate">
															{record.location || "-"}
														</span>
													</div>
												</TableCell>
												<TableCell>
													<span className="text-xs text-muted-foreground">
														{record.notes || "-"}
													</span>
												</TableCell>
												<TableCell className="text-right">
													<div className="flex justify-end gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleDelete(record)}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							{/* 分页 */}
							<div className="flex items-center justify-between mt-4">
								<div className="text-sm text-muted-foreground">
									共 {total} 条记录，第 {page} / {totalPages} 页
								</div>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPage((p) => Math.max(1, p - 1))}
										disabled={page === 1}
									>
										上一页
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
										disabled={page === totalPages}
									>
										下一页
									</Button>
								</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{/* 删除确认对话框 */}
			<ConfirmDialog
				open={deleteDialogOpen}
				onClose={() => {
					setDeleteDialogOpen(false);
					setDeletingRecord(null);
				}}
				onConfirm={confirmDelete}
				title="删除打卡记录"
				description={
					deletingRecord
						? `确定要删除 ${deletingRecord.name} 在 ${deletingRecord.date} ${deletingRecord.checkIn} 的打卡记录吗？`
						: ""
				}
				variant="destructive"
				items={
					deletingRecord
						? [
								`${deletingRecord.name} - ${deletingRecord.date} ${deletingRecord.checkIn}`,
						  ]
						: []
				}
				isLoading={deleteMutation.isPending}
			/>
		</div>
	);
}
