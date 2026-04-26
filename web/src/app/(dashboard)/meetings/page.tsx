'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Calendar, Clock, MessageSquare, Mic, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { getPocketBaseClient } from '@/lib/pocketbase';
import { useAuthStore } from '@/store/authStore';
import { Meeting } from '@/types';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function MeetingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    const pb = getPocketBaseClient();

    async function load() {
      try {
        const res = await pb.collection('meetings').getList(1, 50, {
          filter: `telegram_user_id = "${user!.telegram_id}"`,
          sort: '-created',
        });
        setMeetings(res.items as unknown as Meeting[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const filtered = meetings.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (m.title || '').toLowerCase().includes(q) ||
      (m.summary || '').toLowerCase().includes(q) ||
      ((m.topics as any) || []).some((t: string) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Meetings</h1>
          <p className="text-gray-500 mt-1">{meetings.length} meeting{meetings.length !== 1 ? 's' : ''} recorded</p>
        </div>
        <GlassButton variant="primary" icon={<Mic className="w-5 h-5" />} onClick={() => router.push('/record')}>
          New Recording
        </GlassButton>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search meetings…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
          style={{
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.5)',
            backdropFilter: 'blur(12px)',
          }}
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((meeting, i) => (
            <motion.div
              key={meeting.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard
                padding="md"
                onClick={() => router.push(`/meetings/${meeting.id}`)}
                hover
              >
                <div className="flex items-start gap-4">
                  <div
                    className="p-3 rounded-xl flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #14b8a6, #2dd4bf)' }}
                  >
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {meeting.title || 'Untitled Meeting'}
                      </h3>
                      <Badge variant="success">completed</Badge>
                    </div>
                    {meeting.summary && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{meeting.summary}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(meeting.created)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(meeting.created)}
                      </span>
                      {(meeting as any).duration && (
                        <span>{(meeting as any).duration}s</span>
                      )}
                    </div>
                    {((meeting.topics as any) as string[])?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {((meeting.topics as any) as string[]).slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(20,184,166,0.1)', color: '#0d9488' }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={search ? 'No matches found' : 'No meetings yet'}
          description={search ? 'Try a different search term' : 'Record your first meeting using the Telegram bot or the record button'}
          actionLabel="Start Recording"
          onAction={() => router.push('/record')}
          icon={<Mic className="w-12 h-12" />}
        />
      )}
    </div>
  );
}
