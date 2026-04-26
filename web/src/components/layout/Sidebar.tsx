'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home, MessageSquare, CheckSquare,
  Folder, Settings, Mic, LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const TEAL = '#14b8a6';

const NAV = [
  { href: '/',         label: 'Home',         Icon: Home           },
  { href: '/meetings', label: 'Meetings',     Icon: MessageSquare  },
  { href: '/actions',  label: 'Action Board', Icon: CheckSquare    },
  { href: '/projects', label: 'Projects',     Icon: Folder         },
  { href: '/settings', label: 'Settings',     Icon: Settings       },
];

function Divider() {
  return <div style={{ height: 1, background: 'rgba(148,163,184,0.15)', margin: '0 16px' }} />;
}

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const colors = ['#14b8a6', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6', '#10b981'];
  const c = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${c}22`, border: `1.5px solid ${c}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: c, flexShrink: 0,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {name[0].toUpperCase()}
    </div>
  );
}

export function Sidebar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const active = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const displayName = user?.full_name || user?.telegram_username || 'User';
  const subtitle    = user?.telegram_username ? `@${user.telegram_username}` : 'Bot user';

  const handleLogout = async () => { await logout(); router.push('/login'); };

  return (
    <div style={{
      width: 220, height: '100%', flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRight: '1px solid rgba(255,255,255,0.7)',
      zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: `linear-gradient(135deg, ${TEAL}, #0d9488)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 3px 10px ${TEAL}40`,
        }}>
          <Mic size={16} color="white" />
        </div>
        <div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 15, color: '#0f172a', letterSpacing: '-0.01em' }}>
            NoteAI
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>
            Meeting Intelligence
          </div>
        </div>
      </div>

      <Divider />

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ href, label, Icon }) => {
          const isActive = active(href);
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 10,
                border: 'none', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontSize: 13.5,
                fontWeight: isActive ? 600 : 400,
                background: isActive ? 'rgba(255,255,255,0.7)' : 'transparent',
                color: isActive ? '#0f172a' : '#64748b',
                boxShadow: isActive ? '0 1px 6px rgba(0,0,0,0.07)' : 'none',
                transition: 'all 180ms',
                textAlign: 'left', width: '100%',
              }}
            >
              <Icon
                size={16}
                style={{ color: isActive ? TEAL : '#94a3b8', flexShrink: 0 }}
              />
              {label}
            </button>
          );
        })}
      </nav>

      <Divider />

      {/* User row */}
      <div style={{ padding: '14px 16px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={displayName} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
            color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {displayName}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>
            {subtitle}
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 0, flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
        >
          <LogOut size={15} />
        </button>
      </div>
    </div>
  );
}
