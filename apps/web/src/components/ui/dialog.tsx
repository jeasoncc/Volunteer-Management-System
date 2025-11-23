import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";

interface DialogProps {
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

export function Dialog({
	open,
	onClose,
	title,
	children,
	maxWidth = "md",
}: DialogProps) {
	// 锁定/解锁背景滚动
	useEffect(() => {
		if (open) {
			// 保存原始样式
			const originalStyle = document.body.style.overflow;
			// 锁定滚动
			document.body.style.overflow = "hidden";
			
			return () => {
				// 恢复原始样式
				document.body.style.overflow = originalStyle;
			};
		}
	}, [open]);

	if (!open) return null;

	const maxWidthClass = {
		sm: "max-w-sm",
		md: "max-w-md",
		lg: "max-w-lg",
		xl: "max-w-xl",
		"2xl": "max-w-2xl",
		"3xl": "max-w-3xl",
		"4xl": "max-w-4xl",
	}[maxWidth];

	return createPortal(
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
			{/* 背景遮罩 */}
			<div 
				className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
				onClick={onClose} 
			/>

			{/* 对话框容器 - Flex列布局 */}
			<div
				className={`relative bg-background rounded-lg shadow-xl w-full ${maxWidthClass} flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200`}
			>
				{/* 标题栏 - 固定顶部 */}
				<div className="flex items-center justify-between p-6 border-b shrink-0">
					<h2 className="text-xl font-semibold tracking-tight">{title}</h2>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="h-8 w-8 rounded-full hover:bg-muted"
					>
						<span className="sr-only">Close</span>
						✕
					</Button>
				</div>

				{/* 内容区域 - 可滚动 */}
				<div className="p-6 overflow-y-auto min-h-0">
					{children}
				</div>
			</div>
		</div>,
		document.body
	);
}

interface DialogContentProps {
	children: ReactNode;
}

export function DialogContent({ children }: DialogContentProps) {
	return <div>{children}</div>;
}

interface DialogHeaderProps {
	children: ReactNode;
}

export function DialogHeader({ children }: DialogHeaderProps) {
	return <div className="mb-4">{children}</div>;
}

interface DialogTitleProps {
	children: ReactNode;
}

export function DialogTitle({ children }: DialogTitleProps) {
	return <h3 className="text-lg font-semibold">{children}</h3>;
}

interface DialogDescriptionProps {
	children: ReactNode;
}

export function DialogDescription({ children }: DialogDescriptionProps) {
	return <p className="text-sm text-muted-foreground mt-1">{children}</p>;
}
