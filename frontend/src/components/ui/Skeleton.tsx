import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = true,
  circle = false,
}) => {
  return (
    <div
      className={[
        'animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100',
        'bg-[length:400%_100%] animate-shimmer',
        rounded ? 'rounded-lg' : '',
        circle ? 'rounded-full' : '',
        className,
      ].join(' ')}
      style={{ width, height }}
    />
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-card p-5 shadow-soft border border-gray-100 space-y-3">
    <Skeleton height={20} className="w-2/3" />
    <Skeleton height={14} className="w-full" />
    <Skeleton height={14} className="w-5/6" />
    <div className="flex gap-2 pt-2">
      <Skeleton height={24} width={60} className="rounded-full" />
      <Skeleton height={24} width={60} className="rounded-full" />
    </div>
  </div>
);
