import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";
import dayjs from "dayjs";

interface DateSelectorProps {
	year: number;
	month: number;
	onYearChange: (year: number) => void;
	onMonthChange: (month: number) => void;
	quickFilter: string;
	onQuickFilterChange: (filter: string) => void;
}

export function DateSelector({
	year,
	month,
	onYearChange,
	onMonthChange,
	quickFilter,
	onQuickFilterChange,
}: DateSelectorProps) {
	const handleQuickFilter = (filter: string) => {
		onQuickFilterChange(filter);
		const today = dayjs();
		
		switch (filter) {
			case "current":
				onYearChange(today.year());
				onMonthChange(today.month() + 1);
				break;
			case "last":
				const lastMonth = today.subtract(1, "month");
				onYearChange(lastMonth.year());
				onMonthChange(lastMonth.month() + 1);
				break;
		}
	};

	return (
		<div className="flex flex-wrap items-center gap-3">
			<div className="flex items-center gap-2">
				<Button
					variant={quickFilter === "current" ? "default" : "outline"}
					size="sm"
					onClick={() => handleQuickFilter("current")}
				>
					本月
				</Button>
				<Button
					variant={quickFilter === "last" ? "default" : "outline"}
					size="sm"
					onClick={() => handleQuickFilter("last")}
				>
					上月
				</Button>
			</div>
			
			<div className="flex items-center gap-2">
				<Calendar className="h-4 w-4 text-muted-foreground" />
				<Input
					type="number"
					value={year}
					onChange={(e) => {
						onYearChange(Number(e.target.value));
						onQuickFilterChange("custom");
					}}
					className="w-24 h-9"
					placeholder="年份"
				/>
				<span className="text-sm text-muted-foreground">年</span>
				<Input
					type="number"
					min="1"
					max="12"
					value={month}
					onChange={(e) => {
						onMonthChange(Number(e.target.value));
						onQuickFilterChange("custom");
					}}
					className="w-20 h-9"
					placeholder="月份"
				/>
				<span className="text-sm text-muted-foreground">月</span>
			</div>
		</div>
	);
}
