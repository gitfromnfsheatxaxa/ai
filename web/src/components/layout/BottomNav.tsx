'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Home,
  MessageSquare,
  Mic,
  ClipboardCheck,
  Folder,
} from 'lucide-react';

interface BottomNavProps {
  className?: string;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home, href: '/' },
  { id: 'meetings', label: 'Meetings', icon: MessageSquare, href: '/meetings' },
  { id: 'record', label: 'Record', icon: Mic, href: '/record', isCenter: true },
  { id: 'actions', label: 'Actions', icon: ClipboardCheck, href: '/actions' },
  { id: 'projects', label: 'Projects', icon: Folder, href: '/projects' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ className }) => {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'md:hidden',
        'px-4 pb-4 pt-2',
        className
      )}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex items-center justify-center gap-1"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '1.5rem',
          boxShadow: '0 -4px 32px rgba(31, 38, 135, 0.1)',
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isCenter = item.isCenter;

          if (isCenter) {
            return (
              <motion.button
                key={item.id}
                className="relative -top-4"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <div
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center',
                    'shadow-lg',
                    isActive
                      ? 'bg-gradient-to-r from-teal-500 to-teal-400'
                      : 'bg-gradient-to-r from-teal-500 to-teal-400'
                  )}
                  style={{
                    boxShadow: isActive
                      ? '0 4px 20px rgba(20, 184, 166, 0.5)'
                      : '0 4px 14px rgba(20, 184, 166, 0.4)',
                  }}
                >
                  <Mic className="w-7 h-7 text-white" />
                </div>
              </motion.button>
            );
          }

          return (
            <motion.a
              key={item.id}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center',
                'py-2 px-4 rounded-xl',
                'transition-colors duration-200',
                isActive ? 'text-teal-600' : 'text-gray-500'
              )}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <item.icon className="w-6 h-6" />
                {isActive && (
                  <motion.div
                    layoutId="bottomnav-active"
                    className="absolute -inset-2 rounded-xl"
                    style={{
                      background: 'rgba(20, 184, 166, 0.1)',
                    }}
                  />
                )}
              </div>
              <span className="text-xs font-medium mt-1">{item.label}</span>
            </motion.a>
          );
        })}
      </motion.div>
    </nav>
  );
};

export default BottomNav;