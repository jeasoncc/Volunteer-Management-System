/**
 * 文档服务
 */

import { api } from "../lib/api";

export const documentService = {
	/**
	 * 导出志愿者服务时间统计表（Excel）
	 */
	exportVolunteerService: async (params: {
		startDate: string;
		endDate: string;
		lotusIds?: string[];
		activityName?: string;
	}): Promise<Blob> => {
		const queryParams = new URLSearchParams({
			startDate: params.startDate,
			endDate: params.endDate,
		});

		if (params.lotusIds && params.lotusIds.length > 0) {
			queryParams.append("lotusIds", params.lotusIds.join(","));
		}

		if (params.activityName) {
			queryParams.append("activityName", params.activityName);
		}

		const response = await fetch(
			`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/v1/export/volunteer-service?${queryParams}`,
			{
				method: "GET",
				credentials: "include",
			},
		);

		if (!response.ok) {
			throw new Error("导出失败");
		}

		return response.blob();
	},
};
