'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'teal' | 'blue' | 'green' | 'amber' | 'red';
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const colorClasses = {
  teal: 'from-teal-500 to-teal-400',
  blue: 'from-blue-500 to-blue-400',
  green: 'from-green-500 to-green-400',
  amber: 'from-amber-500 to-amber-400',
  red: 'from-red-500 to-red-400',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className,
  showLabel = false,
  size = 'md',
  color = 'teal',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          'bg-white/30 border border-white/20',
          'backdrop-blur-sm',
          sizeClasses[size]
        )}
      >
        <motion.div
          className={cn(
            'h-full rounded-full',
            'bg-gradient-to-r',
            colorClasses[color]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-gray-600">
          <span>{Math.round(percentage)}%</span>
          <span>
            {value}/{max}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;