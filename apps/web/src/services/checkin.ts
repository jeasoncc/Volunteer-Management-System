/**
 * 考勤服务
 */

import { type ApiResponse, api } from "../lib/api";
import type {
	CheckInRecord,
	CheckInSummary,
	PaginationParams,
	PaginationResponse,
} from "../types";

export interface CheckInListParams extends PaginationParams {
	lotusId?: string;
	startDate?: string;
	endDate?: string;
}

export interface StrangerListParams extends PaginationParams {
	startDate?: string;
	endDate?: string;
	deviceSn?: string;
}

export interface MonthlyReportParams {
	year: number;
	month: number;
}

export const checkinService = {
	/**
	 * 获取考勤记录列表
	 */
	getList: async (
		params: CheckInListParams,
	): Promise<ApiResponse<PaginationResponse<CheckInRecord>>> => {
		return api.get("/api/v1/summary/list", { params });
	},

	/**
	 * 根据 ID 获取考勤记录详情
	 */
	getById: async (id: number): Promise<ApiResponse<CheckInSummary>> => {
		return api.get(`/api/v1/summary/${id}`);
	},

	/**
	 * 创建考勤汇总记录
	 */
	create: async (data: Partial<CheckInSummary>): Promise<ApiResponse> => {
		return api.post("/api/v1/summary", data);
	},

	/**
	 * 更新考勤汇总记录
	 */
	update: async (
		id: number,
		data: Partial<CheckInSummary>,
	): Promise<ApiResponse> => {
		return api.put(`/api/v1/summary/${id}`, data);
	},

	/**
	 * 删除考勤汇总记录
	 */
	delete: async (id: number): Promise<ApiResponse> => {
		return api.delete(`/api/v1/summary/${id}`);
	},

	/**
	 * 批量删除考勤汇总记录
	 */
	batchDelete: async (ids: number[]): Promise<ApiResponse> => {
		return api.post("/api/v1/summary/batch-delete", { ids });
	},

	/**
	 * 重新计算考勤汇总
	 */
	recalculate: async (userId: number, date: string): Promise<ApiResponse> => {
		return api.post("/api/v1/summary/recalculate", { userId, date });
	},

	/**
	 * 获取用户考勤汇总
	 */
	getUserSummary: async (
		lotusId: string,
		startDate: string,
		endDate: string,
	): Promise<ApiResponse<CheckInSummary>> => {
		return api.get("/api/v1/summary/user", {
			params: { lotusId, startDate, endDate },
		});
	},

	/**
	 * 获取月度考勤报表
	 */
	getMonthlyReport: async (
		params: MonthlyReportParams,
	): Promise<ApiResponse<any>> => {
		return api.get("/api/v1/report/monthly", { params });
	},

	/**
	 * 生成月度考勤汇总
	 */
	generateMonthlySummary: async (
		year: number,
		month: number,
		force?: boolean,
	): Promise<ApiResponse> => {
		return api.post("/api/v1/summary/generate-monthly", { year, month, force });
	},

	/**
	 * 导出志愿者服务时间统计表
	 */
	exportVolunteerService: async (
		startDate: string,
		endDate: string,
		lotusIds?: string[],
		activityName?: string,
	): Promise<Blob> => {
		const params: any = { startDate, endDate };
		if (lotusIds && lotusIds.length > 0) {
			params.lotusIds = lotusIds.join(",");
		}
		if (activityName) {
			params.activityName = activityName;
		}

		const response = await api.get("/api/v1/export/volunteer-service", {
			params,
			responseType: "blob",
		});
		return response as unknown as Blob;
	},

	getStrangerRecords: async (
		params: StrangerListParams,
	): Promise<ApiResponse<any>> => {
		return api.get("/api/v1/stranger-records", { params });
	},

	/**
	 * 获取原始打卡记录列表
	 */
	getRawRecords: async (
		params: CheckInListParams,
	): Promise<ApiResponse<PaginationResponse<any>>> => {
		return api.get("/api/v1/checkin/records", { params });
	},

	/**
	 * 根据 ID 获取原始打卡记录详情
	 */
	getRawRecordById: async (id: number): Promise<ApiResponse<any>> => {
		return api.get(`/api/v1/checkin/records/${id}`);
	},

	/**
	 * 获取用户的原始打卡记录（带统计）
	 */
	getUserRawRecords: async (
		lotusId: string,
		startDate: string,
		endDate: string,
	): Promise<ApiResponse<any>> => {
		return api.get(`/api/v1/checkin/records/user/${lotusId}`, {
			params: { startDate, endDate },
		});
	},

	/**
	 * 创建原始打卡记录
	 */
	createRawRecord: async (data: any): Promise<ApiResponse> => {
		return api.post("/api/v1/checkin/records", data);
	},

	/**
	 * 更新原始打卡记录
	 */
	updateRawRecord: async (id: number, data: any): Promise<ApiResponse> => {
		return api.put(`/api/v1/checkin/records/${id}`, data);
	},

	/**
	 * 删除原始打卡记录
	 */
	deleteRawRecord: async (id: number): Promise<ApiResponse> => {
		return api.delete(`/api/v1/checkin/records/${id}`);
	},

	/**
	 * 批量删除原始打卡记录
	 */
	batchDeleteRawRecords: async (ids: number[]): Promise<ApiResponse> => {
		return api.post("/api/v1/checkin/records/batch-delete", { ids });
	},
};
