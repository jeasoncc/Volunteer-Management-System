import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "../components/login-form";

export const Route = createFileRoute("/login")({
	component: LoginPage,
} as any);

function LoginPage() {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
			<div className="w-full max-w-sm">
				<LoginForm />
			</div>
			<div className="text-balance text-center text-xs text-muted-foreground">
				© 2024 莲花斋义工管理系统. All rights reserved.
			</div>
		</div>
	);
}
