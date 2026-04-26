// Shared Glass Design System Components
// Exports to window for cross-file use

const DS = {
  // Glass card variants
  glass: {
    pearl: {
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.7)',
      boxShadow: '0 2px 20px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
    },
    glacier: {
      background: 'rgba(241,245,249,0.45)',
      backdropFilter: 'blur(28px)',
      WebkitBackdropFilter: 'blur(28px)',
      border: '1px solid rgba(203,213,225,0.5)',
      boxShadow: '0 4px 32px rgba(15,23,42,0.07), inset 0 1px 0 rgba(255,255,255,0.6)',
    },
    aurora: {
      background: 'rgba(255,255,255,0.12)',
      backdropFilter: 'blur(32px)',
      WebkitBackdropFilter: 'blur(32px)',
      border: '1px solid rgba(255,255,255,0.25)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.3)',
    },
  },
  teal: '#14b8a6',
  tealLight: 'rgba(20,184,166,0.12)',
  tealMid: 'rgba(20,184,166,0.22)',
};

function GlassCard({ children, style, className, variant = 'pearl', onClick, hover = true }) {
  const [hovered, setHovered] = React.useState(false);
  const base = DS.glass[variant] || DS.glass.pearl;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...base,
        borderRadius: 16,
        transition: 'transform 250ms ease, box-shadow 250ms ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered
          ? base.boxShadow.replace('rgba(0,0,0,0.04)', 'rgba(0,0,0,0.09)').replace('rgba(15,23,42,0.07)', 'rgba(15,23,42,0.12)').replace('rgba(0,0,0,0.08)', 'rgba(0,0,0,0.14)')
          : base.boxShadow,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Button({ children, variant = 'primary', size = 'md', onClick, style, icon }) {
  const [active, setActive] = React.useState(false);
  const sizes = { sm: { padding: '6px 14px', fontSize: 13 }, md: { padding: '9px 20px', fontSize: 14 }, lg: { padding: '12px 28px', fontSize: 15 } };
  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${DS.teal}, #0d9488)`,
      color: '#fff',
      border: 'none',
      boxShadow: `0 2px 12px rgba(20,184,166,0.35)`,
    },
    ghost: {
      background: 'rgba(255,255,255,0.35)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: '#334155',
      border: '1px solid rgba(255,255,255,0.6)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    },
    outline: {
      background: 'transparent',
      color: DS.teal,
      border: `1px solid ${DS.teal}`,
    },
    subtle: {
      background: DS.tealLight,
      color: DS.teal,
      border: 'none',
    },
    danger: {
      background: 'rgba(239,68,68,0.12)',
      color: '#ef4444',
      border: 'none',
    },
  };
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        ...sizes[size],
        ...variants[variant],
        borderRadius: 10,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'transform 150ms ease, opacity 150ms ease',
        transform: active ? 'scale(0.97)' : 'scale(1)',
        outline: 'none',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  );
}

function Badge({ children, color = 'teal', dot = false }) {
  const colors = {
    teal: { bg: 'rgba(20,184,166,0.12)', text: '#0d9488', dot: '#14b8a6' },
    blue: { bg: 'rgba(59,130,246,0.12)', text: '#2563eb', dot: '#3b82f6' },
    amber: { bg: 'rgba(245,158,11,0.12)', text: '#d97706', dot: '#f59e0b' },
    red: { bg: 'rgba(239,68,68,0.1)', text: '#dc2626', dot: '#ef4444' },
    slate: { bg: 'rgba(100,116,139,0.12)', text: '#475569', dot: '#94a3b8' },
    purple: { bg: 'rgba(139,92,246,0.12)', text: '#7c3aed', dot: '#8b5cf6' },
  };
  const c = colors[color] || colors.teal;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: c.bg, color: c.text,
      padding: '3px 9px', borderRadius: 99,
      fontSize: 12, fontWeight: 500, fontFamily: 'Inter, sans-serif',
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />}
      {children}
    </span>
  );
}

