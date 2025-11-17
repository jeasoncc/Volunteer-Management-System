/**
 * 认证服务
 */

import { type ApiResponse, api } from "../lib/api";
import type { User } from "../types";

export interface LoginParams {
	account: string;
	password: string;
}

export interface LoginResponse {
	user: User & { lotusRole: string };
	adminInfo: any;
	token: string;
}

export interface RegisterParams {
	name: string;
	phone: string;
	idNumber: string;
	gender?: "male" | "female" | "other";
	birthDate?: string;
	wechat?: string;
	email?: string;
	address?: string;
	avatar?: string;
	dharmaName?: string;
	hasBuddhismFaith?: boolean;
	refugeStatus?: "none" | "took_refuge" | "five_precepts" | "bodhisattva";
	education?: string;
	healthConditions?: string;
	joinReason?: string;
	hobbies?: string;
	availableTimes?: string;
	emergencyContact?: string;
	volunteerId?: string;
	qq?: string;
	accommodation?: string;
	nation?: string;
}

export const authService = {
	/**
	 * 登录
	 */
	login: async (params: LoginParams): Promise<ApiResponse<LoginResponse>> => {
		return api.post("/api/auth/login", params);
	},

	/**
	 * 登出
	 */
	logout: async (): Promise<ApiResponse> => {
		return api.post("/api/auth/logout");
	},

	/**
	 * 获取当前用户信息
	 */
	me: async (): Promise<ApiResponse<User>> => {
		return api.get("/api/auth/me");
	},

	/**
	 * 注册
	 */
	register: async (params: RegisterParams): Promise<ApiResponse> => {
		return api.post("/volunteer/register", params);
	},

	/**
	 * 检查手机号是否已注册
	 */
	checkPhone: async (
		phone: string,
	): Promise<ApiResponse<{ exists: boolean; message: string }>> => {
		return api.get(`/volunteer/register/check-phone/${phone}`);
	},

	/**
	 * 检查身份证号是否已注册
	 */
	checkIdNumber: async (
		idNumber: string,
	): Promise<ApiResponse<{ exists: boolean; message: string }>> => {
		return api.get(`/volunteer/register/check-id/${idNumber}`);
	},
};