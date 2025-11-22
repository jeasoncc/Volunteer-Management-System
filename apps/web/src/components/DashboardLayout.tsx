import { Fragment, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ThemeSettings } from "@/components/ThemeSettings";
import { NotificationCenter } from "@/components/NotificationCenter";

interface DashboardLayoutProps {
	children: ReactNode;
	breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function DashboardLayout({
	children,
	breadcrumbs,
}: DashboardLayoutProps) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
						{breadcrumbs && breadcrumbs.length > 0 && (
							<Breadcrumb>
								<BreadcrumbList>
									{breadcrumbs.map((crumb, index) => (
										<Fragment key={crumb.href ?? crumb.label ?? index}>
											<BreadcrumbItem className="hidden md:block">
												{crumb.href ? (
													<BreadcrumbLink asChild>
														<Link to={crumb.href}>{crumb.label}</Link>
													</BreadcrumbLink>
												) : (
													<BreadcrumbPage>{crumb.label}</BreadcrumbPage>
												)}
											</BreadcrumbItem>
											{index < breadcrumbs.length - 1 && (
												<BreadcrumbSeparator className="hidden md:block" />
											)}
										</Fragment>
									))}
								</BreadcrumbList>
							</Breadcrumb>
						)}
					</div>
					<div className="ml-auto flex items-center gap-2 px-4">
						<ThemeSettings />
						<NotificationCenter />
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 md:p-8 bg-slate-50/50 dark:bg-slate-950/50 min-h-[calc(100vh-4rem)]">
					<div className="mx-auto w-full max-w-7xl">
						{children}
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
