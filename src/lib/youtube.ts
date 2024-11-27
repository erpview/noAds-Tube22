import { supabase } from './supabase';
import { useYouTubeKeyStore } from '../stores/youtubeKeyStore';

export interface YouTubeSearchResult {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
    channelTitle: string;
    channelId: string;
    publishedAt: string;
  };
}

export interface YouTubeSearchResponse {
  items: YouTubeSearchResult[];
  nextPageToken?: string;
}

interface QuotaResponse {
  items: [{
    id: string;
    statistics: {
      quotaLimitValue: string;
      quotaUsageValue: string;
    };
  }];
}

async function getApiKey(): Promise<{ id: string; key: string } | null> {
  await useYouTubeKeyStore.getState().fetchKeys();
  const currentKey = await useYouTubeKeyStore.getState().getCurrentKey();
  
  if (!currentKey) {
    throw new Error('No YouTube API keys available. Please contact the administrator.');
  }

  return currentKey;
}

async function fetchQuotaUsage(apiKey: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('youtube_api_keys')
      .select('quota_used')
      .eq('key', apiKey)
      .single();

    if (error) throw error;
    return data?.quota_used || 0;
  } catch (error) {
    console.error('Error fetching quota usage:', error);
    return 0;
  }
}

async function updateQuotaUsage(keyId: string, apiKey: string) {
  try {
    const quotaUsed = await fetchQuotaUsage(apiKey);
    if (quotaUsed >= 0) {
      await useYouTubeKeyStore.getState().setQuota(keyId, quotaUsed);
    }
  } catch (error) {
    console.error('Error updating quota usage:', error);
  }
}

async function registerQuotaUsage(keyId: string, apiKey: string, operation: 'search' | 'list', items: number) {
  try {
    const quotaCost = operation === 'search' ? 100 : items;
    await useYouTubeKeyStore.getState().incrementQuota(keyId, quotaCost);
  } catch (error) {
    console.error('Failed to register quota usage:', error);
  }
}

export async function searchYouTubeVideos(
  query: string,
  pageToken?: string
): Promise<YouTubeSearchResponse> {
  if (!query.trim()) return { items: [] };

  try {
    const apiKeyData = await getApiKey();
    if (!apiKeyData) {
      throw new Error('No available API keys');
    }

    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    const params = {
      part: 'snippet',
      maxResults: '12',
      q: query,
      type: 'video',
      order: 'date',
      key: apiKeyData.key,
      ...(pageToken && { pageToken })
    };

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.error?.status === 'RESOURCE_EXHAUSTED') {
        await updateQuotaUsage(apiKeyData.id, apiKeyData.key);
        return searchYouTubeVideos(query, pageToken);
      }
      throw new Error(errorData.error?.message || 'YouTube API request failed');
    }

    const data = await response.json();
    
    if (!data.items) {
      throw new Error('No results found');
    }

    await registerQuotaUsage(apiKeyData.id, apiKeyData.key, 'search', data.items.length);

    return {
      items: data.items,
      nextPageToken: data.nextPageToken
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`YouTube search failed: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while searching YouTube');
  }
}

export async function getChannelVideos(
  channelId: string,
  pageToken?: string
): Promise<YouTubeSearchResponse> {
  try {
    const apiKeyData = await getApiKey();
    if (!apiKeyData) {
      throw new Error('No available API keys');
    }

    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    const params = {
      part: 'snippet',
      channelId,
      maxResults: '12',
      order: 'date',
      type: 'video',
      key: apiKeyData.key,
      ...(pageToken && { pageToken })
    };

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.error?.status === 'RESOURCE_EXHAUSTED') {
        await updateQuotaUsage(apiKeyData.id, apiKeyData.key);
        return getChannelVideos(channelId, pageToken);
      }
      throw new Error(errorData.error?.message || 'Failed to fetch channel videos');
    }

    const data = await response.json();
    
    if (!data.items) {
      throw new Error('No videos found for this channel');
    }

    await registerQuotaUsage(apiKeyData.id, apiKeyData.key, 'search', data.items.length);

    return {
      items: data.items,
      nextPageToken: data.nextPageToken
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Channel videos fetch failed: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching channel videos');
  }
}

export async function checkQuotaUsage(apiKey: string): Promise<number> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=UC_x5XG1OV2P6uZZ5FSM9Ttw&key=${apiKey}`
    );
    
    // If the request fails due to quota, it means we've hit the limit
    if (!response.ok) {
      const error = await response.json();
      if (error.error?.status === 'RESOURCE_EXHAUSTED') {
        return 10000; // Max quota reached
      }
      if (error.error?.status === 'API_KEY_INVALID') {
        throw new Error('Invalid API key');
      }
    }
    
    // If the request succeeds, it costs 1 quota unit
    return 1;
  } catch (error) {
    console.error('Error checking quota:', error);
    throw error;
  }
}

export async function checkAllKeysQuota(): Promise<void> {
  const store = useYouTubeKeyStore.getState();
  const keys = store.keys;
  
  for (const key of keys) {
    try {
      const quotaUsed = await checkQuotaUsage(key.key);
      await store.setQuota(key.id, quotaUsed);
      console.log(`Updated quota for key ${key.name}: ${quotaUsed}/10000`);
    } catch (error) {
      console.error(`Failed to check quota for key ${key.name}:`, error);
    }
  }
}