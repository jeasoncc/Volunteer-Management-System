import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { NotFound } from "../components/NotFound";
import { Toaster } from "../components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppearanceProvider } from "@/components/AppearanceProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useEffect } from "react";
import { initNetworkConfig } from "@/config/network";

function RootComponent() {
	const location = useLocation();
	const isLoginPage = location.pathname === "/login";

	// 初始化网络配置（从后端获取局域网IP）
	useEffect(() => {
		initNetworkConfig().catch(console.error);
	}, []);

	// 简单的面包屑生成逻辑
	const pathSegments = location.pathname.split("/").filter(Boolean);
	const breadcrumbs = [
		{ label: "首页", href: "/" },
		...pathSegments.map((segment, index) => {
			const labelMap: Record<string, string> = {
				volunteers: "志愿者管理",
				checkin: "签到管理",
				chanting: "念佛共修",
				deceased: "往生关怀",
				approval: "审批中心",
				devices: "设备管理",
				admin: "系统管理",
				settings: "设置",
				documents: "文档管理"
			};
			
			return {
				label: labelMap[segment] || segment,
				href: "/" + pathSegments.slice(0, index + 1).join("/"),
			};
		}),
	];

	return (
		<ErrorBoundary>
			<ThemeProvider>
				<AppearanceProvider>
					{isLoginPage ? (
						<Outlet />
					) : (
						<DashboardLayout breadcrumbs={breadcrumbs}>
							<Outlet />
						</DashboardLayout>
					)}
					<Toaster />
					<ReactQueryDevtools buttonPosition="bottom-left" />
					<TanStackDevtools
						config={{
							position: "bottom-right",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
						]}
					/>
				</AppearanceProvider>
			</ThemeProvider>
		</ErrorBoundary>
	);
}

export const Route = createRootRoute({
	component: RootComponent,
	notFoundComponent: NotFound,
});
