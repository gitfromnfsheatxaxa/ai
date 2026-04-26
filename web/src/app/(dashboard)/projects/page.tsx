'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Folder, MessageSquare, CheckSquare, Loader2, Mic } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/common/EmptyState';
import { getPocketBaseClient } from '@/lib/pocketbase';
import { useAuthStore } from '@/store/authStore';

interface Project {
  name: string;
  meetingCount: number;
  actionCount: number;
  completedActions: number;
  lastActivity: string;
}

export default function ProjectsPage() {
  const router  = useRouter();
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user) return;
    const pb = getPocketBaseClient();

    async function load() {
      try {
        const [meetingRes, actionRes] = await Promise.all([
          pb.collection('meetings').getFullList({
            filter: `user_ai.telegram_id = "${user!.telegram_id}"`,
            fields: 'project_tag,created',
          }).catch(() => []),
          pb.collection('action_items').getFullList({
            filter: `user_ai.telegram_id = "${user!.telegram_id}"`,
            fields: 'project,completed,created',
          }).catch(() => []),
        ]);

        // Group by project_tag
        const map = new Map<string, Project>();
        const ensureProject = (name: string) => {
          if (!map.has(name)) map.set(name, { name, meetingCount: 0, actionCount: 0, completedActions: 0, lastActivity: '' });
          return map.get(name)!;
        };

        for (const m of meetingRes as any[]) {
          const tag = m.project_tag || 'General';
          const p   = ensureProject(tag);
          p.meetingCount++;
          if (!p.lastActivity || m.created > p.lastActivity) p.lastActivity = m.created;
        }

        for (const a of actionRes as any[]) {
          const tag = a.project || 'General';
          const p   = ensureProject(tag);
          p.actionCount++;
          if (a.completed) p.completedActions++;
        }

        setProjects(Array.from(map.values()).sort((a, b) => b.meetingCount - a.meetingCount));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Projects</h1>
          <p className="text-gray-500 mt-1 text-sm">{projects.length} project{projects.length !== 1 ? 's' : ''} from your meetings</p>
        </div>
        <GlassButton variant="primary" size="sm" icon={<Mic className="w-4 h-4" />} onClick={() => router.push('/record')}>
          New Recording
        </GlassButton>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-teal-500" /></div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Projects are automatically created from your meeting project tags. Record a meeting to get started."
          actionLabel="Start Recording"
          onAction={() => router.push('/record')}
          icon={<Folder className="w-12 h-12" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => {
            const pct = project.actionCount
              ? Math.round((project.completedActions / project.actionCount) * 100)
              : 0;
            return (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard padding="lg" hover>
                  {/* Icon + name */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2.5 rounded-xl flex-shrink-0"
                      style={{ background: `hsl(${(project.name.charCodeAt(0) * 37) % 360},70%,92%)` }}>
                      <Folder className="w-5 h-5" style={{ color: `hsl(${(project.name.charCodeAt(0) * 37) % 360},60%,40%)` }} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{project.name}</h3>
                      {project.lastActivity && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Last: {new Date(project.lastActivity).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-800">{project.meetingCount}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 justify-center mt-0.5">
                        <MessageSquare className="w-3 h-3" />meetings
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-800">{project.actionCount}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 justify-center mt-0.5">
                        <CheckSquare className="w-3 h-3" />actions
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  {project.actionCount > 0 && (
                    <>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Actions completed</span>
                        <span className="font-semibold text-teal-600">{pct}%</span>
                      </div>
                      <ProgressBar value={pct} size="sm" />
                    </>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
