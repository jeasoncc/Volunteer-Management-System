import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function LoginForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<"form">) {
	const navigate = useNavigate();
	const { login, isLoggingIn } = useAuth();
	const [account, setAccount] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isShaking, setIsShaking] = useState(false);
	const accountInputRef = useRef<HTMLInputElement>(null);
	const passwordInputRef = useRef<HTMLInputElement>(null);

	// 判断是否为开发环境
	const isDevelopment = import.meta.env.DEV;

	// 从 localStorage 加载保存的账号密码
	useEffect(() => {
		const savedAccount = localStorage.getItem("rememberedAccount");
		const savedPassword = localStorage.getItem("rememberedPassword");
		const savedRememberMe = localStorage.getItem("rememberMe") === "true";

		if (savedRememberMe && savedAccount) {
			setAccount(savedAccount);
			setRememberMe(true);
			if (savedPassword) {
				setPassword(savedPassword);
			}
		}

		// 自动聚焦到账号输入框
		setTimeout(() => {
			accountInputRef.current?.focus();
		}, 100);
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!account || !password) {
			setError("请输入账号和密码");
			return;
		}

		try {
			const response = await login({ account, password });

			// 检查用户角色 - 后端返回的是 role 字段，不是 lotusRole
			if (response?.data?.user?.role !== "admin") {
				setError("权限不足：只有管理员才能登录此系统");
				// Clear the form to prevent brute force attempts
				setPassword("");
				return;
			}

			// 处理记住密码
			if (rememberMe) {
				localStorage.setItem("rememberedAccount", account);
				localStorage.setItem("rememberedPassword", password);
				localStorage.setItem("rememberMe", "true");
			} else {
				localStorage.removeItem("rememberedAccount");
				localStorage.removeItem("rememberedPassword");
				localStorage.removeItem("rememberMe");
			}

			// Redirect to dashboard after successful login
			navigate({ to: "/" });
		} catch (err: any) {
			// More specific error handling
			if (err.message?.includes("401")) {
				setError("账号或密码错误");
			} else if (err.message?.includes("网络")) {
				setError("网络连接失败，请检查网络设置");
			} else {
				setError(err.message || "登录失败，请检查账号密码");
			}
			// Clear password field on error
			setPassword("");
			// 触发震动动画
			setIsShaking(true);
			setTimeout(() => setIsShaking(false), 500);
		}
	};

	// 处理 Enter 键切换输入框
	const handleAccountKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && account) {
			e.preventDefault();
			passwordInputRef.current?.focus();
		}
	};

	return (
		<form
			className={cn("flex flex-col gap-6", className)}
			onSubmit={handleSubmit}
			{...props}
		>
			<div className="flex flex-col items-center gap-2 text-center">
				<h1 className="text-2xl font-bold">莲花斋义工管理系统</h1>
				<p className="text-balance text-sm text-muted-foreground">
					请使用管理员账号登录系统
				</p>
			</div>
			<div className="grid gap-6">
				<div className="grid gap-2">
					<Label htmlFor="account">账号</Label>
					<Input
						ref={accountInputRef}
						id="account"
						type="text"
						placeholder="请输入账号"
						value={account}
						onChange={(e) => setAccount(e.target.value)}
						onKeyDown={handleAccountKeyDown}
						disabled={isLoggingIn}
						required
						autoComplete="username"
					/>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="password">密码</Label>
					<div className="relative">
						<Input
							ref={passwordInputRef}
							id="password"
							type={showPassword ? "text" : "password"}
							placeholder="请输入密码"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={isLoggingIn}
							required
							autoComplete="current-password"
							className="pr-10"
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							disabled={isLoggingIn}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
							aria-label={showPassword ? "隐藏密码" : "显示密码"}
						>
							{showPassword ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</button>
					</div>
				</div>
				<div className="flex items-center space-x-2">
					<Checkbox
						id="remember"
						checked={rememberMe}
						onCheckedChange={(checked) => setRememberMe(checked as boolean)}
						disabled={isLoggingIn}
					/>
					<Label
						htmlFor="remember"
						className="text-sm font-normal cursor-pointer"
					>
						记住密码
					</Label>
				</div>
				{error && (
					<Alert 
						variant="destructive"
						className={cn(
							"transition-all",
							isShaking && "animate-shake"
						)}
					>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}
				<Button type="submit" className="w-full" disabled={isLoggingIn}>
					{isLoggingIn ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							登录中...
						</>
					) : (
						"登录"
					)}
				</Button>
			</div>
			{isDevelopment && (
				<div className="text-center text-sm text-muted-foreground">
					默认账号：<span className="font-medium">admin</span> / 密码：
					<span className="font-medium">admin123</span>
				</div>
			)}
		</form>
	);
}