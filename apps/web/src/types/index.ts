/**
 * 全局类型定义
 */

// 管理员信息
export interface AdminInfo {
	role: "super" | "admin" | "operator";
	permissions?: any;
	department?: string;
}

// 用户类型
export interface User {
	id: number;
	lotusId: string;
	account: string;
	name: string;
	phone: string;
	email?: string;
	avatar?: string;
	lotusRole: "admin" | "volunteer";
	adminInfo?: AdminInfo; // 如果是管理员，包含管理员详细信息
	volunteerStatus?:
		| "applicant"
		| "trainee"
		| "registered"
		| "inactive"
		| "suspended";
}

// 义工类型 - 与后端数据库 schema 完全对应
export interface Volunteer {
	// 主键和标识
	id: number;
	lotusId: string;
	volunteerId?: string;
	idNumber: string;
	lotusRole: "admin" | "volunteer";

	// 账号信息
	account: string;
	password?: string; // 一般不返回到前端

	// 基本信息
	name: string;
	gender: "male" | "female" | "other";
	birthDate?: string;
	phone: string;
	wechat?: string;
	email?: string;
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
	volunteerStatus:
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

	// 通用状态字段
	status?:
		| "active"
		| "inactive"
		| "applicant"
		| "trainee"
		| "registered"
		| "suspended";

	// 住宿信息
	memberStatus?: "volunteer" | "resident";
	roomId?: number;

	// 考勤配置
	syncToAttendance?: boolean; // 是否同步到考勤机
	requireFullAttendance?: boolean; // 是否需要考勤全勤配置
	attendanceTier?: number; // 满勤档位：1-6档

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
	date: string;
	firstCheckinTime?: string;
	lastCheckinTime?: string;
	checkinCount?: number;
	workHours: number;
	status?: "present" | "late" | "early_leave" | "absent" | "on_leave" | "manual";
	isManual?: boolean;
	notes?: string;
	// For monthly report
	month?: string;
	totalDays?: number;
	totalHours?: number;
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
	stats?: {
		total: number;
		newThisMonth: number;
		activeVolunteers: number;
	};
}

// API 响应
export interface ApiResponse<T = any> {
	success: boolean;
	message?: string;
	data?: T;
	code?: string;
}

// 往生者类型
export interface Deceased {
	id: number;
	name: string;
	title: string;
	chantNumber?: string;
	chantPosition?: "room-one" | "room-two" | "room-three" | "room-four" | "unknow";
	gender: "male" | "female" | "other";
	deathDate: string;
	deathTime?: string;
	age?: number;
	visitTime?: string;
	visitationTeam?: string[];
	birthDate?: string;
	religion?: string;
	isOrdained?: boolean;
	address: string;
	causeOfDeath?: string;
	familyContact?: string;
	familyRelationship?: string;
	familyPhone: string;
	specialNotes?: string;
	funeralArrangements?: string;
	createdAt?: string;
}

// 助念排班类型
export interface ChantingSchedule {
	id: number;
	location: "fuhuiyuan" | "waiqin";
	date: string;
	timeSlot: string;
	bellVolunteerId?: number;
	bellVolunteerName?: string;
	teachingVolunteerId?: number;
	teachingVolunteerName?: string;
	backupVolunteerId?: number;
	backupVolunteerName?: string;
	deceasedId: number;
	deceasedName?: string;
	status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
	actualStartTime?: string;
	actualEndTime?: string;
	feedback?: string;
	expectedParticipants?: number;
	specialRequirements?: string;
	createdBy?: number;
	createdByName?: string;
	createdAt?: string;
	updatedAt?: string;
}
