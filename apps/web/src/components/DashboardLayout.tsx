import { type ReactNode } from "react";
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
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator orientation="vertical" className="mr-2 h-4" />
					{breadcrumbs && breadcrumbs.length > 0 && (
						<Breadcrumb>
							<BreadcrumbList>
								{breadcrumbs.map((crumb, index) => (
									<>
										<BreadcrumbItem key={crumb.label}>
											{crumb.href ? (
												<BreadcrumbLink asChild>
													<Link to={crumb.href}>{crumb.label}</Link>
												</BreadcrumbLink>
											) : (
												<BreadcrumbPage>{crumb.label}</BreadcrumbPage>
											)}
										</BreadcrumbItem>
										{index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
									</>
								))}
							</BreadcrumbList>
						</Breadcrumb>
					)}
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					<div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-6">
						{children}
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
