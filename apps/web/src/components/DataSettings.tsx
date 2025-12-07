import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Database, Download, Trash2, HardDrive, Cookie } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/lib/toast";

interface DataSettings {
	exportFormat: "xlsx" | "csv" | "pdf";
	defaultPageSize: number;
	autoSave: boolean;
	autoSaveInterval: number; // 秒
}

const defaultSettings: DataSettings = {
	exportFormat: "xlsx",
	defaultPageSize: 20,
	autoSave: true,
	autoSaveInterval: 30,
};

export function DataSettings() {
	const [settings, setSettings] = useState<DataSettings>(() => {
		try {
			const stored = localStorage.getItem("data-settings");
			if (stored) {
				return { ...defaultSettings, ...JSON.parse(stored) };
			}
		} catch (error) {
			console.error("Failed to load data settings:", error);
		}
		return defaultSettings;
	});

	useEffect(() => {
		try {
			localStorage.setItem("data-settings", JSON.stringify(settings));
		} catch (error) {
			console.error("Failed to save data settings:", error);
		}
	}, [settings]);

	const updateSetting = <K extends keyof DataSettings>(key: K, value: DataSettings[K]) => {
		setSettings((prev) => ({ ...prev, [key]: value }));
		toast.success("数据设置已更新");
	};

	const handleClearCache = () => {
		if (confirm("确定要清除所有缓存数据吗？这将清除本地存储的设置和临时数据。")) {
			try {
				// 保留重要的设置
				const importantKeys = [
					"vite-ui-theme-mode",
					"vite-ui-theme-color",
					"vite-appearance-settings",
					"notification-settings",
					"data-settings",
				];
				
				const importantData: Record<string, string> = {};
				importantKeys.forEach((key) => {
					const value = localStorage.getItem(key);
					if (value) importantData[key] = value;
				});

				localStorage.clear();

				// 恢复重要设置
				Object.entries(importantData).forEach(([key, value]) => {
					localStorage.setItem(key, value);
				});

				toast.success("缓存已清除");
				window.location.reload();
			} catch (error) {
				toast.error("清除缓存失败");
			}
		}
	};

	const handleClearAll = () => {
		if (confirm("确定要清除所有 Cookies 和 LocalStorage 吗？这将清除所有本地数据，包括您的设置和登录信息。您需要重新登录。")) {
			try {
				// 清除所有 localStorage
				localStorage.clear();
				
				// 清除所有 cookies
				document.cookie.split(";").forEach((cookie) => {
					const eqPos = cookie.indexOf("=");
					const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
					// 清除当前域和父域的 cookie
					document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
					document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
					document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
				});

				toast.success("已清除所有 Cookies 和 LocalStorage");
				// 延迟一下再刷新，让 toast 显示出来
				setTimeout(() => {
					window.location.href = "/login";
				}, 1000);
			} catch (error) {
				toast.error("清除失败");
			}
		}
	};

	const handleExportData = () => {
		try {
			const data: Record<string, any> = {};
			
			// 导出所有设置
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key) {
					try {
						data[key] = JSON.parse(localStorage.getItem(key) || "");
					} catch {
						data[key] = localStorage.getItem(key);
					}
				}
			}

			const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `settings-backup-${new Date().toISOString().split("T")[0]}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			toast.success("数据已导出");
		} catch (error) {
			toast.error("导出数据失败");
		}
	};

	const getStorageSize = () => {
		let total = 0;
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key) {
				total += localStorage.getItem(key)?.length || 0;
			}
		}
		return (total / 1024).toFixed(2); // KB
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Database className="h-5 w-5" />
					<CardTitle>数据设置</CardTitle>
				</div>
				<CardDescription>管理数据导出和存储偏好</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* 导出格式 */}
				<div className="space-y-2">
					<Label htmlFor="export-format">默认导出格式</Label>
					<Select
						value={settings.exportFormat}
						onValueChange={(value) => updateSetting("exportFormat", value as any)}
					>
						<SelectTrigger id="export-format">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
							<SelectItem value="csv">CSV (.csv)</SelectItem>
							<SelectItem value="pdf">PDF (.pdf)</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<Separator />

				{/* 默认分页大小 */}
				<div className="space-y-2">
					<Label htmlFor="page-size">默认分页大小</Label>
					<Select
						value={String(settings.defaultPageSize)}
						onValueChange={(value) => updateSetting("defaultPageSize", Number(value))}
					>
						<SelectTrigger id="page-size">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="10">10 条/页</SelectItem>
							<SelectItem value="20">20 条/页</SelectItem>
							<SelectItem value="50">50 条/页</SelectItem>
							<SelectItem value="100">100 条/页</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<Separator />

				{/* 存储信息 */}
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<HardDrive className="h-4 w-4" />
						<Label className="text-base font-semibold">存储管理</Label>
					</div>
					<div className="pl-6 space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">已用存储</p>
								<p className="text-xs text-muted-foreground">
									{getStorageSize()} KB
								</p>
							</div>
						</div>

						<div className="flex flex-wrap gap-2">
							<Button variant="outline" size="sm" onClick={handleExportData}>
								<Download className="h-4 w-4 mr-2" />
								导出数据
							</Button>
							<Button variant="outline" size="sm" onClick={handleClearCache}>
								<Trash2 className="h-4 w-4 mr-2" />
								清除缓存
							</Button>
							<Button 
								variant="destructive" 
								size="sm" 
								onClick={handleClearAll}
								className="border-destructive"
							>
								<Cookie className="h-4 w-4 mr-2" />
								清空所有数据
							</Button>
						</div>
						<p className="text-xs text-muted-foreground">
							清空所有数据将清除 Cookies 和 LocalStorage，您需要重新登录
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

