import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuCheckboxItem,
} from "./ui/dropdown-menu";
import { Filter, X } from "lucide-react";

export interface FilterOption {
	id: string;
	label: string;
	options: { value: string; label: string }[];
}

export interface ActiveFilter {
	id: string;
	label: string;
	values: string[];
	valueLabels: string[];
}

interface AdvancedFilterProps {
	filters: FilterOption[];
	activeFilters: ActiveFilter[];
	onFilterChange: (filterId: string, values: string[]) => void;
	onClearAll: () => void;
}

export function AdvancedFilter({
	filters,
	activeFilters,
	onFilterChange,
	onClearAll,
}: AdvancedFilterProps) {
	const [openFilterId, setOpenFilterId] = useState<string | null>(null);

	const getActiveFilterValues = (filterId: string): string[] => {
		const filter = activeFilters.find((f) => f.id === filterId);
		return filter?.values || [];
	};

	const handleToggleValue = (filterId: string, value: string) => {
		const currentValues = getActiveFilterValues(filterId);
		const newValues = currentValues.includes(value)
			? currentValues.filter((v) => v !== value)
			: [...currentValues, value];
		onFilterChange(filterId, newValues);
	};

	const handleRemoveFilter = (filterId: string) => {
		onFilterChange(filterId, []);
	};

	const totalActiveFilters = activeFilters.reduce(
		(sum, f) => sum + f.values.length,
		0,
	);

	return (
		<div className="flex items-center gap-2 flex-wrap">
			{/* 筛选按钮 */}
			{filters.map((filter) => {
				const activeValues = getActiveFilterValues(filter.id);
				const isActive = activeValues.length > 0;

				return (
					<DropdownMenu
						key={filter.id}
						open={openFilterId === filter.id}
						onOpenChange={(open) =>
							setOpenFilterId(open ? filter.id : null)
						}
					>
						<DropdownMenuTrigger asChild>
							<Button
								variant={isActive ? "default" : "outline"}
								size="sm"
								className="h-8"
							>
								<Filter className="h-3.5 w-3.5 mr-1.5" />
								{filter.label}
								{isActive && (
									<Badge
										variant="secondary"
										className="ml-1.5 h-4 min-w-4 px-1 text-xs"
									>
										{activeValues.length}
									</Badge>
								)}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start" className="w-48">
							<DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
							<DropdownMenuSeparator />
							{filter.options.map((option) => (
								<DropdownMenuCheckboxItem
									key={option.value}
									checked={activeValues.includes(option.value)}
									onCheckedChange={() =>
										handleToggleValue(filter.id, option.value)
									}
								>
									{option.label}
								</DropdownMenuCheckboxItem>
							))}
							{activeValues.length > 0 && (
								<>
									<DropdownMenuSeparator />
									<Button
										variant="ghost"
										size="sm"
										className="w-full justify-start text-xs"
										onClick={() => handleRemoveFilter(filter.id)}
									>
										<X className="h-3 w-3 mr-1" />
										清除
									</Button>
								</>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				);
			})}

			{/* 清除所有筛选 */}
			{totalActiveFilters > 0 && (
				<Button
					variant="ghost"
					size="sm"
					className="h-8 text-muted-foreground"
					onClick={onClearAll}
				>
					<X className="h-3.5 w-3.5 mr-1" />
					清除所有 ({totalActiveFilters})
				</Button>
			)}
		</div>
	);
}
