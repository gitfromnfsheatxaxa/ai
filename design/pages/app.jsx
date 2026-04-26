// Main App — navigation shell + variant switcher + tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "variant": "pearl",
  "accentColor": "#14b8a6",
  "blurAmount": 24,
  "cornerRadius": 16,
  "showAIInsights": true,
  "layoutMode": "split"
}/*EDITMODE-END*/;

const NAV_ITEMS = [
  { id:'dashboard', label:'Home', icon:'home' },
  { id:'meetings', label:'Meetings', icon:'calendar' },
  { id:'detail', label:'Meeting Detail', icon:'mic' },
  { id:'actions', label:'Action Board', icon:'check' },
  { id:'projects', label:'Projects', icon:'folder' },
  { id:'mobile', label:'Mobile Nav', icon:'users' },
];

const VARIANT_META = {
  pearl:   { label:'Pearl',   desc:'Light frosted' },
  glacier: { label:'Glacier', desc:'Slate depth'  },
  aurora:  { label:'Aurora',  desc:'Editorial'    },
};

const PAGE_MAP = {
  dashboard: { pearl: DashboardPearl,  glacier: DashboardGlacier,  aurora: DashboardAurora  },
  meetings:  { pearl: MeetingsPearl,   glacier: MeetingsGlacier,   aurora: MeetingsAurora   },
  detail:    { pearl: DetailPearl,     glacier: DetailGlacier,     aurora: DetailAurora     },
  actions:   { pearl: ActionsPearl,    glacier: ActionsGlacier,    aurora: ActionsAurora    },
  projects:  { pearl: ProjectsPearl,   glacier: ProjectsGlacier,   aurora: ProjectsAurora   },
  mobile:    { pearl: MobileNavPearl,  glacier: MobileNavGlacier,  aurora: MobileNavAurora  },
};

const BG_GRADIENTS = {
  pearl:   'radial-gradient(ellipse at 15% 40%, rgba(20,184,166,0.10) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(148,163,184,0.10) 0%, transparent 50%), radial-gradient(ellipse at 60% 85%, rgba(99,102,241,0.07) 0%, transparent 50%), #f0f4f8',
  glacier: 'radial-gradient(ellipse at 20% 30%, rgba(20,184,166,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(100,116,139,0.10) 0%, transparent 55%), #e8edf5',
  aurora:  'radial-gradient(ellipse at 10% 50%, rgba(20,184,166,0.14) 0%, transparent 55%), radial-gradient(ellipse at 90% 20%, rgba(99,102,241,0.10) 0%, transparent 50%), radial-gradient(ellipse at 50% 90%, rgba(245,158,11,0.07) 0%, transparent 40%), #eef2f8',
};

