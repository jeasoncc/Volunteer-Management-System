import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { checkinService } from "@/services/checkin";
import { 
	Download, 
	List, 
	Users, 
	Clock, 
	Calendar,
	TrendingUp,
	AlertCircle,
	RefreshCw,
	FileDown,
	Search
} from "lucide-react";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/checkin/improved/old")({
	component: CheckinPageImproved,
} as any);

function CheckinPageImproved() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const queryClient = useQueryClient();
	const [year, setYear] = useState(new Date().getFullYear());
	const [month, setMonth] = useState(new Date().getMonth() + 1);
	const [activeTab, setActiveTab] = useState("summary");
	const [searchKeyword, setSearchKeyword] = useState("");
	const [quickFilter, setQuickFilter] = useState<string>("current");

	// 获取月度报表数据
	const { data: reportData, isLoading, refetch } = useQuery({
		queryKey: ["checkin", "monthly-report", year, month],
		queryFn: () => checkinService.getMonthlyReport({ year, month }),
		enabled: isAuthenticated && activeTab === "summary",
	})

	// 快速筛选处理
	const handleQuickFilter = (filter: string) => {
		setQuickFilter(filter);
		const today = dayjs();
		switch (filter) {
			case "current":
				setYear(today.year());
				setMonth(today.month() + 1);
				break
			case "last":
				const lastMonth = today.subtract(1, "month");
				setYear(lastMonth.year());
				setMonth(lastMonth.month() + 1);
				break
			case "quarter":
				// 本季度第一个月
				const quarterStart = today.startOf("quarter");
				setYear(quarterStart.year());
				setMonth(quarterStart.month() + 1);
				break
		}
	}

	// 导出功能
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
	}

	if (authLoading) {
		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div className="h-10 bg-muted rounded-md w-1/3 animate-pulse" />
					<div className="h-10 bg-muted rounded-md w-32 animate-pulse" />
				</div>
				<div className="h-64 bg-muted rounded-lg animate-pulse" />
				<div className="h-96 bg-muted rounded-lg animate-pulse" />
			</div>
		)
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	const report = reportData?.data || {};
	const volunteers = report.volunteers || [];

	// 计算统计数据
	const stats = useMemo(() => {
		const totalVolunteers = volunteers.length;
		const totalHours = volunteers.reduce((sum: number, v: any) => sum + (v.totalHours || 0), 0);
		const totalDays = volunteers.reduce((sum: number, v: any) => sum + (v.totalDays || 0), 0);
		const avgHours = totalVolunteers > 0 ? (totalHours / totalVolunteers).toFixed(1) : 0;

		return {
			totalVolunteers,
			totalHours: totalHours.toFixed(1),
			totalDays,
			avgHours,
		}
	}, [volunteers]);

	// 搜索过滤
	const filteredVolunteers = useMemo(() => {
		if (!searchKeyword.trim()) return volunteers;
		
		const keyword = searchKeyword.toLowerCase().trim();
		return volunteers.filter((v: any) => 
			v.name?.toLowerCase().includes(keyword) ||
			v.lotusId?.toLowerCase().includes(keyword)
		)
	}, [volunteers, searchKeyword]);

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* 顶部标题与主要操作 */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">考勤管理</h1>
					<p className="text-muted-foreground mt-1">
						管理义工考勤记录、查看统计报表及导出数据
					</p>
				</div>
				<div className="flex gap-2">
					<Link to="/checkin/details">
						<Button variant="outline" className="shadow-sm">
							<List className="h-4 w-4 mr-2" />
							原始记录
						</Button>
					</Link>
					<Link to="/checkin/strangers">
						<Button variant="outline" className="shadow-sm">
							<AlertCircle className="h-4 w-4 mr-2" />
							陌生人记录
						</Button>
					</Link>
					<Button variant="outline" onClick={() => refetch()} className="shadow-sm">
						<RefreshCw className="h-4 w-4 mr-2" />
						刷新
					</Button>
				</div>
			</div>

			{/* 统计概览卡片 */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
					<CardContent className="p-6 flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">参与义工</p>
							<p className="text-3xl font-bold mt-2 text-blue-600">{stats.totalVolunteers}</p>
							<p className="text-xs text-muted-foreground mt-1">本月打卡人数</p>
						</div>
						<div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
							<Users className="h-6 w-6 text-blue-600" />
						</div>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
					<CardContent className="p-6 flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">总服务时长</p>
							<p className="text-3xl font-bold mt-2 text-green-600">{stats.totalHours}</p>
							<p className="text-xs text-muted-foreground mt-1">小时</p>
						</div>
						<div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
							<Clock className="h-6 w-6 text-green-600" />
						</div>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
					<CardContent className="p-6 flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">总打卡次数</p>
							<p className="text-3xl font-bold mt-2 text-purple-600">{stats.totalDays}</p>
							<p className="text-xs text-muted-foreground mt-1">次</p>
						</div>
						<div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
							<Calendar className="h-6 w-6 text-purple-600" />
						</div>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
					<CardContent className="p-6 flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">人均时长</p>
							<p className="text-3xl font-bold mt-2 text-orange-600">{stats.avgHours}</p>
							<p className="text-xs text-muted-foreground mt-1">小时/人</p>
						</div>
						<div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center">
							<TrendingUp className="h-6 w-6 text-orange-600" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* 月份选择和快速筛选 */}
			<Card className="border-2 shadow-sm">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5" />
							选择月份
						</CardTitle>
						<Button onClick={handleExport} size="sm" className="shadow-sm">
							<FileDown className="h-4 w-4 mr-2" />
							导出 Excel
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* 快速筛选 */}
					<div>
						<label className="text-sm font-medium mb-2 block">快速选择</label>
						<div className="flex flex-wrap gap-2">
							<Button
								variant={quickFilter === "current" ? "default" : "outline"}
								size="sm"
								onClick={() => handleQuickFilter("current")}
							>
								本月
							</Button>
							<Button
								variant={quickFilter === "last" ? "default" : "outline"}
								size="sm"
								onClick={() => handleQuickFilter("last")}
							>
								上月
							</Button>
							<Button
								variant={quickFilter === "quarter" ? "default" : "outline"}
								size="sm"
								onClick={() => handleQuickFilter("quarter")}
							>
								本季度
							</Button>
						</div>
					</div>

					{/* 自定义月份 */}
					<div className="flex gap-4 items-end">
						<div className="space-y-2">
							<label className="text-sm font-medium">年份</label>
							<Input
								type="number"
								value={year}
								onChange={(e) => {
									setYear(Number(e.target.value));
									setQuickFilter("custom")
								}}
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
								onChange={(e) => {
									setMonth(Number(e.target.value));
									setQuickFilter("custom")
								}}
								className="w-32"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 考勤明细表格 */}
			<Card className="shadow-sm border-t-4 border-t-primary/20">
				<CardHeader className="border-b">
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							义工考勤明细
						</CardTitle>
						{volunteers.length > 0 && (
							<Badge variant="secondary">
								共 {filteredVolunteers.length} 人
							</Badge>
						)}
					</div>
				</CardHeader>
				<CardContent className="p-6">
					{/* 搜索栏 */}
					{volunteers.length > 0 && (
						<div className="mb-4">
							<div className="relative max-w-md">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="搜索姓名或莲花斋ID..."
									value={searchKeyword}
									onChange={(e) => setSearchKeyword(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>
					)}

					{/* 表格内容 */}
					{isLoading ? (
						<div className="text-center py-12 text-muted-foreground">
							<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
							<p>加载中...</p>
						</div>
					) : filteredVolunteers.length === 0 ? (
						<div className="text-center py-12 text-muted-foreground">
							<Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
							<p>暂无考勤数据</p>
							<p className="text-sm mt-2">请选择其他月份查看</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b bg-muted/50">
										<th className="text-left p-3 font-semibold">姓名</th>
										<th className="text-left p-3 font-semibold">莲花斋ID</th>
										<th className="text-right p-3 font-semibold">打卡天数</th>
										<th className="text-right p-3 font-semibold">总工时(小时)</th>
										<th className="text-right p-3 font-semibold">平均工时</th>
										<th className="text-center p-3 font-semibold">操作</th>
									</tr>
								</thead>
								<tbody>
									{filteredVolunteers.map((v: any, index: number) => (
										<tr key={v.lotusId || index} className="border-b hover:bg-muted/30 transition-colors">
											<td className="p-3 font-medium">{v.name}</td>
											<td className="p-3">
												<Link
													to={"/volunteers/${v.lotusId}"}
													className="text-primary hover:underline"
												>
													{v.lotusId}
												</Link>
											</td>
											<td className="p-3 text-right">{v.totalDays || 0}</td>
											<td className="p-3 text-right font-mono">
												{(v.totalHours || 0).toFixed(1)}
											</td>
											<td className="p-3 text-right font-mono">
												{v.totalDays > 0 
													? (v.totalHours / v.totalDays).toFixed(1)
													: "0.0"
												}
											</td>
											<td className="p-3 text-center">
												<Link to={`/volunteers/${v.lotusId}`}>
													<Button variant="ghost" size="sm">
														查看详情
													</Button>
												</Link>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
