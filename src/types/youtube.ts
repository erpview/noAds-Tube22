export interface VideoDetails {
  id: string;
  platform: 'youtube' | 'wistia' | 'vimeo';
}

export interface Ad {
  id: string;
  name: string;
  url: string;
  type: 'pre-roll' | 'mid-roll';
  platform: 'youtube' | 'vimeo';
  skipAfter: number;
  interval?: number;
  maxPlays?: number;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdState {
  currentTime: number;
  isPlaying: boolean;
  showPreRoll: boolean;
  showMidRoll: boolean;
  currentAd: Ad | null;
}

export interface YouTubeApiKey {
  id: string;
  key: string;
  name: string;
  enabled: boolean;
  quotaUsed: number;
  lastUsed?: string;
  createdAt: string;
}