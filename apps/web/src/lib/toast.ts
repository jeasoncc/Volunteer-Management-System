/**
 * Toast 通知工具
 * 使用 sonner 库实现
 */

import { toast as sonnerToast } from "sonner";

export const toast = {
	success: (message: string, duration?: number) => {
		sonnerToast.success(message, { duration });
	},
	error: (message: string, duration?: number) => {
		sonnerToast.error(message, { duration });
	},
	info: (message: string, duration?: number) => {
		sonnerToast.info(message, { duration });
	},
	warning: (message: string, duration?: number) => {
		sonnerToast.warning(message, { duration });
	},
};
