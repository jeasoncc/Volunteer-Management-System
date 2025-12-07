import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/lib/toast";

interface NotificationSettings {
	checkinReminder: boolean;
	scheduleNotification: boolean;
	systemMessage: boolean;
	approvalNotification: boolean;
	emailNotification: boolean;
	soundEnabled: boolean;
}

const defaultSettings: NotificationSettings = {
	checkinReminder: true,
	scheduleNotification: true,
	systemMessage: true,
	approvalNotification: true,
	emailNotification: false,
	soundEnabled: true,
};

export function NotificationSettings() {
	const [settings, setSettings] = useState<NotificationSettings>(() => {
		try {
			const stored = localStorage.getItem("notification-settings");
			if (stored) {
				return { ...defaultSettings, ...JSON.parse(stored) };
			}
		} catch (error) {
			console.error("Failed to load notification settings:", error);
		}
		return defaultSettings;
	});

	useEffect(() => {
		try {
			localStorage.setItem("notification-settings", JSON.stringify(settings));
		} catch (error) {
			console.error("Failed to save notification settings:", error);
		}
	}, [settings]);

	const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
		setSettings((prev) => {
			const updated = { ...prev, [key]: value };
			toast.success("通知设置已更新");
			return updated;
		});
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Bell className="h-5 w-5" />
					<CardTitle>通知设置</CardTitle>
				</div>
				<CardDescription>管理您的通知偏好</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<Label htmlFor="checkin-reminder">考勤提醒</Label>
						<p className="text-sm text-muted-foreground">
							每日考勤打卡提醒
						</p>
					</div>
					<Switch
						id="checkin-reminder"
						checked={settings.checkinReminder}
						onCheckedChange={(checked) => updateSetting("checkinReminder", checked)}
					/>
				</div>

				<Separator />

				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<Label htmlFor="schedule-notification">排班通知</Label>
						<p className="text-sm text-muted-foreground">
							助念排班变更通知
						</p>
					</div>
					<Switch
						id="schedule-notification"
						checked={settings.scheduleNotification}
						onCheckedChange={(checked) => updateSetting("scheduleNotification", checked)}
					/>
				</div>

				<Separator />

				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<Label htmlFor="approval-notification">审批通知</Label>
						<p className="text-sm text-muted-foreground">
							审批流程状态变更通知
						</p>
					</div>
					<Switch
						id="approval-notification"
						checked={settings.approvalNotification}
						onCheckedChange={(checked) => updateSetting("approvalNotification", checked)}
					/>
				</div>

				<Separator />

				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<Label htmlFor="system-message">系统消息</Label>
						<p className="text-sm text-muted-foreground">
							系统更新和重要通知
						</p>
					</div>
					<Switch
						id="system-message"
						checked={settings.systemMessage}
						onCheckedChange={(checked) => updateSetting("systemMessage", checked)}
					/>
				</div>

				<Separator />

				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<Label htmlFor="email-notification">邮件通知</Label>
						<p className="text-sm text-muted-foreground">
							通过邮件接收重要通知
						</p>
					</div>
					<Switch
						id="email-notification"
						checked={settings.emailNotification}
						onCheckedChange={(checked) => updateSetting("emailNotification", checked)}
					/>
				</div>

				<Separator />

				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<Label htmlFor="sound-enabled">声音提醒</Label>
						<p className="text-sm text-muted-foreground">
							收到通知时播放提示音
						</p>
					</div>
					<Switch
						id="sound-enabled"
						checked={settings.soundEnabled}
						onCheckedChange={(checked) => updateSetting("soundEnabled", checked)}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

