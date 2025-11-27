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
import { ArrowLeft, Trash2, Clock, MapPin, Search, Filter, Calendar, Download, RefreshCw } from "lucide-react";
import { toast } from "@/lib/toast";
import dayjs from "dayjs";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export const Route = createFileRoute("/checkin/details/old")({
	component: CheckinDetailsPage,
} as any);

function CheckinDetailsPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const queryClient = useQueryClient();
	const [startDate, setStartDate] = useState(
		dayjs().subtract(7, "day").format("YYYY-MM-DD"),
	)
	const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
	const [lotusId, setLotusId] = useState("");
	const [searchText, setSearchText] = useState("");
	const [page, setPage] = useState(1);
	const pageSize = 20;
	const [quickFilter, setQuickFilter] = useState<string>("custom");

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
	})

	const deleteMutation = useMutation({
		mutationFn: checkinService.deleteRawRecord,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["checkin-raw-records"] });
			toast.success("删除成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "删除失败");
		},
	})

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingRecord, setDeletingRecord] = useState<any>(null);

	if (authLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-muted-foreground">加载中...</div>
			</div>
		)
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
	}

	const confirmDelete = () => {
		if (deletingRecord) {
			deleteMutation.mutate(deletingRecord.id);
			setDeleteDialogOpen(false);
			setDeletingRecord(null);
		}
	}

	const getStatusBadge = (status: string) => {
		const statusMap: Record<string, { label: string; variant: any }> = {
			present: { label: "正常", variant: "default" },
			late: { label: "迟到", variant: "secondary" },
			early_leave: { label: "早退", variant: "secondary" },
			absent: { label: "缺勤", variant: "destructive" },
			on_leave: { label: "请假", variant: "outline" },
		}
		const config = statusMap[status] || { label: status, variant: "outline" };
		return <Badge variant={config.variant}>{config.label}</Badge>;
	}

	const getRecordTypeBadge = (type: string) => {
		const typeMap: Record<string, { label: string; variant: any }> = {
			face: { label: "人脸", variant: "default" },
			manual: { label: "手动", variant: "outline" },
		}
		const config = typeMap[type] || { label: type, variant: "outline" };
		return <Badge variant={config.variant}>{config.label}</Badge>;
	}

	// 快速筛选处理
	const handleQuickFilter = (filter: string) => {
		setQuickFilter(filter);
		const today = dayjs();
		switch (filter) {
			case "today":
				setStartDate(today.format("YYYY-MM-DD"));
				setEndDate(today.format("YYYY-MM-DD"));
				break
			case "yesterday":
				const yesterday = today.subtract(1, "day");
				setStartDate(yesterday.format("YYYY-MM-DD"));
				setEndDate(yesterday.format("YYYY-MM-DD"));
				break
			case "week":
				setStartDate(today.startOf("week").format("YYYY-MM-DD"));
				setEndDate(today.format("YYYY-MM-DD"));
				break
			case "month":
				setStartDate(today.startOf("month").format("YYYY-MM-DD"));
				setEndDate(today.format("YYYY-MM-DD"));
				break
			case "last7days":
				setStartDate(today.subtract(7, "day").format("YYYY-MM-DD"));
				setEndDate(today.format("YYYY-MM-DD"));
				break
			case "last30days":
				setStartDate(today.subtract(30, "day").format("YYYY-MM-DD"));
				setEndDate(today.format("YYYY-MM-DD"));
				break
		}
		setPage(1);
	}

	// 客户端搜索过滤（如果后端不支持搜索）
	const filteredRecords = records.filter((record: any) => {
		if (!searchText) return true;
		const searchLower = searchText.toLowerCase();
		return (
			(record.name && record.name.toLowerCase().includes(searchLower)) ||
			(record.lotusId && record.lotusId.toLowerCase().includes(searchLower)) ||
			(record.location && record.location.toLowerCase().includes(searchLower))
		)
	})

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* 页面头部 */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div className="flex items-center gap-4">
					<Link to="/checkin">
						<Button variant="ghost" size="sm">
							<ArrowLeft className="h-4 w-4 mr-2" />
							返回
						</Button>
					</Link>
					<div>
						<h1 className="text-3xl font-bold tracking-tight">考勤详情</h1>
						<p className="text-muted-foreground mt-1">
							查看原始打卡记录，共 {total} 条
						</p>
					</div>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => {
						setPage(1)
						refetch()
					}}
					className="shadow-sm"
				>
					<RefreshCw className="h-4 w-4 mr-2" />
					刷新
				</Button>
			</div>

			{/* 筛选区域 - 优化后的设计 */}
			<Card className="border-2 shadow-sm">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Filter className="h-5 w-5" />
							筛选条件
						</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* 快速筛选 */}
					<div>
						<label className="text-sm font-medium mb-2 block">快速筛选</label>
						<div className="flex flex-wrap gap-2">
							<Button
								variant={quickFilter === "today" ? "default" : "outline"}
								size="sm"
								onClick={() => handleQuickFilter("today")}
							>
								今天
							</Button>
							<Button
								variant={quickFilter === "yesterday" ? "default" : "outline"}
								size="sm"
								onClick={() => handleQuickFilter("yesterday")}
							>
								昨天
							</Button>
							<Button
								variant={quickFilter === "week" ? "default" : "outline"}
								size="sm"
								onClick={() => handleQuickFilter("week")}
							>
								本周
							</Button>
							<Button
								variant={quickFilter === "month" ? "default" : "outline"}
								size="sm"
								onClick={() => handleQuickFilter("month")}
							>
								本月
							</Button>
							<Button
								variant={quickFilter === "last7days" ? "default" : "outline"}
								size="sm"
								onClick={() => handleQuickFilter("last7days")}
							>
								近7天
							</Button>
							<Button
								variant={quickFilter === "last30days" ? "default" : "outline"}
								size="sm"
								onClick={() => handleQuickFilter("last30days")}
							>
								近30天
							</Button>
						</div>
					</div>

					{/* 自定义日期范围 */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-medium flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								开始日期
							</label>
							<Input
								type="date"
								value={startDate}
								onChange={(e) => {
									setStartDate(e.target.value);
									setQuickFilter("custom")
								}}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								结束日期
							</label>
							<Input
								type="date"
								value={endDate}
								onChange={(e) => {
									setEndDate(e.target.value)
									setQuickFilter("custom")
								}}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium flex items-center gap-2">
								<Search className="h-4 w-4" />
								莲花斋ID
							</label>
							<Input
								placeholder="输入莲花斋ID筛选"
								value={lotusId}
								onChange={(e) => setLotusId(e.target.value)}
							/>
						</div>
						<div className="flex items-end">
							<Button
								onClick={() => {
									setPage(1)
									refetch()
								}}
								className="w-full"
							>
								<Search className="h-4 w-4 mr-2" />
								查询
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 搜索栏 */}
			{records.length > 0 && (
				<div className="flex items-center gap-4">
					<div className="relative flex-1 max-w-md">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="搜索姓名、ID或地点..."
							value={searchText}
							onChange={(e) => {
								setSearchText(e.target.value);
								setPage(1)
							}}
							className="pl-10"
						/>
					</div>
					<div className="text-sm text-muted-foreground">
						{searchText ? `显示 ${filteredRecords.length} / ${records.length} 条记录` : `共 ${records.length} 条记录`}
					</div>
				</div>
			)}

			{/* 打卡记录表格 - 优化后的设计 */}
			<Card className="shadow-sm border-t-4 border-t-primary/20">
				<CardHeader className="border-b">
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Clock className="h-5 w-5" />
							打卡记录
						</CardTitle>
						{records.length > 0 && (
							<Badge variant="secondary">
								共 {searchText ? filteredRecords.length : records.length} 条
							</Badge>
						)}
					</div>
				</CardHeader>
				<CardContent className="p-0">
					{isLoading ? (
						<div className="text-center py-12 text-muted-foreground">
							<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
							<p>加载中...</p>
						</div>
					) : records.length === 0 ? (
						<div className="text-center py-12 text-muted-foreground">
							<Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
							<p>暂无打卡记录</p>
							<p className="text-sm mt-2">请调整筛选条件后重试</p>
						</div>
					) : filteredRecords.length === 0 ? (
						<div className="text-center py-12 text-muted-foreground">
							<Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
							<p>未找到匹配的记录</p>
							<p className="text-sm mt-2">请尝试其他搜索关键词</p>
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow className="bg-muted/50">
											<TableHead className="font-semibold">日期</TableHead>
											<TableHead className="font-semibold">姓名</TableHead>
											<TableHead className="font-semibold">莲花斋ID</TableHead>
											<TableHead className="font-semibold">签到时间</TableHead>
											<TableHead className="font-semibold">签退时间</TableHead>
											<TableHead className="font-semibold">状态</TableHead>
											<TableHead className="font-semibold">类型</TableHead>
											<TableHead className="font-semibold">地点</TableHead>
											<TableHead className="font-semibold">备注</TableHead>
											<TableHead className="text-right font-semibold">操作</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{(searchText ? filteredRecords : records).map((record: any) => (
											<TableRow key={record.id} className="hover:bg-muted/30 transition-colors">
												<TableCell className="font-medium">
													{dayjs(record.date).format("YYYY-MM-DD")}
												</TableCell>
												<TableCell>
													<span className="font-medium">{record.name || "-"}</span>
												</TableCell>
												<TableCell>
													<Link
														to={"/volunteers/${record.lotusId}"}
														className="text-primary hover:underline font-medium"
													>
														{record.lotusId || "-"}
													</Link>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Clock className="h-4 w-4 text-muted-foreground" />
														<span className="font-mono text-sm">
															{record.checkIn || "-"}
														</span>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Clock className="h-4 w-4 text-muted-foreground" />
														<span className="font-mono text-sm">
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
													<div className="flex items-center gap-2 max-w-[200px]">
														<MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
														<span className="text-sm truncate">
															{record.location || "-"}
														</span>
													</div>
												</TableCell>
												<TableCell>
													<span className="text-sm text-muted-foreground line-clamp-1 max-w-[150px] block">
														{record.notes || "-"}
													</span>
												</TableCell>
												<TableCell className="text-right">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDelete(record)}
														className="text-destructive hover:text-destructive hover:bg-destructive/10"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							{/* 分页 - 优化后的设计 */}
							{totalPages > 1 && (
								<div className="flex items-center justify-between border-t px-6 py-4">
									<div className="text-sm text-muted-foreground">
										共 {total} 条记录，第 {page} / {totalPages} 页
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setPage(1)}
											disabled={page === 1}
										>
											首页
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setPage((p) => Math.max(1, p - 1))}
											disabled={page === 1}
										>
											上一页
										</Button>
										<div className="flex items-center gap-1 px-3 text-sm">
											<span>第</span>
											<Input
												type="number"
												min={1}
												max={totalPages}
												value={page}
												onChange={(e) => {
													const p = parseInt(e.target.value)
													if (p >= 1 && p <= totalPages) {
														setPage(p)
													}
												}}
												className="w-16 h-8 text-center"
											/>
											<span>页</span>
										</div>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
											disabled={page === totalPages}
										>
											下一页
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setPage(totalPages)}
											disabled={page === totalPages}
										>
											末页
										</Button>
									</div>
								</div>
							)}
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
	)
}
