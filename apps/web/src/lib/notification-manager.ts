/**
 * 全局通知管理器
 * 使用事件系统确保所有组件都能实时接收通知更新
 */

import type { Notification } from "@/types/notification";

const STORAGE_KEY = "app-notifications";
const MAX_NOTIFICATIONS = 50;

type NotificationListener = (notifications: Notification[]) => void;

class NotificationManager {
	private listeners: Set<NotificationListener> = new Set();
	private notifications: Notification[] = [];

	constructor() {
		// 从 LocalStorage 加载通知
		this.loadFromStorage();
	}

	private loadFromStorage() {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				this.notifications = JSON.parse(stored);
			}
		} catch (error) {
			console.error("Failed to load notifications:", error);
			this.notifications = [];
		}
	}

	private saveToStorage() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications));
		} catch (error) {
			console.error("Failed to save notifications:", error);
		}
	}

	private notifyListeners() {
		this.listeners.forEach((listener) => {
			try {
				listener([...this.notifications]);
			} catch (error) {
				console.error("Notification listener error:", error);
			}
		});
	}

	subscribe(listener: NotificationListener) {
		this.listeners.add(listener);
		// 立即发送当前状态
		listener([...this.notifications]);
		// 返回取消订阅函数
		return () => {
			this.listeners.delete(listener);
		};
	}

	getNotifications(): Notification[] {
		return [...this.notifications];
	}

	addNotification(notification: Omit<Notification, "id" | "timestamp" | "read">) {
		const newNotification: Notification = {
			...notification,
			id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
			timestamp: new Date().toISOString(),
			read: false,
		};

		this.notifications = [newNotification, ...this.notifications].slice(
			0,
			MAX_NOTIFICATIONS
		);

		this.saveToStorage();
		this.notifyListeners();
	}

	markAsRead(id: string) {
		this.notifications = this.notifications.map((n) =>
			n.id === id ? { ...n, read: true } : n
		);
		this.saveToStorage();
		this.notifyListeners();
	}

	markAllAsRead() {
		this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
		this.saveToStorage();
		this.notifyListeners();
	}

	deleteNotification(id: string) {
		this.notifications = this.notifications.filter((n) => n.id !== id);
		this.saveToStorage();
		this.notifyListeners();
	}

	clearAll() {
		this.notifications = [];
		this.saveToStorage();
		this.notifyListeners();
	}
}

// 导出单例
export const notificationManager = new NotificationManager();
