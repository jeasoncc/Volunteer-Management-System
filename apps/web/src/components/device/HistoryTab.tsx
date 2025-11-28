import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, History, ChevronRight, Clock } from "lucide-react";
import { deviceService } from "@/services/device";

export function HistoryTab() {
	const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

	const { data: batchesData, isLoading: batchesLoading, refetch } = useQuery({
		queryKey: ["sync", "batches"],
		queryFn: () => deviceService.getSyncBatches({ page: 1, pageSize: 20 }),
	});

	const { data: detailData, isLoading: detailLoading } = useQuery({
		queryKey: ["sync", "batch", selectedBatchId],
		queryFn: () => deviceService.getSyncBatchDetail(selectedBatchId!),
		enabled: !!selectedBatchId,
	});

	const formatTime = (seconds: number): string => {
		if (seconds < 60) return `${Math.round(seconds)}秒`;
		const minutes = Math.floor(seconds / 60);
		const secs = Math.round(seconds % 60);
		return `${minutes}分${secs}秒`;
	};

	if (selectedBatchId && detailData) {
		const detail = (detailData as any).data;
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setSelectedBatchId(null)}
					>
						← 返回列表
					</Button>
				</div>

				<div className="grid grid-cols-4 gap-4">
					<Card className="p-4">
						<div className="text-sm text-muted-foreground">总数</div>
						<div className="text-2xl font-bold">{detail.summary?.total || 0}</div>
					</Card>
					<Card className="p-4 bg-green-50">
						<div className="text-sm text-green-600">成功</div>
						<div className="text-2xl font-bold text-green-600">{detail.summary?.success || 0}</div>
					</Card>
					<Card className="p-4 bg-red-50">
						<div className="text-sm text-red-600">失败</div>
						<div className="text-2xl font-bold text-red-600">{detail.summary?.failed || 0}</div>
					</Card>
					<Card className="p-4 bg-amber-50">
						<div className="text-sm text-amber-600">跳过</div>
						<div className="text-2xl font-bold text-amber-600">{detail.summary?.skipped || 0}</div>
					</Card>
				</div>

				{detail.logs?.filter((l: any) => l.status === 'failed').length > 0 && (
					<Card className="p-6">
						<h3 className="text-lg font-semibold mb-4 text-red-600">失败记录</h3>
						<div className="space-y-2 max-h-96 overflow-y-auto">
							{detail.logs
								.filter((l: any) => l.status === 'failed')
								.map((log: any) => (
									<div key={log.id} className="p-3 bg-red-50 rounded border border-red-100">
										<div className="flex justify-between items-start">
											<div>
												<div className="font-medium">{log.name} ({log.lotusId})</div>
												<div className="text-sm text-red-600 mt-1">{log.errorMessage || '未知错误'}</div>
											</div>
											<div className="text-xs text-muted-foreground">
												{new Date(log.syncedAt).toLocaleString('zh-CN')}
											</div>
										</div>
									</div>
								))}
						</div>
					</Card>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">同步历史记录</h3>
				<Button variant="outline" size="sm" onClick={() => refetch()}>
					刷新
				</Button>
			</div>

			{batchesLoading ? (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			) : (batchesData as any)?.data?.records?.length > 0 ? (
				<div className="space-y-2">
					{(batchesData as any).data.records.map((batch: any) => (
						<Card
							key={batch.id}
							className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
							onClick={() => setSelectedBatchId(batch.id)}
						>
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<div className="flex items-center gap-2">
										<span className="font-mono text-xs text-muted-foreground">{batch.id}</span>
										<Badge variant={batch.status === 'completed' ? 'default' : 'outline'}>
											{batch.status === 'completed' ? '已完成' : batch.status === 'syncing' ? '进行中' : '已取消'}
										</Badge>
									</div>
									<div className="flex items-center gap-4 text-sm">
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
									<div className="text-right text-sm">
										<span className="text-green-600">{batch.successCount}成功</span>
										<span className="mx-1">/</span>
										<span className="text-red-600">{batch.failedCount}失败</span>
										<span className="mx-1">/</span>
										<span className="text-amber-600">{batch.skippedCount}跳过</span>
									</div>
									<ChevronRight className="h-4 w-4 text-muted-foreground" />
								</div>
							</div>
						</Card>
					))}
				</div>
			) : (
				<Card className="p-12">
					<div className="text-center text-muted-foreground">
						<History className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<p>暂无同步记录</p>
					</div>
				</Card>
			)}
		</div>
	);
}
