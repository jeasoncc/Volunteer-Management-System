export type NotificationType = "system" | "approval" | "checkin" | "report" | "warning";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export interface Notification {
	id: string;
	type: NotificationType;
	priority: NotificationPriority;
	title: string;
	message: string;
	timestamp: string;
	read: boolean;
	actionUrl?: string;
	actionLabel?: string;
	metadata?: Record<string, any>;
}

export interface NotificationStats {
	total: number;
	unread: number;
	byType: Record<NotificationType, number>;
}
