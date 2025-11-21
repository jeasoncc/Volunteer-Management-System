import { useState, useEffect, useCallback } from "react";
import type { Notification, NotificationStats } from "@/types/notification";

const STORAGE_KEY = "app-notifications";
const MAX_NOTIFICATIONS = 50;

// 模拟通知数据（实际应该从后端获取）
const generateMockNotifications = (): Notification[] => {
	const now = new Date();
	return [
		{
			id: "1",
			type: "approval",
			priority: "high",
			title: "新义工申请",
			message: "张三（138****1234）提交了义工申请，需要您审批",
			timestamp: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
			read: false,
			actionUrl: "/volunteers",
			actionLabel: "去审批",
		},
		{
			id: "2",
			type: "approval",
			priority: "normal",
			title: "审批通过",
			message: "李四的义工申请已通过审批",
			timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
			read: false,
			actionUrl: "/volunteers",
			actionLabel: "查看",
		},
		{
			id: "3",
			type: "report",
			priority: "normal",
			title: "月度报表已生成",
			message: "2024年11月考勤报表已生成完成",
			timestamp: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
			read: false,
			actionUrl: "/checkin",
			actionLabel: "查看报表",
		},
		{
			id: "4",
			type: "checkin",
			priority: "low",
			title: "今日考勤提醒",
			message: "今天有15位义工完成了考勤签到",
			timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
			read: true,
		},
		{
			id: "5",
			type: "system",
			priority: "normal",
			title: "系统更新",
			message: "系统已更新到 v1.0.1，新增批量导入功能",
			timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
			read: true,
		},
	];
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
