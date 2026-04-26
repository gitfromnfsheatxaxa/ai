'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

type RecState = 'idle' | 'recording' | 'processing' | 'done' | 'error';

interface Result {
  transcript:   string;
  summary:      string;
  decisions:    string[];
  topics:       string[];
  project_tag:  string;
  action_items: { task: string; assignee: string; priority: string }[];
  meetingId:    string | null;
}

const TEAL = '#14b8a6';

const BG_IDLE    = 'radial-gradient(ellipse at 20% 40%, rgba(20,184,166,0.08) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(148,163,184,0.08) 0%, transparent 50%), #f0f4f8';
const BG_LIVE    = 'radial-gradient(ellipse at 20% 50%, rgba(20,184,166,0.15) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.08) 0%, transparent 50%), #eef8f7';
const BG_STOPPED = 'radial-gradient(ellipse at 30% 40%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(20,184,166,0.07) 0%, transparent 50%), #f2f0f8';

const g = (op = 0.55): React.CSSProperties => ({
  background:          `rgba(255,255,255,${op})`,
  backdropFilter:      'blur(24px)',
  WebkitBackdropFilter:'blur(24px)',
  border:              '1px solid rgba(255,255,255,0.75)',
  boxShadow:           '0 2px 20px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
});

// ── Wave visualiser ──────────────────────────────────────────────────────────────
const BARS = 32;
const barHeights = Array.from({ length: BARS }, (_, i) =>
  Math.max(4, 8 + Math.sin(i * 0.7) * 14 + Math.random() * 8)
);

