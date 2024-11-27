import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loading: false,
  error: null,

  initialize: async () => {
    set({ loading: true, error: null });
    try {
      // Get session from storage
      const { data: { session } } = await supabase.auth.getSession();
      set({ session });

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session });
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      set({ session: data.session });
    } catch (error) {
      console.error('Sign in error:', error);
      set({ error: (error as Error).message });
      throw error; // Re-throw to handle in component
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ session: null });
    } catch (error) {
      console.error('Sign out error:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));