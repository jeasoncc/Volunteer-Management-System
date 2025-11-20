/**
 * 日期时间工具函数
 */

import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';

// 配置 dayjs
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

/**
 * 格式化日期
 */
export const formatDate = {
	/** 完整日期时间：2024-11-19 14:30:00 */
	full: (date: string | Date): string => {
		return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
	},

	/** 日期：2024-11-19 */
	date: (date: string | Date): string => {
		return dayjs(date).format('YYYY-MM-DD');
	},

	/** 时间：14:30:00 */
	time: (date: string | Date): string => {
		return dayjs(date).format('HH:mm:ss');
	},

	/** 简短时间：14:30 */
	timeShort: (date: string | Date): string => {
		return dayjs(date).format('HH:mm');
	},

	/** 中文日期：2024年11月19日 */
	chinese: (date: string | Date): string => {
		return dayjs(date).format('YYYY年MM月DD日');
	},

	/** 中文日期时间：2024年11月19日 14:30 */
	chineseFull: (date: string | Date): string => {
		return dayjs(date).format('YYYY年MM月DD日 HH:mm');
	},

	/** 相对时间：3 分钟前 */
	relative: (date: string | Date): string => {
		return dayjs(date).fromNow();
	},

	/** 月份：2024-11 */
	month: (date: string | Date): string => {
		return dayjs(date).format('YYYY-MM');
	},

	/** 中文月份：2024年11月 */
	monthChinese: (date: string | Date): string => {
		return dayjs(date).format('YYYY年MM月');
	},
};

/**
 * 日期范围计算
 */
export const dateRange = {
	/** 今天 */
	today: (): { start: string; end: string } => {
		const today = dayjs();
		return {
			start: today.startOf('day').format('YYYY-MM-DD'),
			end: today.endOf('day').format('YYYY-MM-DD'),
		};
	},

	/** 本周 */
	thisWeek: (): { start: string; end: string } => {
		const today = dayjs();
		return {
			start: today.startOf('week').format('YYYY-MM-DD'),
			end: today.endOf('week').format('YYYY-MM-DD'),
		};
	},

	/** 本月 */
	thisMonth: (): { start: string; end: string } => {
		const today = dayjs();
		return {
			start: today.startOf('month').format('YYYY-MM-DD'),
			end: today.endOf('month').format('YYYY-MM-DD'),
		};
	},

	/** 最近 N 天 */
	lastDays: (days: number): { start: string; end: string } => {
		const today = dayjs();
		return {
			start: today.subtract(days - 1, 'day').startOf('day').format('YYYY-MM-DD'),
			end: today.endOf('day').format('YYYY-MM-DD'),
		};
	},

	/** 最近 N 个月 */
	lastMonths: (months: number): { start: string; end: string } => {
		const today = dayjs();
		return {
			start: today.subtract(months - 1, 'month').startOf('month').format('YYYY-MM-DD'),
			end: today.endOf('month').format('YYYY-MM-DD'),
		};
	},
};

/**
 * 判断日期是否有效
 */
export const isValidDate = (date: any): boolean => {
	return dayjs(date).isValid();
};

/**
 * 计算两个日期之间的天数
 */
export const daysBetween = (start: string | Date, end: string | Date): number => {
	return dayjs(end).diff(dayjs(start), 'day');
};

/**
 * 判断是否是今天
 */
export const isToday = (date: string | Date): boolean => {
	return dayjs(date).isSame(dayjs(), 'day');
};

/**
 * 判断是否是本周
 */
export const isThisWeek = (date: string | Date): boolean => {
	return dayjs(date).isSame(dayjs(), 'week');
};

/**
 * 判断是否是本月
 */
export const isThisMonth = (date: string | Date): boolean => {
	return dayjs(date).isSame(dayjs(), 'month');
};
