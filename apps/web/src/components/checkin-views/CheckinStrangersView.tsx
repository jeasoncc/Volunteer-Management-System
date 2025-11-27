import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { checkinService } from "@/services/checkin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CheckinStrangersView() {
	const { isAuthenticated } = useAuth();
	const [startDate, setStartDate] = useState(
		dayjs().subtract(7, "day").format("YYYY-MM-DD"),
	);
	const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
	const [deviceSn, setDeviceSn] = useState("");

	const { data, isLoading, refetch } = useQuery({
		queryKey: ["checkin-strangers", startDate, endDate, deviceSn],
		queryFn: () =>
			checkinService.getStrangerRecords({
				page: 1,
				pageSize: 100,
				startDate,
				endDate,
				deviceSn: deviceSn || undefined,
			}),
		enabled: isAuthenticated,
	});

	const records = (data as any)?.data || [];
	const pagination = (data as any)?.pagination || {};

	return (
		<div className="space-y-6">
			{/* 筛选区域 */}
			<div className="bg-card p-4 rounded-lg border shadow-sm">
				<div className="flex flex-wrap items-end gap-4">
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground">开始日期</label>
						<Input
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							className="h-9"
						/>
					</div>
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground">结束日期</label>
						<Input
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							className="h-9"
						/>
					</div>
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground">设备编号</label>
						<Input
							placeholder="输入设备 SN 筛选"
							value={deviceSn}
							onChange={(e) => setDeviceSn(e.target.value)}
							className="h-9"
						/>
					</div>
					<Button onClick={() => refetch()} size="sm" className="h-9">
						查询
					</Button>
				</div>
			</div>

			{/* 列表 */}
			<Card>
				<CardHeader className="px-6 py-4 border-b">
					<CardTitle className="text-base flex justify-between items-center">
						<span>陌生人识别记录</span>
						<span className="text-sm font-normal text-muted-foreground">
							共 {pagination.total || records.length} 条记录
						</span>
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0 overflow-x-auto">
					{isLoading ? (
						<div className="text-center py-8 text-muted-foreground">加载中...</div>
					) : records.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">暂无记录</div>
					) : (
						<table className="min-w-full text-sm">
							<thead>
								<tr className="border-b text-left text-xs text-muted-foreground bg-muted/50">
									<th className="py-3 px-6 font-medium">时间</th>
									<th className="py-3 px-4 font-medium">设备编号</th>
									<th className="py-3 px-4 font-medium">用户ID</th>
									<th className="py-3 px-4 font-medium">姓名</th>
									<th className="py-3 px-4 font-medium">性别</th>
									<th className="py-3 px-4 font-medium">体温</th>
									<th className="py-3 px-4 font-medium">置信度</th>
									<th className="py-3 px-4 font-medium">识别类型</th>
									<th className="py-3 px-6 font-medium">照片</th>
								</tr>
							</thead>
							<tbody>
								{records.map((item: any) => (
									<tr key={item.id} className="border-b last:border-0 hover:bg-muted/50">
										<td className="py-3 px-6">
											{dayjs(item.date).format("YYYY-MM-DD")} {item.time || ""}
										</td>
										<td className="py-3 px-4 font-mono text-xs">{item.deviceSn || "-"}</td>
										<td className="py-3 px-4 font-mono text-xs">{item.userId || "-"}</td>
										<td className="py-3 px-4">{item.userName || "-"}</td>
										<td className="py-3 px-4">
											{item.gender === 0
												? "男"
												: item.gender === 1
												? "女"
												: item.gender === -1
												? "未知"
												: "-"}
										</td>
										<td className="py-3 px-4">{item.bodyTemperature || "-"}</td>
										<td className="py-3 px-4">{item.confidence || "-"}</td>
										<td className="py-3 px-4">{item.recordType || "-"}</td>
										<td className="py-3 px-6">{item.photo ? "有" : "无"}</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
