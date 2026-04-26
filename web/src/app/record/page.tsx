'use client';

import React from 'react';

type RecState = 'idle' | 'recording' | 'paused' | 'stopped';

interface ScriptLine {
  speaker: string;
  delay: number;
  text: string;
}
interface TranscriptEntry extends ScriptLine {
  timestamp: string;
}
interface DetectedAction {
  id: number;
  text: string;
  assignee: string;
  time: string;
  delay: number;
}
interface Toast extends DetectedAction {
  key: number;
}

const TEAL = '#14b8a6';
const BG_IDLE    = 'radial-gradient(ellipse at 20% 40%, rgba(20,184,166,0.08) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(148,163,184,0.08) 0%, transparent 50%), #f0f4f8';
const BG_LIVE    = 'radial-gradient(ellipse at 20% 50%, rgba(20,184,166,0.15) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(ellipse at 50% 90%, rgba(20,184,166,0.07) 0%, transparent 40%), #eef8f7';
const BG_STOPPED = 'radial-gradient(ellipse at 30% 40%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(20,184,166,0.07) 0%, transparent 50%), #f2f0f8';

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`;

const g = (op = 0.55): React.CSSProperties => ({
  background: `rgba(255,255,255,${op})`,
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.75)',
  boxShadow: '0 2px 20px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
});

const SCRIPT: ScriptLine[] = [
  { speaker: 'Alice', delay: 1200,  text: "Alright everyone, let's get started on the Q3 roadmap review. Carol, want to kick us off?" },
  { speaker: 'Carol', delay: 5500,  text: "Sure. So we've scoped v2.3 to three core deliverables — the new onboarding flow, token migration for the design system, and AI summary improvements." },
  { speaker: 'Bob',   delay: 12000, text: "Timeline-wise, how are we thinking about this? Six weeks feels tight given the token migration complexity." },
  { speaker: 'Carol', delay: 17500, text: "I agree there's risk. I'm proposing a week-two checkpoint where we reassess blockers and adjust scope if needed." },
  { speaker: 'Alice', delay: 23000, text: "That makes sense. Dan, where are we on the API contracts for the AI summary feature?" },
  { speaker: 'Dan',   delay: 27500, text: "Almost there. I need one more day on the streaming endpoint — should have it wrapped by end of day tomorrow." },
  { speaker: 'Alice', delay: 33000, text: "Perfect. Let's also make sure QA is looped in early this cycle. Last sprint they felt rushed." },
  { speaker: 'Bob',   delay: 38000, text: "Agreed. I'll set up a QA sync for Monday. And should we consider a beta group for onboarding?" },
  { speaker: 'Carol', delay: 44000, text: "Yes — I can identify five pilot customers by end of this week and we can run a two-week beta from week four." },
];

const DETECTED_ACTIONS: DetectedAction[] = [
  { id: 1, text: 'Finalize v2.3 feature specs',     assignee: 'Carol', time: '0:42', delay: 8000  },
  { id: 2, text: 'Set week-2 checkpoint',           assignee: 'Carol', time: '1:20', delay: 20000 },
  { id: 3, text: 'Finalize streaming API endpoint', assignee: 'Dan',   time: '2:10', delay: 29000 },
  { id: 4, text: 'Set up QA sync for Monday',       assignee: 'Bob',   time: '2:55', delay: 40000 },
  { id: 5, text: 'Identify 5 beta pilot customers', assignee: 'Carol', time: '3:30', delay: 46000 },
];

const SPEAKERS = ['Alice', 'Bob', 'Carol', 'Dan'];
const SPEAKER_COLORS = ['#14b8a6', '#6366f1', '#f59e0b', '#ec4899'];
const AVATAR_COLORS  = ['#14b8a6', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6', '#10b981'];

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function Avatar({ name = 'U', size = 32 }: { name?: string; size?: number }) {
  const c = avatarColor(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${c}20`, border: `1.5px solid ${c}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: c,
      flexShrink: 0, fontFamily: "'DM Sans', sans-serif",
    }}>
      {name[0].toUpperCase()}
    </div>
  );
}

function Avatars({ names, size = 26 }: { names: string[]; size?: number }) {
  const gap = Math.round(size * 0.22);
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      {names.map((n, i) => (
        <div key={i} style={{
          marginLeft: i === 0 ? 0 : -gap,
          position: 'relative', zIndex: names.length - i,
          borderRadius: '50%', outline: '2.5px solid rgba(255,255,255,0.95)', flexShrink: 0,
        }}>
          <Avatar name={n} size={size} />
        </div>
      ))}
    </div>
  );
}

function Badge({ children, color = 'teal', dot }: { children: React.ReactNode; color?: string; dot?: boolean }) {
  const m: Record<string, { bg: string; text: string; d: string }> = {
    teal:   { bg: 'rgba(20,184,166,0.12)',  text: '#0d9488', d: '#14b8a6' },
    amber:  { bg: 'rgba(245,158,11,0.12)',  text: '#d97706', d: '#f59e0b' },
    red:    { bg: 'rgba(239,68,68,0.10)',   text: '#dc2626', d: '#ef4444' },
    slate:  { bg: 'rgba(100,116,139,0.12)', text: '#475569', d: '#94a3b8' },
    purple: { bg: 'rgba(139,92,246,0.12)',  text: '#7c3aed', d: '#8b5cf6' },
    green:  { bg: 'rgba(16,185,129,0.12)',  text: '#059669', d: '#10b981' },
  };
  const c = m[color] || m.teal;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: c.bg, color: c.text,
      padding: '3px 9px', borderRadius: 99, fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.d, flexShrink: 0 }} />}
      {children}
    </span>
  );
}

interface BarData { dur: number; del: number; maxH: number; }

function WaveViz({ active, color = TEAL, bars = 28, height = 40 }: {
  active: boolean; color?: string; bars?: number; height?: number;
}) {
  const barData = React.useMemo<BarData[]>(() =>
    Array.from({ length: bars }, (_, i) => ({
      dur:  0.5 + Math.random() * 0.7,
      del:  (i / bars) * 0.6,
      maxH: 8 + Math.sin(i * 0.7) * 16 + Math.random() * 10,
    })),
    [bars],
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height }}>
      {barData.map((bar, i) => (
        <div
          key={i}
          className={active ? 'wave-bar' : ''}
          style={({
            width: 3, borderRadius: 99,
            height: active ? bar.maxH : 4,
            background: active ? color : 'rgba(20,184,166,0.3)',
            '--dur': `${bar.dur}s`,
            '--delay': `${bar.del}s`,
            transition: 'height 400ms ease, background 400ms ease',
            transformOrigin: 'center',
          }) as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function MicButton({ state, onClick }: { state: RecState; onClick: () => void }) {
  const isRec    = state === 'recording';
  const isPaused = state === 'paused';
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {isRec && [0, 1, 2].map(i => (
        <div key={i} className="pulse-ring" style={{
          position: 'absolute', width: 120, height: 120, borderRadius: '50%',
          border: `1.5px solid ${TEAL}`, pointerEvents: 'none',
          animationDelay: `${i * 0.6}s`,
        }} />
      ))}
      <button onClick={onClick} style={{
        width: 88, height: 88, borderRadius: '50%', border: 'none', cursor: 'pointer',
        background: isRec
          ? `linear-gradient(135deg, ${TEAL}, #0d9488)`
          : isPaused
          ? 'linear-gradient(135deg, #f59e0b, #d97706)'
          : 'linear-gradient(135deg, #0f172a, #1e293b)',
        boxShadow: isRec
          ? `0 0 0 8px ${TEAL}25, 0 8px 32px ${TEAL}50`
          : isPaused
          ? '0 0 0 8px rgba(245,158,11,0.25), 0 8px 32px rgba(245,158,11,0.4)'
          : '0 0 0 8px rgba(15,23,42,0.08), 0 12px 40px rgba(15,23,42,0.25)',
        transition: 'all 300ms cubic-bezier(0.34,1.56,0.64,1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: isRec ? 'scale(1.05)' : 'scale(1)',
      }}>
        {isRec ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="4" width="4" height="16" rx="1" fill="white" />
            <rect x="14" y="4" width="4" height="16" rx="1" fill="white" />
          </svg>
        ) : isPaused ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <polygon points="5,3 19,12 5,21" fill="white" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
            <path d="M19 10v2a7 7 0 01-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}
      </button>
    </div>
  );
}

