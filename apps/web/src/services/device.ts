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

interface SyncLog {
	time: string;
	type: 'info' | 'success' | 'error' | 'warning';
	message: string;
	userId?: string;
}

interface SyncProgress {
	total: number;
	sent: number;
	confirmed: number;
	failed: number;
	skipped: number;
	status: 'idle' | 'syncing' | 'completed';
	logs: SyncLog[];
	failedUsers: Array<{ lotusId: string; name: string; reason: string }>;
	// 新增：时间相关字段
	startTime?: number | null;
	estimatedTimeRemaining?: number | null;
	averageTimePerUser?: number | null;
	batchId?: string | null;
}

type SyncStrategy = 'all' | 'unsynced' | 'changed';

export const deviceService = {
	getStatus: async (): Promise<ApiResponse<DeviceStatus>> => {
		return api.get("/device/status");
	},

	syncAllUsers: async (options?: { 
		strategy?: SyncStrategy; 
		validatePhotos?: boolean;
		photoFormat?: 'url' | 'base64';
	}): Promise<ApiResponse<SyncAllUsersResult>> => {
		return api.post("/send/addAllUser", options);
	},

	syncUser: async (lotusId: string): Promise<ApiResponse> => {
		return api.post("/send/adduser", { lotusId });
	},

	clearAllUsers: async (): Promise<ApiResponse> => {
		return api.post("/send/delAllUser");
	},

	getSyncProgress: async (): Promise<ApiResponse<SyncProgress>> => {
		return api.get("/sync/progress");
	},

	retryFailedUsers: async (failedUsers: Array<{ lotusId: string; name: string }>): Promise<ApiResponse> => {
		return api.post("/send/retryFailed", { failedUsers });
	},

	retryFailedUsersWithBase64: async (failedUsers: Array<{ lotusId: string; name: string }>): Promise<ApiResponse> => {
		return api.post("/send/retryFailedWithBase64", { failedUsers });
	},

	// 同步历史相关
	getSyncBatches: async (params?: { 
		page?: number; 
		pageSize?: number;
		startDate?: string;
		endDate?: string;
	}): Promise<ApiResponse<any>> => {
		return api.get("/sync/batches", { params });
	},

	getSyncBatchDetail: async (batchId: string): Promise<ApiResponse<any>> => {
		return api.get(`/sync/batches/${batchId}`);
	},

	getSyncStats: async (days?: number): Promise<ApiResponse<any>> => {
		return api.get("/sync/stats", { params: { days } });
	},

	getRecentFailures: async (limit?: number): Promise<ApiResponse<any>> => {
		return api.get("/sync/failures", { params: { limit } });
	},

	// 设备人员查询
	getDeviceFaceCount: async (): Promise<ApiResponse<{ total: number }>> => {
		return api.get("/device/face-count");
	},

	getDeviceUserIds: async (): Promise<ApiResponse<{ userIds: string[] }>> => {
		return api.get("/device/user-ids");
	},
};
