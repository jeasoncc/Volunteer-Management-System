import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import { CheckinRecordsTable } from "@/components/CheckinRecordsTable";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { checkinService } from "@/services/checkin";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/lib/toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { CheckInSummary } from "@/types";
import { Search, RefreshCw } from "lucide-react";

export function CheckinRecordsView() {
	const { isAuthenticated } = useAuth();
	const queryClient = useQueryClient();
	const [startDate, setStartDate] = useState(
		dayjs().startOf("month").format("YYYY-MM-DD"),
	);
	const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
	const [lotusId, setLotusId] = useState("");

	// Queries
	const { data: recordsData, isLoading: recordsLoading } = useQuery({
		queryKey: ["checkin", "records", startDate, endDate, lotusId],
		queryFn: () =>
			checkinService.getList({
				startDate,
				endDate,
				lotusId: lotusId || undefined,
				page: 1,
				pageSize: 100,
			}),
		enabled: isAuthenticated,
	});

	// Mutations
	const deleteMutation = useMutation({
		mutationFn: checkinService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["checkin", "records"] });
			toast.success("删除成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "删除失败");
		},
	});

	const batchDeleteMutation = useMutation({
		mutationFn: (ids: number[]) => checkinService.batchDelete(ids),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["checkin", "records"] });
			toast.success("批量删除成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "批量删除失败");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: Partial<CheckInSummary> }) =>
			checkinService.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["checkin", "records"] });
			setIsEditDialogOpen(false);
			setEditingRecord(null);
			toast.success("更新成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "更新失败");
		},
	});

	// State
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingRecord, setEditingRecord] = useState<CheckInSummary | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingRecord, setDeletingRecord] = useState<CheckInSummary | null>(null);
	const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
	const [batchDeletingRecords, setBatchDeletingRecords] = useState<CheckInSummary[]>([]);

	const records = (recordsData?.data || []) as any[];

	// Handlers
	const handleEdit = (record: CheckInSummary) => {
		setEditingRecord(record);
		setIsEditDialogOpen(true);
	};

	const handleDelete = (record: CheckInSummary) => {
		setDeletingRecord(record);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (deletingRecord) {
			deleteMutation.mutate(deletingRecord.id);
			setDeleteDialogOpen(false);
			setDeletingRecord(null);
		}
	};

	const handleBatchDelete = (records: CheckInSummary[]) => {
		setBatchDeletingRecords(records);
		setBatchDeleteDialogOpen(true);
	};

	const confirmBatchDelete = () => {
		if (batchDeletingRecords.length === 0) return;
		const ids = batchDeletingRecords.map((r) => r.id);
		batchDeleteMutation.mutate(ids);
		setBatchDeleteDialogOpen(false);
		setBatchDeletingRecords([]);
	};

	const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!editingRecord) return;

		const formData = new FormData(e.currentTarget);
		const workHours = Number(formData.get("workHours"));
		const notes = formData.get("notes") as string;

		updateMutation.mutate({
			id: editingRecord.id,
			data: {
				workHours,
				notes,
				isManual: true,
			},
		});
	};

	const handleRefresh = () => {
		queryClient.invalidateQueries({ queryKey: ["checkin", "records"] });
	};

	return (
		<div className="space-y-6">
			{/* 筛选区域：改为更加紧凑的工具栏样式 */}
			<div className="bg-card p-4 rounded-lg border shadow-sm space-y-4">
				<div className="flex flex-wrap items-end gap-4">
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground">开始日期</label>
						<Input
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							className="h-9"
						/>
					</div>
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground">结束日期</label>
						<Input
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							className="h-9"
						/>
					</div>
					<div className="space-y-1.5 flex-1 min-w-[200px]">
						<label className="text-xs font-medium text-muted-foreground">莲花斋ID (选填)</label>
						<div className="relative">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="搜索义工ID..."
								value={lotusId}
								onChange={(e) => setLotusId(e.target.value)}
								className="pl-9 h-9"
							/>
						</div>
					</div>
					<Button onClick={handleRefresh} size="sm" className="h-9">
						<RefreshCw className="h-4 w-4 mr-2" />
						刷新查询
					</Button>
				</div>
			</div>

			{/* 考勤记录表格 */}
			<Card>
				<CardHeader className="px-6 py-4 border-b">
					<CardTitle className="text-base">考勤记录明细</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<div className="p-6 pt-4">
						<CheckinRecordsTable
							data={records}
							isLoading={recordsLoading}
							onEdit={handleEdit}
							onDelete={handleDelete}
							onBatchDelete={handleBatchDelete}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Dialogs */}
			<Dialog
				open={isEditDialogOpen}
				onClose={() => {
					setIsEditDialogOpen(false);
					setEditingRecord(null);
				}}
				title="编辑考勤记录"
			>
				{editingRecord && (
					<form onSubmit={handleSaveEdit} className="space-y-4">
						<div>
							<label className="text-sm font-medium">姓名</label>
							<Input value={editingRecord.name} disabled className="bg-muted" />
						</div>
						<div>
							<label className="text-sm font-medium">日期</label>
							<Input value={editingRecord.date} disabled className="bg-muted" />
						</div>
						<div>
							<label className="text-sm font-medium">工时(小时)</label>
							<Input
								type="number"
								name="workHours"
								defaultValue={editingRecord.workHours}
								min="0"
								max="24"
								step="0.5"
								required
							/>
						</div>
						<div>
							<label className="text-sm font-medium">备注</label>
							<Input
								name="notes"
								defaultValue={editingRecord.notes || ""}
								placeholder="输入备注信息"
							/>
						</div>
						<div className="flex gap-2 justify-end pt-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setIsEditDialogOpen(false);
									setEditingRecord(null);
								}}
							>
								取消
							</Button>
							<Button type="submit" disabled={updateMutation.isPending}>
								{updateMutation.isPending ? "保存中..." : "保存"}
							</Button>
						</div>
					</form>
				)}
			</Dialog>

			<ConfirmDialog
				open={deleteDialogOpen}
				onClose={() => {
					setDeleteDialogOpen(false);
					setDeletingRecord(null);
				}}
				onConfirm={confirmDelete}
				title="删除考勤记录"
				description={
					deletingRecord
						? `确定要删除 ${deletingRecord.name} 在 ${deletingRecord.date} 的考勤记录吗？此操作不可恢复。`
						: ""
				}
				variant="destructive"
				isLoading={deleteMutation.isPending}
			/>

			<ConfirmDialog
				open={batchDeleteDialogOpen}
				onClose={() => {
					setBatchDeleteDialogOpen(false);
					setBatchDeletingRecords([]);
				}}
				onConfirm={confirmBatchDelete}
				title="批量删除考勤记录"
				description={
					batchDeletingRecords.length > 0
						? `确定要删除选中的 ${batchDeletingRecords.length} 条考勤记录吗？此操作不可恢复。`
						: ""
				}
				variant="destructive"
				isLoading={batchDeleteMutation.isPending}
			/>
		</div>
	);
}
