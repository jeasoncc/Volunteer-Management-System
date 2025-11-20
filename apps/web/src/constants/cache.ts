/**
 * 缓存策略常量
 * 定义不同类型数据的缓存时间
 */

/**
 * 数据新鲜度时间（staleTime）
 * 数据在这个时间内被认为是"新鲜"的，不会重新请求
 */
export const STALE_TIME = {
	// 极短：30秒 - 用于实时性要求高的数据
	VERY_SHORT: 30 * 1000,
	
	// 短：2分钟 - 用于需要及时更新的数据（如待审批数量）
	SHORT: 2 * 60 * 1000,
	
	// 中等：5分钟 - 用于一般数据（如列表、统计）
	MEDIUM: 5 * 60 * 1000,
	
	// 长：10分钟 - 用于不常变化的数据（如用户信息）
	LONG: 10 * 60 * 1000,
	
	// 极长：30分钟 - 用于静态数据
	VERY_LONG: 30 * 60 * 1000,
	
	// 永久：直到手动失效
	INFINITE: Number.POSITIVE_INFINITY,
} as const;

/**
 * 垃圾回收时间（gcTime，React Query v5 中替代 cacheTime）
 * 未使用的缓存数据在这个时间后被清除
 */
export const GC_TIME = {
	// 短：5分钟
	SHORT: 5 * 60 * 1000,
	
	// 中等：10分钟
	MEDIUM: 10 * 60 * 1000,
	
	// 长：30分钟
	LONG: 30 * 60 * 1000,
	
	// 极长：1小时
	VERY_LONG: 60 * 60 * 1000,
} as const;

/**
 * 自动刷新间隔（refetchInterval）
 */
export const REFETCH_INTERVAL = {
	// 禁用
	DISABLED: false,
	
	// 极短：15秒 - 用于实时数据
	VERY_SHORT: 15 * 1000,
	
	// 短：30秒 - 用于待审批等需要频繁更新的数据
	SHORT: 30 * 1000,
	
	// 中等：1分钟
	MEDIUM: 60 * 1000,
	
	// 长：5分钟
	LONG: 5 * 60 * 1000,
} as const;

/**
 * 缓存策略配置
 * 为不同类型的数据定义默认缓存策略
 */
export const CACHE_CONFIG = {
	// 实时数据：待审批数量等
	REALTIME: {
		staleTime: STALE_TIME.SHORT,
		refetchInterval: REFETCH_INTERVAL.SHORT,
		gcTime: GC_TIME.SHORT,
	},
	
	// 列表数据：义工列表、考勤列表等
	LIST: {
		staleTime: STALE_TIME.MEDIUM,
		refetchInterval: false,
		gcTime: GC_TIME.MEDIUM,
	},
	
	// 详情数据：单个义工详情等
	DETAIL: {
		staleTime: STALE_TIME.MEDIUM,
		refetchInterval: false,
		gcTime: GC_TIME.LONG,
	},
	
	// 统计数据：月度报表等
	STATS: {
		staleTime: STALE_TIME.LONG,
		refetchInterval: false,
		gcTime: GC_TIME.LONG,
	},
	
	// 静态数据：配置项等
	STATIC: {
		staleTime: STALE_TIME.VERY_LONG,
		refetchInterval: false,
		gcTime: GC_TIME.VERY_LONG,
	},
} as const;
