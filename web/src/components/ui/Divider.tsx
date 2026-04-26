'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  label?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  className,
  label,
}) => {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn(
          'h-full w-px',
          'bg-gradient-to-b from-transparent via-white/40 to-transparent',
          className
        )}
      />
    );
  }

  return (
    <div className={cn('w-full flex items-center', className)}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      {label && (
        <span className="px-4 text-sm text-gray-500 font-medium">{label}</span>
      )}
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/40 to-transparent" />
    </div>
  );
};

export default Divider;