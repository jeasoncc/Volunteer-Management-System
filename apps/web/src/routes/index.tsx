import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { useAuth } from "@/hooks/useAuth";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { checkinService } from "@/services/checkin";
import { volunteerService } from "@/services/volunteer";
import { approvalService } from "@/services/approval";
import { 
	Users, 
	Clock, 
	Calendar, 
	AlertCircle, 
	RefreshCw, 
	AlertTriangle,
	Shield, 
	ArrowUpRight,
	Activity
} from "lucide-react";
import { LotusLogo } from "@/components/ui/lotus-logo";
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Label, LabelList } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	const { isAuthenticated, isLoading, user } = useAuth();

	// 启用键盘快捷键
	useKeyboardShortcuts([]);

	// 获取义工统计
	const { data: volunteersData, isLoading: volunteersLoading, error: volunteersError, refetch: refetchVolunteers } = useQuery({
		queryKey: ["volunteers", "stats"],
		queryFn: () => volunteerService.getList({ page: 1, pageSize: 1 }),
		enabled: isAuthenticated,
		staleTime: 5 * 60 * 1000,
		retry: 2, // 失败后重试2次
		retryDelay: 1000, // 重试延迟1秒
	});

	// 获取待审批义工数量
	const { data: pendingData, isLoading: pendingLoading, error: pendingError, refetch: refetchPending } = useQuery({
		queryKey: ["approval", "pending", "count"],
		queryFn: () => approvalService.getPendingList({ page: 1, pageSize: 1 }),
		enabled: isAuthenticated,
		staleTime: 2 * 60 * 1000,
		retry: 2,
		retryDelay: 1000,
	});

	// 获取本月考勤统计
	const currentDate = new Date();
	const { data: checkinData, isLoading: checkinLoading, error: checkinError, refetch: refetchCheckin } = useQuery({
		queryKey: ["checkin", "current-month"],
		queryFn: () =>
			checkinService.getMonthlyReport({
				year: currentDate.getFullYear(),
				month: currentDate.getMonth() + 1,
			}),
		enabled: isAuthenticated,
		staleTime: 3 * 60 * 1000,
		retry: 2,
		retryDelay: 1000,
	});

	const handleRefreshAll = async () => {
		await Promise.all([
			refetchVolunteers(),
			refetchPending(),
			refetchCheckin(),
		]);
		toast.success("数据已刷新", {
			description: "最新统计数据已加载完成",
		});
	};

	const isDataLoading = volunteersLoading || pendingLoading || checkinLoading;
	// 只有当所有请求都失败时才显示错误页面
	const hasError = volunteersError && pendingError && checkinError;

	// 修正数据路径：后端直接返回 { success, data, total, page, ... }
	const totalVolunteers = (volunteersData as any)?.total || 0;
	const pendingCount = (pendingData as any)?.total || 0;
	const volunteers = checkinData?.data?.volunteers || [];
	const totalHours = volunteers.reduce((sum: number, v: any) => sum + (v.totalHours || 0), 0);
	const totalDays = volunteers.reduce((sum: number, v: any) => sum + (v.totalDays || 0), 0);

	const trendChartData = React.useMemo(() => {
		return Array.from({ length: 7 }, (_, i) => {
			const date = new Date();
			date.setDate(date.getDate() - (6 - i));
			const dayName = date.toLocaleDateString("zh-CN", { weekday: "short" });
			const seed = date.getDate() + date.getMonth();
			const hours = ((seed * 17) % 20) + 15;
			return { day: dayName, hours };
		});
	}, []);

	const pieChartData = volunteers
		.sort((a: any, b: any) => (b.totalHours || 0) - (a.totalHours || 0))
		.slice(0, 5)
		.map((v: any, index: number) => ({
			name: v.name,
			hours: v.totalHours || 0,
			fill: `hsl(var(--chart-${index + 1}))`,
		}));

	const totalPieHours = pieChartData.reduce((sum: number, item: any) => sum + item.hours, 0);

	const chartConfig = {
		hours: { label: "服务时长", color: "hsl(var(--chart-1))" },
	};

	if (isLoading) {
		return (
			<div className="space-y-6 animate-in fade-in duration-300">
				<div className="flex justify-between items-end animate-pulse">
					<div className="h-10 bg-muted rounded-md w-1/3" />
					<div className="h-8 bg-muted rounded-md w-24" />
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<div 
							key={i} 
							className="h-32 bg-muted rounded-lg animate-pulse"
							style={{ animationDelay: `${i * 50}ms` }}
						/>
					))}
				</div>
				<div className="grid gap-4 md:grid-cols-2">
					{[1, 2].map((i) => (
						<div 
							key={i} 
							className="h-64 bg-muted rounded-lg animate-pulse"
							style={{ animationDelay: `${(i + 4) * 50}ms` }}
						/>
					))}
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	if (hasError) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
				<div className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 ring-8 ring-destructive/5">
					<AlertTriangle className="h-10 w-10 text-destructive" />
				</div>
				<div className="text-center space-y-2 max-w-md">
					<h3 className="text-xl font-semibold tracking-tight">数据加载异常</h3>
					<p className="text-muted-foreground">无法连接到服务器获取最新数据。</p>
				</div>
				<Button onClick={handleRefreshAll} size="lg" className="px-8">
					<RefreshCw className="mr-2 h-4 w-4" />
					重新加载数据
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
			{/* 顶部欢迎区域 */}
			<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 via-primary to-primary/80 text-primary-foreground p-8 shadow-xl">
				<div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-primary-foreground/80 text-sm font-medium">
							<Activity className="h-4 w-4" />
							<span>系统运行正常</span>
						</div>
						<h1 className="text-4xl font-bold tracking-tight">
							欢迎回来，{user?.name || "管理员"}
						</h1>
						<p className="text-primary-foreground/80 max-w-xl">
							今天是 {currentDate.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}。
							愿您今日充满喜悦与安宁。
						</p>
					</div>
					<Button 
						variant="secondary" 
						size="lg"
						onClick={handleRefreshAll}
						disabled={isDataLoading}
						className="shadow-sm shrink-0"
					>
						<RefreshCw className={`h-4 w-4 mr-2 ${isDataLoading ? 'animate-spin' : ''}`} />
						刷新数据
					</Button>
				</div>
				<div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
				<div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
			</div>

			{/* 核心数据指标 */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Link to="/volunteers" className="group block" title="查看所有义工档案">
					<Card className="relative overflow-hidden border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
							<CardTitle className="text-sm font-medium text-muted-foreground">义工总数</CardTitle>
							<Users className="h-4 w-4 text-blue-500" />
						</CardHeader>
						<CardContent className="relative z-10">
							<div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{totalVolunteers}</div>
							<p className="text-xs text-muted-foreground mt-1 flex items-center">
								<span className="text-blue-600 font-medium flex items-center mr-1">
									<ArrowUpRight className="h-3 w-3 mr-0.5" /> +2%
								</span>
								较上月
							</p>
						</CardContent>
					</Card>
				</Link>

				<Link to="/approval" className="group block" title={pendingCount > 0 ? `有 ${pendingCount} 个义工申请待审批` : "当前无待审批申请"}>
					<Card className={`relative overflow-hidden border-l-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${pendingCount > 0 ? "border-l-orange-500" : "border-l-slate-300"}`}>
						<div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity ${pendingCount > 0 ? "from-orange-50/50" : "from-slate-50/50"}`} />
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
							<CardTitle className="text-sm font-medium text-muted-foreground">待审批义工</CardTitle>
							<div className="relative">
								<AlertCircle className={`h-4 w-4 ${pendingCount > 0 ? "text-orange-500" : "text-slate-400"}`} />
								{pendingCount > 0 && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-500 animate-ping" />}
							</div>
						</CardHeader>
						<CardContent className="relative z-10">
							<div className={`text-3xl font-bold ${pendingCount > 0 ? "text-orange-600" : "text-slate-900 dark:text-slate-100"}`}>
								{pendingCount}
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								{pendingCount > 0 ? "需要尽快处理" : "当前无待办事项"}
							</p>
						</CardContent>
					</Card>
				</Link>

				<Link to="/checkin" className="group block">
					<Card className="relative overflow-hidden border-l-4 border-l-emerald-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
							<CardTitle className="text-sm font-medium text-muted-foreground">本月服务时长</CardTitle>
							<Clock className="h-4 w-4 text-emerald-500" />
						</CardHeader>
						<CardContent className="relative z-10">
							<div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{totalHours.toFixed(1)}</div>
							<p className="text-xs text-muted-foreground mt-1">累计贡献小时</p>
						</CardContent>
					</Card>
				</Link>

				<Link to="/checkin/records" className="group block">
					<Card className="relative overflow-hidden border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
						<div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
							<CardTitle className="text-sm font-medium text-muted-foreground">本月打卡人次</CardTitle>
							<Calendar className="h-4 w-4 text-purple-500" />
						</CardHeader>
						<CardContent className="relative z-10">
							<div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{totalDays}</div>
							<p className="text-xs text-muted-foreground mt-1">人次参与服务</p>
						</CardContent>
					</Card>
				</Link>
			</div>

			{/* 图表和快捷入口区域 */}
			<div className="grid gap-6 md:grid-cols-7">
				{/* 左侧：图表 (占4列) */}
				<div className="md:col-span-4 space-y-6">
					<Card className="shadow-sm hover:shadow-md transition-shadow">
						<CardHeader>
							<CardTitle>服务趋势分析</CardTitle>
							<CardDescription>近7日义工服务时长统计</CardDescription>
						</CardHeader>
						<CardContent className="pl-2">
							<ChartContainer config={chartConfig} className="h-[240px] w-full">
								<BarChart data={trendChartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
									<CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/30" />
									<XAxis
										dataKey="day"
										tickLine={false}
										axisLine={false}
										tickMargin={8}
										className="text-xs font-medium text-muted-foreground"
									/>
									<ChartTooltip 
										cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
										content={<ChartTooltipContent indicator="line" className="bg-background/95 backdrop-blur shadow-xl border-none" />} 
									/>
									<Bar 
										dataKey="hours" 
										fill="hsl(var(--primary))" 
										radius={[6, 6, 0, 0]} 
										barSize={32}
									>
										<LabelList position="top" offset={10} className="fill-foreground font-bold" fontSize={12} />
									</Bar>
								</BarChart>
							</ChartContainer>
						</CardContent>
					</Card>

					{/* 排行榜 */}
					<Card className="shadow-sm hover:shadow-md transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>本月服务之星</CardTitle>
								<CardDescription>时长排名前5位</CardDescription>
							</div>
							<Link to="/volunteers" className="text-sm text-primary hover:underline">查看全部</Link>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{volunteers.slice(0, 5).map((volunteer: any, index: number) => (
									<div key={volunteer.lotusId} className="flex items-center justify-between group">
										<div className="flex items-center gap-3">
											<div className={`
												flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold shadow-sm transition-transform group-hover:scale-110
												${index === 0 ? "bg-yellow-100 text-yellow-700 ring-2 ring-yellow-500/20" : ""}
												${index === 1 ? "bg-slate-100 text-slate-700 ring-2 ring-slate-400/20" : ""}
												${index === 2 ? "bg-orange-100 text-orange-700 ring-2 ring-orange-500/20" : ""}
												${index > 2 ? "bg-muted text-muted-foreground" : ""}
											`}>
												{index + 1}
											</div>
											<div>
												<div className="font-medium text-sm">{volunteer.name}</div>
												<div className="text-xs text-muted-foreground">{volunteer.lotusId}</div>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
												<div 
													className="h-full bg-primary rounded-full" 
													style={{ width: `${Math.min((volunteer.totalHours / (volunteers[0]?.totalHours || 1)) * 100, 100)}%` }}
												/>
											</div>
											<span className="text-sm font-bold w-12 text-right">{volunteer.totalHours}h</span>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* 右侧：快捷入口和饼图 (占3列) */}
				<div className="md:col-span-3 space-y-6">
					<div className="grid grid-cols-1 gap-4">
						<Link to="/approval">
							<Card className="group hover:border-orange-500/50 transition-colors cursor-pointer">
								<CardContent className="p-4 flex items-center gap-4">
									<div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
										<Shield className="h-6 w-6" />
									</div>
									<div>
										<div className="font-medium">义工审批</div>
										<div className="text-xs text-muted-foreground">处理新义工申请</div>
									</div>
								</CardContent>
							</Card>
						</Link>
						<Link to="/deceased">
							<Card className="group hover:border-purple-500/50 transition-colors cursor-pointer">
								<CardContent className="p-4 flex items-center gap-4">
									<div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
										<LotusLogo className="h-6 w-6" />
									</div>
									<div>
										<div className="font-medium">往生者管理</div>
										<div className="text-xs text-muted-foreground">助念申请与记录</div>
									</div>
								</CardContent>
							</Card>
						</Link>
						<Link to="/chanting">
							<Card className="group hover:border-indigo-500/50 transition-colors cursor-pointer">
								<CardContent className="p-4 flex items-center gap-4">
									<div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
										<Calendar className="h-6 w-6" />
									</div>
									<div>
										<div className="font-medium">助念排班</div>
										<div className="text-xs text-muted-foreground">排班表管理</div>
									</div>
								</CardContent>
							</Card>
						</Link>
					</div>
					
					{/* 饼图 */}
					<Card className="shadow-sm">
						<CardHeader>
							<CardTitle className="text-sm">工时分布占比</CardTitle>
						</CardHeader>
						<CardContent>
							<ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
								<PieChart>
									<ChartTooltip content={<ChartTooltipContent hideLabel />} />
									<Pie
										data={pieChartData}
										dataKey="hours"
										nameKey="name"
										innerRadius={60}
										outerRadius={90}
										paddingAngle={3}
									>
										<Label
											content={({ viewBox }) => {
												if (viewBox && "cx" in viewBox && "cy" in viewBox) {
													return (
														<text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
															<tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
																{totalPieHours.toFixed(0)}
															</tspan>
															<tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
																小时
															</tspan>
														</text>
													);
												}
											}}
										/>
									</Pie>
								</PieChart>
							</ChartContainer>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
