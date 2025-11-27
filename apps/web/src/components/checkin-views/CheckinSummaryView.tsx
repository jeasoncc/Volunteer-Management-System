import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import { CheckinTable } from "@/components/CheckinTable";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { checkinService } from "@/services/checkin";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/lib/toast";
import { Users, Clock, CalendarCheck } from "lucide-react";

export function CheckinSummaryView() {
	const { isAuthenticated } = useAuth();
	const [year, setYear] = useState(new Date().getFullYear());
	const [month, setMonth] = useState(new Date().getMonth() + 1);

	const { data: reportData, isLoading } = useQuery({
		queryKey: ["checkin", "monthly-report", year, month],
		queryFn: () => checkinService.getMonthlyReport({ year, month }),
		enabled: isAuthenticated,
	});

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

			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `志愿者服务时间统计表_${year}年${month}月.xlsx`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
			toast.success("导出成功！");
		} catch (error: any) {
			toast.error(error.message || "导出失败");
		}
	};

	const report = reportData?.data || {};
	const volunteers = report.volunteers || [];

	// 跳转到详情（保持原有逻辑，或者后续改为切 Tab）
	const handleViewDetails = (lotusId: string) => {
		window.location.hash = `#/volunteers/${lotusId}`;
	};

	return (
		<div className="space-y-6">
			{/* 顶部控制栏：更紧凑的布局 */}
			<div className="flex flex-wrap items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium">年份</span>
						<Input
							type="number"
							value={year}
							onChange={(e) => setYear(Number(e.target.value))}
							className="w-24 h-9"
						/>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium">月份</span>
						<Input
							type="number"
							min="1"
							max="12"
							value={month}
							onChange={(e) => setMonth(Number(e.target.value))}
							className="w-20 h-9"
						/>
					</div>
				</div>
				<Button onClick={handleExport} variant="outline" size="sm">
					<CalendarCheck className="w-4 h-4 mr-2" />
					导出月度报表
				</Button>
			</div>

			{/* 统计概览 */}
			{isLoading ? (
				<div className="h-32 flex items-center justify-center text-muted-foreground">
					加载统计数据...
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">参与义工</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{volunteers.length}</div>
							<p className="text-xs text-muted-foreground">人</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">总服务时长</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{volunteers
									.reduce(
										(sum: number, v: any) => sum + (v.totalHours || 0),
										0,
									)
									.toFixed(1)}
							</div>
							<p className="text-xs text-muted-foreground">小时</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">总打卡次数</CardTitle>
							<CalendarCheck className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{volunteers.reduce(
									(sum: number, v: any) => sum + (v.totalDays || 0),
									0,
								)}
							</div>
							<p className="text-xs text-muted-foreground">次</p>
						</CardContent>
					</Card>
				</div>
			)}

			{/* 义工考勤表格 */}
			<Card>
				<CardHeader className="px-6 py-4 border-b">
					<CardTitle className="text-base">义工考勤明细</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<div className="p-6 pt-4">
						<CheckinTable
							data={volunteers}
							isLoading={isLoading}
							onViewDetails={handleViewDetails}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
