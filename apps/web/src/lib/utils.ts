import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { debounce as _debounce, throttle as _throttle } from "lodash-es";

/**
 * 合并 Tailwind CSS 类名
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * 格式化日期
 */
export function formatDate(date: Date | string, format = "YYYY-MM-DD"): string {
	const d = typeof date === "string" ? new Date(date) : date;

	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	const hours = String(d.getHours()).padStart(2, "0");
	const minutes = String(d.getMinutes()).padStart(2, "0");
	const seconds = String(d.getSeconds()).padStart(2, "0");

	return format
		.replace("YYYY", String(year))
		.replace("MM", month)
		.replace("DD", day)
		.replace("HH", hours)
		.replace("mm", minutes)
		.replace("ss", seconds);
}

/**
 * 延迟函数
 */
export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 防抖函数 (使用 lodash)
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 */
export const debounce = _debounce;

/**
 * 节流函数 (使用 lodash)
 * @param func 要节流的函数
 * @param wait 等待时间（毫秒）
 */
export const throttle = _throttle;
