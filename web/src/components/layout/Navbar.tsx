'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Home, MessageSquare, ClipboardCheck, Folder, Mic, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface NavbarProps {
  className?: string;
  currentPage?: string;
  user?: { name: string; avatar?: string };
}

const navItems = [
  { id: 'home',     label: 'Home',     icon: Home,           href: '/' },
  { id: 'meetings', label: 'Meetings', icon: MessageSquare,  href: '/meetings' },
  { id: 'actions',  label: 'Actions',  icon: ClipboardCheck, href: '/actions' },
  { id: 'projects', label: 'Projects', icon: Folder,         href: '/projects' },
];

export const Navbar: React.FC<NavbarProps> = ({ className, currentPage = 'home', user }) => {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn('sticky top-0 z-50 px-6 py-3 backdrop-blur-xl', className)}
      style={{
        background: 'rgba(255, 255, 255, 0.75)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 1px 20px rgba(0,0,0,0.04)',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              boxShadow: '0 3px 10px rgba(20,184,166,0.4)',
            }}
          >
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-800 text-sm leading-tight" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800 }}>NoteAI</div>
            <div className="text-xs text-gray-400">Meeting Intelligence</div>
          </div>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id || (item.id === 'home' && currentPage === '');
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  active
                    ? 'text-teal-700 bg-teal-50/70'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right: Record + User */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => router.push('/record')}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              boxShadow: '0 2px 10px rgba(20,184,166,0.35)',
            }}
          >
            <Mic className="w-4 h-4" />
            Record
          </button>

          {user && (
            <div className="flex items-center gap-2">
              <Avatar name={user.name} src={user.avatar} size="sm" />
              <div className="hidden lg:block text-left">
                <div className="text-sm font-medium text-gray-800 leading-tight">{user.name}</div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50/60 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
