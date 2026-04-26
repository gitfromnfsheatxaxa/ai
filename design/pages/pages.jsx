// Meeting Detail, Action Board, Projects, Mobile Nav — 3 variants each

const TRANSCRIPT = [
  { speaker:'Alice', time:'0:00', text:'Alright, let\'s kick off the Q3 roadmap review. Carol, can you walk us through the updated feature list?' },
  { speaker:'Carol', time:'0:42', text:'Sure. We\'ve scoped v2.3 to include the new onboarding flow, the token migration for design systems, and the AI summary improvements. Timeline is six weeks.' },
  { speaker:'Bob', time:'1:15', text:'Six weeks feels tight. The token migration alone could be two weeks if we hit blockers on the legacy components.' },
  { speaker:'Carol', time:'1:38', text:'Agreed. Let\'s set a checkpoint at week two. I\'ll finalize the spec doc by Thursday and share it for review.' },
  { speaker:'Alice', time:'2:10', text:'Perfect. Dan, are the API contracts ready for the AI summary feature?' },
  { speaker:'Dan', time:'2:24', text:'Almost. I need one more day to finalize the streaming endpoint. Should be done by EOD tomorrow.' },
];

const DETAIL_ACTIONS = [
  { id:1, text:'Finalize v2.3 feature specs', assignee:'Carol', due:'Thu', done:false },
  { id:2, text:'Review token migration PR', assignee:'Bob', due:'Fri', done:false },
  { id:3, text:'Finalize streaming API endpoint', assignee:'Dan', due:'Tomorrow', done:false },
  { id:4, text:'Share checkpoint plan with team', assignee:'Alice', due:'Mon', done:true },
];

