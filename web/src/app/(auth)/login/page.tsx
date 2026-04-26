'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ExternalLink, Mic, KeyRound, ArrowRight, Loader2 } from 'lucide-react';

const BOT_USERNAME = process.env.NEXT_PUBLIC_BOT_USERNAME || '';

export default function LoginPage() {
  const router = useRouter();
  const [token, setToken]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const href = BOT_USERNAME
    ? `https://t.me/${BOT_USERNAME}?start=weblogin`
    : 'https://t.me/';

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = token.trim();
    if (!t) return;
    setLoading(true);
    setError('');
    try {
      // Redirect to verify page — same flow as clicking the bot link
      router.push(`/auth/verify?t=${encodeURIComponent(t)}`);
    } catch {
      setError('Something went wrong. Try again.');
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          'radial-gradient(ellipse at 20% 40%, rgba(20,184,166,0.10) 0%, transparent 55%),' +
          'radial-gradient(ellipse at 80% 20%, rgba(148,163,184,0.08) 0%, transparent 50%), #f0f4f8',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.62)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.75)',
            boxShadow: '0 4px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
            borderRadius: 24,
            padding: '40px 32px',
          }}
        >
          {/* Logo */}
          <div className="text-center mb-7">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 220 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                boxShadow: '0 6px 24px rgba(20,184,166,0.4)',
              }}
            >
              <Mic className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'DM Sans',sans-serif", letterSpacing:'-0.01em' }}>
              NoteAI
            </h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your meeting dashboard</p>
          </div>

          {/* ── Step 1: open bot ── */}
          <div
            className="rounded-2xl p-4 mb-4"
            style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)' }}
          >
            <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-3">Step 1 — Get your login code</p>
            <div className="space-y-2 text-xs text-gray-600 mb-4">
              <Step n={1} text={<>Open the Telegram bot and send <code className="bg-white/70 px-1 py-0.5 rounded">/weblogin</code></>} />
              <Step n={2} text="The bot replies with a login code" />
              <Step n={3} text="Copy the code and paste it below" />
            </div>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg,#0088cc,#006aaa)', boxShadow:'0 3px 12px rgba(0,136,204,0.3)', textDecoration:'none' }}
            >
              <TelegramIcon />
              Open Telegram bot
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>

          {/* ── Step 2: paste code ── */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(203,213,225,0.4)' }}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Step 2 — Paste login code</p>
            <form onSubmit={handleTokenSubmit} className="space-y-3">
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  placeholder="Paste code from bot…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none font-mono"
                  style={{
                    background: 'rgba(255,255,255,0.8)',
                    border: token ? '1px solid #14b8a6' : '1px solid rgba(203,213,225,0.5)',
                    boxShadow: token ? '0 0 0 3px rgba(20,184,166,0.12)' : 'none',
                    transition: 'all 200ms',
                  }}
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={!token.trim() || loading}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg,#14b8a6,#0d9488)',
                  boxShadow: '0 3px 12px rgba(20,184,166,0.3)',
                }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Sign in
              </button>
            </form>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Codes expire after 10 minutes · No password needed
        </p>
      </motion.div>
    </div>
  );
}

function Step({ n, text }: { n: number; text: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span
        className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold mt-0.5"
        style={{ background: '#14b8a6' }}
      >
        {n}
      </span>
      <span>{text}</span>
    </div>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="white" width="16" height="16" style={{ flexShrink: 0 }}>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.119.098.152.228.166.319.016.104.017.215.011.318z"/>
    </svg>
  );
}
