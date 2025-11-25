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
	Plus
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import { LotusLogo } from "@/components/ui/lotus-logo";
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
	SidebarGroupContent,
	useSidebar
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { approvalService } from "@/services/approval";
import { checkinService } from "@/services/checkin";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user, isAuthenticated } = useAuth();
	const location = useLocation();
	// const { state } = useSidebar(); // 获取侧边栏状态

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
			const { api } = await import("@/lib/api");
			return api.get("/api/volunteers?page=1&pageSize=1");
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
			icon: LotusLogo,
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
		<Sidebar collapsible="icon" {...props} className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm">
			<SidebarHeader className="pb-4 pt-4">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-2 hover:bg-sidebar-accent active:bg-sidebar-accent"
						>
							<Link to="/">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground">
									<LotusLogo className="h-6 w-6" />
								</div>
								<div className="flex flex-col gap-0.5 leading-none min-w-0 items-start justify-center">
									<span className="text-lg font-serif font-bold tracking-wide text-sidebar-foreground truncate">生命关怀</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
				
				{/* 快捷操作按钮 - 仅在展开时显示 */}
				<div className="px-2 py-2 group-data-[collapsible=icon]:hidden">
					<Button 
						className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 shadow-none border border-transparent rounded-sm" 
						size="sm"
						asChild
					>
						<Link to="/volunteers" search={{ action: "add" }}>
							<Plus className="h-4 w-4 mr-2" />
							<span className="font-serif tracking-wide">新增义工</span>
						</Link>
					</Button>
				</div>
			</SidebarHeader>
			
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className="text-sidebar-foreground/50 font-serif tracking-widest text-xs">目录</SidebarGroupLabel>
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
												relative transition-all duration-200 rounded-sm my-0.5
												${isActive 
													? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
													: "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
												}
											`}
										>
											<Link to={item.url}>
												<item.icon className={`h-4 w-4 shrink-0 opacity-80`} />
												<span className="font-medium tracking-wide">{item.title}</span>
												
												{/* 待审批徽章 */}
												{item.badge === "pending" && pendingCount > 0 && (
													<span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground shadow-sm">
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
			
			<SidebarFooter className="border-t border-sidebar-border/50 pt-2">
				{/* 统计信息 - 仅在展开时显示 */}
				<div className="mx-2 mb-4 p-3 rounded-sm bg-sidebar-accent/30 border border-sidebar-border group-data-[collapsible=icon]:hidden">
					<div className="space-y-2">
						<div className="flex justify-between items-center text-xs">
							<span className="text-sidebar-foreground/60 font-serif">义工总数</span>
							<span className="font-mono font-semibold text-sidebar-foreground">{totalVolunteers}</span>
						</div>
						<div className="flex justify-between items-center text-xs">
							<span className="text-sidebar-foreground/60 font-serif">本月工时</span>
							<span className="font-mono font-semibold text-sidebar-foreground">{totalServiceHours.toFixed(0)}</span>
						</div>
					</div>
				</div>
				
				{/* 用户菜单 */}
				<NavUser user={userData} />
			</SidebarFooter>
		</Sidebar>
	);
}
