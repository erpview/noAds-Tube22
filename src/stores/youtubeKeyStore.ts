import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { YouTubeApiKey } from '../types/youtube';

interface YouTubeKeyStore {
  keys: YouTubeApiKey[];
  currentKeyId: string | null;
  loading: boolean;
  error: string | null;
  fetchKeys: () => Promise<void>;
  addKey: (key: Omit<YouTubeApiKey, 'id' | 'quotaUsed' | 'createdAt'>) => Promise<void>;
  updateKey: (id: string, updates: Partial<YouTubeApiKey>) => Promise<void>;
  deleteKey: (id: string) => Promise<void>;
  getCurrentKey: () => Promise<{ id: string; key: string } | null>;
  incrementQuota: (keyId: string, amount?: number) => Promise<void>;
  setQuota: (keyId: string, quota: number) => Promise<void>;
}

export const useYouTubeKeyStore = create<YouTubeKeyStore>((set, get) => ({
  keys: [],
  currentKeyId: null,
  loading: false,
  error: null,

  fetchKeys: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('youtube_api_keys')
        .select('*')
        .eq('enabled', true)
        .order('quota_used', { ascending: true });

      if (error) throw error;

      // Transform snake_case to camelCase
      const transformedData = (data || []).map(key => ({
        id: key.id,
        key: key.key,
        name: key.name,
        enabled: key.enabled,
        quotaUsed: key.quota_used,
        lastUsed: key.last_used,
        createdAt: key.created_at
      }));

      set({ keys: transformedData });

      // If no current key is set, set it to the first available key
      const { currentKeyId } = get();
      if (!currentKeyId && transformedData.length > 0) {
        const availableKey = transformedData.find(k => k.quotaUsed < 10000);
        if (availableKey) {
          set({ currentKeyId: availableKey.id });
        }
      }
    } catch (error) {
      console.error('Error fetching YouTube API keys:', error);
      set({ error: 'Failed to load API keys' });
    } finally {
      set({ loading: false });
    }
  },

  addKey: async (key) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('youtube_api_keys')
        .insert([{
          name: key.name,
          key: key.key,
          enabled: key.enabled,
          quota_used: 0
        }])
        .select()
        .single();

      if (error) throw error;

      // If this is the first key, set it as current
      if (!get().currentKeyId) {
        set({ currentKeyId: data.id });
      }

      await get().fetchKeys();
    } catch (error) {
      console.error('Error adding YouTube API key:', error);
      set({ error: 'Failed to add API key' });
    } finally {
      set({ loading: false });
    }
  },

  updateKey: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const transformedUpdates: any = {
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.key !== undefined && { key: updates.key }),
        ...(updates.enabled !== undefined && { enabled: updates.enabled }),
        ...(updates.quotaUsed !== undefined && { quota_used: updates.quotaUsed }),
        ...(updates.lastUsed !== undefined && { last_used: updates.lastUsed })
      };

      const { error } = await supabase
        .from('youtube_api_keys')
        .update(transformedUpdates)
        .eq('id', id);

      if (error) throw error;

      // If we're disabling the current key, switch to the next available one
      if (updates.enabled === false && id === get().currentKeyId) {
        const nextKey = get().keys.find(k => k.id !== id && k.enabled && k.quotaUsed < 10000);
        set({ currentKeyId: nextKey?.id || null });
      }

      await get().fetchKeys();
    } catch (error) {
      console.error('Error updating YouTube API key:', error);
      set({ error: 'Failed to update API key' });
    } finally {
      set({ loading: false });
    }
  },

  deleteKey: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('youtube_api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // If we're deleting the current key, switch to the next available one
      if (id === get().currentKeyId) {
        const nextKey = get().keys.find(k => k.id !== id && k.enabled && k.quotaUsed < 10000);
        set({ currentKeyId: nextKey?.id || null });
      }

      await get().fetchKeys();
    } catch (error) {
      console.error('Error deleting YouTube API key:', error);
      set({ error: 'Failed to delete API key' });
    } finally {
      set({ loading: false });
    }
  },

  getCurrentKey: async () => {
    const { currentKeyId, keys } = get();
    let currentKey = currentKeyId ? keys.find(k => k.id === currentKeyId) : null;

    // If current key is exhausted or disabled, find the next available key
    if (!currentKey || !currentKey.enabled || currentKey.quotaUsed >= 10000) {
      currentKey = keys.find(k => k.enabled && k.quotaUsed < 10000);
      if (currentKey) {
        set({ currentKeyId: currentKey.id });
      } else {
        set({ currentKeyId: null, error: 'All API keys have reached their quota limit' });
        return null;
      }
    }

    if (!currentKey) {
      set({ error: 'No API keys available' });
      return null;
    }

    // Update last used timestamp
    await get().updateKey(currentKey.id, {
      lastUsed: new Date().toISOString()
    });

    return {
      id: currentKey.id,
      key: currentKey.key
    };
  },

  incrementQuota: async (keyId: string, amount = 1) => {
    try {
      const { error } = await supabase.rpc('increment_youtube_key_quota', {
        key_id: keyId,
        increment_amount: amount
      });

      if (error) throw error;

      // Check if the key is now exhausted
      const key = get().keys.find(k => k.id === keyId);
      if (key && key.quotaUsed + amount >= 10000) {
        // Find next available key
        const nextKey = get().keys.find(k => k.id !== keyId && k.enabled && k.quotaUsed < 10000);
        set({ currentKeyId: nextKey?.id || null });
      }

      await get().fetchKeys();
    } catch (error) {
      console.error('Error incrementing quota:', error);
    }
  },

  setQuota: async (keyId: string, quota: number) => {
    try {
      const { error } = await supabase
        .from('youtube_api_keys')
        .update({ quota_used: quota })
        .eq('id', keyId);

      if (error) throw error;

      // If the key is exhausted, switch to next available one
      if (quota >= 10000) {
        const nextKey = get().keys.find(k => k.id !== keyId && k.enabled && k.quotaUsed < 10000);
        set({ currentKeyId: nextKey?.id || null });
      }

      await get().fetchKeys();
    } catch (error) {
      console.error('Error setting quota:', error);
    }
  }
}));