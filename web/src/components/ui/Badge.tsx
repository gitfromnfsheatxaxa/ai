'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { BadgeVariant } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  onClick?: () => void;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: cn(
    'bg-white/50',
    'text-gray-700',
    'border-white/40'
  ),
  success: cn(
    'bg-green-50/60',
    'text-green-700',
    'border-green-200/40'
  ),
  warning: cn(
    'bg-amber-50/60',
    'text-amber-700',
    'border-amber-200/40'
  ),
  error: cn(
    'bg-red-50/60',
    'text-red-700',
    'border-red-200/40'
  ),
  info: cn(
    'bg-blue-50/60',
    'text-blue-700',
    'border-blue-200/40'
  ),
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
  onClick,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1',
        'rounded-full text-xs font-medium',
        'border backdrop-blur-md',
        'transition-all duration-200',
        variantClasses[variant],
        onClick && 'cursor-pointer hover:scale-105',
        className
      )}
      onClick={onClick}
    >
      {children}
    </span>
  );
};

export default Badge;