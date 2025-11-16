import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "../hooks/useAuth";

export function LoginForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<"form">) {
	const navigate = useNavigate();
	const { login, isLoggingIn } = useAuth();
	const [account, setAccount] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!account || !password) {
			setError("请输入账号和密码");
			return;
		}

		try {
			const response = await login({ account, password });

			// 检查用户角色
			if (response?.data?.user?.role !== "admin") {
				setError("权限不足：只有管理员才能登录此系统");
				return;
			}

			navigate({ to: "/" });
		} catch (err: any) {
			setError(err.message || "登录失败，请检查账号密码");
		}
	};

	return (
		<form
			className={cn("flex flex-col gap-6", className)}
			onSubmit={handleSubmit}
			{...props}
		>
			<div className="flex flex-col items-center gap-2 text-center">
				<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
					<span className="text-2xl font-bold text-white">莲</span>
				</div>
				<h1 className="text-2xl font-bold">莲花斋义工管理系统</h1>
				<p className="text-balance text-sm text-muted-foreground">
					请使用管理员账号登录系统
				</p>
			</div>
			<div className="grid gap-6">
				<div className="grid gap-2">
					<Label htmlFor="account">账号</Label>
					<Input
						id="account"
						type="text"
						placeholder="请输入账号"
						value={account}
						onChange={(e) => setAccount(e.target.value)}
						disabled={isLoggingIn}
						required
					/>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="password">密码</Label>
					<Input
						id="password"
						type="password"
						placeholder="请输入密码"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						disabled={isLoggingIn}
						required
					/>
				</div>
				{error && (
					<Alert variant="destructive">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}
				<Button type="submit" className="w-full" disabled={isLoggingIn}>
					{isLoggingIn ? "登录中..." : "登录"}
				</Button>
			</div>
			<div className="text-center text-sm text-muted-foreground">
				默认账号：<span className="font-medium">admin</span> / 密码：
				<span className="font-medium">admin123</span>
			</div>
		</form>
	);
}
