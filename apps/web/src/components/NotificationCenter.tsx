import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
	Bell,
	Check,
	CheckCheck,
	Trash2,
	AlertCircle,
	FileText,
	Users,
	ClipboardCheck,
	Settings as SettingsIcon,
	Smartphone,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification, NotificationType } from "@/types/notification";
import { formatDistanceToNow, format } from "date-fns";
import { zhCN } from "date-fns/locale";

const typeIcons: Record<NotificationType, React.ReactNode> = {
	system: <SettingsIcon className="h-4 w-4" />,
	approval: <Users className="h-4 w-4" />,
	checkin: <ClipboardCheck className="h-4 w-4" />,
	report: <FileText className="h-4 w-4" />,
	warning: <AlertCircle className="h-4 w-4" />,
	device_sync: <Smartphone className="h-4 w-4" />,
};

const typeColors: Record<NotificationType, string> = {
	system: "text-blue-600 bg-blue-50 dark:bg-blue-950",
	approval: "text-orange-600 bg-orange-50 dark:bg-orange-950",
	checkin: "text-green-600 bg-green-50 dark:bg-green-950",
	report: "text-purple-600 bg-purple-50 dark:bg-purple-950",
	warning: "text-red-600 bg-red-50 dark:bg-red-950",
	device_sync: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950",
};

const typeLabels: Record<NotificationType, string> = {
	system: "系统",
	approval: "审批",
	checkin: "考勤",
	report: "报表",
	warning: "警告",
	device_sync: "设备同步",
};

function NotificationItem({
	notification,
	onMarkAsRead,
	onDelete,
}: {
	notification: Notification;
	onMarkAsRead: (id: string) => void;
	onDelete: (id: string) => void;
}) {
	const timestamp = new Date(notification.timestamp);
	const timeAgo = formatDistanceToNow(timestamp, {
		addSuffix: true,
		locale: zhCN,
	});
	const fullTime = format(timestamp, "yyyy-MM-dd HH:mm:ss");

	return (
		<div
			className={`p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
				!notification.read ? "bg-primary/5" : ""
			}`}
		>
			<div className="flex items-start gap-3">
				{/* 图标 */}
				<div
					className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
						typeColors[notification.type]
					}`}
				>
					{typeIcons[notification.type]}
				</div>

				{/* 内容 */}
				<div className="flex-1 min-w-0">
					<div className="flex items-start justify-between gap-2 mb-1">
						<div className="flex items-center gap-2">
							<h4 className="text-sm font-medium">{notification.title}</h4>
							{!notification.read && (
								<div className="w-2 h-2 rounded-full bg-primary" />
							)}
						</div>
						<Badge variant="outline" className="text-xs">
							{typeLabels[notification.type]}
						</Badge>
					</div>
					<p className="text-sm text-muted-foreground mb-2">
						{notification.message}
					</p>
					<div className="flex items-center justify-between">
						<div className="flex flex-col">
							<span className="text-xs text-muted-foreground" title={fullTime}>
								{timeAgo}
							</span>
							<span className="text-xs text-muted-foreground/70">
								{fullTime}
							</span>
						</div>
						<div className="flex items-center gap-1">
							{notification.actionUrl && (
								<Button
									variant="ghost"
									size="sm"
									className="h-7 text-xs"
									asChild
								>
									<Link to={notification.actionUrl}>
										{notification.actionLabel || "查看"}
									</Link>
								</Button>
							)}
							{!notification.read && (
								<Button
									variant="ghost"
									size="sm"
									className="h-7 w-7 p-0"
									onClick={() => onMarkAsRead(notification.id)}
								>
									<Check className="h-3 w-3" />
								</Button>
							)}
							<Button
								variant="ghost"
								size="sm"
								className="h-7 w-7 p-0 text-destructive"
								onClick={() => onDelete(notification.id)}
							>
								<Trash2 className="h-3 w-3" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export function NotificationCenter() {
	const {
		notifications,
		stats,
		markAsRead,
		markAllAsRead,
		deleteNotification,
		clearAll,
	} = useNotifications();
	const [open, setOpen] = useState(false);
	const [filter, setFilter] = useState<"all" | "unread">("all");

	const filteredNotifications =
		filter === "unread"
			? notifications.filter((n) => !n.read)
			: notifications;

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<Bell className="h-5 w-5" />
					{stats.unread > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
						>
							{stats.unread > 99 ? "99+" : stats.unread}
						</Badge>
					)}
					<span className="sr-only">通知中心</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-96 p-0">
				{/* 头部 */}
				<div className="flex items-center justify-between p-4 border-b">
					<div className="flex items-center gap-2">
						<h3 className="font-semibold">通知中心</h3>
						{stats.unread > 0 && (
							<Badge variant="destructive">{stats.unread}</Badge>
						)}
					</div>
					<div className="flex items-center gap-1">
						{stats.unread > 0 && (
							<Button
								variant="ghost"
								size="sm"
								className="h-8 text-xs"
								onClick={markAllAsRead}
							>
								<CheckCheck className="h-3 w-3 mr-1" />
								全部已读
							</Button>
						)}
						{notifications.length > 0 && (
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0 text-destructive"
								onClick={clearAll}
							>
								<Trash2 className="h-3 w-3" />
							</Button>
						)}
					</div>
				</div>

				{/* 标签页 */}
				<Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
					<TabsList className="w-full rounded-none border-b">
						<TabsTrigger value="all" className="flex-1">
							全部 ({stats.total})
						</TabsTrigger>
						<TabsTrigger value="unread" className="flex-1">
							未读 ({stats.unread})
						</TabsTrigger>
					</TabsList>

					<TabsContent value="all" className="m-0">
						<ScrollArea className="h-[400px]">
							{filteredNotifications.length > 0 ? (
								filteredNotifications.map((notification) => (
									<NotificationItem
										key={notification.id}
										notification={notification}
										onMarkAsRead={markAsRead}
										onDelete={deleteNotification}
									/>
								))
							) : (
								<div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
									<Bell className="h-12 w-12 mb-2 opacity-20" />
									<p className="text-sm">暂无通知</p>
								</div>
							)}
						</ScrollArea>
					</TabsContent>

					<TabsContent value="unread" className="m-0">
						<ScrollArea className="h-[400px]">
							{filteredNotifications.length > 0 ? (
								filteredNotifications.map((notification) => (
									<NotificationItem
										key={notification.id}
										notification={notification}
										onMarkAsRead={markAsRead}
										onDelete={deleteNotification}
									/>
								))
							) : (
								<div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
									<CheckCheck className="h-12 w-12 mb-2 opacity-20" />
									<p className="text-sm">没有未读通知</p>
								</div>
							)}
						</ScrollArea>
					</TabsContent>
				</Tabs>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