function TranscriptLine({ line, isLast }: { line: TranscriptEntry; isLast: boolean }) {
  const c = avatarColor(line.speaker);
  return (
    <div className="transcript-line" style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
      <Avatar name={line.speaker} size={32} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 4 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: c }}>{line.speaker}</span>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>{line.timestamp}</span>
        </div>
        <div style={{
          fontSize: 14, color: '#334155', fontFamily: 'Inter, sans-serif', lineHeight: 1.7,
          padding: '10px 14px', background: 'rgba(255,255,255,0.5)', borderRadius: 12,
          border: '1px solid rgba(226,232,240,0.5)',
        }}>
          {line.text}
          {isLast && <span className="cursor" style={{ color: TEAL, marginLeft: 2 }}>▍</span>}
        </div>
      </div>
    </div>
  );
}

function ActionToast({ action, onDismiss }: { action: Toast; onDismiss: () => void }) {
  React.useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div style={{
      animation: 'floatUp 300ms ease both',
      ...g(0.9),
      borderRadius: 14, padding: '12px 16px',
      display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8,
      border: '1px solid rgba(20,184,166,0.25)',
      boxShadow: '0 4px 20px rgba(20,184,166,0.15)',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'rgba(20,184,166,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: TEAL, fontWeight: 600, fontFamily: 'Inter, sans-serif', marginBottom: 2 }}>ACTION DETECTED</div>
        <div style={{ fontSize: 13, color: '#1e293b', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{action.text}</div>
      </div>
      <Avatar name={action.assignee} size={24} />
      <button onClick={onDismiss} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
    </div>
  );
}

function SummaryScreen({ transcript, actions, duration }: {
  transcript: TranscriptEntry[];
  actions: DetectedAction[];
  duration: number;
}) {
  const [generating, setGenerating] = React.useState(true);
  const [summaryReady, setSummaryReady] = React.useState(false);

  React.useEffect(() => {
    const t1 = setTimeout(() => setGenerating(false), 1800);
    const t2 = setTimeout(() => setSummaryReady(true), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '28px 28px 40px', display: 'flex', gap: 20 }}>
      {/* Left */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: TEAL, fontWeight: 600, fontFamily: 'Inter, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
            Meeting complete · {fmt(duration)}
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 24, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Q3 Product Roadmap Review
          </div>
        </div>

        {generating && (
          <div style={{ ...g(0.6), borderRadius: 14, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center', background: 'linear-gradient(135deg,rgba(20,184,166,0.08),rgba(99,102,241,0.05))' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(20,184,166,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEAL }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 2 }}>AI is generating your summary…</div>
              <div style={{ height: 4, width: 200, borderRadius: 99, background: 'rgba(148,163,184,0.2)', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: `linear-gradient(90deg,transparent,${TEAL},transparent)`, backgroundSize: '400px 100%', animation: 'shimmer 1.2s infinite', borderRadius: 99 }} />
              </div>
            </div>
          </div>
        )}

        {summaryReady && (
          <div style={{ ...g(0.6), borderRadius: 16, padding: '20px 22px', animation: 'fadeUp 400ms ease', background: 'linear-gradient(135deg,rgba(20,184,166,0.08),rgba(99,102,241,0.04))' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(20,184,166,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEAL }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#0f172a' }}>AI Summary</span>
              <Badge color="teal">Auto-generated</Badge>
            </div>
            <div style={{ fontSize: 14, color: '#334155', fontFamily: 'Inter, sans-serif', lineHeight: 1.8 }}>
              The team aligned on <strong>v2.3 scope</strong> — three features over six weeks: onboarding redesign, token migration, and AI summaries. A <strong>week-two checkpoint</strong> was set to review blockers. Dan finalizes the streaming API tomorrow. Carol owns spec delivery by Thursday. Bob will set up a QA sync for Monday.
            </div>
          </div>
        )}

        {summaryReady && (
          <div style={{ ...g(0.5), borderRadius: 16, padding: 20, animation: 'fadeUp 500ms ease' }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 14 }}>Full Transcript</div>
            <div style={{ maxHeight: 260, overflowY: 'auto' }}>
              {transcript.map((line, i) => <TranscriptLine key={i} line={line} isLast={false} />)}
            </div>
          </div>
        )}
      </div>

      {/* Right */}
      <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {summaryReady && (
          <>
            <div style={{ ...g(0.6), borderRadius: 16, padding: 18, animation: 'fadeUp 450ms ease' }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 12 }}>
                {actions.length} Action Items Detected
              </div>
              {actions.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(148,163,184,0.1)', alignItems: 'flex-start' }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: '1.5px solid #cbd5e1', marginTop: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: '#1e293b', fontWeight: 500, lineHeight: 1.4 }}>{a.text}</div>
                    <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{a.assignee} · {a.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ ...g(0.6), borderRadius: 16, padding: 18, animation: 'fadeUp 500ms ease' }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 10 }}>Attendees</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SPEAKERS.map(name => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={name} size={28} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#334155', fontWeight: 500 }}>{name}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              style={{
                width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: `linear-gradient(135deg,${TEAL},#0d9488)`, color: 'white',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15,
                boxShadow: `0 4px 20px ${TEAL}40`, transition: 'transform 150ms, box-shadow 150ms',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 8px 28px ${TEAL}50`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = `0 4px 20px ${TEAL}40`;
              }}
            >
              Save to Meetings →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function RecordingPage() {
  const [recState, setRecState]         = React.useState<RecState>('idle');
  const [elapsed, setElapsed]           = React.useState(0);
  const [transcript, setTranscript]     = React.useState<TranscriptEntry[]>([]);
  const [detectedActions, setDetectedActions] = React.useState<DetectedAction[]>([]);
  const [toasts, setToasts]             = React.useState<Toast[]>([]);
  const [meetingTitle, setMeetingTitle] = React.useState('Q3 Product Roadmap Review');
  const [editingTitle, setEditingTitle] = React.useState(false);

  const timerRef          = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef      = React.useRef<number>(0);
  const scriptTimeoutsRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const transcriptEndRef  = React.useRef<HTMLDivElement>(null);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  React.useEffect(() => {
    if (transcriptEndRef.current?.parentElement) {
      transcriptEndRef.current.parentElement.scrollTop = transcriptEndRef.current.offsetTop;
    }
  }, [transcript]);

  const startRecording = () => {
    setRecState('recording');
    setElapsed(0);
    setTranscript([]);
    setDetectedActions([]);
    setToasts([]);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 200);

    SCRIPT.forEach(line => {
      const t = setTimeout(() => {
        const ts = fmt(Math.floor((Date.now() - startTimeRef.current) / 1000));
        setTranscript(prev => [...prev, { ...line, timestamp: ts }]);
      }, line.delay);
      scriptTimeoutsRef.current.push(t);
    });

    DETECTED_ACTIONS.forEach(action => {
      const t = setTimeout(() => {
        setDetectedActions(prev => [...prev, action]);
        setToasts(prev => [...prev, { ...action, key: Date.now() }]);
      }, action.delay);
      scriptTimeoutsRef.current.push(t);
    });
  };

  const pauseRecording = () => {
    setRecState('paused');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resumeRecording = () => {
    setRecState('recording');
    startTimeRef.current = Date.now() - elapsed * 1000;
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 200);
  };

  const stopRecording = () => {
    setRecState('stopped');
    if (timerRef.current) clearInterval(timerRef.current);
    scriptTimeoutsRef.current.forEach(clearTimeout);
    scriptTimeoutsRef.current = [];
  };

  const handleMicClick = () => {
    if (recState === 'idle')      startRecording();
    else if (recState === 'recording') pauseRecording();
    else if (recState === 'paused')    resumeRecording();
  };

  const dismissToast = React.useCallback((key: number) => {
    setToasts(prev => prev.filter(t => t.key !== key));
  }, []);

  const isLive = recState === 'recording' || recState === 'paused';
  const bg = recState === 'stopped' ? BG_STOPPED : isLive ? BG_LIVE : BG_IDLE;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      width: '100vw', height: '100vh',
      background: bg,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      transition: 'background 800ms ease',
      fontFamily: 'Inter, sans-serif',
      WebkitFontSmoothing: 'antialiased',
    } as React.CSSProperties}>

      {/* Noise texture overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.6,
        backgroundImage: NOISE_SVG,
        backgroundSize: '256px',
      }} />

      {/* All UI above noise */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{
          ...g(0.45),
          borderBottom: '1px solid rgba(255,255,255,0.6)',
          borderRadius: 0,
          padding: '0 28px', flexShrink: 0, height: 62,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: `linear-gradient(135deg,${TEAL},#0d9488)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                <path d="M19 10v2a7 7 0 01-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 15, color: '#0f172a' }}>NoteAI</span>
          </div>

          {/* Title */}
          <div style={{ flex: 1 }}>
            {editingTitle ? (
              <input
                value={meetingTitle}
                onChange={e => setMeetingTitle(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                autoFocus
                style={{
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, color: '#0f172a',
                  border: 'none', background: 'transparent',
                  outline: `2px solid ${TEAL}55`, borderRadius: 6, padding: '2px 8px',
                }}
              />
            ) : (
              <div
                onClick={() => recState === 'idle' && setEditingTitle(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: recState === 'idle' ? 'text' : 'default' }}
              >
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, color: '#0f172a' }}>{meetingTitle}</span>
                {recState === 'idle' && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                )}
              </div>
            )}
          </div>

          <Avatars names={SPEAKERS} size={28} />

          {recState === 'recording' && <Badge color="teal"  dot>Recording</Badge>}
          {recState === 'paused'    && <Badge color="amber" dot>Paused</Badge>}
          {recState === 'stopped'   && <Badge color="green" dot>Complete</Badge>}

          {isLive && (
            <button
              onClick={stopRecording}
              style={{
                padding: '7px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6, transition: 'background 150ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
            >
              <svg width="10" height="10" viewBox="0 0 10 10"><rect width="10" height="10" rx="2" fill="#ef4444" /></svg>
              Stop
            </button>
          )}
        </div>

        {/* Content */}
        {recState === 'stopped' ? (
          <SummaryScreen transcript={transcript} actions={detectedActions} duration={elapsed} />
        ) : (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

            {/* Center — mic + wave */}
            <div style={{
              width: isLive ? 280 : '100%', flexShrink: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 28, transition: 'width 500ms cubic-bezier(0.4,0,0.2,1)',
              padding: '32px 24px',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#475569', fontFamily: 'Inter, sans-serif', marginBottom: 6 }}>
                  {recState === 'idle' ? 'Ready to record' : recState === 'paused' ? 'Recording paused' : 'Recording in progress'}
                </div>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 800,
                  fontSize: isLive ? 42 : 52,
                  color: recState === 'recording' ? TEAL : recState === 'paused' ? '#f59e0b' : '#475569',
                  letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums',
                  transition: 'color 300ms, font-size 300ms',
                }}>
                  {fmt(elapsed)}
                </div>
              </div>

              <MicButton state={recState} onClick={handleMicClick} />

              <WaveViz active={recState === 'recording'} color={TEAL} height={36} bars={32} />

              {!isLive && (
                <div style={{ textAlign: 'center', maxWidth: 260 }}>
                  <div style={{ fontSize: 13.5, color: '#64748b', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
                    {recState === 'idle'
                      ? 'Tap the mic to start recording. AI will transcribe and detect action items in real time.'
                      : ''}
                  </div>
                </div>
              )}

              {isLive && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'Inter, sans-serif', textAlign: 'center', marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>Speakers</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    {SPEAKERS.map((name, idx) => {
                      const isActive = transcript.length > 0 && transcript[transcript.length - 1].speaker === name && recState === 'recording';
                      const c = SPEAKER_COLORS[idx];
                      return (
                        <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <div style={{ position: 'relative' }}>
                            {isActive && (
                              <div className="pulse-ring" style={{
                                position: 'absolute', width: 32, height: 32, borderRadius: '50%',
                                border: `1.5px solid ${c}`, top: 0, left: 0,
                              }} />
                            )}
                            <Avatar name={name} size={32} />
                          </div>
                          <span style={{
                            fontSize: 10.5, fontFamily: 'Inter, sans-serif',
                            color: isActive ? c : '#94a3b8',
                            fontWeight: isActive ? 600 : 400,
                            transition: 'color 200ms',
                          }}>{name}</span>
                        </div>
                      );
                    })}
                  </div>

                  {detectedActions.length > 0 && (
                    <div style={{
                      marginTop: 8, padding: '10px 14px', borderRadius: 12,
                      background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)',
                      textAlign: 'center',
                    }}>
                      <span style={{ fontSize: 13, color: TEAL, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                        {detectedActions.length} action item{detectedActions.length > 1 ? 's' : ''} detected
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right — live transcript */}
            {isLive && (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                borderLeft: '1px solid rgba(255,255,255,0.5)', overflow: 'hidden',
              }}>
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 16px' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
                    Live Transcript
                  </div>
                  {transcript.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#cbd5e1', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
                      Waiting for speech…
                    </div>
                  )}
                  {transcript.map((line, i) => (
                    <TranscriptLine
                      key={i}
                      line={line}
                      isLast={i === transcript.length - 1 && recState === 'recording'}
                    />
                  ))}
                  <div ref={transcriptEndRef} />
                </div>

                {toasts.length > 0 && (
                  <div style={{ padding: '8px 24px 16px', flexShrink: 0 }}>
                    {toasts.map(toast => (
                      <ActionToast key={toast.key} action={toast} onDismiss={() => dismissToast(toast.key)} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
