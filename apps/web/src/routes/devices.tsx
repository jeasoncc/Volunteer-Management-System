import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { deviceService } from "@/services/device";
import { SyncTab } from "@/components/device/SyncTab";
import { DeviceTab } from "@/components/device/DeviceTab";
import { AdvertTab } from "@/components/device/AdvertTab";
import { HistoryTab } from "@/components/device/HistoryTab";

export const Route = createFileRoute("/devices")({
	component: DevicesPage,
} as any);

function DevicesPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const [syncProgress, setSyncProgress] = useState<any>(null);
	const pollFailCountRef = useRef(0);

	// 轮询同步进度
	const { data: progressData, error: progressError, isError } = useQuery({
		queryKey: ["sync", "progress"],
		queryFn: () => deviceService.getSyncProgress(),
		enabled: syncProgress?.status === "syncing",
		refetchInterval: 1000,
		retry: false,
	})

	// 处理轮询错误
	useEffect(() => {
		if (isError && syncProgress?.status === "syncing") {
			pollFailCountRef.current += 1;
			
			if (pollFailCountRef.current >= 3) {
				console.warn("服务可能已关闭，重置同步状态");
				setSyncProgress(prev => prev ? { 
					...prev, 
					status: "idle",
					logs: [...(prev.logs || []), {
						time: new Date().toLocaleTimeString('zh-CN'),
						type: 'error' as const,
						message: '⚠️ 服务连接中断，同步状态未知'
					}]
				} : null)
				sessionStorage.removeItem('syncProgress');
				pollFailCountRef.current = 0;
			}
		} else if (progressData && !isError) {
			pollFailCountRef.current = 0;
		}
	}, [progressError, isError, progressData, syncProgress?.status]);

	// 监听进度数据变化
	useEffect(() => {
		if (progressData?.data && syncProgress?.status === "syncing") {
			const data = progressData.data as any;
			if (data.status === 'completed') {
				setSyncProgress({
					...data,
					status: "completed",
				})
				
				setTimeout(() => {
					if (data.logs && data.logs.length > 0) {
						setSyncProgress((prev: any) => prev ? { ...prev, status: 'idle' } : null);
					}
				}, 5000)
			} else if (data.status === 'syncing') {
				setSyncProgress(data);
			}
		}
	}, [progressData, syncProgress?.status]);

	// 保存进度到 sessionStorage
	useEffect(() => {
		if (syncProgress) {
			sessionStorage.setItem('syncProgress', JSON.stringify({
				...syncProgress,
				savedAt: Date.now()
			}))
		}
	}, [syncProgress]);

	// 从 sessionStorage 恢复进度
	useEffect(() => {
		const saved = sessionStorage.getItem('syncProgress');
		if (saved) {
			try {
				const progress = JSON.parse(saved);
				const maxAge = 10 * 60 * 1000;
				const isExpired = progress.savedAt && (Date.now() - progress.savedAt > maxAge);
				
				if (progress.status === 'syncing' && !isExpired) {
					setSyncProgress(progress);
				} else if (isExpired) {
					sessionStorage.removeItem('syncProgress');
				}
			} catch (e) {
				sessionStorage.removeItem('syncProgress');
			}
		}
	}, []);

	if (authLoading) {
		return (
			<div className="container mx-auto p-6">
				<div className="space-y-6">
					<div className="h-10 bg-muted rounded-md w-1/3 animate-pulse" />
					<div className="h-96 bg-muted rounded-lg animate-pulse" />
				</div>
			</div>
		)
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	return (
		<div className="container mx-auto p-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">设备与同步</h1>
				<p className="text-muted-foreground mt-1">管理考勤设备与义工数据同步</p>
			</div>

			<Tabs defaultValue="sync" className="space-y-6">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="sync">同步管理</TabsTrigger>
					<TabsTrigger value="device">设备管理</TabsTrigger>
					<TabsTrigger value="advert">广告设置</TabsTrigger>
					<TabsTrigger value="history">同步历史</TabsTrigger>
				</TabsList>

				<TabsContent value="sync">
					<SyncTab 
						syncProgress={syncProgress}
						setSyncProgress={setSyncProgress}
						pollFailCountRef={pollFailCountRef}
					/>
				</TabsContent>

				<TabsContent value="device">
					<DeviceTab />
				</TabsContent>

				<TabsContent value="advert">
					<AdvertTab />
				</TabsContent>

				<TabsContent value="history">
					<HistoryTab />
				</TabsContent>
			</Tabs>
		</div>
	)
}
