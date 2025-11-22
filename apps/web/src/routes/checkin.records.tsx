import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckinRecordsTable } from "@/components/CheckinRecordsTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { checkinService } from "@/services/checkin";
import { ArrowLeft } from "lucide-react";
import dayjs from "dayjs";

export const Route = createFileRoute("/checkin/records")({
	component: CheckinRecordsPage,
} as any);

function CheckinRecordsPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const [startDate, setStartDate] = useState(
		dayjs().subtract(30, "day").format("YYYY-MM-DD")
	);
	const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
	const [lotusId, setLotusId] = useState("");

	const { data, isLoading, refetch } = useQuery({
		queryKey: ["checkin-records", startDate, endDate, lotusId],
		queryFn: () =>
			checkinService.getList({
				page: 1,
				pageSize: 100, // 后端限制最大 100
				startDate,
				endDate,
				lotusId: lotusId || undefined,
			}),
		enabled: isAuthenticated,
	});

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

	const records = data?.data || [];
	const total = data?.total || 0;

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
							<h1 className="text-3xl font-bold">考勤记录</h1>
							<p className="text-muted-foreground mt-1">
								查看原始打卡记录，共 {total} 条
							</p>
						</div>
					</div>
				</div>

				{/* 筛选区域 */}
				<div className="bg-card rounded-lg border p-4">
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
							<Button onClick={() => refetch()} className="w-full">
								查询
							</Button>
						</div>
					</div>
				</div>

				{/* 考勤记录表格 */}
				<div className="bg-card rounded-lg border p-6">
					<CheckinRecordsTable data={records} isLoading={isLoading} />
				</div>
			</div>
		
	);
}
