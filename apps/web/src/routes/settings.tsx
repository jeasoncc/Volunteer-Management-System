import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { volunteerService } from "@/services/volunteer";
import { User, Lock, Bell } from "lucide-react";

export const Route = createFileRoute("/settings")({
	component: SettingsPage,
} as any);

function SettingsPage() {
	const { isAuthenticated, isLoading: authLoading, user } = useAuth();
	const queryClient = useQueryClient();
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const changePasswordMutation = useMutation({
		mutationFn: () =>
			volunteerService.changePassword(user?.lotusId || "", oldPassword, newPassword),
		onSuccess: () => {
			alert("密码修改成功！请重新登录");
			setOldPassword("");
			setNewPassword("");
			setConfirmPassword("");
		},
		onError: (error: any) => {
			alert(error.message || "密码修改失败");
		},
	});

	if (authLoading) {
		return (
			<DashboardLayout breadcrumbs={[{ label: "首页", href: "/" }, { label: "设置" }]}>
				<div className="flex items-center justify-center h-64">
					<div className="text-muted-foreground">加载中...</div>
				</div>
			</DashboardLayout>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	const handleChangePassword = (e: React.FormEvent) => {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			alert("两次输入的新密码不一致");
			return;
		}

		if (newPassword.length < 6) {
			alert("新密码长度至少6位");
			return;
		}

		changePasswordMutation.mutate();
	};

	return (
		<DashboardLayout breadcrumbs={[{ label: "首页", href: "/" }, { label: "设置" }]}>
			<div className="space-y-6 max-w-4xl">
				<div>
					<h1 className="text-3xl font-bold">设置</h1>
					<p className="mt-2 text-muted-foreground">
						管理您的账户设置和偏好
					</p>
				</div>

				{/* 个人信息 */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<User className="h-5 w-5" />
							<CardTitle>个人信息</CardTitle>
						</div>
						<CardDescription>查看您的基本信息</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="text-sm font-medium text-muted-foreground">
									姓名
								</label>
								<p className="mt-1 text-base">{user?.name}</p>
							</div>
							<div>
								<label className="text-sm font-medium text-muted-foreground">
									莲花斋ID
								</label>
								<p className="mt-1 text-base">{user?.lotusId}</p>
							</div>
							<div>
								<label className="text-sm font-medium text-muted-foreground">
									账号
								</label>
								<p className="mt-1 text-base">{user?.account}</p>
							</div>
							<div>
								<label className="text-sm font-medium text-muted-foreground">
									角色
								</label>
								<p className="mt-1 text-base">
									{user?.lotusRole === "admin"
										? "管理员"
										: user?.lotusRole === "volunteer"
										? "义工"
										: "居民"}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* 修改密码 */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Lock className="h-5 w-5" />
							<CardTitle>修改密码</CardTitle>
						</div>
						<CardDescription>定期修改密码以保护账户安全</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleChangePassword} className="space-y-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">当前密码</label>
								<Input
									type="password"
									value={oldPassword}
									onChange={(e) => setOldPassword(e.target.value)}
									placeholder="请输入当前密码"
									required
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">新密码</label>
								<Input
									type="password"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									placeholder="请输入新密码（至少6位）"
									required
									minLength={6}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">确认新密码</label>
								<Input
									type="password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder="请再次输入新密码"
									required
									minLength={6}
								/>
							</div>
							<Button
								type="submit"
								disabled={changePasswordMutation.isPending}
							>
								{changePasswordMutation.isPending ? "修改中..." : "修改密码"}
							</Button>
						</form>
					</CardContent>
				</Card>

				{/* 通知设置 */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Bell className="h-5 w-5" />
							<CardTitle>通知设置</CardTitle>
						</div>
						<CardDescription>管理您的通知偏好</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">考勤提醒</p>
								<p className="text-sm text-muted-foreground">
									每日考勤打卡提醒
								</p>
							</div>
							<Button variant="outline" size="sm">
								即将推出
							</Button>
						</div>
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">排班通知</p>
								<p className="text-sm text-muted-foreground">
									助念排班变更通知
								</p>
							</div>
							<Button variant="outline" size="sm">
								即将推出
							</Button>
						</div>
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">系统消息</p>
								<p className="text-sm text-muted-foreground">
									系统更新和重要通知
								</p>
							</div>
							<Button variant="outline" size="sm">
								即将推出
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* 系统信息 */}
				<Card>
					<CardHeader>
						<CardTitle>系统信息</CardTitle>
						<CardDescription>关于莲花斋志愿者管理系统</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<div className="flex justify-between">
							<span className="text-muted-foreground">版本</span>
							<span className="font-medium">v1.0.0</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">前端框架</span>
							<span className="font-medium">React + Vite</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">后端框架</span>
							<span className="font-medium">Elysia + Bun</span>
						</div>
					</CardContent>
				</Card>
			</div>
		</DashboardLayout>
	);
}
