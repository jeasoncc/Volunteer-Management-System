import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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
		
		// 防止重复提交
		if (isLoggingIn) {
			return;
		}
		
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

			toast.success("登录成功", {
				description: "欢迎回来！",
			});

			// 等待一小段时间确保 React Query 缓存已更新，然后跳转
			await new Promise(resolve => setTimeout(resolve, 100));
			
			// Redirect to dashboard after successful login
			navigate({ to: "/" });
		} catch (err: any) {
			let errorMessage = "登录失败，请检查账号密码";
			// More specific error handling
			if (err.message?.includes("401")) {
				errorMessage = "账号或密码错误";
			} else if (err.message?.includes("网络")) {
				errorMessage = "网络连接失败，请检查网络设置";
			} else if (err.message) {
				errorMessage = err.message;
			}
			
			setError(errorMessage);
			toast.error("登录失败", {
				description: errorMessage,
			});
			
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
			className={cn("grid gap-6", className)}
			onSubmit={handleSubmit}
			{...props}
		>
			{error && (
				<Alert 
					variant="destructive"
					className={cn(
						"bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-200",
						isShaking && "animate-shake"
					)}
				>
					<AlertDescription className="text-sm font-medium">
						{error}
					</AlertDescription>
				</Alert>
			)}

			<div className="grid gap-4">
				<div className="grid gap-2">
					<Label htmlFor="account" className="text-stone-600 dark:text-stone-400 font-medium">
						账号
					</Label>
					<Input
						ref={accountInputRef}
						id="account"
						type="text"
						placeholder="请输入管理员账号"
						value={account}
						onChange={(e) => setAccount(e.target.value)}
						onKeyDown={handleAccountKeyDown}
						disabled={isLoggingIn}
						required
						autoComplete="username"
						className="h-11 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 focus-visible:ring-stone-400 rounded-md"
					/>
				</div>
				
				<div className="grid gap-2">
					<div className="flex items-center justify-between">
						<Label htmlFor="password" className="text-stone-600 dark:text-stone-400 font-medium">
							密码
						</Label>
					</div>
					<Input
						ref={passwordInputRef}
						id="password"
						type="password"
						placeholder="请输入登录密码"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						disabled={isLoggingIn}
						required
						autoComplete="current-password"
						className="h-11 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 focus-visible:ring-stone-400 rounded-md"
					/>
				</div>

				<div className="flex items-center justify-between pt-2">
					<div className="flex items-center space-x-2">
						<Checkbox
							id="remember"
							checked={rememberMe}
							onCheckedChange={(checked) => setRememberMe(checked as boolean)}
							disabled={isLoggingIn}
							className="border-stone-300 data-[state=checked]:bg-stone-800 data-[state=checked]:border-stone-800 rounded-sm"
						/>
						<Label
							htmlFor="remember"
							className="text-sm font-normal cursor-pointer text-stone-600 hover:text-stone-900"
						>
							记住密码
						</Label>
					</div>
					<Button variant="link" className="px-0 h-auto font-normal text-xs text-stone-500 hover:text-stone-800 hover:no-underline" asChild>
						<a href="#" onClick={(e) => e.preventDefault()}>忘记密码?</a>
					</Button>
				</div>

				<Button 
					type="submit" 
					className="w-full h-11 mt-2 bg-stone-900 hover:bg-stone-800 text-stone-50 font-medium rounded-md tracking-wide transition-colors duration-300" 
					disabled={isLoggingIn}
				>
					{isLoggingIn ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							正在登录...
						</>
					) : (
						"登 录"
					)}
				</Button>
			</div>

			{isDevelopment && (
				<div className="mt-4 text-center text-xs text-stone-400 bg-stone-100 dark:bg-stone-900/50 p-3 rounded border border-stone-200 dark:border-stone-800">
					<p className="font-mono">Dev: admin / admin123</p>
				</div>
			)}
		</form>
	);
}
