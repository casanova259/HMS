import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/utils/formatting';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  change?: number;
  trend?: 'up' | 'down';
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  subtitle?: string;
  className?: string;
}

const colorClasses: Record<string, { bg: string; text: string; icon: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'bg-blue-100' },
  green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'bg-green-100' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'bg-orange-100' },
  red: { bg: 'bg-red-50', text: 'text-red-600', icon: 'bg-red-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'bg-purple-100' },
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  change,
  trend,
  color = 'blue',
  subtitle,
  className,
}: StatCardProps) => {
  const colors = colorClasses[color];
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

  return (
    <div
      className={cn(
        'bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow',
        colors.bg,
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-lg', colors.icon)}>
            <Icon className={cn('w-6 h-6', colors.text)} />
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-2 mt-4">
          <TrendIcon
            className={cn(
              'w-4 h-4',
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            )}
          />
          <span
            className={cn(
              'text-sm font-semibold',
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            )}
          >
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-gray-600">vs last month</span>
        </div>
      )}
    </div>
  );
};
