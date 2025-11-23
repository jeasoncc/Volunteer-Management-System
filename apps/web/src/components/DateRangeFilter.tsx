import { useState } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface DateRangeFilterProps {
	onApply: (startDate: string | null, endDate: string | null) => void;
	label?: string;
}

export function DateRangeFilter({
	onApply,
	label = "创建时间",
}: DateRangeFilterProps) {
	const [date, setDate] = useState<{ from?: Date; to?: Date } | undefined>();
	const [isOpen, setIsOpen] = useState(false);

	const handleApply = () => {
		if (date?.from) {
			const start = format(date.from, "yyyy-MM-dd");
			onApply(start, date.to ? format(date.to, "yyyy-MM-dd") : null);
		} else {
			onApply(null, null);
		}
		setIsOpen(false);
	};

	const handleClear = () => {
		setDate(undefined);
		onApply(null, null);
		setIsOpen(false);
	};

	const hasFilter = date?.from;

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant={hasFilter ? "default" : "outline"}
					size="sm"
					className="h-8"
				>
					<CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
					{label}
					{date?.from && (
						<span className="ml-1.5 text-xs">
							({format(date.from, "MM-dd")}
							{date.to ? ` ~ ${format(date.to, "MM-dd")}` : ""})
						</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-auto p-0">
				<div className="p-0">
					<Calendar
						initialFocus
						mode="range"
						defaultMonth={date?.from}
						selected={date}
						onSelect={setDate}
						numberOfMonths={1}
					/>
					<div className="flex justify-between gap-2 p-3 border-t bg-muted/50">
						<Button variant="ghost" size="sm" onClick={handleClear}>
							清除
						</Button>
						<Button size="sm" onClick={handleApply}>
							应用
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
