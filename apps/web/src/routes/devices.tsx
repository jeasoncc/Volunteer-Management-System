import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { deviceService } from "@/services/device";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/lib/toast";
import { CheckCircle2, Loader2, RefreshCw, ServerCrash, UploadCloud } from "lucide-react";

export const Route = createFileRoute("/devices")({
	component: DevicesPage,
} as any);

function DevicesPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const [lotusId, setLotusId] = useState("");

	const {
		data: statusData,
		isLoading: statusLoading,
		refetch: refetchStatus,
	} = useQuery({
		queryKey: ["device", "status"],
		queryFn: () => deviceService.getStatus(),
		enabled: isAuthenticated,
	});

	const syncAllMutation = useMutation({
		mutationFn: () => deviceService.syncAllUsers(),
		onSuccess: (res: any) => {
			toast.success(res?.message || "批量同步完成");
			refetchStatus();
		},
		onError: (error: any) => {
			toast.error(error.message || "批量同步失败");
		},
	});

	const syncOneMutation = useMutation({
		mutationFn: (id: string) => deviceService.syncUser(id),
		onSuccess: (res: any) => {
			toast.success(res?.message || "单个同步成功");
		},
		onError: (error: any) => {
			toast.error(error.message || "单个同步失败");
		},
	});

	const clearMutation = useMutation({
		mutationFn: () => deviceService.clearAllUsers(),
		onSuccess: (res: any) => {
			toast.success(res?.message || "清空设备用户成功");
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
							<p className="text-sm text-muted-foreground">在线设备数</p>
							<p className="text-2xl font-bold mt-1">{onlineDevices.length}</p>
						</div>
						<CheckCircle2 className="h-8 w-8 text-green-500" />
					</Card>
					<Card className="p-4 flex flex-col justify-between">
						<div>
							<p className="text-sm text-muted-foreground">考勤设备状态</p>
							<p className="mt-2 text-sm">
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
							</p>
						</div>
					</Card>
					<Card className="p-4 flex flex-col justify-between">
						<div className="space-y-2">
							<p className="text-sm font-medium">批量同步义工</p>
							<p className="text-xs text-muted-foreground">
								只会同步状态为 Active 且有头像的义工。
							</p>
						</div>
						<Button
							className="mt-2"
							onClick={() => syncAllMutation.mutate()}
							disabled={syncAllMutation.isPending}
						>
							{syncAllMutation.isPending && (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							)}
							<UploadCloud className="h-4 w-4 mr-2" />
							同步所有义工
						</Button>
					</Card>
				</div>

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

				{/* 危险操作：清空设备 */}
				<Card className="p-4 space-y-3 border-destructive/30">
					<p className="text-sm font-medium text-destructive">危险操作</p>
					<p className="text-xs text-muted-foreground">
						清空设备上的所有用户数据，请谨慎使用。一般只在设备更换或严重数据不一致时使用。
					</p>
					<Button
						variant="outline"
						className="border-destructive text-destructive hover:bg-destructive/10"
						onClick={() => {
							if (
								window.confirm(
									"确定要清空设备上的所有用户吗？此操作不可恢复！",
								)
							) {
								clearMutation.mutate();
							}
						}}
						disabled={clearMutation.isPending}
					>
						{clearMutation.isPending && (
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						)}
						清空设备用户
					</Button>
				</Card>
			</div>
		
	);
}
