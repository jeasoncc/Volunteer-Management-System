import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { checkinService } from "@/services/checkin";
import { AlertCircle, Search, RefreshCw } from "lucide-react";
import dayjs from "dayjs";

export function StrangersTab() {
	const [startDate, setStartDate] = useState(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
	const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const { data, isLoading, refetch } = useQuery({
		queryKey: ["stranger-records", startDate, endDate, page, pageSize],
		queryFn: () =>
			checkinService.getStrangerRecords({
				page,
				pageSize,
				startDate,
				endDate,
			}),
	});

	const records = data?.data?.records || [];
	const total = data?.data?.total || 0;
	const totalPages = data?.data?.totalPages || 1;

	return (
		<div className="space-y-4">
			{/* 筛选器 */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">筛选条件</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
						<div className="flex items-end gap-2">
							<Button onClick={() => { setPage(1); refetch(); }} className="flex-1">
								<Search className="h-4 w-4 mr-2" />
								查询
							</Button>
							<Button variant="outline" onClick={() => refetch()}>
								<RefreshCw className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 每页显示数量 */}
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

			{/* 表格 */}
			<Card>
				<CardContent className="p-0">
					{isLoading ? (
						<div className="text-center py-12">
							<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
							<p className="text-muted-foreground">加载中...</p>
						</div>
					) : records.length === 0 ? (
						<div className="text-center py-12 text-muted-foreground">
							<AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
							<p>暂无陌生人记录</p>
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow className="bg-muted/50">
											<TableHead>时间</TableHead>
											<TableHead>设备</TableHead>
											<TableHead>地点</TableHead>
											<TableHead>备注</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{records.map((record: any) => (
											<TableRow key={record.id}>
												<TableCell className="font-medium">
													{dayjs(record.timestamp).format("YYYY-MM-DD HH:mm:ss")}
												</TableCell>
												<TableCell>{record.deviceSn || "-"}</TableCell>
												<TableCell>{record.location || "-"}</TableCell>
												<TableCell className="text-sm text-muted-foreground">
													{record.notes || "-"}
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
		</div>
	);
}
