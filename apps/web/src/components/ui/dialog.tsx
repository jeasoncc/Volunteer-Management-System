import type { ReactNode } from "react";
import { Button } from "./button";

interface DialogProps {
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Dialog({
	open,
	onClose,
	title,
	children,
	maxWidth = "md",
}: DialogProps) {
	if (!open) return null;

	const maxWidthClass = {
		sm: "max-w-sm",
		md: "max-w-md",
		lg: "max-w-lg",
		xl: "max-w-xl",
	}[maxWidth];

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* 背景遮罩 */}
			<div className="absolute inset-0 bg-black/50" onClick={onClose} />

			{/* 对话框内容 */}
			<div
				className={`relative bg-white rounded-lg shadow-xl w-full ${maxWidthClass} mx-4 max-h-[90vh] overflow-y-auto`}
			>
				{/* 标题栏 */}
				<div className="flex items-center justify-between p-6 border-b">
					<h2 className="text-xl font-semibold">{title}</h2>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700"
					>
						✕
					</Button>
				</div>

				{/* 内容 */}
				<div className="p-6">{children}</div>
			</div>
		</div>
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
	return <p className="text-sm text-gray-500 mt-1">{children}</p>;
}
