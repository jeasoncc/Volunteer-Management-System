import { useState, useEffect, useCallback } from "react";
import type { Notification, NotificationStats } from "@/types/notification";

const STORAGE_KEY = "app-notifications";
const MAX_NOTIFICATIONS = 50;

// 默认空通知列表（通知由实际操作产生）
const generateMockNotifications = (): Notification[] => {
	return [];
};

export function useNotifications() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);

	// 从 LocalStorage 加载通知
	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				setNotifications(JSON.parse(stored));
			} catch (error) {
				console.error("Failed to parse notifications:", error);
				setNotifications(generateMockNotifications());
			}
		} else {
			setNotifications(generateMockNotifications());
		}
		setLoading(false);
	}, []);

	// 保存到 LocalStorage
	const saveNotifications = useCallback((newNotifications: Notification[]) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotifications));
		setNotifications(newNotifications);
	}, []);

	// 标记为已读
	const markAsRead = useCallback(
		(id: string) => {
			const updated = notifications.map((n) =>
				n.id === id ? { ...n, read: true } : n,
			);
			saveNotifications(updated);
		},
		[notifications, saveNotifications],
	);

	// 标记全部为已读
	const markAllAsRead = useCallback(() => {
		const updated = notifications.map((n) => ({ ...n, read: true }));
		saveNotifications(updated);
	}, [notifications, saveNotifications]);

	// 删除通知
	const deleteNotification = useCallback(
		(id: string) => {
			const updated = notifications.filter((n) => n.id !== id);
			saveNotifications(updated);
		},
		[notifications, saveNotifications],
	);

	// 清空所有通知
	const clearAll = useCallback(() => {
		saveNotifications([]);
	}, [saveNotifications]);

	// 添加新通知
	const addNotification = useCallback(
		(notification: Omit<Notification, "id" | "timestamp" | "read">) => {
			const newNotification: Notification = {
				...notification,
				id: Date.now().toString(),
				timestamp: new Date().toISOString(),
				read: false,
			};
			const updated = [newNotification, ...notifications].slice(
				0,
				MAX_NOTIFICATIONS,
			);
			saveNotifications(updated);
		},
		[notifications, saveNotifications],
	);

	// 计算统计信息
	const stats: NotificationStats = {
		total: notifications.length,
		unread: notifications.filter((n) => !n.read).length,
		byType: notifications.reduce((acc, n) => {
			acc[n.type] = (acc[n.type] || 0) + 1;
			return acc;
		}, {} as Record<string, number>),
	};

	return {
		notifications,
		loading,
		stats,
		markAsRead,
		markAllAsRead,
		deleteNotification,
		clearAll,
		addNotification,
	};
}
