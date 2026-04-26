'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TagProps {
  children: React.ReactNode;
  className?: string;
  onRemove?: () => void;
  color?: 'default' | 'teal' | 'blue' | 'green' | 'amber' | 'red' | 'purple';
}

const colorClasses = {
  default: 'bg-white/40 text-gray-700 border-white/30',
  teal: 'bg-teal-50/50 text-teal-700 border-teal-200/30',
  blue: 'bg-blue-50/50 text-blue-700 border-blue-200/30',
  green: 'bg-green-50/50 text-green-700 border-green-200/30',
  amber: 'bg-amber-50/50 text-amber-700 border-amber-200/30',
  red: 'bg-red-50/50 text-red-700 border-red-200/30',
  purple: 'bg-purple-50/50 text-purple-700 border-purple-200/30',
};

export const Tag: React.FC<TagProps> = ({
  children,
  className,
  onRemove,
  color = 'default',
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1',
        'rounded-full text-xs font-medium',
        'border backdrop-blur-md',
        'transition-all duration-200',
        'hover:scale-105',
        colorClasses[color],
        className
      )}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Tag;