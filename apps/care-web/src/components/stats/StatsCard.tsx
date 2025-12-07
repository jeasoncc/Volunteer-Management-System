import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <div className={cn(
      'bg-white rounded-2xl shadow-warm border border-[#e8e0d5] p-6 transition-all hover:shadow-warm-lg',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[#6b6560] mb-1">{title}</p>
          <p className="text-3xl font-bold text-[#2d2a26]">{value}</p>
          {trend && (
            <p className={cn(
              'text-sm mt-2',
              trend.isPositive ? 'text-[#7cb342]' : 'text-red-500'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className="bg-[#b8860b]/10 p-3 rounded-xl">
          <Icon className="w-6 h-6 text-[#b8860b]" />
        </div>
      </div>
    </div>
  );
}
