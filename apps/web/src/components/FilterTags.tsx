import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import type { ActiveFilter } from "./AdvancedFilter";

interface FilterTagsProps {
	activeFilters: ActiveFilter[];
	onRemoveFilter: (filterId: string) => void;
	onClearAll: () => void;
}

export function FilterTags({
	activeFilters,
	onRemoveFilter,
	onClearAll,
}: FilterTagsProps) {
	if (activeFilters.length === 0) return null;

	return (
		<div className="flex items-center gap-2 flex-wrap py-2">
			<span className="text-sm text-muted-foreground">已应用筛选：</span>
			{activeFilters.map((filter) =>
				filter.valueLabels.map((label, index) => (
					<Badge
						key={`${filter.id}-${filter.values[index]}`}
						variant="secondary"
						className="gap-1 pr-1 hover:bg-secondary/80 transition-colors"
					>
						<span className="text-xs">
							{filter.label}: {label}
						</span>
						<Button
							variant="ghost"
							size="sm"
							className="h-4 w-4 p-0 hover:bg-transparent"
							onClick={() => onRemoveFilter(filter.id)}
						>
							<X className="h-3 w-3" />
						</Button>
					</Badge>
				)),
			)}
			<Button
				variant="ghost"
				size="sm"
				className="h-6 text-xs text-muted-foreground hover:text-foreground"
				onClick={onClearAll}
			>
				清除所有
			</Button>
		</div>
	);
}
