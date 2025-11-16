import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Layout } from "../components/Layout";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { useAuth } from "../hooks/useAuth";
import { checkinService } from "../services/checkin";
import { volunteerService } from "../services/volunteer";

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

	if (isLoading) {
		return (
			<Layout>
				<div className="flex items-center justify-center h-64">
					<div className="text-gray-500">加载中...</div>
				</div>
			</Layout>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
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
		<Layout>
			<div className="space-y-6">
				{/* 欢迎信息 */}
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						欢迎回来，{user?.name || "管理员"}
					</h1>
					<p className="mt-2 text-gray-600">
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
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-sm font-medium text-gray-600">
								义工总数
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-blue-600">
								{totalVolunteers}
							</div>
							<p className="text-xs text-gray-500 mt-1">注册义工人数</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm font-medium text-gray-600">
								本月活跃义工
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-green-600">
								{volunteers.length}
							</div>
							<p className="text-xs text-gray-500 mt-1">本月有打卡记录</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm font-medium text-gray-600">
								本月服务时长
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-purple-600">
								{totalHours.toFixed(1)}
							</div>
							<p className="text-xs text-gray-500 mt-1">小时</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm font-medium text-gray-600">
								本月打卡次数
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-orange-600">
								{totalDays}
							</div>
							<p className="text-xs text-gray-500 mt-1">次</p>
						</CardContent>
					</Card>
				</div>

				{/* 快捷入口 */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card className="hover:shadow-lg transition-shadow">
						<CardHeader>
							<CardTitle className="text-xl">义工管理</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-600 mb-4">
								管理义工信息、查看义工列表、添加新义工
							</p>
							<Link
								to="/volunteers"
								className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
							>
								进入义工管理 →
							</Link>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-shadow">
						<CardHeader>
							<CardTitle className="text-xl">考勤管理</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-600 mb-4">
								查看考勤记录、生成考勤报表、导出统计数据
							</p>
							<Link
								to="/checkin"
								className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
							>
								进入考勤管理 →
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
									.sort(
										(a: any, b: any) =>
											(b.totalHours || 0) - (a.totalHours || 0),
									)
									.slice(0, 10)
									.map((volunteer: any, index: number) => (
										<div
											key={volunteer.lotusId}
											className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
										>
											<div className="flex items-center gap-4">
												<div
													className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
														index === 0
															? "bg-yellow-400 text-yellow-900"
															: index === 1
																? "bg-gray-300 text-gray-700"
																: index === 2
																	? "bg-orange-300 text-orange-900"
																	: "bg-blue-100 text-blue-700"
													}`}
												>
													{index + 1}
												</div>
												<div>
													<div className="font-medium">{volunteer.name}</div>
													<div className="text-sm text-gray-500">
														{volunteer.lotusId}
													</div>
												</div>
											</div>
											<div className="text-right">
												<div className="font-bold text-lg text-blue-600">
													{volunteer.totalHours || 0} 小时
												</div>
												<div className="text-sm text-gray-500">
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
		</Layout>
	);
}
