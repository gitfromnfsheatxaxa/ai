// Dashboard Page — 3 variants

const MEETINGS_RECENT = [
  { id: 1, title: 'Q3 Product Roadmap Review', time: '10:00 AM', duration: '52 min', attendees: ['Alice','Bob','Carol','Dan'], status: 'completed', actions: 4, summary: 'Aligned on v2.3 launch timeline. Carol to finalize specs.' },
  { id: 2, title: 'Design System Sprint Planning', time: '1:30 PM', duration: '38 min', attendees: ['Eve','Frank'], status: 'completed', actions: 2, summary: 'Token migration scoped for 2 weeks. Eve leads.' },
  { id: 3, title: 'Investor Update Prep', time: '3:00 PM', duration: '24 min', attendees: ['Alice','Grace','Hank'], status: 'in-progress', actions: 0, summary: '' },
];

const ACTIONS_DUE = [
  { id: 1, text: 'Finalize v2.3 feature specs', assignee: 'Carol', due: 'Today', priority: 'high' },
  { id: 2, text: 'Review token migration PR', assignee: 'Eve', due: 'Tomorrow', priority: 'medium' },
  { id: 3, text: 'Draft investor deck slide 4', assignee: 'Alice', due: 'Fri', priority: 'high' },
  { id: 4, text: 'Share onboarding flow doc', assignee: 'Frank', due: 'Fri', priority: 'low' },
];

// ── V1: Pearl ─────────────────────────────────────────────────────
function DashboardPearl({ onNavigate }) {
  return (
    <div style={{ display: 'flex', height: '100%', gap: 20 }}>
      {/* Main column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
        {/* Welcome */}
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', color: '#0f172a' }}>Good morning, Alex ☀️</div>
          <div style={{ fontSize: 13.5, color: '#64748b', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>3 meetings today · 6 open actions</div>
        </div>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { label: 'Meetings this week', value: '12', delta: 8 },
            { label: 'Actions completed', value: '34', delta: 15 },
            { label: 'Avg. meeting length', value: '41m', delta: -6 },
            { label: 'AI summaries', value: '12', delta: 20 },
          ].map((s, i) => (
            <GlassCard key={i} style={{ padding: '16px 18px' }}>
              <Stat {...s} />
            </GlassCard>
          ))}
        </div>
        {/* Today's meetings */}
        <GlassCard style={{ padding: 20, flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, color: '#0f172a' }}>Today's Meetings</div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('meetings')}>View all</Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MEETINGS_RECENT.map(m => (
              <div key={m.id} onClick={() => onNavigate('detail')} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
                background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.7)',
                borderRadius: 12, cursor: 'pointer', transition: 'all 200ms',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.75)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: m.status === 'in-progress' ? 'rgba(20,184,166,0.15)' : 'rgba(148,163,184,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: m.status === 'in-progress' ? DS.teal : '#94a3b8',
                }}>
                  <Icon.mic />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 13.5, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2, display: 'flex', gap: 10 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon.clock />{m.time}</span>
                    <span>{m.duration}</span>
                  </div>
                </div>
                <AvatarGroup names={m.attendees} size={24} />
                <Badge color={m.status === 'in-progress' ? 'teal' : 'slate'} dot>{m.status === 'in-progress' ? 'Live' : 'Done'}</Badge>
                {m.actions > 0 && <Badge color="amber">{m.actions} actions</Badge>}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
      {/* Sidebar */}
      <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* AI insight */}
        <GlassCard style={{ padding: 16, background: 'linear-gradient(135deg, rgba(20,184,166,0.1), rgba(99,102,241,0.07))' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(20,184,166,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: DS.teal, flexShrink: 0 }}><Icon.ai /></div>
            <div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 13, color: '#0f172a', marginBottom: 4 }}>AI Insight</div>
              <div style={{ fontSize: 12.5, color: '#475569', fontFamily: 'Inter, sans-serif', lineHeight: 1.55 }}>3 action items from this morning are overdue. Carol's items have the highest priority. Consider following up.</div>
            </div>
          </div>
        </GlassCard>
        {/* Open actions */}
        <GlassCard style={{ padding: 16, flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14, color: '#0f172a' }}>Open Actions</div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('actions')}>Board →</Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ACTIONS_DUE.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.45)' }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: '1.5px solid #cbd5e1', marginTop: 1, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontFamily: 'Inter, sans-serif', color: '#1e293b', lineHeight: 1.4 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{a.assignee} · {a.due}</div>
                </div>
                <Badge color={a.priority === 'high' ? 'red' : a.priority === 'medium' ? 'amber' : 'slate'}>{a.priority}</Badge>
              </div>
            ))}
          </div>
        </GlassCard>
        {/* Quick record */}
        <Button variant="primary" size="lg" icon={<Icon.mic />} style={{ width: '100%', justifyContent: 'center', borderRadius: 12, padding: '14px' }}>
          Start Recording
        </Button>
      </div>
    </div>
  );
}

