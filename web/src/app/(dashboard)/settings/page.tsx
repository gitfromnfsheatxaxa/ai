'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, LogOut, MessageSquare, Hash, Globe } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Avatar } from '@/components/ui/Avatar';
import { Divider } from '@/components/ui/Divider';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { useAuthStore } from '@/store/authStore';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const displayName = user?.full_name || user?.telegram_username || 'User';
  const telegramId  = user?.telegram_id;

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 mt-1 text-sm">Your account and preferences</p>
      </motion.div>

      {/* Profile */}
      <GlassCard padding="lg" hover={false}>
        <div className="flex items-center gap-4 mb-5">
          <div style={{ background: 'rgba(20,184,166,0.12)', borderRadius: 9 }} className="p-2">
            <User className="w-4 h-4 text-teal-600" />
          </div>
          <h2 className="font-semibold text-gray-800">Profile</h2>
        </div>

        <div className="flex items-center gap-4">
          <Avatar name={displayName} size="xl" />
          <div>
            <div className="text-lg font-semibold text-gray-800">{displayName}</div>
            {user?.telegram_username && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                <MessageSquare className="w-3.5 h-3.5" />
                @{user.telegram_username}
              </div>
            )}
            {telegramId && (
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <Hash className="w-3 h-3" />
                Telegram ID: {telegramId}
              </div>
            )}
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(148,163,184,0.15)', margin: '20px 0' }} />

        <div className="space-y-3">
          <Row label="Full name" value={user?.full_name || '—'} />
          <Row label="Telegram username" value={user?.telegram_username ? `@${user.telegram_username}` : '—'} />
          <Row label="Account type" value="Telegram user" badge />
          <Row label="Authentication" value="Passwordless (bot magic link)" />
        </div>
      </GlassCard>

      {/* Language */}
      <GlassCard padding="lg" hover={false}>
        <div className="flex items-center gap-4 mb-5">
          <div style={{ background: 'rgba(99,102,241,0.1)', borderRadius: 9 }} className="p-2">
            <Globe className="w-4 h-4 text-indigo-600" />
          </div>
          <h2 className="font-semibold text-gray-800">Language</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700 font-medium">Interface language</p>
            <p className="text-xs text-gray-400 mt-0.5">Also controls the bot's reply language</p>
          </div>
          <LanguageSwitcher />
        </div>
      </GlassCard>

      {/* Danger zone */}
      <GlassCard padding="lg" hover={false}>
        <div className="flex items-center gap-4 mb-5">
          <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 9 }} className="p-2">
            <LogOut className="w-4 h-4 text-red-500" />
          </div>
          <h2 className="font-semibold text-gray-800">Session</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700 font-medium">Sign out</p>
            <p className="text-xs text-gray-400 mt-0.5">You can sign back in anytime via the Telegram bot</p>
          </div>
          <GlassButton variant="danger" size="sm" onClick={handleLogout}>
            Sign out
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
}

function Row({ label, value, badge }: { label: string; value: string; badge?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-500">{label}</span>
      {badge ? (
        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: 'rgba(20,184,166,0.1)', color: '#0d9488' }}>
          {value}
        </span>
      ) : (
        <span className="text-sm text-gray-700 font-medium">{value}</span>
      )}
    </div>
  );
}
