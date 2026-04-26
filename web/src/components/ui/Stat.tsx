'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  icon,
  trend,
  className,
}) => {
  return (
    <motion.div
      className={cn(
        'p-5 rounded-2xl',
        'bg-gradient-to-br from-white/70 to-white/30',
        'border border-white/30',
        'backdrop-blur-xl',
        'shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <motion.p
            className="text-3xl font-bold text-gray-800"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {value}
          </motion.p>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 mt-2 text-sm',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span>{Math.abs(trend.value)}% from last week</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-teal-50/50 text-teal-600">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Stat;