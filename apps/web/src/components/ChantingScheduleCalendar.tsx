import { useMemo } from "react";
import type { ChantingSchedule } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar as CalendarIcon, Clock, MapPin, Users } from "lucide-react";

interface ChantingScheduleCalendarProps {
	data: ChantingSchedule[];
	isLoading?: boolean;
	year: number;
	month: number;
	onMonthChange?: (year: number, month: number) => void;
}

export function ChantingScheduleCalendar(props: ChantingScheduleCalendarProps) {
	const { data, isLoading, year, month, onMonthChange } = props;

	// 按日期分组
	const groupedByDate = useMemo(() => {
		const map: Record<string, ChantingSchedule[]> = {};
		for (const item of data || []) {
			if (!item.date) continue;
			if (!map[item.date]) map[item.date] = [];
			map[item.date].push(item);
		}
		// 排序保证日期顺序
		return Object.entries(map).sort(([a], [b]) => (a > b ? 1 : -1));
	}, [data]);

	const handlePrevMonth = () => {
		const d = new Date(year, month - 2, 1);
		onMonthChange?.(d.getFullYear(), d.getMonth() + 1);
	};

	const handleNextMonth = () => {
		const d = new Date(year, month, 1);
		onMonthChange?.(d.getFullYear(), d.getMonth() + 1);
	};

	return (
		<Card className="p-4 md:p-6">
			<div className="flex items-center justify-between mb-4 gap-2">
				<div className="flex items-center gap-2">
					<CalendarIcon className="h-5 w-5 text-muted-foreground" />
					<h2 className="text-lg font-semibold">
						{year} 年 {month.toString().padStart(2, "0")} 月助念日历
					</h2>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						className="px-2 py-1 text-sm rounded border bg-background hover:bg-muted"
						onClick={handlePrevMonth}
					>
						上一月
					</button>
					<button
						type="button"
						className="px-2 py-1 text-sm rounded border bg-background hover:bg-muted"
						onClick={handleNextMonth}
					>
						下一月
					</button>
				</div>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center h-40 text-muted-foreground">
					正在加载日历数据...
				</div>
			) : groupedByDate.length === 0 ? (
				<div className="flex items-center justify-center h-40 text-muted-foreground">
					本月暂无助念排班
				</div>
			) : (
				<ScrollArea className="h-[560px] pr-4">
					<div className="space-y-4">
						{groupedByDate.map(([date, schedules]) => (
							<div key={date} className="space-y-2">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium">{date}</span>
									<Badge variant="outline">{schedules.length} 场</Badge>
								</div>
								<div className="grid gap-2 md:grid-cols-2">
									{schedules.map((item) => (
										<Card key={item.id} className="p-3 flex flex-col gap-1">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2 text-sm font-medium">
													<Clock className="h-4 w-4 text-muted-foreground" />
													<span>{item.timeSlot}</span>
												</div>
												<Badge variant="secondary">
													{item.status === "pending" && "待确认"}
													{item.status === "confirmed" && "已确认"}
													{item.status === "in_progress" && "进行中"}
													{item.status === "completed" && "已完成"}
													{item.status === "cancelled" && "已取消"}
												</Badge>
											</div>
											<div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
												<MapPin className="h-3 w-3" />
												<span>
													{item.location === "fuhuiyuan" ? "福慧园" : "外勤"}
												</span>
											</div>
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												<Users className="h-3 w-3" />
												<span>
													往生者：{item.deceasedName || "-"}；敲钟：
													{item.bellVolunteerName || "-"}；领诵：
													{item.teachingVolunteerName || "-"}；备用：
													{item.backupVolunteerName || "-"}
												</span>
											</div>
											{item.specialRequirements && (
													<div className="text-xs text-muted-foreground truncate">
														备注：{item.specialRequirements}
													</div>
											)}
										</Card>
									))}
								</div>
							</div>
						))}
					</div>
				</ScrollArea>
			)}
		</Card>
	);
}
