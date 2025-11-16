import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAuth } from "../hooks/useAuth";

export const Route = createFileRoute("/login")({
	component: LoginPage,
} as any);

function LoginPage() {
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
			await login({ account, password });
			navigate({ to: "/" });
		} catch (err: any) {
			setError(err.message || "登录失败");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl text-center">
						莲花斋义工管理系统
					</CardTitle>
					<CardDescription className="text-center">
						请输入您的账号和密码登录
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="account" className="text-sm font-medium">
								账号
							</label>
							<Input
								id="account"
								type="text"
								placeholder="请输入账号"
								value={account}
								onChange={(e) => setAccount(e.target.value)}
								disabled={isLoggingIn}
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="password" className="text-sm font-medium">
								密码
							</label>
							<Input
								id="password"
								type="password"
								placeholder="请输入密码"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								disabled={isLoggingIn}
							/>
						</div>

						{error && (
							<div className="text-sm text-red-600 bg-red-50 p-3 rounded">
								{error}
							</div>
						)}

						<Button type="submit" className="w-full" disabled={isLoggingIn}>
							{isLoggingIn ? "登录中..." : "登录"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
