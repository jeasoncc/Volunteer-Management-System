import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, UploadCloud, RotateCcw, RefreshCw } from "lucide-react";
import { deviceService } from "@/services/device";
import { toast } from "@/lib/toast";

interface SyncTabProps {
	syncProgress: any;
	setSyncProgress: (progress: any) => void;
	pollFailCountRef: React.MutableRefObject<number>;
}

export function SyncTab({ syncProgress, setSyncProgress, pollFailCountRef }: SyncTabProps) {
	const queryClient = useQueryClient();
	const [syncStrategy, setSyncStrategy] = useState<'all' | 'unsynced' | 'changed'>('all');
	const [photoFormat, setPhotoFormat] = useState<'url' | 'base64'>('url');
	const [validatePhotos, setValidatePhotos] = useState(false);

	const syncAllMutation = useMutation({
		mutationFn: () => deviceService.syncAllUsers({ 
			strategy: syncStrategy, 
			validatePhotos,
			photoFormat: photoFormat as 'url' | 'base64'
		}),
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
					message: '正在启动同步...'
				}],
				failedUsers: [],
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["device", "status"] });
		},
		onError: (error: any) => {
			setSyncProgress(null);
			sessionStorage.removeItem('syncProgress');
			pollFailCountRef.current = 0;
			toast.error(error.message || "批量同步失败");
		},
	});

	const retryFailedMutation = useMutation({
		mutationFn: (failedUsers: Array<{ lotusId: string; name: string }>) => 
			deviceService.retryFailedUsers(failedUsers),
		onSuccess: () => {
			toast.success("重试完成");
		},
	});

	const retryFailedWithBase64Mutation = useMutation({
		mutationFn: (failedUsers: Array<{ lotusId: string; name: string }>) => 
			deviceService.retryFailedUsersWithBase64(failedUsers),
		onSuccess: () => {
			toast.success("Base64重试完成");
		},
	});

	const formatTime = (seconds: number): string => {
		if (seconds < 60) return `${Math.round(seconds)}秒`;
		const minutes = Math.floor(seconds / 60);
		const secs = Math.round(seconds % 60);
		return `${minutes}分${secs}秒`;
	};

	return (
		<div className="space-y-6">
			{/* 同步配置 */}
			<Card className="p-6">
				<h3 className="text-lg font-semibold mb-4">同步配置</h3>
				<div className="grid gap-4 md:grid-cols-3">
					<div className="space-y-2">
						<label className="text-sm font-medium">同步策略</label>
						<Select value={syncStrategy} onValueChange={(v: any) => setSyncStrategy(v)}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">全量同步</SelectItem>
								<SelectItem value="unsynced">增量同步</SelectItem>
								<SelectItem value="changed">更新同步</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">照片格式</label>
						<Select value={photoFormat} onValueChange={(v: any) => setPhotoFormat(v)}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="url">HTTP地址</SelectItem>
								<SelectItem value="base64">Base64编码</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">其他选项</label>
						<div className="flex items-center space-x-2 h-10">
							<Checkbox 
								id="validate-photos" 
								checked={validatePhotos}
								onCheckedChange={(checked) => setValidatePhotos(checked as boolean)}
							/>
							<label htmlFor="validate-photos" className="text-sm cursor-pointer">
								预检查照片
							</label>
						</div>
					</div>
				</div>

				<div className="mt-4 flex gap-2">
					{syncProgress?.status === 'syncing' ? (
						<Button
							variant="outline"
							onClick={() => {
								setSyncProgress(prev => prev ? { ...prev, status: 'idle' } : null);
								sessionStorage.removeItem('syncProgress');
								pollFailCountRef.current = 0;
								toast.info('已取消同步');
							}}
						>
							<RefreshCw className="h-4 w-4 mr-2" />
							取消同步
						</Button>
					) : (
						<Button
							onClick={() => syncAllMutation.mutate()}
							disabled={syncAllMutation.isPending}
						>
							{syncAllMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							<UploadCloud className="h-4 w-4 mr-2" />
							开始同步
						</Button>
					)}
				</div>
			</Card>

			{/* 同步进度 */}
			{syncProgress && syncProgress.status !== 'idle' && (
				<Card className="p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold">同步进度</h3>
						<Badge variant={syncProgress.status === 'syncing' ? 'default' : 'outline'}>
							{syncProgress.status === 'syncing' ? '进行中' : '已完成'}
						</Badge>
					</div>

					<div className="space-y-4">
						<div>
							<div className="flex justify-between text-sm mb-2">
								<span>已确认 {syncProgress.confirmed + syncProgress.failed} / {syncProgress.sent}</span>
								<span className="font-medium">
									{syncProgress.sent > 0 
										? Math.round(((syncProgress.confirmed + syncProgress.failed) / syncProgress.sent) * 100)
										: 0}%
								</span>
							</div>
							<Progress 
								value={syncProgress.sent > 0 ? ((syncProgress.confirmed + syncProgress.failed) / syncProgress.sent) * 100 : 0} 
							/>
						</div>

						<div className="grid grid-cols-4 gap-4 text-sm">
							<div>
								<div className="text-muted-foreground">已发送</div>
								<div className="text-2xl font-bold">{syncProgress.sent}</div>
							</div>
							<div>
								<div className="text-muted-foreground">成功</div>
								<div className="text-2xl font-bold text-green-600">{syncProgress.confirmed}</div>
							</div>
							<div>
								<div className="text-muted-foreground">失败</div>
								<div className="text-2xl font-bold text-red-600">{syncProgress.failed}</div>
							</div>
							<div>
								<div className="text-muted-foreground">跳过</div>
								<div className="text-2xl font-bold text-amber-600">{syncProgress.skipped}</div>
							</div>
						</div>

						{syncProgress.status === 'syncing' && syncProgress.estimatedTimeRemaining != null && syncProgress.estimatedTimeRemaining > 0 && (
							<div className="text-sm text-blue-600 bg-blue-50 rounded p-3">
								⏱️ 预估剩余时间: {formatTime(syncProgress.estimatedTimeRemaining)}
							</div>
						)}

						{/* 重试按钮 */}
						{syncProgress.failedUsers && syncProgress.failedUsers.length > 0 && (
							<div className="space-y-2 pt-4 border-t">
								<Button
									variant="outline"
									size="sm"
									onClick={() => retryFailedMutation.mutate(syncProgress.failedUsers)}
									disabled={retryFailedMutation.isPending || retryFailedWithBase64Mutation.isPending}
									className="w-full"
								>
									{retryFailedMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
									{retryFailedWithBase64Mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
									<UploadCloud className="h-4 w-4 mr-2" />
									转Base64重试
								</Button>
							</div>
						)}
					</div>
				</Card>
			)}

			{/* 同步日志 */}
			{syncProgress && syncProgress.logs && syncProgress.logs.length > 0 && (
				<Card className="p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold">同步日志</h3>
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
						{syncProgress.logs.map((log: any, i: number) => (
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
					</div>
				</Card>
			)}
		</div>
	);
}
