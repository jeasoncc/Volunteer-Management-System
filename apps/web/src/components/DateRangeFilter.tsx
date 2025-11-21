import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "lucide-react";

interface DateRangeFilterProps {
	onApply: (startDate: string | null, endDate: string | null) => void;
	label?: string;
}

export function DateRangeFilter({
	onApply,
	label = "创建时间",
}: DateRangeFilterProps) {
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [isOpen, setIsOpen] = useState(false);

	const handleApply = () => {
		onApply(startDate || null, endDate || null);
		setIsOpen(false);
	};

	const handleClear = () => {
		setStartDate("");
		setEndDate("");
		onApply(null, null);
		setIsOpen(false);
	};

	const hasFilter = startDate || endDate;

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant={hasFilter ? "default" : "outline"}
					size="sm"
					className="h-8"
				>
					<Calendar className="h-3.5 w-3.5 mr-1.5" />
					{label}
					{hasFilter && (
						<span className="ml-1.5 text-xs">
							({startDate || "开始"} ~ {endDate || "结束"})
						</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-80">
				<div className="space-y-4">
					<div>
						<Label className="text-sm font-medium mb-2 block">
							{label}范围
						</Label>
						<div className="grid grid-cols-2 gap-2">
							<div>
								<Label className="text-xs text-muted-foreground mb-1 block">
									开始日期
								</Label>
								<Input
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
									className="h-9"
								/>
							</div>
							<div>
								<Label className="text-xs text-muted-foreground mb-1 block">
									结束日期
								</Label>
								<Input
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
									className="h-9"
								/>
							</div>
						</div>
					</div>

					<div className="flex justify-between gap-2 pt-2 border-t">
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
