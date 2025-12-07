import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Shield, Clock, Monitor, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { toast } from "@/lib/toast";

interface LoginHistory {
	ip: string;
	device: string;
	location: string;
	time: string;
}

export function SecuritySettings() {
	const { user, logout } = useAuth();
	const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);

	useEffect(() => {
		// 从 localStorage 加载登录历史
		try {
			const stored = localStorage.getItem("login-history");
			if (stored) {
				setLoginHistory(JSON.parse(stored));
			}
		} catch (error) {
			console.error("Failed to load login history:", error);
		}
	}, []);

	const handleLogoutAll = () => {
		if (confirm("确定要退出所有设备吗？这将清除所有登录会话。")) {
			try {
				// 清除登录历史
				localStorage.removeItem("login-history");
				toast.success("已退出所有设备");
				// 执行登出
				logout();
			} catch (error) {
				toast.error("操作失败");
			}
		}
	};

	const getCurrentDevice = () => {
		const ua = navigator.userAgent;
		if (ua.includes("Mobile")) {
			return "移动设备";
		} else if (ua.includes("Tablet")) {
			return "平板设备";
		} else {
			return "桌面设备";
		}
	};

	const getCurrentLocation = () => {
		// 这里可以集成 IP 定位服务
		return "未知位置";
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Shield className="h-5 w-5" />
					<CardTitle>账户安全</CardTitle>
				</div>
				<CardDescription>管理您的账户安全设置</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* 当前会话 */}
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<Monitor className="h-4 w-4" />
						<Label className="text-base font-semibold">当前会话</Label>
					</div>
					<div className="pl-6 space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">设备类型</span>
							<span className="font-medium">{getCurrentDevice()}</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">登录时间</span>
							<span className="font-medium">
								{new Date().toLocaleString("zh-CN")}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">位置</span>
							<span className="font-medium">{getCurrentLocation()}</span>
						</div>
					</div>
				</div>

				<Separator />

				{/* 登录历史 */}
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<Clock className="h-4 w-4" />
						<Label className="text-base font-semibold">登录历史</Label>
					</div>
					<div className="pl-6">
						{loginHistory.length > 0 ? (
							<div className="space-y-3">
								{loginHistory.slice(0, 5).map((history, index) => (
									<div key={index} className="text-sm space-y-1 p-2 rounded border">
										<div className="flex justify-between">
											<span className="font-medium">{history.device}</span>
											<span className="text-muted-foreground">{history.time}</span>
										</div>
										<div className="flex justify-between text-xs text-muted-foreground">
											<span>{history.location}</span>
											<span>{history.ip}</span>
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-muted-foreground">暂无登录历史</p>
						)}
					</div>
				</div>

				<Separator />

				{/* 安全操作 */}
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<Shield className="h-4 w-4" />
						<Label className="text-base font-semibold">安全操作</Label>
					</div>
					<div className="pl-6">
						<Button variant="outline" size="sm" onClick={handleLogoutAll}>
							<LogOut className="h-4 w-4 mr-2" />
							退出所有设备
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

