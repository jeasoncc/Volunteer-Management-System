/**
 * 管理员服务
 */

import { type ApiResponse, api } from "../lib/api";
import type { PaginationParams, PaginationResponse, User } from "../types";

export interface AdminListParams extends PaginationParams {
	name?: string;
	role?: "super" | "admin" | "operator";
	department?: string;
	isActive?: boolean;
}

export interface CreateAdminParams {
	// 志愿者基础信息
	name: string;
	phone: string;
	idNumber: string;
	gender: "male" | "female" | "other";
	birthDate?: string;
	email?: string;
	address?: string;
	
	// 管理员特有信息
	role: "super" | "admin" | "operator";
	department: string;
	permissions?: string[];
}

export interface UpdateAdminParams {
	// 志愿者基础信息
	name?: string;
	phone?: string;
	email?: string;
	birthDate?: string;
	
	// 管理员特有信息
	role?: "super" | "admin" | "operator";
	department?: string;
	isActive?: boolean;
}

export interface PromoteVolunteerParams {
	lotusId: string;
	role: "admin" | "operator";
	department: string;
	grantPermissions?: string[];
}

export const adminService = {
	/**
	 * 获取管理员列表
	 */
	getList: async (
		params: AdminListParams,
	): Promise<ApiResponse<PaginationResponse<User>>> => {
		return api.get("/api/admin", { params });
	},

	/**
	 * 根据 ID 获取管理员详情
	 */
	getById: async (id: number): Promise<ApiResponse<User>> => {
		return api.get(`/admin/${id}`);
	},

	/**
	 * 创建管理员
	 */
	create: async (
		data: CreateAdminParams,
	): Promise<ApiResponse<User>> => {
		return api.post("/api/admin", data);
	},

	/**
	 * 更新管理员信息
	 */
	update: async (
		id: number,
		data: UpdateAdminParams,
	): Promise<ApiResponse> => {
		return api.put(`/admin/${id}`, data);
	},

	/**
	 * 删除管理员
	 */
	delete: async (id: number): Promise<ApiResponse> => {
		return api.delete(`/admin/${id}`);
	},

	/**
	 * 搜索管理员
	 */
	search: async (
		keyword: string,
		limit?: number,
	): Promise<ApiResponse<User[]>> => {
		return api.get("/api/admin/search", { params: { keyword, limit } });
	},

	/**
	 * 升级志愿者为管理员
	 */
	promote: async (
		data: PromoteVolunteerParams,
	): Promise<ApiResponse> => {
		return api.post("/api/admin/promote", data);
	},
};