function WaveViz({ active }: { active: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 36 }}>
      {barHeights.map((h, i) => (
        <div
          key={i}
          className={active ? 'wave-bar' : ''}
          style={({
            width: 3, borderRadius: 99,
            height: active ? h : 4,
            background: active ? TEAL : 'rgba(20,184,166,0.3)',
            '--dur':   `${0.5 + (i * 0.02) % 0.7}s`,
            '--delay': `${(i / BARS) * 0.6}s`,
            transition: 'height 400ms ease, background 400ms ease',
          }) as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ── Mic button ───────────────────────────────────────────────────────────────────
function MicButton({ state, onClick }: { state: RecState; onClick: () => void }) {
  const isRec = state === 'recording';
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
          : 'linear-gradient(135deg, #0f172a, #1e293b)',
        boxShadow: isRec
          ? `0 0 0 8px ${TEAL}25, 0 8px 32px ${TEAL}50`
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
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
            <path d="M19 10v2a7 7 0 01-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8"  y1="23" x2="16" y2="23" />
          </svg>
        )}
      </button>
    </div>
  );
}

// ── Result screen ────────────────────────────────────────────────────────────────
function ResultScreen({ result, duration, onReset }: { result: Result; duration: number; onReset: () => void }) {
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const router = useRouter();

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '28px 28px 40px', display: 'flex', gap: 20 }}>
      {/* Left */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: TEAL, fontWeight: 600, fontFamily: 'Inter, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
            Meeting complete · {fmt(duration)}
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 22, color: '#0f172a', letterSpacing: '-0.02em' }}>
            {result.project_tag || 'Meeting Notes'}
          </div>
          {result.topics.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {result.topics.map(t => (
                <span key={t} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(20,184,166,0.1)', color: '#0d9488' }}>{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* AI Summary */}
        {result.summary && (
          <div style={{ ...g(0.6), borderRadius: 16, padding: '20px 22px', background: 'linear-gradient(135deg,rgba(20,184,166,0.08),rgba(99,102,241,0.04))' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(20,184,166,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEAL }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#0f172a' }}>AI Summary</span>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(20,184,166,0.12)', color: '#0d9488' }}>Auto-generated</span>
            </div>
            <div style={{ fontSize: 14, color: '#334155', fontFamily: 'Inter, sans-serif', lineHeight: 1.8 }}>
              {result.summary}
            </div>
          </div>
        )}

        {/* Decisions */}
        {result.decisions.length > 0 && (
          <div style={{ ...g(0.5), borderRadius: 16, padding: 20 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 10 }}>Key Decisions</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {result.decisions.map((d, i) => (
                <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13.5, color: '#334155', fontFamily: 'Inter, sans-serif' }}>
                  <span style={{ color: TEAL, flexShrink: 0 }}>•</span>{d}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Full Transcript */}
        <div style={{ ...g(0.5), borderRadius: 16, padding: 20 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 12 }}>Full Transcript</div>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            <p style={{ fontSize: 13.5, color: '#475569', fontFamily: 'Inter, sans-serif', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
              {result.transcript}
            </p>
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{ width: 290, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Action items */}
        <div style={{ ...g(0.6), borderRadius: 16, padding: 18 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 12 }}>
            {result.action_items.length} Action Item{result.action_items.length !== 1 ? 's' : ''} Detected
          </div>
          {result.action_items.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>No action items detected.</p>
          ) : (
            result.action_items.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(148,163,184,0.1)', alignItems: 'flex-start' }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: '1.5px solid #cbd5e1', marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: '#1e293b', fontWeight: 500, lineHeight: 1.4 }}>{a.task}</div>
                  {a.assignee && <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{a.assignee}</div>}
                </div>
                <span style={{
                  fontSize: 10.5, padding: '1px 7px', borderRadius: 99, flexShrink: 0,
                  background: a.priority === 'high' ? 'rgba(239,68,68,0.1)' : a.priority === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(148,163,184,0.12)',
                  color:      a.priority === 'high' ? '#dc2626'            : a.priority === 'medium' ? '#d97706'             : '#64748b',
                }}>{a.priority}</span>
              </div>
            ))
          )}
        </div>

        {/* Saved indicator */}
        {result.meetingId && (
          <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ fontSize: 13, color: TEAL, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Saved to your meetings</span>
          </div>
        )}

        <button
          onClick={() => result.meetingId ? router.push(`/meetings/${result.meetingId}`) : router.push('/meetings')}
          style={{
            width: '100%', padding: '13px', borderRadius: 14, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg,${TEAL},#0d9488)`, color: 'white',
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15,
            boxShadow: `0 4px 20px ${TEAL}40`,
          }}
        >
          {result.meetingId ? 'View in Meetings →' : 'Go to Meetings →'}
        </button>

        <button
          onClick={onReset}
          style={{
            width: '100%', padding: '11px', borderRadius: 14, border: '1px solid rgba(148,163,184,0.3)',
            background: 'rgba(255,255,255,0.5)', color: '#64748b', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14,
          }}
        >
          Record another
        </button>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────────
export default function RecordingPage() {
  const { user } = useAuthStore();
  const [recState, setRecState] = React.useState<RecState>('idle');
  const [elapsed,  setElapsed]  = React.useState(0);
  const [result,   setResult]   = React.useState<Result | null>(null);
  const [errMsg,   setErrMsg]   = React.useState('');

  const mediaRef    = React.useRef<MediaRecorder | null>(null);
  const chunksRef   = React.useRef<Blob[]>([]);
  const timerRef    = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef    = React.useRef<number>(0);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const startTimer = () => {
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 200);
  };

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const handleMicClick = async () => {
    if (recState !== 'idle') return;
    setErrMsg('');
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        stopTimer();
        const dur  = Math.floor((Date.now() - startRef.current) / 1000);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });

        setRecState('processing');

        try {
          const fd = new FormData();
          // Use the mime type to determine file extension
          const mime = recorder.mimeType || 'audio/webm';
          const ext  = mime.includes('mp4') ? 'mp4' : mime.includes('ogg') ? 'ogg' : 'webm';
          fd.append('audio',    blob, `recording.${ext}`);
          fd.append('duration', String(dur));
          if (user?.id) fd.append('userAiId', user.id);

          const res  = await fetch('/api/record', { method: 'POST', body: fd });
          const data = await res.json();

          if (!res.ok) throw new Error(data.error || 'Processing failed');

          setResult(data);
          setRecState('done');
        } catch (err: any) {
          setErrMsg(err.message || 'Something went wrong.');
          setRecState('error');
        }
      };

      recorder.start(1000); // collect data every 1s
      mediaRef.current = recorder;
      setElapsed(0);
      startTimer();
      setRecState('recording');
    } catch (err: any) {
      setErrMsg(err.message.includes('Permission') || err.message.includes('denied')
        ? 'Microphone access denied. Please allow microphone access and try again.'
        : err.message);
      setRecState('error');
    }
  };

  const handleStop = () => {
    mediaRef.current?.stop();
  };

  const handleReset = () => {
    setRecState('idle');
    setElapsed(0);
    setResult(null);
    setErrMsg('');
  };

  const bg = recState === 'done' || recState === 'error'
    ? BG_STOPPED
    : recState === 'recording' || recState === 'processing'
    ? BG_LIVE
    : BG_IDLE;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      width: '100vw', height: '100vh',
      background: bg, display: 'flex', flexDirection: 'column',
      overflow: 'hidden', transition: 'background 800ms ease',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Noise overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.5,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
        backgroundSize: '256px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{
          ...g(0.45), borderBottom: '1px solid rgba(255,255,255,0.6)',
          borderRadius: 0, padding: '0 28px', flexShrink: 0, height: 62,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg,${TEAL},#0d9488)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                <path d="M19 10v2a7 7 0 01-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8"  y1="23" x2="16" y2="23" />
              </svg>
            </div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 15, color: '#0f172a' }}>NoteAI</span>
          </div>

          <div style={{ flex: 1 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
              {recState === 'done' ? 'Meeting Complete' : recState === 'processing' ? 'Processing…' : 'New Recording'}
            </span>
          </div>

          {recState === 'recording' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(20,184,166,0.12)', color: '#0d9488', padding: '3px 9px', borderRadius: 99, fontSize: 12, fontWeight: 500 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: TEAL }} />Recording
            </span>
          )}
          {recState === 'done' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(16,185,129,0.12)', color: '#059669', padding: '3px 9px', borderRadius: 99, fontSize: 12, fontWeight: 500 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />Complete
            </span>
          )}

          {recState === 'recording' && (
            <button onClick={handleStop} style={{
              padding: '7px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'rgba(239,68,68,0.1)', color: '#ef4444',
              fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10"><rect width="10" height="10" rx="2" fill="#ef4444"/></svg>
              Stop
            </button>
          )}
        </div>

        {/* Content */}
        {recState === 'done' && result ? (
          <ResultScreen result={result} duration={elapsed} onReset={handleReset} />
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 28, padding: '32px 24px' }}>

            {recState === 'processing' ? (
              <>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(20,184,166,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <line x1="12" y1="2" x2="12" y2="6"/>
                    <line x1="12" y1="18" x2="12" y2="22"/>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                    <line x1="2" y1="12" x2="6" y2="12"/>
                    <line x1="18" y1="12" x2="22" y2="12"/>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
                  </svg>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 18, color: '#0f172a', marginBottom: 6 }}>Transcribing your audio…</div>
                  <div style={{ fontSize: 13.5, color: '#64748b', fontFamily: 'Inter, sans-serif' }}>This usually takes a few seconds</div>
                </div>
              </>
            ) : recState === 'error' ? (
              <>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <div style={{ textAlign: 'center', maxWidth: 320 }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 18, color: '#0f172a', marginBottom: 8 }}>Something went wrong</div>
                  <div style={{ fontSize: 13.5, color: '#64748b', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>{errMsg}</div>
                </div>
                <button onClick={handleReset} style={{ padding: '12px 28px', borderRadius: 12, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg,${TEAL},#0d9488)`, color: 'white', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14 }}>
                  Try again
                </button>
              </>
            ) : (
              <>
                {/* Timer */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: '#475569', fontFamily: 'Inter, sans-serif', marginBottom: 6 }}>
                    {recState === 'idle' ? 'Ready to record' : 'Recording in progress'}
                  </div>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 800,
                    fontSize: recState === 'recording' ? 42 : 52,
                    color: recState === 'recording' ? TEAL : '#475569',
                    letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums',
                    transition: 'color 300ms, font-size 300ms',
                  }}>
                    {fmt(elapsed)}
                  </div>
                </div>

                <MicButton state={recState} onClick={handleMicClick} />
                <WaveViz active={recState === 'recording'} />

                {recState === 'idle' && (
                  <div style={{ textAlign: 'center', maxWidth: 280 }}>
                    <div style={{ fontSize: 13.5, color: '#64748b', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
                      Tap the mic to start recording. Your speech will be transcribed and analyzed automatically.
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .wave-bar { transform-origin: center; animation: waveBar var(--dur) ease-in-out infinite; animation-delay: var(--delay); }
        .pulse-ring { animation: pulseRing 1.8s ease-out infinite; }
        @keyframes pulseRing { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1.9); opacity: 0; } }
        @keyframes waveBar { 0%, 100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }
      `}</style>
    </div>
  );
}
