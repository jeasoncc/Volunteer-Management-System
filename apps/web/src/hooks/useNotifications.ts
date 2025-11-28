import { useState, useEffect, useCallback } from "react";
import type { Notification, NotificationStats } from "@/types/notification";
import { notificationManager } from "@/lib/notification-manager";

export function useNotifications() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);

	// 订阅通知更新
	useEffect(() => {
		const unsubscribe = notificationManager.subscribe((newNotifications) => {
			setNotifications(newNotifications);
			setLoading(false);
		});

		return unsubscribe;
	}, []);

	// 标记为已读
	const markAsRead = useCallback((id: string) => {
		notificationManager.markAsRead(id);
	}, []);

	// 标记全部为已读
	const markAllAsRead = useCallback(() => {
		notificationManager.markAllAsRead();
	}, []);

	// 删除通知
	const deleteNotification = useCallback((id: string) => {
		notificationManager.deleteNotification(id);
	}, []);

	// 清空所有通知
	const clearAll = useCallback(() => {
		notificationManager.clearAll();
	}, []);

	// 添加新通知
	const addNotification = useCallback(
		(notification: Omit<Notification, "id" | "timestamp" | "read">) => {
			notificationManager.addNotification(notification);
		},
		[],
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
