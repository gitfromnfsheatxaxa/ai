'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GlassVariant } from '@/types';

interface WateryBackgroundProps {
  children: React.ReactNode;
  variant?: GlassVariant;
  className?: string;
}

const variantClasses: Record<GlassVariant, string> = {
  pearl: 'from-slate-50 via-slate-100 to-slate-50',
  glacier: 'from-blue-50 via-cyan-50 to-blue-50',
  aurora: 'from-purple-50 via-pink-50 to-purple-50',
};

export const WateryBackground: React.FC<WateryBackgroundProps> = ({
  children,
  variant = 'pearl',
  className,
}) => {
  return (
    <div className={cn('relative min-h-screen overflow-hidden', className)}>
      {/* Animated gradient background */}
      <motion.div
        className={cn(
          'absolute inset-0 bg-gradient-to-br',
          variantClasses[variant]
        )}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 20,
          ease: 'linear',
          repeat: Infinity,
        }}
        style={{
          backgroundSize: '400% 400%',
        }}
      />
      
      {/* Floating orbs for depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.1) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 18,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(250, 204, 21, 0.05) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, 40, 0],
            y: [0, -40, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 20,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
      </div>
      
      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      
      {/* Main content wrapper */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default WateryBackground;