// ── Meeting Detail V1: Pearl — two-column ──────────────────────────
function DetailPearl() {
  const [actions, setActions] = React.useState(DETAIL_ACTIONS);
  const toggle = id => setActions(prev => prev.map(a => a.id===id ? {...a,done:!a.done} : a));
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, height:'100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ display:'flex', gap:8, marginBottom:8 }}><Badge color="teal" dot>Completed</Badge><Badge color="slate">52 min</Badge><Badge color="blue">Product</Badge></div>
          <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:22, color:'#0f172a' }}>Q3 Product Roadmap Review</div>
          <div style={{ fontSize:13, color:'#64748b', fontFamily:'Inter, sans-serif', marginTop:4 }}>Today, 10:00 AM · 4 action items</div>
        </div>
        <div style={{ display:'flex', gap:8 }}><Button variant="ghost" icon={<Icon.link />}>Share</Button><Button variant="ghost" icon={<Icon.edit />}>Edit</Button></div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:16, flex:1, minHeight:0 }}>
        {/* Transcript */}
        <GlassCard style={{ padding:20, overflowY:'auto' }}>
          <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:600, fontSize:14, color:'#0f172a', marginBottom:14 }}>Transcript</div>
          {TRANSCRIPT.map((t,i) => (
            <div key={i} style={{ display:'flex', gap:12, marginBottom:16 }}>
              <Avatar name={t.speaker} size={30} />
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:8, alignItems:'baseline', marginBottom:4 }}>
                  <span style={{ fontFamily:'Inter, sans-serif', fontWeight:600, fontSize:13, color:'#1e293b' }}>{t.speaker}</span>
                  <span style={{ fontSize:11, color:'#94a3b8' }}>{t.time}</span>
                </div>
                <div style={{ fontSize:13.5, color:'#475569', fontFamily:'Inter, sans-serif', lineHeight:1.6 }}>{t.text}</div>
              </div>
            </div>
          ))}
        </GlassCard>
        {/* Right panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <GlassCard style={{ padding:16 }}>
            <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:600, fontSize:13.5, color:'#0f172a', marginBottom:10 }}>AI Summary</div>
            <div style={{ fontSize:12.5, color:'#475569', fontFamily:'Inter, sans-serif', lineHeight:1.65 }}>Aligned on v2.3 scope with a 6-week timeline. Carol to finalize specs by Thursday. Dan completing API endpoint by tomorrow. Week-2 checkpoint set.</div>
          </GlassCard>
          <GlassCard style={{ padding:16, flex:1 }}>
            <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:600, fontSize:13.5, color:'#0f172a', marginBottom:12 }}>Action Items</div>
            {actions.map(a => (
              <div key={a.id} onClick={()=>toggle(a.id)} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom:'1px solid rgba(148,163,184,0.1)', cursor:'pointer', alignItems:'flex-start' }}>
                <div style={{ width:16,height:16,borderRadius:4,border:`1.5px solid ${a.done?DS.teal:'#cbd5e1'}`,marginTop:2,flexShrink:0,
                  background:a.done?DS.teal:'transparent',display:'flex',alignItems:'center',justifyContent:'center',color:'white',transition:'all 180ms' }}>
                  {a.done && <Icon.check />}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,fontFamily:'Inter, sans-serif',color:a.done?'#94a3b8':'#1e293b',textDecoration:a.done?'line-through':'none',transition:'all 180ms' }}>{a.text}</div>
                  <div style={{ fontSize:11.5,color:'#94a3b8',marginTop:2 }}>{a.assignee} · {a.due}</div>
                </div>
              </div>
            ))}
          </GlassCard>
          <GlassCard style={{ padding:16 }}>
            <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:600, fontSize:13.5, color:'#0f172a', marginBottom:10 }}>Attendees</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {['Alice','Bob','Carol','Dan'].map(n => (
                <div key={n} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <Avatar name={n} size={28} /><span style={{ fontFamily:'Inter, sans-serif', fontSize:13, color:'#334155' }}>{n}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ── Detail V2: Glacier — tabbed full-width ─────────────────────────
function DetailGlacier() {
  const [tab, setTab] = React.useState('transcript');
  const [actions, setActions] = React.useState(DETAIL_ACTIONS);
  const toggle = id => setActions(prev => prev.map(a => a.id===id ? {...a,done:!a.done} : a));
  const tabs = ['transcript','summary','actions','attendees'];
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, height:'100%' }}>
      <GlassCard variant="glacier" style={{ padding:'16px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:20, color:'#0f172a' }}>Q3 Product Roadmap Review</div>
            <div style={{ fontSize:12.5, color:'#64748b', fontFamily:'Inter, sans-serif', marginTop:3, display:'flex', gap:10 }}>
              <span>Today, 10:00 AM</span><span>·</span><span>52 min</span><span>·</span><AvatarGroup names={['Alice','Bob','Carol','Dan']} size={18} />
            </div>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {tabs.map(t => (
              <button key={t} onClick={()=>setTab(t)} style={{
                padding:'6px 14px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12.5, fontFamily:'Inter, sans-serif', fontWeight:500, transition:'all 180ms',
                background: tab===t?'rgba(255,255,255,0.9)':'transparent', color: tab===t?'#0f172a':'#64748b',
                boxShadow: tab===t?'0 1px 6px rgba(0,0,0,0.08)':'none',
              }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
            ))}
          </div>
        </div>
      </GlassCard>
      <GlassCard variant="glacier" style={{ padding:22, flex:1, overflowY:'auto' }}>
        {tab==='transcript' && TRANSCRIPT.map((t,i) => (
          <div key={i} style={{ display:'flex', gap:14, marginBottom:18 }}>
            <Avatar name={t.speaker} size={32} />
            <div style={{ flex:1, padding:'10px 14px', background:'rgba(255,255,255,0.5)', borderRadius:10, border:'1px solid rgba(226,232,240,0.5)' }}>
              <div style={{ display:'flex', gap:8, marginBottom:4 }}>
                <span style={{ fontWeight:600, fontSize:13, color:'#1e293b', fontFamily:'Inter, sans-serif' }}>{t.speaker}</span>
                <span style={{ fontSize:11.5, color:'#94a3b8' }}>{t.time}</span>
              </div>
              <div style={{ fontSize:13.5, color:'#475569', fontFamily:'Inter, sans-serif', lineHeight:1.65 }}>{t.text}</div>
            </div>
          </div>
        ))}
        {tab==='summary' && <div style={{ fontSize:15, color:'#334155', fontFamily:'Inter, sans-serif', lineHeight:1.9, maxWidth:640 }}>
          <p style={{ marginTop:0 }}>The team reviewed the <strong>v2.3 product scope</strong>, settling on three core deliverables: a redesigned onboarding flow, design token migration, and AI summary improvements.</p>
          <p>Timeline is set at <strong>six weeks</strong> with a checkpoint at week two. Carol owns the spec document, due by Thursday. Dan is finalizing the streaming API endpoint by tomorrow EOD.</p>
          <p style={{ marginBottom:0 }}>Bob flagged potential blockers in legacy component migration — the team agreed to monitor this closely at the week-two checkpoint.</p>
        </div>}
        {tab==='actions' && <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {actions.map(a => (
            <div key={a.id} onClick={()=>toggle(a.id)} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'rgba(255,255,255,0.5)', borderRadius:12, border:`1px solid ${a.done?'rgba(20,184,166,0.2)':'rgba(226,232,240,0.6)'}`, cursor:'pointer', transition:'all 200ms' }}>
              <div style={{ width:18,height:18,borderRadius:5,border:`1.5px solid ${a.done?DS.teal:'#cbd5e1'}`,flexShrink:0,background:a.done?DS.teal:'transparent',display:'flex',alignItems:'center',justifyContent:'center',color:'white',transition:'all 180ms' }}>
                {a.done && <Icon.check />}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14,fontFamily:'Inter, sans-serif',color:a.done?'#94a3b8':'#1e293b',textDecoration:a.done?'line-through':'none' }}>{a.text}</div>
                <div style={{ fontSize:12,color:'#94a3b8',marginTop:3 }}>{a.assignee} · Due {a.due}</div>
              </div>
              <Badge color={a.done?'teal':'slate'}>{a.done?'Done':'Open'}</Badge>
            </div>
          ))}
        </div>}
        {tab==='attendees' && <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
          {['Alice','Bob','Carol','Dan'].map(n => (
            <GlassCard key={n} variant="glacier" style={{ padding:16, textAlign:'center' }}>
              <Avatar name={n} size={48} style={{ margin:'0 auto 10px' }} /><div style={{ fontFamily:'Inter, sans-serif', fontWeight:600, fontSize:13.5, color:'#1e293b' }}>{n}</div>
            </GlassCard>
          ))}
        </div>}
      </GlassCard>
    </div>
  );
}

// ── Detail V3: Aurora — floating action bar ────────────────────────
function DetailAurora() {
  const [actions, setActions] = React.useState(DETAIL_ACTIONS);
  const toggle = id => setActions(prev => prev.map(a => a.id===id ? {...a,done:!a.done} : a));
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14, height:'100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:DS.teal, fontFamily:'Inter, sans-serif', fontWeight:600 }}>Product · 52 min</div>
          <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:800, fontSize:24, color:'#0f172a', letterSpacing:'-0.02em', marginTop:2 }}>Q3 Product Roadmap Review</div>
          <div style={{ fontSize:13, color:'#64748b', fontFamily:'Inter, sans-serif', marginTop:4, display:'flex', gap:10, alignItems:'center' }}>
            Today, 10:00 AM <AvatarGroup names={['Alice','Bob','Carol','Dan']} size={20} />
          </div>
        </div>
        {/* Floating toolbar */}
        <GlassCard variant="aurora" style={{ padding:'8px 12px', display:'flex', gap:8 }}>
          <Button variant="ghost" size="sm" icon={<Icon.ai />}>Re-summarize</Button>
          <Button variant="ghost" size="sm" icon={<Icon.link />}>Share</Button>
          <Button variant="subtle" size="sm" icon={<Icon.edit />}>Edit</Button>
        </GlassCard>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, flex:1, minHeight:0 }}>
        <GlassCard variant="aurora" style={{ padding:20, overflowY:'auto', background:'rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:'#94a3b8', fontWeight:600, fontFamily:'Inter, sans-serif', marginBottom:14 }}>Transcript</div>
          {TRANSCRIPT.map((t,i) => (
            <div key={i} style={{ marginBottom:14, paddingBottom:14, borderBottom:'1px solid rgba(148,163,184,0.1)' }}>
              <div style={{ display:'flex', gap:8, marginBottom:5, alignItems:'center' }}>
                <Avatar name={t.speaker} size={24} />
                <span style={{ fontWeight:600, fontSize:12.5, color:'#1e293b', fontFamily:'Inter, sans-serif' }}>{t.speaker}</span>
                <span style={{ fontSize:11, color:'#94a3b8' }}>{t.time}</span>
              </div>
              <div style={{ fontSize:13.5, color:'#475569', fontFamily:'Inter, sans-serif', lineHeight:1.65, paddingLeft:32 }}>{t.text}</div>
            </div>
          ))}
        </GlassCard>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <GlassCard variant="aurora" style={{ padding:18, background:'linear-gradient(135deg,rgba(20,184,166,0.08),rgba(99,102,241,0.06))' }}>
            <div style={{ fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:DS.teal, fontWeight:600, fontFamily:'Inter, sans-serif', marginBottom:10 }}>AI Summary</div>
            <div style={{ fontSize:13.5, color:'#334155', fontFamily:'Inter, sans-serif', lineHeight:1.7 }}>Aligned on v2.3 scope — 6 weeks, 3 features. Carol owns spec by Thursday. Dan finishes API tomorrow. Week-2 checkpoint set for blocker review.</div>
          </GlassCard>
          <GlassCard variant="aurora" style={{ padding:18, flex:1, overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:'#94a3b8', fontWeight:600, fontFamily:'Inter, sans-serif' }}>Action Items</div>
              <Badge color={actions.filter(a=>!a.done).length>0?'amber':'teal'}>{actions.filter(a=>!a.done).length} open</Badge>
            </div>
            {actions.map(a => (
              <div key={a.id} onClick={()=>toggle(a.id)} style={{ display:'flex', gap:10, padding:'9px 10px', borderRadius:10,
                background:a.done?'rgba(20,184,166,0.06)':'rgba(255,255,255,0.35)', marginBottom:6, cursor:'pointer', border:'1px solid rgba(255,255,255,0.4)', transition:'all 180ms' }}>
                <div style={{ width:16,height:16,borderRadius:4,border:`1.5px solid ${a.done?DS.teal:'#cbd5e1'}`,marginTop:2,flexShrink:0,
                  background:a.done?DS.teal:'transparent',display:'flex',alignItems:'center',justifyContent:'center',color:'white',transition:'all 180ms' }}>
                  {a.done && <Icon.check />}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,fontFamily:'Inter, sans-serif',color:a.done?'#94a3b8':'#1e293b',textDecoration:a.done?'line-through':'none' }}>{a.text}</div>
                  <div style={{ fontSize:11.5,color:'#94a3b8',marginTop:2 }}>{a.assignee} · {a.due}</div>
                </div>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ACTION BOARD
const BOARD_COLS = [
  { id:'todo', label:'To Do', color:'#64748b', items:[
    { id:1, text:'Finalize v2.3 feature specs', assignee:'Carol', meet:'Q3 Roadmap', priority:'high' },
    { id:2, text:'Draft investor deck slide 4', assignee:'Alice', meet:'Investor Prep', priority:'high' },
    { id:3, text:'Share onboarding flow doc', assignee:'Frank', meet:'Design Sprint', priority:'low' },
  ]},
  { id:'progress', label:'In Progress', color:DS.teal, items:[
    { id:4, text:'Review token migration PR', assignee:'Bob', meet:'Engineering Sync', priority:'medium' },
    { id:5, text:'Finalize streaming API', assignee:'Dan', meet:'Q3 Roadmap', priority:'medium' },
  ]},
  { id:'done', label:'Done', color:'#10b981', items:[
    { id:6, text:'Share checkpoint plan', assignee:'Alice', meet:'Q3 Roadmap', priority:'low' },
    { id:7, text:'Update meeting templates', assignee:'Eve', meet:'Design Sprint', priority:'low' },
  ]},
];

function ActionCard({ item, colColor, variant }) {
  const [done, setDone] = React.useState(false);
  return (
    <GlassCard variant={variant} style={{ padding:14, marginBottom:8 }}>
      <div style={{ display:'flex', gap:8, justifyContent:'space-between', marginBottom:8 }}>
        <Badge color={item.priority==='high'?'red':item.priority==='medium'?'amber':'slate'}>{item.priority}</Badge>
        <Avatar name={item.assignee} size={22} />
      </div>
      <div style={{ fontSize:13.5, fontWeight:500, fontFamily:'Inter, sans-serif', color:'#1e293b', lineHeight:1.4, marginBottom:8 }}>{item.text}</div>
      <div style={{ fontSize:11.5, color:'#94a3b8', fontFamily:'Inter, sans-serif' }}>↗ {item.meet}</div>
    </GlassCard>
  );
}

function ActionsPearl() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, height:'100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:22, color:'#0f172a' }}>Action Board</div>
        <div style={{ display:'flex', gap:8 }}><Button variant="ghost" icon={<Icon.filter />}>Filter</Button><Button variant="primary" icon={<Icon.plus />}>Add Action</Button></div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, flex:1, alignItems:'start' }}>
        {BOARD_COLS.map(col => (
          <div key={col.id}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <div style={{ width:8,height:8,borderRadius:'50%',background:col.color }} />
              <span style={{ fontFamily:'DM Sans, sans-serif', fontWeight:600, fontSize:14, color:'#0f172a' }}>{col.label}</span>
              <span style={{ fontSize:12, color:'#94a3b8', fontFamily:'Inter, sans-serif' }}>{col.items.length}</span>
            </div>
            <div>{col.items.map(item => <ActionCard key={item.id} item={item} colColor={col.color} variant="pearl" />)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionsGlacier() {
  const priorities = ['high','medium','low'];
  const all = BOARD_COLS.flatMap(c => c.items);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, height:'100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:22, color:'#0f172a' }}>Action Board</div>
        <Button variant="primary" icon={<Icon.plus />}>Add Action</Button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8, flex:1, overflowY:'auto' }}>
        {all.map(item => (
          <GlassCard key={item.id} variant="glacier" style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:16,height:16,borderRadius:4,border:'1.5px solid #cbd5e1',flexShrink:0 }} />
            <div style={{ flex:1, fontFamily:'Inter, sans-serif', fontSize:14, color:'#1e293b' }}>{item.text}</div>
            <div style={{ fontSize:12, color:'#94a3b8' }}>{item.meet}</div>
            <Avatar name={item.assignee} size={26} />
            <Badge color={item.priority==='high'?'red':item.priority==='medium'?'amber':'slate'}>{item.priority}</Badge>
            <Badge color={BOARD_COLS.find(c=>c.items.find(i=>i.id===item.id))?.id==='done'?'teal':BOARD_COLS.find(c=>c.items.find(i=>i.id===item.id))?.id==='progress'?'blue':'slate'}>
              {BOARD_COLS.find(c=>c.items.find(i=>i.id===item.id))?.label}
            </Badge>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function ActionsAurora() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, height:'100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:DS.teal, fontFamily:'Inter, sans-serif', fontWeight:600 }}>7 total · 3 open</div>
          <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:800, fontSize:24, color:'#0f172a', letterSpacing:'-0.02em' }}>Action Board</div>
        </div>
        <Button variant="primary" icon={<Icon.plus />}>Add Action</Button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, flex:1, alignItems:'start' }}>
        {BOARD_COLS.map(col => (
          <div key={col.id}>
            <GlassCard variant="aurora" style={{ padding:'8px 14px', marginBottom:10, display:'flex', alignItems:'center', gap:8, background:`${col.color}12`, border:`1px solid ${col.color}30` }}>
              <div style={{ width:8,height:8,borderRadius:'50%',background:col.color,flexShrink:0 }} />
              <span style={{ fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:13, color:'#0f172a' }}>{col.label}</span>
              <span style={{ fontSize:12, color:'#94a3b8', fontFamily:'Inter, sans-serif', marginLeft:'auto' }}>{col.items.length}</span>
            </GlassCard>
            {col.items.map(item => (
              <div key={item.id} style={{ padding:'12px 14px', borderRadius:12, background:'rgba(255,255,255,0.35)', border:'1px solid rgba(255,255,255,0.55)', marginBottom:8,
                borderLeft:`3px solid ${item.priority==='high'?'#ef4444':item.priority==='medium'?'#f59e0b':'#94a3b8'}` }}>
                <div style={{ fontSize:13.5, fontWeight:500, fontFamily:'Inter, sans-serif', color:'#1e293b', lineHeight:1.4, marginBottom:8 }}>{item.text}</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ fontSize:11.5, color:'#94a3b8' }}>{item.meet}</div>
                  <Avatar name={item.assignee} size={22} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// PROJECTS
const PROJECTS_DATA = [
  { id:1, name:'Product', meetings:14, actions:12, open:4, color:'#14b8a6', members:['Alice','Carol','Bob'], progress:68 },
  { id:2, name:'Design System', meetings:8, actions:6, open:2, color:'#6366f1', members:['Eve','Frank'], progress:45 },
  { id:3, name:'Engineering', meetings:11, actions:9, open:3, color:'#3b82f6', members:['Bob','Ivan','Dan'], progress:72 },
  { id:4, name:'Finance', meetings:5, actions:3, open:1, color:'#f59e0b', members:['Alice','Grace'], progress:90 },
  { id:5, name:'Company', meetings:4, actions:2, open:0, color:'#10b981', members:['Alice','Bob','Carol','Dan','Eve'], progress:100 },
];

function ProjectsPearl() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, height:'100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:22, color:'#0f172a' }}>Projects</div>
        <Button variant="primary" icon={<Icon.plus />}>New Project</Button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14, alignContent:'start' }}>
        {PROJECTS_DATA.map(p => (
          <GlassCard key={p.id} style={{ padding:20 }}>
            <div style={{ display:'flex', justify:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div style={{ width:38,height:38,borderRadius:10,background:`${p.color}18`,display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Icon.folder style={{ color:p.color }} />
              </div>
              {p.open>0 && <Badge color="amber" style={{ marginLeft:'auto' }}>{p.open} open</Badge>}
            </div>
            <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:16, color:'#0f172a', marginBottom:4 }}>{p.name}</div>
            <div style={{ fontSize:12, color:'#64748b', fontFamily:'Inter, sans-serif', marginBottom:12 }}>{p.meetings} meetings · {p.actions} actions</div>
            <ProgressBar value={p.progress} color={p.color} height={4} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10 }}>
              <AvatarGroup names={p.members} size={22} max={3} />
              <span style={{ fontSize:11.5, color:'#94a3b8', fontFamily:'Inter, sans-serif' }}>{p.progress}%</span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function ProjectsGlacier() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, height:'100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:22, color:'#0f172a' }}>Projects</div>
        <Button variant="primary" icon={<Icon.plus />}>New Project</Button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {PROJECTS_DATA.map(p => (
          <GlassCard key={p.id} variant="glacier" style={{ padding:'16px 20px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'36px 1fr auto auto auto', alignItems:'center', gap:16 }}>
              <div style={{ width:36,height:36,borderRadius:9,background:`${p.color}18`,display:'flex',alignItems:'center',justifyContent:'center',color:p.color }}>
                <Icon.folder />
              </div>
              <div>
                <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:600, fontSize:15, color:'#0f172a' }}>{p.name}</div>
                <div style={{ fontSize:12, color:'#94a3b8', fontFamily:'Inter, sans-serif', marginTop:2 }}>{p.meetings} meetings · {p.actions} actions</div>
              </div>
              <div style={{ width:120 }}><ProgressBar value={p.progress} color={p.color} height={5} /></div>
              <AvatarGroup names={p.members} size={24} max={3} />
              {p.open>0 ? <Badge color="amber">{p.open} open</Badge> : <Badge color="teal">Done</Badge>}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function ProjectsAurora() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, height:'100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:DS.teal, fontFamily:'Inter, sans-serif', fontWeight:600 }}>{PROJECTS_DATA.length} active</div>
          <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:800, fontSize:24, color:'#0f172a', letterSpacing:'-0.02em' }}>Projects</div>
        </div>
        <Button variant="primary" icon={<Icon.plus />}>New Project</Button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14, alignContent:'start' }}>
        {PROJECTS_DATA.map(p => (
          <GlassCard key={p.id} variant="aurora" style={{ padding:22, borderTop:`3px solid ${p.color}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:17, color:'#0f172a' }}>{p.name}</div>
              <span style={{ fontFamily:'DM Sans, sans-serif', fontWeight:800, fontSize:26, color:`${p.color}` }}>{p.progress}%</span>
            </div>
            <ProgressBar value={p.progress} color={p.color} height={6} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:14 }}>
              <div style={{ padding:'10px',background:'rgba(255,255,255,0.35)',borderRadius:8,textAlign:'center' }}>
                <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:18, color:'#0f172a' }}>{p.meetings}</div>
                <div style={{ fontSize:11, color:'#94a3b8', fontFamily:'Inter, sans-serif' }}>meetings</div>
              </div>
              <div style={{ padding:'10px',background:'rgba(255,255,255,0.35)',borderRadius:8,textAlign:'center' }}>
                <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:18, color: p.open>0?'#f59e0b':'#0f172a' }}>{p.open}</div>
                <div style={{ fontSize:11, color:'#94a3b8', fontFamily:'Inter, sans-serif' }}>open actions</div>
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12 }}>
              <AvatarGroup names={p.members} size={24} max={4} />
              <Button variant="ghost" size="sm" icon={<Icon.arrow />}>View</Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// MOBILE NAV — shown as a mockup
function MobileNavPearl() {
  const [active, setActive] = React.useState('home');
  const tabs = [
    { id:'home', label:'Home', icon:()=><Icon.home /> },
    { id:'meetings', label:'Meetings', icon:()=><Icon.calendar /> },
    { id:'actions', label:'Actions', icon:()=><Icon.check /> },
    { id:'projects', label:'Projects', icon:()=><Icon.folder /> },
  ];
  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100%' }}>
      <div style={{ width:375, height:680, borderRadius:44, overflow:'hidden', background:'linear-gradient(160deg,#f0f9ff,#e0f2fe)', position:'relative', boxShadow:'0 24px 80px rgba(0,0,0,0.15)' }}>
        <div style={{ padding:'60px 20px 20px', fontSize:20, fontFamily:'DM Sans, sans-serif', fontWeight:700, color:'#0f172a' }}>Good morning ☀️</div>
        <div style={{ position:'absolute', bottom:0, left:0, right:0 }}>
          <div style={{ margin:'0 12px 20px', background:'rgba(255,255,255,0.7)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
            borderRadius:28, border:'1px solid rgba(255,255,255,0.8)', padding:'10px 8px', display:'flex', justifyContent:'space-around',
            boxShadow:'0 -2px 20px rgba(0,0,0,0.06)' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={()=>setActive(t.id)} style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:4,
                background:'none',border:'none',cursor:'pointer',padding:'6px 14px',borderRadius:18,
                background: active===t.id?'rgba(20,184,166,0.12)':'transparent', transition:'all 200ms' }}>
                <span style={{ color: active===t.id?DS.teal:'#94a3b8', transition:'color 200ms' }}><t.icon /></span>
                <span style={{ fontSize:10.5,fontFamily:'Inter, sans-serif',fontWeight:active===t.id?600:400,color:active===t.id?DS.teal:'#94a3b8' }}>{t.label}</span>
              </button>
            ))}
          </div>
          <div style={{ height:34, background:'rgba(255,255,255,0.3)', display:'flex', justifyContent:'center', alignItems:'center' }}>
            <div style={{ width:120, height:5, borderRadius:99, background:'rgba(0,0,0,0.12)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileNavGlacier() {
  const [active, setActive] = React.useState('meetings');
  const tabs = [
    { id:'home', icon:()=><Icon.home /> },
    { id:'meetings', icon:()=><Icon.calendar /> },
    { id:'actions', icon:()=><Icon.check /> },
    { id:'projects', icon:()=><Icon.folder /> },
  ];
  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100%' }}>
      <div style={{ width:375, height:680, borderRadius:44, overflow:'hidden', background:'linear-gradient(160deg,#f8fafc,#f1f5f9)', position:'relative', boxShadow:'0 24px 80px rgba(0,0,0,0.15)' }}>
        <div style={{ padding:'60px 20px', fontSize:18, fontFamily:'DM Sans, sans-serif', fontWeight:700, color:'#0f172a' }}>Q3 Roadmap Review</div>
        {/* Floating pill bar */}
        <div style={{ position:'absolute', bottom:50, left:'50%', transform:'translateX(-50%)', display:'flex' }}>
          <div style={{ background:'rgba(15,23,42,0.85)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
            borderRadius:99, padding:'10px 20px', display:'flex', gap:6,
            boxShadow:'0 8px 32px rgba(0,0,0,0.2)', border:'1px solid rgba(255,255,255,0.1)' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={()=>setActive(t.id)} style={{
                width:40,height:40,borderRadius:99,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 200ms',
                background: active===t.id?DS.teal:'transparent',
                color: active===t.id?'white':'rgba(255,255,255,0.5)',
              }}><t.icon /></button>
            ))}
            <div style={{ width:1, background:'rgba(255,255,255,0.15)', margin:'6px 4px' }} />
            <button style={{ width:40,height:40,borderRadius:99,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
              background:'rgba(20,184,166,0.2)',color:DS.teal }}><Icon.mic /></button>
          </div>
        </div>
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:34, background:'rgba(248,250,252,0.8)', display:'flex', justifyContent:'center', alignItems:'center' }}>
          <div style={{ width:120, height:5, borderRadius:99, background:'rgba(0,0,0,0.12)' }} />
        </div>
      </div>
    </div>
  );
}

function MobileNavAurora() {
  const [active, setActive] = React.useState('home');
  const tabs = [
    { id:'home', label:'Home', icon:()=><Icon.home /> },
    { id:'meetings', label:'Notes', icon:()=><Icon.calendar /> },
    { id:'record', label:'Record', icon:()=><Icon.mic />, special:true },
    { id:'actions', label:'Actions', icon:()=><Icon.check /> },
    { id:'projects', label:'Projects', icon:()=><Icon.folder /> },
  ];
  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100%' }}>
      <div style={{ width:375, height:680, borderRadius:44, overflow:'hidden', background:'linear-gradient(135deg,#0f172a,#1e293b)', position:'relative', boxShadow:'0 24px 80px rgba(0,0,0,0.3)' }}>
        <div style={{ padding:'60px 20px', color:'white', fontSize:18, fontFamily:'DM Sans, sans-serif', fontWeight:700 }}>Today's Meetings</div>
        <div style={{ position:'absolute', bottom:0, left:0, right:0 }}>
          <div style={{ padding:'14px 16px 10px', background:'rgba(255,255,255,0.05)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
            borderTop:'1px solid rgba(255,255,255,0.1)', display:'flex', justifyContent:'space-around', alignItems:'center' }}>
            {tabs.map(t => t.special ? (
              <button key={t.id} onClick={()=>setActive(t.id)} style={{ width:50,height:50,borderRadius:99,background:`linear-gradient(135deg,${DS.teal},#0d9488)`,
                border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'white',
                boxShadow:`0 4px 16px rgba(20,184,166,0.5)`, marginTop:-20, transition:'all 200ms' }}><Icon.mic /></button>
            ) : (
              <button key={t.id} onClick={()=>setActive(t.id)} style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:4,
                background:'none',border:'none',cursor:'pointer',padding:'4px 8px' }}>
                <span style={{ color: active===t.id?DS.teal:'rgba(255,255,255,0.4)', transition:'color 200ms' }}><t.icon /></span>
                <span style={{ fontSize:10,fontFamily:'Inter, sans-serif',color:active===t.id?DS.teal:'rgba(255,255,255,0.35)' }}>{t.label}</span>
              </button>
            ))}
          </div>
          <div style={{ height:34, background:'rgba(0,0,0,0.3)', display:'flex', justifyContent:'center', alignItems:'center' }}>
            <div style={{ width:120, height:5, borderRadius:99, background:'rgba(255,255,255,0.2)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  DetailPearl, DetailGlacier, DetailAurora,
  ActionsPearl, ActionsGlacier, ActionsAurora,
  ProjectsPearl, ProjectsGlacier, ProjectsAurora,
  MobileNavPearl, MobileNavGlacier, MobileNavAurora,
});
