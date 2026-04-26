'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GlassVariant } from '@/types';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: GlassVariant;
  hover?: boolean;
  onClick?: () => void;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  as?: React.ElementType;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

const variantClasses: Record<GlassVariant, string> = {
  pearl: 'bg-gradient-to-br from-white/80 to-white/40 border-white/30',
  glacier: 'bg-gradient-to-br from-blue-50/80 to-blue-100/40 border-blue-200/30',
  aurora: 'bg-gradient-to-br from-purple-50/80 to-pink-50/40 border-purple-200/30',
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      variant = 'pearl',
      hover = true,
      onClick,
      className,
      padding = 'lg',
      as: Component = 'div',
    },
    ref
  ) => {
    const baseClasses = cn(
      'rounded-2xl border backdrop-blur-xl transition-all duration-300',
      variantClasses[variant],
      paddingClasses[padding],
      'shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]',
      'hover:shadow-[0_12px_40px_0_rgba(31,38,135,0.15)]',
      className
    );

    if (onClick && hover) {
      return (
        <motion.div
          ref={ref}
          className={baseClasses}
          onClick={onClick}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      );
    }

    if (onClick) {
      return (
        <Component ref={ref} className={baseClasses} onClick={onClick}>
          {children}
        </Component>
      );
    }

    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export default GlassCard;