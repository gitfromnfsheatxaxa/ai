'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, icon, rightElement, className, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              'w-full px-4 py-3',
              'bg-white/30 border border-white/40 rounded-xl',
              'text-gray-800 placeholder-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50',
              'focus:bg-white/50',
              'transition-all duration-200',
              'backdrop-blur-md',
              icon && 'pl-12',
              rightElement && 'pr-12',
              error && 'border-red-400 focus:ring-red-400/50 focus:border-red-400',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';

export default GlassInput;