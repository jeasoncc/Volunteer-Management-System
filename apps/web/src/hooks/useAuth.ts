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
			} catch {
				return null;
			}
		},
	});

	// 登录
	const loginMutation = useMutation({
		mutationFn: (params: LoginParams) => authService.login(params),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
		},
	});

	// 登出
	const logoutMutation = useMutation({
		mutationFn: () => authService.logout(),
		onSuccess: () => {
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