function Avatar({ name = 'U', size = 32, src, color }) {
  const colors = ['#14b8a6','#6366f1','#f59e0b','#ec4899','#3b82f6','#10b981'];
  const hue = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: src ? 'transparent' : `${hue}22`,
      border: src ? 'none' : `1.5px solid ${hue}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 600, color: hue,
      flexShrink: 0, overflow: 'hidden',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      {src ? <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : name[0].toUpperCase()}
    </div>
  );
}

function AvatarGroup({ names, size = 28, max = 4 }) {
  const shown = names.slice(0, max);
  const rest = names.length - max;
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      {shown.map((n, i) => (
        <div key={i} style={{
          marginLeft: i === 0 ? 0 : -(size * 0.28),
          position: 'relative',
          zIndex: shown.length - i,
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.9)',
          boxSizing: 'content-box',
          flexShrink: 0,
        }}>
          <Avatar name={n} size={size} />
        </div>
      ))}
      {rest > 0 && (
        <div style={{
          marginLeft: -(size * 0.28),
          position: 'relative', zIndex: 0,
          width: size, height: size, borderRadius: '50%',
          background: 'rgba(100,116,139,0.15)', color: '#475569',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.34, fontWeight: 600, fontFamily: 'Inter, sans-serif',
          border: '2px solid rgba(255,255,255,0.9)',
          boxSizing: 'content-box', flexShrink: 0,
        }}>+{rest}</div>
      )}
    </div>
  );
}

function ProgressBar({ value, max = 100, color = DS.teal, height = 4, glass = false }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{
      height, borderRadius: height,
      background: glass ? 'rgba(255,255,255,0.25)' : 'rgba(20,184,166,0.12)',
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%', width: `${pct}%`,
        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
        borderRadius: height,
        transition: 'width 600ms cubic-bezier(0.4,0,0.2,1)',
      }} />
    </div>
  );
}

function Input({ placeholder, value, onChange, icon, style }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: focused ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.45)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      border: focused ? `1px solid ${DS.teal}66` : '1px solid rgba(255,255,255,0.6)',
      borderRadius: 10, padding: '8px 12px',
      boxShadow: focused ? `0 0 0 3px ${DS.teal}15` : 'none',
      transition: 'all 200ms ease',
      ...style,
    }}>
      {icon && <span style={{ color: '#94a3b8', display: 'flex' }}>{icon}</span>}
      <input
        value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          border: 'none', background: 'transparent', outline: 'none',
          fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: '#1e293b',
          width: '100%',
        }}
      />
    </div>
  );
}

function Divider({ style }) {
  return <div style={{ height: 1, background: 'rgba(148,163,184,0.15)', ...style }} />;
}

function Tag({ children, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)',
      border: '1px solid rgba(203,213,225,0.5)',
      borderRadius: 6, padding: '3px 8px',
      fontSize: 12, color: '#475569', fontFamily: 'Inter, sans-serif',
    }}>
      {children}
      {onRemove && (
        <button onClick={onRemove} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
      )}
    </span>
  );
}

function Stat({ label, value, delta, icon }) {
  const up = delta > 0;
  return (
    <div>
      <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', color: '#0f172a', lineHeight: 1 }}>{value}</div>
      {delta !== undefined && (
        <div style={{ fontSize: 12, color: up ? '#10b981' : '#ef4444', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>
          {up ? '↑' : '↓'} {Math.abs(delta)}% this week
        </div>
      )}
    </div>
  );
}

// Icons as tiny SVGs
const Icon = {
  home: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  list: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  folder: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
  mic: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  search: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  bell: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  settings: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  arrow: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  ai: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  users: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  filter: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  grid: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  zap: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  link: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  more: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
};

Object.assign(window, { DS, GlassCard, Button, Badge, Avatar, AvatarGroup, ProgressBar, Input, Divider, Tag, Stat, Icon });
