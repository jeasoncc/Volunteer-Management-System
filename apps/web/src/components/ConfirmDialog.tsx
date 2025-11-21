import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "./ui/alert-dialog";
import { AlertTriangle, Info, CheckCircle } from "lucide-react";

interface ConfirmDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "default" | "destructive" | "warning";
	isLoading?: boolean;
	items?: string[];
}

export function ConfirmDialog({
	open,
	onClose,
	onConfirm,
	title,
	description,
	confirmLabel = "确认",
	cancelLabel = "取消",
	variant = "default",
	isLoading = false,
	items = [],
}: ConfirmDialogProps) {
	const icons = {
		default: <Info className="h-6 w-6 text-blue-600" />,
		destructive: <AlertTriangle className="h-6 w-6 text-red-600" />,
		warning: <AlertTriangle className="h-6 w-6 text-orange-600" />,
	};

	return (
		<AlertDialog open={open} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<div className="flex items-start gap-4">
						<div className="flex-shrink-0 mt-1">{icons[variant]}</div>
						<div className="flex-1">
							<AlertDialogTitle>{title}</AlertDialogTitle>
							<AlertDialogDescription className="mt-2">
								{description}
							</AlertDialogDescription>
						</div>
					</div>
				</AlertDialogHeader>

				{items.length > 0 && (
					<div className="mt-4 p-3 bg-muted rounded-lg">
						<p className="text-xs font-medium mb-2">
							将影响以下 {items.length} 项：
						</p>
						<div className="max-h-32 overflow-y-auto space-y-1">
							{items.slice(0, 10).map((item, index) => (
								<div
									key={index}
									className="text-xs text-muted-foreground flex items-center gap-2"
								>
									<CheckCircle className="h-3 w-3" />
									{item}
								</div>
							))}
							{items.length > 10 && (
								<p className="text-xs text-muted-foreground italic">
									...还有 {items.length - 10} 项
								</p>
							)}
						</div>
					</div>
				)}

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading}>
						{cancelLabel}
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e: React.MouseEvent) => {
							e.preventDefault();
							onConfirm();
						}}
						disabled={isLoading}
						className={
							variant === "destructive"
								? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
								: ""
						}
					>
						{isLoading ? "处理中..." : confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
