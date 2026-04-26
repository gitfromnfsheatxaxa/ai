'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GlassButton } from '../ui';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <motion.div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4',
        'text-center rounded-2xl',
        'bg-white/30 border border-white/30',
        'backdrop-blur-md',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="mb-6 p-4 rounded-full"
        style={{
          background: 'rgba(20, 184, 166, 0.1)',
        }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        {icon || (
          <svg
            className="w-12 h-12 text-teal-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        )}
      </motion.div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mb-6">{description}</p>
      
      {actionLabel && onAction && (
        <GlassButton onClick={onAction}>{actionLabel}</GlassButton>
      )}
    </motion.div>
  );
};

export default EmptyState;