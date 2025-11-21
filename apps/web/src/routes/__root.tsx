import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { queryClient } from "../lib/query-client";
import { NotFound } from "../components/NotFound";
import { Toaster } from "../components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const Route = createRootRoute({
	component: () => (
		<ErrorBoundary>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider>
					<Outlet />
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
				</ThemeProvider>
			</QueryClientProvider>
		</ErrorBoundary>
	),
	notFoundComponent: NotFound,
});
