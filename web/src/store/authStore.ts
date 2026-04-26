'use client';

import { create } from 'zustand';
import { getPocketBaseClient, getCurrentUser, logout as pbLogout } from '@/lib/pocketbase';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
}

const TOKEN_COOKIE = 'pb_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function setTokenCookie(token: string) {
  document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function clearTokenCookie() {
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  initialize: () => {
    const pb = getPocketBaseClient();
    if (pb.authStore.isValid) {
      const user = getCurrentUser();
      set({ user });
    } else {
      set({ user: null });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const pb = getPocketBaseClient();
      await pb.collection('user_ai').authWithPassword(email, password);
      const user = getCurrentUser();
      // Persist token in cookie so middleware can read it
      setTokenCookie(pb.authStore.token);
      set({ user, isLoading: false, error: null });
    } catch (err: any) {
      const message =
        err?.response?.message || err?.message || 'Invalid email or password';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    await pbLogout();
    clearTokenCookie();
    set({ user: null, error: null });
  },
}));