// ── V2: Glacier ────────────────────────────────────────────────────
function DashboardGlacier({ onNavigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, height: '100%' }}>
      {/* Hero top row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {/* Large meeting card */}
        <GlassCard variant="glacier" style={{ padding: 22, gridColumn: 'span 2', background: 'linear-gradient(135deg, rgba(15,23,42,0.06) 0%, rgba(20,184,166,0.08) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Badge color="teal" dot>Live Now</Badge>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 20, color: '#0f172a', marginTop: 10, marginBottom: 4 }}>Investor Update Prep</div>
              <div style={{ fontSize: 13, color: '#64748b', fontFamily: 'Inter, sans-serif' }}>Started 3:00 PM · 24 min elapsed</div>
              <AvatarGroup names={['Alice','Grace','Hank']} size={28} style={{ marginTop: 12 }} />
            </div>
            <Button variant="primary" icon={<Icon.mic />}>Join</Button>
          </div>
          <div style={{ marginTop: 18, padding: '12px 14px', background: 'rgba(20,184,166,0.08)', borderRadius: 10, border: '1px solid rgba(20,184,166,0.15)' }}>
            <div style={{ fontSize: 11, color: DS.teal, fontFamily: 'Inter, sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Live AI Transcription</div>
            <div style={{ fontSize: 13, color: '#334155', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, fontStyle: 'italic' }}>"...the Series B metrics show strong retention at 94%, and we should highlight the NPS improvement from Q2..."</div>
          </div>
        </GlassCard>
        {/* Stats column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[{ label: 'This week', value: '12', sub: 'meetings' }, { label: 'Completed', value: '34', sub: 'actions' }, { label: 'Avg. length', value: '41m', sub: 'per meeting' }].map((s, i) => (
            <GlassCard key={i} variant="glacier" style={{ padding: '14px 16px', flex: 1 }}>
              <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', color: '#0f172a', lineHeight: 1.1, margin: '4px 0 2px' }}>{s.value}</div>
              <div style={{ fontSize: 11.5, color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>{s.sub}</div>
            </GlassCard>
          ))}
        </div>
      </div>
      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 }}>
        <GlassCard variant="glacier" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, marginBottom: 14, color: '#0f172a' }}>Recent Meetings</div>
          {MEETINGS_RECENT.filter(m => m.status === 'completed').map(m => (
            <div key={m.id} onClick={() => onNavigate('detail')} style={{ padding: '10px 0', borderBottom: '1px solid rgba(148,163,184,0.12)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500, fontFamily: 'Inter, sans-serif', color: '#1e293b' }}>{m.title}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{m.time} · {m.duration}</div>
              </div>
              {m.actions > 0 && <Badge color="amber">{m.actions}</Badge>}
            </div>
          ))}
        </GlassCard>
        <GlassCard variant="glacier" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, color: '#0f172a' }}>Action Items</div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('actions')}>Board →</Button>
          </div>
          {ACTIONS_DUE.map(a => (
            <div key={a.id} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: '1px solid rgba(148,163,184,0.1)', alignItems: 'center' }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${a.priority === 'high' ? '#ef4444' : '#cbd5e1'}`, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 13, fontFamily: 'Inter, sans-serif', color: '#334155' }}>{a.text}</div>
              <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{a.due}</div>
            </div>
          ))}
        </GlassCard>
      </div>
    </div>
  );
}

// ── V3: Aurora ─────────────────────────────────────────────────────
function DashboardAurora({ onNavigate }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, height: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: 'Inter, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', color: DS.teal, fontWeight: 600, marginBottom: 4 }}>Friday, April 25</div>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'DM Sans, sans-serif', color: '#0f172a', letterSpacing: '-0.02em' }}>Alex's Dashboard</div>
          </div>
          <Button variant="primary" icon={<Icon.mic />} size="lg">New Recording</Button>
        </div>
        {/* Timeline */}
        <GlassCard variant="aurora" style={{ padding: 22, flex: 1, background: 'rgba(15,23,42,0.04)' }}>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Icon.calendar /> Today's Timeline</div>
          <div style={{ position: 'relative', paddingLeft: 24 }}>
            <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, rgba(20,184,166,0.5), rgba(20,184,166,0.05))' }} />
            {MEETINGS_RECENT.map((m, i) => (
              <div key={m.id} style={{ marginBottom: i < MEETINGS_RECENT.length - 1 ? 20 : 0, position: 'relative', cursor: 'pointer' }} onClick={() => onNavigate('detail')}>
                <div style={{ position: 'absolute', left: -20, top: 6, width: 10, height: 10, borderRadius: '50%', background: m.status === 'in-progress' ? DS.teal : '#e2e8f0', border: `2px solid ${m.status === 'in-progress' ? DS.teal : '#cbd5e1'}` }} />
                <div style={{ padding: '12px 14px', borderRadius: 12, background: m.status === 'in-progress' ? 'rgba(20,184,166,0.1)' : 'rgba(255,255,255,0.45)', border: `1px solid ${m.status === 'in-progress' ? 'rgba(20,184,166,0.25)' : 'rgba(255,255,255,0.6)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{m.title}</div>
                      <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>{m.time} · {m.duration}</div>
                      {m.summary && <div style={{ fontSize: 12, color: '#475569', marginTop: 6, lineHeight: 1.5, fontStyle: 'italic' }}>"{m.summary}"</div>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <Badge color={m.status === 'in-progress' ? 'teal' : 'slate'} dot>{m.status === 'in-progress' ? 'Live' : 'Done'}</Badge>
                      {m.actions > 0 && <Badge color="amber">{m.actions} actions</Badge>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
      {/* Right panel — aurora dark */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <GlassCard variant="aurora" style={{ padding: 20, background: 'linear-gradient(160deg, rgba(15,23,42,0.7), rgba(20,40,60,0.75))', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(20,184,166,0.9)', fontWeight: 600, marginBottom: 12, fontFamily: 'Inter, sans-serif' }}>AI Summary</div>
          {[{ pct: 78, label: 'Action rate', color: DS.teal }, { pct: 94, label: 'Transcript accuracy', color: '#6366f1' }, { pct: 61, label: 'Meeting efficiency', color: '#f59e0b' }].map((s, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>{s.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.pct}%</span>
              </div>
              <ProgressBar value={s.pct} color={s.color} height={5} glass />
            </div>
          ))}
        </GlassCard>
        <GlassCard variant="aurora" style={{ padding: 20, flex: 1, background: 'rgba(255,255,255,0.08)' }}>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14, color: '#0f172a', marginBottom: 12 }}>Priority Actions</div>
          {ACTIONS_DUE.filter(a => a.priority === 'high').map(a => (
            <div key={a.id} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: '#1e293b', fontWeight: 500 }}>{a.text}</div>
              <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4 }}>{a.assignee} · Due {a.due}</div>
            </div>
          ))}
          {ACTIONS_DUE.filter(a => a.priority !== 'high').map(a => (
            <div key={a.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(148,163,184,0.1)', alignItems: 'center' }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, border: '1.5px solid #cbd5e1', flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 12.5, fontFamily: 'Inter, sans-serif', color: '#334155' }}>{a.text}</div>
            </div>
          ))}
        </GlassCard>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardPearl, DashboardGlacier, DashboardAurora });
