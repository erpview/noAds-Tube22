import { useState, useEffect } from 'react';
import type { Ad } from '../types/youtube';

const LOCAL_STORAGE_KEY = 'video-player-ads';

export function useAds() {
  const [ads, setAds] = useState<Ad[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ads));
  }, [ads]);

  const addAd = (ad: Omit<Ad, 'id'>) => {
    const newAd = { ...ad, id: crypto.randomUUID() };
    setAds(prev => [...prev, newAd]);
  };

  const updateAd = (id: string, updates: Partial<Ad>) => {
    setAds(prev => prev.map(ad => 
      ad.id === id ? { ...ad, ...updates } : ad
    ));
  };

  const deleteAd = (id: string) => {
    setAds(prev => prev.filter(ad => ad.id !== id));
  };

  const toggleAdStatus = (id: string) => {
    setAds(prev => prev.map(ad =>
      ad.id === id ? { ...ad, enabled: !ad.enabled } : ad
    ));
  };

  return {
    ads,
    addAd,
    updateAd,
    deleteAd,
    toggleAdStatus
  };
}