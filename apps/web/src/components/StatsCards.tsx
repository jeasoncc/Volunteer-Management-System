import { Card } from "./ui/card";
import { Users, UserPlus, Clock, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
	title: string;
	value: number;
	change?: number;
	changeLabel?: string;
	icon: React.ReactNode;
}

function StatCard({ title, value, change, changeLabel, icon }: StatCardProps) {
	const isPositive = change !== undefined && change > 0;
	const isNegative = change !== undefined && change < 0;

	return (
		<Card className="p-4 hover:shadow-md transition-shadow">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<p className="text-sm text-muted-foreground mb-1">{title}</p>
					<p className="text-2xl font-bold mb-2">{value}</p>
					{change !== undefined && (
						<div className="flex items-center gap-1 text-xs">
							{isPositive && (
								<>
									<TrendingUp className="h-3 w-3 text-green-600" />
									<span className="text-green-600 font-medium">
										+{Math.abs(change)}%
									</span>
								</>
							)}
							{isNegative && (
								<>
									<TrendingDown className="h-3 w-3 text-red-600" />
									<span className="text-red-600 font-medium">
										{change}%
									</span>
								</>
							)}
							{change === 0 && (
								<span className="text-muted-foreground">无变化</span>
							)}
							{changeLabel && (
								<span className="text-muted-foreground ml-1">
									{changeLabel}
								</span>
							)}
						</div>
					)}
				</div>
				<div className="rounded-full bg-primary/10 p-3">{icon}</div>
			</div>
		</Card>
	);
}

interface StatsCardsProps {
	totalVolunteers: number;
	newThisMonth: number;
	pendingApproval: number;
	activeVolunteers: number;
	monthlyChange?: number;
	newChange?: number;
	pendingChange?: number;
	activeChange?: number;
}

export function StatsCards({
	totalVolunteers,
	newThisMonth,
	pendingApproval,
	activeVolunteers,
	monthlyChange,
	newChange,
	pendingChange,
	activeChange,
}: StatsCardsProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<StatCard
				title="总义工数"
				value={totalVolunteers}
				change={monthlyChange}
				changeLabel="较上月"
				icon={<Users className="h-5 w-5 text-primary" />}
			/>
			<StatCard
				title="本月新增"
				value={newThisMonth}
				change={newChange}
				changeLabel="较上月"
				icon={<UserPlus className="h-5 w-5 text-blue-600" />}
			/>
			<StatCard
				title="待审批"
				value={pendingApproval}
				change={pendingChange}
				icon={<Clock className="h-5 w-5 text-orange-600" />}
			/>
			<StatCard
				title="活跃义工"
				value={activeVolunteers}
				change={activeChange}
				changeLabel="较上月"
				icon={<Users className="h-5 w-5 text-green-600" />}
			/>
		</div>
	);
}
