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

import { NavMain } from "@/components/nav-main";
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

	// 根据当前路由匹配导航项标题
	const currentNavItem = navMain.find((item) => {
		if (item.url === "/") {
			return location.pathname === "/";
		}
		return location.pathname.startsWith(item.url);
	});
	const currentPageTitle = currentNavItem?.title || "首页";

	const userData = {
		name: user?.name || "管理员",
		email: user?.account || "",
		avatar: user?.avatar || "",
	};

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-2"
						>
							<Link to="/">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-primary">
									<Flower2 className="h-5 w-5 text-primary" />
								</div>
								<div className="flex flex-col">
									<span className="text-lg font-bold">莲花斋</span>
									<span className="text-xs text-muted-foreground">v1.0.0</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
				{/* 当前页面标签 */}
				<div className="px-4 pt-2 pb-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
					<span>当前页面：</span>
					<span className="font-medium text-foreground">{currentPageTitle}</span>
				</div>
				{/* 快捷操作按钮 */}
				<div className="px-2 py-2">
					<Button 
						className="w-full group-data-[collapsible=icon]:hidden" 
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
				<NavMain items={navMain} pendingCount={pendingCount} />
			</SidebarContent>
			<SidebarFooter>
				{/* 统计信息 */}
				<div className="px-4 py-2 text-xs text-muted-foreground border-t group-data-[collapsible=icon]:hidden">
					<div className="flex justify-between mb-1">
						<span>义工总数</span>
						<span className="font-medium text-foreground">{totalVolunteers}</span>
					</div>
					<div className="flex justify-between mb-1">
						<span>待审批</span>
						<span className="font-medium text-orange-500">{pendingCount}</span>
					</div>
					<div className="flex justify-between">
						<span>本月总工时</span>
						<span className="font-medium text-foreground">{totalServiceHours.toFixed(1)}</span>
					</div>
				</div>
				
				{/* 用户菜单 */}
				<NavUser user={userData} />
			</SidebarFooter>
		</Sidebar>
	);
}
