/**
 * 认证 Hook
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService, type LoginParams } from "../services/auth";
import type { User } from "../types";

export function useAuth() {
	const queryClient = useQueryClient();

	// 获取当前用户
	const { data: user, isLoading } = useQuery<User | null>({
		queryKey: ["auth", "me"],
		queryFn: async () => {
			try {
				const res = await authService.me();
				return res.data || null;
			} catch (error: any) {
				// 401 错误是正常的未登录状态，不需要打印错误日志
				if (error?.message?.includes("未登录") || error?.message?.includes("未授权")) {
					return null;
				}
				// 其他错误才打印日志
				console.error("获取用户信息失败:", error);
				return null;
			}
		},
		retry: false, // Don't retry on auth errors
	});

	// 登录
	const loginMutation = useMutation({
		mutationFn: (params: LoginParams) => authService.login(params),
		onSuccess: async (data) => {
			// 直接设置用户数据到缓存，避免等待重新获取
			if (data?.data?.user) {
				queryClient.setQueryData(["auth", "me"], data.data.user);
			}
			// 同时触发重新获取以确保数据最新
			await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
		},
		onError: (error) => {
			console.error("登录失败:", error);
		},
	});

	// 登出
	const logoutMutation = useMutation({
		mutationFn: () => authService.logout(),
		onSuccess: () => {
			queryClient.setQueryData(["auth", "me"], null);
			queryClient.clear();
		},
		onError: (error) => {
			console.error("登出失败:", error);
			// Even if logout fails on the server, clear local state
			queryClient.setQueryData(["auth", "me"], null);
			queryClient.clear();
		},
	});

	return {
		user,
		isLoading,
		isAuthenticated: !!user,
		isSuperAdmin: user?.adminInfo?.role === "super",
		isAdmin: user?.lotusRole === "admin",
		login: loginMutation.mutateAsync,
		logout: logoutMutation.mutateAsync,
		isLoggingIn: loginMutation.isPending,
		isLoggingOut: logoutMutation.isPending,
	};
}