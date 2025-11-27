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
}

type SyncStrategy = 'all' | 'unsynced' | 'changed';

export const deviceService = {
	getStatus: async (): Promise<ApiResponse<DeviceStatus>> => {
		return api.get("/device/status");
	},

	syncAllUsers: async (options?: { 
		strategy?: SyncStrategy; 
		validatePhotos?: boolean 
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
};
