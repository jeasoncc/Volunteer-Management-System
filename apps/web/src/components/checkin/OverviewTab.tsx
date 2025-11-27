import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, Users } from "lucide-react";
import { checkinService } from "@/services/checkin";
import { DateSelector } from "./DateSelector";
import { StatsCards } from "./StatsCards";
import { toast } from "@/lib/toast";
import dayjs from "dayjs";

export function OverviewTab() {
	const [year, setYear] = useState(new Date().getFullYear());
	const [month, setMonth] = useState(new Date().getMonth() + 1);
	const [quickFilter, setQuickFilter] = useState<string>("current");

	const { data: reportData, isLoading } = useQuery({
		queryKey: ["checkin", "monthly-report", year, month],
		queryFn: () => checkinService.getMonthlyReport({ year, month }),
	});

	const report = reportData?.data || {};
	const volunteers = report.volunteers || [];

	const stats = useMemo(() => {
		const totalVolunteers = volunteers.length;
		const totalHours = volunteers.reduce((sum: number, v: any) => sum + (v.totalHours || 0), 0);
		// 后端返回的是 presentDays，表示实际打卡天数
		const totalDays = volunteers.reduce((sum: number, v: any) => sum + (v.presentDays || 0), 0);
		const avgHours = totalVolunteers > 0 ? (totalHours / totalVolunteers).toFixed(1) : "0.0";

		return {
			totalVolunteers,
			totalHours: totalHours.toFixed(1),
			totalDays,
			avgHours,
		};
	}, [volunteers]);

	const handleExport = async () => {
		try {
			const startDate = dayjs(`${year}-${month.toString().padStart(2, "0")}-01`).format("YYYY-MM-DD");
			const endDate = dayjs(startDate).endOf("month").format("YYYY-MM-DD");

			const blob = await checkinService.exportVolunteerService(startDate, endDate);

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

	// 调试：打印返回的数据
	console.log('📊 月度报表数据:', reportData);
	console.log('📊 volunteers:', volunteers);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="h-12 bg-muted rounded-md animate-pulse" />
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* 日期选择和导出 */}
			<Card>
				<CardContent className="p-4">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<DateSelector
							year={year}
							month={month}
							onYearChange={setYear}
							onMonthChange={setMonth}
							quickFilter={quickFilter}
							onQuickFilterChange={setQuickFilter}
						/>
						<Button onClick={handleExport} size="sm">
							<FileDown className="h-4 w-4 mr-2" />
							导出 Excel
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* 统计卡片 */}
			<StatsCards {...stats} />

			{/* 义工列表预览 */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							义工考勤明细
						</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					{volunteers.length === 0 ? (
						<div className="text-center py-12 text-muted-foreground">
							<Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
							<p>暂无考勤数据</p>
						</div>
					) : (
						<div className="text-sm text-muted-foreground text-center py-4">
							共 {volunteers.length} 名义工参与，切换到"打卡记录"标签查看详情
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
