/**
 * 义工服务
 */

import { type ApiResponse, api } from "../lib/api";
import type { PaginationParams, PaginationResponse, Volunteer } from "../types";

export interface VolunteerListParams extends PaginationParams {
	keyword?: string;
	status?: string;
	// 筛选参数
	volunteerStatus?: string;
	lotusRole?: string;
	gender?: string;
	// 日期范围筛选
	createdAtStart?: string;
	createdAtEnd?: string;
}

// 创建义工参数 - 与后端 VolunteerCreateDto 对应
export interface CreateVolunteerParams {
	// 必填字段
	name: string;
	phone: string;
	idNumber: string;
	gender: "male" | "female" | "other";

	// 账号信息（可选，默认使用手机号和默认密码）
	account?: string;
	password?: string;

	// 基本信息
	birthDate?: string;
	email?: string;
	wechat?: string;
	address?: string;
	avatar?: string;

	// 佛教信息
	dharmaName?: string;
	education?:
		| "none"
		| "elementary"
		| "middle_school"
		| "high_school"
		| "bachelor"
		| "master"
		| "phd"
		| "other";
	hasBuddhismFaith?: boolean;
	refugeStatus?: "none" | "took_refuge" | "five_precepts" | "bodhisattva";
	healthConditions?:
		| "healthy"
		| "has_chronic_disease"
		| "has_disability"
		| "has_allergies"
		| "recovering_from_illness"
		| "other_conditions";
	religiousBackground?:
		| "upasaka"
		| "upasika"
		| "sramanera"
		| "sramanerika"
		| "bhikkhu"
		| "bhikkhuni"
		| "anagarika"
		| "siladhara"
		| "novice_monk"
		| "buddhist_visitor"
		| "none";

	// 义工相关信息
	joinReason?: string;
	hobbies?: string;
	availableTimes?: string;
	trainingRecords?: string;
	serviceHours?: number;
	isCertified?: boolean;
	emergencyContact?: string;
	familyConsent?: "approved" | "partial" | "rejected" | "self_decided";
	notes?: string;
	reviewer?: string;

	// 义工状态
	volunteerStatus?:
		| "applicant"
		| "trainee"
		| "registered"
		| "inactive"
		| "suspended";
	signedCommitment?: boolean;
	commitmentSignedDate?: string;
	severPosition?:
		| "kitchen"
		| "chanting"
		| "cleaning"
		| "reception"
		| "security"
		| "office"
		| "other";

	// 通用状态
	status?:
		| "active"
		| "inactive"
		| "applicant"
		| "trainee"
		| "registered"
		| "suspended";

	// 角色
	lotusRole?: "admin" | "volunteer";

	// 住宿信息
	memberStatus?: "volunteer" | "resident";
	roomId?: number;
}

export const volunteerService = {
	/**
	 * 获取义工列表
	 */
	getList: async (
		params: VolunteerListParams,
	): Promise<ApiResponse<PaginationResponse<Volunteer>>> => {
		// 转换参数：pageSize -> limit
		const { pageSize, ...rest } = params;
		const apiParams = {
			...rest,
			limit: pageSize,
		};
		return api.get("/api/volunteer", { params: apiParams });
	},

	/**
	 * 根据 lotusId 获取义工详情
	 */
	getByLotusId: async (lotusId: string): Promise<ApiResponse<Volunteer>> => {
		return api.get(`/api/volunteer/${lotusId}`);
	},

	/**
	 * 创建义工
	 */
	create: async (
		data: CreateVolunteerParams,
	): Promise<ApiResponse<Volunteer>> => {
		// 数据转换：处理特殊字段
		const transformedData: any = { ...data };
		
		// 转换 availableTimes：字符串 -> 数组
		if (typeof transformedData.availableTimes === 'string') {
			if (transformedData.availableTimes === '' || transformedData.availableTimes === '[]') {
				transformedData.availableTimes = [];
			} else {
				try {
					transformedData.availableTimes = JSON.parse(transformedData.availableTimes);
				} catch (e) {
					// 如果解析失败，设为空数组
					transformedData.availableTimes = [];
				}
			}
		}
		
		// 转换空字符串为 null（后端期望的格式）
		Object.keys(transformedData).forEach((key) => {
			if (transformedData[key] === '') {
				transformedData[key] = null;
			}
		});
		
		return api.post("/api/volunteer", transformedData);
	},

	/**
	 * 更新义工信息
	 */
	update: async (
		lotusId: string,
		data: Partial<CreateVolunteerParams>,
	): Promise<ApiResponse<Volunteer>> => {
		// 数据转换：处理特殊字段
		const transformedData: any = { ...data };
		
		// 转换 availableTimes：字符串 -> 数组
		if (typeof transformedData.availableTimes === 'string') {
			if (transformedData.availableTimes === '' || transformedData.availableTimes === '[]') {
				transformedData.availableTimes = [];
			} else {
				try {
					transformedData.availableTimes = JSON.parse(transformedData.availableTimes);
				} catch (e) {
					// 如果解析失败，设为空数组
					transformedData.availableTimes = [];
				}
			}
		}
		
		// 转换空字符串为 null（后端期望的格式）
		Object.keys(transformedData).forEach((key) => {
			if (transformedData[key] === '') {
				transformedData[key] = null;
			}
		});
		
		// 调试：打印发送的数据
		console.log('🔍 更新志愿者数据:', JSON.stringify(transformedData, null, 2));
		return api.put(`/api/volunteer/${lotusId}`, transformedData);
	},

	/**
	 * 删除义工
	 */
	delete: async (lotusId: string): Promise<ApiResponse> => {
		return api.delete(`/api/volunteer/${lotusId}`);
	},

	/**
	 * 搜索义工
	 */
	search: async (
		keyword: string,
		limit?: number,
	): Promise<ApiResponse<Volunteer[]>> => {
		return api.get("/api/volunteer/search", { params: { keyword, limit } });
	},

	/**
	 * 修改密码
	 */
	changePassword: async (
		lotusId: string,
		oldPassword: string,
		newPassword: string,
	): Promise<ApiResponse> => {
		return api.post(`/api/volunteer/${lotusId}/change-password`, {
			oldPassword,
			newPassword,
		});
	},

	/**
	 * 变更状态
	 */
	changeStatus: async (
		lotusId: string,
		status: string,
	): Promise<ApiResponse> => {
		return api.patch(`/api/volunteer/${lotusId}/status`, { status });
	},

	/**
	 * 批量导入
	 */
	batchImport: async (
		volunteers: CreateVolunteerParams[],
	): Promise<ApiResponse> => {
		return api.post("/api/volunteer/batch/import", volunteers);
	},

	/**
	 * 批量删除
	 */
	batchDelete: async (lotusIds: string[]): Promise<ApiResponse> => {
		return api.post("/api/volunteer/batch/delete", { lotusIds });
	},

	/**
	 * 获取所有义工（不分页，用于导出）
	 */
	getAll: async (filters?: {
		volunteerStatus?: string;
		lotusRole?: string;
		gender?: string;
		createdAtStart?: string;
		createdAtEnd?: string;
	}): Promise<ApiResponse<Volunteer[]>> => {
		return api.get("/api/volunteer/all", { params: filters });
	},

	/**
	 * 更新义工角色
	 */
	updateRole: async (
		lotusId: string,
		role: "admin" | "volunteer",
	): Promise<ApiResponse> => {
		return api.patch(`/api/volunteer/${lotusId}/role`, { role });
	},
};
