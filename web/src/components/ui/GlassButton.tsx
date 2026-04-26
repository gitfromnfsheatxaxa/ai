'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ButtonVariant, ButtonSize } from '@/types';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-gradient-to-r from-teal-500 to-teal-400',
    'text-white font-semibold',
    'shadow-lg shadow-teal-500/30',
    'hover:shadow-xl hover:shadow-teal-500/40',
    'hover:from-teal-600 hover:to-teal-500',
    'active:from-teal-700 active:to-teal-600'
  ),
  ghost: cn(
    'bg-white/10',
    'text-gray-700',
    'hover:bg-white/20',
    'active:bg-white/30'
  ),
  outline: cn(
    'bg-transparent',
    'border-2 border-teal-500/50',
    'text-teal-700',
    'hover:bg-teal-50/50',
    'hover:border-teal-500',
    'active:bg-teal-100/50'
  ),
  subtle: cn(
    'bg-white/40',
    'text-gray-700',
    'hover:bg-white/60',
    'active:bg-white/70'
  ),
  danger: cn(
    'bg-gradient-to-r from-red-500 to-red-400',
    'text-white font-semibold',
    'shadow-lg shadow-red-500/30',
    'hover:shadow-xl hover:shadow-red-500/40',
    'hover:from-red-600 hover:to-red-500',
    'active:from-red-700 active:to-red-600'
  ),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-base rounded-xl',
  lg: 'px-7 py-3 text-lg rounded-xl',
};

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      icon,
      isLoading = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center gap-2',
      'font-medium',
      'transition-all duration-200',
      'backdrop-blur-md',
      'border border-white/20',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size],
      className
    );

return (
      <motion.button
        ref={ref}
        className={baseClasses}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        transition={{ duration: 0.15 }}
        {...(props as any)}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : icon ? (
          icon
        ) : null}
        {children}
      </motion.button>
    );
  }
);

GlassButton.displayName = 'GlassButton';

export default GlassButton;