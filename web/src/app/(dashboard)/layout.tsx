'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuthStore } from '@/store/authStore';

const BG = 'radial-gradient(ellipse at 15% 40%, rgba(20,184,166,0.10) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(148,163,184,0.10) 0%, transparent 50%), radial-gradient(ellipse at 60% 85%, rgba(99,102,241,0.07) 0%, transparent 50%), #f0f4f8';

const PAGE_LABELS: Record<string, string> = {
  '':         'Home',
  meetings:   'Meetings',
  actions:    'Action Board',
  projects:   'Projects',
  settings:   'Settings',
};

function pageLabel(pathname: string) {
  const seg = pathname.split('/').filter(Boolean);
  return PAGE_LABELS[seg[0] ?? ''] ?? seg[0] ?? 'Home';
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, initialize } = useAuthStore();

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!useAuthStore.getState().user) {
        router.push(`/login?from=${encodeURIComponent(pathname)}`);
      }
    }, 150);
    return () => clearTimeout(t);
  }, [user, pathname, router]);

  return (
    <div style={{
      minHeight: '100dvh',
      background: BG,
      display: 'flex',
      transition: 'background 400ms ease',
      overflow: 'hidden',
    }}>

      {/* ── Sidebar (desktop) ── */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{
          height: 60, flexShrink: 0,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: 'rgba(255,255,255,0.30)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.50)',
          zIndex: 5,
        }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748b' }}>
            {pageLabel(pathname)}
          </span>
          <button style={{
            width: 36, height: 36, borderRadius: 9,
            background: 'rgba(255,255,255,0.5)',
            border: '1px solid rgba(255,255,255,0.7)',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#64748b',
          }}>
            <Bell size={16} />
          </button>
        </div>

        {/* Page scroll area */}
        <main
          style={{ flex: 1, overflowY: 'auto', padding: 24 }}
          className="pb-28 md:pb-6"
        >
          {children}
        </main>
      </div>

      {/* ── Bottom nav (mobile only) ── */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
