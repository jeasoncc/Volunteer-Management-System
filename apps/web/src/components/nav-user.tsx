import { LogOutIcon, MoreVerticalIcon, User2, Settings, KeyRound, Moon, Sun } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

export function NavUser({
	user,
}: {
	user: {
		name: string;
		email: string;
		avatar: string;
	};
}) {
	const navigate = useNavigate();
	const { isMobile } = useSidebar();
	const { logout } = useAuth();

	const handleLogout = async () => {
		try {
			await logout();
			// Redirect to login page after successful logout
			navigate({ to: "/login" });
		} catch (error) {
			console.error("登出失败:", error);
			// Even if logout fails, redirect to login page
			navigate({ to: "/login" });
		}
	};

	const handleSettings = () => {
		navigate({ to: "/settings" });
	};

	const [theme, setTheme] = React.useState<"light" | "dark">(
		() => (localStorage.getItem("theme") as "light" | "dark") || "light"
	);

	const toggleTheme = () => {
		const newTheme = theme === "light" ? "dark" : "light";
		setTheme(newTheme);
		localStorage.setItem("theme", newTheme);
		document.documentElement.classList.toggle("dark", newTheme === "dark");
	};

	React.useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
	}, []);

	// 获取用户名首字母作为头像
	const getInitials = (name: string) => {
		return name.charAt(0).toUpperCase();
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								{user.avatar ? (
									<AvatarImage src={user.avatar} alt={user.name} />
								) : (
									<AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
										{getInitials(user.name)}
									</AvatarFallback>
								)}
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{user.name}</span>
								<span className="truncate text-xs text-muted-foreground">
									管理员
								</span>
							</div>
							<MoreVerticalIcon className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									{user.avatar ? (
										<AvatarImage src={user.avatar} alt={user.name} />
									) : (
										<AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
											{getInitials(user.name)}
										</AvatarFallback>
									)}
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{user.name}</span>
									<span className="truncate text-xs text-muted-foreground">
										管理员
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleSettings}>
							<Settings />
							个人设置
						</DropdownMenuItem>
						<DropdownMenuItem onClick={handleSettings}>
							<KeyRound />
							修改密码
						</DropdownMenuItem>
						<DropdownMenuItem onClick={toggleTheme}>
							{theme === "light" ? <Moon /> : <Sun />}
							{theme === "light" ? "暗色模式" : "亮色模式"}
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleLogout}>
							<LogOutIcon />
							登出
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}