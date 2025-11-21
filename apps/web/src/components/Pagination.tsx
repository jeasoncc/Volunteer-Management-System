import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	pageSize: number;
	totalItems: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (pageSize: number) => void;
	pageSizeOptions?: number[];
}

export function Pagination({
	currentPage,
	totalPages,
	pageSize,
	totalItems,
	onPageChange,
	onPageSizeChange,
	pageSizeOptions = [10, 20, 50, 100],
}: PaginationProps) {
	const startItem = (currentPage - 1) * pageSize + 1;
	const endItem = Math.min(currentPage * pageSize, totalItems);

	const canGoPrevious = currentPage > 1;
	const canGoNext = currentPage < totalPages;

	// 生成页码数组
	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		const maxVisible = 7; // 最多显示7个页码

		if (totalPages <= maxVisible) {
			// 如果总页数小于等于最大可见数，显示所有页码
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// 总是显示第一页
			pages.push(1);

			if (currentPage > 3) {
				pages.push("...");
			}

			// 显示当前页附近的页码
			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (currentPage < totalPages - 2) {
				pages.push("...");
			}

			// 总是显示最后一页
			if (totalPages > 1) {
				pages.push(totalPages);
			}
		}

		return pages;
	};

	if (totalItems === 0) {
		return null;
	}

	return (
		<div className="flex items-center justify-between px-2 py-4">
			<div className="flex items-center gap-4">
				<div className="text-sm text-muted-foreground">
					显示 {startItem} - {endItem} 条，共 {totalItems} 条
				</div>
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">每页显示</span>
					<Select
						value={pageSize.toString()}
						onValueChange={(value) => onPageSizeChange(Number(value))}
					>
						<SelectTrigger className="w-[70px] h-8">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{pageSizeOptions.map((size) => (
								<SelectItem key={size} value={size.toString()}>
									{size}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<span className="text-sm text-muted-foreground">条</span>
				</div>
			</div>

			<div className="flex items-center gap-2">
				{/* 第一页 */}
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8"
					onClick={() => onPageChange(1)}
					disabled={!canGoPrevious}
				>
					<ChevronsLeft className="h-4 w-4" />
				</Button>

				{/* 上一页 */}
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={!canGoPrevious}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>

				{/* 页码 */}
				<div className="flex items-center gap-1">
					{getPageNumbers().map((page, index) => {
						if (page === "...") {
							return (
								<span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
									...
								</span>
							);
						}

						return (
							<Button
								key={page}
								variant={currentPage === page ? "default" : "outline"}
								size="icon"
								className="h-8 w-8"
								onClick={() => onPageChange(page as number)}
							>
								{page}
							</Button>
						);
					})}
				</div>

				{/* 下一页 */}
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={!canGoNext}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>

				{/* 最后一页 */}
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8"
					onClick={() => onPageChange(totalPages)}
					disabled={!canGoNext}
				>
					<ChevronsRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
