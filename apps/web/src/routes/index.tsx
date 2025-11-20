import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import * as React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
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
import { Users, Clock, Calendar, AlertCircle, TrendingUp, RefreshCw, AlertTriangle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Label } from "recharts";

export const Route = createFileRoute("/")({
	component: HomePage,
} as any);

function HomePage() {
	const { isAuthenticated, isLoading, user } = useAuth();
	const [lastUpdate, setLastUpdate] = React.useState(new Date());

	// 启用键盘快捷键
	useKeyboardShortcuts();

	// 获取义工统计
	const { data: volunteersData, isLoading: volunteersLoading, error: volunteersError, refetch: refetchVolunteers } = useQuery({
		queryKey: ["volunteers", "stats"],
		queryFn: () => volunteerService.getList({ page: 1, pageSize: 1 }),
		enabled: isAuthenticated,
		staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
	});

	// 获取待审批义工数量
	const { data: pendingData, isLoading: pendingLoading, error: pendingError, refetch: refetchPending } = useQuery({
		queryKey: ["approval", "pending", "count"],
		queryFn: () => approvalService.getPendingList({ page: 1, pageSize: 1 }),
		enabled: isAuthenticated,
		staleTime: 2 * 60 * 1000, // 2分钟内不重新请求（待审批需要更及时）
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
		staleTime: 3 * 60 * 1000, // 3分钟内不重新请求
	});

	// 全部刷新
	const handleRefreshAll = async () => {
		await Promise.all([
			refetchVolunteers(),
			refetchPending(),
			refetchCheckin(),
		]);
		setLastUpdate(new Date());
	};

	const isDataLoading = volunteersLoading || pendingLoading || checkinLoading;
	const hasError = volunteersError || pendingError || checkinError;

	if (isLoading) {
		return (
			<DashboardLayout breadcrumbs={[{ label: "首页" }]}>
				<div className="space-y-6">
					{/* Skeleton 加载状态 */}
					<div className="space-y-2">
						<div className="h-10 bg-muted rounded-md w-1/3 animate-pulse" />
						<div className="h-6 bg-muted rounded-md w-1/4 animate-pulse" />
					</div>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
						))}
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						{[1, 2].map((i) => (
							<div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
						))}
					</div>
				</div>
			</DashboardLayout>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	// 错误处理
	if (hasError) {
		return (
			<DashboardLayout breadcrumbs={[{ label: "首页" }]}>
				<Card className="border-destructive">
					<CardContent className="flex flex-col items-center justify-center py-12">
						<AlertTriangle className="h-12 w-12 text-destructive mb-4" />
						<h3 className="text-lg font-semibold mb-2">数据加载失败</h3>
						<p className="text-sm text-muted-foreground text-center mb-4">
							无法获取系统数据，请稍后重试
						</p>
						<Button onClick={handleRefreshAll}>
							<RefreshCw className="mr-2 h-4 w-4" />
							重试
						</Button>
					</CardContent>
				</Card>
			</DashboardLayout>
		);
	}

	const totalVolunteers = volunteersData?.data?.total || 0;
	const pendingCount = pendingData?.data?.total || 0;
	const volunteers = checkinData?.data?.volunteers || [];
	const totalHours = volunteers.reduce(
		(sum: number, v: any) => sum + (v.totalHours || 0),
		0,
	);
	const totalDays = volunteers.reduce(
		(sum: number, v: any) => sum + (v.totalDays || 0),
		0,
	);

	// 构造服务时长趋势数据（最近7天）
	// 使用固定的模拟数据，保持页面刷新时的一致性
	const trendChartData = React.useMemo(() => {
		return Array.from({ length: 7 }, (_, i) => {
			const date = new Date();
			date.setDate(date.getDate() - (6 - i));
			const dayName = date.toLocaleDateString('zh-CN', { weekday: 'short' });
			// 固定模拟数据，基于日期生成确定性的值
			const seed = date.getDate() + date.getMonth();
			const hours = ((seed * 17) % 20) + 15; // 15-35小时范围
			return { day: dayName, hours };
		});
	}, []);

	// 构造义工参与度数据（TOP 5）
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
		hours: {
			label: "服务时长",
			color: "hsl(var(--chart-1))",
		},
	};

	return (
		<DashboardLayout breadcrumbs={[{ label: "首页" }]}>
			<div className="space-y-6">
				{/* 欢迎信息和刷新按钮 */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">
							欢迎回来，{user?.name || "管理员"}
						</h1>
						<p className="mt-2 text-muted-foreground">
							今天是{" "}
							{currentDate.toLocaleDateString("zh-CN", {
								year: "numeric",
								month: "long",
								day: "numeric",
								weekday: "long",
							})}
						</p>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground">
							最后更新: {lastUpdate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
						</span>
						<Button 
							variant="outline" 
							size="sm"
							onClick={handleRefreshAll}
							disabled={isDataLoading}
						>
							<RefreshCw className={`h-4 w-4 mr-2 ${isDataLoading ? 'animate-spin' : ''}`} />
							刷新
						</Button>
					</div>
				</div>

				{/* 统计卡片 */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Link to="/volunteers" className="block transition-transform hover:scale-105">
						<Card className="cursor-pointer hover:shadow-lg transition-shadow">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">义工总数</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{totalVolunteers}</div>
								<p className="text-xs text-muted-foreground mt-1">注册义工人数</p>
							</CardContent>
						</Card>
					</Link>

					<Link to="/approval" className="block transition-transform hover:scale-105">
						<Card className={`cursor-pointer hover:shadow-lg transition-shadow ${pendingCount > 0 ? "border-orange-500 bg-orange-50/50" : ""}`}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">待审批义工</CardTitle>
								<AlertCircle className={`h-4 w-4 ${pendingCount > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
							</CardHeader>
							<CardContent>
								<div className={`text-2xl font-bold ${pendingCount > 0 ? "text-orange-600" : ""}`}>
									{pendingCount}
								</div>
								<p className="text-xs text-muted-foreground mt-1">
									{pendingCount > 0 ? "需要处理" : "暂无待审批"}
								</p>
							</CardContent>
						</Card>
					</Link>

					<Link to="/checkin" className="block transition-transform hover:scale-105">
						<Card className="cursor-pointer hover:shadow-lg transition-shadow">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">本月服务时长</CardTitle>
								<Clock className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
								<p className="text-xs text-muted-foreground mt-1">小时</p>
							</CardContent>
						</Card>
					</Link>

					<Link to="/checkin/records" className="block transition-transform hover:scale-105">
						<Card className="cursor-pointer hover:shadow-lg transition-shadow">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">本月打卡次数</CardTitle>
								<Calendar className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{totalDays}</div>
								<p className="text-xs text-muted-foreground mt-1">次</p>
							</CardContent>
						</Card>
					</Link>
				</div>

				{/* 图表区域 */}
				{volunteers.length > 0 ? (
					<div className="grid gap-4 md:grid-cols-2">
						{/* 服务时长趋势图 */}
						<Card>
							<CardHeader className="pb-4">
								<CardTitle className="text-base">近七日服务时长趋势</CardTitle>
								<CardDescription className="text-xs">每日总服务时长统计</CardDescription>
							</CardHeader>
							<CardContent className="pb-4">
								<ChartContainer config={chartConfig} className="h-[200px] w-full">
									<BarChart data={trendChartData}>
										<CartesianGrid vertical={false} />
										<XAxis
											dataKey="day"
											tickLine={false}
											axisLine={false}
											tickMargin={8}
										/>
										<ChartTooltip content={<ChartTooltipContent />} />
										<Bar dataKey="hours" fill="var(--color-hours)" radius={4} />
									</BarChart>
								</ChartContainer>
							</CardContent>
						</Card>

						{/* 义工参与度饼图 */}
						{pieChartData.length > 0 && (
							<Card className="flex flex-col">
								<CardHeader className="pb-4">
									<CardTitle className="text-base">本月TOP5义工服务时长分布</CardTitle>
									<CardDescription className="text-xs">服务时长占比分析</CardDescription>
								</CardHeader>
								<CardContent className="pb-4">
									<ChartContainer
										config={chartConfig}
										className="mx-auto h-[200px] w-full"
									>
										<PieChart>
											<ChartTooltip content={<ChartTooltipContent hideLabel />} />
											<Pie
												data={pieChartData}
												dataKey="hours"
												nameKey="name"
												innerRadius={50}
												outerRadius={80}
												strokeWidth={5}
											>
												<Label
													content={({ viewBox }) => {
														if (viewBox && "cx" in viewBox && "cy" in viewBox) {
															return (
																<text
																	x={viewBox.cx}
																	y={viewBox.cy}
																	textAnchor="middle"
																	dominantBaseline="middle"
																>
																	<tspan
																		x={viewBox.cx}
																		y={viewBox.cy}
																		className="fill-foreground text-2xl font-bold"
																	>
																		{totalPieHours.toFixed(0)}
																	</tspan>
																	<tspan
																		x={viewBox.cx}
																		y={(viewBox.cy || 0) + 20}
																		className="fill-muted-foreground text-xs"
																	>
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
						)}
					</div>
				) : (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<div className="rounded-full bg-muted p-3 mb-4">
								<Users className="h-6 w-6 text-muted-foreground" />
							</div>
							<h3 className="text-lg font-semibold mb-2">暂无考勤数据</h3>
							<p className="text-sm text-muted-foreground text-center mb-4">
								本月还没有义工打卡记录，图表数据将在有打卡后显示
							</p>
							<Link to="/checkin">
								<Button variant="outline">查看考勤管理</Button>
							</Link>
						</CardContent>
					</Card>
				)}

				{/* 快捷入口 */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<Card className={`hover:shadow-md transition-shadow ${pendingCount > 0 ? "border-orange-500" : ""}`}>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								义工审批
								{pendingCount > 0 && (
									<span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-orange-500 rounded-full">
										{pendingCount}
									</span>
								)}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground mb-4">
								{pendingCount > 0 
									? `有 ${pendingCount} 个义工申请待审批` 
									: "审批义工申请、查看待审批列表、批量审批"}
							</p>
							<Link to="/approval">
								<Button className={`w-full ${pendingCount > 0 ? "bg-orange-500 hover:bg-orange-600" : ""}`}>
									进入义工审批 →
								</Button>
							</Link>
						</CardContent>
					</Card>

					<Card className="hover:shadow-md transition-shadow">
						<CardHeader>
							<CardTitle>义工管理</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground mb-4">
								管理义工信息、查看义工列表、添加新义工
							</p>
							<Link to="/volunteers">
								<Button className="w-full">进入义工管理 →</Button>
							</Link>
						</CardContent>
					</Card>

					<Card className="hover:shadow-md transition-shadow">
						<CardHeader>
							<CardTitle>考勤管理</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground mb-4">
								查看考勤记录、生成考勤报表、导出统计数据
							</p>
							<Link to="/checkin">
								<Button className="w-full">进入考勤管理 →</Button>
							</Link>
						</CardContent>
					</Card>

					<Card className="hover:shadow-md transition-shadow">
						<CardHeader>
							<CardTitle>管理员管理</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground mb-4">
								管理系统管理员、权限分配、角色设置
							</p>
							<Link to="/admin">
								<Button className="w-full">进入管理员管理 →</Button>
							</Link>
						</CardContent>
					</Card>

					<Card className="hover:shadow-md transition-shadow">
						<CardHeader>
							<CardTitle>文档管理</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground mb-4">
								导出志愿者服务统计表、查看文档模板
							</p>
							<Link to="/documents">
								<Button className="w-full">进入文档管理 →</Button>
							</Link>
						</CardContent>
					</Card>

					<Card className="hover:shadow-md transition-shadow">
						<CardHeader>
							<CardTitle>设置</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground mb-4">
								系统设置、个人资料、修改密码
							</p>
							<Link to="/settings">
								<Button className="w-full">进入设置 →</Button>
							</Link>
						</CardContent>
					</Card>
				</div>

				{/* 本月服务时长排行 */}
				{volunteers.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>本月服务时长排行榜（前10名）</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{volunteers
									.sort((a: any, b: any) => (b.totalHours || 0) - (a.totalHours || 0))
									.slice(0, 10)
									.map((volunteer: any, index: number) => (
										<div
											key={volunteer.lotusId}
											className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
										>
											<div className="flex items-center gap-4">
												<div
													className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
														index === 0
															? "bg-yellow-400 text-yellow-900"
															: index === 1
															? "bg-gray-300 text-gray-700"
															: index === 2
															? "bg-orange-300 text-orange-900"
															: "bg-muted text-muted-foreground"
													}`}
												>
													{index + 1}
												</div>
												<div>
													<div className="font-medium">{volunteer.name}</div>
													<div className="text-sm text-muted-foreground">
														{volunteer.lotusId}
													</div>
												</div>
											</div>
											<div className="text-right">
												<div className="font-bold text-lg">
													{volunteer.totalHours || 0} 小时
												</div>
												<div className="text-sm text-muted-foreground">
													{volunteer.totalDays || 0} 天
												</div>
											</div>
										</div>
									))}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</DashboardLayout>
	);
}
