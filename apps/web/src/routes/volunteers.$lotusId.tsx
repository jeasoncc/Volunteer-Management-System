import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { volunteerService } from "@/services/volunteer";
import { checkinService } from "@/services/checkin";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Phone, Mail, MapPin, Calendar, Clock, Award } from "lucide-react";
import dayjs from "dayjs";
import { toast } from "@/lib/toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useState } from "react";

export const Route = createFileRoute("/volunteers/$lotusId")({
	component: VolunteerDetailPage,
} as any);

function VolunteerDetailPage() {
	const { lotusId } = Route.useParams();
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const queryClient = useQueryClient();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const { data: volunteerData, isLoading } = useQuery({
		queryKey: ["volunteer", lotusId],
		queryFn: () => volunteerService.getByLotusId(lotusId),
		enabled: isAuthenticated,
	});

	// 获取考勤汇总（最近3个月）
	const startDate = dayjs().subtract(3, "month").format("YYYY-MM-DD");
	const endDate = dayjs().format("YYYY-MM-DD");

	const { data: checkinData } = useQuery({
		queryKey: ["checkin", "user", lotusId],
		queryFn: () => checkinService.getUserSummary(lotusId, startDate, endDate),
		enabled: isAuthenticated && !!lotusId,
	});

	const deleteMutation = useMutation({
		mutationFn: (lotusId: string) => volunteerService.delete(lotusId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			toast.success("删除成功！");
			window.location.hash = "#/volunteers";
		},
		onError: (error: any) => {
			toast.error(error.message || "删除失败");
		},
	});

	if (authLoading || isLoading) {
		return (
			<DashboardLayout
				breadcrumbs={[
					{ label: "首页", href: "/" },
					{ label: "义工管理", href: "/volunteers" },
					{ label: "详情" },
				]}
			>
				<div className="flex items-center justify-center h-64">
					<div className="text-muted-foreground">加载中...</div>
				</div>
			</DashboardLayout>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	const volunteer = volunteerData?.data;

	if (!volunteer) {
		return (
			<DashboardLayout
				breadcrumbs={[
					{ label: "首页", href: "/" },
					{ label: "义工管理", href: "/volunteers" },
					{ label: "详情" },
				]}
			>
				<div className="text-center py-12">
					<p className="text-muted-foreground">义工不存在</p>
					<Link to="/volunteers">
						<Button className="mt-4">返回列表</Button>
					</Link>
				</div>
			</DashboardLayout>
		);
	}

	const checkinSummary = checkinData?.data;

	const statusMap: Record<string, { label: string; variant: any }> = {
		registered: { label: "已注册", variant: "default" },
		trainee: { label: "培训中", variant: "secondary" },
		applicant: { label: "申请中", variant: "outline" },
		inactive: { label: "未激活", variant: "secondary" },
		suspended: { label: "已暂停", variant: "destructive" },
	};

	const genderMap = {
		male: "男",
		female: "女",
		other: "其他",
	};

	const refugeStatusMap = {
		none: "未皈依",
		took_refuge: "已皈依",
		five_precepts: "五戒",
		bodhisattva: "菩萨戒",
	};

	const handleDelete = () => {
		setDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		deleteMutation.mutate(lotusId);
		setDeleteDialogOpen(false);
	};

	return (
		<DashboardLayout
			breadcrumbs={[
				{ label: "首页", href: "/" },
				{ label: "义工管理", href: "/volunteers" },
				{ label: volunteer.name },
			]}
		>
			<div className="space-y-6">
				{/* 头部 */}
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-4">
						<div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
							{volunteer.name.charAt(0)}
						</div>
						<div>
							<h1 className="text-3xl font-bold">{volunteer.name}</h1>
							<p className="text-muted-foreground mt-1">
								{volunteer.lotusId}
								{volunteer.dharmaName && ` · ${volunteer.dharmaName}`}
							</p>
							<div className="flex gap-2 mt-2">
								<Badge variant={statusMap[volunteer.volunteerStatus]?.variant || "outline"}>
									{statusMap[volunteer.volunteerStatus]?.label || volunteer.volunteerStatus}
								</Badge>
								<Badge variant="outline">
									{volunteer.lotusRole === "admin" ? "管理员" : "义工"}
								</Badge>
							</div>
						</div>
					</div>
					<div className="flex gap-2">
						<Link to="/volunteers/$lotusId/edit" params={{ lotusId }}>
							<Button variant="outline">编辑</Button>
						</Link>
						<Button variant="destructive" onClick={handleDelete}>删除</Button>
					</div>
				</div>

				<Separator />

				{/* 统计卡片 */}
				<div className="grid gap-4 md:grid-cols-3">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">总服务时长</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{checkinSummary?.totalHours || 0} 小时
							</div>
							<p className="text-xs text-muted-foreground">最近3个月</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">打卡天数</CardTitle>
							<Calendar className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{checkinSummary?.totalDays || 0} 天
							</div>
							<p className="text-xs text-muted-foreground">最近3个月</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">平均时长</CardTitle>
							<Award className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{checkinSummary?.totalDays
									? (checkinSummary.totalHours / checkinSummary.totalDays).toFixed(1)
									: 0}{" "}
								小时/天
							</div>
							<p className="text-xs text-muted-foreground">最近3个月</p>
						</CardContent>
					</Card>
				</div>

				{/* 详细信息 */}
				<div className="grid gap-6 md:grid-cols-2">
					{/* 基本信息 */}
					<Card>
						<CardHeader>
							<CardTitle>基本信息</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center gap-3">
								<User className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">姓名</p>
									<p className="font-medium">{volunteer.name}</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<User className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">性别</p>
									<p className="font-medium">{genderMap[volunteer.gender]}</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<Phone className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">手机号</p>
									<p className="font-medium">{volunteer.phone}</p>
								</div>
							</div>
							{volunteer.email && (
								<div className="flex items-center gap-3">
									<Mail className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-sm text-muted-foreground">邮箱</p>
										<p className="font-medium">{volunteer.email}</p>
									</div>
								</div>
							)}
							{volunteer.wechat && (
								<div className="flex items-center gap-3">
									<User className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-sm text-muted-foreground">微信号</p>
										<p className="font-medium">{volunteer.wechat}</p>
									</div>
								</div>
							)}
							{volunteer.address && (
								<div className="flex items-center gap-3">
									<MapPin className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-sm text-muted-foreground">地址</p>
										<p className="font-medium">{volunteer.address}</p>
									</div>
								</div>
							)}
							{volunteer.birthDate && (
								<div className="flex items-center gap-3">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-sm text-muted-foreground">出生日期</p>
										<p className="font-medium">
											{dayjs(volunteer.birthDate).format("YYYY-MM-DD")}
										</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* 佛教信息 */}
					<Card>
						<CardHeader>
							<CardTitle>佛教信息</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{volunteer.dharmaName && (
								<div>
									<p className="text-sm text-muted-foreground">法名</p>
									<p className="font-medium">{volunteer.dharmaName}</p>
								</div>
							)}
							<div>
								<p className="text-sm text-muted-foreground">是否有佛教信仰</p>
								<p className="font-medium">
									{volunteer.hasBuddhismFaith ? "是" : "否"}
								</p>
							</div>
							{volunteer.refugeStatus && (
								<div>
									<p className="text-sm text-muted-foreground">皈依状态</p>
									<p className="font-medium">
										{refugeStatusMap[volunteer.refugeStatus] || volunteer.refugeStatus}
									</p>
								</div>
							)}
							{volunteer.religiousBackground && (
								<div>
									<p className="text-sm text-muted-foreground">宗教背景</p>
									<p className="font-medium">{volunteer.religiousBackground}</p>
								</div>
							)}
							{volunteer.education && (
								<div>
									<p className="text-sm text-muted-foreground">学历</p>
									<p className="font-medium">{volunteer.education}</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* 其他信息 */}
					{(volunteer.joinReason || volunteer.hobbies || volunteer.emergencyContact) && (
						<Card className="md:col-span-2">
							<CardHeader>
								<CardTitle>其他信息</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{volunteer.joinReason && (
									<div>
										<p className="text-sm text-muted-foreground">加入原因</p>
										<p className="font-medium">{volunteer.joinReason}</p>
									</div>
								)}
								{volunteer.hobbies && (
									<div>
										<p className="text-sm text-muted-foreground">兴趣爱好</p>
										<p className="font-medium">{volunteer.hobbies}</p>
									</div>
								)}
								{volunteer.emergencyContact && (
									<div>
										<p className="text-sm text-muted-foreground">紧急联系人</p>
										<p className="font-medium">{volunteer.emergencyContact}</p>
									</div>
								)}
								{volunteer.healthConditions && (
									<div>
										<p className="text-sm text-muted-foreground">健康状况</p>
										<p className="font-medium">{volunteer.healthConditions}</p>
									</div>
								)}
							</CardContent>
						</Card>
					)}
				</div>

				{/* 系统信息 */}
				<Card>
					<CardHeader>
						<CardTitle>系统信息</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-4 md:grid-cols-3">
						<div>
							<p className="text-sm text-muted-foreground">账号</p>
							<p className="font-medium">{volunteer.account}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">身份证号</p>
							<p className="font-medium">{volunteer.idNumber}</p>
						</div>
						{volunteer.volunteerId && (
							<div>
								<p className="text-sm text-muted-foreground">义工编号</p>
								<p className="font-medium">{volunteer.volunteerId}</p>
							</div>
						)}
						<div>
							<p className="text-sm text-muted-foreground">创建时间</p>
							<p className="font-medium">
								{volunteer.createdAt
									? dayjs(volunteer.createdAt).format("YYYY-MM-DD HH:mm")
									: "-"}
							</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">更新时间</p>
							<p className="font-medium">
								{volunteer.updatedAt
									? dayjs(volunteer.updatedAt).format("YYYY-MM-DD HH:mm")
									: "-"}
							</p>
						</div>
					</CardContent>
				</Card>

				{/* 删除确认对话框 */}
				<ConfirmDialog
					open={deleteDialogOpen}
					onClose={() => setDeleteDialogOpen(false)}
					onConfirm={confirmDelete}
					title="删除义工"
					description={`确定要删除义工"${volunteer.name}"吗？此操作不可恢复。`}
					variant="destructive"
					items={[volunteer.name]}
					isLoading={deleteMutation.isPending}
				/>
			</div>
		</DashboardLayout>
	);
}
