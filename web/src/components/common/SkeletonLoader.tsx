'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
}) => {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
    rounded: 'rounded-xl',
  };

  return (
    <div
      className={cn(
        'animate-pulse',
        'bg-gradient-to-r from-transparent via-gray-300/50 to-transparent',
        'bg-[length:1000px_100%]',
        'shimmer',
        variantClasses[variant],
        className
      )}
      style={{
        width: width || '100%',
        height: height || '1em',
      }}
    />
  );
};

interface SkeletonCardProps {
  className?: string;
  type?: 'default' | 'avatar' | 'stat' | 'list';
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className,
  type = 'default',
}) => {
  if (type === 'avatar') {
    return (
      <div className={cn('flex items-center gap-3 p-4', className)}>
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={14} />
        </div>
      </div>
    );
  }

  if (type === 'stat') {
    return (
      <div
        className={cn(
          'p-5 rounded-2xl',
          'bg-white/30 border border-white/20',
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <Skeleton width="80px" height={14} />
            <Skeleton width="100px" height={32} />
            <Skeleton width="120px" height={12} />
          </div>
          <Skeleton variant="rounded" width={48} height={48} />
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div
        className={cn(
          'p-4 rounded-xl',
          'bg-white/30 border border-white/20',
          'space-y-3',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton width="70%" height={16} />
            <Skeleton width="50%" height={14} />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton width="60px" height={24} />
          <Skeleton width="60px" height={24} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-5 rounded-2xl',
        'bg-white/30 border border-white/20',
        'space-y-4',
        className
      )}
    >
      <Skeleton height={20} />
      <Skeleton height={16} />
      <Skeleton height={16} />
      <div className="flex gap-2 pt-2">
        <Skeleton width="80px" height={32} />
        <Skeleton width="80px" height={32} />
      </div>
    </div>
  );
};

export default Skeleton;