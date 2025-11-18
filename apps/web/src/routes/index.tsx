import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { DashboardLayout } from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { useAuth } from "../hooks/useAuth";
import { checkinService } from "../services/checkin";
import { volunteerService } from "../services/volunteer";
import { Users, Clock, Calendar, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/")({
	component: HomePage,
} as any);

function HomePage() {
	const { isAuthenticated, isLoading, user } = useAuth();

	// 获取义工统计
	const { data: volunteersData } = useQuery({
		queryKey: ["volunteers", "stats"],
		queryFn: () => volunteerService.getList({ page: 1, pageSize: 1 }),
		enabled: isAuthenticated,
	});

	// 获取本月考勤统计
	const currentDate = new Date();
	const { data: checkinData } = useQuery({
		queryKey: ["checkin", "current-month"],
		queryFn: () =>
			checkinService.getMonthlyReport({
				year: currentDate.getFullYear(),
				month: currentDate.getMonth() + 1,
			}),
		enabled: isAuthenticated,
	});

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	if (isLoading) {
		return (
			<DashboardLayout breadcrumbs={[{ label: "首页" }]}>
				<div className="flex items-center justify-center h-64">
					<div className="text-muted-foreground">加载中...</div>
				</div>
			</DashboardLayout>
		);
	}

	const totalVolunteers = volunteersData?.data?.total || 0;
	const volunteers = checkinData?.data?.volunteers || [];
	const totalHours = volunteers.reduce(
		(sum: number, v: any) => sum + (v.totalHours || 0),
		0,
	);
	const totalDays = volunteers.reduce(
		(sum: number, v: any) => sum + (v.totalDays || 0),
		0,
	);

	return (
		<DashboardLayout breadcrumbs={[{ label: "首页" }]}>
			<div className="space-y-6">
				{/* 欢迎信息 */}
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

				{/* 统计卡片 */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">义工总数</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{totalVolunteers}</div>
							<p className="text-xs text-muted-foreground mt-1">注册义工人数</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">本月活跃义工</CardTitle>
							<TrendingUp className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{volunteers.length}</div>
							<p className="text-xs text-muted-foreground mt-1">本月有打卡记录</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">本月服务时长</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
							<p className="text-xs text-muted-foreground mt-1">小时</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">本月打卡次数</CardTitle>
							<Calendar className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{totalDays}</div>
							<p className="text-xs text-muted-foreground mt-1">次</p>
						</CardContent>
					</Card>
				</div>

				{/* 快捷入口 */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
							<Button className="w-full" onClick={() => window.location.hash = '#/documents'}>
								进入文档管理 →
							</Button>
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
