import React from 'react';
import { Play, Clock, Loader2 } from 'lucide-react';

interface ChannelVideosProps {
  videos: any[];
  loading: boolean;
  error: string | null;
  onVideoSelect: (videoId: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

export function ChannelVideos({ videos, loading, error, onVideoSelect, onLoadMore, hasMore }: ChannelVideosProps) {
  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  if (videos.length === 0 && !loading) {
    return (
      <div className="text-center py-8 text-gray-400">
        No videos found for this channel
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <button
            key={video.id.videoId}
            onClick={() => onVideoSelect(video.id.videoId)}
            className="bg-gray-800/30 rounded-xl overflow-hidden group hover:bg-gray-800/50 transition-all duration-300 backdrop-blur-sm border border-gray-700/30 hover:border-red-500/30"
          >
            <div className="relative aspect-video">
              <img
                src={video.snippet.thumbnails.medium.url}
                alt={video.snippet.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Play className="w-12 h-12 text-white" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold line-clamp-2 text-left mb-2">
                {video.snippet.title}
              </h3>
              <p className="text-xs text-gray-400">
                {new Date(video.snippet.publishedAt).toLocaleDateString()}
              </p>
            </div>
          </button>
        ))}
      </div>

      {(hasMore || loading) && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-700 text-white px-8 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 font-semibold disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Videos'
            )}
          </button>
        </div>
      )}
    </div>
  );
}