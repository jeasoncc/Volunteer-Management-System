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
				// If we get a 401 error, clear the auth cache
				if (error?.response?.status === 401) {
					return null;
				}
				// For other errors, still return null but log them
				console.error("获取用户信息失败:", error);
				return null;
			}
		},
		retry: false, // Don't retry on auth errors
	});

	// 登录
	const loginMutation = useMutation({
		mutationFn: (params: LoginParams) => authService.login(params),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
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
		login: loginMutation.mutateAsync,
		logout: logoutMutation.mutateAsync,
		isLoggingIn: loginMutation.isPending,
		isLoggingOut: logoutMutation.isPending,
	};
}