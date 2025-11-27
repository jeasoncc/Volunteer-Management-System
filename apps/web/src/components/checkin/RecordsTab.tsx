import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Checkbox } from "@/components/ui/checkbox";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { checkinService } from "@/services/checkin";
import { Clock, Search, Trash2, RefreshCw } from "lucide-react";
import { toast } from "@/lib/toast";
import dayjs from "dayjs";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Link } from "@tanstack/react-router";

export function RecordsTab() {
	const queryClient = useQueryClient();
	const [startDate, setStartDate] = useState(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
	const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
	const [lotusId, setLotusId] = useState("");
	const [searchText, setSearchText] = useState("");
	const [page, setPage] = useState(1);
	const [selectedIds, setSelectedIds] = useState<number[]>([]);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [quickFilter, setQuickFilter] = useState<string>("last7days");
	const [pageSize, setPageSize] = useState(10);

	const { data, isLoading, refetch } = useQuery({
		queryKey: ["checkin-raw-records", startDate, endDate, lotusId, page, pageSize],
		queryFn: () =>
			checkinService.getRawRecords({
				page,
				pageSize,
				startDate,
				endDate,
				lotusId: lotusId || undefined,
			}),
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

	const batchDeleteMutation = useMutation({
		mutationFn: checkinService.batchDeleteRawRecords,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["checkin-raw-records"] });
			setSelectedIds([]);
			toast.success("批量删除成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "批量删除失败");
		},
	});

	// 调试：打印返回的数据
	console.log('📝 打卡记录 - 完整响应:', data);
	console.log('📝 打卡记录 - 查询参数:', { startDate, endDate, lotusId, page, pageSize });
	
	const paginationData = data?.data as any;
	const records = paginationData?.records || [];
	const total = paginationData?.total || 0;
	const totalPages = paginationData?.totalPages || 1;
	
	console.log('📝 打卡记录 - records 数量:', records.length);
	console.log('📝 打卡记录 - 期望数量:', pageSize);
	console.log('📝 打卡记录 - total:', total);
	console.log('📝 打卡记录 - totalPages:', totalPages);
	console.log('📝 打卡记录 - 当前页:', page);
	
	// 🚨 警告：如果记录数不等于 pageSize
	if (records.length > 0 && records.length !== pageSize && page < totalPages) {
		console.warn('⚠️ 警告：返回的记录数与期望不符！', {
			返回: records.length,
			期望: pageSize,
			差异: records.length - pageSize
		});
	}
	
	// 统计日期分布
	if (records.length > 0) {
		const dateCount = records.reduce((acc: any, record: any) => {
			const date = dayjs(record.date).format("YYYY-MM-DD");
			acc[date] = (acc[date] || 0) + 1;
			return acc;
		}, {});
		console.log('📝 打卡记录 - 日期分布:', dateCount);
	}

	const handleQuickFilter = (filter: string) => {
		setQuickFilter(filter);
		const today = dayjs();
		
		switch (filter) {
			case "today":
				setStartDate(today.format("YYYY-MM-DD"));
				setEndDate(today.format("YYYY-MM-DD"));
				break;
			case "yesterday":
				const yesterday = today.subtract(1, "day");
				setStartDate(yesterday.format("YYYY-MM-DD"));
				setEndDate(yesterday.format("YYYY-MM-DD"));
				break;
			case "last7days":
				setStartDate(today.subtract(7, "day").format("YYYY-MM-DD"));
				setEndDate(today.format("YYYY-MM-DD"));
				break;
			case "last30days":
				setStartDate(today.subtract(30, "day").format("YYYY-MM-DD"));
				setEndDate(today.format("YYYY-MM-DD"));
				break;
		}
		setPage(1);
	};

	// 暂时移除客户端过滤，避免分页问题
	// TODO: 将搜索功能移到后端实现
	const filteredRecords = records;

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedIds(records.map((r: any) => r.id));
		} else {
			setSelectedIds([]);
		}
	};

	const handleBatchDelete = () => {
		if (selectedIds.length === 0) {
			toast.error("请先选择要删除的记录");
			return;
		}
		setDeleteDialogOpen(true);
	};

	const confirmBatchDelete = () => {
		batchDeleteMutation.mutate(selectedIds);
		setDeleteDialogOpen(false);
	};

	return (
		<div className="space-y-4">
			{/* 筛选器 */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<CardTitle className="text-base">筛选条件</CardTitle>
						<div className="text-sm text-muted-foreground">
							查询范围: {startDate} 至 {endDate}
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
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

					<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
						<div className="space-y-2">
							<label className="text-sm font-medium">开始日期</label>
							<Input
								type="date"
								value={startDate}
								onChange={(e) => {
									setStartDate(e.target.value);
									setQuickFilter("custom");
								}}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">结束日期</label>
							<Input
								type="date"
								value={endDate}
								onChange={(e) => {
									setEndDate(e.target.value);
									setQuickFilter("custom");
								}}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">莲花斋ID</label>
							<Input
								placeholder="输入ID筛选"
								value={lotusId}
								onChange={(e) => setLotusId(e.target.value)}
							/>
						</div>
						<div className="flex items-end">
							<Button onClick={() => { setPage(1); refetch(); }} className="w-full">
								<Search className="h-4 w-4 mr-2" />
								查询
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 数据统计 */}
			{!isLoading && records.length > 0 && (
				<div className={`border rounded-lg p-3 text-sm ${
					records.length !== pageSize && page < totalPages
						? 'bg-yellow-50 border-yellow-300'
						: 'bg-blue-50 border-blue-200'
				}`}>
					<div className={`flex items-center gap-4 ${
						records.length !== pageSize && page < totalPages
							? 'text-yellow-900'
							: 'text-blue-900'
					}`}>
						<span>📊 当前页显示: {records.length} 条 {records.length !== pageSize && `(期望 ${pageSize} 条)`}</span>
						<span>📅 日期范围: {startDate} 至 {endDate}</span>
						<span>📈 总记录数: {total} 条</span>
						{records.length !== pageSize && page < totalPages && (
							<span className="font-semibold">⚠️ 分页异常</span>
						)}
					</div>
				</div>
			)}

			{/* 操作栏 */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					{selectedIds.length > 0 && (
						<Button
							variant="destructive"
							size="sm"
							onClick={handleBatchDelete}
						>
							<Trash2 className="h-4 w-4 mr-2" />
							删除选中 ({selectedIds.length})
						</Button>
					)}
					<div className="flex items-center gap-2 text-sm">
						<span className="text-muted-foreground">每页显示</span>
						<select
							value={pageSize}
							onChange={(e) => {
								setPageSize(Number(e.target.value));
								setPage(1);
							}}
							className="h-8 px-2 border rounded-md bg-background"
						>
							<option value={10}>10 条</option>
							<option value={20}>20 条</option>
							<option value={50}>50 条</option>
							<option value={100}>100 条</option>
						</select>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="使用上方筛选器查询..."
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							className="pl-10 w-64"
							disabled
							title="请使用上方的日期和ID筛选器"
						/>
					</div>
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						<RefreshCw className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* 表格 */}
			<Card>
				<CardContent className="p-0">
					{isLoading ? (
						<div className="text-center py-12">
							<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
							<p className="text-muted-foreground">加载中...</p>
						</div>
					) : filteredRecords.length === 0 ? (
						<div className="text-center py-12 text-muted-foreground">
							<Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
							<p>暂无打卡记录</p>
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow className="bg-muted/50">
											<TableHead className="w-12">
												<Checkbox
													checked={selectedIds.length === filteredRecords.length}
													onCheckedChange={handleSelectAll}
												/>
											</TableHead>
											<TableHead>日期</TableHead>
											<TableHead>姓名</TableHead>
											<TableHead>ID</TableHead>
											<TableHead>签到时间</TableHead>
											<TableHead>地点</TableHead>
											<TableHead className="text-right">操作</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredRecords.map((record: any) => (
											<TableRow key={record.id}>
												<TableCell>
													<Checkbox
														checked={selectedIds.includes(record.id)}
														onCheckedChange={(checked) => {
															if (checked) {
																setSelectedIds([...selectedIds, record.id]);
															} else {
																setSelectedIds(selectedIds.filter(id => id !== record.id));
															}
														}}
													/>
												</TableCell>
												<TableCell className="font-medium">
													{dayjs(record.date).format("YYYY-MM-DD")}
												</TableCell>
												<TableCell>{record.name || "-"}</TableCell>
												<TableCell>
													<Link
														to={`/volunteers/$lotusId`}
														params={{ lotusId: record.lotusId }}
														className="text-primary hover:underline"
													>
														{record.lotusId || "-"}
													</Link>
												</TableCell>
												<TableCell className="font-mono text-sm">
													{record.checkIn || "-"}
												</TableCell>
												<TableCell className="max-w-[200px] truncate text-sm">
													{record.location || "-"}
												</TableCell>
												<TableCell className="text-right">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => deleteMutation.mutate(record.id)}
														className="text-destructive hover:text-destructive"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							{/* 分页 - 始终显示 */}
							<div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t px-4 py-4 bg-muted/30">
								<div className="text-sm text-muted-foreground">
									共 {total} 条记录，每页 {pageSize} 条，第 {page}/{totalPages} 页
								</div>
								<div className="flex items-center gap-2">
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
										onClick={() => setPage(p => Math.max(1, p - 1))}
										disabled={page === 1}
									>
										上一页
									</Button>
									<div className="flex items-center gap-2 px-3">
										<Input
											type="number"
											min={1}
											max={totalPages}
											value={page}
											onChange={(e) => {
												const p = parseInt(e.target.value);
												if (p >= 1 && p <= totalPages) {
													setPage(p);
												}
											}}
											className="w-16 h-8 text-center"
										/>
										<span className="text-sm text-muted-foreground">/ {totalPages}</span>
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
						</>
					)}
				</CardContent>
			</Card>

			{/* 删除确认对话框 */}
			<ConfirmDialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				onConfirm={confirmBatchDelete}
				title="批量删除打卡记录"
				description={`确定要删除选中的 ${selectedIds.length} 条打卡记录吗？`}
				variant="destructive"
				isLoading={batchDeleteMutation.isPending}
			/>
		</div>
	);
}
