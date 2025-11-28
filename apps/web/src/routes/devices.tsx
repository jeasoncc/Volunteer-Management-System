import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	CheckCircle2,
	Loader2,
	ServerCrash,
	UploadCloud,
	AlertTriangle,
	Trash2,
	RefreshCw,
	RotateCcw,
	Send,
	Clock,
	XCircle,
	AlertCircle,
	Database,
	Zap,
	FileEdit,
	Link2,
	Binary,
	Search,
	Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useSyncWebSocket } from "@/hooks/useSyncWebSocket";
import { deviceService } from "@/services/device";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/devices")({
	component: DevicesPage,
} as any);

function DevicesPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const queryClient = useQueryClient();
	const { addNotification } = useNotifications();

	// 同步配置
	const [syncStrategy, setSyncStrategy] = useState<"all" | "unsynced" | "changed">("all");
	const [photoFormat, setPhotoFormat] = useState<"url" | "base64">("url");

	// 同步状态
	const [syncProgress, setSyncProgress] = useState<any>(null);
	const [showClearDialog, setShowClearDialog] = useState(false);
	const [quickSyncId, setQuickSyncId] = useState("");
	const [showDeviceUsers, setShowDeviceUsers] = useState(false);
	const [deviceUserIds, setDeviceUserIds] = useState<string[]>([]);
	const [compareResult, setCompareResult] = useState<any>(null);
	const [showCompareView, setShowCompareView] = useState<"all" | "inDevice" | "notInDevice" | "orphaned">("all");
	const logsEndRef = useRef<HTMLDivElement>(null);

	// 设备状态查询
	const {
		data: statusData,
		isLoading: statusLoading,
		refetch: refetchStatus,
	} = useQuery({
		queryKey: ["device", "status"],
		queryFn: () => deviceService.getStatus(),
		refetchInterval: 5000,
	})

	// 🔔 WebSocket 实时通信
	const { isConnected } = useSyncWebSocket({
		enabled: true,
		onProgressUpdate: (progress) => {
			setSyncProgress(progress);
		},
		onUserFeedback: (feedback) => {
			// 只在失败时显示 Toast 和添加到通知中心
			if (feedback.status === "failed") {
				toast.error(`${feedback.name} 同步失败：${feedback.message}`);
				addNotification({
					type: "device_sync",
					priority: "high",
					title: "用户同步失败",
					message: `${feedback.name}(${feedback.lotusId}) 同步失败：${feedback.message}`,
					actionUrl: "/devices",
					actionLabel: "查看详情",
				})
			}
		},
		onBatchStart: (batch) => {
			toast.info(`正在下发 ${batch.total} 个人员信息，请等待考勤机反馈...`);
			addNotification({
				type: "device_sync",
				priority: "normal",
				title: "开始同步",
				message: `正在下发 ${batch.total} 个人员信息到考勤机`,
				actionUrl: "/devices",
				actionLabel: "查看进度",
			})
		},
		onBatchComplete: (result) => {
			const message = `成功 ${result.confirmed}，失败 ${result.failed}，跳过 ${result.skipped}`;
			
			if (result.failed > 0) {
				toast.warning(`同步完成：${message}`);
				addNotification({
					type: "warning",
					priority: "high",
					title: "同步完成（有失败）",
					message: `设备同步完成：${message}`,
					actionUrl: "/devices",
					actionLabel: "查看详情",
				})
			} else {
				toast.success(`同步完成：${message}`);
				addNotification({
					type: "device_sync",
					priority: "normal",
					title: "同步完成",
					message: `设备同步完成：${message}`,
					actionUrl: "/devices",
					actionLabel: "查看详情",
				})
			}
		},
		onClearDeviceComplete: (result) => {
			if (result.success) {
				toast.success(result.message);
				addNotification({
					type: "warning",
					priority: "high",
					title: "设备已清空",
					message: result.message,
					actionUrl: "/devices",
					actionLabel: "去同步",
				});
				// 刷新设备状态
				refetchStatus();
			} else {
				toast.error(`清空失败：${result.message}`);
				addNotification({
					type: "warning",
					priority: "high",
					title: "清空设备失败",
					message: `清空设备时发生错误：${result.message}`,
					actionUrl: "/devices",
					actionLabel: "重试",
				});
			}
		},
	})

	// 自动滚动日志
	useEffect(() => {
		if (logsEndRef.current) {
			logsEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [syncProgress?.logs?.length]);

	// Mutations
	const syncAllMutation = useMutation({
		mutationFn: () =>
			deviceService.syncAllUsers({
				strategy: syncStrategy,
				validatePhotos: false,
				photoFormat: photoFormat,
			}),
		onSuccess: () => refetchStatus(),
		onError: (error: any) => {
			toast.error(error.message || "同步失败");
		},
	})

	const syncOneMutation = useMutation({
		mutationFn: (id: string) => deviceService.syncUser(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			toast.info("命令已发送，等待考勤机确认...");
			setQuickSyncId("");
		},
		onError: (error: any) => toast.error(error.message || "发送失败"),
	})

	const retryFailedMutation = useMutation({
		mutationFn: (failedUsers: Array<{ lotusId: string; name: string }>) =>
			deviceService.retryFailedUsersWithBase64(failedUsers),
		onSuccess: () => {
			toast.info("重试命令已发送，等待考勤机确认...");
		},
		onError: (error: any) => toast.error(error.message || "重试失败"),
	})

	const clearMutation = useMutation({
		mutationFn: () => deviceService.clearAllUsers(),
		onMutate: () => {
			toast.info("正在清空设备用户，等待考勤机确认...");
			addNotification({
				type: "system",
				priority: "normal",
				title: "开始清空设备",
				message: "正在清空考勤机上的所有用户数据，等待考勤机确认...",
				actionUrl: "/devices",
				actionLabel: "查看详情",
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			setShowClearDialog(false);
			// 成功提示移到 WebSocket 回调中（onClearDeviceComplete）
		},
		onError: (error: any) => {
			toast.error(error.message || "发送清空命令失败");
			addNotification({
				type: "warning",
				priority: "high",
				title: "发送清空命令失败",
				message: error.message || "发送清空命令时发生错误",
				actionUrl: "/devices",
				actionLabel: "重试",
			});
		},
	})

	// 查询设备人脸总数
	const faceCountMutation = useMutation({
		mutationFn: () => deviceService.getDeviceFaceCount(),
		onError: (error: any) => toast.error(error.message || "查询失败"),
	})

	// 查询设备所有人员ID
	const userIdsMutation = useMutation({
		mutationFn: () => deviceService.getDeviceUserIds(),
		onSuccess: async (data: any) => {
			if (data.success && data.data?.userIds) {
				const userIds = data.data.userIds;
				setDeviceUserIds(userIds);
				setShowDeviceUsers(true);
				
				// 自动对比数据库
				try {
					const compareData = await deviceService.compareDeviceUsers(userIds);
					if (compareData.success) {
						setCompareResult(compareData.data);
					}
				} catch (error) {
					console.error("对比失败:", error);
				}
			}
		},
		onError: (error: any) => toast.error(error.message || "查询失败"),
	})

	// 格式化时间
	const formatTime = (seconds: number): string => {
		if (!seconds || seconds <= 0) return "--";
		if (seconds < 60) return `${Math.round(seconds)}秒`;
		const minutes = Math.floor(seconds / 60);
		const secs = Math.round(seconds % 60);
		return `${minutes}分${secs}秒`;
	}

	if (authLoading) {
		return (
			<div className="space-y-6 animate-pulse">
				<div className="h-10 bg-muted rounded-md w-1/3" />
				<div className="h-64 bg-muted rounded-lg" />
			</div>
		)
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	const devices = (statusData as any)?.data?.devices || [];
	const onlineDevices = devices.filter((d: any) => d.online);
	const isDeviceOnline = onlineDevices.length > 0;
	const isSyncing = syncProgress?.status === "syncing";

	// 计算进度百分比
	const getProgressPercent = () => {
		if (!syncProgress || syncProgress.sent === 0) return 0;
		const processed = syncProgress.confirmed + syncProgress.failed;
		return Math.round((processed / syncProgress.sent) * 100);
	}

	return (
		<div className="space-y-6 animate-in fade-in duration-500">
			{/* 页面标题 */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">设备同步</h1>
					<p className="text-muted-foreground mt-1">
						实时同步义工数据到考勤设备
						{isConnected && (
							<Badge variant="outline" className="ml-2 text-green-600 border-green-600">
								● 已连接
							</Badge>
						)}
					</p>
				</div>
			</div>

			{/* 设备状态 + 快速操作 */}
			<div className="grid gap-4 md:grid-cols-2">
				{/* 设备状态卡片 */}
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-4">
							<div
								className={cn(
									"h-12 w-12 rounded-xl flex items-center justify-center",
									isDeviceOnline ? "bg-green-100" : "bg-muted"
								)}
							>
								{isDeviceOnline ? (
									<CheckCircle2 className="h-6 w-6 text-green-600" />
								) : (
									<ServerCrash className="h-6 w-6 text-muted-foreground" />
								)}
							</div>
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<span className="font-semibold">
										{isDeviceOnline ? "设备在线" : "设备离线"}
									</span>
									{isDeviceOnline && (
										<span className="relative flex h-2 w-2">
											<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
											<span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
										</span>
									)}
								</div>
								<div className="text-sm text-muted-foreground">
									{devices.length > 0
										? devices.map((d: any) => d.deviceSn).join(", ")
										: "未检测到设备"}
								</div>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => refetchStatus()}
								disabled={statusLoading}
							>
								{statusLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
								<RefreshCw className="h-4 w-4" />
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* 快速操作卡片 */}
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-2 mb-3">
							<Send className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm font-medium">单个同步</span>
						</div>
						<div className="flex gap-2">
							<Input
								placeholder="输入莲花斋ID，如 LHZ0001"
								value={quickSyncId}
								onChange={(e) => setQuickSyncId(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && quickSyncId) {
										syncOneMutation.mutate(quickSyncId);
									}
								}}
								className="h-9"
							/>
							<Button
								size="sm"
								onClick={() => quickSyncId && syncOneMutation.mutate(quickSyncId)}
								disabled={!quickSyncId || syncOneMutation.isPending || !isDeviceOnline}
							>
								{syncOneMutation.isPending && (
									<Loader2 className="h-4 w-4 mr-1 animate-spin" />
								)}
								同步
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* 批量同步区域 */}
			<Card>
				<CardHeader className="pb-4">
					<CardTitle className="flex items-center gap-2 text-lg">
						<UploadCloud className="h-5 w-5" />
						批量同步
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* 同步配置 */}
					{!isSyncing && syncProgress?.status !== "completed" && (
						<div className="space-y-4">
							<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
								{/* 同步策略 */}
								<div className="flex-1 space-y-2">
									<Label className="text-sm font-medium">同步策略</Label>
									<ToggleGroup
										type="single"
										value={syncStrategy}
										onValueChange={(v) => v && setSyncStrategy(v as any)}
										className="justify-start"
									>
										<ToggleGroupItem
											value="all"
											className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
										>
											<Database
												className={cn(
													"h-4 w-4 mr-2",
													syncStrategy === "all" && "animate-pulse"
												)}
											/>
											全量同步
										</ToggleGroupItem>
										<ToggleGroupItem
											value="unsynced"
											className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
										>
											<Zap
												className={cn(
													"h-4 w-4 mr-2",
													syncStrategy === "unsynced" && "animate-pulse"
												)}
											/>
											增量同步
										</ToggleGroupItem>
										<ToggleGroupItem
											value="changed"
											className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
										>
											<FileEdit
												className={cn(
													"h-4 w-4 mr-2",
													syncStrategy === "changed" && "animate-pulse"
												)}
											/>
											更新同步
										</ToggleGroupItem>
									</ToggleGroup>
								</div>

								{/* 照片格式 */}
								<div className="flex-1 space-y-2">
									<Label className="text-sm font-medium">照片格式</Label>
									<ToggleGroup
										type="single"
										value={photoFormat}
										onValueChange={(v) => v && setPhotoFormat(v as any)}
										className="justify-start"
									>
										<ToggleGroupItem
											value="url"
											className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
										>
											<Link2
												className={cn(
													"h-4 w-4 mr-2",
													photoFormat === "url" && "animate-pulse"
												)}
											/>
											HTTP 地址
										</ToggleGroupItem>
										<ToggleGroupItem
											value="base64"
											className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
										>
											<Binary
												className={cn(
													"h-4 w-4 mr-2",
													photoFormat === "base64" && "animate-pulse"
												)}
											/>
											Base64 编码
										</ToggleGroupItem>
									</ToggleGroup>
								</div>

								{/* 开始同步按钮 */}
								<Button
									onClick={() => syncAllMutation.mutate()}
									disabled={!isDeviceOnline || syncAllMutation.isPending}
									className="w-full sm:w-auto"
								>
									{syncAllMutation.isPending && (
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									)}
									<UploadCloud className="h-4 w-4 mr-2" />
									开始同步
								</Button>
							</div>
						</div>
					)}

					{/* 同步进度面板 */}
					{syncProgress && syncProgress.status !== "idle" && (
						<div className="space-y-4 pt-4 border-t">
							{/* 状态标题 */}
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									{isSyncing ? (
										<Loader2 className="h-5 w-5 animate-spin text-blue-500" />
									) : syncProgress.status === "completed" ? (
										<CheckCircle2 className="h-5 w-5 text-green-500" />
									) : (
										<XCircle className="h-5 w-5 text-red-500" />
									)}
									<span className="font-medium">
										{isSyncing
											? "正在同步..."
											: syncProgress.status === "completed"
												? "同步完成"
												: "同步中断"}
									</span>
									{syncProgress.batchId && (
										<Badge variant="outline" className="text-xs font-mono">
											{syncProgress.batchId}
										</Badge>
									)}
								</div>
								{!isSyncing && (
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setSyncProgress(null)}
									>
										关闭
									</Button>
								)}
							</div>

							{/* 进度条 */}
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">
										已确认 {syncProgress.confirmed + syncProgress.failed} /{" "}
										{syncProgress.sent} 已发送
									</span>
									<span className="font-medium">{getProgressPercent()}%</span>
								</div>
								<Progress value={getProgressPercent()} className="h-2" />
								{isSyncing && syncProgress.estimatedTimeRemaining > 0 && (
									<div className="flex items-center gap-1 text-sm text-muted-foreground">
										<Clock className="h-3 w-3" />
										预计剩余 {formatTime(syncProgress.estimatedTimeRemaining)}
									</div>
								)}
							</div>

							{/* 统计数据 */}
							<div className="grid grid-cols-4 gap-3">
								<div className="text-center p-3 bg-muted/50 rounded-lg">
									<div className="text-xl font-bold">{syncProgress.sent}</div>
									<div className="text-xs text-muted-foreground">已发送</div>
								</div>
								<div className="text-center p-3 bg-green-50 rounded-lg">
									<div className="text-xl font-bold text-green-600">
										{syncProgress.confirmed}
									</div>
									<div className="text-xs text-green-600">成功</div>
								</div>
								<div className="text-center p-3 bg-red-50 rounded-lg">
									<div className="text-xl font-bold text-red-600">
										{syncProgress.failed}
									</div>
									<div className="text-xs text-red-600">失败</div>
								</div>
								<div className="text-center p-3 bg-amber-50 rounded-lg">
									<div className="text-xl font-bold text-amber-600">
										{syncProgress.skipped}
									</div>
									<div className="text-xs text-amber-600">跳过</div>
								</div>
							</div>

							{/* 实时日志 */}
							{syncProgress.logs && syncProgress.logs.length > 0 && (
								<div>
									<div className="text-sm font-medium mb-2">同步日志</div>
									<ScrollArea className="h-40 rounded-md border bg-muted/30 p-3">
										<div className="space-y-1 font-mono text-xs">
											{syncProgress.logs.map((log: any, i: number) => (
												<div
													key={i}
													className={cn(
														log.type === "success" && "text-green-600",
														log.type === "error" && "text-red-600",
														log.type === "warning" && "text-amber-600",
														log.type === "info" && "text-muted-foreground"
													)}
												>
													<span className="opacity-60">[{log.time}]</span>{" "}
													{log.message}
												</div>
											))}
											<div ref={logsEndRef} />
										</div>
									</ScrollArea>
								</div>
							)}

							{/* 失败重试 */}
							{syncProgress.failedUsers?.length > 0 && !isSyncing && (
								<div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
									<div className="flex items-center gap-2">
										<AlertCircle className="h-4 w-4 text-red-500" />
										<span className="text-sm">
											<span className="font-medium text-red-600">
												{syncProgress.failedUsers.length} 个义工同步失败
											</span>
											<span className="text-muted-foreground ml-2">
												建议使用 Base64 格式重试
											</span>
										</span>
									</div>
									<Button
										size="sm"
										variant="outline"
										className="border-red-200 text-red-600 hover:bg-red-50"
										onClick={() =>
											retryFailedMutation.mutate(syncProgress.failedUsers)
										}
										disabled={retryFailedMutation.isPending}
									>
										{retryFailedMutation.isPending && (
											<Loader2 className="h-4 w-4 mr-1 animate-spin" />
										)}
										<RotateCcw className="h-4 w-4 mr-1" />
										重试
									</Button>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* 设备人员查询 */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-lg">
						<Search className="h-5 w-5" />
						设备人员查询
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col sm:flex-row gap-4">
						{/* 查询人脸总数 */}
						<div className="flex-1 p-4 rounded-lg border bg-muted/30">
							<div className="flex items-center justify-between">
								<div>
									<div className="text-sm text-muted-foreground">设备人脸总数</div>
									<div className="text-2xl font-bold mt-1">
										{faceCountMutation.data?.data?.total ?? "--"}
									</div>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => faceCountMutation.mutate()}
									disabled={faceCountMutation.isPending || !isDeviceOnline}
								>
									{faceCountMutation.isPending ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<RefreshCw className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>

						{/* 查询人员ID列表 */}
						<div className="flex-1 p-4 rounded-lg border bg-muted/30">
							<div className="flex items-center justify-between">
								<div>
									<div className="text-sm text-muted-foreground">人员ID列表</div>
									<div className="text-sm mt-1">
										{deviceUserIds.length > 0
											? `已加载 ${deviceUserIds.length} 个`
											: "点击查询"}
									</div>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => userIdsMutation.mutate()}
									disabled={userIdsMutation.isPending || !isDeviceOnline}
								>
									{userIdsMutation.isPending ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Users className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
					</div>

					{/* 人员ID列表展示 */}
					{showDeviceUsers && deviceUserIds.length > 0 && compareResult && (
						<div className="mt-4 pt-4 border-t space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">
									设备人员对比结果
								</span>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										setShowDeviceUsers(false);
										setCompareResult(null);
										setShowCompareView("all");
									}}
								>
									收起
								</Button>
							</div>

							{/* 统计卡片 */}
							<div className="grid grid-cols-4 gap-3">
								<button
									onClick={() => setShowCompareView("all")}
									className={cn(
										"text-center p-3 rounded-lg border transition-colors",
										showCompareView === "all" ? "bg-primary/10 border-primary" : "bg-muted/50 hover:bg-muted"
									)}
								>
									<div className="text-xl font-bold">{compareResult.total}</div>
									<div className="text-xs text-muted-foreground">数据库总数</div>
								</button>
								<button
									onClick={() => setShowCompareView("inDevice")}
									className={cn(
										"text-center p-3 rounded-lg border transition-colors",
										showCompareView === "inDevice" ? "bg-green-50 border-green-500" : "bg-green-50/50 hover:bg-green-50"
									)}
								>
									<div className="text-xl font-bold text-green-600">{compareResult.inDevice}</div>
									<div className="text-xs text-green-600">已在设备</div>
								</button>
								<button
									onClick={() => setShowCompareView("notInDevice")}
									className={cn(
										"text-center p-3 rounded-lg border transition-colors",
										showCompareView === "notInDevice" ? "bg-amber-50 border-amber-500" : "bg-amber-50/50 hover:bg-amber-50"
									)}
								>
									<div className="text-xl font-bold text-amber-600">{compareResult.notInDevice}</div>
									<div className="text-xs text-amber-600">未在设备</div>
								</button>
								<button
									onClick={() => setShowCompareView("orphaned")}
									className={cn(
										"text-center p-3 rounded-lg border transition-colors",
										showCompareView === "orphaned" ? "bg-red-50 border-red-500" : "bg-red-50/50 hover:bg-red-50"
									)}
								>
									<div className="text-xl font-bold text-red-600">{compareResult.orphanedIds}</div>
									<div className="text-xs text-red-600">孤立ID</div>
								</button>
							</div>

							{/* 详细列表 */}
							<div>
								{showCompareView === "all" && (
									<div className="text-sm text-muted-foreground text-center py-4">
										点击上方卡片查看详细列表
									</div>
								)}

								{showCompareView === "inDevice" && (
									<div>
										<div className="text-sm font-medium mb-2 text-green-600">
											已在设备 ({compareResult.inDevice}个)
										</div>
										<ScrollArea className="h-60 rounded-md border bg-green-50/30 p-3">
											<div className="space-y-1">
												{compareResult.inDeviceList.map((user: any) => (
													<div
														key={user.lotusId}
														className="flex items-center justify-between p-2 rounded bg-white/50 text-sm"
													>
														<span className="font-medium">{user.name}</span>
														<Badge variant="outline" className="font-mono text-xs">
															{user.lotusId}
														</Badge>
													</div>
												))}
											</div>
										</ScrollArea>
									</div>
								)}

								{showCompareView === "notInDevice" && (
									<div>
										<div className="text-sm font-medium mb-2 text-amber-600">
											未在设备 ({compareResult.notInDevice}个)
										</div>
										<ScrollArea className="h-60 rounded-md border bg-amber-50/30 p-3">
											<div className="space-y-1">
												{compareResult.notInDeviceList.map((user: any) => (
													<div
														key={user.lotusId}
														className="flex items-center justify-between p-2 rounded bg-white/50 text-sm"
													>
														<div className="flex items-center gap-2">
															<span className="font-medium">{user.name}</span>
															{user.syncToAttendance && (
																<Badge variant="secondary" className="text-xs">
																	已标记同步
																</Badge>
															)}
														</div>
														<Badge variant="outline" className="font-mono text-xs">
															{user.lotusId}
														</Badge>
													</div>
												))}
											</div>
										</ScrollArea>
									</div>
								)}

								{showCompareView === "orphaned" && (
									<div>
										<div className="text-sm font-medium mb-2 text-red-600">
											孤立ID ({compareResult.orphanedIds}个) - 设备上有但数据库没有
										</div>
										<ScrollArea className="h-60 rounded-md border bg-red-50/30 p-3">
											<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
												{compareResult.orphanedIdsList.map((id: string) => (
													<Badge
														key={id}
														variant="outline"
														className="justify-center font-mono text-xs border-red-200 text-red-600"
													>
														{id}
													</Badge>
												))}
											</div>
										</ScrollArea>
									</div>
								)}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* 危险操作 */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-base">
						<AlertTriangle className="h-4 w-4 text-destructive" />
						危险操作
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-0">
					<div className="p-4 rounded-lg border border-dashed border-destructive/30 bg-destructive/5">
						<div className="flex items-start gap-3">
							<Trash2 className="h-5 w-5 text-destructive mt-0.5" />
							<div className="flex-1">
								<div className="font-medium text-destructive">清空设备用户</div>
								<p className="text-sm text-muted-foreground mt-1">
									清空考勤机上的所有用户数据，需要重新同步才能恢复考勤功能
								</p>
								<Button
									variant="outline"
									size="sm"
									className="mt-3 text-destructive border-destructive/30 hover:bg-destructive/10"
									onClick={() => setShowClearDialog(true)}
								>
									清空设备
								</Button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 清空确认对话框 */}
			<AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2 text-destructive">
							<AlertTriangle className="h-5 w-5" />
							确认清空设备？
						</AlertDialogTitle>
						<AlertDialogDescription asChild>
							<div className="space-y-2">
								<p>此操作将：</p>
								<ul className="list-disc list-inside text-sm space-y-1">
									<li>清空考勤机设备上的所有用户数据</li>
									<li>清除数据库中所有义工的同步标记</li>
									<li>需要重新同步才能恢复考勤功能</li>
								</ul>
								<p className="text-destructive font-medium mt-3">
									此操作不可恢复！
								</p>
							</div>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>取消</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive hover:bg-destructive/90"
							onClick={() => clearMutation.mutate()}
						>
							确认清空
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
