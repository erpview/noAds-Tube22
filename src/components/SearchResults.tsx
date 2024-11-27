import React, { useEffect } from 'react';
import type { YouTubeSearchResult } from '../lib/youtube';
import { Play, Clock, Loader2, Plus, Check } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { addFavoriteChannel, getFavoriteChannels } from '../lib/supabase';

interface SearchResultsProps {
  results: YouTubeSearchResult[];
  onVideoSelect: (videoId: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

export function SearchResults({ 
  results, 
  onVideoSelect, 
  onLoadMore,
  hasMore,
  isLoading 
}: SearchResultsProps) {
  const { profile } = useUserStore();
  const [savingChannels, setSavingChannels] = React.useState<Record<string, boolean>>({});
  const [savedChannels, setSavedChannels] = React.useState<Record<string, boolean>>({});

  // Fetch user's favorite channels when component mounts or results change
  useEffect(() => {
    if (profile?.id && results.length > 0) {
      const channelIds = results.map(result => result.snippet.channelId);
      checkFavoriteChannels(profile.id, channelIds);
    }
  }, [profile?.id, results]);

  const checkFavoriteChannels = async (userId: string, channelIds: string[]) => {
    try {
      const favorites = await getFavoriteChannels(userId);
      const favoriteMap = favorites.reduce((acc: Record<string, boolean>, channel: any) => {
        acc[channel.channel_id] = true;
        return acc;
      }, {});
      setSavedChannels(favoriteMap);
    } catch (error) {
      console.error('Error checking favorite channels:', error);
    }
  };

  const handleAddChannel = async (result: YouTubeSearchResult) => {
    if (!profile || savedChannels[result.snippet.channelId]) return;

    setSavingChannels(prev => ({ ...prev, [result.snippet.channelId]: true }));
    try {
      await addFavoriteChannel(profile.id, {
        channel_id: result.snippet.channelId,
        channel_name: result.snippet.channelTitle,
        channel_thumbnail: result.snippet.thumbnails.medium.url
      });
      setSavedChannels(prev => ({ ...prev, [result.snippet.channelId]: true }));
    } catch (error) {
      console.error('Error adding channel:', error);
    } finally {
      setSavingChannels(prev => ({ ...prev, [result.snippet.channelId]: false }));
    }
  };

  if (results.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minutes ago`;
      }
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((video) => (
          <div
            key={video.id.videoId}
            className="bg-gray-800/30 rounded-xl overflow-hidden group hover:bg-gray-800/50 transition-all duration-300 backdrop-blur-sm border border-gray-700/30 hover:border-red-500/30"
          >
            <div className="relative aspect-video">
              <img
                src={video.snippet.thumbnails.medium.url}
                alt={video.snippet.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button
                  onClick={() => onVideoSelect(video.id.videoId)}
                  className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-transform transform hover:scale-110"
                >
                  <Play className="w-8 h-8" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold line-clamp-2 text-left mb-2">
                {video.snippet.title}
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 text-left flex items-center gap-2">
                    {video.snippet.channelTitle}
                    {profile?.is_approved && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!savedChannels[video.snippet.channelId]) {
                            handleAddChannel(video);
                          }
                        }}
                        disabled={savingChannels[video.snippet.channelId] || savedChannels[video.snippet.channelId]}
                        className={`p-1 rounded-md transition-colors ${
                          savedChannels[video.snippet.channelId]
                            ? 'bg-red-500/20 text-red-500'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                        title={savedChannels[video.snippet.channelId] ? 'Channel in favorites' : 'Add channel to favorites'}
                      >
                        {savingChannels[video.snippet.channelId] ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : savedChannels[video.snippet.channelId] ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Plus className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </p>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(video.snippet.publishedAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-700 text-white px-8 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 font-semibold disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              'Show More Results'
            )}
          </button>
        </div>
      )}
    </div>
  );
}