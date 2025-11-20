import * as React from "react";
import { Link } from "@tanstack/react-router";
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user, isAuthenticated } = useAuth();

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

	const pendingCount = pendingData?.data?.total || 0;
	const totalVolunteers = volunteersData?.data?.total || 0;

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
					<div className="flex justify-between">
						<span>待审批</span>
						<span className="font-medium text-orange-500">{pendingCount}</span>
					</div>
				</div>
				
				{/* 用户菜单 */}
				<NavUser user={userData} />
			</SidebarFooter>
		</Sidebar>
	);
}
