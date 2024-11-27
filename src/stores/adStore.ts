import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Ad } from '../types/youtube';

interface AdStore {
  ads: Ad[];
  adPlayCounts: Record<string, number>;
  loading: boolean;
  error: string | null;
  fetchAds: () => Promise<void>;
  createAd: (ad: Omit<Ad, 'id'>) => Promise<void>;
  updateAd: (id: string, ad: Partial<Ad>) => Promise<void>;
  deleteAd: (id: string) => Promise<void>;
  toggleAdStatus: (id: string) => Promise<void>;
  incrementAdPlayCount: (id: string) => Promise<void>;
  shouldPlayAd: (ad: Ad) => boolean;
}

export const useAdStore = create<AdStore>((set, get) => ({
  ads: [],
  adPlayCounts: {},
  loading: false,
  error: null,

  fetchAds: async () => {
    set({ loading: true, error: null });
    try {
      // Fetch ads and their play counts in parallel
      const [adsResponse, countsResponse] = await Promise.all([
        supabase
          .from('ads')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('ad_play_counts')
          .select('ad_id, count')
      ]);

      if (adsResponse.error) throw adsResponse.error;
      if (countsResponse.error) throw countsResponse.error;

      // Transform ads data
      const transformedData = (adsResponse.data || []).map(ad => ({
        id: ad.id,
        name: ad.name,
        url: ad.url,
        type: ad.type,
        skipAfter: ad.skip_after,
        interval: ad.interval,
        maxPlays: ad.max_plays,
        enabled: ad.enabled,
        createdAt: ad.created_at,
        updatedAt: ad.updated_at
      }));

      // Transform play counts into a record
      const playCounts = (countsResponse.data || []).reduce((acc, curr) => {
        acc[curr.ad_id] = curr.count;
        return acc;
      }, {} as Record<string, number>);

      set({ 
        ads: transformedData,
        adPlayCounts: playCounts
      });
    } catch (error) {
      console.error('Error fetching ads:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createAd: async (ad) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('ads')
        .insert([{
          name: ad.name,
          url: ad.url,
          type: ad.type,
          skip_after: ad.skipAfter,
          interval: ad.interval,
          max_plays: ad.maxPlays || 0,
          enabled: ad.enabled
        }]);

      if (error) throw error;
      
      await get().fetchAds();
    } catch (error) {
      console.error('Error creating ad:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  updateAd: async (id, ad) => {
    set({ loading: true, error: null });
    try {
      const updateData: any = {
        ...(ad.name && { name: ad.name }),
        ...(ad.url && { url: ad.url }),
        ...(ad.type && { type: ad.type }),
        ...(ad.skipAfter !== undefined && { skip_after: ad.skipAfter }),
        ...(ad.interval !== undefined && { interval: ad.interval }),
        ...(ad.maxPlays !== undefined && { max_plays: ad.maxPlays }),
        ...(ad.enabled !== undefined && { enabled: ad.enabled })
      };

      const { error } = await supabase
        .from('ads')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await get().fetchAds();
    } catch (error) {
      console.error('Error updating ad:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  deleteAd: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Play counts will be automatically deleted due to CASCADE
      set(state => ({
        ads: state.ads.filter(a => a.id !== id),
        adPlayCounts: {
          ...state.adPlayCounts,
          [id]: undefined
        }
      }));
    } catch (error) {
      console.error('Error deleting ad:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  toggleAdStatus: async (id) => {
    const ad = get().ads.find(a => a.id === id);
    if (!ad) return;

    await get().updateAd(id, { enabled: !ad.enabled });
  },

  incrementAdPlayCount: async (id: string) => {
    try {
      const { error } = await supabase.rpc('increment_ad_play_count', {
        ad_id_param: id
      });

      if (error) throw error;

      // Update local state
      set(state => ({
        adPlayCounts: {
          ...state.adPlayCounts,
          [id]: (state.adPlayCounts[id] || 0) + 1
        }
      }));
    } catch (error) {
      console.error('Error incrementing ad play count:', error);
    }
  },

  shouldPlayAd: (ad: Ad) => {
    const state = get();
    const playCount = state.adPlayCounts[ad.id] || 0;
    return ad.enabled && (!ad.maxPlays || playCount < ad.maxPlays);
  }
}));