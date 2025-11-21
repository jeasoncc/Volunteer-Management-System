/**
 * 助念排班服务
 */

import { type ApiResponse, api } from "../lib/api";
import type { PaginationParams, PaginationResponse, ChantingSchedule } from "../types";

export interface ChantingScheduleListParams extends PaginationParams {
	startDate?: string;
	endDate?: string;
	location?: string;
	status?: string;
	deceasedId?: number;
}

export interface CreateChantingScheduleParams {
	location: "fuhuiyuan" | "waiqin";
	date: string;
	timeSlot: string;
	bellVolunteerId?: number;
	teachingVolunteerId?: number;
	backupVolunteerId?: number;
	deceasedId: number;
	status?: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
	expectedParticipants?: number;
	specialRequirements?: string;
}

export const chantingService = {
	/**
	 * 获取助念排班列表
	 */
	getList: async (
		params: ChantingScheduleListParams,
	): Promise<ApiResponse<PaginationResponse<ChantingSchedule>>> => {
		const { pageSize, ...rest } = params;
		const apiParams = {
			...rest,
			limit: pageSize,
		};
		return api.get("/chanting", { params: apiParams });
	},

	/**
	 * 根据 ID 获取排班详情
	 */
	getById: async (id: number): Promise<ApiResponse<ChantingSchedule>> => {
		return api.get(`/chanting/${id}`);
	},

	/**
	 * 创建助念排班
	 */
	create: async (
		data: CreateChantingScheduleParams,
	): Promise<ApiResponse<ChantingSchedule>> => {
		return api.post("/chanting", data);
	},

	/**
	 * 更新助念排班
	 */
	update: async (
		id: number,
		data: Partial<CreateChantingScheduleParams>,
	): Promise<ApiResponse<ChantingSchedule>> => {
		return api.put(`/chanting/${id}`, data);
	},

	/**
	 * 删除助念排班
	 */
	delete: async (id: number): Promise<ApiResponse> => {
		return api.delete(`/chanting/${id}`);
	},

	/**
	 * 更新排班状态
	 */
	updateStatus: async (
		id: number,
		status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled",
	): Promise<ApiResponse> => {
		return api.patch(`/chanting/${id}/status`, { status });
	},

	/**
	 * 记录实际执行时间
	 */
	recordActualTime: async (
		id: number,
		data: {
			actualStartTime?: string;
			actualEndTime?: string;
			feedback?: string;
		},
	): Promise<ApiResponse> => {
		return api.patch(`/chanting/${id}/actual-time`, data);
	},

	/**
	 * 获取日历视图数据
	 */
	getCalendar: async (
		year: number,
		month: number,
	): Promise<ApiResponse<ChantingSchedule[]>> => {
		return api.get("/chanting/calendar", { params: { year, month } });
	},
};
