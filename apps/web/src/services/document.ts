/**
 * 文档服务
 */

import { api } from "../lib/api";

export interface CareRecordData {
	// 基本信息
	name: string;
	gender: "男" | "女";
	age: number;
	education?: string;
	address: string;
	workplace?: string;

	// 报损信息
	reportDate: string;
	reportReason?: string;
	hasInsurance: boolean;

	// 助念信息
	assistantStartTime?: string;
	assistantDuration?: string;
	hasFamily: boolean;
	familyCount?: number;

	// 法名和受戒
	dharmaName?: string;
	hasTakingRefuge: boolean;
	hasFivePrecepts: boolean;
	hasBodhisattvaPrecepts: boolean;
	hasOtherPrecepts: boolean;

	// 受戒情形
	baptismType?: "修行打坐" | "听经" | "诵经" | "念佛" | "拜忏";

	// 平生信仰
	religion?: "佛教教" | "天主教" | "回教" | "其它";

	// 临终状态
	deathCondition: "安详" | "疾苦";
	hasFamily2: boolean;
	hasChanting: boolean;
	hasSuffering: boolean;
	hasMovement: boolean;

	// 入殓信息
	burialTime?: string;
	hasLawyer: boolean;

	// 兴趣爱好
	hobbies?: string[];
	personality?: string;

	// 对待子女
	childrenAttitude?: string[];

	// 善事
	goodDeeds?: string[];

	// 心愿
	unfinishedWishes?: string;

	// 生平总结
	lifeSummary?: string;

	// 主事家属
	mainFamily: {
		name: string;
		phone: string;
		relationship: "夫" | "妻" | "儿" | "女" | "其它";
	};

	// 家属地址
	familyAddress: string;
}

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

	/**
	 * 生成助念记录表
	 */
	createCareRecord: async (
		data: CareRecordData,
	): Promise<{
		success: boolean;
		filePath: string;
		fileName: string;
		downloadUrl: string;
	}> => {
		const response = await api.post("/api/document/care-record", data);
		return response.data;
	},

	/**
	 * 下载助念记录表
	 */
	downloadCareRecord: async (downloadUrl: string): Promise<void> => {
		const response = await fetch(
			`${import.meta.env.VITE_API_URL || "http://localhost:3001"}${downloadUrl}`,
			{
				method: "GET",
				credentials: "include",
			},
		);

		if (!response.ok) {
			throw new Error("下载失败");
		}

		const blob = await response.blob();
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = downloadUrl.split("/").pop() || "助念记录表.xlsx";
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
	},
};
