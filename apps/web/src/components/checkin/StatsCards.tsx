import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, Calendar, TrendingUp } from "lucide-react";

interface StatsCardsProps {
	totalVolunteers: number;
	totalHours: string;
	totalDays: number;
	avgHours: string;
}

export function StatsCards({ totalVolunteers, totalHours, totalDays, avgHours }: StatsCardsProps) {
	const stats = [
		{
			label: "参与义工",
			value: totalVolunteers,
			unit: "人",
			icon: Users,
			color: "blue",
		},
		{
			label: "总服务时长",
			value: totalHours,
			unit: "小时",
			icon: Clock,
			color: "green",
		},
		{
			label: "总打卡次数",
			value: totalDays,
			unit: "次",
			icon: Calendar,
			color: "purple",
		},
		{
			label: "人均时长",
			value: avgHours,
			unit: "小时/人",
			icon: TrendingUp,
			color: "orange",
		},
	];

	const colorClasses = {
		blue: "border-l-blue-500 bg-blue-50 text-blue-600",
		green: "border-l-green-500 bg-green-50 text-green-600",
		purple: "border-l-purple-500 bg-purple-50 text-purple-600",
		orange: "border-l-orange-500 bg-orange-50 text-orange-600",
	};

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{stats.map((stat) => {
				const Icon = stat.icon;
				const bgClass = colorClasses[stat.color as keyof typeof colorClasses];
				
				return (
					<Card key={stat.label} className={`border-l-4 ${stat.color === 'blue' ? 'border-l-blue-500' : stat.color === 'green' ? 'border-l-green-500' : stat.color === 'purple' ? 'border-l-purple-500' : 'border-l-orange-500'}`}>
						<CardContent className="p-6 flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
								<p className={`text-3xl font-bold mt-2 ${stat.color === 'blue' ? 'text-blue-600' : stat.color === 'green' ? 'text-green-600' : stat.color === 'purple' ? 'text-purple-600' : 'text-orange-600'}`}>
									{stat.value}
								</p>
								<p className="text-xs text-muted-foreground mt-1">{stat.unit}</p>
							</div>
							<div className={`h-12 w-12 rounded-full flex items-center justify-center ${stat.color === 'blue' ? 'bg-blue-50' : stat.color === 'green' ? 'bg-green-50' : stat.color === 'purple' ? 'bg-purple-50' : 'bg-orange-50'}`}>
								<Icon className={`h-6 w-6 ${stat.color === 'blue' ? 'text-blue-600' : stat.color === 'green' ? 'text-green-600' : stat.color === 'purple' ? 'text-purple-600' : 'text-orange-600'}`} />
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
