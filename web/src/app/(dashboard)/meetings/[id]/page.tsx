'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, CheckSquare, Tag, FileText, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Divider } from '@/components/ui/Divider';
import { getPocketBaseClient } from '@/lib/pocketbase';

export default function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [meeting, setMeeting] = useState<any>(null);
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const pb = getPocketBaseClient();
    async function load() {
      try {
        const [m, actRes] = await Promise.all([
          pb.collection('meetings').getOne(id),
          pb.collection('action_items').getList(1, 50, {
            filter: `meeting = "${id}"`,
            sort: 'created',
          }).catch(() => ({ items: [] })),
        ]);
        setMeeting(m);
        setActions(actRes.items);
      } catch (e: any) {
        setError(e.message || 'Meeting not found');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">{error || 'Meeting not found'}</p>
        <button onClick={() => router.push('/meetings')} className="mt-4 text-teal-600 hover:text-teal-700 text-sm font-medium">
          ← Back to Meetings
        </button>
      </div>
    );
  }

  const topics: string[] = Array.isArray(meeting.topics) ? meeting.topics : [];
  const decisions: string[] = Array.isArray(meeting.decisions) ? meeting.decisions : [];
  const createdAt = new Date(meeting.created);
  const completedCount = actions.filter((a) => a.completed).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <button
          onClick={() => router.push('/meetings')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Meetings
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-800">{meeting.title || 'Untitled Meeting'}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {createdAt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              {meeting.duration && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {Math.round(meeting.duration / 60)} min
                </span>
              )}
            </div>
          </div>
          <Badge variant="success">Completed</Badge>
        </div>

        {/* Tags */}
        {topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {topics.map((t) => (
              <span key={t} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                style={{ background: 'rgba(20,184,166,0.1)', color: '#0d9488' }}>
                <Tag className="w-3 h-3" />{t}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: summary + transcript */}
        <div className="lg:col-span-2 space-y-4">
          {/* AI Summary */}
          {meeting.summary && (
            <GlassCard padding="lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(20,184,166,0.15)' }}>
                  <span className="text-teal-600 text-sm">✦</span>
                </div>
                <span className="font-semibold text-gray-800 text-sm">AI Summary</span>
                <Badge variant="info">Auto-generated</Badge>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{meeting.summary}</p>
            </GlassCard>
          )}

          {/* Decisions */}
          {decisions.length > 0 && (
            <GlassCard padding="lg">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-teal-600" /> Key Decisions
              </h3>
              <ul className="space-y-2">
                {decisions.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-teal-500 mt-0.5 flex-shrink-0">•</span>{d}
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}

          {/* Transcript */}
          {meeting.transcript && (
            <GlassCard padding="lg">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" /> Transcript
              </h3>
              <div className="max-h-64 overflow-y-auto">
                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{meeting.transcript}</p>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right: actions */}
        <div className="space-y-4">
          {/* Action items */}
          <GlassCard padding="lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">
                Action Items
              </h3>
              <span className="text-xs text-gray-400">{completedCount}/{actions.length} done</span>
            </div>
            {actions.length === 0 ? (
              <p className="text-sm text-gray-400">No actions detected</p>
            ) : (
              <div className="space-y-2">
                {actions.map((action) => (
                  <div key={action.id} className="flex items-start gap-2.5 p-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.5)' }}>
                    <div
                      className="w-4 h-4 rounded mt-0.5 flex-shrink-0 flex items-center justify-center"
                      style={{
                        border: action.completed ? 'none' : '1.5px solid #cbd5e1',
                        background: action.completed ? '#14b8a6' : 'transparent',
                      }}
                    >
                      {action.completed && <span className="text-white text-xs">✓</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${action.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {action.task || action.description}
                      </p>
                      {action.assignee && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <Avatar name={action.assignee} size="sm" />
                          <span className="text-xs text-gray-400">{action.assignee}</span>
                        </div>
                      )}
                      {action.due_date && (
                        <p className="text-xs text-gray-400 mt-0.5">Due {new Date(action.due_date).toLocaleDateString()}</p>
                      )}
                    </div>
                    {action.priority && (
                      <Badge variant={action.priority === 'high' ? 'error' : action.priority === 'medium' ? 'warning' : 'default'}>
                        {action.priority}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Meeting model used */}
          {meeting.ai_model_used && (
            <GlassCard padding="md">
              <p className="text-xs text-gray-400">AI Model</p>
              <p className="text-sm text-gray-600 font-mono mt-0.5 truncate">{meeting.ai_model_used}</p>
            </GlassCard>
          )}

          {meeting.project_tag && (
            <GlassCard padding="md">
              <p className="text-xs text-gray-400">Project</p>
              <p className="text-sm text-gray-700 font-medium mt-0.5">{meeting.project_tag}</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
