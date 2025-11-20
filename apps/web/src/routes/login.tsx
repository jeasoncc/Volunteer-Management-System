import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/components/login-form";

export const Route = createFileRoute("/login")({
	component: LoginPage,
} as any);

function LoginPage() {
	return (
		<div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-6 md:p-10 overflow-hidden">
			{/* 背景装饰 */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob" />
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob animation-delay-2000" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob animation-delay-4000" />
			</div>

			{/* 登录表单卡片 */}
			<div className="relative w-full max-w-sm">
				<div className="bg-background/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-border/50 p-8">
					<LoginForm />
				</div>
			</div>

			{/* 底部版权 */}
			<div className="relative text-balance text-center text-xs text-muted-foreground">
				© 2024 莲花斋义工管理系统. All rights reserved.
			</div>
		</div>
	);
}
