import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CheckCircle2, Loader2, ServerCrash, AlertTriangle, Trash2 } from "lucide-react";
import { deviceService } from "@/services/device";
import { toast } from "@/lib/toast";
import { useState } from "react";

export function DeviceTab() {
	const queryClient = useQueryClient();
	const [lotusId, setLotusId] = useState("");
	const [showClearDialog, setShowClearDialog] = useState(false);

	const { data: statusData, isLoading, refetch } = useQuery({
		queryKey: ["device", "status"],
		queryFn: () => deviceService.getStatus(),
		refetchInterval: 5000, // 每5秒刷新
	});

	const syncOneMutation = useMutation({
		mutationFn: (id: string) => deviceService.syncUser(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			toast.success("已发送同步命令");
			setLotusId("");
		},
		onError: (error: any) => {
			toast.error(error.message || "同步失败");
		},
	});

	const clearMutation = useMutation({
		mutationFn: () => deviceService.clearAllUsers(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			toast.success("清空设备用户成功");
			setShowClearDialog(false);
			refetch();
		},
		onError: (error: any) => {
			toast.error(error.message || "清空失败");
		},
	});

	const devices = (statusData as any)?.data?.devices || [];
	const onlineDevices = devices.filter((d: any) => d.online);

	return (
		<div className="space-y-6">
			{/* 设备状态 */}
			<div className="grid gap-4 md:grid-cols-2">
				<Card className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-sm text-muted-foreground">设备状态</div>
							<div className="text-2xl font-bold mt-1">
								{onlineDevices.length > 0 ? "在线" : "离线"}
							</div>
						</div>
						{onlineDevices.length > 0 ? (
							<CheckCircle2 className="h-12 w-12 text-green-500" />
						) : (
							<ServerCrash className="h-12 w-12 text-muted-foreground" />
						)}
					</div>
					{devices.length > 0 && (
						<div className="mt-4 pt-4 border-t">
							{devices.map((d: any) => (
								<div key={d.deviceSn} className="flex items-center justify-between">
									<span className="font-mono text-sm">{d.deviceSn}</span>
									<Badge variant={d.online ? "default" : "outline"}>
										{d.online ? "在线" : "离线"}
									</Badge>
								</div>
							))}
						</div>
					)}
				</Card>

				<Card className="p-6">
					<div className="text-sm text-muted-foreground mb-2">快速操作</div>
					<div className="space-y-2">
						<Button
							variant="outline"
							className="w-full justify-start"
							onClick={() => refetch()}
							disabled={isLoading}
						>
							{isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							刷新设备状态
						</Button>
						<Button
							variant="outline"
							className="w-full justify-start text-destructive hover:text-destructive"
							onClick={() => setShowClearDialog(true)}
						>
							<Trash2 className="h-4 w-4 mr-2" />
							清空设备用户
						</Button>
					</div>
				</Card>
			</div>

			{/* 单个下发 */}
			<Card className="p-6">
				<h3 className="text-lg font-semibold mb-4">下发单个义工</h3>
				<div className="flex gap-2">
					<Input
						placeholder="输入莲花斋ID，例如 LHZ0001"
						value={lotusId}
						onChange={(e) => setLotusId(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && lotusId) {
								syncOneMutation.mutate(lotusId);
							}
						}}
					/>
					<Button
						onClick={() => lotusId && syncOneMutation.mutate(lotusId)}
						disabled={!lotusId || syncOneMutation.isPending}
					>
						{syncOneMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						同步
					</Button>
				</div>
				<p className="text-xs text-muted-foreground mt-2">
					适合小范围修正，例如刚新增或修改了某个义工的信息
				</p>
			</Card>

			{/* 清空确认对话框 */}
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
		</div>
	);
}
