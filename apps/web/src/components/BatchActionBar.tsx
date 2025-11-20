import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { X, Trash2, CheckCircle, XCircle, Download } from "lucide-react";

interface BatchActionBarProps {
	selectedCount: number;
	totalCount: number;
	onClearSelection: () => void;
	onSelectAll?: () => void;
	actions?: {
		label: string;
		icon?: React.ReactNode;
		variant?: "default" | "destructive" | "outline" | "secondary";
		onClick: () => void;
		disabled?: boolean;
	}[];
}

export function BatchActionBar({
	selectedCount,
	totalCount,
	onClearSelection,
	onSelectAll,
	actions = [],
}: BatchActionBarProps) {
	if (selectedCount === 0) return null;

	const isAllSelected = selectedCount === totalCount;

	return (
		<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
			<div className="bg-primary text-primary-foreground rounded-lg shadow-lg border border-primary/20 px-4 py-3 flex items-center gap-4">
				{/* 选中信息 */}
				<div className="flex items-center gap-2">
					<Badge variant="secondary" className="text-sm font-medium">
						已选择 {selectedCount} 项
					</Badge>
					{!isAllSelected && onSelectAll && totalCount > selectedCount && (
						<Button
							variant="ghost"
							size="sm"
							className="h-7 text-xs text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
							onClick={onSelectAll}
						>
							选择全部 {totalCount} 项
						</Button>
					)}
				</div>

				{/* 分隔线 */}
				<div className="h-6 w-px bg-primary-foreground/20" />

				{/* 操作按钮 */}
				<div className="flex items-center gap-2">
					{actions.map((action, index) => (
						<Button
							key={index}
							variant={action.variant || "secondary"}
							size="sm"
							className="h-8"
							onClick={action.onClick}
							disabled={action.disabled}
						>
							{action.icon}
							{action.label}
						</Button>
					))}
				</div>

				{/* 取消选择 */}
				<Button
					variant="ghost"
					size="sm"
					className="h-8 w-8 p-0 text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
					onClick={onClearSelection}
				>
					<X className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
