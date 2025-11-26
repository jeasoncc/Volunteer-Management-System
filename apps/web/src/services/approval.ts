/**
 * 审批服务
 */

import { type ApiResponse, api } from "../lib/api";
import type { PaginationResponse, Volunteer } from "../types";

export interface ApprovalRequest {
	action: "approve" | "reject";
	notes?: string;
}

export interface BatchApprovalRequest {
	lotusIds: string[];
	action: "approve" | "reject";
	notes?: string;
}

export const approvalService = {
	/**
	 * 获取待审批列表
	 */
	getPendingList: async (params: {
		page?: number;
		pageSize?: number;
	}): Promise<ApiResponse<PaginationResponse<Volunteer>>> => {
		const { pageSize, ...rest } = params;
		const apiParams = {
			...rest,
			limit: pageSize,
		};
		return api.get("/api/volunteer/approval/pending", { params: apiParams });
	},

	/**
	 * 审批单个义工
	 */
	approve: async (
		lotusId: string,
		data: ApprovalRequest,
	): Promise<ApiResponse> => {
		return api.post(`/api/volunteer/approval/${lotusId}`, data);
	},

	/**
	 * 批量审批
	 */
	batchApprove: async (data: BatchApprovalRequest): Promise<ApiResponse> => {
		return api.post("/api/volunteer/approval/batch", data);
	},

	/**
	 * 获取审批历史
	 */
	getHistory: async (params: {
		page?: number;
		pageSize?: number;
	}): Promise<ApiResponse<PaginationResponse<Volunteer>>> => {
		const { pageSize, ...rest } = params;
		const apiParams = {
			...rest,
			limit: pageSize,
		};
		return api.get("/api/volunteer/approval/history", { params: apiParams });
	},
};
