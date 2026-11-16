import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: { value: number; label: string };
  color?: 'green' | 'orange' | 'purple' | 'blue';
}

const colorMap = {
  green: 'bg-fm-primary',
  orange: 'bg-fm-secondary',
  purple: 'bg-fm-purple',
  blue: 'bg-blue-100',
};

export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  value,
  label,
  trend,
  color = 'green',
}) => {
  return (
    <div className="bg-white rounded-card shadow-soft border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={['w-11 h-11 rounded-2xl flex items-center justify-center', colorMap[color]].join(' ')}>
          {icon}
        </div>
        {trend && (
          <div
            className={['flex items-center gap-1 text-sm font-medium', trend.value >= 0 ? 'text-green-600' : 'text-red-500'].join(' ')}
          >
            {trend.value >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-fm-text">{value}</p>
      <p className="text-sm text-fm-text/60 mt-0.5">{label}</p>
      {trend && <p className="text-xs text-fm-text/40 mt-1">{trend.label}</p>}
    </div>
  );
};
