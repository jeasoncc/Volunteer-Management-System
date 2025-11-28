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
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
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
	History,
	Clock,
	XCircle,
	AlertCircle,
	ChevronRight,
	Users,
	Search,
	Zap,
	Database,
	FileEdit,
	Link2,
	Binary,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { deviceService } from "@/services/device";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/devices/old")({
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
	const [showHistorySheet, setShowHistorySheet] = useState(false);
	const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
	const [showDeviceUsers, setShowDeviceUsers] = useState(false);
	const [deviceUserIds, setDeviceUserIds] = useState<string[]>([]);
	const pollFailCountRef = useRef(0);
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

	// 同步历史查询
	const { data: batchesData, refetch: refetchBatches } = useQuery({
		queryKey: ["sync", "batches"],
		queryFn: () => deviceService.getSyncBatches({ page: 1, pageSize: 10 }),
	})

	// 轮询同步进度
	const { data: progressData, isError } = useQuery({
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
				setSyncProgress((prev: any) =>
					prev
						? {
								...prev,
								status: "error",
								logs: [
									...(prev.logs || []),
									{
										time: new Date().toLocaleTimeString("zh-CN"),
										type: "error",
										message: "⚠️ 服务连接中断",
									},
								],
							}
						: null
				)
				pollFailCountRef.current = 0;
			}
		} else if (progressData && !isError) {
			pollFailCountRef.current = 0;
		}
	}, [isError, progressData, syncProgress?.status]);

	// 监听进度数据变化
	useEffect(() => {
		if (progressData?.data && syncProgress?.status === "syncing") {
			const data = progressData.data as any;
			const wasCompleted = syncProgress?.status === "completed";
			setSyncProgress(data);

			// 只在状态从 syncing 变为 completed 时显示提示
			if (data.status === "completed" && !wasCompleted) {
				refetchBatches();
				// 根据结果显示不同的提示
				const message = `成功 ${data.confirmed}，失败 ${data.failed}，跳过 ${data.skipped}`;
				if (data.failed > 0) {
					toast.warning(`同步完成：${message}`);
					// 添加到通知中心
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
					// 添加到通知中心
					addNotification({
						type: "system",
						priority: "normal",
						title: "同步完成",
						message: `设备同步完成：${message}`,
						actionUrl: "/devices",
						actionLabel: "查看详情",
					})
				}
			}
		}
	}, [progressData, syncProgress?.status, refetchBatches, addNotification]);

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
		onMutate: () => {
			setSyncProgress({
				total: 0,
				sent: 0,
				confirmed: 0,
				failed: 0,
				skipped: 0,
				status: "syncing",
				logs: [
					{
						time: new Date().toLocaleTimeString("zh-CN"),
						type: "info",
						message: "正在启动同步...",
					},
				],
				failedUsers: [],
			})
		},
		onSuccess: () => refetchStatus(),
		onError: (error: any) => {
			setSyncProgress(null);
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
			// 重新开始轮询进度
			setSyncProgress({
				total: 0,
				sent: 0,
				confirmed: 0,
				failed: 0,
				skipped: 0,
				status: "syncing",
				logs: [
					{
						time: new Date().toLocaleTimeString("zh-CN"),
						type: "info",
						message: "正在重试失败项...",
					},
				],
				failedUsers: [],
			})
		},
		onError: (error: any) => toast.error(error.message || "重试失败"),
	})

	const clearMutation = useMutation({
		mutationFn: () => deviceService.clearAllUsers(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			toast.success("设备用户已清空，数据库同步标记已重置");
			setShowClearDialog(false);
			refetchStatus();
			// 添加到通知中心
			addNotification({
				type: "warning",
				priority: "high",
				title: "设备已清空",
				message: "考勤机用户数据已清空，数据库同步标记已重置，需要重新同步",
				actionUrl: "/devices",
				actionLabel: "去同步",
			})
		},
		onError: (error: any) => toast.error(error.message || "发送失败"),
	})

	// 查询设备人脸总数
	const faceCountMutation = useMutation({
		mutationFn: () => deviceService.getDeviceFaceCount(),
		onError: (error: any) => toast.error(error.message || "查询失败"),
	})

	// 查询设备所有人员ID
	const userIdsMutation = useMutation({
		mutationFn: () => deviceService.getDeviceUserIds(),
		onSuccess: (data: any) => {
			if (data.success && data.data?.userIds) {
				setDeviceUserIds(data.data.userIds);
				setShowDeviceUsers(true);
			}
		},
		onError: (error: any) => toast.error(error.message || "查询失败"),
	})

	// 查询批次详情
	const { data: batchDetailData, isLoading: batchDetailLoading } = useQuery({
		queryKey: ["sync", "batch", selectedBatchId],
		queryFn: () => deviceService.getSyncBatchDetail(selectedBatchId!),
		enabled: !!selectedBatchId,
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
	const recentBatches = (batchesData as any)?.data?.records || [];
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
					<p className="text-muted-foreground mt-1">将义工数据同步到考勤设备</p>
				</div>
				<Button
					variant="outline"
					onClick={() => setShowHistorySheet(true)}
				>
					<History className="h-4 w-4 mr-2" />
					同步历史
				</Button>
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

							{/* 取消按钮 */}
							{isSyncing && (
								<Button
									variant="outline"
									className="w-full"
									onClick={() => {
										setSyncProgress(null)
										toast.info("已取消同步")
									}}
								>
									取消同步
								</Button>
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
											? "已加载 ${deviceUserIds.length} 个"
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
					{showDeviceUsers && deviceUserIds.length > 0 && (
						<div className="mt-4 pt-4 border-t">
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium">
									设备上的人员ID ({deviceUserIds.length}个)
								</span>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setShowDeviceUsers(false)}
								>
									收起
								</Button>
							</div>
							<ScrollArea className="h-40 rounded-md border bg-muted/30 p-3">
								<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
									{deviceUserIds.map((id) => (
										<Badge
											key={id}
											variant="outline"
											className="justify-center font-mono text-xs"
										>
											{id}
										</Badge>
									))}
								</div>
							</ScrollArea>
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
            {/* 同步历史侧边栏 */}
            <Sheet open={showHistorySheet} onOpenChange={setShowHistorySheet}>
				<SheetContent className="w-full sm:max-w-xl">
					<SheetHeader>
						<SheetTitle className="flex items-center gap-2">
							<History className="h-5 w-5" />
							同步历史
						</SheetTitle>
						<SheetDescription>查看所有同步记录和详细信息</SheetDescription>
					</SheetHeader>
					<div className="mt-6">
						{selectedBatchId && batchDetailData ? (
							// 详情视图
							(<div>
                                <Button
									variant="ghost"
									size="sm"
									onClick={() => setSelectedBatchId(null)}
									className="mb-4"
								>
									← 返回
								</Button>
                                {batchDetailLoading ? (
									<div className="flex items-center justify-center py-12">
										<Loader2 className="h-8 w-8 animate-spin" />
									</div>
								) : (
									<div className="space-y-3">
										{/* 统计 - 单行显示 */}
										<div className="flex items-center gap-4 text-sm">
											<span className="text-muted-foreground">
												总数 <span className="font-semibold text-foreground">{batchDetailData.data?.summary?.total || 0}</span>
											</span>
											<span className="text-green-600">
												成功 <span className="font-semibold">{batchDetailData.data?.summary?.success || 0}</span>
											</span>
											{(batchDetailData.data?.summary?.failed || 0) > 0 && (
												<span className="text-red-600">
													失败 <span className="font-semibold">{batchDetailData.data?.summary?.failed}</span>
												</span>
											)}
											{(batchDetailData.data?.summary?.skipped || 0) > 0 && (
												<span className="text-amber-600">
													跳过 <span className="font-semibold">{batchDetailData.data?.summary?.skipped}</span>
												</span>
											)}
										</div>

										{/* 失败记录 */}
										{batchDetailData.data?.logs?.filter((l: any) => l.status === "failed")
											.length > 0 ? (
											<ScrollArea className="h-[calc(100vh-280px)]">
												<div className="space-y-1.5 pr-4">
													{batchDetailData.data.logs
														.filter((l: any) => l.status === "failed")
														.map((log: any) => (
															<div
																key={log.id}
																className="p-2.5 rounded border-l-2 border-red-500 bg-red-50/50 hover:bg-red-50 transition-colors"
															>
																<div className="flex items-start justify-between gap-2">
																	<div className="flex-1 min-w-0">
																		<div className="text-sm font-medium">
																			{log.name} <span className="text-xs text-muted-foreground font-mono">({log.lotusId})</span>
																		</div>
																		<div className="text-xs text-red-600 mt-0.5">
																			{log.errorMessage || "未知错误"}
																		</div>
																	</div>
																</div>
															</div>
														))}
												</div>
											</ScrollArea>
										) : (
											<div className="text-center py-12 text-muted-foreground">
												<CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-30 text-green-500" />
												<p className="text-sm">全部成功</p>
											</div>
										)}
									</div>
								)}
                            </div>)
						) : recentBatches.length > 0 ? (
							// 列表视图
							(<ScrollArea className="h-[calc(100vh-200px)]">
                                <div className="space-y-2 pr-4">
									{recentBatches.map((batch: any) => (
										<div
											key={batch.id}
											onClick={() => setSelectedBatchId(batch.id)}
											className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
										>
											<div className="flex items-center justify-between mb-2">
												<div className="flex items-center gap-2">
													<Badge
														variant={
															batch.status === "completed" ? "default" : "outline"
														}
														className="text-xs"
													>
														{batch.status === "completed" ? "完成" : "进行中"}
													</Badge>
													<span className="text-xs text-muted-foreground">
														{new Date(batch.startedAt).toLocaleString("zh-CN", {
															month: "numeric",
															day: "numeric",
															hour: "2-digit",
															minute: "2-digit",
														})}
													</span>
													{batch.duration && (
														<span className="text-xs text-muted-foreground">
															•{" "}
															{batch.duration < 60
																? "${Math.round(batch.duration)}秒"
																: "${Math.floor(batch.duration / 60)}分"}
														</span>
													)}
												</div>
												<ChevronRight className="h-4 w-4 text-muted-foreground" />
											</div>
											<div className="flex items-center gap-4 text-sm">
												<span className="text-green-600">
													✓ {batch.successCount}
												</span>
												{batch.failedCount > 0 && (
													<span className="text-red-600">
														✗ {batch.failedCount}
													</span>
												)}
												{batch.skippedCount > 0 && (
													<span className="text-amber-600">
														⊘ {batch.skippedCount}
													</span>
												)}
											</div>
										</div>
									))}
								</div>
                            </ScrollArea>)
						) : (
							// 空状态
							(<div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                                <History className="h-16 w-16 mb-4 opacity-20" />
                                <p className="text-lg font-medium">暂无同步记录</p>
                                <p className="text-sm mt-1">完成首次同步后，历史记录将显示在这里</p>
                            </div>)
						)}
					</div>
				</SheetContent>
			</Sheet>
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
