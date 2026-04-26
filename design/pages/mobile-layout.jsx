// Mobile App Layout — full mobile UI for phone frame

const MOBILE_NAV = [
  { id:'home',     label:'Home',     icon:'home'     },
  { id:'meetings', label:'Meetings', icon:'calendar' },
  { id:'record',   label:'Record',   icon:'mic',     special:true },
  { id:'actions',  label:'Actions',  icon:'check'    },
  { id:'projects', label:'Projects', icon:'folder'   },
];

// Mobile Home
function MobileHome({ accent }) {
  return (
    <div style={{ padding:'16px 16px 0', display:'flex', flexDirection:'column', gap:14 }}>
      <div>
        <div style={{ fontSize:12, color:accent, fontFamily:'Inter,sans-serif', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>Friday, Apr 25</div>
        <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:800, fontSize:22, color:'#0f172a', letterSpacing:'-0.02em', marginTop:2 }}>Good morning ☀️</div>
      </div>
      {/* Live meeting banner */}
      <div style={{ background:`linear-gradient(135deg,${accent}18,${accent}08)`, border:`1px solid ${accent}30`, borderRadius:14, padding:'14px 16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
          <Badge color="teal" dot>Live Now</Badge>
          <span style={{ fontSize:12, color:'#64748b', fontFamily:'Inter,sans-serif' }}>24 min</span>
        </div>
        <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:15, color:'#0f172a' }}>Investor Update Prep</div>
        <div style={{ fontSize:12, color:'#64748b', marginTop:4, fontFamily:'Inter,sans-serif', lineHeight:1.5 }}>"...Series B retention at 94%..."</div>
        <div style={{ marginTop:10 }}><AvatarGroup names={['Alice','Grace','Hank']} size={22} /></div>
      </div>
      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {[{ v:'12', l:'Meetings' },{ v:'6', l:'Open actions' },{ v:'34', l:'Completed' },{ v:'41m', l:'Avg length' }].map((s,i) => (
          <GlassCard key={i} style={{ padding:'12px 14px' }}>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:22, color:'#0f172a' }}>{s.v}</div>
            <div style={{ fontSize:11.5, color:'#94a3b8', fontFamily:'Inter,sans-serif', marginTop:2 }}>{s.l}</div>
          </GlassCard>
        ))}
      </div>
      {/* Recent */}
      <div>
        <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:14, color:'#0f172a', marginBottom:10 }}>Recent Meetings</div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[
            { title:'Q3 Product Roadmap Review', time:'10:00 AM', dur:'52m', status:'completed', actions:4 },
            { title:'Design System Sprint', time:'1:30 PM', dur:'38m', status:'completed', actions:2 },
          ].map((m,i) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'11px 13px', background:'rgba(255,255,255,0.55)', borderRadius:12, border:'1px solid rgba(255,255,255,0.7)', alignItems:'center' }}>
              <div style={{ width:34,height:34,borderRadius:9,background:'rgba(148,163,184,0.12)',display:'flex',alignItems:'center',justifyContent:'center',color:'#94a3b8',flexShrink:0 }}><Icon.mic /></div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:'Inter,sans-serif', fontWeight:500, fontSize:13, color:'#1e293b', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m.title}</div>
                <div style={{ fontSize:11.5, color:'#94a3b8', marginTop:2 }}>{m.time} · {m.dur}</div>
              </div>
              {m.actions > 0 && <Badge color="amber">{m.actions}</Badge>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Mobile Meetings
function MobileMeetings({ accent }) {
  const [search, setSearch] = React.useState('');
  const items = [
    { title:'Q3 Product Roadmap Review', date:'Today', dur:'52m', attendees:['Alice','Bob','Carol'], actions:4 },
    { title:'Design System Sprint Planning', date:'Today', dur:'38m', attendees:['Eve','Frank'], actions:2 },
    { title:'Investor Update Prep', date:'Today', dur:'24m', attendees:['Alice','Grace'], actions:0, live:true },
    { title:'Engineering Sync', date:'Yesterday', dur:'45m', attendees:['Bob','Ivan'], actions:3 },
    { title:'Customer Feedback Review', date:'Yesterday', dur:'60m', attendees:['Carol','Alice'], actions:5 },
  ];
  const shown = items.filter(m => !search || m.title.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ padding:'16px 16px 0', display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:800, fontSize:22, color:'#0f172a' }}>Meetings</div>
      <Input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} icon={<Icon.search />} />
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {shown.map((m,i) => (
          <div key={i} style={{ padding:'13px 14px', background: m.live?`${accent}0e`:'rgba(255,255,255,0.55)', border:`1px solid ${m.live?accent+'30':'rgba(255,255,255,0.7)'}`, borderRadius:13 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
              <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:14, color:'#0f172a', flex:1, marginRight:8 }}>{m.title}</div>
              {m.live ? <Badge color="teal" dot>Live</Badge> : m.actions>0 ? <Badge color="amber">{m.actions}</Badge> : null}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, color:'#94a3b8', fontFamily:'Inter,sans-serif' }}>{m.date} · {m.dur}</span>
              <AvatarGroup names={m.attendees} size={20} max={3} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mobile Actions
function MobileActions({ accent }) {
  const [items, setItems] = React.useState([
    { id:1, text:'Finalize v2.3 feature specs', assignee:'Carol', due:'Today', priority:'high', done:false },
    { id:2, text:'Draft investor deck slide 4', assignee:'Alice', due:'Today', priority:'high', done:false },
    { id:3, text:'Review token migration PR', assignee:'Bob', due:'Tomorrow', priority:'medium', done:false },
    { id:4, text:'Share onboarding flow doc', assignee:'Frank', due:'Fri', priority:'low', done:false },
    { id:5, text:'Share checkpoint plan', assignee:'Alice', due:'Done', priority:'low', done:true },
  ]);
  const toggle = id => setItems(prev => prev.map(a => a.id===id ? {...a,done:!a.done} : a));
  return (
    <div style={{ padding:'16px 16px 0', display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:800, fontSize:22, color:'#0f172a' }}>Actions</div>
        <Badge color="amber">{items.filter(a=>!a.done).length} open</Badge>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {items.map(a => (
          <div key={a.id} onClick={()=>toggle(a.id)} style={{
            display:'flex', gap:12, padding:'12px 14px', borderRadius:13, cursor:'pointer',
            background: a.done?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.6)',
            border:`1px solid ${a.done?'rgba(226,232,240,0.4)':'rgba(255,255,255,0.8)'}`,
            transition:'all 180ms', alignItems:'center',
          }}>
            <div style={{ width:20,height:20,borderRadius:6,border:`2px solid ${a.done?accent:'#cbd5e1'}`,flexShrink:0,
              background:a.done?accent:'transparent',display:'flex',alignItems:'center',justifyContent:'center',color:'white',transition:'all 180ms' }}>
              {a.done && <Icon.check />}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13.5,fontFamily:'Inter,sans-serif',color:a.done?'#94a3b8':'#1e293b',textDecoration:a.done?'line-through':'none',fontWeight:500 }}>{a.text}</div>
              <div style={{ fontSize:11.5,color:'#94a3b8',marginTop:3 }}>{a.assignee} · {a.due}</div>
            </div>
            <Badge color={a.priority==='high'?'red':a.priority==='medium'?'amber':'slate'}>{a.priority}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mobile Projects
function MobileProjects({ accent }) {
  const projs = [
    { name:'Product', meetings:14, actions:4, color:'#14b8a6', progress:68, members:['Alice','Carol','Bob'] },
    { name:'Design System', meetings:8, actions:2, color:'#6366f1', progress:45, members:['Eve','Frank'] },
    { name:'Engineering', meetings:11, actions:3, color:'#3b82f6', progress:72, members:['Bob','Ivan'] },
    { name:'Finance', meetings:5, actions:1, color:'#f59e0b', progress:90, members:['Alice','Grace'] },
  ];
  return (
    <div style={{ padding:'16px 16px 0', display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:800, fontSize:22, color:'#0f172a' }}>Projects</div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {projs.map((p,i) => (
          <GlassCard key={i} style={{ padding:16, borderLeft:`3px solid ${p.color}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:15, color:'#0f172a' }}>{p.name}</div>
              <span style={{ fontFamily:'DM Sans,sans-serif', fontWeight:800, fontSize:18, color:p.color }}>{p.progress}%</span>
            </div>
            <ProgressBar value={p.progress} color={p.color} height={5} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10 }}>
              <AvatarGroup names={p.members} size={22} max={3} />
              <span style={{ fontSize:12, color:'#94a3b8', fontFamily:'Inter,sans-serif' }}>{p.meetings} mtgs · {p.actions} open</span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// Mobile Record Screen
function MobileRecord({ accent }) {
  const [recording, setRecording] = React.useState(false);
  const [secs, setSecs] = React.useState(0);
  React.useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSecs(s => s+1), 1000);
    return () => clearInterval(t);
  }, [recording]);
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  return (
    <div style={{ padding:'24px 20px 0', display:'flex', flexDirection:'column', alignItems:'center', gap:20, textAlign:'center' }}>
      <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:800, fontSize:22, color:'#0f172a' }}>New Recording</div>
      <div style={{ width:140,height:140,borderRadius:'50%',
        background: recording?`radial-gradient(circle,${accent}25,${accent}08)`:'rgba(255,255,255,0.5)',
        border: `2px solid ${recording?accent:'rgba(255,255,255,0.8)'}`,
        display:'flex',alignItems:'center',justifyContent:'center',
        boxShadow: recording?`0 0 0 8px ${accent}15, 0 0 0 16px ${accent}08`:'0 4px 20px rgba(0,0,0,0.06)',
        transition:'all 400ms', cursor:'pointer',
      }} onClick={()=>{ setRecording(r=>!r); if(recording) setSecs(0); }}>
        <div style={{ color: recording?accent:'#94a3b8', transform:'scale(2.2)' }}><Icon.mic /></div>
      </div>
      <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:32, color: recording?accent:'#94a3b8', letterSpacing:'0.04em', transition:'color 300ms' }}>
        {fmt(secs)}
      </div>
      <div style={{ fontSize:13, color:'#64748b', fontFamily:'Inter,sans-serif' }}>
        {recording ? 'Recording in progress — AI transcribing live' : 'Tap to start recording'}
      </div>
      {recording && (
        <GlassCard style={{ padding:'12px 16px', width:'100%', background:'rgba(20,184,166,0.06)', border:`1px solid ${accent}20` }}>
          <div style={{ fontSize:11, color:accent, fontWeight:600, fontFamily:'Inter,sans-serif', marginBottom:4 }}>LIVE TRANSCRIPT</div>
          <div style={{ fontSize:13, color:'#475569', fontFamily:'Inter,sans-serif', lineHeight:1.6, fontStyle:'italic' }}>"...the Q3 metrics are looking strong, especially retention..."</div>
        </GlassCard>
      )}
    </div>
  );
}

// Full Mobile App
function MobileApp({ accent = '#14b8a6' }) {
  const [page, setPage] = React.useState('home');
  const pageMap = { home:MobileHome, meetings:MobileMeetings, record:MobileRecord, actions:MobileActions, projects:MobileProjects };
  const PageComp = pageMap[page] || MobileHome;
  return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', position:'relative',
      background:'radial-gradient(ellipse at 20% 30%, rgba(20,184,166,0.10) 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(148,163,184,0.08) 0%, transparent 55%), #f0f4f8' }}>
      {/* Scroll area */}
      <div style={{ flex:1, overflowY:'auto', paddingBottom:80 }}>
        <PageComp accent={accent} />
      </div>
      {/* Bottom nav */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0 }}>
        <div style={{ margin:'0 10px 8px', background:'rgba(255,255,255,0.72)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
          borderRadius:26, border:'1px solid rgba(255,255,255,0.85)', padding:'8px 6px',
          display:'flex', justifyContent:'space-around', alignItems:'center',
          boxShadow:'0 -2px 24px rgba(0,0,0,0.07), 0 4px 20px rgba(0,0,0,0.05)' }}>
          {MOBILE_NAV.map(t => t.special ? (
            <button key={t.id} onClick={()=>setPage(t.id)} style={{
              width:46,height:46,borderRadius:99,border:'none',cursor:'pointer',
              background:`linear-gradient(135deg,${accent},${accent}cc)`,
              display:'flex',alignItems:'center',justifyContent:'center',color:'white',
              boxShadow:`0 4px 14px ${accent}50`, transition:'transform 180ms, box-shadow 180ms',
              transform: page===t.id?'scale(1.08)':'scale(1)',
            }}><Icon.mic /></button>
          ) : (
            <button key={t.id} onClick={()=>setPage(t.id)} style={{
              display:'flex',flexDirection:'column',alignItems:'center',gap:3,
              background: page===t.id?`${accent}14`:'none',
              border:'none',cursor:'pointer',padding:'6px 12px',borderRadius:16,transition:'all 180ms',
            }}>
              <span style={{ color:page===t.id?accent:'#94a3b8', transition:'color 180ms' }}>
                {React.createElement(Icon[t.icon])}
              </span>
              <span style={{ fontSize:10.5,fontFamily:'Inter,sans-serif',fontWeight:page===t.id?600:400,color:page===t.id?accent:'#94a3b8' }}>{t.label}</span>
            </button>
          ))}
        </div>
        <div style={{ height:28,background:'rgba(255,255,255,0.3)',display:'flex',justifyContent:'center',alignItems:'center' }}>
          <div style={{ width:110,height:4,borderRadius:99,background:'rgba(0,0,0,0.12)' }} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MobileApp });
