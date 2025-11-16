/**
 * 全局类型定义
 */

// 用户类型
export interface User {
	id: number;
	lotusId: string;
	account: string;
	name: string;
	phone: string;
	email?: string;
	avatar?: string;
	lotusRole: "admin" | "volunteer" | "resident";
	volunteerStatus?:
		| "applicant"
		| "trainee"
		| "registered"
		| "inactive"
		| "suspended";
}

// 义工类型
export interface Volunteer {
	id: number;
	lotusId: string;
	volunteerId?: string;
	idNumber: string;
	account: string;
	name: string;
	gender: "male" | "female" | "other";
	birthDate?: string;
	phone: string;
	wechat?: string;
	email?: string;
	address?: string;
	avatar?: string;
	nation?: string;

	// 佛教信息
	dharmaName?: string;
	hasBuddhismFaith?: boolean;
	refugeStatus?: "none" | "took_refuge" | "five_precepts" | "bodhisattva";
	religiousBackground?: string;

	// 其他信息
	education?: string;
	healthConditions?: string;
	joinReason?: string;
	hobbies?: string;
	availableTimes?: string;
	emergencyContact?: string;
	familyConsent?: "approved" | "partial" | "rejected" | "self_decided";

	// 状态
	volunteerStatus:
		| "applicant"
		| "trainee"
		| "registered"
		| "inactive"
		| "suspended";
	lotusRole: "admin" | "volunteer" | "resident";

	// 系统字段
	createdAt?: string;
	updatedAt?: string;
}

// 考勤记录类型
export interface CheckInRecord {
	id: number;
	userId: number;
	lotusId: string;
	name: string;
	date: string;
	checkIn: string;
	originTime: string;
	recordType: "face" | "manual";
	deviceSn?: string;
}

// 考勤汇总类型
export interface CheckInSummary {
	id: number;
	userId: number;
	lotusId: string;
	name: string;
	month: string;
	totalDays: number;
	totalHours: number;
	firstCheckIn?: string;
	lastCheckIn?: string;
}

// 分页参数
export interface PaginationParams {
	page?: number;
	pageSize?: number;
}

// 分页响应
export interface PaginationResponse<T> {
	data: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

// API 响应
export interface ApiResponse<T = any> {
	success: boolean;
	message?: string;
	data?: T;
	code?: string;
}
