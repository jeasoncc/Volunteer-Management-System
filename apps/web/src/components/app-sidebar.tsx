import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
	Home,
	Users,
	ClipboardCheck,
	Shield,
	Settings,
	LogOut,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "../hooks/useAuth";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user } = useAuth();

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
		},
		{
			title: "管理员管理",
			url: "/admin",
			icon: Shield,
		},
		{
			title: "考勤管理",
			url: "/checkin",
			icon: ClipboardCheck,
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
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<Link to="/">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
									<span className="text-lg font-bold text-white">莲</span>
								</div>
								<span className="text-base font-semibold">莲花斋</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={userData} />
			</SidebarFooter>
		</Sidebar>
	);
}
