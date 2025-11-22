import { api, type ApiResponse } from "@/lib/api";

interface DeviceStatus {
	devices: {
		deviceSn: string;
		online: boolean;
	}[];
}

interface SyncAllUsersResult {
	total: number;
	successCount: number;
	failCount: number;
	skippedCount: number;
	failedUsers?: { lotusId: string | null; name: string }[];
	skippedUsers?: { lotusId: string | null; name: string; reason: string }[];
}

export const deviceService = {
	getStatus: async (): Promise<ApiResponse<DeviceStatus>> => {
		return api.get("/device/status");
	},

	syncAllUsers: async (): Promise<ApiResponse<SyncAllUsersResult>> => {
		return api.post("/send/addAllUser");
	},

	syncUser: async (lotusId: string): Promise<ApiResponse> => {
		return api.post("/send/adduser", { lotusId });
	},

	clearAllUsers: async (): Promise<ApiResponse> => {
		return api.post("/send/delAllUser");
	},
};
