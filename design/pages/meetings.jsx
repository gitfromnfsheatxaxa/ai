// Meetings List Page — 3 variants

const ALL_MEETINGS = [
  { id:1, title:'Q3 Product Roadmap Review', date:'Today, 10:00 AM', duration:'52 min', attendees:['Alice','Bob','Carol','Dan'], status:'completed', actions:4, project:'Product' },
  { id:2, title:'Design System Sprint Planning', date:'Today, 1:30 PM', duration:'38 min', attendees:['Eve','Frank'], status:'completed', actions:2, project:'Design' },
  { id:3, title:'Investor Update Prep', date:'Today, 3:00 PM', duration:'24 min', attendees:['Alice','Grace','Hank'], status:'in-progress', actions:0, project:'Finance' },
  { id:4, title:'Engineering Sync', date:'Yesterday, 9:00 AM', duration:'45 min', attendees:['Bob','Ivan','Judy'], status:'completed', actions:3, project:'Eng' },
  { id:5, title:'Customer Feedback Review', date:'Yesterday, 2:00 PM', duration:'60 min', attendees:['Carol','Alice'], status:'completed', actions:5, project:'Product' },
  { id:6, title:'Weekly All Hands', date:'Mon, 10:00 AM', duration:'30 min', attendees:['Alice','Bob','Carol','Dan','Eve','Frank'], status:'completed', actions:1, project:'Company' },
  { id:7, title:'Q4 Planning Kickoff', date:'Fri, 2:00 PM', duration:'-', attendees:['Alice','Bob','Carol'], status:'scheduled', actions:0, project:'Product' },
];

const projectColors = { Product:'teal', Design:'purple', Finance:'amber', Eng:'blue', Company:'slate' };

function MeetingRow({ m, onClick, variant }) {
  const [hov, setHov] = React.useState(false);
  const bg = variant === 'glacier' ? (hov ? 'rgba(241,245,249,0.7)' : 'rgba(241,245,249,0.35)') : (hov ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.45)');
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', borderRadius:12,
        background: bg, border:'1px solid rgba(255,255,255,0.6)',
        cursor:'pointer', transition:'all 200ms' }}>
      <div style={{ width:36, height:36, borderRadius:9, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
        background: m.status==='in-progress'?'rgba(20,184,166,0.15)': m.status==='scheduled'?'rgba(99,102,241,0.1)':'rgba(148,163,184,0.1)',
        color: m.status==='in-progress'?DS.teal: m.status==='scheduled'?'#6366f1':'#94a3b8' }}>
        <Icon.mic />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:'Inter, sans-serif', fontWeight:500, fontSize:13.5, color:'#1e293b', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m.title}</div>
        <div style={{ fontSize:12, color:'#94a3b8', marginTop:2, display:'flex', gap:8 }}>
          <span>{m.date}</span><span>·</span><span>{m.duration}</span>
        </div>
      </div>
      <Badge color={projectColors[m.project]||'slate'}>{m.project}</Badge>
      <AvatarGroup names={m.attendees} size={24} max={3} />
      <Badge color={m.status==='in-progress'?'teal':m.status==='scheduled'?'blue':'slate'} dot>
        {m.status==='in-progress'?'Live':m.status==='scheduled'?'Upcoming':'Done'}
      </Badge>
      {m.actions>0 && <Badge color="amber">{m.actions} actions</Badge>}
    </div>
  );
}

// V1: Pearl — filtered list
function MeetingsPearl({ onNavigate }) {
  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const filters = ['all','completed','in-progress','scheduled'];
  const shown = ALL_MEETINGS.filter(m => (filter==='all'||m.status===filter) && (!search||m.title.toLowerCase().includes(search.toLowerCase())));
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, height:'100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:22, color:'#0f172a' }}>Meetings</div>
        <Button variant="primary" icon={<Icon.plus />}>New Recording</Button>
      </div>
      <div style={{ display:'flex', gap:10, alignItems:'center' }}>
        <Input placeholder="Search meetings…" value={search} onChange={e=>setSearch(e.target.value)} icon={<Icon.search />} style={{ flex:1 }} />
        <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.4)', borderRadius:10, padding:3, border:'1px solid rgba(255,255,255,0.6)' }}>
          {filters.map(f => (
            <button key={f} onClick={()=>setFilter(f)} style={{
              padding:'5px 12px', borderRadius:7, border:'none', cursor:'pointer', fontSize:12.5,
              fontFamily:'Inter, sans-serif', fontWeight:500, transition:'all 180ms',
              background: filter===f ? 'rgba(255,255,255,0.9)' : 'transparent',
              color: filter===f ? '#0f172a' : '#64748b',
              boxShadow: filter===f ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}>{f.charAt(0).toUpperCase()+f.slice(1).replace('-',' ')}</button>
          ))}
        </div>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8, overflowY:'auto' }}>
        {shown.map(m => <MeetingRow key={m.id} m={m} onClick={()=>onNavigate('detail')} variant="pearl" />)}
      </div>
    </div>
  );
}

