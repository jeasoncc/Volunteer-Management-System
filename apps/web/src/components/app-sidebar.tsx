import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
	Home,
	Users,
	ClipboardCheck,
	Shield,
	Settings,
	FileText,
	Flower2,
	Plus,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { approvalService } from "@/services/approval";
import { checkinService } from "@/services/checkin";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user, isAuthenticated } = useAuth();
	const location = useLocation();

	// 获取待审批数量
	const { data: pendingData } = useQuery({
		queryKey: ["approval", "pending", "count"],
		queryFn: async () => {
			if (!isAuthenticated) return { data: { total: 0 } };
			return approvalService.getPendingList({ page: 1, pageSize: 1 });
		},
		refetchInterval: isAuthenticated ? 30000 : false,
		staleTime: 10000,
	});

	// 获取义工总数
	const { data: volunteersData } = useQuery({
		queryKey: ["volunteers", "stats"],
		queryFn: async () => {
			if (!isAuthenticated) return { data: { total: 0 } };
			const response = await fetch("/api/volunteers?page=1&pageSize=1", {
				credentials: "include",
			});
			return response.json();
		},
		refetchInterval: isAuthenticated ? 60000 : false,
		staleTime: 30000,
	});

	// 获取本月服务总工时（汇总所有义工）
	const currentDate = new Date();
	const { data: monthlyReport } = useQuery({
		queryKey: [
			"checkin",
			"monthly-report",
			currentDate.getFullYear(),
			currentDate.getMonth() + 1,
		],
		queryFn: async () => {
			if (!isAuthenticated) {
				return null;
			}
			try {
				return await checkinService.getMonthlyReport({
					year: currentDate.getFullYear(),
					month: currentDate.getMonth() + 1,
				});
			} catch (error) {
				// 接口失败时返回 null，避免影响侧边栏渲染
				console.error("获取月度考勤报表失败:", error);
				return null;
			}
		},
		enabled: isAuthenticated,
		staleTime: 5 * 60 * 1000,
		refetchInterval: isAuthenticated ? 10 * 60 * 1000 : false,
	});

	const pendingCount = pendingData?.data?.total || 0;
	const totalVolunteers = volunteersData?.data?.total || 0;
	const monthlyReports = (monthlyReport as any)?.reports || (monthlyReport as any)?.data?.reports || [];
	const totalServiceHours = Array.isArray(monthlyReports)
		? monthlyReports.reduce(
				(sum: number, item: any) => sum + (item.totalHours || 0),
				0,
		  )
		: 0;

	const navMain = [
		{
			title: "首页",
			url: "/",
			icon: Home,
		},
		{
			title: "义工管理",
			url: "/volunteers",
			icon: Users,
			badge: "pending", // 待审批徽章显示在义工管理上
		},
		{
			title: "往生者管理",
			url: "/deceased",
			icon: Flower2,
		},
		{
			title: "助念排班",
			url: "/chanting",
			icon: ClipboardCheck,
		},
		{
			title: "考勤管理",
			url: "/checkin",
			icon: ClipboardCheck,
		},
		{
			title: "文档管理",
			url: "/documents",
			icon: FileText,
		},
		{
			title: "设备与同步",
			url: "/devices",
			icon: ClipboardCheck,
		},
		{
			title: "管理员管理",
			url: "/admin",
			icon: Shield,
		},
		{
			title: "设置",
			url: "/settings",
			icon: Settings,
		},
	];

	const userData = {
		name: user?.name || "管理员",
		email: user?.account || "",
		avatar: user?.avatar || "",
	};

	return (
		<Sidebar collapsible="icon" {...props} className="border-r-0 shadow-xl bg-card/50 backdrop-blur-xl">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-2 hover:bg-transparent active:bg-transparent"
						>
							<Link to="/">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
									<Flower2 className="h-5 w-5" />
								</div>
								<div className="flex flex-col gap-0.5 leading-none">
									<span className="text-lg font-bold tracking-tight">莲花斋</span>
									<span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">v1.0.0</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
				{/* 快捷操作按钮 */}
				<div className="px-2 py-2">
					<Button 
						className="w-full shadow-sm group-data-[collapsible=icon]:hidden bg-primary/90 hover:bg-primary" 
						size="sm"
						asChild
					>
						<Link to="/volunteers" search={{ action: "add" }}>
							<Plus className="h-4 w-4 mr-2" />
							添加义工
						</Link>
					</Button>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>平台功能</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navMain.map((item) => {
								const isActive = item.url === "/" 
									? location.pathname === "/" 
									: location.pathname.startsWith(item.url);
								
								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											tooltip={item.title}
											className={`
												relative overflow-hidden transition-all duration-200
												${isActive 
													? "bg-primary/10 text-primary font-medium shadow-sm" 
													: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
												}
											`}
										>
											<Link to={item.url}>
												{/* 左侧激活指示器 */}
												{isActive && (
													<div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
												)}
												
												<item.icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-primary" : ""}`} />
												<span>{item.title}</span>
												
												{/* 待审批徽章 */}
												{item.badge === "pending" && pendingCount > 0 && (
													<span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white shadow-sm">
														{pendingCount > 99 ? "99+" : pendingCount}
													</span>
												)}
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				{/* 统计信息 */}
				<div className="mx-2 mb-2 p-3 rounded-xl bg-muted/30 border border-border/50 group-data-[collapsible=icon]:hidden">
					<div className="space-y-2">
						<div className="flex justify-between items-center text-xs">
							<span className="text-muted-foreground">义工总数</span>
							<span className="font-semibold text-foreground bg-background px-1.5 py-0.5 rounded border shadow-sm">{totalVolunteers}</span>
						</div>
						<div className="flex justify-between items-center text-xs">
							<span className="text-muted-foreground">本月工时</span>
							<span className="font-semibold text-foreground bg-background px-1.5 py-0.5 rounded border shadow-sm">{totalServiceHours.toFixed(0)}</span>
						</div>
					</div>
				</div>
				
				{/* 用户菜单 */}
				<NavUser user={userData} />
			</SidebarFooter>
		</Sidebar>
	);
}
