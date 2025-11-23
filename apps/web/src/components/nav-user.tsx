import { LogOutIcon, MoreVerticalIcon, User2, Settings, KeyRound, Moon, Sun } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
	const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = React.useState(false);

	const performLogout = async () => {
		try {
			await logout();
			toast.success("已安全登出", {
				description: "期待您再次回来",
			});
			// Redirect to login page after successful logout
			navigate({ to: "/login" });
		} catch (error) {
			console.error("登出失败:", error);
			toast.error("登出时遇到问题", {
				description: "已强制登出，请重新登录",
			});
			// Even if logout fails, redirect to login page
			navigate({ to: "/login" });
		}
		setIsLogoutConfirmOpen(false);
	};

	const handleLogout = () => {
		setIsLogoutConfirmOpen(true);
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
		<>
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

			<Dialog
				open={isLogoutConfirmOpen}
				onClose={() => setIsLogoutConfirmOpen(false)}
				title="退出登录"
				maxWidth="sm"
			>
				<div className="flex flex-col items-center text-center space-y-6 pt-2">
					<div className="h-16 w-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-2 animate-in zoom-in duration-300">
						<LogOutIcon className="h-8 w-8 text-stone-600 dark:text-stone-400" />
					</div>
					
					<p className="text-muted-foreground text-sm leading-relaxed">
						感恩您的付出。<br/>您确定要暂时离开志愿者服务系统吗？
					</p>

					<div className="flex w-full gap-3 pt-4">
						<Button 
							variant="outline" 
							className="flex-1 h-10"
							onClick={() => setIsLogoutConfirmOpen(false)}
						>
							我再想想
						</Button>
						<Button 
							className="flex-1 h-10 bg-stone-900 text-stone-50 hover:bg-stone-800 dark:bg-stone-50 dark:text-stone-900 dark:hover:bg-stone-200"
							onClick={performLogout}
						>
							确认退出
						</Button>
					</div>
				</div>
			</Dialog>
		</>
	);
}