// V2: Glacier — card grid
function MeetingsGlacier({ onNavigate }) {
  const [search, setSearch] = React.useState('');
  const shown = ALL_MEETINGS.filter(m => !search||m.title.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, height:'100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:22, color:'#0f172a' }}>Meetings</div>
        <div style={{ display:'flex', gap:8 }}>
          <Input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} icon={<Icon.search />} style={{ width:220 }} />
          <Button variant="ghost" icon={<Icon.filter />}>Filter</Button>
          <Button variant="primary" icon={<Icon.plus />}>Record</Button>
        </div>
      </div>
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:12, alignContent:'start', overflowY:'auto' }}>
        {shown.map(m => (
          <GlassCard key={m.id} variant="glacier" onClick={()=>onNavigate('detail')} style={{ padding:18, cursor:'pointer' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <Badge color={projectColors[m.project]||'slate'}>{m.project}</Badge>
              <Badge color={m.status==='in-progress'?'teal':m.status==='scheduled'?'blue':'slate'} dot>
                {m.status==='in-progress'?'Live':m.status==='scheduled'?'Upcoming':'Done'}
              </Badge>
            </div>
            <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:600, fontSize:14.5, color:'#0f172a', lineHeight:1.35, marginBottom:6 }}>{m.title}</div>
            <div style={{ fontSize:12, color:'#64748b', fontFamily:'Inter, sans-serif', marginBottom:12 }}>{m.date} · {m.duration}</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <AvatarGroup names={m.attendees} size={24} max={4} />
              {m.actions>0 && <Badge color="amber">{m.actions} actions</Badge>}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// V3: Aurora — grouped by day with status lanes
function MeetingsAurora({ onNavigate }) {
  const groups = [
    { label:'Today', items: ALL_MEETINGS.filter(m=>m.date.startsWith('Today')) },
    { label:'Yesterday', items: ALL_MEETINGS.filter(m=>m.date.startsWith('Yesterday')) },
    { label:'Earlier', items: ALL_MEETINGS.filter(m=>!m.date.startsWith('Today')&&!m.date.startsWith('Yesterday')) },
  ];
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, height:'100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:DS.teal, fontWeight:600, fontFamily:'Inter, sans-serif' }}>All Meetings</div>
          <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:22, color:'#0f172a' }}>{ALL_MEETINGS.length} recordings</div>
        </div>
        <Button variant="primary" icon={<Icon.mic />} size="lg">Record New</Button>
      </div>
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:20 }}>
        {groups.map(g => g.items.length > 0 && (
          <div key={g.label}>
            <div style={{ fontSize:11.5, fontWeight:600, color:'#94a3b8', letterSpacing:'0.06em', textTransform:'uppercase', fontFamily:'Inter, sans-serif', marginBottom:8 }}>{g.label}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {g.items.map(m => (
                <div key={m.id} onClick={()=>onNavigate('detail')}
                  style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 16px',
                    background:'rgba(255,255,255,0.35)', borderRadius:14,
                    border: m.status==='in-progress'?`1px solid rgba(20,184,166,0.3)`:'1px solid rgba(255,255,255,0.55)',
                    cursor:'pointer', transition:'background 200ms',
                    boxShadow: m.status==='in-progress'?'0 0 0 2px rgba(20,184,166,0.1)':'none' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.6)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.35)'}
                >
                  <div style={{ width:42,height:42,borderRadius:11,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',
                    background:m.status==='in-progress'?'rgba(20,184,166,0.12)':'rgba(248,250,252,0.8)',
                    color:m.status==='in-progress'?DS.teal:'#94a3b8', border:`1px solid ${m.status==='in-progress'?'rgba(20,184,166,0.2)':'rgba(226,232,240,0.8)'}` }}>
                    <Icon.mic />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:600, fontSize:14, color:'#0f172a' }}>{m.title}</div>
                    <div style={{ fontSize:12, color:'#94a3b8', marginTop:2, fontFamily:'Inter, sans-serif', display:'flex', gap:8 }}>
                      <span>{m.date.replace('Today, ','').replace('Yesterday, ','')}</span>
                      <span>·</span><span>{m.duration}</span>
                    </div>
                  </div>
                  <AvatarGroup names={m.attendees} size={26} max={3} />
                  <div style={{ display:'flex', gap:6 }}>
                    <Badge color={projectColors[m.project]||'slate'}>{m.project}</Badge>
                    {m.actions>0 && <Badge color="amber">{m.actions}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { MeetingsPearl, MeetingsGlacier, MeetingsAurora });
