import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = true, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl shadow-warm overflow-hidden',
        'transition-all duration-300 ease-out',
        hover && 'hover:shadow-warm-lg hover:-translate-y-1',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('p-6 border-b border-border', className)}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  );
}

// 特色卡片 - 带图标
interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  iconClassName?: string;
}

export function FeatureCard({ icon, title, description, className, iconClassName }: FeatureCardProps) {
  return (
    <Card className={cn('p-6 text-center group', className)}>
      <div 
        className={cn(
          'w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center',
          'bg-primary/10 text-primary',
          'transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110',
          iconClassName
        )}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}

// 统计卡片
interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  className?: string;
  iconBgClassName?: string;
  valueClassName?: string;
}

export function StatCard({ icon, value, label, className, iconBgClassName, valueClassName }: StatCardProps) {
  return (
    <Card className={cn('p-6 text-center', className)}>
      <div 
        className={cn(
          'w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center',
          'bg-primary/10',
          iconBgClassName
        )}
      >
        {icon}
      </div>
      <div className={cn('text-3xl font-bold mb-1', valueClassName || 'text-primary')}>
        {value}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </Card>
  );
}
