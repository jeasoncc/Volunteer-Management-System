import { Button } from "./ui/button";
import { FileX, Search, Plus } from "lucide-react";

interface EmptyStateProps {
	type: "no-data" | "no-results";
	onAction?: () => void;
	actionLabel?: string;
}

export function EmptyState({ type, onAction, actionLabel }: EmptyStateProps) {
	if (type === "no-data") {
		return (
			<div className="flex flex-col items-center justify-center py-16 px-4">
				<div className="rounded-full bg-muted p-6 mb-4">
					<FileX className="h-12 w-12 text-muted-foreground" />
				</div>
				<h3 className="text-lg font-semibold mb-2">还没有义工数据</h3>
				<p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
					点击右上角"添加义工"按钮开始添加，或者导入现有的义工数据
				</p>
				{onAction && (
					<Button onClick={onAction} size="lg">
						<Plus className="h-4 w-4 mr-2" />
						{actionLabel || "添加第一个义工"}
					</Button>
				)}
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center py-16 px-4">
			<div className="rounded-full bg-muted p-6 mb-4">
				<Search className="h-12 w-12 text-muted-foreground" />
			</div>
			<h3 className="text-lg font-semibold mb-2">没有找到符合条件的义工</h3>
			<p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
				尝试调整筛选条件或搜索关键词，或者清除所有筛选重新开始
			</p>
			{onAction && (
				<Button onClick={onAction} variant="outline">
					清除所有筛选
				</Button>
			)}
		</div>
	);
}
