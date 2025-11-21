/**
 * 往生者服务
 */

import { type ApiResponse, api } from "../lib/api";
import type { PaginationParams, PaginationResponse, Deceased } from "../types";

export interface DeceasedListParams extends PaginationParams {
	keyword?: string;
	gender?: string;
	chantPosition?: string;
	startDate?: string;
	endDate?: string;
}

export interface CreateDeceasedParams {
	name: string;
	title: string;
	chantNumber?: string;
	chantPosition?: "room-one" | "room-two" | "room-three" | "room-four" | "unknow";
	gender: "male" | "female" | "other";
	deathDate: string;
	deathTime?: string;
	age?: number;
	visitTime?: string;
	visitationTeam?: string[];
	birthDate?: string;
	religion?: string;
	isOrdained?: boolean;
	address: string;
	causeOfDeath?: string;
	familyContact?: string;
	familyRelationship?: string;
	familyPhone: string;
	specialNotes?: string;
	funeralArrangements?: string;
}

export const deceasedService = {
	/**
	 * 获取往生者列表
	 */
	getList: async (
		params: DeceasedListParams,
	): Promise<ApiResponse<PaginationResponse<Deceased>>> => {
		const { pageSize, ...rest } = params;
		const apiParams = {
			...rest,
			limit: pageSize,
		};
		return api.get("/deceased", { params: apiParams });
	},

	/**
	 * 根据 ID 获取往生者详情
	 */
	getById: async (id: number): Promise<ApiResponse<Deceased>> => {
		return api.get(`/deceased/${id}`);
	},

	/**
	 * 创建往生者
	 */
	create: async (
		data: CreateDeceasedParams,
	): Promise<ApiResponse<Deceased>> => {
		return api.post("/deceased", data);
	},

	/**
	 * 更新往生者信息
	 */
	update: async (
		id: number,
		data: Partial<CreateDeceasedParams>,
	): Promise<ApiResponse<Deceased>> => {
		return api.put(`/deceased/${id}`, data);
	},

	/**
	 * 删除往生者
	 */
	delete: async (id: number): Promise<ApiResponse> => {
		return api.delete(`/deceased/${id}`);
	},

	/**
	 * 批量删除往生者
	 */
	batchDelete: async (ids: number[]): Promise<ApiResponse> => {
		return api.post("/deceased/batch/delete", { ids });
	},

	/**
	 * 搜索往生者
	 */
	search: async (
		keyword: string,
		limit?: number,
	): Promise<ApiResponse<Deceased[]>> => {
		return api.get("/deceased/search", { params: { keyword, limit } });
	},
};
