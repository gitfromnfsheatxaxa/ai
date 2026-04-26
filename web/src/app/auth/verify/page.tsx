'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, Mic } from 'lucide-react';
import { getPocketBaseClient } from '@/lib/pocketbase';
import { useAuthStore } from '@/store/authStore';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export default function VerifyPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { initialize } = useAuthStore();
  const [status, setStatus]   = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('t');
    if (!token) {
      setStatus('error');
      setErrorMsg('No token in the link. Please request a new one from the bot.');
      return;
    }

    (async () => {
      try {
        const res  = await fetch(`/api/auth/verify?t=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        const { token: pbToken, record } = data;

        // Persist in PocketBase auth store (auto-loads on next getPocketBaseClient() call)
        const pb = getPocketBaseClient();
        pb.authStore.save(pbToken, record);

        // Persist in cookie so server middleware can read it
        document.cookie = `pb_auth=${pbToken}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;

        // Sync Zustand
        initialize();

        setStatus('success');
        setTimeout(() => router.push('/'), 1200);
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message || 'Something went wrong.');
      }
    })();
  }, [searchParams, initialize, router]);

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
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
        style={{
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.75)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.06)',
          borderRadius: 24,
          padding: '44px 40px',
          minWidth: 300,
          maxWidth: 380,
        }}
      >
        {/* Logo */}
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
          style={{
            background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
            boxShadow: '0 4px 20px rgba(20,184,166,0.4)',
          }}
        >
          <Mic className="w-7 h-7 text-white" />
        </div>

        {status === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 animate-spin text-teal-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-800">Signing you in…</h2>
            <p className="text-sm text-gray-500 mt-1">Verifying your Telegram link</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 220 }}
            >
              <CheckCircle2 className="w-12 h-12 text-teal-500 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-lg font-semibold text-gray-800">Signed in!</h2>
            <p className="text-sm text-gray-500 mt-1">Taking you to your dashboard…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Link invalid</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{errorMsg}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
            >
              Back to login
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
