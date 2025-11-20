/**
 * React Query Keys 常量管理
 * 统一管理所有查询键，方便维护和缓存失效
 */

export const QUERY_KEYS = {
	// 认证相关
	AUTH: {
		ME: ['auth', 'me'] as const,
		SESSION: ['auth', 'session'] as const,
	},

	// 义工相关
	VOLUNTEERS: {
		ALL: ['volunteers'] as const,
		LIST: (page?: number, pageSize?: number) => ['volunteers', 'list', page, pageSize] as const,
		DETAIL: (lotusId: string) => ['volunteer', lotusId] as const,
		STATS: ['volunteers', 'stats'] as const,
	},

	// 审批相关
	APPROVAL: {
		ALL: ['approval'] as const,
		PENDING: ['approval', 'pending'] as const,
		PENDING_COUNT: ['approval', 'pending', 'count'] as const,
		HISTORY: (page?: number) => ['approval', 'history', page] as const,
	},

	// 考勤相关
	CHECKIN: {
		ALL: ['checkin'] as const,
		MONTHLY_REPORT: (year: number, month: number) => ['checkin', 'monthly-report', year, month] as const,
		CURRENT_MONTH: ['checkin', 'current-month'] as const,
		RECORDS: (startDate?: string, endDate?: string) => ['checkin', 'records', startDate, endDate] as const,
		USER_SUMMARY: (lotusId: string) => ['checkin', 'user', lotusId] as const,
	},

	// 管理员相关
	ADMINS: {
		ALL: ['admins'] as const,
		LIST: (page?: number) => ['admins', 'list', page] as const,
		DETAIL: (id: number) => ['admin', id] as const,
	},

	// 文档相关
	DOCUMENTS: {
		ALL: ['documents'] as const,
		EXPORT: (startDate: string, endDate: string) => ['documents', 'export', startDate, endDate] as const,
	},
} as const;

/**
 * 辅助函数：创建查询键
 */
export const createQueryKey = {
	volunteers: {
		all: () => QUERY_KEYS.VOLUNTEERS.ALL,
		list: (page?: number, pageSize?: number) => QUERY_KEYS.VOLUNTEERS.LIST(page, pageSize),
		detail: (lotusId: string) => QUERY_KEYS.VOLUNTEERS.DETAIL(lotusId),
		stats: () => QUERY_KEYS.VOLUNTEERS.STATS,
	},
	approval: {
		all: () => QUERY_KEYS.APPROVAL.ALL,
		pending: () => QUERY_KEYS.APPROVAL.PENDING,
		pendingCount: () => QUERY_KEYS.APPROVAL.PENDING_COUNT,
		history: (page?: number) => QUERY_KEYS.APPROVAL.HISTORY(page),
	},
	checkin: {
		all: () => QUERY_KEYS.CHECKIN.ALL,
		monthlyReport: (year: number, month: number) => QUERY_KEYS.CHECKIN.MONTHLY_REPORT(year, month),
		currentMonth: () => QUERY_KEYS.CHECKIN.CURRENT_MONTH,
		records: (startDate?: string, endDate?: string) => QUERY_KEYS.CHECKIN.RECORDS(startDate, endDate),
		userSummary: (lotusId: string) => QUERY_KEYS.CHECKIN.USER_SUMMARY(lotusId),
	},
	admins: {
		all: () => QUERY_KEYS.ADMINS.ALL,
		list: (page?: number) => QUERY_KEYS.ADMINS.LIST(page),
		detail: (id: number) => QUERY_KEYS.ADMINS.DETAIL(id),
	},
};
