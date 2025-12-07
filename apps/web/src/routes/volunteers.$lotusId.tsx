import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { volunteerService } from "@/services/volunteer";
import { checkinService } from "@/services/checkin";
import type { Volunteer } from "@/types";
import { 
	ArrowLeft, 
	Calendar, 
	Clock, 
	Download, 
	Edit, 
	Activity,
	BarChart3,
	Target,
	Phone,
	Mail,
	MapPin,
	CreditCard,
	Fingerprint,
	Users,
	Heart,
	Shield,
	FileText,
	MessageSquare,
	Palette,
	Contact,
	User,
	CheckCircle2,
	Sparkles,
	GraduationCap,
	Scroll,
	UserCog,
	Briefcase,
	CalendarClock,
	ThumbsUp,
	TrendingUp,
	Info,
	Star,
	Award,
	Zap,

} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/image";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dayjs from "dayjs";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/volunteers/$lotusId")({
	component: VolunteerDetailPage,
});

function VolunteerDetailPage() {
	const { lotusId } = Route.useParams();
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const [startDate, setStartDate] = useState(
		dayjs().subtract(30, "day").format("YYYY-MM-DD")
	);
	const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));

	// 获取义工详情
	const {
		data: volunteerData,
		isLoading: volunteerLoading,
		error: volunteerError,
	} = useQuery({
		queryKey: ["volunteer", lotusId],
		queryFn: () => volunteerService.getByLotusId(lotusId),
		enabled: isAuthenticated && !!lotusId,
	});

	// 获取考勤记录
	const {
		data: checkinData,
		refetch: refetchCheckin,
	} = useQuery({
		queryKey: ["checkin-records", lotusId, startDate, endDate],
		queryFn: () =>
			checkinService.getUserRawRecords(lotusId, startDate, endDate),
		enabled: isAuthenticated && !!lotusId,
	});

	// API 返回格式：volunteerData 直接就是 Volunteer 对象（不是 { data: Volunteer }）
	// 从控制台日志看，volunteerData 直接就是义工对象
	const volunteer = (volunteerData?.data || volunteerData) as Volunteer | undefined;
	
	// API 返回格式: { success: true, data: { user: {}, records: [], statistics: {} } }
	const checkinResponse = checkinData?.data || checkinData;
	const checkinRecords = checkinResponse?.data?.records || checkinResponse?.records || [];
	const statistics = checkinResponse?.data?.statistics || checkinResponse?.statistics || {};

	// 统计计算辅助函数
	const calculateStats = (records: any[]) => {
		if (!records || records.length === 0) {
			return { days: 0, hours: 0, present: 0 };
		}
		const uniqueDays = new Set(records.map((r: any) => dayjs(r.date).format("YYYY-MM-DD"))).size;
		const totalHours = records.reduce((sum: number, r: any) => sum + (r.hours || 0), 0);
		const presentCount = records.filter((r: any) => r.status === "present").length;
		return { days: uniqueDays, hours: totalHours, present: presentCount };
	};

	// 计算本月统计
	const currentMonth = dayjs().month() + 1;
	const currentYear = dayjs().year();
	const thisMonthRecords = useMemo(() => {
		if (!checkinRecords || checkinRecords.length === 0) return [];
		return checkinRecords.filter((r: any) => {
			const recordDate = dayjs(r.date);
			return recordDate.month() + 1 === currentMonth && recordDate.year() === currentYear;
		});
	}, [checkinRecords, currentMonth, currentYear]);

	const thisMonthStats = useMemo(() => calculateStats(thisMonthRecords), [thisMonthRecords]);

	// 计算年度统计
	const thisYearRecords = useMemo(() => {
		if (!checkinRecords || checkinRecords.length === 0) return [];
		return checkinRecords.filter((r: any) => {
			const recordDate = dayjs(r.date);
			return recordDate.year() === currentYear;
		});
	}, [checkinRecords, currentYear]);

	const thisYearStats = useMemo(() => calculateStats(thisYearRecords), [thisYearRecords]);

	// 最近打卡记录（最近5条）
	const recentRecords = useMemo(() => {
		if (!checkinRecords || checkinRecords.length === 0) return [];
		return [...checkinRecords]
			.sort((a: any, b: any) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
			.slice(0, 5);
	}, [checkinRecords]);

	// 状态徽章辅助函数
	const getStatusBadge = (status: string) => {
		const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
			present: { label: "正常", variant: "default" },
			late: { label: "迟到", variant: "secondary" },
			early_leave: { label: "早退", variant: "outline" },
			absent: { label: "缺勤", variant: "outline" },
			on_leave: { label: "请假", variant: "outline" },
		};
		return statusMap[status] || { label: status, variant: "outline" as const };
	};

	// 根据记录计算统计信息
	const totalDays = statistics.totalDays || new Set(checkinRecords.map((r: any) => r.date)).size;
	const totalRecords = statistics.totalRecords || checkinRecords.length;
	const totalHours = statistics.totalHours || 0;
	const avgHoursPerDay = statistics.avgHoursPerDay || 0;

	// 按状态统计
	const statusCounts = checkinRecords.reduce((acc: any, record: any) => {
		const status = record.status || "present";
		acc[status] = (acc[status] || 0) + 1;
		return acc;
	}, {});

	const presentDays = statusCounts.present || 0;
	const lateDays = statusCounts.late || 0;
	const earlyLeaveDays = statusCounts.early_leave || 0;
	const absentDays = statusCounts.absent || 0;
	const onLeaveDays = statusCounts.on_leave || 0;

	const attendanceRate =
		totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : "0";
	
	// 计算年龄
	const age = volunteer?.birthDate ? dayjs().diff(dayjs(volunteer.birthDate), "year") : null;
	
	// 计算服务时长（从加入时间到现在）
	const serviceDuration = volunteer?.createdAt 
		? dayjs().diff(dayjs(volunteer.createdAt), "month") 
		: null;
	
	// 计算平均每日工时
	const avgDailyHours = totalDays > 0 ? (totalHours / totalDays).toFixed(2) : "0.00";

	// 按日期分组考勤记录
	const recordsByDate = checkinRecords.reduce((acc: any, record: any) => {
		const date = dayjs(record.date).format("YYYY-MM-DD");
		if (!acc[date]) {
			acc[date] = [];
		}
		acc[date].push(record);
		return acc;
	}, {});

	const handleExport = async () => {
		if (!volunteer) return;
		try {
			const blob = await checkinService.exportVolunteerService(
				startDate,
				endDate,
				[lotusId]
			);
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${volunteer.name}_考勤记录_${startDate}_${endDate}.xlsx`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
			toast.success("导出成功");
		} catch (error: any) {
			toast.error(error.message || "导出失败");
		}
	};

	// 条件渲染必须在所有 hooks 之后
	if (authLoading || volunteerLoading) {
		return (
			<div className="container mx-auto p-6">
				<div className="flex flex-col items-center justify-center h-64 space-y-4">
					<div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
					<div className="text-muted-foreground">加载中...</div>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	if (volunteerError) {
		return (
			<div className="container mx-auto p-6">
				<div className="flex items-center gap-4 mb-6">
					<Link to="/volunteers">
						<Button variant="ghost" size="sm">
							<ArrowLeft className="h-4 w-4 mr-2" />
							返回列表
						</Button>
					</Link>
				</div>
				<Card>
					<CardContent className="p-6">
						<div className="text-center text-destructive">
							加载义工信息失败: {volunteerError instanceof Error ? volunteerError.message : "未知错误"}
						</div>
						<div className="text-center text-muted-foreground mt-2 text-sm">
							LotusId: {lotusId}
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!volunteer || !volunteer.lotusId) {
		return (
			<div className="container mx-auto p-6">
				<div className="flex items-center gap-4 mb-6">
					<Link to="/volunteers">
						<Button variant="ghost" size="sm">
							<ArrowLeft className="h-4 w-4 mr-2" />
							返回列表
						</Button>
					</Link>
				</div>
				<Card>
					<CardContent className="p-6">
						<div className="text-center text-muted-foreground">
							未找到该义工信息
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// 状态配置
	const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
		registered: { label: "已注册", variant: "outline", className: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800" },
		trainee: { label: "培训中", variant: "outline", className: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
		applicant: { label: "申请中", variant: "outline", className: "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800" },
		inactive: { label: "未激活", variant: "secondary", className: "" },
		suspended: { label: "已暂停", variant: "destructive", className: "" },
	};
	const volunteerStatusConfig = volunteer ? (statusConfig[volunteer.volunteerStatus] || statusConfig.registered) : statusConfig.registered;

	return (
		<TooltipProvider>
			<div className="container mx-auto p-6 space-y-6">
			{/* 头部导航和快速操作 */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
				<div className="flex items-center gap-4">
					<Link to="/volunteers">
						<Button variant="ghost" size="sm" className="hover:bg-muted">
							<ArrowLeft className="h-4 w-4 mr-2" />
							返回列表
						</Button>
					</Link>
					<div className="flex items-center gap-4">
						<Avatar className="h-16 w-16 border-4 border-background shadow-lg ring-2 ring-primary/20">
							<AvatarImage src={getAvatarUrl(volunteer.avatar)} />
							<AvatarFallback className="bg-primary text-white text-2xl font-bold">
								{volunteer.name?.slice(0, 1)}
							</AvatarFallback>
						</Avatar>
						<div>
							<div className="flex items-center gap-2 mb-1">
								<h1 className="text-2xl font-bold font-serif">{volunteer.name}</h1>
								<Badge variant={volunteerStatusConfig.variant} className={volunteerStatusConfig.className}>
									{volunteerStatusConfig.label}
								</Badge>
								{volunteer.lotusRole === "admin" && (
									<Badge variant="secondary" className="bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
										管理员
									</Badge>
								)}
								{volunteer.syncToAttendance && (
									<Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
										<CheckCircle2 className="h-3 w-3 mr-1" />
										已同步考勤
									</Badge>
								)}
							</div>
							<p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
								<User className="h-3.5 w-3.5" />
								<span className="font-mono">{volunteer.lotusId}</span>
								{volunteer.gender && (
									<>
										<span className="mx-1">·</span>
										<span>{volunteer.gender === "male" ? "男" : volunteer.gender === "female" ? "女" : "其他"}</span>
									</>
								)}
								{volunteer.birthDate && (
									<>
										<span className="mx-1">·</span>
										<Tooltip>
											<TooltipTrigger asChild>
												<span className="cursor-help hover:text-foreground transition-colors">
													{dayjs(volunteer.birthDate).format("YYYY-MM-DD")}
													{age !== null && ` (${age}岁)`}
												</span>
											</TooltipTrigger>
											<TooltipContent>
												<p>出生日期: {dayjs(volunteer.birthDate).format("YYYY年MM月DD日")}</p>
												{age !== null && <p>年龄: {age}岁</p>}
											</TooltipContent>
										</Tooltip>
									</>
								)}
								{serviceDuration !== null && serviceDuration > 0 && (
									<>
										<span className="mx-1">·</span>
										<Tooltip>
											<TooltipTrigger asChild>
												<span className="cursor-help hover:text-foreground transition-colors flex items-center gap-1">
													<Award className="h-3 w-3" />
													{serviceDuration >= 12 ? `${Math.floor(serviceDuration / 12)}年${serviceDuration % 12}个月` : `${serviceDuration}个月`}
												</span>
											</TooltipTrigger>
											<TooltipContent>
												<p>服务时长: {serviceDuration >= 12 ? `${Math.floor(serviceDuration / 12)}年${serviceDuration % 12}个月` : `${serviceDuration}个月`}</p>
												<p>加入时间: {volunteer.createdAt ? dayjs(volunteer.createdAt).format("YYYY年MM月DD日") : "-"}</p>
											</TooltipContent>
										</Tooltip>
									</>
								)}
							</p>
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={handleExport} className="hover:bg-muted">
						<Download className="h-4 w-4 mr-2" />
						导出数据
					</Button>
					<Link to="/volunteers/$lotusId/edit" params={{ lotusId }}>
						<Button variant="default" size="sm">
							<Edit className="h-4 w-4 mr-2" />
							编辑信息
						</Button>
					</Link>
				</div>
			</div>

			{/* 使用标签页组织内容 */}
			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="grid w-full grid-cols-3 mb-6">
					<TabsTrigger value="overview" className="flex items-center gap-2">
						<BarChart3 className="h-4 w-4" />
						数据概览
					</TabsTrigger>
					<TabsTrigger value="details" className="flex items-center gap-2">
						<User className="h-4 w-4" />
						基本信息
					</TabsTrigger>
					<TabsTrigger value="attendance" className="flex items-center gap-2">
						<Clock className="h-4 w-4" />
						考勤记录
					</TabsTrigger>
				</TabsList>

				{/* 概览标签页 */}
				<TabsContent value="overview" className="space-y-6">
					{/* 统计概览 */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 group">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-2">
									<Calendar className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
									<p className="text-sm font-medium text-muted-foreground">本月打卡天数</p>
									<Tooltip>
										<TooltipTrigger asChild>
											<Info className="h-3.5 w-3.5 text-muted-foreground cursor-help hover:text-blue-600 transition-colors" />
										</TooltipTrigger>
										<TooltipContent>
											<p>本月累计打卡天数统计</p>
										</TooltipContent>
									</Tooltip>
								</div>
								<p className="text-3xl font-bold text-blue-600 mb-1 group-hover:scale-105 transition-transform inline-block">
									{thisMonthStats.days}
								</p>
								<div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
									<CheckCircle2 className="h-3 w-3 text-green-600" />
									<span>正常出勤: <span className="font-semibold text-green-600">{thisMonthStats.present}</span> 天</span>
								</div>
								{thisMonthStats.days > 0 && (
									<div className="mt-3">
										<Progress 
											value={(thisMonthStats.present / thisMonthStats.days) * 100} 
											className="h-2"
										/>
										<p className="text-xs text-muted-foreground mt-1">
											出勤率: {((thisMonthStats.present / thisMonthStats.days) * 100).toFixed(1)}%
										</p>
									</div>
								)}
							</div>
							<div className="h-14 w-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
								<Calendar className="h-7 w-7 text-blue-600" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20 group">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-2">
									<Clock className="h-4 w-4 text-green-600 group-hover:scale-110 transition-transform" />
									<p className="text-sm font-medium text-muted-foreground">本月服务工时</p>
									<Tooltip>
										<TooltipTrigger asChild>
											<Info className="h-3.5 w-3.5 text-muted-foreground cursor-help hover:text-green-600 transition-colors" />
										</TooltipTrigger>
										<TooltipContent>
											<p>本月累计服务工时</p>
											{thisMonthStats.days > 0 && (
												<p>日均: {avgDailyHours} 小时</p>
											)}
										</TooltipContent>
									</Tooltip>
								</div>
								<p className="text-3xl font-bold text-green-600 mb-1 group-hover:scale-105 transition-transform inline-block">
									{thisMonthStats.hours.toFixed(1)}
								</p>
								<p className="text-xs text-muted-foreground">小时</p>
								{thisMonthStats.days > 0 && (
									<div className="mt-3">
										<div className="flex items-center gap-2 text-xs text-muted-foreground">
											<Zap className="h-3 w-3 text-green-600" />
											<span>日均: <span className="font-semibold text-green-600">{avgDailyHours}</span> 小时</span>
										</div>
									</div>
								)}
							</div>
							<div className="h-14 w-14 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
								<Clock className="h-7 w-7 text-green-600" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20 group">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-2">
									<BarChart3 className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform" />
									<p className="text-sm font-medium text-muted-foreground">年度打卡天数</p>
									<Tooltip>
										<TooltipTrigger asChild>
											<Info className="h-3.5 w-3.5 text-muted-foreground cursor-help hover:text-purple-600 transition-colors" />
										</TooltipTrigger>
										<TooltipContent>
											<p>{currentYear}年度累计打卡天数</p>
										</TooltipContent>
									</Tooltip>
								</div>
								<p className="text-3xl font-bold text-purple-600 mb-1 group-hover:scale-105 transition-transform inline-block">
									{thisYearStats.days}
								</p>
								<div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
									<TrendingUp className="h-3 w-3 text-purple-600" />
									<span>正常出勤: <span className="font-semibold text-purple-600">{thisYearStats.present}</span> 天</span>
								</div>
								{thisYearStats.days > 0 && (
									<div className="mt-3">
										<Progress 
											value={(thisYearStats.present / thisYearStats.days) * 100} 
											className="h-2"
										/>
										<p className="text-xs text-muted-foreground mt-1">
											出勤率: {((thisYearStats.present / thisYearStats.days) * 100).toFixed(1)}%
										</p>
									</div>
								)}
							</div>
							<div className="h-14 w-14 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
								<BarChart3 className="h-7 w-7 text-purple-600" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20 group">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-2">
									<Target className="h-4 w-4 text-orange-600 group-hover:scale-110 transition-transform" />
									<p className="text-sm font-medium text-muted-foreground">年度服务工时</p>
									<Tooltip>
										<TooltipTrigger asChild>
											<Info className="h-3.5 w-3.5 text-muted-foreground cursor-help hover:text-orange-600 transition-colors" />
										</TooltipTrigger>
										<TooltipContent>
											<p>{currentYear}年度累计服务工时</p>
											{thisYearStats.days > 0 && (
												<p>日均: {(thisYearStats.hours / thisYearStats.days).toFixed(2)} 小时</p>
											)}
										</TooltipContent>
									</Tooltip>
								</div>
								<p className="text-3xl font-bold text-orange-600 mb-1 group-hover:scale-105 transition-transform inline-block">
									{thisYearStats.hours.toFixed(1)}
								</p>
								<p className="text-xs text-muted-foreground">小时</p>
								{thisYearStats.days > 0 && (
									<div className="mt-3">
										<div className="flex items-center gap-2 text-xs text-muted-foreground">
											<Star className="h-3 w-3 text-orange-600" />
											<span>日均: <span className="font-semibold text-orange-600">{(thisYearStats.hours / thisYearStats.days).toFixed(2)}</span> 小时</span>
										</div>
									</div>
								)}
							</div>
							<div className="h-14 w-14 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
								<Target className="h-7 w-7 text-orange-600" />
							</div>
						</div>
					</CardContent>
				</Card>
					</div>

					{/* 最近打卡和考勤统计 */}
					<div className="grid gap-6 lg:grid-cols-3">
						{/* 最近打卡 */}
						<Card className="lg:col-span-1 shadow-md hover:shadow-lg transition-shadow">
							<CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/10">
								<CardTitle className="flex items-center gap-2 text-lg font-semibold">
									<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
										<Activity className="h-5 w-5 text-primary" />
									</div>
									最近打卡
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-6">
								{recentRecords.length === 0 ? (
									<div className="text-center py-12">
										<Activity className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
										<p className="text-sm text-muted-foreground">暂无打卡记录</p>
									</div>
								) : (
									<div className="space-y-3">
										{recentRecords.map((record: any, index: number) => {
											const statusBadge = getStatusBadge(record.status);
											const isToday = dayjs(record.date).isSame(dayjs(), "day");
											return (
												<div 
													key={record.id || index} 
													className={`flex items-start gap-3 p-4 rounded-lg hover:bg-muted/60 transition-all duration-200 border ${
														isToday 
															? "bg-primary/5 border-primary/30 shadow-sm" 
															: "bg-muted/30 border-border/50"
													}`}
												>
													<div className="flex-shrink-0 mt-0.5">
														<div className={`h-3 w-3 rounded-full ${
															statusBadge.variant === "default" ? "bg-green-500" :
															statusBadge.variant === "secondary" ? "bg-orange-500" :
															"bg-gray-400"
														} shadow-sm`}></div>
													</div>
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2 mb-2">
															<span className={`font-semibold text-sm ${
																isToday ? "text-primary" : "text-foreground"
															}`}>
																{isToday ? "今天" : dayjs(record.date).format("MM月DD日")}
															</span>
															<Badge 
																variant={statusBadge.variant} 
																className={`text-xs px-2 py-0.5 ${
																	statusBadge.variant === "default" ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800" :
																	statusBadge.variant === "secondary" ? "bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800" :
																	""
																}`}
															>
																{statusBadge.label}
															</Badge>
														</div>
														{record.checkIn && (
															<div className="text-xs text-muted-foreground flex items-center gap-1.5">
																<Clock className="h-3.5 w-3.5" />
																<span className="font-medium">{record.checkIn}</span>
															</div>
														)}
														{record.hours && record.hours > 0 && (
															<div className="text-xs text-muted-foreground mt-1">
																工时: <span className="font-semibold text-green-600">{record.hours.toFixed(1)}h</span>
															</div>
														)}
													</div>
												</div>
											);
										})}
									</div>
								)}
							</CardContent>
						</Card>

						{/* 考勤统计详情 */}
						<Card className="lg:col-span-2 shadow-md hover:shadow-lg transition-shadow">
							<CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
								<CardTitle className="flex items-center gap-2 text-lg font-semibold">
									<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
										<BarChart3 className="h-5 w-5 text-primary" />
									</div>
									考勤统计详情
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-6">
								{/* 主要指标 */}
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
									<div className="text-center p-5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20 shadow-sm hover:shadow-md transition-shadow">
										<div className="text-3xl font-bold text-primary mb-1">{totalDays}</div>
										<div className="text-sm font-medium text-muted-foreground">总打卡天数</div>
										<div className="text-xs text-muted-foreground mt-1">累计天数</div>
									</div>
									<div className="text-center p-5 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-shadow">
										<div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{presentDays}</div>
										<div className="text-sm font-medium text-muted-foreground">正常出勤</div>
										<div className="text-xs text-green-600 dark:text-green-400 mt-1">
											{totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0}%
										</div>
									</div>
									<div className="text-center p-5 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800 shadow-sm hover:shadow-md transition-shadow">
										<div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">{lateDays}</div>
										<div className="text-sm font-medium text-muted-foreground">迟到</div>
										<div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
											{totalDays > 0 ? ((lateDays / totalDays) * 100).toFixed(1) : 0}%
										</div>
									</div>
									<div className="text-center p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
										<div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{attendanceRate}%</div>
										<div className="text-sm font-medium text-muted-foreground">出勤率</div>
										<div className="mt-3">
											<Progress 
												value={parseFloat(attendanceRate)} 
												className="h-2"
											/>
										</div>
										<div className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center justify-center gap-1">
											<TrendingUp className="h-3 w-3" />
											整体表现
										</div>
									</div>
								</div>

								{/* 次要指标 */}
								<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
									<div className="text-center p-4 bg-muted/40 rounded-lg border border-border/50 hover:bg-muted/60 transition-colors">
										<div className="text-xl font-bold text-foreground mb-1">{totalRecords}</div>
										<div className="text-xs text-muted-foreground">总打卡次数</div>
									</div>
									<div className="text-center p-4 bg-muted/40 rounded-lg border border-border/50 hover:bg-muted/60 transition-colors">
										<div className="text-xl font-bold text-foreground mb-1">{totalHours.toFixed(1)}</div>
										<div className="text-xs text-muted-foreground">总工时(小时)</div>
									</div>
									<div className="text-center p-4 bg-muted/40 rounded-lg border border-border/50 hover:bg-muted/60 transition-colors">
										<div className="text-xl font-bold text-foreground mb-1">{avgHoursPerDay.toFixed(1)}</div>
										<div className="text-xs text-muted-foreground">日均工时</div>
									</div>
									<div className="text-center p-4 bg-muted/40 rounded-lg border border-border/50 hover:bg-muted/60 transition-colors">
										<div className="text-xl font-bold text-foreground mb-1">{totalDays > 0 ? (totalRecords / totalDays).toFixed(1) : 0}</div>
										<div className="text-xs text-muted-foreground">日均打卡次数</div>
									</div>
								</div>

								{/* 其他状态 */}
								<div className="flex flex-wrap gap-2 pt-4 border-t">
									<Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
										早退: {earlyLeaveDays}
									</Badge>
									<Badge variant="outline" className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
										缺勤: {absentDays}
									</Badge>
									<Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
										请假: {onLeaveDays}
									</Badge>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* 详细信息标签页 */}
				<TabsContent value="details" className="space-y-6">
					{/* 联系信息 */}
					<Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-all duration-300 hover:border-l-primary/80">
						<CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/10">
							<CardTitle className="flex items-center gap-2 text-lg font-semibold">
								<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
									<Contact className="h-5 w-5 text-primary" />
								</div>
								联系信息
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="space-y-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200 border border-border/50 hover:border-primary/30 hover:shadow-sm cursor-pointer">
											<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
												<Fingerprint className="h-4 w-4 text-primary" />
												深圳义工号
											</div>
											<div className="text-base font-mono font-bold text-foreground">{volunteer.volunteerId || <span className="text-muted-foreground font-normal">未填写</span>}</div>
										</div>
									</TooltipTrigger>
									{volunteer.volunteerId && (
										<TooltipContent>
											<p>深圳义工号: {volunteer.volunteerId}</p>
										</TooltipContent>
									)}
								</Tooltip>
								<div className="space-y-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50">
									<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
										<Phone className="h-4 w-4 text-primary" />
										手机号
									</div>
									<div className="text-base font-semibold text-foreground">{volunteer.phone || <span className="text-muted-foreground font-normal">未填写</span>}</div>
								</div>
								<div className="space-y-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50">
									<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
										<CreditCard className="h-4 w-4 text-primary" />
										身份证
									</div>
									<div className="text-base font-mono text-foreground">{volunteer.idNumber || <span className="text-muted-foreground font-normal">未填写</span>}</div>
								</div>
								<div className="space-y-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50">
									<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
										<Mail className="h-4 w-4 text-primary" />
										邮箱
									</div>
									<div className="text-base text-foreground break-all">{volunteer.email || <span className="text-muted-foreground font-normal">未填写</span>}</div>
								</div>
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="space-y-2 p-4 rounded-lg bg-red-50/50 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 border border-red-200/50 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700 hover:shadow-sm cursor-pointer">
											<div className="flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-400 mb-2">
												<Users className="h-4 w-4" />
												紧急联系
											</div>
											<div className="text-base font-semibold text-red-700 dark:text-red-300">{volunteer.emergencyContact || <span className="text-muted-foreground font-normal">未填写</span>}</div>
										</div>
									</TooltipTrigger>
									{volunteer.emergencyContact && (
										<TooltipContent>
											<p>紧急联系人: {volunteer.emergencyContact}</p>
										</TooltipContent>
									)}
								</Tooltip>
								<div className="space-y-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50 md:col-span-2">
									<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
										<MapPin className="h-4 w-4 text-primary" />
										地址
									</div>
									<div className="text-base text-foreground leading-relaxed">{volunteer.address || <span className="text-muted-foreground font-normal">未填写</span>}</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* 佛教与信仰 */}
					<Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all duration-300 hover:border-l-blue-400">
						<CardHeader className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border-b border-blue-500/10">
							<CardTitle className="flex items-center gap-2 text-lg font-semibold">
								<div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors">
									<Heart className="h-5 w-5 text-blue-600" />
								</div>
								佛教与信仰
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
									<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
										<Sparkles className="h-3.5 w-3.5" />
										法名
									</div>
									<div className="text-sm font-semibold text-foreground">{volunteer.dharmaName || <span className="text-muted-foreground">未填写</span>}</div>
								</div>
								<div className="space-y-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
									<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
										<GraduationCap className="h-3.5 w-3.5" />
										学历
									</div>
									<div className="text-sm font-semibold">
										{volunteer.education === "high_school" ? "高中" :
										 volunteer.education === "bachelor" ? "本科" :
										 volunteer.education === "master" ? "硕士" :
										 volunteer.education === "phd" ? "博士" :
										 volunteer.education === "middle_school" ? "初中" :
										 volunteer.education === "elementary" ? "小学" :
										 volunteer.education === "none" ? "无" :
										 volunteer.education || <span className="text-muted-foreground">未填写</span>}
									</div>
								</div>
								<div className="space-y-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
									<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
										<Scroll className="h-3.5 w-3.5" />
										皈依状态
									</div>
									<div className="text-sm font-semibold">
										{volunteer.refugeStatus === "five_precepts" ? (
											<Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
												受五戒
											</Badge>
										) : volunteer.refugeStatus === "took_refuge" ? (
											<Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
												已皈依
											</Badge>
										) : volunteer.refugeStatus === "bodhisattva" ? (
											<Badge variant="outline" className="bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
												菩萨戒
											</Badge>
										) : volunteer.refugeStatus === "none" ? (
											<span className="text-muted-foreground">未皈依</span>
										) : (
											<span className="text-muted-foreground">未填写</span>
										)}
									</div>
								</div>
								<div className="space-y-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
									<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
										<UserCog className="h-3.5 w-3.5" />
										宗教身份
									</div>
									<div className="text-sm font-semibold">
										{volunteer.religiousBackground === "upasaka" ? "居士（男）" :
										 volunteer.religiousBackground === "upasika" ? "居士（女）" :
										 volunteer.religiousBackground === "sramanera" ? "沙弥" :
										 volunteer.religiousBackground === "sramanerika" ? "沙弥尼" :
										 volunteer.religiousBackground === "bhikkhu" ? "比丘" :
										 volunteer.religiousBackground === "bhikkhuni" ? "比丘尼" :
										 volunteer.religiousBackground || <span className="text-muted-foreground">未填写</span>}
									</div>
								</div>
								<div className="space-y-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors md:col-span-2">
									<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
										<Heart className="h-3.5 w-3.5" />
										是否信佛
									</div>
									<div className="text-sm">
										<Badge variant={volunteer.hasBuddhismFaith ? "default" : "secondary"} className={volunteer.hasBuddhismFaith ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800" : ""}>
											{volunteer.hasBuddhismFaith ? "是" : "否"}
										</Badge>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* 义工服务 */}
					<Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-all duration-300 hover:border-l-green-400">
						<CardHeader className="bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent border-b border-green-500/10">
							<CardTitle className="flex items-center gap-2 text-lg font-semibold">
								<div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-800/40 transition-colors">
									<Shield className="h-5 w-5 text-green-600" />
								</div>
								义工服务
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
									<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
										<Briefcase className="h-3.5 w-3.5" />
										服务岗位
									</div>
									<div className="text-sm font-semibold">
										{volunteer.severPosition === "kitchen" ? "厨房" :
										 volunteer.severPosition === "chanting" ? "助念" :
										 volunteer.severPosition === "cleaning" ? "清洁" :
										 volunteer.severPosition === "reception" ? "接待" :
										 volunteer.severPosition === "security" ? "安保" :
										 volunteer.severPosition === "office" ? "办公室" :
										 volunteer.severPosition === "other" ? "其他" :
										 volunteer.severPosition || <span className="text-muted-foreground">未填写</span>}
									</div>
								</div>
								<div className="space-y-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
									<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
										<CalendarClock className="h-3.5 w-3.5" />
										服务时间
									</div>
									<div className="text-sm font-semibold">{volunteer.availableTimes || <span className="text-muted-foreground">未填写</span>}</div>
								</div>
								<div className="space-y-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
									<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
										<Activity className="h-3.5 w-3.5" />
										健康状况
									</div>
									<div className="text-sm font-semibold">
										{volunteer.healthConditions === "healthy" ? (
											<Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
												健康
											</Badge>
										) : volunteer.healthConditions === "has_chronic_disease" ? (
											<Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
												有慢性病
											</Badge>
										) : volunteer.healthConditions === "has_disability" ? (
											<Badge variant="outline" className="bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800">
												有残疾
											</Badge>
										) : volunteer.healthConditions === "has_allergies" ? (
											<Badge variant="outline" className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
												有过敏
											</Badge>
										) : volunteer.healthConditions || <span className="text-muted-foreground">未填写</span>}
									</div>
								</div>
								<div className="space-y-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
									<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
										<ThumbsUp className="h-3.5 w-3.5" />
										家属同意
									</div>
									<div className="text-sm font-semibold">
										{volunteer.familyConsent === "approved" ? (
											<Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
												同意
											</Badge>
										) : volunteer.familyConsent === "partial" ? (
											<Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
												部分同意
											</Badge>
										) : volunteer.familyConsent === "rejected" ? (
											<Badge variant="outline" className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
												不同意
											</Badge>
										) : volunteer.familyConsent === "self_decided" ? (
											<Badge variant="outline">
												自主决定
											</Badge>
										) : <span className="text-muted-foreground">未填写</span>}
									</div>
								</div>
								<div className="space-y-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
									<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
										<Calendar className="h-3.5 w-3.5" />
										加入时间
									</div>
									<div className="text-sm font-mono font-semibold">
										{volunteer.createdAt ? dayjs(volunteer.createdAt).format("YYYY-MM-DD") : <span className="text-muted-foreground">未填写</span>}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* 其他信息 */}
					<Card className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-all duration-300 hover:border-l-orange-400">
						<CardHeader className="bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent border-b border-orange-500/10">
							<CardTitle className="flex items-center gap-2 text-lg font-semibold">
								<div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center hover:bg-orange-200 dark:hover:bg-orange-800/40 transition-colors">
									<FileText className="h-5 w-5 text-orange-600" />
								</div>
								其他信息
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-6 space-y-6">
							<div className="space-y-3">
								<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
									<MessageSquare className="h-4 w-4 text-orange-600" />
									加入原因
								</div>
								<div className="text-sm bg-muted/40 dark:bg-muted/60 p-5 rounded-lg leading-relaxed min-h-[80px] border border-border/50 shadow-inner">
									{volunteer.joinReason ? (
										<p className="text-foreground whitespace-pre-wrap">{volunteer.joinReason}</p>
									) : (
										<p className="text-muted-foreground italic">未填写</p>
									)}
								</div>
							</div>
							<div className="space-y-3">
								<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
									<Palette className="h-4 w-4 text-orange-600" />
									爱好特长
								</div>
								<div className="text-sm bg-muted/40 dark:bg-muted/60 p-5 rounded-lg leading-relaxed min-h-[80px] border border-border/50 shadow-inner">
									{volunteer.hobbies ? (
										<p className="text-foreground whitespace-pre-wrap">{volunteer.hobbies}</p>
									) : (
										<p className="text-muted-foreground italic">未填写</p>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* 考勤记录标签页 */}
				<TabsContent value="attendance" className="space-y-6">
			<Card className="shadow-md hover:shadow-lg transition-shadow">
				<CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2 text-lg font-semibold">
							<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
								<Clock className="h-5 w-5 text-primary" />
							</div>
							每日考勤记录
						</CardTitle>
						<Button variant="outline" size="sm" onClick={handleExport} className="hover:bg-primary hover:text-primary-foreground">
							<Download className="h-4 w-4 mr-2" />
							导出
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{/* 日期筛选 */}
					<div className="space-y-4 mb-6 p-4 bg-muted/30 rounded-lg border border-border/50">
						{/* 快速日期选择 */}
						<div>
							<label className="text-sm font-medium text-muted-foreground mb-3 block">快速选择</label>
							<div className="flex flex-wrap gap-2">
								{[
									{ label: "今天", action: () => {
										setStartDate(dayjs().format("YYYY-MM-DD"));
										setEndDate(dayjs().format("YYYY-MM-DD"));
									}},
									{ label: "本周", action: () => {
										setStartDate(dayjs().startOf("week").format("YYYY-MM-DD"));
										setEndDate(dayjs().format("YYYY-MM-DD"));
									}},
									{ label: "本月", action: () => {
										setStartDate(dayjs().startOf("month").format("YYYY-MM-DD"));
										setEndDate(dayjs().format("YYYY-MM-DD"));
									}},
									{ label: "本年", action: () => {
										setStartDate(dayjs().startOf("year").format("YYYY-MM-DD"));
										setEndDate(dayjs().format("YYYY-MM-DD"));
									}},
									{ label: "近30天", action: () => {
										setStartDate(dayjs().subtract(30, "day").format("YYYY-MM-DD"));
										setEndDate(dayjs().format("YYYY-MM-DD"));
									}},
								].map((btn) => {
									const isActive = 
										(btn.label === "今天" && startDate === dayjs().format("YYYY-MM-DD") && endDate === dayjs().format("YYYY-MM-DD")) ||
										(btn.label === "本周" && startDate === dayjs().startOf("week").format("YYYY-MM-DD") && endDate === dayjs().format("YYYY-MM-DD")) ||
										(btn.label === "本月" && startDate === dayjs().startOf("month").format("YYYY-MM-DD") && endDate === dayjs().format("YYYY-MM-DD")) ||
										(btn.label === "本年" && startDate === dayjs().startOf("year").format("YYYY-MM-DD") && endDate === dayjs().format("YYYY-MM-DD")) ||
										(btn.label === "近30天" && startDate === dayjs().subtract(30, "day").format("YYYY-MM-DD") && endDate === dayjs().format("YYYY-MM-DD"));
									return (
										<Button
											key={btn.label}
											variant={isActive ? "default" : "outline"}
											size="sm"
											onClick={btn.action}
											className={isActive ? "shadow-sm" : ""}
										>
											{btn.label}
										</Button>
									);
								})}
							</div>
						</div>
						<Separator />
						{/* 自定义日期范围 */}
						<div>
							<label className="text-sm font-medium text-muted-foreground mb-3 block">自定义日期范围</label>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
										<Calendar className="h-3.5 w-3.5" />
										开始日期
									</label>
									<Input
										type="date"
										value={startDate}
										onChange={(e) => setStartDate(e.target.value)}
										className="h-10"
									/>
								</div>
								<div className="space-y-2">
									<label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
										<Calendar className="h-3.5 w-3.5" />
										结束日期
									</label>
									<Input
										type="date"
										value={endDate}
										onChange={(e) => setEndDate(e.target.value)}
										className="h-10"
									/>
								</div>
								<div className="flex items-end">
									<Button
										onClick={() => refetchCheckin()}
										className="w-full h-10"
										variant="default"
									>
										<Clock className="h-4 w-4 mr-2" />
										查询
									</Button>
								</div>
							</div>
						</div>
					</div>

					<Separator className="my-4" />

					{/* 按日期分组的考勤记录 */}
					{Object.keys(recordsByDate).length === 0 ? (
						<div className="text-center py-16">
							<Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
							<p className="text-muted-foreground font-medium">该时间段内暂无考勤记录</p>
							<p className="text-sm text-muted-foreground mt-2">请选择其他日期范围查看</p>
						</div>
					) : (
						<div className="space-y-6">
							{Object.entries(recordsByDate)
								.sort(([a], [b]) => dayjs(b).valueOf() - dayjs(a).valueOf())
								.map(([date, records]: [string, any]) => {
									const isToday = dayjs(date).isSame(dayjs(), "day");
									return (
										<div key={date} className="space-y-3">
											<div className={`flex items-center gap-3 mb-3 pb-3 border-b ${
												isToday ? "border-primary/30" : "border-border"
											}`}>
												<div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
													isToday 
														? "bg-primary/10 text-primary" 
														: "bg-muted text-muted-foreground"
												}`}>
													<Calendar className="h-5 w-5" />
												</div>
												<div className="flex-1">
													<h3 className={`font-semibold text-base ${
														isToday ? "text-primary" : "text-foreground"
													}`}>
														{isToday ? "今天" : dayjs(date).format("YYYY年MM月DD日")} 
														{!isToday && <span className="text-sm font-normal text-muted-foreground ml-2">
															{dayjs(date).format("dddd")}
														</span>}
													</h3>
												</div>
												<Badge 
													variant="outline" 
													className={isToday ? "bg-primary/10 border-primary/30 text-primary" : ""}
												>
													{records.length} 条记录
												</Badge>
											</div>
											<div className="bg-muted/20 rounded-xl p-4 space-y-3 border border-border/50">
												{records.map((record: any, idx: number) => {
													const statusBadge = getStatusBadge(record.status);
													return (
														<div
															key={record.id || idx}
															className="flex items-center justify-between p-4 bg-background rounded-lg border border-border/50 hover:shadow-md hover:border-primary/30 transition-all duration-200"
														>
															<div className="flex items-center gap-4 flex-1">
																<div className="flex items-center gap-3">
																	<div className={`h-2 w-2 rounded-full ${
																		statusBadge.variant === "default" ? "bg-green-500" :
																		statusBadge.variant === "secondary" ? "bg-orange-500" :
																		"bg-gray-400"
																	}`}></div>
																	<Clock className="h-4 w-4 text-muted-foreground" />
																	<span className="font-semibold text-base">
																		{record.checkIn || "未打卡"}
																	</span>
																</div>
																{record.status && (
																	<Badge 
																		variant={statusBadge.variant}
																		className={
																			statusBadge.variant === "default" ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800" :
																			statusBadge.variant === "secondary" ? "bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800" :
																			""
																		}
																	>
																		{statusBadge.label}
																	</Badge>
																)}
																{record.hours && record.hours > 0 && (
																	<Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
																		工时: {record.hours.toFixed(1)}h
																	</Badge>
																)}
															</div>
															<div className="text-sm text-muted-foreground flex items-center gap-4">
																{record.location && (
																	<span className="flex items-center gap-1">
																		<MapPin className="h-3.5 w-3.5" />
																		{record.location}
																	</span>
																)}
																{record.deviceSn && (
																	<span className="flex items-center gap-1 font-mono text-xs">
																		🔧 {record.deviceSn}
																	</span>
																)}
															</div>
														</div>
													);
												})}
											</div>
										</div>
									);
								})}
						</div>
					)}
				</CardContent>
			</Card>
				</TabsContent>
			</Tabs>
		</div>
		</TooltipProvider>
	);
}
