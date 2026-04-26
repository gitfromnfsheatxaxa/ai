'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mic, CheckSquare, Sparkles, Clock,
  ChevronRight, Loader2, Zap, Calendar,
} from 'lucide-react';
import { getPocketBaseClient } from '@/lib/pocketbase';
import { useAuthStore } from '@/store/authStore';

const TEAL = '#14b8a6';

const g = (op = 0.55): React.CSSProperties => ({
  background: `rgba(255,255,255,${op})`,
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.75)',
  boxShadow: '0 2px 20px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
  borderRadius: 16,
});

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function StatCard({ label, value, delta, icon }: { label: string; value: string | number; delta?: number; icon: React.ReactNode }) {
  const up = (delta ?? 0) > 0;
  return (
    <div style={{ ...g(0.55), padding: '16px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'Inter, sans-serif' }}>{label}</div>
        <div style={{ color: TEAL, opacity: 0.7 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", color: 'teal', lineHeight: 1 }}>
        {value}
      </div>
      {delta !== undefined && (
        <div style={{ fontSize: 12, color: up ? '#10b981' : '#ef4444', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>
          {up ? '↑' : '↓'} {Math.abs(delta)}% this week
        </div>
      )}
    </div>
  );
}

function AvatarRow({ names }: { names: string[] }) {
  const colors = ['#14b8a6', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6', '#10b981'];
  const shown = names.slice(0, 4);
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      {shown.map((n, i) => {
        const c = colors[n.charCodeAt(0) % colors.length];
        return (
          <div key={i} style={{
            width: 24, height: 24, borderRadius: '50%',
            background: `${c}22`, border: `1.5px solid ${c}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, color: c,
            marginLeft: i === 0 ? 0 : -6,
            zIndex: shown.length - i,
            position: 'relative', outline: '2px solid rgba(255,255,255,0.9)',
          }}>{n[0].toUpperCase()}</div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [meetings,      setMeetings]      = useState<any[]>([]);
  const [actions,       setActions]       = useState<any[]>([]);
  const [totalMeetings, setTotalMeetings] = useState(0);
  const [loading,       setLoading]       = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.full_name?.split(' ')[0] || user?.telegram_username || 'there';

  useEffect(() => {
    if (!user) return;
    const pb = getPocketBaseClient();
    (async () => {
      try {
        const [mr, ar] = await Promise.all([
          pb.collection('meetings').getList(1, 5, {
            filter: `user_ai = "${user.id}"`,
            sort: '-created',
          }).catch(() => ({ items: [], totalItems: 0 })),
          // Load ALL actions — filter client-side so null/empty status values aren't missed
          pb.collection('action_items').getList(1, 50, {
            filter: `user_ai = "${user.id}"`,
            sort: '-created',
          }).catch(() => ({ items: [], totalItems: 0 })),
        ]);
        setMeetings(mr.items);
        setActions(ar.items);
        setTotalMeetings((mr as any).totalItems ?? mr.items.length);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const openActions    = actions.filter((a: any) => a.status !== 'done' && !a.completed);
  const completedCount = actions.filter((a: any) => a.status === 'done' || a.completed).length;
  const totalMtgs      = totalMeetings || meetings.length;
  // Estimate avg length from transcript word count (130 wpm speaking rate)
  const avgDur = meetings.length
    ? (() => {
        const withDuration = meetings.filter(m => m.duration);
        if (withDuration.length) {
          return Math.round(withDuration.reduce((s, m) => s + m.duration, 0) / withDuration.length / 60);
        }
        const withTranscript = meetings.filter(m => m.transcript || m.raw_transcript);
        if (withTranscript.length) {
          const avgWords = withTranscript.reduce((s, m) => {
            const t = (m.transcript || m.raw_transcript || '');
            return s + t.split(/\s+/).filter(Boolean).length;
          }, 0) / withTranscript.length;
          return Math.max(1, Math.round(avgWords / 130));
        }
        return 0;
      })()
    : 0;

  return (
    <div className="flex flex-col lg:flex-row gap-5">

      {/* ── Left main column ── */}
      <div className="flex flex-col gap-4 min-w-0 flex-1">

        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", color: '#0f172a' }}>
            {greeting}, {firstName} ☀️
          </div>
          <div style={{ fontSize: 13.5, color: '#64748b', marginTop: 3, fontFamily: 'Inter, sans-serif' }}>
            {totalMtgs} meeting{totalMtgs !== 1 ? 's' : ''} recorded · {openActions.length} open action{openActions.length !== 1 ? 's' : ''}
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total meetings"      value={totalMtgs}       icon={<Calendar size={14} />} />
          <StatCard label="Actions completed"  value={completedCount}  icon={<CheckSquare size={14} />} />
          <StatCard label="Avg. meeting length" value={avgDur ? `~${avgDur}m` : '—'} icon={<Clock size={14} />} />
          <StatCard label="AI summaries"       value={meetings.filter(m => m.summary).length} icon={<Sparkles size={14} />} />
        </div>

        {/* Today's Meetings */}
        <div style={{ ...g(0.55), padding: 20, flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 15, color: '#0f172a' }}>
              Recent Meetings
            </div>
            <button
              onClick={() => router.push('/meetings')}
              style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: TEAL, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
            >
              View all <ChevronRight size={14} />
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
              <Loader2 size={22} style={{ color: TEAL, animation: 'spin 1s linear infinite' }} />
            </div>
          ) : meetings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
              No meetings yet. <button onClick={() => router.push('/record')} style={{ color: TEAL, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Start recording →</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {meetings.map((m: any, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => router.push(`/meetings/${m.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.7)',
                    borderRadius: 12, cursor: 'pointer', transition: 'all 200ms',
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.background = 'rgba(255,255,255,0.78)'; }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.background = 'rgba(255,255,255,0.5)'; }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(20,184,166,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: TEAL,
                  }}>
                    <Mic size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 13.5, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.title || m.project_tag || 'Untitled Meeting'}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2, display: 'flex', gap: 10 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={11} /> {timeAgo(m.created)}
                      </span>
                      {m.duration && <span>{Math.round(m.duration / 60)} min</span>}
                    </div>
                  </div>
                  {m.project_tag && (
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(20,184,166,0.1)', color: '#0d9488', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {m.project_tag}
                    </span>
                  )}
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(148,163,184,0.12)', color: '#475569', flexShrink: 0 }}>
                    Done
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right sidebar ── */}
      <div className="flex flex-col gap-4 w-full lg:w-72 lg:flex-shrink-0">

        {/* AI Insight */}
        <div style={{
          ...g(0.5),
          padding: 16,
          background: 'linear-gradient(135deg, rgba(20,184,166,0.10), rgba(99,102,241,0.07))',
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'rgba(20,184,166,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: TEAL, flexShrink: 0,
            }}>
              <Sparkles size={14} />
            </div>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, color: '#0f172a', marginBottom: 4 }}>
                AI Insight
              </div>
              <div style={{ fontSize: 12.5, color: '#475569', fontFamily: 'Inter, sans-serif', lineHeight: 1.55 }}>
                {openActions.length > 0
                  ? `You have ${openActions.length} open action item${openActions.length > 1 ? 's' : ''}. ${openActions[0]?.assignee ? `${openActions[0].assignee}'s item` : 'The top item'} has the highest priority.`
                  : 'All caught up! No open action items. Great work.'}
              </div>
            </div>
          </div>
        </div>

        {/* Open Actions */}
        <div style={{ ...g(0.55), padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: '#0f172a' }}>
              Open Actions
            </div>
            <button
              onClick={() => router.push('/actions')}
              style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: TEAL, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Board →
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#cbd5e1', fontSize: 13 }}>Loading…</div>
          ) : openActions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
              No open actions 🎉
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {openActions.map((a: any) => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '8px 10px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.45)',
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: 4,
                    border: '1.5px solid #cbd5e1',
                    marginTop: 1, flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontFamily: 'Inter, sans-serif', color: '#1e293b', lineHeight: 1.4 }}>
                      {a.task || a.description || '—'}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                      {a.assignee || ''}{a.due_date ? ` · ${new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                    </div>
                  </div>
                  {a.priority && (
                    <span style={{
                      fontSize: 10.5, padding: '1px 7px', borderRadius: 99, flexShrink: 0,
                      background: a.priority === 'high' ? 'rgba(239,68,68,0.1)' : a.priority === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(148,163,184,0.12)',
                      color: a.priority === 'high' ? '#dc2626' : a.priority === 'medium' ? '#d97706' : '#64748b',
                    }}>
                      {a.priority}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Start Recording CTA */}
        <button
          onClick={() => router.push('/record')}
          style={{
            width: '100%', padding: '14px',
            borderRadius: 12, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${TEAL}, #0d9488)`,
            color: 'white', fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700, fontSize: 15,
            boxShadow: `0 4px 20px ${TEAL}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'transform 150ms, box-shadow 150ms',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 28px ${TEAL}50`; }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 4px 20px ${TEAL}40`; }}
        >
          <Mic size={18} /> Start Recording
        </button>
      </div>
    </div>
  );
}
