/**
 * 上传服务
 */

import { type ApiResponse, api } from "../lib/api";

export const uploadService = {
	/**
	 * 上传头像（公开接口，用于注册）
	 */
	uploadAvatarPublic: async (
		file: File,
	): Promise<ApiResponse<{ url: string }>> => {
		const formData = new FormData();
		formData.append("file", file);

		return api.post("/api/upload/avatar/public", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	},

	/**
	 * 上传头像（需要登录）
	 */
	uploadAvatar: async (
		file: File,
		lotusId?: string,
	): Promise<ApiResponse<{ url: string }>> => {
		const formData = new FormData();
		formData.append("file", file);
		if (lotusId) {
			formData.append("lotusId", lotusId);
		}

		return api.post("/api/upload/avatar", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	},
};
