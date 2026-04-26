'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, Mic, Flag, User, Calendar, RefreshCw } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/common/EmptyState';
import { getPocketBaseClient } from '@/lib/pocketbase';
import { useAuthStore } from '@/store/authStore';

type Priority = 'high' | 'medium' | 'low';
type Status   = 'todo' | 'in_progress' | 'done';

interface Action {
  id: string;
  task: string;
  description?: string;
  assignee: string;
  due_date: string;
  priority: Priority;
  completed: boolean;
  status: Status;
  meeting: string;
  created: string;
}

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

const priorityVariant: Record<Priority, 'error' | 'warning' | 'default'> = {
  high: 'error', medium: 'warning', low: 'default',
};

function formatDate(d: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ActionsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [actions, setActions]   = useState<Action[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<'all' | 'open' | 'done'>('open');
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const pb = getPocketBaseClient();
    try {
      const res = await pb.collection('action_items').getList(1, 200, {
        filter: `user_ai.telegram_id = "${user.telegram_id}"`,
        sort: '-created',
      });
      setActions(res.items as unknown as Action[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (action: Action) => {
    setToggling(action.id);
    const pb = getPocketBaseClient();
    try {
      const newCompleted = !action.completed;
      await pb.collection('action_items').update(action.id, {
        completed: newCompleted,
        status: newCompleted ? 'done' : 'todo',
      });
      setActions(prev =>
        prev.map(a => a.id === action.id ? { ...a, completed: newCompleted, status: newCompleted ? 'done' : 'todo' } : a)
      );
    } finally {
      setToggling(null);
    }
  };

  const visible = actions
    .filter(a => filter === 'all' ? true : filter === 'done' ? a.completed : !a.completed)
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2);
    });

  const open = actions.filter(a => !a.completed).length;
  const done = actions.filter(a =>  a.completed).length;
  const pct  = actions.length ? Math.round((done / actions.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Action Board</h1>
          <p className="text-gray-500 mt-1 text-sm">{open} open · {done} completed</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white/60 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
          <GlassButton variant="primary" icon={<Mic className="w-4 h-4" />} onClick={() => router.push('/record')} size="sm">
            New Recording
          </GlassButton>
        </div>
      </motion.div>

      {/* Progress + filter tabs */}
      <GlassCard padding="md" hover={false}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-40">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Completion</span><span className="font-semibold text-teal-600">{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/40 overflow-hidden border border-white/30">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg,#14b8a6,#2dd4bf)' }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            </div>
          </div>
          {/* Filter tabs */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.5)' }}>
            {(['open','all','done'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
                style={{
                  background: filter === f ? 'white' : 'transparent',
                  color: filter === f ? '#0f172a' : '#64748b',
                  boxShadow: filter === f ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
                }}>
                {f === 'open' ? `Open (${open})` : f === 'done' ? `Done (${done})` : `All (${actions.length})`}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-teal-500" /></div>
      ) : visible.length === 0 ? (
        <EmptyState
          title={filter === 'done' ? 'No completed actions yet' : 'No open actions'}
          description={filter === 'done' ? 'Complete some actions to see them here' : 'Record a meeting to auto-detect action items'}
          actionLabel="Start Recording"
          onAction={() => router.push('/record')}
          icon={<CheckCircle2 className="w-12 h-12" />}
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {visible.map((action, i) => (
              <motion.div key={action.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.03 }}>
                <GlassCard padding="md" hover={false}>
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggle(action)}
                      disabled={toggling === action.id}
                      className="mt-0.5 flex-shrink-0 transition-all"
                    >
                      {toggling === action.id
                        ? <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
                        : action.completed
                        ? <CheckCircle2 className="w-5 h-5 text-teal-500" />
                        : <Circle className="w-5 h-5 text-gray-300 hover:text-teal-400" />
                      }
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-snug ${action.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {action.task || action.description || '(no title)'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {action.priority && (
                          <Badge variant={priorityVariant[action.priority]}>
                            <Flag className="w-3 h-3 mr-1 inline" />{action.priority}
                          </Badge>
                        )}
                        {action.assignee && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Avatar name={action.assignee} size="sm" />
                            {action.assignee}
                          </span>
                        )}
                        {action.due_date && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {formatDate(action.due_date)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