function App() {
  const [tweaks, setTweaks] = React.useState(TWEAK_DEFAULTS);
  const [page, setPage] = React.useState('dashboard');
  const [tweaksOpen, setTweaksOpen] = React.useState(false);
  const variant = tweaks.variant;
  const layoutMode = tweaks.layoutMode || 'split';

  // Tweaks panel protocol
  React.useEffect(() => {
    const handler = e => {
      if (e.data?.type === '__activate_edit_mode')   setTweaksOpen(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const applyTweak = (key, val) => {
    const next = { ...tweaks, [key]: val };
    setTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: val } }, '*');
  };

  const PageComp = PAGE_MAP[page]?.[variant];
  const navigate = p => setPage(p);

  const sidebarGlass = variant === 'aurora'
    ? { background:'rgba(255,255,255,0.22)', backdropFilter:'blur(28px)', WebkitBackdropFilter:'blur(28px)', borderRight:'1px solid rgba(255,255,255,0.3)' }
    : variant === 'glacier'
    ? { background:'rgba(241,245,249,0.6)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', borderRight:'1px solid rgba(203,213,225,0.4)' }
    : { background:'rgba(255,255,255,0.55)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', borderRight:'1px solid rgba(255,255,255,0.7)' };

  // Layout mode icons
  const layoutIcons = {
    desktop: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    split:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="12" y1="3" x2="12" y2="17"/><rect x="8" y="19" width="8" height="4" rx="1"/></svg>,
    mobile:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  };

  const PhoneFrame = ({ accent }) => (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', padding:'16px 0' }}>
      <div style={{ fontSize:11, fontFamily:'Inter,sans-serif', fontWeight:600, color:'#94a3b8', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:10 }}>Mobile Preview</div>
      <IOSDevice width={375} height={760} style={{ flex:1 }}>
        <MobileApp accent={accent} />
      </IOSDevice>
    </div>
  );

  return (
    <div style={{ width:'100vw', height:'100vh', background: BG_GRADIENTS[variant], display:'flex', overflow:'hidden', transition:'background 400ms ease' }}>
      {/* Sidebar — hidden in mobile-only mode */}
      {layoutMode !== 'mobile' && <div style={{ width:220, height:'100%', flexShrink:0, display:'flex', flexDirection:'column', ...sidebarGlass, zIndex:10 }}>
        {/* Logo */}
        <div style={{ padding:'24px 20px 20px', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:`linear-gradient(135deg, ${tweaks.accentColor}, ${tweaks.accentColor}99)`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 3px 10px ${tweaks.accentColor}40` }}>
            <Icon.mic style={{ color:'white' }} />
          </div>
          <div>
            <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:800, fontSize:15, color:'#0f172a', letterSpacing:'-0.01em' }}>NoteAI</div>
            <div style={{ fontSize:10, color:'#94a3b8', fontFamily:'Inter, sans-serif' }}>Meeting Intelligence</div>
          </div>
        </div>

        <Divider style={{ margin:'0 16px' }} />

        {/* Nav items */}
        <nav style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:2 }}>
          {NAV_ITEMS.map(item => {
            const active = page === item.id;
            const IconComp = Icon[item.icon];
            return (
              <button key={item.id} onClick={() => setPage(item.id)} style={{
                display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10,
                border:'none', cursor:'pointer', fontFamily:'Inter, sans-serif', fontSize:13.5, fontWeight: active?600:400,
                background: active ? (variant==='aurora'?`${tweaks.accentColor}18`:'rgba(255,255,255,0.7)') : 'transparent',
                color: active ? (variant==='aurora'?tweaks.accentColor:'#0f172a') : '#64748b',
                boxShadow: active ? '0 1px 6px rgba(0,0,0,0.07)' : 'none',
                transition:'all 180ms', textAlign:'left', width:'100%',
              }}>
                <span style={{ color: active ? tweaks.accentColor : '#94a3b8', display:'flex' }}><IconComp /></span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <Divider style={{ margin:'0 16px' }} />

        {/* User */}
        <div style={{ padding:'14px 16px 20px', display:'flex', alignItems:'center', gap:10 }}>
          <Avatar name="Alex" size={32} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:600, fontFamily:'Inter, sans-serif', color:'#1e293b' }}>Alex Martin</div>
            <div style={{ fontSize:11, color:'#94a3b8', fontFamily:'Inter, sans-serif' }}>Pro plan</div>
          </div>
          <button style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', display:'flex' }}><Icon.settings /></button>
        </div>
      </div>}

      {/* Main content area — hidden in mobile-only mode */}
      {layoutMode !== 'mobile' && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>
          {/* Top bar */}
          <div style={{ height:60, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px',
            background: variant==='glacier'?'rgba(241,245,249,0.5)':'rgba(255,255,255,0.3)',
            backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
            borderBottom:'1px solid rgba(255,255,255,0.5)', zIndex:5 }}>
            <div style={{ fontFamily:'Inter, sans-serif', fontSize:13, color:'#64748b' }}>
              {NAV_ITEMS.find(n=>n.id===page)?.label}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {/* Layout mode toggle */}
              <div style={{ display:'flex', gap:2, background:'rgba(255,255,255,0.5)', borderRadius:9, padding:3, border:'1px solid rgba(255,255,255,0.7)' }}>
                {Object.entries(layoutIcons).map(([k, ico]) => (
                  <button key={k} onClick={() => applyTweak('layoutMode', k)} title={k.charAt(0).toUpperCase()+k.slice(1)} style={{
                    width:30, height:28, borderRadius:6, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 180ms',
                    background: layoutMode===k?'rgba(255,255,255,0.95)':'transparent',
                    color: layoutMode===k?tweaks.accentColor:'#94a3b8',
                    boxShadow: layoutMode===k?'0 1px 5px rgba(0,0,0,0.08)':'none',
                  }}>{ico}</button>
                ))}
              </div>
              {/* Variant switcher */}
              <div style={{ display:'flex', gap:3, background:'rgba(255,255,255,0.5)', borderRadius:10, padding:3, border:'1px solid rgba(255,255,255,0.7)' }}>
                {Object.entries(VARIANT_META).map(([k,v]) => (
                  <button key={k} onClick={() => applyTweak('variant', k)} style={{
                    padding:'4px 12px', borderRadius:7, border:'none', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif', fontWeight:500, transition:'all 180ms',
                    background: variant===k?'rgba(255,255,255,0.95)':'transparent',
                    color: variant===k?'#0f172a':'#64748b',
                    boxShadow: variant===k?'0 1px 5px rgba(0,0,0,0.08)':'none',
                  }}>{v.label}</button>
                ))}
              </div>
              <button style={{ width:36,height:36,borderRadius:9,background:'rgba(255,255,255,0.5)',border:'1px solid rgba(255,255,255,0.7)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b' }}><Icon.bell /></button>
            </div>
          </div>

          {/* Page content */}
          <div style={{ flex:1, overflow:'auto', padding:24 }}>
            {PageComp && <PageComp onNavigate={navigate} accentColor={tweaks.accentColor} />}
          </div>
        </div>
      )}

      {/* Mobile-only full screen view */}
      {layoutMode === 'mobile' && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ height:60, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px',
            background:'rgba(255,255,255,0.3)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
            borderBottom:'1px solid rgba(255,255,255,0.5)', zIndex:5 }}>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:15, color:'#0f172a' }}>Mobile Preview</div>
            <div style={{ display:'flex', gap:2, background:'rgba(255,255,255,0.5)', borderRadius:9, padding:3, border:'1px solid rgba(255,255,255,0.7)' }}>
              {Object.entries(layoutIcons).map(([k, ico]) => (
                <button key={k} onClick={() => applyTweak('layoutMode', k)} title={k} style={{
                  width:30, height:28, borderRadius:6, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 180ms',
                  background: layoutMode===k?'rgba(255,255,255,0.95)':'transparent',
                  color: layoutMode===k?tweaks.accentColor:'#94a3b8',
                  boxShadow: layoutMode===k?'0 1px 5px rgba(0,0,0,0.08)':'none',
                }}>{ico}</button>
              ))}
            </div>
          </div>
          <div style={{ flex:1, overflow:'auto' }}>
            <PhoneFrame accent={tweaks.accentColor} />
          </div>
        </div>
      )}

      {/* Split: phone panel on right */}
      {layoutMode === 'split' && (
        <div style={{ width:360, flexShrink:0, borderLeft:'1px solid rgba(255,255,255,0.4)',
          background: variant==='glacier'?'rgba(241,245,249,0.4)':'rgba(255,255,255,0.2)',
          backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', overflow:'hidden' }}>
          <PhoneFrame accent={tweaks.accentColor} />
        </div>
      )}

      {/* Tweaks Panel */}
      {tweaksOpen && (
        <div style={{ position:'fixed', bottom:20, right:20, width:260, background:'rgba(255,255,255,0.85)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
          borderRadius:16, border:'1px solid rgba(255,255,255,0.8)', boxShadow:'0 8px 40px rgba(0,0,0,0.12)', zIndex:1000, overflow:'hidden' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(148,163,184,0.15)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:14, color:'#0f172a' }}>Tweaks</div>
            <button onClick={()=>{ setTweaksOpen(false); window.parent.postMessage({type:'__edit_mode_dismissed'},'*'); }}
              style={{ background:'none',border:'none',cursor:'pointer',color:'#94a3b8',fontSize:18,lineHeight:1,padding:0 }}>×</button>
          </div>
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <div style={{ fontSize:11, fontFamily:'Inter, sans-serif', fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Style Variant</div>
              {Object.entries(VARIANT_META).map(([k,v]) => (
                <button key={k} onClick={()=>applyTweak('variant',k)} style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%',
                  padding:'8px 10px', borderRadius:8, border:'none', cursor:'pointer', marginBottom:4, transition:'all 160ms',
                  background: variant===k?`${tweaks.accentColor}12`:'rgba(248,250,252,0.8)',
                  outline: variant===k?`1.5px solid ${tweaks.accentColor}40`:'none',
                }}>
                  <span style={{ fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:600, color: variant===k?tweaks.accentColor:'#334155' }}>{v.label}</span>
                  <span style={{ fontFamily:'Inter, sans-serif', fontSize:11, color:'#94a3b8' }}>{v.desc}</span>
                </button>
              ))}
            </div>
            <div>
              <div style={{ fontSize:11, fontFamily:'Inter, sans-serif', fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Accent Color</div>
              <div style={{ display:'flex', gap:8 }}>
                {['#14b8a6','#6366f1','#f59e0b','#ec4899','#3b82f6','#10b981'].map(c => (
                  <button key={c} onClick={()=>applyTweak('accentColor',c)} style={{
                    width:28,height:28,borderRadius:99,background:c,border:'none',cursor:'pointer',
                    boxShadow: tweaks.accentColor===c?`0 0 0 2px white, 0 0 0 4px ${c}`:'none',
                    transition:'box-shadow 150ms',
                  }} />
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize:11, fontFamily:'Inter, sans-serif', fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Blur Intensity: {tweaks.blurAmount}px</div>
              <input type="range" min={8} max={48} step={4} value={tweaks.blurAmount} onChange={e=>applyTweak('blurAmount',+e.target.value)}
                style={{ width:'100%', accentColor:tweaks.accentColor }} />
            </div>
            <div>
              <div style={{ fontSize:11, fontFamily:'Inter, sans-serif', fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>AI Insights</div>
              <button onClick={()=>applyTweak('showAIInsights',!tweaks.showAIInsights)} style={{
                display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', padding:0,
              }}>
                <div style={{ width:38,height:22,borderRadius:99,background:tweaks.showAIInsights?tweaks.accentColor:'#cbd5e1',transition:'background 200ms',position:'relative' }}>
                  <div style={{ width:16,height:16,borderRadius:99,background:'white',position:'absolute',top:3,left:tweaks.showAIInsights?19:3,transition:'left 200ms',boxShadow:'0 1px 4px rgba(0,0,0,0.15)' }} />
                </div>
                <span style={{ fontFamily:'Inter, sans-serif', fontSize:13, color:'#334155' }}>Show AI Insights</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
