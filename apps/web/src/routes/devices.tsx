import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { deviceService } from "@/services/device";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/lib/toast";
import { CheckCircle2, Loader2, RefreshCw, ServerCrash, UploadCloud, AlertTriangle, RotateCcw, History, ChevronRight, Clock } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/devices")({
	component: DevicesPage,
} as any);

interface SyncLog {
	time: string;
	type: 'info' | 'success' | 'error' | 'warning';
	message: string;
	userId?: string;
}

// 格式化时间（秒转为分:秒）
function formatTime(seconds: number): string {
	if (seconds < 60) {
		return `${Math.round(seconds)}秒`;
	}
	const minutes = Math.floor(seconds / 60);
	const secs = Math.round(seconds % 60);
	return `${minutes}分${secs}秒`;
}

function DevicesPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const queryClient = useQueryClient();
	const [lotusId, setLotusId] = useState("");
	const [syncStrategy, setSyncStrategy] = useState<'all' | 'unsynced' | 'changed'>('unsynced');
	const [validatePhotos, setValidatePhotos] = useState(false);
	const logsEndRef = useRef<HTMLDivElement>(null);

	const {
		data: statusData,
		isLoading: statusLoading,
		refetch: refetchStatus,
	} = useQuery({
		queryKey: ["device", "status"],
		queryFn: () => deviceService.getStatus(),
		enabled: isAuthenticated,
	});

	const [syncProgress, setSyncProgress] = useState<{
		total: number;
		sent: number;
		confirmed: number;
		failed: number;
		skipped: number;
		status: string;
		logs: SyncLog[];
		failedUsers: Array<{ lotusId: string; name: string; reason: string }>;
		// 新增：时间相关字段
		startTime?: number | null;
		estimatedTimeRemaining?: number | null;
		averageTimePerUser?: number | null;
		batchId?: string | null;
	} | null>(null);

	// 轮询失败计数 - 使用 ref 避免闭包问题
	const pollFailCountRef = useRef(0);

	// 轮询同步进度
	const { data: progressData, error: progressError, isError } = useQuery({
		queryKey: ["sync", "progress"],
		queryFn: () => deviceService.getSyncProgress(),
		enabled: syncProgress?.status === "syncing",
		refetchInterval: 1000, // 每1秒轮询一次
		retry: false, // 不重试，快速检测服务不可用
	});

	// 处理轮询错误 - 服务不可用时重置状态
	useEffect(() => {
		if (isError && syncProgress?.status === "syncing") {
			pollFailCountRef.current += 1;
			console.warn(`同步进度轮询失败 (${pollFailCountRef.current}/3)`);
			
			// 连续失败3次后重置状态
			if (pollFailCountRef.current >= 3) {
				console.warn("服务可能已关闭，重置同步状态");
				setSyncProgress(prev => prev ? { 
					...prev, 
					status: 'idle',
					logs: [...(prev.logs || []), {
						time: new Date().toLocaleTimeString('zh-CN'),
						type: 'error' as const,
						message: '⚠️ 服务连接中断，同步状态未知'
					}]
				} : null);
				sessionStorage.removeItem('syncProgress');
				pollFailCountRef.current = 0;
			}
		} else if (progressData && !isError) {
			pollFailCountRef.current = 0; // 成功时重置计数
		}
	}, [progressError, isError, progressData, syncProgress?.status]);

	// 监听进度数据变化
	useEffect(() => {
		if (progressData?.data && syncProgress?.status === "syncing") {
			const data = progressData.data as any;
			if (data.status === 'completed') {
				setSyncProgress({
					total: data.total,
					sent: data.sent,
					confirmed: data.confirmed,
					failed: data.failed,
					skipped: data.skipped,
					status: "completed",
					logs: data.logs || [],
					failedUsers: data.failedUsers || [],
				});
				
				// 同步完成后刷新义工列表，显示最新的同步状态
				queryClient.invalidateQueries({ queryKey: ["volunteers"] });
				
				// 显示完成提示
				const successCount = data.confirmed;
				const failedCount = data.failed;
				const skippedCount = data.skipped;
				
				if (failedCount === 0 && skippedCount === 0) {
					toast.success(`🎉 同步完成！成功 ${successCount} 个`);
				} else if (failedCount > 0) {
					toast.warning(`同步完成：成功 ${successCount}，失败 ${failedCount}，跳过 ${skippedCount}`);
				} else {
					toast.success(`同步完成：成功 ${successCount}，跳过 ${skippedCount}`);
				}
				
				// 5秒后隐藏进度条（但保留日志）
				setTimeout(() => {
					if (data.logs && data.logs.length > 0) {
						// 保留日志，只改变状态
						setSyncProgress(prev => prev ? { ...prev, status: 'idle' } : null);
					}
				}, 5000);
			} else if (data.status === 'syncing') {
				setSyncProgress({
					total: data.total,
					sent: data.sent,
					confirmed: data.confirmed,
					failed: data.failed,
					skipped: data.skipped,
					status: "syncing",
					logs: data.logs || [],
					failedUsers: data.failedUsers || [],
					startTime: data.startTime,
					estimatedTimeRemaining: data.estimatedTimeRemaining,
					averageTimePerUser: data.averageTimePerUser,
					batchId: data.batchId,
				});
			}
		}
	}, [progressData, queryClient]);

	// 自动滚动到日志底部（只在容器内滚动）
	useEffect(() => {
		if (syncProgress?.logs && syncProgress.logs.length > 0 && logsEndRef.current) {
			// 使用 scrollTop 而不是 scrollIntoView，避免滚动整个页面
			const container = logsEndRef.current.parentElement;
			if (container) {
				container.scrollTop = container.scrollHeight;
			}
		}
	}, [syncProgress?.logs]);

	// 保存进度到 sessionStorage（带时间戳）
	useEffect(() => {
		if (syncProgress) {
			sessionStorage.setItem('syncProgress', JSON.stringify({
				...syncProgress,
				savedAt: Date.now()
			}));
		}
	}, [syncProgress]);

	// 从 sessionStorage 恢复进度（带超时检测）
	useEffect(() => {
		const saved = sessionStorage.getItem('syncProgress');
		if (saved) {
			try {
				const progress = JSON.parse(saved);
				// 只恢复未完成的同步，且保存时间不超过10分钟
				const maxAge = 10 * 60 * 1000; // 10分钟
				const isExpired = progress.savedAt && (Date.now() - progress.savedAt > maxAge);
				
				if (progress.status === 'syncing' && !isExpired) {
					setSyncProgress(progress);
				} else if (isExpired) {
					// 过期的同步状态，清除并提示
					sessionStorage.removeItem('syncProgress');
					console.warn('同步状态已过期，已清除');
				}
			} catch (e) {
				console.error('恢复同步进度失败:', e);
				sessionStorage.removeItem('syncProgress');
			}
		}
	}, []);


	const syncAllMutation = useMutation({
		mutationFn: () => deviceService.syncAllUsers({ strategy: syncStrategy, validatePhotos }),
		onMutate: () => {
			// 开始同步时显示进度
			setSyncProgress({ 
				total: 0, 
				sent: 0, 
				confirmed: 0, 
				failed: 0, 
				skipped: 0, 
				status: "syncing",
				logs: [{
					time: new Date().toLocaleTimeString('zh-CN'),
					type: 'info' as const,
					message: '正在启动同步...'
				}],
				failedUsers: [],
			});
		},
		onSuccess: () => {
			// 不在这里显示 toast，等待同步完成后再显示
			refetchStatus();
		},
		onError: (error: any) => {
			// 同步失败时重置状态并清除存储
			setSyncProgress(null);
			sessionStorage.removeItem('syncProgress');
			pollFailCountRef.current = 0;
			toast.error(error.message || "批量同步失败");
		},
	});

	const retryFailedMutation = useMutation({
		mutationFn: (failedUsers: Array<{ lotusId: string; name: string }>) => 
			deviceService.retryFailedUsers(failedUsers),
		onMutate: () => {
			setSyncProgress({ 
				total: 0, 
				sent: 0, 
				confirmed: 0, 
				failed: 0, 
				skipped: 0, 
				status: "syncing",
				logs: [{
					time: new Date().toLocaleTimeString('zh-CN'),
					type: 'info' as const,
					message: '正在重试失败项...'
				}],
				failedUsers: [],
			});
		},
		onSuccess: (res: any) => {
			toast.success(res?.message || "重试完成");
			refetchStatus();
		},
		onError: (error: any) => {
			toast.error(error.message || "重试失败");
		},
	});

	const retryFailedWithBase64Mutation = useMutation({
		mutationFn: (failedUsers: Array<{ lotusId: string; name: string }>) => 
			deviceService.retryFailedUsersWithBase64(failedUsers),
		onMutate: () => {
			setSyncProgress({ 
				total: 0, 
				sent: 0, 
				confirmed: 0, 
				failed: 0, 
				skipped: 0, 
				status: "syncing",
				logs: [{
					time: new Date().toLocaleTimeString('zh-CN'),
					type: 'info' as const,
					message: '正在使用Base64格式重试...'
				}],
				failedUsers: [],
			});
		},
		onSuccess: (res: any) => {
			toast.success(res?.message || "Base64重试完成");
			refetchStatus();
		},
		onError: (error: any) => {
			toast.error(error.message || "Base64重试失败");
		},
	});

	const syncOneMutation = useMutation({
		mutationFn: (id: string) => deviceService.syncUser(id),
		onSuccess: (res: any) => {
			// 刷新义工列表
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			toast.success(res?.message || "已发送同步命令，等待考勤机确认");
		},
		onError: (error: any) => {
			toast.error(error.message || "单个同步失败");
		},
	});

	const [showClearDialog, setShowClearDialog] = useState(false);
	const [showHistoryDialog, setShowHistoryDialog] = useState(false);
	const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

	// 获取同步历史
	const { data: syncHistoryData, isLoading: historyLoading, refetch: refetchHistory } = useQuery({
		queryKey: ["sync", "batches"],
		queryFn: () => deviceService.getSyncBatches({ page: 1, pageSize: 10 }),
		enabled: showHistoryDialog,
	});

	// 获取批次详情
	const { data: batchDetailData, isLoading: detailLoading } = useQuery({
		queryKey: ["sync", "batch", selectedBatchId],
		queryFn: () => deviceService.getSyncBatchDetail(selectedBatchId!),
		enabled: !!selectedBatchId,
	});

	const clearMutation = useMutation({
		mutationFn: () => deviceService.clearAllUsers(),
		onSuccess: (res: any) => {
			// 刷新义工列表，清除同步标志
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			toast.success(res?.message || "清空设备用户成功，已清除所有同步标志");
			setShowClearDialog(false);
			refetchStatus();
		},
		onError: (error: any) => {
			toast.error(error.message || "清空设备用户失败");
		},
	});

	if (authLoading) {
		return (
			 
				<div className="space-y-6">
					<div className="flex justify-between items-center">
						<div className="h-10 bg-muted rounded-md w-1/3 animate-pulse" />
						<div className="h-10 bg-muted rounded-md w-24 animate-pulse" />
					</div>
					<div className="h-96 bg-muted rounded-lg animate-pulse" />
				</div>
			
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	const devices = (statusData as any)?.data?.devices || [];
	const onlineDevices = devices.filter((d: any) => d.online);

	const lastSyncResult = (syncAllMutation.data as any)?.data || null;

	return (
		 
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold">设备与同步</h1>
						<p className="text-muted-foreground mt-1">管理考勤设备状态与义工同步</p>
					</div>
					<Button
						variant="outline"
						onClick={() => refetchStatus()}
						disabled={statusLoading}
					>
						{statusLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						刷新状态
					</Button>
				</div>

				{/* 设备状态 */}
				<div className="grid gap-4 md:grid-cols-3">
					<Card className="p-4 flex items-center justify-between">
						<div>
							<div className="text-sm text-muted-foreground">在线设备数</div>
							<div className="text-2xl font-bold mt-1">{onlineDevices.length}</div>
						</div>
						<CheckCircle2 className="h-8 w-8 text-green-500" />
					</Card>
					<Card className="p-4 flex flex-col justify-between">
						<div>
							<div className="text-sm text-muted-foreground">考勤设备状态</div>
							<div className="mt-2 text-sm">
								{devices.length === 0 ? (
									<span className="flex items-center gap-2 text-muted-foreground">
										<ServerCrash className="h-4 w-4" />
										<span>暂无设备连接</span>
									</span>
								) : (
									<div className="space-y-1">
										{devices.map((d: any) => (
											<div key={d.deviceSn} className="flex items-center justify-between">
												<span className="font-mono text-xs">{d.deviceSn}</span>
												<Badge variant={d.online ? "default" : "outline"}>
													{d.online ? "在线" : "离线"}
												</Badge>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</Card>
					<Card className="p-4 flex flex-col justify-between">
						<div className="space-y-3">
							<p className="text-sm font-medium">批量同步义工</p>
							
							{/* 同步策略选择 */}
							<div className="space-y-2">
								<label className="text-xs text-muted-foreground">同步策略</label>
								<Select value={syncStrategy} onValueChange={(v: any) => setSyncStrategy(v)}>
									<SelectTrigger className="h-8 text-xs">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">全量同步（所有激活义工）</SelectItem>
										<SelectItem value="unsynced">增量同步（仅未同步的）</SelectItem>
										<SelectItem value="changed">更新同步（最近修改的）</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* 照片预检查 */}
							<div className="flex items-center space-x-2">
								<Checkbox 
									id="validate-photos" 
									checked={validatePhotos}
									onCheckedChange={(checked) => setValidatePhotos(checked as boolean)}
								/>
								<label
									htmlFor="validate-photos"
									className="text-xs text-muted-foreground cursor-pointer"
								>
									同步前检查照片（会显著变慢，不推荐）
								</label>
							</div>

							{syncProgress && syncProgress.status !== 'idle' && (
								<div className="space-y-2 pt-2">
									<div className="flex justify-between text-xs">
										<span className="text-muted-foreground">
											{syncProgress.status === "syncing" ? "等待考勤机反馈..." : "同步完成"}
										</span>
										<span className="font-medium">
											{syncProgress.confirmed + syncProgress.failed} / {syncProgress.sent}
										</span>
									</div>
									<Progress 
										value={syncProgress.sent > 0 ? ((syncProgress.confirmed + syncProgress.failed) / syncProgress.sent) * 100 : 0} 
										className="h-2"
									/>
									<div className="flex gap-3 text-[10px] text-muted-foreground">
										<span>已发送: {syncProgress.sent}</span>
										<span className="text-green-600">已确认: {syncProgress.confirmed}</span>
										<span className="text-red-600">已失败: {syncProgress.failed}</span>
										<span className="text-amber-600">已跳过: {syncProgress.skipped}</span>
									</div>
									{/* 预估完成时间 */}
									{syncProgress.status === "syncing" && syncProgress.estimatedTimeRemaining != null && syncProgress.estimatedTimeRemaining > 0 && (
										<div className="text-[10px] text-blue-600 bg-blue-50 rounded px-2 py-1">
											⏱️ 预估剩余时间: {formatTime(syncProgress.estimatedTimeRemaining)}
											{syncProgress.averageTimePerUser && (
												<span className="ml-2 text-muted-foreground">
													(平均 {syncProgress.averageTimePerUser.toFixed(1)}秒/人)
												</span>
											)}
										</div>
									)}
								</div>
							)}
						</div>
						<div className="space-y-2">
							{syncProgress?.status === 'syncing' ? (
								<>
									<Button
										variant="outline"
										className="w-full"
										onClick={() => {
											// 取消同步
											setSyncProgress(prev => prev ? {
												...prev,
												status: 'idle',
												logs: [...(prev.logs || []), {
													time: new Date().toLocaleTimeString('zh-CN'),
													type: 'warning' as const,
													message: '⚠️ 用户手动取消同步'
												}]
											} : null);
											sessionStorage.removeItem('syncProgress');
											pollFailCountRef.current = 0;
											toast.info('已取消同步');
										}}
									>
										<RefreshCw className="h-4 w-4 mr-2" />
										取消同步
									</Button>
									<p className="text-xs text-muted-foreground text-center">
										💡 同步在后台进行，可以切换到其他页面
									</p>
								</>
							) : (
								<Button
									className="w-full"
									onClick={() => syncAllMutation.mutate()}
									disabled={
										syncAllMutation.isPending || 
										retryFailedMutation.isPending
									}
								>
									{syncAllMutation.isPending && (
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									)}
									<UploadCloud className="h-4 w-4 mr-2" />
									开始同步
								</Button>
							)}
						</div>
					</Card>
				</div>

				{/* 实时同步日志 */}
				{syncProgress && syncProgress.logs && syncProgress.logs.length > 0 && (
					<Card className="p-4 space-y-3">
						<div className="flex items-center justify-between">
							<p className="text-sm font-medium">
								同步日志
								{syncProgress.status === 'syncing' && (
									<Badge variant="outline" className="ml-2 text-xs">
										进行中
									</Badge>
								)}
								{syncProgress.status === 'completed' && (
									<Badge variant="outline" className="ml-2 text-xs text-green-600">
										已完成
									</Badge>
								)}
							</p>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setSyncProgress(null);
									sessionStorage.removeItem('syncProgress');
								}}
							>
								清空
							</Button>
						</div>
						<div className="max-h-60 overflow-y-auto bg-muted/30 rounded-md p-3 space-y-1 font-mono text-xs">
							{syncProgress.logs.map((log, i) => (
								<div 
									key={i} 
									className={
										log.type === 'success' ? 'text-green-600' : 
										log.type === 'error' ? 'text-red-600' : 
										log.type === 'warning' ? 'text-amber-600' : 
										'text-muted-foreground'
									}
								>
									[{log.time}] {log.message}
								</div>
							))}
							<div ref={logsEndRef} />
						</div>
						
						{/* 重试失败项按钮 */}
						{syncProgress.failedUsers && syncProgress.failedUsers.length > 0 && (
							<div className="space-y-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => retryFailedMutation.mutate(syncProgress.failedUsers)}
									disabled={retryFailedMutation.isPending || retryFailedWithBase64Mutation.isPending}
									className="w-full"
								>
									{retryFailedMutation.isPending && (
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									)}
									<RotateCcw className="h-4 w-4 mr-2" />
									重试 {syncProgress.failedUsers.length} 个失败项
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => retryFailedWithBase64Mutation.mutate(syncProgress.failedUsers)}
									disabled={retryFailedMutation.isPending || retryFailedWithBase64Mutation.isPending}
									className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
								>
									{retryFailedWithBase64Mutation.isPending && (
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									)}
									<UploadCloud className="h-4 w-4 mr-2" />
									转Base64重试 {syncProgress.failedUsers.length} 个失败项
								</Button>
								<p className="text-xs text-muted-foreground">
									💡 Base64模式会将图片压缩并转换为Base64格式后重新下发，适合照片格式问题导致的失败
								</p>
							</div>
						)}
					</Card>
				)}

				{/* 单个下发 */}
				<Card className="p-4 space-y-3">
					<p className="text-sm font-medium">下发单个义工</p>
					<div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
						<Input
							placeholder="输入莲花斋ID，例如 LHZ0001"
							value={lotusId}
							onChange={(e) => setLotusId(e.target.value)}
							className="md:max-w-xs"
						/>
						<Button
							variant="outline"
							onClick={() => lotusId && syncOneMutation.mutate(lotusId)}
							disabled={!lotusId || syncOneMutation.isPending}
						>
							{syncOneMutation.isPending && (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							)}
							同步该义工
						</Button>
					</div>
					<p className="text-xs text-muted-foreground">
						适合小范围修正，例如刚新增或修改了某个义工的信息。
					</p>
				</Card>

				{/* 最近一次批量同步结果 */}
				{lastSyncResult && (
					<Card className="p-4 space-y-3">
						<div className="flex items-center justify-between">
							<p className="text-sm font-medium">最近一次批量同步结果</p>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => syncAllMutation.reset()}
							>
								<RefreshCw className="h-4 w-4" />
							</Button>
						</div>
						<div className="grid gap-4 md:grid-cols-4 text-sm">
							<div>
								<p className="text-xs text-muted-foreground">参与同步</p>
								<p className="text-lg font-semibold">{lastSyncResult.total}</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">成功</p>
								<p className="text-lg font-semibold text-green-600">
									{lastSyncResult.successCount}
								</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">失败</p>
								<p className="text-lg font-semibold text-red-500">
									{lastSyncResult.failCount}
								</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">跳过</p>
								<p className="text-lg font-semibold text-muted-foreground">
									{lastSyncResult.skippedCount}
								</p>
							</div>
						</div>

						{Array.isArray(lastSyncResult.failedUsers) &&
							lastSyncResult.failedUsers.length > 0 && (
								<div className="space-y-1 text-xs">
									<p className="font-medium text-red-500">下发失败的义工：</p>
									<ul className="list-disc list-inside text-muted-foreground">
										{lastSyncResult.failedUsers.map((u: any, idx: number) => (
											<li key={`${u.lotusId}-${idx}`}>
												{u.name}（{u.lotusId || "无ID"}）
											</li>
										))}
									</ul>
									<p className="mt-1">
										可以使用上方“下发单个义工”功能逐个重试。
									</p>
								</div>
						)}

						{Array.isArray(lastSyncResult.skippedUsers) &&
							lastSyncResult.skippedUsers.length > 0 && (
								<div className="space-y-1 text-xs">
									<p className="font-medium text-muted-foreground">被跳过的义工：</p>
									<ul className="list-disc list-inside text-muted-foreground">
										{lastSyncResult.skippedUsers.map((u: any, idx: number) => (
											<li key={`${u.lotusId}-${idx}`}>
												{u.name}（{u.lotusId || "无ID"}） - 原因：
												{u.reason === "no_avatar" ? "无头像" : u.reason}
											</li>
										))}
									</ul>
									<p className="mt-1">
										补全头像后可再次执行“同步所有义工”。
									</p>
								</div>
						)}
					</Card>
				)}

				{/* 同步历史 */}
				<Card className="p-4 space-y-3">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium">同步历史</p>
							<p className="text-xs text-muted-foreground">查看历史同步记录和失败详情</p>
						</div>
						<Button
							variant="outline"
							onClick={() => {
								setShowHistoryDialog(true);
								refetchHistory();
							}}
						>
							<History className="h-4 w-4 mr-2" />
							查看历史
						</Button>
					</div>
				</Card>

				{/* 危险操作：清空设备 */}
				<Card className="p-4 space-y-3 border-destructive/30">
					<p className="text-sm font-medium text-destructive">危险操作</p>
					<p className="text-xs text-muted-foreground">
						清空设备上的所有用户数据，请谨慎使用。一般只在设备更换或严重数据不一致时使用。
					</p>
					<Button
						variant="outline"
						className="border-destructive text-destructive hover:bg-destructive/10"
						onClick={() => setShowClearDialog(true)}
						disabled={clearMutation.isPending}
					>
						{clearMutation.isPending && (
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						)}
						清空设备用户
					</Button>
				</Card>

				{/* 清空设备确认对话框 */}
				<AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle className="flex items-center gap-2 text-destructive">
								<AlertTriangle className="h-5 w-5" />
								确认清空设备用户？
							</AlertDialogTitle>
							<AlertDialogDescription asChild>
								<div className="text-sm text-muted-foreground space-y-2">
									<p>此操作将：</p>
									<ul className="list-disc list-inside space-y-1 text-sm">
										<li>清空考勤机设备上的所有用户数据</li>
										<li>清除数据库中所有义工的同步标记</li>
										<li>需要重新同步才能恢复考勤功能</li>
									</ul>
									<p className="text-destructive font-medium mt-3">
										此操作不可恢复，请谨慎操作！
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

				{/* 同步历史对话框 */}
				<AlertDialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
					<AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
						<AlertDialogHeader>
							<AlertDialogTitle className="flex items-center gap-2">
								<History className="h-5 w-5" />
								同步历史记录
							</AlertDialogTitle>
						</AlertDialogHeader>
						
						<div className="flex-1 overflow-y-auto space-y-4">
							{historyLoading ? (
								<div className="flex items-center justify-center py-8">
									<Loader2 className="h-6 w-6 animate-spin" />
								</div>
							) : selectedBatchId ? (
								// 批次详情视图
								<div className="space-y-4">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setSelectedBatchId(null)}
									>
										← 返回列表
									</Button>
									
									{detailLoading ? (
										<div className="flex items-center justify-center py-8">
											<Loader2 className="h-6 w-6 animate-spin" />
										</div>
									) : batchDetailData?.data ? (
										<div className="space-y-4">
											<div className="grid grid-cols-4 gap-4 text-sm">
												<div className="bg-muted/50 rounded p-3">
													<div className="text-xs text-muted-foreground">总数</div>
													<div className="text-lg font-semibold">{batchDetailData.data.summary?.total || 0}</div>
												</div>
												<div className="bg-green-50 rounded p-3">
													<div className="text-xs text-green-600">成功</div>
													<div className="text-lg font-semibold text-green-600">{batchDetailData.data.summary?.success || 0}</div>
												</div>
												<div className="bg-red-50 rounded p-3">
													<div className="text-xs text-red-600">失败</div>
													<div className="text-lg font-semibold text-red-600">{batchDetailData.data.summary?.failed || 0}</div>
												</div>
												<div className="bg-amber-50 rounded p-3">
													<div className="text-xs text-amber-600">跳过</div>
													<div className="text-lg font-semibold text-amber-600">{batchDetailData.data.summary?.skipped || 0}</div>
												</div>
											</div>
											
											{/* 失败记录列表 */}
											{batchDetailData.data.logs?.filter((l: any) => l.status === 'failed').length > 0 && (
												<div className="space-y-2">
													<p className="text-sm font-medium text-red-600">失败记录</p>
													<div className="max-h-60 overflow-y-auto space-y-1 bg-red-50/50 rounded p-2">
														{batchDetailData.data.logs
															.filter((l: any) => l.status === 'failed')
															.map((log: any) => (
																<div key={log.id} className="text-xs p-2 bg-white rounded border border-red-100">
																	<div className="flex justify-between">
																		<span className="font-medium">{log.name} ({log.lotusId})</span>
																		<span className="text-muted-foreground">
																			{new Date(log.syncedAt).toLocaleString('zh-CN')}
																		</span>
																	</div>
																	<p className="text-red-600 mt-1">{log.errorMessage || '未知错误'}</p>
																	{log.photoUrl && (
																		<p className="text-muted-foreground truncate mt-1">
																			照片: {log.photoUrl}
																		</p>
																	)}
																</div>
															))}
													</div>
												</div>
											)}
										</div>
									) : (
										<p className="text-center text-muted-foreground py-4">无数据</p>
									)}
								</div>
							) : (
								// 批次列表视图
								<div className="space-y-2">
									{(syncHistoryData as any)?.data?.records?.length > 0 ? (
										(syncHistoryData as any).data.records.map((batch: any) => (
											<div
												key={batch.id}
												className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
												onClick={() => setSelectedBatchId(batch.id)}
											>
												<div className="space-y-1">
													<div className="flex items-center gap-2">
														<span className="font-mono text-xs text-muted-foreground">{batch.id}</span>
														<Badge variant={batch.status === 'completed' ? 'default' : 'outline'}>
															{batch.status === 'completed' ? '已完成' : batch.status === 'syncing' ? '进行中' : '已取消'}
														</Badge>
													</div>
													<div className="flex items-center gap-4 text-xs">
														<span className="flex items-center gap-1">
															<Clock className="h-3 w-3" />
															{new Date(batch.startedAt).toLocaleString('zh-CN')}
														</span>
														{batch.duration && (
															<span className="text-muted-foreground">
																耗时: {formatTime(batch.duration)}
															</span>
														)}
													</div>
												</div>
												<div className="flex items-center gap-4">
													<div className="text-right text-xs">
														<span className="text-green-600">{batch.successCount}成功</span>
														<span className="mx-1">/</span>
														<span className="text-red-600">{batch.failedCount}失败</span>
														<span className="mx-1">/</span>
														<span className="text-amber-600">{batch.skippedCount}跳过</span>
													</div>
													<ChevronRight className="h-4 w-4 text-muted-foreground" />
												</div>
											</div>
										))
									) : (
										<p className="text-center text-muted-foreground py-8">暂无同步记录</p>
									)}
								</div>
							)}
						</div>
						
						<AlertDialogFooter>
							<AlertDialogCancel onClick={() => {
								setSelectedBatchId(null);
							}}>
								关闭
							</AlertDialogCancel>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		
	);
}
